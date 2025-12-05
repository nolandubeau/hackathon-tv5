# Web Crawler Service - SDK Design

## Overview

This document outlines the design and structure of the official SDKs for the Web Crawler Service. The SDKs provide idiomatic, type-safe interfaces for JavaScript/TypeScript, Python, Go, and Ruby.

## Design Principles

### 1. Developer Experience First
- Intuitive API design
- Comprehensive type safety
- Clear error messages
- Extensive documentation

### 2. Consistency Across Languages
- Similar method names and patterns
- Consistent parameter naming
- Unified error handling
- Common configuration options

### 3. Production Ready
- Automatic retries with exponential backoff
- Built-in rate limiting
- Connection pooling
- Request timeout management
- Comprehensive logging

### 4. Flexibility
- Sync and async APIs (where applicable)
- Streaming support for large crawls
- Customizable HTTP client
- Middleware/plugin support

## TypeScript/JavaScript SDK

### Installation

```bash
npm install @webcrawler/sdk
# or
yarn add @webcrawler/sdk
# or
pnpm add @webcrawler/sdk
```

### Core Architecture

```typescript
// File: src/index.ts

import { EventEmitter } from 'events';
import axios, { AxiosInstance } from 'axios';
import WebSocket from 'ws';

/**
 * Main SDK Client
 */
export class WebCrawler extends EventEmitter {
  private apiKey: string;
  private baseURL: string;
  private httpClient: AxiosInstance;
  private maxRetries: number;
  private timeout: number;

  constructor(config: WebCrawlerConfig) {
    super();
    this.apiKey = config.apiKey;
    this.baseURL = config.baseURL || 'https://api.webcrawler.io/v1';
    this.maxRetries = config.maxRetries || 3;
    this.timeout = config.timeout || 30000;

    this.httpClient = axios.create({
      baseURL: this.baseURL,
      timeout: this.timeout,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'User-Agent': `@webcrawler/sdk/${version}`,
      },
    });

    this.setupInterceptors();
  }

  /**
   * Scrape a single page
   */
  async scrape(options: ScrapeOptions): Promise<ScrapeResult> {
    const response = await this.httpClient.post<ApiResponse<ScrapeResult>>(
      '/scrape',
      options
    );
    return response.data.data;
  }

  /**
   * Crawl multiple pages
   */
  async crawl(options: CrawlOptions): Promise<CrawlJob> {
    const response = await this.httpClient.post<ApiResponse<CrawlJob>>(
      '/crawl',
      options
    );

    const job = new CrawlJob(response.data.data, this);

    // Auto-connect WebSocket if requested
    if (options.realtime || options.onProgress || options.onPageCompleted) {
      await job.connectWebSocket(options);
    }

    return job;
  }

  /**
   * Generate site map
   */
  async map(options: MapOptions): Promise<SiteMap> {
    const response = await this.httpClient.post<ApiResponse<SiteMap>>(
      '/map',
      options
    );
    return response.data.data;
  }

  /**
   * Batch scrape multiple URLs
   */
  async batch(options: BatchOptions): Promise<BatchResult> {
    const response = await this.httpClient.post<ApiResponse<BatchResult>>(
      '/batch',
      options
    );
    return response.data.data;
  }

  /**
   * Discover ARW resources
   */
  async discoverARW(options: ARWDiscoveryOptions): Promise<ARWDiscovery> {
    const response = await this.httpClient.get<ApiResponse<ARWDiscovery>>(
      '/arw/discover',
      { params: options }
    );
    return response.data.data;
  }

  /**
   * Get crawl job status
   */
  async getJob(jobId: string): Promise<CrawlJobStatus> {
    const response = await this.httpClient.get<ApiResponse<CrawlJobStatus>>(
      `/crawl/${jobId}`
    );
    return response.data.data;
  }

  /**
   * Cancel crawl job
   */
  async cancelJob(jobId: string): Promise<void> {
    await this.httpClient.delete(`/crawl/${jobId}`);
  }

  private setupInterceptors(): void {
    // Retry logic
    this.httpClient.interceptors.response.use(
      (response) => response,
      async (error) => {
        const config = error.config;

        if (!config || !config.retryCount) {
          config.retryCount = 0;
        }

        if (config.retryCount >= this.maxRetries) {
          return Promise.reject(error);
        }

        // Retry on 5xx errors or network issues
        if (error.response?.status >= 500 || !error.response) {
          config.retryCount += 1;
          const delay = Math.pow(2, config.retryCount) * 1000;
          await new Promise(resolve => setTimeout(resolve, delay));
          return this.httpClient(config);
        }

        return Promise.reject(error);
      }
    );
  }
}

/**
 * CrawlJob class for managing crawl operations
 */
export class CrawlJob extends EventEmitter {
  public jobId: string;
  public status: CrawlStatus;
  private client: WebCrawler;
  private ws?: WebSocket;

  constructor(data: CrawlJobData, client: WebCrawler) {
    super();
    this.jobId = data.jobId;
    this.status = data.status;
    this.client = client;
  }

  /**
   * Wait for crawl to complete
   */
  async waitForCompletion(): Promise<CrawlJobStatus> {
    return new Promise((resolve, reject) => {
      const checkStatus = async () => {
        try {
          const status = await this.client.getJob(this.jobId);

          if (status.status === 'completed') {
            resolve(status);
          } else if (status.status === 'failed' || status.status === 'cancelled') {
            reject(new Error(`Crawl ${status.status}`));
          } else {
            setTimeout(checkStatus, 2000);
          }
        } catch (error) {
          reject(error);
        }
      };

      checkStatus();
    });
  }

  /**
   * Connect to WebSocket for real-time updates
   */
  async connectWebSocket(options: CrawlOptions): Promise<void> {
    const wsUrl = `wss://api.webcrawler.io/v1/crawl/${this.jobId}/stream`;

    this.ws = new WebSocket(wsUrl, {
      headers: {
        'Authorization': `Bearer ${this.client['apiKey']}`,
      },
    });

    this.ws.on('message', (data: WebSocket.Data) => {
      const message = JSON.parse(data.toString());

      switch (message.type) {
        case 'crawl_started':
          this.emit('started', message);
          break;
        case 'page_completed':
          this.emit('pageCompleted', message);
          if (options.onPageCompleted) {
            options.onPageCompleted(message);
          }
          if (options.onProgress) {
            options.onProgress(message.progress);
          }
          break;
        case 'page_failed':
          this.emit('pageFailed', message);
          if (options.onPageFailed) {
            options.onPageFailed(message);
          }
          break;
        case 'crawl_completed':
          this.emit('completed', message);
          this.ws?.close();
          break;
        case 'crawl_failed':
          this.emit('failed', message);
          this.ws?.close();
          break;
      }
    });

    this.ws.on('error', (error) => {
      this.emit('error', error);
    });

    this.ws.on('close', () => {
      this.emit('disconnected');
    });
  }

  /**
   * Cancel this crawl job
   */
  async cancel(): Promise<void> {
    await this.client.cancelJob(this.jobId);
    this.ws?.close();
  }

  /**
   * Get current status
   */
  async getStatus(): Promise<CrawlJobStatus> {
    return this.client.getJob(this.jobId);
  }

  /**
   * Stream results as they become available
   */
  async *streamResults(): AsyncGenerator<PageResult, void, unknown> {
    const status = await this.getStatus();

    for (const result of status.results) {
      yield result;
    }

    // Wait for more results if crawl is still running
    while (this.status !== 'completed' && this.status !== 'failed') {
      await new Promise(resolve => setTimeout(resolve, 2000));
      const updatedStatus = await this.getStatus();

      for (const result of updatedStatus.results) {
        if (!status.results.find(r => r.url === result.url)) {
          yield result;
        }
      }

      this.status = updatedStatus.status;
    }
  }
}

