import * as yaml from 'js-yaml';
import type { ARWDiscovery, InspectionResult, ViewComparison, DiscoveryInfo, WellKnownFile, SitemapInfo, RobotsInfo } from '../types';
import { fetchWithCors, testCors } from './fetcher';
import { estimateTokens, estimateHtmlTokens, calculateSavings, extractChunkIds } from './tokenizer';

export async function inspectARW(targetUrl: string): Promise<InspectionResult> {
  const result: InspectionResult = {
    url: targetUrl,
    discovery: null,
    errors: [],
    warnings: [],
    machineViews: new Map(),
    chunks: new Map(),
    comparisons: new Map(),
    usedProxy: false,
  };

  try {
    // Normalize URL
    const baseUrl = targetUrl.endsWith('/') ? targetUrl.slice(0, -1) : targetUrl;

    // Fetch llms.txt
    const llmsTxtUrl = `${baseUrl}/llms.txt`;

    // Test CORS first
    const corsEnabled = await testCors(llmsTxtUrl);
    if (!corsEnabled) {
      result.warnings.push(
        'CORS is not enabled on the target server. ' +
          'For local development, restart your server with CORS enabled. ' +
          'Example: npx serve public -p 3000 --cors'
      );
    }

    const { response: llmsTxtResponse, usedProxy } = await fetchWithCors(llmsTxtUrl);

    // Track proxy usage
    if (usedProxy) {
      result.usedProxy = true;
    }

    if (!llmsTxtResponse.ok) {
      result.errors.push(
        `Failed to fetch llms.txt: ${llmsTxtResponse.status} ${llmsTxtResponse.statusText}`
      );
      return result;
    }

    const llmsTxtContent = await llmsTxtResponse.text();

    // Store raw YAML
    result.rawYaml = llmsTxtContent;

    // Parse YAML
    try {
      const discovery = yaml.load(llmsTxtContent) as ARWDiscovery;
      result.discovery = discovery;

      // Validate basic structure
      if (!discovery.version) {
        result.warnings.push('Missing version field');
      }
      if (!discovery.site) {
        result.errors.push('Missing site field');
        return result;
      }

      // Fetch machine views
      if (discovery.content && Array.isArray(discovery.content)) {
        await fetchMachineViews(baseUrl, discovery.content, result);
      }

      // Fetch discovery information (sitemap, robots, .well-known, AI headers)
      await fetchDiscoveryInfo(baseUrl, llmsTxtResponse.headers, result);
    } catch (err) {
      result.errors.push(
        `Failed to parse llms.txt as YAML: ${err instanceof Error ? err.message : 'Unknown error'}`
      );
      return result;
    }
  } catch (err) {
    result.errors.push(`Network error: ${err instanceof Error ? err.message : 'Unknown error'}`);
  }

  return result;
}

async function fetchMachineViews(
  baseUrl: string,
  content: ARWDiscovery['content'],
  result: InspectionResult
): Promise<void> {
  if (!content) return;

  const fetchPromises = content
    .filter((entry) => entry.machine_view)
    .map(async (entry) => {
      if (!entry.machine_view) return;

      try {
        const machineViewUrl = entry.machine_view.startsWith('http')
          ? entry.machine_view
          : `${baseUrl}${entry.machine_view}`;

        const { response, usedProxy } = await fetchWithCors(machineViewUrl);

        // Track proxy usage
        if (usedProxy) {
          result.usedProxy = true;
        }

        if (!response.ok) {
          result.warnings.push(
            `Failed to fetch machine view ${entry.machine_view}: ${response.status}`
          );
          return;
        }

        const machineViewContent = await response.text();
        result.machineViews.set(entry.machine_view, machineViewContent);

        // Extract chunks
        const chunks = extractChunkIds(machineViewContent);
        if (chunks.length > 0) {
          result.chunks.set(entry.machine_view, chunks);
        }

        // Fetch corresponding HTML for comparison
        await fetchHtmlForComparison(
          baseUrl,
          entry.url,
          entry.machine_view,
          machineViewContent,
          chunks,
          result
        );
      } catch (err) {
        result.warnings.push(
          `Error fetching machine view ${entry.machine_view}: ${err instanceof Error ? err.message : 'Unknown error'}`
        );
      }
    });

  await Promise.all(fetchPromises);
}

async function fetchHtmlForComparison(
  baseUrl: string,
  contentUrl: string,
  machineViewUrl: string,
  machineViewContent: string,
  chunks: string[],
  result: InspectionResult
): Promise<void> {
  try {
    // Construct the HTML URL from the content entry
    const htmlUrl = contentUrl.startsWith('http') ? contentUrl : `${baseUrl}${contentUrl}`;

    const { response: htmlResponse, usedProxy } = await fetchWithCors(htmlUrl);

    // Track proxy usage
    if (usedProxy) {
      result.usedProxy = true;
    }

    if (!htmlResponse.ok) {
      result.warnings.push(
        `Failed to fetch HTML for comparison at ${contentUrl}: ${htmlResponse.status}`
      );
      return;
    }

    const htmlContent = await htmlResponse.text();

    // Create comparison
    const comparison = createViewComparison(machineViewContent, htmlContent, chunks);
    result.comparisons.set(machineViewUrl, comparison);
  } catch (err) {
    result.warnings.push(
      `Error fetching HTML for comparison at ${contentUrl}: ${err instanceof Error ? err.message : 'Unknown error'}`
    );
  }
}

