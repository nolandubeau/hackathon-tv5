/**
 * Token estimation utilities for comparing ARW machine views vs HTML
 *
 * Note: These are approximations. Actual token counts vary by model tokenizer.
 * Common ratios: ~4 chars/token (English), ~1.3 tokens/word
 */

/**
 * Estimate token count for text content
 * Uses a conservative estimate of ~4 characters per token
 */
export function estimateTokens(text: string): number {
  // Remove excessive whitespace for more accurate counting
  const normalized = text.replace(/\s+/g, ' ').trim();

  // Average ~4 characters per token (conservative estimate)
  // This works reasonably well across different tokenizers (GPT, Claude, etc.)
  return Math.ceil(normalized.length / 4);
}

/**
 * Strip HTML tags and extract text content
 * This simulates what an LLM would see when scraping HTML
 */
export function stripHtmlToText(html: string): string {
  // Remove script and style tags with their content
  let text = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  text = text.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');

  // Remove HTML comments
  text = text.replace(/<!--[\s\S]*?-->/g, '');

  // Remove all HTML tags but keep the content
  text = text.replace(/<[^>]+>/g, ' ');

  // Decode common HTML entities
  text = text.replace(/&nbsp;/g, ' ');
  text = text.replace(/&amp;/g, '&');
  text = text.replace(/&lt;/g, '<');
  text = text.replace(/&gt;/g, '>');
  text = text.replace(/&quot;/g, '"');
  text = text.replace(/&#39;/g, "'");

  // Normalize whitespace
  text = text.replace(/\s+/g, ' ').trim();

  return text;
}

/**
 * Calculate more accurate token estimate including HTML structure
 * LLMs often receive HTML with some structure preserved
 */
export function estimateHtmlTokens(html: string): number {
  // For HTML, we estimate based on the full content including tags
  // This represents what an agent might scrape without ARW

  // Remove comments and some excessive whitespace, but keep structure
  let cleaned = html.replace(/<!--[\s\S]*?-->/g, '');
  cleaned = cleaned.replace(/\n\s*\n/g, '\n');

  return estimateTokens(cleaned);
}

/**
 * Calculate token savings percentage
 */
export function calculateSavings(
  machineViewTokens: number,
  htmlTokens: number
): {
  absoluteTokens: number;
  percentSaved: number;
} {
  const absoluteTokens = htmlTokens - machineViewTokens;
  const percentSaved = htmlTokens > 0 ? (absoluteTokens / htmlTokens) * 100 : 0;

  return {
    absoluteTokens,
    percentSaved,
  };
}

/**
 * Extract content chunks from markdown
 */
export function extractChunkIds(markdown: string): string[] {
  const chunkPattern = /<!--\s*chunk:\s*([a-z0-9-]+)\s*-->/gi;
  const chunks: string[] = [];
  let match;

  while ((match = chunkPattern.exec(markdown)) !== null) {
    chunks.push(match[1]);
  }

  return chunks;
}

/**
 * Calculate file size in a human-readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/**
 * Format number with thousand separators
 */
export function formatNumber(num: number): string {
  return num.toLocaleString('en-US');
}

/**
 * Calculate cost for token usage
 * @param tokens Number of tokens
 * @param costPerMToken Cost per million tokens in USD
 */
export function calculateCost(tokens: number, costPerMToken: number): number {
  return (tokens / 1_000_000) * costPerMToken;
}
