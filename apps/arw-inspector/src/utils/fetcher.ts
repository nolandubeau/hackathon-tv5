/**
 * Fetch utility with proxy fallback for CORS issues
 */

export interface FetchOptions {
  mode?: RequestMode;
  useProxy?: boolean;
}

export interface FetchResult {
  response: Response;
  usedProxy: boolean;
}

/**
 * Check if URL is localhost or local network
 */
function isLocalUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname.toLowerCase();
    return (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname === '[::1]' ||
      hostname.endsWith('.local') ||
      hostname.match(/^192\.168\.\d+\.\d+$/) !== null ||
      hostname.match(/^10\.\d+\.\d+\.\d+$/) !== null ||
      hostname.match(/^172\.(1[6-9]|2[0-9]|3[0-1])\.\d+\.\d+$/) !== null
    );
  } catch {
    return false;
  }
}

/**
 * Fetches a URL, with automatic fallback to proxy if CORS fails
 * Returns both the response and information about whether proxy was used
 *
 * Note: Localhost URLs will never use proxy and will fail with clear error messages
 */
export async function fetchWithCors(url: string, options: FetchOptions = {}): Promise<FetchResult> {
  const { mode = 'cors', useProxy = false } = options;
  const isLocal = isLocalUrl(url);

  // For localhost URLs, never use proxy - provide clear error instead
  if (isLocal && useProxy) {
    throw new Error(
      'Cannot use CORS proxy with localhost URLs. Please ensure the server is running and accessible.'
    );
  }

  // Try direct fetch first
  if (!useProxy) {
    try {
      const response = await fetch(url, { mode });
      return { response, usedProxy: false };
    } catch (err) {
      // For localhost URLs, provide helpful error message
      if (isLocal) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        throw new Error(
          `Failed to connect to ${url}. Please ensure:\n` +
          `1. The server is running on the specified port\n` +
          `2. The server is accessible from this browser\n` +
          `\nOriginal error: ${message}`
        );
      }

      // For remote URLs with CORS errors, try proxy
      if (err instanceof TypeError && err.message.includes('fetch')) {
        console.warn('Direct fetch failed, trying proxy...', err);
        return fetchWithProxy(url);
      }
      throw err;
    }
  }

  // Use proxy directly if requested (only for non-localhost URLs)
  if (isLocal) {
    throw new Error(
      'Cannot use CORS proxy with localhost URLs. Please ensure the server is running and accessible.'
    );
  }
  return fetchWithProxy(url);
}

/**
 * Fetches URL through CORS proxy
 */
async function fetchWithProxy(url: string): Promise<FetchResult> {
  // Validate URL before sending to proxy
  if (!url || !url.startsWith('http')) {
    throw new Error('Invalid URL provided to proxy');
  }

  // Use a public CORS proxy service
  // Note: allorigins.win is a free public CORS proxy service
  // For production, consider using your own CORS proxy
  const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;

  try {
    const response = await fetch(proxyUrl);
    return { response, usedProxy: true };
  } catch (err) {
    console.error('Proxy fetch failed:', err);
    // Don't fall back to no-cors mode as it returns unusable response
    throw new Error(`Failed to fetch URL through proxy: ${err instanceof Error ? err.message : 'Unknown error'}`);
  }
}

/**
 * Test if a URL is accessible with CORS
 */
export async function testCors(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, {
      method: 'HEAD',
      mode: 'cors',
    });
    return response.ok;
  } catch {
    return false;
  }
}
