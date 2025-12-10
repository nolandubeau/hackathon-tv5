/**
 * ARW Inspector Side Panel
 * Displays machine view, token costs, model comparisons, and protocols
 * Enhanced with Cool Midnight theme styling and arw-inspector capabilities
 */

(function() {
  'use strict';

  // Token cost constants (GPT-4 pricing as reference)
  const TOKEN_COST_PER_1K = 0.03; // $0.03 per 1K input tokens
  const CHARS_PER_TOKEN = 4; // Approximate characters per token

  // Models API endpoint
  const MODELS_API_URL = 'https://models.dev/api.json';

  // Dynamic model costs (loaded from API)
  let modelCosts = [];
  let modelsLoading = false;
  let modelsLoaded = false;

  // State
  let currentData = null;
  let activeTabId = 'discovery';
  let retryCount = 0;
  const MAX_RETRIES = 10;
  let lastDataReceivedTime = 0;
  let currentTabId = null;

  // Model filter state
  let activeProviderFilter = 'all';
  let activeCategoryFilter = 'all';

  // Initialize when DOM loads
  document.addEventListener('DOMContentLoaded', async () => {
    setupTabs();
    setupEventListeners();
    setupModelFilters();
    loadModelCosts(); // Load models in background

    // Proactively inject content script immediately on sidepanel open
    await triggerContentScript();

    // Small delay to let content script run, then load data
    setTimeout(async () => {
      await loadInspectionData();
    }, 100);
  });

  /**
   * Load model costs from models.dev API
   */
  async function loadModelCosts() {
    if (modelsLoading || modelsLoaded) return;
    modelsLoading = true;

    try {
      const response = await fetch(MODELS_API_URL);
      if (!response.ok) throw new Error('Failed to fetch models');

      const data = await response.json();
      modelCosts = parseModelsData(data);
      modelsLoaded = true;

      // Update the UI if we have data
      if (currentData) {
        updateModelCostsTab();
        updateProviderFilters();
      }
    } catch (error) {
      console.error('[ARW] Failed to load model costs:', error);
      // Fall back to empty array - table will show "No models available"
      modelCosts = [];
    } finally {
      modelsLoading = false;
    }
  }

  /**
   * Parse models.dev API data into flat array
   */
  function parseModelsData(data) {
    const models = [];
    const providers = Object.values(data);

    for (const provider of providers) {
      if (!provider.models) continue;

      const providerName = provider.name || provider.id || 'Unknown';

      for (const [modelId, model] of Object.entries(provider.models)) {
        // Skip models without pricing
        if (!model.cost?.input && !model.cost?.output) continue;

        const inputCost = model.cost?.input || 0;
        const outputCost = model.cost?.output || 0;
        const context = model.limit?.context || 0;

        // Determine category based on price and capabilities
        let category = 'standard';
        if (inputCost >= 10 || model.reasoning) {
          category = 'premium';
        } else if (inputCost <= 0.5) {
          category = 'fast';
        } else if (inputCost <= 5) {
          category = 'flagship';
        }

        models.push({
          provider: providerName,
          model: model.name || modelId,
          id: modelId,
          inputCost: inputCost,
          outputCost: outputCost,
          context: context,
          category: category,
          reasoning: model.reasoning || false,
          toolCall: model.tool_call || false
        });
      }
    }

    // Sort by provider, then by input cost
    models.sort((a, b) => {
      if (a.provider !== b.provider) {
        return a.provider.localeCompare(b.provider);
      }
      return a.inputCost - b.inputCost;
    });

    return models;
  }

  /**
   * Update provider filter buttons based on loaded models
   */
  function updateProviderFilters() {
    const providerFilters = document.getElementById('provider-filters');
    if (!providerFilters || modelCosts.length === 0) return;

    // Get unique providers
    const providers = [...new Set(modelCosts.map(m => m.provider))].sort();

    // Rebuild filter buttons
    providerFilters.innerHTML = `
      <button class="filter-btn active" data-filter="all">All</button>
      ${providers.slice(0, 8).map(p => `
        <button class="filter-btn" data-filter="${p.toLowerCase()}">${p}</button>
      `).join('')}
    `;

    // Re-attach event listeners
    providerFilters.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        providerFilters.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeProviderFilter = btn.dataset.filter;
        updateModelCostsTab();
      });
    });
  }

  /**
   * Setup tab navigation
   */
  function setupTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const tabId = btn.dataset.tab;
        activeTabId = tabId;

        tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        tabContents.forEach(content => {
          content.classList.remove('active');
          content.style.display = 'none';
        });

        const activeContent = document.getElementById(`${tabId}-tab`);
        if (activeContent) {
          activeContent.classList.add('active');
          activeContent.style.display = 'block';
        }
      });
    });
  }

  /**
   * Switch to a specific tab by ID
   */
  function switchToTab(tabId) {
    const btn = document.querySelector(`.tab-btn[data-tab="${tabId}"]`);
    if (btn) {
      btn.click();
    }
  }

  /**
   * Setup model cost filters
   */
  function setupModelFilters() {
    // Provider filters
    const providerFilters = document.getElementById('provider-filters');
    if (providerFilters) {
      providerFilters.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          providerFilters.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          activeProviderFilter = btn.dataset.filter;
          updateModelCostsTab();
        });
      });
    }

    // Category filters
    const categoryFilters = document.getElementById('category-filters');
    if (categoryFilters) {
      categoryFilters.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          categoryFilters.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          activeCategoryFilter = btn.dataset.category;
          updateModelCostsTab();
        });
      });
    }
  }

  /**
   * Setup event listeners
   */
  function setupEventListeners() {
    // Retry button
    document.getElementById('retry-btn')?.addEventListener('click', loadInspectionData);

    // Copy machine view
    document.getElementById('copy-machine-view')?.addEventListener('click', copyMachineView);

    // Open machine view
    document.getElementById('open-machine-view')?.addEventListener('click', openMachineView);

    // Listen for messages from background script
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.type === 'INSPECTION_UPDATE' && message.data) {
        console.log('[ARW Sidepanel] Received INSPECTION_UPDATE:', {
          tabId: message.data.tabId,
          url: message.data.url,
          arwCompliant: message.data.arwCompliant
        });
        currentData = message.data;
        currentTabId = message.data.tabId;
        retryCount = 0;
        lastDataReceivedTime = Date.now();
        displayResults(currentData);
      }
      sendResponse({ received: true });
    });

    // Listen for tab updates
    chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
      if (changeInfo.status === 'loading' && tab.active) {
        // Reset retry count when starting navigation
        retryCount = 0;
      } else if (changeInfo.status === 'complete' && tab.active) {
        // Wait a bit for content script to run, then load data
        setTimeout(async () => {
          const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
          const timeSinceLastData = Date.now() - lastDataReceivedTime;
          const needsReload = !currentData ||
                             currentData.tabId !== activeTab.id ||
                             currentData.stale ||
                             timeSinceLastData > 2000;

          if (activeTab && needsReload) {
            currentTabId = activeTab.id;
            retryCount = 0; // Reset retry counter for new page
            loadInspectionData();
          }
        }, 300); // Reduced from 500ms to 300ms for faster response
      }
    });

    // Listen for tab activation
    chrome.tabs.onActivated.addListener(async () => {
      const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (activeTab && (!currentData || currentData.tabId !== activeTab.id)) {
        currentTabId = activeTab.id;
        loadInspectionData();
      }
    });
  }

  /**
   * Load inspection data from background script
   */
  async function loadInspectionData() {
    const timeSinceLastData = Date.now() - lastDataReceivedTime;
    if (currentData && timeSinceLastData < 500) {
      return;
    }

    showLoading();

    try {
      const response = await chrome.runtime.sendMessage({
        type: 'GET_INSPECTION_DATA'
      });

      if (response.status === 'success' && response.data) {
        currentData = response.data;
        currentTabId = response.data.tabId;
        retryCount = 0;
        lastDataReceivedTime = Date.now();
        displayResults(currentData);
      } else if (response.status === 'no_data') {
        // No data yet - try to trigger content script and retry
        if (retryCount < MAX_RETRIES) {
          retryCount++;

          // On first retry, try to inject content script
          if (retryCount === 1) {
            await triggerContentScript();
          }

          const delay = Math.min(500 * retryCount, 2000);
          setTimeout(() => loadInspectionData(), delay);
        } else {
          showError('No ARW data found. Try refreshing the page.');
        }
      } else {
        showError(response.message || 'No inspection data available');
      }
    } catch (error) {
      showError(`Failed to load data: ${error.message}`);
    }
  }

  /**
   * Trigger content script to run on active tab
   */
  async function triggerContentScript() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab?.id && tab.url && !tab.url.startsWith('chrome://')) {
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ['src/content/content-script.js']
        });
      }
    } catch (error) {
      // Content script may already be running or page doesn't allow injection
      console.log('Could not inject content script:', error.message);
    }
  }

  /**
   * Display inspection results
   */
  function displayResults(data) {
    hideLoading();

    updateHeader(data);
    updateDiscoveryTab(data);
    updateProtocolsSection(data);
    updateMachineViewTab(data);
    updateContentAnalysis(data);
    updateCostsTab(data);
    updateModelCostsTab();
    updateGEOTab(data);

    switchToTab(activeTabId || 'discovery');
  }

  /**
   * Update header with page info and compliance
   */
  function updateHeader(data) {
    const urlElement = document.getElementById('page-url');
    urlElement.textContent = data.url;

    // Show indicator if data is stale (from previous page)
    if (data.stale) {
      urlElement.style.opacity = '0.6';
      urlElement.title = 'Loading new page data...';
    } else {
      urlElement.style.opacity = '1';
      urlElement.title = data.url;
    }

    // Calculate ARW compliance level
    const arwLevel = calculateARWLevel(data);

    // Update ARW compliance badge
    const badge = document.getElementById('compliance-badge');
    const badgeText = document.getElementById('badge-text');

    badge.classList.remove('badge-unknown', 'badge-compliant', 'badge-non-compliant',
                           'badge-partial', 'badge-minimal', 'badge-full');

    if (arwLevel.score >= 80) {
      badge.classList.add('badge-full');
      badgeText.textContent = 'ARW';
    } else if (arwLevel.score >= 50) {
      badge.classList.add('badge-compliant');
      badgeText.textContent = 'ARW';
    } else if (arwLevel.score >= 20) {
      badge.classList.add('badge-partial');
      badgeText.textContent = 'ARW';
    } else if (arwLevel.score > 0) {
      badge.classList.add('badge-minimal');
      badgeText.textContent = 'ARW';
    } else {
      badge.classList.add('badge-non-compliant');
      badgeText.textContent = 'No ARW';
    }

    // Update GEO score badge
    const geoBadge = document.getElementById('geo-badge');
    const geoBadgeText = document.getElementById('geo-badge-text');

    geoBadge.classList.remove('badge-unknown', 'badge-excellent', 'badge-good', 'badge-average', 'badge-poor');

    if (data.geo?.geoScore !== undefined) {
      const score = data.geo.geoScore;
      geoBadgeText.textContent = `GEO: ${score}`;

      if (score >= 80) {
        geoBadge.classList.add('badge-excellent');
      } else if (score >= 60) {
        geoBadge.classList.add('badge-good');
      } else if (score >= 40) {
        geoBadge.classList.add('badge-average');
      } else {
        geoBadge.classList.add('badge-poor');
      }
    } else {
      geoBadge.classList.add('badge-unknown');
      geoBadgeText.textContent = 'GEO: --';
    }
  }

  /**
   * Calculate ARW compliance level based on discovered components
   */
  function calculateARWLevel(data) {
    let score = 0;
    const components = [];

    // Machine view (35 points - most important)
    if (data.machineViewContent && data.machineViewContent.length > 0) {
      score += 35;
      components.push('machine-view');
    }

    // llms.txt (20 points)
    if (data.discoveries?.llmsTxt?.exists) {
      score += 20;
      components.push('llms.txt');
    }

    // .well-known/arw-manifest.json (15 points)
    if (data.discoveries?.wellKnown?.manifest?.exists) {
      score += 15;
      components.push('manifest');
    }

    // MCP servers (15 points - AI agent integration)
    if (data.mcp?.servers?.length > 0) {
      score += 15;
      components.push('mcp');
    }

    // ARW meta tags (10 points)
    if (data.discoveries?.metaTags?.length > 0) {
      score += 10;
      components.push('meta-tags');
    }

    // robots.txt with ARW hints (5 points)
    if (data.discoveries?.robotsTxt?.exists && data.discoveries?.robotsTxt?.hasArwHints) {
      score += 5;
      components.push('robots.txt');
    }

    return { score: Math.min(score, 100), components };
  }

  /**
   * Update Machine View tab
   */
  function updateMachineViewTab(data) {
    const statusIcon = document.getElementById('mv-status-icon');
    const statusText = document.getElementById('mv-status-text');
    const content = document.getElementById('machine-view-content');

    const machineViewContent = data.machineViewContent;
    const isValidContent = machineViewContent &&
                           !isHTMLContent(machineViewContent) &&
                           machineViewContent.length > 0;

    if (isValidContent) {
      statusIcon.textContent = '+';
      statusIcon.style.color = 'var(--success)';
      const mv = data.discoveries?.machineViews?.[0];
      statusText.textContent = mv?.url ? `Found: ${mv.url}` : 'Machine view available';
      content.textContent = machineViewContent;
      content.classList.remove('placeholder');
    } else if (data.discoveries?.machineViews?.length > 0) {
      const mv = data.discoveries.machineViews[0];
      statusIcon.textContent = '!';
      statusIcon.style.color = 'var(--warning)';
      statusText.textContent = `URL: ${mv.url} (content may be invalid)`;
      content.innerHTML = `<p class="placeholder">Machine view found but content appears to be HTML, not markdown.</p>`;
    } else {
      statusIcon.textContent = '-';
      statusIcon.style.color = 'var(--error)';
      statusText.textContent = 'No machine view found';
      content.innerHTML = `<p class="placeholder">No machine view (.llm.md) available for this page.</p>`;
    }
  }

  /**
   * Update Content Analysis section (NEW)
   */
  function updateContentAnalysis(data) {
    const content = data.machineViewContent || '';

    // Word count
    const words = content.trim().split(/\s+/).filter(w => w.length > 0);
    document.getElementById('word-count').textContent = formatNumber(words.length);

    // Character count
    document.getElementById('char-count').textContent = formatNumber(content.length);

    // Chunk count (look for <!-- chunk: --> markers)
    const chunkMatches = content.match(/<!--\s*chunk:\s*[\w-]+\s*-->/gi);
    const chunkCount = chunkMatches ? chunkMatches.length : 0;
    document.getElementById('chunk-count').textContent = chunkCount;

    // Heading count
    const headingMatches = content.match(/^#{1,6}\s+.+$/gm);
    const headingCount = headingMatches ? headingMatches.length : 0;
    document.getElementById('heading-count').textContent = headingCount;

    // Extract entities from GEO analysis
    const entityContainer = document.getElementById('entity-container');
    const entityTags = document.getElementById('entity-tags');

    if (data.geo?.metrics?.entities?.totalEntities > 0) {
      entityContainer.style.display = 'block';
      const entities = [];

      // Extract entities from GEO data
      if (data.geo.metrics.entities.properNouns) {
        data.geo.metrics.entities.properNouns.slice(0, 8).forEach(e => {
          entities.push({ name: e, type: 'entity' });
        });
      }

      entityTags.innerHTML = entities.map(e =>
        `<span class="entity-tag ${e.type}">${e.name}</span>`
      ).join('');
    } else {
      entityContainer.style.display = 'none';
    }
  }

  /**
   * Check if content looks like HTML
   */
  function isHTMLContent(content) {
    if (!content) return false;
    const trimmed = content.trim().toLowerCase();
    return trimmed.startsWith('<!doctype') ||
           trimmed.startsWith('<html') ||
           trimmed.startsWith('<head') ||
           trimmed.startsWith('<body') ||
           (trimmed.includes('<html') && trimmed.includes('</html>')) ||
           (trimmed.includes('<div') && trimmed.includes('</div>'));
  }

  /**
   * Update Costs tab (combined token + model costs)
   */
  function updateCostsTab(data) {
    const htmlSize = data.pageSize || 0;
    const mvSize = data.machineViewContent?.length || data.machineViewSize || 0;

    const htmlTokens = Math.ceil(htmlSize / CHARS_PER_TOKEN);
    const mvTokens = Math.ceil(mvSize / CHARS_PER_TOKEN);

    const htmlCost = (htmlTokens / 1000) * TOKEN_COST_PER_1K;
    const mvCost = (mvTokens / 1000) * TOKEN_COST_PER_1K;

    document.getElementById('html-size').textContent = formatBytes(htmlSize);
    document.getElementById('html-tokens').textContent = formatNumber(htmlTokens);

    document.getElementById('mv-size').textContent = mvSize > 0 ? formatBytes(mvSize) : 'N/A';
    document.getElementById('mv-tokens').textContent = mvSize > 0 ? formatNumber(mvTokens) : 'N/A';

    if (mvSize > 0 && htmlSize > 0) {
      const sizeReduction = Math.round((1 - mvSize / htmlSize) * 100);
      const tokenReduction = Math.round((1 - mvTokens / htmlTokens) * 100);
      const costSavings = htmlCost - mvCost;

      document.getElementById('size-reduction').textContent = `${sizeReduction}%`;
      document.getElementById('token-reduction').textContent = `${tokenReduction}%`;
      document.getElementById('cost-savings').textContent = formatCurrency(costSavings);

      document.getElementById('savings-summary').style.display = 'block';
    } else {
      document.getElementById('savings-summary').style.display = 'none';
    }
  }

  /**
   * Update Model Costs tab (loads from models.dev API)
   */
  function updateModelCostsTab() {
    const tbody = document.getElementById('model-cost-tbody');
    if (!tbody) return;

    // Show loading state if models not yet loaded
    if (modelsLoading) {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: var(--text-secondary); padding: 20px;">Loading models...</td></tr>';
      return;
    }

    if (modelCosts.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: var(--text-secondary); padding: 20px;">No models available</td></tr>';
      return;
    }

    const htmlSize = currentData?.pageSize || 0;
    const mvSize = currentData?.machineViewContent?.length || currentData?.machineViewSize || 0;

    const htmlTokens = Math.ceil(htmlSize / CHARS_PER_TOKEN);
    const mvTokens = Math.ceil(mvSize / CHARS_PER_TOKEN);

    // Filter models
    let filteredModels = modelCosts.filter(model => {
      const providerMatch = activeProviderFilter === 'all' ||
                            model.provider.toLowerCase().includes(activeProviderFilter);
      const categoryMatch = activeCategoryFilter === 'all' ||
                            model.category === activeCategoryFilter;
      return providerMatch && categoryMatch;
    });

    // Sort by savings (highest first)
    filteredModels.sort((a, b) => {
      const aSavings = calculateCost(htmlTokens, a.inputCost) - calculateCost(mvTokens, a.inputCost);
      const bSavings = calculateCost(htmlTokens, b.inputCost) - calculateCost(mvTokens, b.inputCost);
      return bSavings - aSavings;
    });

    // Limit to top 50 for performance
    const displayModels = filteredModels.slice(0, 50);

    // Build table rows
    tbody.innerHTML = displayModels.map(model => {
      const htmlCost = calculateCost(htmlTokens, model.inputCost);
      const mvCost = calculateCost(mvTokens, model.inputCost);
      const savings = htmlCost - mvCost;
      const savingsPercent = htmlCost > 0 ? Math.round((savings / htmlCost) * 100) : 0;

      const providerClass = model.provider.toLowerCase().replace(/\s+/g, '').replace(/[^a-z]/g, '');

      return `
        <tr>
          <td>
            <div class="provider">
              <span class="provider-dot ${providerClass}"></span>
              ${model.provider}
            </div>
          </td>
          <td>${model.model}</td>
          <td><span class="category-badge ${model.category}">${model.category}</span></td>
          <td class="cost">${formatCurrency(htmlCost)}</td>
          <td class="cost">${mvSize > 0 ? formatCurrency(mvCost) : 'N/A'}</td>
          <td class="savings">${mvSize > 0 ? `${savingsPercent}%` : '--'}</td>
        </tr>
      `;
    }).join('');

    // Show count if filtered
    if (filteredModels.length > 50) {
      tbody.innerHTML += `<tr><td colspan="6" style="text-align: center; color: var(--text-secondary); padding: 8px; font-size: 11px;">Showing 50 of ${filteredModels.length} models</td></tr>`;
    }

    // Update best value recommendations
    updateBestValueModels(filteredModels, htmlTokens, mvTokens);
  }

  /**
   * Update best value models section
   */
  function updateBestValueModels(models, htmlTokens, mvTokens) {
    const container = document.getElementById('best-value-models');
    if (!container) return;

    if (!currentData?.machineViewContent) {
      container.innerHTML = 'Machine view required to see savings';
      return;
    }

    if (models.length === 0) {
      container.innerHTML = 'No models available';
      return;
    }

    // Find best value in each category
    const categories = ['fast', 'flagship', 'standard', 'premium'];
    const recommendations = [];

    categories.forEach(cat => {
      const catModels = models.filter(m => m.category === cat);
      if (catModels.length > 0) {
        const best = catModels.reduce((a, b) => {
          const aSavings = calculateCost(htmlTokens, a.inputCost) - calculateCost(mvTokens, a.inputCost);
          const bSavings = calculateCost(htmlTokens, b.inputCost) - calculateCost(mvTokens, b.inputCost);
          return aSavings > bSavings ? a : b;
        });
        const savings = calculateCost(htmlTokens, best.inputCost) - calculateCost(mvTokens, best.inputCost);
        if (savings > 0) {
          recommendations.push({
            category: cat,
            model: best.model,
            provider: best.provider,
            savings: savings
          });
        }
      }
    });

    if (recommendations.length === 0) {
      container.innerHTML = 'No savings available with current content';
      return;
    }

    container.innerHTML = recommendations.map(r => `
      <div style="display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid var(--border-subtle);">
        <span><strong>${r.category}:</strong> ${r.provider} ${r.model}</span>
        <span style="color: var(--success); font-weight: 600;">${formatCurrency(r.savings)}/req</span>
      </div>
    `).join('');
  }

  /**
   * Calculate cost for tokens
   */
  function calculateCost(tokens, costPerMToken) {
    return (tokens / 1000000) * costPerMToken;
  }

  /**
   * Update Protocols section - grouped by protocol type
   */
  function updateProtocolsSection(data) {
    const protocolsContainer = document.getElementById('protocols-container');

    // Get protocols from data or build from legacy data
    let protocols = data.protocols || [];

    // If no protocols array, try to build from legacy data
    if (protocols.length === 0) {
      // Check for REST actions
      if (data.actions && data.actions.length > 0) {
        protocols.push({
          name: 'REST API',
          type: 'rest',
          endpoint: '/api',
          actions: data.actions
        });
      }
      // Check for MCP servers
      if (data.mcp?.servers?.length > 0) {
        protocols.push({
          name: 'MCP Server',
          type: 'mcp',
          tools: data.mcp.servers.flatMap(s => s.tools || []),
          resources: data.mcp.servers.flatMap(s => s.resources || []),
          transports: data.mcp.servers.flatMap(s => s.transport ? [{ type: s.transport }] : [])
        });
      }
    }

    if (protocols.length === 0) {
      protocolsContainer.innerHTML = '<p class="placeholder">No protocols detected</p>';
    } else {
      protocolsContainer.innerHTML = protocols.map(protocol => renderProtocol(protocol, data)).join('');
    }

    // Update AI headers
    const headersList = document.getElementById('ai-headers-list');
    if (data.aiHeaders && data.aiHeaders.length > 0) {
      headersList.innerHTML = data.aiHeaders.map(header => `
        <div class="protocol-item">
          <span class="protocol-name">${header.name}</span>
          <span class="protocol-value">${header.value}</span>
        </div>
      `).join('');
    } else {
      headersList.innerHTML = '<p class="placeholder">No AI headers detected</p>';
    }

    // Update permissions from policies or headers
    updatePermission('training', data.permissions?.training);
    updatePermission('inference', data.permissions?.inference);
    updatePermission('attribution', data.permissions?.attribution);
    updatePermission('ratelimit', data.permissions?.rateLimit);

    // Show policies source if available
    const policiesSource = document.getElementById('policies-source');
    if (data.policies) {
      policiesSource.style.display = 'block';
      policiesSource.innerHTML = `<span class="source-badge">Source: arw-policies.json</span>`;
    } else if (data.aiHeaders?.length > 0) {
      policiesSource.style.display = 'block';
      policiesSource.innerHTML = `<span class="source-badge">Source: HTTP Headers</span>`;
    } else {
      policiesSource.style.display = 'none';
    }

    // Update auth section
    const authSection = document.getElementById('auth-section');
    if (data.auth) {
      authSection.innerHTML = `
        <div class="auth-item">
          <span class="permission-label">Type</span>
          <span class="permission-value">${data.auth.type || 'Unknown'}</span>
        </div>
        ${data.auth.endpoint ? `
          <div class="auth-item">
            <span class="permission-label">Endpoint</span>
            <span class="permission-value">${data.auth.endpoint}</span>
          </div>
        ` : ''}
        ${data.auth.scopes ? `
          <div class="auth-item">
            <span class="permission-label">Scopes</span>
            <span class="permission-value">${data.auth.scopes.join(', ')}</span>
          </div>
        ` : ''}
      `;
    } else {
      authSection.innerHTML = '<p class="placeholder">No authentication configured</p>';
    }
  }

  /**
   * Render a single protocol card
   */
  function renderProtocol(protocol, data) {
    const type = (protocol.type || 'unknown').toLowerCase();
    const typeBadgeClass = type === 'mcp' ? 'protocol-type-mcp' : type === 'rest' ? 'protocol-type-rest' : 'protocol-type-other';

    let content = `
      <div class="protocol-card protocol-card-${type}">
        <div class="protocol-card-header">
          <span class="protocol-card-name">${protocol.name}</span>
          <span class="protocol-type-badge ${typeBadgeClass}">${type.toUpperCase()}</span>
        </div>
    `;

    if (protocol.description) {
      content += `<div class="protocol-card-desc">${protocol.description}</div>`;
    }

    if (protocol.endpoint) {
      content += `<div class="protocol-card-endpoint"><code>${protocol.endpoint}</code></div>`;
    }

    if (protocol.version) {
      content += `<div class="protocol-card-version">Version: ${protocol.version}</div>`;
    }

    // REST-specific: actions
    if (type === 'rest') {
      const actions = protocol.actions || data.actions || [];
      if (actions.length > 0) {
        content += `
          <div class="protocol-section">
            <div class="protocol-section-title">Actions (${actions.length})</div>
            <div class="mcp-tools-list">
              ${actions.map(action => `
                <div class="mcp-tool-item">
                  <div class="mcp-tool-header">
                    <span class="mcp-tool-name">${action.name || action.id}</span>
                    ${action.auth && action.auth !== 'none' ? `<span class="mcp-auth-badge">${action.auth}</span>` : ''}
                  </div>
                  ${action.description ? `<span class="mcp-tool-desc">${action.description}</span>` : ''}
                  ${action.endpoint ? `<span class="mcp-tool-desc" style="color: var(--accent-cyan); font-family: monospace;">${action.method || 'GET'} ${action.endpoint}</span>` : ''}
                </div>
              `).join('')}
            </div>
          </div>
        `;
      }
    }

    // MCP-specific: transports, tools, resources, prompts
    if (type === 'mcp') {
      // Transports
      if (protocol.transports && protocol.transports.length > 0) {
        content += `
          <div class="protocol-section">
            <div class="protocol-section-title">Transports</div>
            <div class="transport-badges">
              ${protocol.transports.map(t => `
                <span class="mcp-transport-badge ${t.type}">${t.type}</span>
              `).join('')}
            </div>
          </div>
        `;
      }

      // Tools
      if (protocol.tools && protocol.tools.length > 0) {
        content += `
          <div class="protocol-section">
            <div class="protocol-section-title">Tools (${protocol.tools.length})</div>
            <div class="mcp-tools-list">
              ${protocol.tools.map(tool => `
                <div class="mcp-tool-item">
                  <div class="mcp-tool-header">
                    <span class="mcp-tool-name">${tool.name}</span>
                    ${tool.auth && tool.auth !== 'none' ? `<span class="mcp-auth-badge">${tool.auth}</span>` : ''}
                  </div>
                  ${tool.description ? `<span class="mcp-tool-desc">${tool.description}</span>` : ''}
                </div>
              `).join('')}
            </div>
          </div>
        `;
      }

      // Resources
      if (protocol.resources && protocol.resources.length > 0) {
        content += `
          <div class="protocol-section">
            <div class="protocol-section-title">Resources (${protocol.resources.length})</div>
            <div class="mcp-resources-list">
              ${protocol.resources.map(res => `
                <code class="mcp-resource-uri">${res.uri || res.name || res}</code>
              `).join('')}
            </div>
          </div>
        `;
      }

      // Prompts
      if (protocol.prompts && protocol.prompts.length > 0) {
        content += `
          <div class="protocol-section">
            <div class="protocol-section-title">Prompts (${protocol.prompts.length})</div>
            <div class="mcp-prompts-list">
              ${protocol.prompts.map(prompt => `
                <div class="mcp-prompt-item">
                  <span class="mcp-prompt-name">${prompt.name}</span>
                  ${prompt.description ? `<span class="mcp-prompt-desc">${prompt.description}</span>` : ''}
                </div>
              `).join('')}
            </div>
          </div>
        `;
      }
    }

    content += '</div>';
    return content;
  }

  /**
   * Update individual permission display
   */
  function updatePermission(type, value) {
    const icon = document.getElementById(`${type}-icon`);
    const valueEl = document.getElementById(`${type}-value`);

    if (value === true || value === 'allowed') {
      icon.textContent = '+';
      icon.style.color = 'var(--success)';
      valueEl.textContent = 'Allowed';
      valueEl.style.color = 'var(--success)';
    } else if (value === false || value === 'disallowed') {
      icon.textContent = '-';
      icon.style.color = 'var(--error)';
      valueEl.textContent = 'Disallowed';
      valueEl.style.color = 'var(--error)';
    } else if (value === 'required') {
      icon.textContent = '!';
      icon.style.color = 'var(--warning)';
      valueEl.textContent = 'Required';
      valueEl.style.color = 'var(--warning)';
    } else if (value) {
      icon.textContent = 'i';
      icon.style.color = 'var(--text-secondary)';
      valueEl.textContent = value;
      valueEl.style.color = 'var(--text-secondary)';
    } else {
      icon.textContent = '-';
      icon.style.color = 'var(--text-secondary)';
      valueEl.textContent = 'Unknown';
      valueEl.style.color = 'var(--text-secondary)';
    }
  }

  /**
   * Update Discovery tab
   */
  function updateDiscoveryTab(data) {
    updateDiscoveryItem('llms', data.discoveries?.llmsTxt);

    const wellKnownFound = data.discoveries?.wellKnown?.manifest?.exists;
    updateDiscoveryItem('wellknown', {
      exists: wellKnownFound,
      url: data.discoveries?.wellKnown?.manifest?.url
    });

    updateDiscoveryItem('robots', data.discoveries?.robotsTxt);

    // ARW Policies detection
    updateDiscoveryItem('policies', {
      exists: data.policies !== undefined && data.policies !== null,
      data: data.policies
    });

    if (data.discoveries?.wellKnown?.manifest?.data?.content) {
      const contentStructure = document.getElementById('content-structure');
      const contentTree = document.getElementById('content-tree');

      contentStructure.style.display = 'block';
      contentTree.textContent = JSON.stringify(
        data.discoveries.wellKnown.manifest.data.content,
        null,
        2
      );
    }
  }

  /**
   * Update individual discovery item
   */
  function updateDiscoveryItem(id, data) {
    const icon = document.getElementById(`${id}-icon`);
    const status = document.getElementById(`${id}-status`);
    const details = document.getElementById(`${id}-details`);

    if (data?.exists) {
      icon.textContent = '+';
      icon.style.color = 'var(--success)';
      status.textContent = data.count ? `${data.count} Found` : 'Found';
      status.classList.add('found');
      status.classList.remove('not-found');

      let detailsHtml = '';
      if (data.url) {
        detailsHtml += `<strong>URL:</strong> <a href="${data.url}" target="_blank">${data.url}</a><br>`;
      }
      if (data.urls) {
        detailsHtml += data.urls.map(url =>
          `<a href="${url}" target="_blank">${url}</a>`
        ).join('<br>');
      }
      if (data.size) {
        detailsHtml += `<strong>Size:</strong> ${formatBytes(data.size)}<br>`;
      }
      if (data.hasArwHints !== undefined) {
        detailsHtml += `<strong>ARW Hints:</strong> ${data.hasArwHints ? 'Yes' : 'No'}<br>`;
      }
      if (data.tags) {
        detailsHtml += data.tags.map(tag =>
          `<code>&lt;${tag.tag} ${tag.name}="${tag.content}"&gt;</code>`
        ).join('<br>');
      }

      // Policies-specific details
      if (data.data && id === 'policies') {
        const policies = data.data;
        if (policies.aiTraining !== undefined) {
          detailsHtml += `<strong>AI Training:</strong> ${policies.aiTraining ? 'Allowed' : 'Disallowed'}<br>`;
        }
        if (policies.aiInference !== undefined) {
          detailsHtml += `<strong>AI Inference:</strong> ${policies.aiInference ? 'Allowed' : 'Disallowed'}<br>`;
        }
        if (policies.attribution) {
          detailsHtml += `<strong>Attribution:</strong> ${policies.attribution}<br>`;
        }
      }

      details.innerHTML = detailsHtml || '';
      details.style.display = detailsHtml ? 'block' : 'none';
    } else {
      icon.textContent = '-';
      icon.style.color = 'var(--text-secondary)';
      status.textContent = 'Not Found';
      status.classList.add('not-found');
      status.classList.remove('found');

      if (data?.error) {
        details.innerHTML = `<span style="color: var(--error);">Error: ${data.error}</span>`;
        details.style.display = 'block';
      } else {
        details.style.display = 'none';
      }
    }
  }

  /**
   * Copy machine view content to clipboard
   */
  async function copyMachineView() {
    const content = document.getElementById('machine-view-content').textContent;
    if (content && !content.includes('No machine view')) {
      await navigator.clipboard.writeText(content);
      const btn = document.getElementById('copy-machine-view');
      btn.textContent = 'Copied!';
      setTimeout(() => btn.textContent = 'Copy', 2000);
    }
  }

  /**
   * Open machine view in new tab
   */
  function openMachineView() {
    if (currentData?.discoveries?.machineViews?.[0]?.url) {
      chrome.tabs.create({ url: currentData.discoveries.machineViews[0].url });
    }
  }

  /**
   * Show loading state
   */
  function showLoading() {
    document.getElementById('loading-state').style.display = 'flex';
    document.getElementById('error-state').style.display = 'none';
    document.querySelectorAll('.tab-content').forEach(el => el.style.display = 'none');
  }

  /**
   * Hide loading state
   */
  function hideLoading() {
    document.getElementById('loading-state').style.display = 'none';
  }

  /**
   * Show error state
   */
  function showError(message) {
    document.getElementById('loading-state').style.display = 'none';
    document.getElementById('error-state').style.display = 'flex';
    document.getElementById('error-message').textContent = message;
    document.querySelectorAll('.tab-content').forEach(el => el.style.display = 'none');
  }

  /**
   * Format bytes to human readable
   */
  function formatBytes(bytes) {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * Format number with commas
   */
  function formatNumber(num) {
    return num.toLocaleString();
  }

  /**
   * Format currency
   */
  function formatCurrency(amount) {
    if (amount < 0.01) {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 4,
        maximumFractionDigits: 6
      }).format(amount);
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 4
    }).format(amount);
  }

  /**
   * Update GEO tab with analysis results
   */
  function updateGEOTab(data) {
    const scoreValue = document.getElementById('geo-score-value');
    const scoreRing = document.getElementById('geo-score-ring');
    const geoStatus = document.getElementById('geo-status');

    const authorityEl = document.getElementById('geo-authority');
    const evidenceEl = document.getElementById('geo-evidence');
    const semanticEl = document.getElementById('geo-semantic');
    const arwReadinessEl = document.getElementById('geo-arw-readiness');

    const extLinksEl = document.getElementById('geo-ext-links');
    const extDomainsEl = document.getElementById('geo-ext-domains');
    const statisticsEl = document.getElementById('geo-statistics');
    const quotationsEl = document.getElementById('geo-quotations');
    const entitiesEl = document.getElementById('geo-entities');
    const wordCountEl = document.getElementById('geo-word-count');

    if (data.geo && data.geo.geoScore !== undefined) {
      const score = data.geo.geoScore;
      scoreValue.textContent = score;
      animateScoreRing(scoreRing, score);

      if (data.geo.subscores) {
        authorityEl.textContent = data.geo.subscores.authority || 0;
        evidenceEl.textContent = data.geo.subscores.evidence || 0;
        semanticEl.textContent = data.geo.subscores.semanticClarity || 0;
        arwReadinessEl.textContent = data.geo.subscores.arwReadiness || 0;
      }

      if (data.geo.metrics) {
        extLinksEl.textContent = data.geo.metrics.citations?.externalLinks || 0;
        extDomainsEl.textContent = data.geo.metrics.citations?.externalDomains?.length || 0;
        statisticsEl.textContent = data.geo.metrics.statistics?.total || 0;

        const quotesTotal = (data.geo.metrics.quotations?.blockquoteCount || 0) +
                           (data.geo.metrics.quotations?.inlineQuoteCount || 0);
        quotationsEl.textContent = quotesTotal;

        entitiesEl.textContent = data.geo.metrics.entities?.totalEntities || 0;
        wordCountEl.textContent = formatNumber(data.geo.metrics.structure?.wordCount || 0);
      }

      geoStatus.textContent = 'Analysis complete';
    } else {
      scoreValue.textContent = '--';
      scoreRing.style.strokeDashoffset = '502';

      authorityEl.textContent = '--';
      evidenceEl.textContent = '--';
      semanticEl.textContent = '--';
      arwReadinessEl.textContent = '--';

      extLinksEl.textContent = '--';
      extDomainsEl.textContent = '--';
      statisticsEl.textContent = '--';
      quotationsEl.textContent = '--';
      entitiesEl.textContent = '--';
      wordCountEl.textContent = '--';

      geoStatus.textContent = 'Analyzing...';
    }
  }

  /**
   * Animate the GEO score ring
   */
  function animateScoreRing(ringElement, score) {
    if (!ringElement) return;

    // Circle circumference = 2 * PI * radius (80) = 502
    const circumference = 502;
    const progress = (score / 100) * circumference;
    const offset = circumference - progress;

    ringElement.style.strokeDashoffset = offset;

    ringElement.classList.remove('score-excellent', 'score-good', 'score-average', 'score-poor');
    if (score >= 80) {
      ringElement.classList.add('score-excellent');
    } else if (score >= 60) {
      ringElement.classList.add('score-good');
    } else if (score >= 40) {
      ringElement.classList.add('score-average');
    } else {
      ringElement.classList.add('score-poor');
    }
  }

})();