/**
 * Type Definitions
 */

export interface WebCrawlerConfig {
  apiKey: string;
  baseURL?: string;
  maxRetries?: number;
  timeout?: number;
  logLevel?: 'debug' | 'info' | 'warn' | 'error';
}

export interface ScrapeOptions {
  url: string;
  formats?: ('markdown' | 'html' | 'text' | 'json')[];
  options?: {
    waitFor?: number;
    includeHtml?: boolean;
    includeRawHtml?: boolean;
    screenshot?: boolean;
    headers?: Record<string, string>;
    timeout?: number;
    removeTags?: string[];
    onlyMainContent?: boolean;
  };
}

export interface ScrapeResult {
  url: string;
  statusCode: number;
  markdown?: string;
  html?: string;
  text?: string;
  metadata: Metadata;
  links: Link[];
  screenshot?: string;
  machineView: MachineView;
}

export interface CrawlOptions {
  url: string;
  maxPages?: number;
  formats?: ('markdown' | 'html' | 'text' | 'json')[];
  options?: {
    crawlStrategy?: 'breadth-first' | 'depth-first';
    maxDepth?: number;
    allowedDomains?: string[];
    excludePatterns?: string[];
    includePatterns?: string[];
    respectRobotsTxt?: boolean;
    followSitemaps?: boolean;
    timeout?: number;
    concurrency?: number;
    headers?: Record<string, string>;
    onlyMainContent?: boolean;
  };
  realtime?: boolean;
  onProgress?: (progress: CrawlProgress) => void;
  onPageCompleted?: (page: PageResult) => void;
  onPageFailed?: (error: PageError) => void;
}

