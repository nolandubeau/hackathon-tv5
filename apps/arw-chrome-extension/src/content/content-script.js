/**
 * ARW Content Script
 * Runs on every page load to inspect for Agent-Ready Web features
 * Collects page size, machine view content, and protocol information
 */

(function() {
  'use strict';

  // Prevent multiple executions
  if (window.__arwInspectorLoaded) return;
  window.__arwInspectorLoaded = true;

  const currentOrigin = window.location.origin;
  const currentUrl = window.location.href;

  /**
   * Main inspection function
   */
  async function inspectPage() {
    const results = {
      url: currentUrl,
      origin: currentOrigin,
      timestamp: new Date().toISOString(),
      arwCompliant: false,
      pageSize: document.documentElement.outerHTML.length,
      machineViewSize: 0,
      machineViewContent: null,
      discoveries: {
        llmsTxt: null,
        machineViews: [],
        wellKnown: {},
        robotsTxt: null,
        sitemapXml: null,
        metaTags: [],
        mcp: null  // MCP Protocol discovery
      },
      aiHeaders: [],
      permissions: {
        training: null,
        inference: null,
        attribution: null,
        rateLimit: null
      },
      policies: null,  // From arw-policies.json
      protocols: [],   // All protocols (REST, MCP, etc.) from manifest
      actions: [],
      auth: null,
      mcp: null,  // MCP servers configuration
      errors: []
    };

    try {
      // Run all checks in parallel for speed
      const [
        llmsTxt,
        wellKnown,
        robotsTxt,
        machineViewResult,
        mcpDiscovery
      ] = await Promise.all([
        checkLlmsTxt(),
        checkWellKnownFiles(),
        checkRobotsTxt(),
        checkForMachineView(),
        checkMcpServers()
      ]);

      results.discoveries.llmsTxt = llmsTxt;
      results.discoveries.wellKnown = wellKnown;
      results.discoveries.robotsTxt = robotsTxt;
      results.discoveries.mcp = mcpDiscovery;

      // Extract MCP configuration from discovered sources
      results.mcp = extractMcpConfig(llmsTxt, wellKnown, mcpDiscovery);

      // Handle machine view - now includes content
      if (machineViewResult && machineViewResult.exists) {
        results.discoveries.machineViews.push({
          exists: true,
          url: machineViewResult.url,
          currentPage: currentUrl,
          source: machineViewResult.source
        });
        results.machineViewContent = machineViewResult.content;
        results.machineViewSize = machineViewResult.content?.length || 0;
      }

      // Scan for meta tags
      results.discoveries.metaTags = scanMetaTags();

      // Extract protocols from manifest (REST, MCP, etc.)
      if (wellKnown.manifest?.data?.protocols) {
        results.protocols = parseProtocols(wellKnown.manifest.data.protocols, llmsTxt);
      }

      // Extract actions from manifest
      if (wellKnown.manifest?.data?.actions) {
        results.actions = wellKnown.manifest.data.actions.map(action => ({
          ...action,
          protocol: 'rest' // Default to REST for manifest actions
        }));
      }

      // Extract auth info from manifest
      if (wellKnown.manifest?.data?.auth) {
        results.auth = wellKnown.manifest.data.auth;
      }

      // Extract policies from arw-policies.json or manifest
      if (wellKnown.policies?.exists && wellKnown.policies.data) {
        results.policies = wellKnown.policies.data;
        // Parse nested policy structure
        const policies = wellKnown.policies.data;

        // Training policy (can be boolean or object with .allowed)
        if (policies.training !== undefined) {
          if (typeof policies.training === 'boolean') {
            results.permissions.training = policies.training ? 'allowed' : 'disallowed';
          } else if (typeof policies.training === 'object') {
            results.permissions.training = policies.training.allowed ? 'allowed' : 'disallowed';
          }
        }

        // Inference policy
        if (policies.inference !== undefined) {
          if (typeof policies.inference === 'boolean') {
            results.permissions.inference = policies.inference ? 'allowed' : 'disallowed';
          } else if (typeof policies.inference === 'object') {
            results.permissions.inference = policies.inference.allowed ? 'allowed' : 'disallowed';
          }
        }

        // Attribution policy
        if (policies.attribution !== undefined) {
          if (typeof policies.attribution === 'boolean') {
            results.permissions.attribution = policies.attribution ? 'required' : 'not required';
          } else if (typeof policies.attribution === 'object') {
            results.permissions.attribution = policies.attribution.required ? 'required' : 'not required';
          } else if (typeof policies.attribution === 'string') {
            results.permissions.attribution = policies.attribution;
          }
        }

        // Rate limit policy
        if (policies.rate_limit !== undefined || policies.rateLimit !== undefined) {
          const rateLimit = policies.rate_limit || policies.rateLimit;
          if (typeof rateLimit === 'string') {
            results.permissions.rateLimit = rateLimit;
          } else if (typeof rateLimit === 'object') {
            results.permissions.rateLimit = rateLimit.limit || rateLimit.value || JSON.stringify(rateLimit);
          }
        }
      }

      // Check for AI headers in machine view
      if (machineViewResult?.url) {
        const headers = await checkAIHeaders(machineViewResult.url);
        results.aiHeaders = headers.headers;
        results.permissions = headers.permissions;
      }

      // Determine ARW compliance
      results.arwCompliant = !!(
        results.discoveries.llmsTxt?.exists ||
        results.discoveries.wellKnown.manifest?.exists ||
        results.discoveries.machineViews.length > 0 ||
        results.mcp?.servers?.length > 0
      );

    } catch (error) {
      results.errors.push({
        message: error.message,
        stack: error.stack
      });
    }

    return results;
  }

  /**
   * Check for MCP (Model Context Protocol) servers
   * Checks .well-known/mcp.json and parses from llms.txt/manifest
   */
  async function checkMcpServers() {
    const result = {
      exists: false,
      sources: [],
      servers: []
    };

    try {
      // Check for dedicated MCP discovery file
      const mcpUrl = `${currentOrigin}/.well-known/mcp.json`;
      const response = await fetch(mcpUrl, {
        method: 'GET',
        mode: 'cors',
        cache: 'no-cache'
      });

      if (response.ok) {
        const text = await response.text();
        try {
          const data = JSON.parse(text);
          result.exists = true;
          result.sources.push('well-known');
          result.url = mcpUrl;

          if (data.servers && Array.isArray(data.servers)) {
            result.servers = data.servers.map(server => ({
              name: server.name,
              description: server.description,
              endpoint: server.endpoint,
              transport: server.transport || 'http',
              auth: server.auth || 'none',
              tools: server.tools || [],
              resources: server.resources || [],
              source: 'well-known'
            }));
          }
        } catch (e) {
          // Invalid JSON
        }
      }
    } catch (error) {
      // Failed to fetch MCP file
    }

    return result;
  }

  /**
   * Extract MCP configuration from various discovery sources
   */
  function extractMcpConfig(llmsTxt, wellKnown, mcpDiscovery) {
    const mcp = {
      version: null,
      servers: [],
      totalTools: 0,
      totalResources: 0
    };

    // Add servers from dedicated MCP discovery
    if (mcpDiscovery?.servers?.length > 0) {
      mcp.servers.push(...mcpDiscovery.servers);
    }

    // Parse MCP from llms.txt content (YAML format)
    if (llmsTxt?.exists && llmsTxt?.preview) {
      const mcpMatch = llmsTxt.preview.match(/mcp:\s*\n([\s\S]*?)(?=\n\w|$)/);
      if (mcpMatch) {
        // Simple YAML parsing for MCP section
        const mcpServers = parseMcpFromYaml(llmsTxt.preview);
        if (mcpServers.length > 0) {
          mcpServers.forEach(s => s.source = 'llms.txt');
          mcp.servers.push(...mcpServers);
        }
      }
    }

    // Parse MCP from arw-manifest.json
    if (wellKnown?.manifest?.exists && wellKnown.manifest.data?.mcp) {
      const manifestMcp = wellKnown.manifest.data.mcp;
      if (manifestMcp.servers && Array.isArray(manifestMcp.servers)) {
        manifestMcp.servers.forEach(server => {
          mcp.servers.push({
            name: server.name,
            description: server.description,
            endpoint: server.endpoint,
            transport: server.transport || 'http',
            auth: server.auth || 'none',
            scopes: server.scopes || [],
            tools: server.tools || [],
            resources: server.resources || [],
            source: 'arw-manifest'
          });
        });
      }
      if (manifestMcp.version) {
        mcp.version = manifestMcp.version;
      }
    }

    // Calculate totals
    mcp.totalTools = mcp.servers.reduce((sum, s) => sum + (s.tools?.length || 0), 0);
    mcp.totalResources = mcp.servers.reduce((sum, s) => sum + (s.resources?.length || 0), 0);

    return mcp.servers.length > 0 ? mcp : null;
  }

  /**
   * Parse protocols array from arw-manifest.json
   * Returns structured protocol information for both REST and MCP
   */
  function parseProtocols(protocolsArray, llmsTxt) {
    const protocols = [];

    if (!Array.isArray(protocolsArray)) return protocols;

    for (const proto of protocolsArray) {
      const protocolType = (proto.type || '').toLowerCase();

      const protocol = {
        name: proto.name || 'Unknown Protocol',
        type: protocolType,
        endpoint: proto.endpoint || null,
        version: proto.version || null,
        description: proto.description || null
      };

      if (protocolType === 'rest') {
        // REST API protocol
        protocol.actions = []; // Actions are in manifest.actions, linked by protocol
      } else if (protocolType === 'mcp') {
        // MCP Protocol
        protocol.transports = proto.transports || [];
        protocol.tools = (proto.tools || []).map(tool => ({
          name: tool.name || tool.id,
          description: tool.description || '',
          auth: tool.auth || 'none',
          scopes: tool.scopes || []
        }));
        protocol.resources = proto.resources || [];
        protocol.prompts = proto.prompts || [];
      }

      protocols.push(protocol);
    }

    // Also parse protocols from llms.txt if available
    if (llmsTxt?.exists && llmsTxt?.preview) {
      const llmsProtocols = parseProtocolsFromLlmsTxt(llmsTxt.preview);
      // Merge llms.txt protocols (avoid duplicates by type)
      for (const lp of llmsProtocols) {
        const existing = protocols.find(p => p.type === lp.type);
        if (!existing) {
          lp.source = 'llms.txt';
          protocols.push(lp);
        } else {
          // Merge tools/resources if MCP
          if (lp.type === 'mcp' && lp.tools) {
            existing.tools = [...(existing.tools || []), ...lp.tools];
          }
        }
      }
    }

    return protocols;
  }

  /**
   * Parse protocols from llms.txt content
   */
  function parseProtocolsFromLlmsTxt(content) {
    const protocols = [];

    // Look for protocols: section
    const protocolsStart = content.indexOf('protocols:');
    if (protocolsStart === -1) return protocols;

    const afterProtocols = content.substring(protocolsStart);
    const lines = afterProtocols.split('\n');

    let currentProtocol = null;
    let currentTool = null;
    let inTools = false;
    let inResources = false;
    let inTransports = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();

      // Stop at next top-level section (non-indented)
      if (i > 0 && /^[a-z]+:/i.test(line) && !line.startsWith(' ') && !line.startsWith('\t')) {
        break;
      }

      // New protocol entry
      if (trimmed.startsWith("- name:") || trimmed.startsWith("-  name:")) {
        if (currentProtocol) {
          protocols.push(currentProtocol);
        }
        currentProtocol = {
          name: trimmed.replace(/^-\s*name:\s*/, '').replace(/['"]/g, '').trim(),
          tools: [],
          resources: [],
          transports: []
        };
        inTools = false;
        inResources = false;
        inTransports = false;
        continue;
      }

      if (currentProtocol) {
        if (trimmed.startsWith('type:')) {
          currentProtocol.type = trimmed.replace('type:', '').trim().toLowerCase();
        } else if (trimmed.startsWith('endpoint:')) {
          currentProtocol.endpoint = trimmed.replace('endpoint:', '').trim();
        } else if (trimmed.startsWith('version:')) {
          currentProtocol.version = trimmed.replace('version:', '').replace(/['"]/g, '').trim();
        } else if (trimmed.startsWith('description:')) {
          currentProtocol.description = trimmed.replace('description:', '').replace(/['"]/g, '').trim();
        } else if (trimmed === 'tools:') {
          inTools = true;
          inResources = false;
          inTransports = false;
        } else if (trimmed === 'resources:') {
          inResources = true;
          inTools = false;
          inTransports = false;
        } else if (trimmed === 'transports:') {
          inTransports = true;
          inTools = false;
          inResources = false;
        } else if (inTools && trimmed.startsWith('- id:')) {
          currentTool = { name: trimmed.replace('- id:', '').trim() };
          currentProtocol.tools.push(currentTool);
        } else if (inTools && trimmed.startsWith('- name:')) {
          currentTool = { name: trimmed.replace('- name:', '').replace(/['"]/g, '').trim() };
          currentProtocol.tools.push(currentTool);
        } else if (currentTool && trimmed.startsWith('name:') && !trimmed.startsWith('- name:')) {
          currentTool.name = trimmed.replace('name:', '').replace(/['"]/g, '').trim();
        } else if (currentTool && trimmed.startsWith('description:')) {
          currentTool.description = trimmed.replace('description:', '').replace(/['"]/g, '').trim();
        } else if (currentTool && trimmed.startsWith('auth:')) {
          currentTool.auth = trimmed.replace('auth:', '').trim();
        } else if (inResources && trimmed.startsWith('- uri:')) {
          currentProtocol.resources.push({
            uri: trimmed.replace('- uri:', '').replace(/['"]/g, '').trim()
          });
        } else if (inTransports && trimmed.startsWith('- type:')) {
          currentProtocol.transports.push({
            type: trimmed.replace('- type:', '').trim()
          });
        }
      }
    }

    // Add last protocol
    if (currentProtocol) {
      protocols.push(currentProtocol);
    }

    return protocols;
  }

  /**
   * Simple YAML parser for MCP section in llms.txt
   */
  function parseMcpFromYaml(content) {
    const servers = [];

    // Look for mcp: section
    const mcpStart = content.indexOf('mcp:');
    if (mcpStart === -1) return servers;

    // Extract the mcp block
    const afterMcp = content.substring(mcpStart);
    const lines = afterMcp.split('\n');

    let currentServer = null;
    let currentTool = null;
    let inServers = false;
    let inTools = false;
    let inResources = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();

      // Stop at next top-level section
      if (i > 0 && /^[a-z]+:/i.test(line) && !line.startsWith(' ')) {
        break;
      }

      // servers: array start
      if (trimmed === 'servers:') {
        inServers = true;
        continue;
      }

      // New server entry
      if (inServers && trimmed.startsWith('- name:')) {
        if (currentServer) {
          servers.push(currentServer);
        }
        currentServer = {
          name: trimmed.replace('- name:', '').trim(),
          tools: [],
          resources: []
        };
        inTools = false;
        inResources = false;
        continue;
      }

      if (currentServer) {
        // Server properties
        if (trimmed.startsWith('description:')) {
          currentServer.description = trimmed.replace('description:', '').trim();
        } else if (trimmed.startsWith('endpoint:')) {
          currentServer.endpoint = trimmed.replace('endpoint:', '').trim();
        } else if (trimmed.startsWith('transport:')) {
          currentServer.transport = trimmed.replace('transport:', '').trim();
        } else if (trimmed.startsWith('auth:')) {
          currentServer.auth = trimmed.replace('auth:', '').trim();
        } else if (trimmed === 'tools:') {
          inTools = true;
          inResources = false;
        } else if (trimmed === 'resources:') {
          inResources = true;
          inTools = false;
        } else if (inTools && trimmed.startsWith('- name:')) {
          currentTool = { name: trimmed.replace('- name:', '').trim() };
          currentServer.tools.push(currentTool);
        } else if (currentTool && trimmed.startsWith('description:')) {
          currentTool.description = trimmed.replace('description:', '').trim();
        } else if (inResources && trimmed.startsWith('- uri:')) {
          currentServer.resources.push({
            uri: trimmed.replace('- uri:', '').trim()
          });
        }
      }
    }

    // Add last server
    if (currentServer) {
      servers.push(currentServer);
    }

    return servers;
  }

  /**
   * Check for llms.txt at site root
   */
  async function checkLlmsTxt() {
    try {
      const llmsTxtUrl = `${currentOrigin}/llms.txt`;
      const response = await fetch(llmsTxtUrl, {
        method: 'GET',
        mode: 'cors',
        cache: 'no-cache'
      });

      if (response.ok) {
        const content = await response.text();

        // Validate it's not HTML
        if (isHTML(content)) {
          return { exists: false, error: 'Response was HTML, not llms.txt' };
        }

        return {
          exists: true,
          url: llmsTxtUrl,
          size: content.length,
          preview: content.substring(0, 500),
          hasContent: content.includes('content:') || content.includes('site:')
        };
      }
    } catch (error) {
      return {
        exists: false,
        error: error.message
      };
    }
    return { exists: false };
  }

  /**
   * Check for .well-known ARW files
   */
  async function checkWellKnownFiles() {
    const wellKnownFiles = {
      manifest: '/.well-known/arw-manifest.json',
      contentIndex: '/.well-known/arw-content-index.json',
      policies: '/.well-known/arw-policies.json'
    };

    const results = {};

    const checks = Object.entries(wellKnownFiles).map(async ([key, path]) => {
      try {
        const url = `${currentOrigin}${path}`;
        const response = await fetch(url, {
          method: 'GET',
          mode: 'cors',
          cache: 'no-cache'
        });

        if (response.ok) {
          const text = await response.text();

          // Try to parse as JSON
          try {
            const data = JSON.parse(text);
            results[key] = {
              exists: true,
              url: url,
              data: data
            };
          } catch (e) {
            results[key] = { exists: false, error: 'Invalid JSON' };
          }
        } else {
          results[key] = { exists: false };
        }
      } catch (error) {
        results[key] = { exists: false, error: error.message };
      }
    });

    await Promise.all(checks);
    return results;
  }

  /**
   * Check robots.txt for ARW hints
   */
  async function checkRobotsTxt() {
    try {
      const robotsUrl = `${currentOrigin}/robots.txt`;
      const response = await fetch(robotsUrl, {
        method: 'GET',
        mode: 'cors',
        cache: 'no-cache'
      });

      if (response.ok) {
        const content = await response.text();

        // Validate it's not HTML
        if (isHTML(content)) {
          return { exists: false, error: 'Response was HTML' };
        }

        const hasArwHints = /llms\.txt|\.well-known\/arw|agent-ready/i.test(content);

        return {
          exists: true,
          url: robotsUrl,
          hasArwHints: hasArwHints,
          preview: content.substring(0, 300)
        };
      }
    } catch (error) {
      return {
        exists: false,
        error: error.message
      };
    }
    return { exists: false };
  }

  /**
   * Scan page for ARW-related meta tags
   */
  function scanMetaTags() {
    const metaTags = [];

    const arwMetaSelectors = [
      'meta[name*="arw"]',
      'meta[name*="llm"]',
      'meta[name*="agent"]',
      'meta[name*="ai-"]',
      'meta[property*="arw"]',
      'link[rel="llms"]',
      'link[rel="machine-view"]',
      'link[rel="alternate"][type*="llm"]'
    ];

    arwMetaSelectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(el => {
        metaTags.push({
          tag: el.tagName.toLowerCase(),
          name: el.getAttribute('name') || el.getAttribute('property') || el.getAttribute('rel'),
          content: el.getAttribute('content') || el.getAttribute('href')
        });
      });
    });

    return metaTags;
  }

  /**
   * Check if current page has a corresponding machine view
   * Returns the content directly if found
   */
  async function checkForMachineView() {
    const pathname = window.location.pathname;

    // First check link tags for machine view
    const machineViewLink = document.querySelector(
      'link[rel="machine-view"], link[rel="alternate"][type*="llm"], link[rel="alternate"][type="text/markdown"]'
    );

    if (machineViewLink) {
      const href = machineViewLink.getAttribute('href');
      if (href) {
        const url = new URL(href, currentOrigin).href;
        const result = await fetchAndValidateMachineView(url);
        if (result) {
          return { ...result, source: 'link-tag' };
        }
      }
    }

    // Try common patterns for machine views
    const potentialPaths = [
      pathname.replace(/\.html?$/, '.llm.md'),
      pathname.replace(/\/$/, '') + '.llm.md',
      pathname + '.llm.md',
      pathname.replace(/\/$/, '/index.llm.md'),
      // Also try without .llm extension
      pathname.replace(/\.html?$/, '.md'),
      pathname.replace(/\/$/, '') + '.md'
    ];

    // Remove duplicates and invalid paths
    const uniquePaths = [...new Set(potentialPaths)].filter(p =>
      p && p !== '.llm.md' && p !== '.md' && p.length > 1
    );

    for (const path of uniquePaths) {
      const machineViewUrl = `${currentOrigin}${path}`;
      const result = await fetchAndValidateMachineView(machineViewUrl);
      if (result) {
        return { ...result, source: 'path-convention' };
      }
    }

    return null;
  }

  /**
   * Fetch and validate that content is actually a machine view (markdown)
   */
  async function fetchAndValidateMachineView(url) {
    try {
      const response = await fetch(url, {
        method: 'GET',
        mode: 'cors',
        cache: 'no-cache'
      });

      if (!response.ok) {
        return null;
      }

      // Check content-type
      const contentType = response.headers.get('content-type') || '';
      const isMarkdownType = contentType.includes('markdown') ||
                             contentType.includes('text/plain') ||
                             contentType.includes('text/x-markdown');

      const content = await response.text();

      // Validate content is markdown, not HTML
      if (isHTML(content)) {
        return null;
      }

      // Check if it looks like markdown
      if (!isMarkdown(content)) {
        return null;
      }

      return {
        exists: true,
        url: url,
        content: content,
        contentType: contentType
      };
    } catch (error) {
      return null;
    }
  }

  /**
   * Check if content is HTML
   */
  function isHTML(content) {
    if (!content) return false;
    const trimmed = content.trim().toLowerCase();
    return trimmed.startsWith('<!doctype') ||
           trimmed.startsWith('<html') ||
           trimmed.startsWith('<head') ||
           trimmed.startsWith('<body') ||
           (trimmed.includes('<html') && trimmed.includes('</html>'));
  }

  /**
   * Check if content looks like markdown
   */
  function isMarkdown(content) {
    if (!content || content.length < 10) return false;

    // Check for common markdown patterns
    const markdownPatterns = [
      /^#+ /m,           // Headers
      /^\* /m,           // Unordered lists
      /^- /m,            // Unordered lists
      /^\d+\. /m,        // Ordered lists
      /\[.+\]\(.+\)/,    // Links
      /```/,             // Code blocks
      /^\>/m,            // Blockquotes
      /\*\*.+\*\*/,      // Bold
      /__.+__/,          // Bold
      /\*.+\*/,          // Italic
      /_.+_/,            // Italic
    ];

    // If it has any markdown patterns, consider it markdown
    const hasMarkdown = markdownPatterns.some(pattern => pattern.test(content));

    // Also accept plain text that doesn't look like HTML
    const isPlainText = !content.includes('<div') &&
                        !content.includes('<span') &&
                        !content.includes('<script');

    return hasMarkdown || isPlainText;
  }

  /**
   * Check for AI-specific HTTP headers
   */
  async function checkAIHeaders(url) {
    const headers = [];
    const permissions = {
      training: null,
      inference: null,
      attribution: null,
      rateLimit: null
    };

    try {
      const response = await fetch(url, {
        method: 'HEAD',
        mode: 'cors',
        cache: 'no-cache'
      });

      // Check for AI headers
      const aiHeaderNames = [
        'AI-Attribution',
        'AI-Training',
        'AI-Inference',
        'AI-Rate-Limit',
        'X-AI-Attribution',
        'X-AI-Training',
        'X-Robots-Tag'
      ];

      aiHeaderNames.forEach(headerName => {
        const value = response.headers.get(headerName);
        if (value) {
          headers.push({ name: headerName, value: value });

          // Parse permissions
          const lowerName = headerName.toLowerCase();
          if (lowerName.includes('training')) {
            permissions.training = value.includes('disallow') ? 'disallowed' : 'allowed';
          } else if (lowerName.includes('inference')) {
            permissions.inference = value.includes('disallow') ? 'disallowed' : 'allowed';
          } else if (lowerName.includes('attribution')) {
            permissions.attribution = value.includes('required') ? 'required' : value;
          } else if (lowerName.includes('rate-limit')) {
            permissions.rateLimit = value;
          }
        }
      });
    } catch (error) {
      console.log('Failed to check AI headers:', error.message);
    }

    return { headers, permissions };
  }

  /**
   * Send inspection results to background service worker
   */
  async function reportResults(results) {
    try {
      await chrome.runtime.sendMessage({
        type: 'ARW_INSPECTION_COMPLETE',
        data: results
      });
    } catch (error) {
      console.error('ARW Inspector: Failed to send results', error);
    }
  }

  /**
   * Update extension badge based on ARW compliance
   */
  function updateBadge(isCompliant) {
    chrome.runtime.sendMessage({
      type: 'UPDATE_BADGE',
      data: {
        text: isCompliant ? '✓' : '',
        color: isCompliant ? '#22c55e' : '#94a3b8'
      }
    });
  }

  // ============================================================================
  // GEO ANALYSIS FUNCTIONS (from geo-geo-bundle)
  // ============================================================================

  function getPageText() {
    const main = document.querySelector('main') || document.body;
    return main.innerText || '';
  }

  function getLinks() {
    return Array.from(document.querySelectorAll('a[href]'));
  }

  function analyzeCitations() {
    const links = getLinks();
    const externalLinks = links.filter((link) => {
      const href = link.getAttribute('href') || '';
      if (!href || href.startsWith('#') || href.startsWith('javascript:')) return false;
      try {
        const url = new URL(href, window.location.href);
        return url.hostname !== window.location.hostname;
      } catch {
        return false;
      }
    });

    const externalDomains = Array.from(
      new Set(
        externalLinks
          .map((l) => {
            try {
              return new URL(l.href).hostname;
            } catch {
              return null;
            }
          })
          .filter(Boolean)
      )
    );

    return {
      totalLinks: links.length,
      externalLinks: externalLinks.length,
      externalDomains
    };
  }

  function analyzeStatistics(text) {
    const percentRegex = /\b\d+(\.\d+)?\s*%/g;
    const currencyRegex = /(\$|€|£)\s?\d[\d,]*(\.\d+)?/g;
    const bigNumberRegex = /\b\d{4,}\b/g;

    const percentages = text.match(percentRegex) || [];
    const currencies = text.match(currencyRegex) || [];
    const bigNumbers = text.match(bigNumberRegex) || [];

    const total = percentages.length + currencies.length + bigNumbers.length;

    return {
      total,
      percentages,
      currencies,
      bigNumbers
    };
  }

  function analyzeQuotations() {
    const blockquotes = Array.from(document.querySelectorAll('blockquote'));
    const text = getPageText();
    const quoteRegex = /"([^"]+)"|"([^"]+)"/g;
    const inlineQuotes = [];
    let match;
    while ((match = quoteRegex.exec(text)) !== null) {
      inlineQuotes.push(match[1] || match[2]);
    }

    return {
      blockquoteCount: blockquotes.length,
      inlineQuoteCount: inlineQuotes.length,
      sampleQuotes: inlineQuotes.slice(0, 5)
    };
  }

  function analyzeEntities(text) {
    const words = text.split(/\s+/);
    const candidates = words.filter((w) => /^[A-Z][a-zA-Z0-9\-]+$/.test(w));
    const freq = {};
    for (const c of candidates) {
      freq[c] = (freq[c] || 0) + 1;
    }
    const entries = Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({ name, count }));
    return {
      totalEntities: entries.length,
      entities: entries.slice(0, 25)
    };
  }

  function analyzeMachineViews() {
    const links = getLinks();
    const llmMdLinks = links.filter((link) => link.href.endsWith('.llm.md'));
    const plannedChecks = ['/.well-known/llms.txt', '/sitemap-llm.xml'];
    return {
      llmMdCount: llmMdLinks.length,
      llmMdUrls: llmMdLinks.map((l) => l.href),
      plannedChecks
    };
  }

  function analyzeStructure(text) {
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    const hasMainTag = !!document.querySelector('main');
    const wordCount = text.split(/\s+/).filter(Boolean).length;
    return {
      headingCount: headings.length,
      hasMainTag,
      wordCount
    };
  }

  // ============================================================================
  // GEO SCORING (from geoScoring.ts)
  // ============================================================================

  function computeAuthorityScore(m) {
    const extLinks = m.citations?.externalLinks ?? 0;
    const domainCount = m.citations?.externalDomains?.length ?? 0;
    const llmMdCount = m.machineViews?.llmMdCount ?? 0;

    const extLinksNorm = Math.min(extLinks, 10) / 10;
    const domainNorm = Math.min(domainCount, 5) / 5;
    const llmMdNorm = llmMdCount > 0 ? 1 : 0;

    const score = extLinksNorm * 0.4 + domainNorm * 0.3 + llmMdNorm * 0.3;
    return Math.round(score * 100);
  }

  function computeEvidenceScore(m) {
    const statsTotal = m.statistics?.total ?? 0;
    const quotesTotal =
      (m.quotations?.blockquoteCount ?? 0) +
      (m.quotations?.inlineQuoteCount ?? 0);

    const statsNorm = Math.min(statsTotal, 10) / 10;
    const quotesNorm = Math.min(quotesTotal, 8) / 8;

    const score = statsNorm * 0.6 + quotesNorm * 0.4;
    return Math.round(score * 100);
  }

  function computeSemanticClarityScore(m) {
    const totalEntities = m.entities?.totalEntities ?? 0;
    const wordCount = m.structure?.wordCount ?? 0;

    const wordNorm = Math.min(wordCount, 1500) / 1500;

    const idealMin = 8;
    const idealMax = 60;
    let entityNorm = 0;
    if (totalEntities <= 0) entityNorm = 0;
    else if (totalEntities < idealMin) entityNorm = totalEntities / idealMin;
    else if (totalEntities <= idealMax) entityNorm = 1;
    else entityNorm = Math.max(0.5, 1 - (totalEntities - idealMax) / 100);

    const score = entityNorm * 0.7 + wordNorm * 0.3;
    return Math.round(score * 100);
  }

  function computeArwReadinessScore(m) {
    const llmMdCount = m.machineViews?.llmMdCount ?? 0;
    const plannedChecks = m.machineViews?.plannedChecks?.length ?? 0;
    const hasMain = m.structure?.hasMainTag ?? false;
    const headingCount = m.structure?.headingCount ?? 0;

    const llmMdNorm = llmMdCount > 0 ? 1 : 0;
    const checksNorm = Math.min(plannedChecks, 3) / 3;
    const headingsNorm = Math.min(headingCount, 12) / 12;
    const mainNorm = hasMain ? 1 : 0;

    const score =
      llmMdNorm * 0.4 +
      checksNorm * 0.2 +
      headingsNorm * 0.25 +
      mainNorm * 0.15;

    return Math.round(score * 100);
  }

  function computeGeoScore(metrics) {
    const authority = computeAuthorityScore(metrics);
    const evidence = computeEvidenceScore(metrics);
    const semantic = computeSemanticClarityScore(metrics);
    const arw = computeArwReadinessScore(metrics);

    const finalScore =
      authority * 0.3 +
      evidence * 0.25 +
      semantic * 0.25 +
      arw * 0.2;

    return {
      geoScore: Math.round(finalScore),
      subscores: {
        authority,
        evidence,
        semanticClarity: semantic,
        arwReadiness: arw
      }
    };
  }

  // ============================================================================
  // INTEGRATED GEO ANALYSIS
  // ============================================================================

  function performGeoAnalysis() {
    const text = getPageText();
    const citations = analyzeCitations();
    const stats = analyzeStatistics(text);
    const quotes = analyzeQuotations();
    const entities = analyzeEntities(text);
    const machineViews = analyzeMachineViews();
    const structure = analyzeStructure(text);

    const metrics = {
      citations,
      statistics: stats,
      quotations: quotes,
      entities,
      machineViews,
      structure
    };

    const { geoScore, subscores } = computeGeoScore(metrics);

    return {
      geoScore,
      subscores,
      metrics,
      analyzedAt: new Date().toISOString()
    };
  }

  // Run inspection when page loads
  async function runInspection() {
    const results = await inspectPage();

    // Add automatic GEO analysis
    try {
      const geoAnalysis = performGeoAnalysis();
      results.geo = geoAnalysis;
    } catch (error) {
      console.error('GEO analysis failed:', error);
      results.geo = null;
    }

    updateBadge(results.arwCompliant);
    await reportResults(results);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runInspection);
  } else {
    runInspection();
  }

})();