function createViewComparison(
  machineViewContent: string,
  htmlContent: string,
  chunks: string[]
): ViewComparison {
  // Calculate machine view metrics
  const machineViewSize = new TextEncoder().encode(machineViewContent).length;
  const machineViewLines = machineViewContent.split('\n').length;
  const machineViewTokens = estimateTokens(machineViewContent);

  // Calculate HTML metrics
  const htmlSize = new TextEncoder().encode(htmlContent).length;

  // Normalize HTML line counting to handle minified HTML
  // Add line breaks after common block-level closing tags for more accurate line counting
  const normalizedHtml = htmlContent
    .replace(/(<\/(?:div|p|section|article|nav|header|footer|main|aside|h[1-6]|li|ul|ol|table|tr)>)/gi, '$1\n')
    .replace(/(<(?:br|hr)\s*\/?>)/gi, '$1\n');
  const htmlLines = normalizedHtml.split('\n').filter(line => line.trim().length > 0).length;

  const htmlTokens = estimateHtmlTokens(htmlContent);

  // Calculate savings
  const tokenSavings = calculateSavings(machineViewTokens, htmlTokens);
  const sizeSavings = htmlSize > 0 ? ((htmlSize - machineViewSize) / htmlSize) * 100 : 0;

  return {
    machineView: {
      content: machineViewContent,
      size: machineViewSize,
      lines: machineViewLines,
      chunks: chunks.length,
      estimatedTokens: machineViewTokens,
    },
    htmlView: {
      content: htmlContent,
      size: htmlSize,
      lines: htmlLines,
      estimatedTokens: htmlTokens,
    },
    savings: {
      sizePercent: sizeSavings,
      tokenPercent: tokenSavings.percentSaved,
      absoluteTokens: tokenSavings.absoluteTokens,
    },
  };
}

async function fetchDiscoveryInfo(
  baseUrl: string,
  llmsTxtHeaders: Headers,
  result: InspectionResult
): Promise<void> {
  const discoveryInfo: DiscoveryInfo = {
    wellKnown: {},
    aiHeaders: {
      found: false,
      headers: {},
    },
  };

  // Extract AI- headers from llms.txt response
  llmsTxtHeaders.forEach((value, key) => {
    if (key.toLowerCase().startsWith('ai-')) {
      discoveryInfo.aiHeaders!.found = true;
      discoveryInfo.aiHeaders!.headers[key] = value;
    }
  });

  // Fetch .well-known files
  const wellKnownFiles = [
    { key: 'manifest', path: '/.well-known/arw-manifest.json' },
    { key: 'contentIndex', path: '/.well-known/arw-content-index.json' },
    { key: 'policies', path: '/.well-known/arw-policies.json' },
  ];

  await Promise.all(
    wellKnownFiles.map(async ({ key, path }) => {
      const url = `${baseUrl}${path}`;
      const fileInfo: WellKnownFile = { url, exists: false };

      try {
        const { response } = await fetchWithCors(url);
        fileInfo.exists = response.ok;

        if (response.ok) {
          fileInfo.content = await response.text();
        } else {
          fileInfo.error = `${response.status} ${response.statusText}`;
        }
      } catch (err) {
        fileInfo.error = err instanceof Error ? err.message : 'Unknown error';
      }

      discoveryInfo.wellKnown[key as 'manifest' | 'contentIndex' | 'policies'] = fileInfo;
    })
  );

  // Fetch robots.txt
  const robotsUrl = `${baseUrl}/robots.txt`;
  const robotsInfo: RobotsInfo = { exists: false, url: robotsUrl };

  try {
    const { response } = await fetchWithCors(robotsUrl);
    robotsInfo.exists = response.ok;

    if (response.ok) {
      robotsInfo.content = await response.text();
      // Check for ARW hints in robots.txt
      robotsInfo.hasArwHints =
        robotsInfo.content.includes('llms.txt') ||
        robotsInfo.content.includes('/.well-known/arw') ||
        robotsInfo.content.toLowerCase().includes('agent-ready');
    } else {
      robotsInfo.error = `${response.status} ${response.statusText}`;
    }
  } catch (err) {
    robotsInfo.error = err instanceof Error ? err.message : 'Unknown error';
  }

  discoveryInfo.robots = robotsInfo;

  // Fetch sitemap.xml
  const sitemapUrl = `${baseUrl}/sitemap.xml`;
  const sitemapInfo: SitemapInfo = { exists: false, url: sitemapUrl };

  try {
    const { response } = await fetchWithCors(sitemapUrl);
    sitemapInfo.exists = response.ok;

    if (response.ok) {
      sitemapInfo.content = await response.text();
      // Count entries in sitemap
      const urlMatches = sitemapInfo.content.match(/<url>/g);
      sitemapInfo.entryCount = urlMatches ? urlMatches.length : 0;
    } else {
      sitemapInfo.error = `${response.status} ${response.statusText}`;
    }
  } catch (err) {
    sitemapInfo.error = err instanceof Error ? err.message : 'Unknown error';
  }

  discoveryInfo.sitemap = sitemapInfo;

  result.discoveryInfo = discoveryInfo;
}