export interface CrawlJob {
  jobId: string;
  status: CrawlStatus;
  statusUrl: string;
  websocketUrl: string;
  estimatedPages: number;
}

export interface CrawlJobStatus {
  jobId: string;
  status: CrawlStatus;
  progress: CrawlProgress;
  startedAt: string;
  estimatedCompletionAt?: string;
  results: PageResult[];
  errors: PageError[];
}

export interface CrawlProgress {
  pagesProcessed: number;
  pagesTotal: number;
  pagesFailed: number;
  percentComplete: number;
}

export type CrawlStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';

export interface MapOptions {
  url: string;
  options?: {
    maxPages?: number;
    respectRobotsTxt?: boolean;
    followSitemaps?: boolean;
    includeMetadata?: boolean;
    includeArwDiscovery?: boolean;
  };
}

export interface SiteMap {
  domain: string;
  totalPages: number;
  structure: SiteNode;
  arwDiscovery?: ARWDiscovery;
  metadata?: SiteMetadata;
}

export interface SiteNode {
  url: string;
  title?: string;
  children: SiteNode[];
}

export interface BatchOptions {
  urls: string[];
  formats?: ('markdown' | 'html' | 'text' | 'json')[];
  options?: ScrapeOptions['options'];
}

export interface BatchResult {
  results: (ScrapeResult | { url: string; success: false; error: string })[];
  summary: {
    total: number;
    successful: number;
    failed: number;
  };
}

export interface ARWDiscoveryOptions {
  domain: string;
  refresh?: boolean;
}

export interface ARWDiscovery {
  domain: string;
  llmsTxt?: LLMsTxt;
  robotsTxt?: RobotsTxt;
  sitemaps: Sitemap[];
  structuredData?: StructuredData;
  complianceScore: number;
  recommendations: string[];
  discoveredAt: string;
}

export interface LLMsTxt {
  found: boolean;
  url: string;
  content: string;
  directives: {
    allow: string[];
    disallow: string[];
    crawlDelay?: number;
    summary?: string;
    contact?: string;
    preferredFormats?: string[];
  };
  machineReadableUrls: string[];
}

export interface RobotsTxt {
  found: boolean;
  url: string;
  rules: {
    userAgents: Record<string, {
      allow: string[];
      disallow: string[];
      crawlDelay?: number;
    }>;
    sitemaps: string[];
  };
}

export interface Sitemap {
  url: string;
  type: 'urlset' | 'sitemapindex';
  urlCount: number;
  lastModified?: string;
  urls: SitemapURL[];
}

export interface SitemapURL {
  loc: string;
  lastmod?: string;
  priority?: number;
  changefreq?: string;
}

export interface Metadata {
  title?: string;
  description?: string;
  author?: string;
  publishedDate?: string;
  keywords?: string[];
  language?: string;
  ogImage?: string;
}

export interface Link {
  text: string;
  url: string;
  type: 'internal' | 'external';
}

export interface MachineView {
  sections: Section[];
  structuredData?: StructuredData;
}

export interface Section {
  heading: string;
  content: string;
  level: number;
}

export interface StructuredData {
  schemaOrg?: any[];
  openGraph?: Record<string, string>;
  jsonLd?: any[];
}

export interface PageResult {
  url: string;
  statusCode: number;
  markdown?: string;
  html?: string;
  text?: string;
  metadata: Metadata;
  machineView?: MachineView;
}

export interface PageError {
  url: string;
  error: string;
  timestamp: string;
}

export interface SiteMetadata {
  technologies: string[];
  languages: string[];
  socialLinks?: Record<string, string>;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  credits?: number;
}

/**
 * Custom Errors
 */

export class WebCrawlerError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode?: number,
    public details?: any
  ) {
    super(message);
    this.name = 'WebCrawlerError';
  }
}

export class RateLimitError extends WebCrawlerError {
  constructor(message: string, public retryAfter: number) {
    super(message, 'RATE_LIMIT_EXCEEDED', 429);
    this.name = 'RateLimitError';
  }
}

export class AuthenticationError extends WebCrawlerError {
  constructor(message: string) {
    super(message, 'UNAUTHORIZED', 401);
    this.name = 'AuthenticationError';
  }
}

export class CrawlError extends WebCrawlerError {
  constructor(message: string, public jobId?: string) {
    super(message, 'CRAWL_ERROR', 500);
    this.name = 'CrawlError';
  }
}
```

### Usage Examples

```typescript
import { WebCrawler } from '@webcrawler/sdk';

const crawler = new WebCrawler({
  apiKey: 'wcs_live_...',
  timeout: 60000,
  maxRetries: 3,
});

// Example 1: Simple scrape
const result = await crawler.scrape({
  url: 'https://example.com/article',
  formats: ['markdown', 'json'],
});

console.log(result.markdown);
console.log(result.metadata);

// Example 2: Crawl with real-time updates
const crawl = await crawler.crawl({
  url: 'https://example.com',
  maxPages: 100,
  options: {
    maxDepth: 3,
    includePatterns: ['/blog/*'],
  },
  onProgress: (progress) => {
    console.log(`Progress: ${progress.percentComplete}%`);
  },
  onPageCompleted: (page) => {
    console.log(`Scraped: ${page.url}`);
    // Process page immediately
  },
});

// Wait for completion
await crawl.waitForCompletion();

// Example 3: Stream results
for await (const page of crawl.streamResults()) {
  console.log(page.url, page.markdown);
}

// Example 4: ARW Discovery
const arw = await crawler.discoverARW({ domain: 'example.com' });

if (arw.llmsTxt?.found) {
  console.log('Found llms.txt:', arw.llmsTxt.url);
  console.log('Directives:', arw.llmsTxt.directives);
}

// Example 5: Batch processing
const batch = await crawler.batch({
  urls: [
    'https://example.com/page1',
    'https://example.com/page2',
    'https://example.com/page3',
  ],
  formats: ['markdown'],
});

console.log(`${batch.summary.successful}/${batch.summary.total} successful`);

// Example 6: Error handling
try {
  await crawler.scrape({ url: 'https://invalid-url' });
} catch (error) {
  if (error instanceof RateLimitError) {
    console.log(`Rate limited. Retry after ${error.retryAfter} seconds`);
  } else if (error instanceof AuthenticationError) {
    console.log('Invalid API key');
  } else {
    console.error('Crawl error:', error.message);
  }
}
```

## Python SDK

### Installation

```bash
pip install webcrawler-sdk
```

### Core Structure

```python
# File: webcrawler/__init__.py

from typing import List, Dict, Optional, Callable, AsyncIterator
import asyncio
import aiohttp
import websockets
from dataclasses import dataclass
from enum import Enum

class CrawlStatus(Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"

@dataclass
class WebCrawlerConfig:
    api_key: str
    base_url: str = "https://api.webcrawler.io/v1"
    max_retries: int = 3
    timeout: int = 30
    log_level: str = "info"

class WebCrawler:
    def __init__(self, config: WebCrawlerConfig = None, api_key: str = None):
        if api_key:
            config = WebCrawlerConfig(api_key=api_key)

        self.api_key = config.api_key
        self.base_url = config.base_url
        self.max_retries = config.max_retries
        self.timeout = aiohttp.ClientTimeout(total=config.timeout)

        self.session: Optional[aiohttp.ClientSession] = None

    async def __aenter__(self):
        self.session = aiohttp.ClientSession(
            base_url=self.base_url,
            timeout=self.timeout,
            headers={
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json",
            }
        )
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()

    async def scrape(self, url: str, formats: List[str] = None, **options) -> Dict:
        """Scrape a single page"""
        async with self.session.post("/scrape", json={
            "url": url,
            "formats": formats or ["markdown"],
            "options": options
        }) as response:
            data = await response.json()
            return data["data"]

    async def crawl(
        self,
        url: str,
        max_pages: int = 10,
        formats: List[str] = None,
        on_progress: Callable = None,
        on_page_completed: Callable = None,
        on_page_failed: Callable = None,
        **options
    ) -> 'CrawlJob':
        """Crawl multiple pages"""
        async with self.session.post("/crawl", json={
            "url": url,
            "maxPages": max_pages,
            "formats": formats or ["markdown"],
            "options": options
        }) as response:
            data = await response.json()
            job = CrawlJob(data["data"], self)

            # Start WebSocket if callbacks provided
            if on_progress or on_page_completed or on_page_failed:
                asyncio.create_task(job.connect_websocket(
                    on_progress, on_page_completed, on_page_failed
                ))

            return job

    async def map(self, url: str, **options) -> Dict:
        """Generate site map"""
        async with self.session.post("/map", json={
            "url": url,
            "options": options
        }) as response:
            data = await response.json()
            return data["data"]

    async def batch(self, urls: List[str], formats: List[str] = None, **options) -> Dict:
        """Batch scrape multiple URLs"""
        async with self.session.post("/batch", json={
            "urls": urls,
            "formats": formats or ["markdown"],
            "options": options
        }) as response:
            data = await response.json()
            return data["data"]

    async def discover_arw(self, domain: str, refresh: bool = False) -> Dict:
        """Discover ARW resources"""
        async with self.session.get("/arw/discover", params={
            "domain": domain,
            "refresh": refresh
        }) as response:
            data = await response.json()
            return data["data"]

    async def get_job(self, job_id: str) -> Dict:
        """Get crawl job status"""
        async with self.session.get(f"/crawl/{job_id}") as response:
            data = await response.json()
            return data["data"]

    async def cancel_job(self, job_id: str) -> None:
        """Cancel crawl job"""
        await self.session.delete(f"/crawl/{job_id}")

class CrawlJob:
    def __init__(self, data: Dict, client: WebCrawler):
        self.job_id = data["jobId"]
        self.status = CrawlStatus(data["status"])
        self.client = client
        self.ws = None

    async def wait_for_completion(self) -> Dict:
        """Wait for crawl to complete"""
        while True:
            status = await self.client.get_job(self.job_id)

            if status["status"] == "completed":
                return status
            elif status["status"] in ["failed", "cancelled"]:
                raise CrawlError(f"Crawl {status['status']}")

            await asyncio.sleep(2)

    async def connect_websocket(
        self,
        on_progress: Callable = None,
        on_page_completed: Callable = None,
        on_page_failed: Callable = None
    ):
        """Connect to WebSocket for real-time updates"""
        ws_url = f"wss://api.webcrawler.io/v1/crawl/{self.job_id}/stream"

        async with websockets.connect(
            ws_url,
            extra_headers={"Authorization": f"Bearer {self.client.api_key}"}
        ) as websocket:
            self.ws = websocket

            async for message in websocket:
                data = json.loads(message)

                if data["type"] == "page_completed":
                    if on_page_completed:
                        on_page_completed(data)
                    if on_progress:
                        on_progress(data["progress"])
                elif data["type"] == "page_failed":
                    if on_page_failed:
                        on_page_failed(data)
                elif data["type"] in ["crawl_completed", "crawl_failed"]:
                    break

    async def cancel(self):
        """Cancel this crawl job"""
        await self.client.cancel_job(self.job_id)
        if self.ws:
            await self.ws.close()

    async def get_status(self) -> Dict:
        """Get current status"""
        return await self.client.get_job(self.job_id)

    async def stream_results(self) -> AsyncIterator[Dict]:
        """Stream results as they become available"""
        seen_urls = set()

        while self.status not in [CrawlStatus.COMPLETED, CrawlStatus.FAILED]:
            status = await self.get_status()

            for result in status["results"]:
                if result["url"] not in seen_urls:
                    seen_urls.add(result["url"])
                    yield result

            self.status = CrawlStatus(status["status"])
            await asyncio.sleep(2)
```

### Usage Example

```python
import asyncio
from webcrawler import WebCrawler

async def main():
    async with WebCrawler(api_key="wcs_live_...") as crawler:
        # Simple scrape
        result = await crawler.scrape("https://example.com")
        print(result["markdown"])

        # Crawl with callbacks
        def on_progress(progress):
            print(f"Progress: {progress['percentComplete']}%")

        def on_page_completed(page):
            print(f"Scraped: {page['url']}")

        crawl = await crawler.crawl(
            "https://example.com",
            max_pages=100,
            on_progress=on_progress,
            on_page_completed=on_page_completed
        )

        await crawl.wait_for_completion()

if __name__ == "__main__":
    asyncio.run(main())
```

## Key Features

### 1. Automatic Retries
- Exponential backoff on 5xx errors
- Configurable max retries
- Network error handling

### 2. Rate Limiting
- Client-side rate limiting
- Respect server rate limit headers
- Automatic backoff on 429 errors

### 3. Streaming Support
- WebSocket for real-time updates
- Async generators for large datasets
- Memory-efficient processing

### 4. Type Safety
- Full TypeScript definitions
- Python type hints
- Runtime validation

### 5. Error Handling
- Custom error classes
- Detailed error messages
- Retry logic for transient failures

## Testing Strategy

### Unit Tests
- Mock HTTP client
- Test all methods
- Error handling coverage

### Integration Tests
- Real API calls (test environment)
- End-to-end workflows
- WebSocket connections

### Example Test (TypeScript)
```typescript
import { WebCrawler } from '@webcrawler/sdk';
import nock from 'nock';

describe('WebCrawler', () => {
  it('should scrape a page', async () => {
    nock('https://api.webcrawler.io')
      .post('/v1/scrape')
      .reply(200, {
        success: true,
        data: { url: 'https://example.com', markdown: '# Test' }
      });

    const crawler = new WebCrawler({ apiKey: 'test' });
    const result = await crawler.scrape({ url: 'https://example.com' });

    expect(result.markdown).toBe('# Test');
  });
});
```

---

**Document Version**: 1.0
**Last Updated**: 2025-11-19
**Author**: System Architecture Designer
**Status**: Draft for Review
