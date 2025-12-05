# Web Crawler Service - API Specification

## Overview

This document defines the REST API and WebSocket interface for the Web Crawler Service. All endpoints follow RESTful principles and return JSON responses.

## Base URL

```
Production: https://api.webcrawler.io/v1
Staging: https://staging-api.webcrawler.io/v1
Development: http://localhost:8000/v1
```

## Authentication

### API Key Authentication

All API requests require authentication using an API key in the request header:

```http
Authorization: Bearer YOUR_API_KEY
```

**API Key Format**: `wcs_live_1234567890abcdef` (production) or `wcs_test_...` (test mode)

### Rate Limits

Rate limits are enforced per API key based on subscription tier:

| Tier | Requests/Hour | Concurrent Crawls | Max Pages/Crawl |
|------|---------------|-------------------|-----------------|
| Free | 100 | 1 | 10 |
| Pro | 1,000 | 5 | 100 |
| Enterprise | 10,000+ | 20+ | 10,000+ |

**Rate Limit Headers**:
```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 742
X-RateLimit-Reset: 1634567890
```

## API Endpoints

### 1. Single Page Scrape

Extract content from a single URL.

**Endpoint**: `POST /v1/scrape`

**Request Body**:
```json
{
  "url": "https://example.com/page",
  "formats": ["markdown", "html", "text"],
  "options": {
    "waitFor": 2000,
    "includeHtml": true,
    "includeRawHtml": false,
    "screenshot": false,
    "headers": {
      "User-Agent": "Custom Agent"
    },
    "timeout": 30000,
    "removeTags": ["nav", "footer"],
    "onlyMainContent": true
  }
}
```

**Request Parameters**:
- `url` (required, string): Target URL to scrape
- `formats` (optional, array): Output formats - `["markdown", "html", "text", "json"]`
- `options` (optional, object): Scraping options
  - `waitFor` (number): Milliseconds to wait after page load (default: 0)
  - `includeHtml` (boolean): Include cleaned HTML in response (default: true)
  - `includeRawHtml` (boolean): Include original HTML (default: false)
  - `screenshot` (boolean): Capture screenshot (default: false)
  - `headers` (object): Custom HTTP headers
  - `timeout` (number): Request timeout in ms (default: 30000)
  - `removeTags` (array): HTML tags to remove
  - `onlyMainContent` (boolean): Extract only main content (default: true)

**Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "url": "https://example.com/page",
    "statusCode": 200,
    "markdown": "# Page Title\n\nContent...",
    "html": "<article>...</article>",
    "text": "Page Title\n\nContent...",
    "metadata": {
      "title": "Page Title",
      "description": "Page description",
      "author": "John Doe",
      "publishedDate": "2025-11-19",
      "keywords": ["web", "scraping"],
      "language": "en",
      "ogImage": "https://example.com/image.jpg"
    },
    "links": [
      {
        "text": "Related Article",
        "url": "https://example.com/related",
        "type": "internal"
      }
    ],
    "screenshot": "https://cdn.webcrawler.io/screenshots/abc123.png",
    "machineView": {
      "sections": [
        {
          "heading": "Introduction",
          "content": "...",
          "level": 1
        }
      ],
      "structuredData": {
        "@type": "Article",
        "headline": "...",
        "author": "..."
      }
    }
  },
  "credits": 1
}
```

**Error Response**: `400 Bad Request`
```json
{
  "success": false,
  "error": {
    "code": "INVALID_URL",
    "message": "The provided URL is not valid",
    "details": "URL must start with http:// or https://"
  }
}
```

### 2. Multi-Page Crawl

Crawl multiple pages starting from a root URL.

**Endpoint**: `POST /v1/crawl`

**Request Body**:
```json
{
  "url": "https://example.com",
  "maxPages": 100,
  "formats": ["markdown"],
  "options": {
    "crawlStrategy": "breadth-first",
    "maxDepth": 3,
    "allowedDomains": ["example.com", "blog.example.com"],
    "excludePatterns": ["/admin/*", "*.pdf"],
    "includePatterns": ["/blog/*", "/docs/*"],
    "respectRobotsTxt": true,
    "followSitemaps": true,
    "waitForWebSocket": true,
    "timeout": 300000,
    "concurrency": 5,
    "headers": {},
    "onlyMainContent": true
  }
}
```

**Request Parameters**:
- `url` (required, string): Root URL to start crawling
- `maxPages` (optional, number): Maximum pages to crawl (default: 10, max: 10000)
- `formats` (optional, array): Output formats
- `options` (optional, object):
  - `crawlStrategy` (string): `"breadth-first"` or `"depth-first"` (default: breadth-first)
  - `maxDepth` (number): Maximum link depth (default: 3)
  - `allowedDomains` (array): Allowed domains to crawl
  - `excludePatterns` (array): URL patterns to exclude (glob syntax)
  - `includePatterns` (array): URL patterns to include (glob syntax)
  - `respectRobotsTxt` (boolean): Respect robots.txt (default: true)
  - `followSitemaps` (boolean): Follow sitemap.xml (default: true)
  - `waitForWebSocket` (boolean): Keep connection open for real-time updates (default: false)
  - `timeout` (number): Total crawl timeout in ms (default: 300000)
  - `concurrency` (number): Concurrent requests (default: 5, max: 20)
  - `headers` (object): Custom HTTP headers
  - `onlyMainContent` (boolean): Extract only main content (default: true)

**Response**: `202 Accepted`
```json
{
  "success": true,
  "jobId": "crawl_abc123def456",
  "status": "pending",
  "statusUrl": "/v1/crawl/crawl_abc123def456",
  "websocketUrl": "wss://api.webcrawler.io/v1/crawl/crawl_abc123def456/stream",
  "estimatedPages": 50,
  "credits": 50
}
```

### 3. Check Crawl Status

Get the status of a running or completed crawl job.

**Endpoint**: `GET /v1/crawl/{jobId}`

**Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "jobId": "crawl_abc123def456",
    "status": "running",
    "progress": {
      "pagesProcessed": 42,
      "pagesTotal": 100,
      "pagesFailed": 2,
      "percentComplete": 42
    },
    "startedAt": "2025-11-19T10:00:00Z",
    "estimatedCompletionAt": "2025-11-19T10:05:00Z",
    "results": [
      {
        "url": "https://example.com/page1",
        "statusCode": 200,
        "markdown": "...",
        "metadata": {...}
      }
    ],
    "errors": [
      {
        "url": "https://example.com/broken",
        "error": "404 Not Found",
        "timestamp": "2025-11-19T10:02:00Z"
      }
    ]
  }
}
```

**Status Values**:
- `pending`: Job queued, not started
- `running`: Actively crawling
- `completed`: Successfully finished
- `failed`: Job failed with errors
- `cancelled`: User cancelled the job

### 4. Cancel Crawl Job

Cancel a running crawl job.

**Endpoint**: `DELETE /v1/crawl/{jobId}`

**Response**: `200 OK`
```json
{
  "success": true,
  "message": "Crawl job cancelled successfully",
  "data": {
    "jobId": "crawl_abc123def456",
    "status": "cancelled",
    "pagesProcessed": 42,
    "partialResults": true
  }
}
```

### 5. Site Map Generation

Generate a structured map of a website (all URLs, metadata, hierarchy).

**Endpoint**: `POST /v1/map`

**Request Body**:
```json
{
  "url": "https://example.com",
  "options": {
    "maxPages": 1000,
    "respectRobotsTxt": true,
    "followSitemaps": true,
    "includeMetadata": true,
    "includeArwDiscovery": true
  }
}
```

**Request Parameters**:
- `url` (required, string): Root domain to map
- `options` (optional, object):
  - `maxPages` (number): Maximum pages to discover (default: 100)
  - `respectRobotsTxt` (boolean): Respect robots.txt (default: true)
  - `followSitemaps` (boolean): Use sitemap.xml (default: true)
  - `includeMetadata` (boolean): Include page metadata (default: false)
  - `includeArwDiscovery` (boolean): Include ARW discovery results (default: true)

**Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "domain": "example.com",
    "totalPages": 247,
    "structure": {
      "url": "https://example.com",
      "title": "Example Site",
      "children": [
        {
          "url": "https://example.com/about",
          "title": "About Us",
          "children": []
        },
        {
          "url": "https://example.com/blog",
          "title": "Blog",
          "children": [
            {
              "url": "https://example.com/blog/post-1",
              "title": "First Post",
              "children": []
            }
          ]
        }
      ]
    },
    "arwDiscovery": {
      "llmsTxt": {
        "found": true,
        "url": "https://example.com/llms.txt",
        "directives": {
          "allow": ["/blog", "/docs"],
          "disallow": ["/admin"],
          "summary": "Technical blog and documentation"
        }
      },
      "robotsTxt": {
        "found": true,
        "crawlDelay": 1,
        "sitemaps": ["https://example.com/sitemap.xml"]
      },
      "sitemaps": [
        {
          "url": "https://example.com/sitemap.xml",
          "urls": 247,
          "lastModified": "2025-11-15"
        }
      ]
    },
    "metadata": {
      "technologies": ["Next.js", "React", "Tailwind CSS"],
      "languages": ["en"],
      "socialLinks": {
        "twitter": "https://twitter.com/example",
        "github": "https://github.com/example"
      }
    }
  },
  "credits": 1
}
```

### 6. Batch Processing

Process multiple URLs in a single request.

**Endpoint**: `POST /v1/batch`

**Request Body**:
```json
{
  "urls": [
    "https://example.com/page1",
    "https://example.com/page2",
    "https://example.com/page3"
  ],
  "formats": ["markdown"],
  "options": {
    "onlyMainContent": true,
    "concurrency": 3
  }
}
```

**Request Parameters**:
- `urls` (required, array): Array of URLs to scrape (max: 100)
- `formats` (optional, array): Output formats
- `options` (optional, object): Same as `/scrape` options

**Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "results": [
      {
        "url": "https://example.com/page1",
        "success": true,
        "markdown": "...",
        "metadata": {...}
      },
      {
        "url": "https://example.com/page2",
        "success": false,
        "error": "404 Not Found"
      }
    ],
    "summary": {
      "total": 3,
      "successful": 2,
      "failed": 1
    }
  },
  "credits": 3
}
```

### 7. ARW Discovery

Discover Agent-Ready Web resources for a domain.

**Endpoint**: `GET /v1/arw/discover?domain=example.com`

**Query Parameters**:
- `domain` (required, string): Domain to discover (e.g., "example.com")
- `refresh` (optional, boolean): Force fresh discovery (default: false)

**Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "domain": "example.com",
    "llmsTxt": {
      "found": true,
      "url": "https://example.com/llms.txt",
      "content": "# Example Site\n...",
      "directives": {
        "allow": ["/blog/*", "/docs/*"],
        "disallow": ["/admin/*", "/private/*"],
        "crawlDelay": 1,
        "summary": "Technical blog and documentation",
        "contact": "admin@example.com",
        "preferredFormats": ["markdown", "json"]
      },
      "machineReadableUrls": [
        "https://example.com/blog/machine-view",
        "https://example.com/docs/api"
      ]
    },
    "robotsTxt": {
      "found": true,
      "url": "https://example.com/robots.txt",
      "rules": {
        "userAgents": {
          "*": {
            "allow": ["/"],
            "disallow": ["/admin", "/private"]
          },
          "GPTBot": {
            "allow": ["/blog", "/docs"],
            "crawlDelay": 2
          }
        },
        "sitemaps": [
          "https://example.com/sitemap.xml"
        ]
      }
    },
    "sitemaps": [
      {
        "url": "https://example.com/sitemap.xml",
        "type": "urlset",
        "urlCount": 247,
        "lastModified": "2025-11-15T00:00:00Z",
        "urls": [
          {
            "loc": "https://example.com/",
            "lastmod": "2025-11-15",
            "priority": 1.0,
            "changefreq": "daily"
          }
        ]
      }
    ],
    "structuredData": {
      "schemaOrg": [
        {
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "Example Inc",
          "url": "https://example.com"
        }
      ],
      "openGraph": {
        "og:title": "Example Site",
        "og:type": "website",
        "og:url": "https://example.com",
        "og:image": "https://example.com/og-image.jpg"
      },
      "jsonLd": [
        {
          "@type": "WebSite",
          "url": "https://example.com"
        }
      ]
    },
    "complianceScore": 0.92,
    "recommendations": [
      "Add crawl-delay directive for better rate limiting",
      "Include changefreq in sitemap entries"
    ],
    "discoveredAt": "2025-11-19T10:00:00Z"
  },
  "credits": 1
}
```

### 8. Health Check

Check API service health.

**Endpoint**: `GET /v1/health`

**Response**: `200 OK`
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "timestamp": "2025-11-19T10:00:00Z",
  "services": {
    "database": "healthy",
    "cache": "healthy",
    "queue": "healthy"
  }
}
```

## WebSocket API

### Real-Time Crawl Updates

Connect to a crawl job's WebSocket for real-time progress updates.

**WebSocket URL**: `wss://api.webcrawler.io/v1/crawl/{jobId}/stream`

**Connection**:
```javascript
const ws = new WebSocket('wss://api.webcrawler.io/v1/crawl/crawl_abc123/stream', {
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY'
  }
});
```

**Message Types**:

1. **Connection Established**
```json
{
  "type": "connected",
  "jobId": "crawl_abc123",
  "timestamp": "2025-11-19T10:00:00Z"
}
```

2. **Crawl Started**
```json
{
  "type": "crawl_started",
  "jobId": "crawl_abc123",
  "estimatedPages": 50,
  "timestamp": "2025-11-19T10:00:01Z"
}
```

3. **Page Completed**
```json
{
  "type": "page_completed",
  "jobId": "crawl_abc123",
  "url": "https://example.com/page1",
  "statusCode": 200,
  "markdown": "...",
  "metadata": {...},
  "progress": {
    "pagesProcessed": 1,
    "pagesTotal": 50,
    "percentComplete": 2
  },
  "timestamp": "2025-11-19T10:00:05Z"
}
```

4. **Page Failed**
```json
{
  "type": "page_failed",
  "jobId": "crawl_abc123",
  "url": "https://example.com/broken",
  "error": "404 Not Found",
  "timestamp": "2025-11-19T10:00:10Z"
}
```

5. **Crawl Completed**
```json
{
  "type": "crawl_completed",
  "jobId": "crawl_abc123",
  "summary": {
    "pagesProcessed": 48,
    "pagesFailed": 2,
    "duration": 180000,
    "averageTimePerPage": 3750
  },
  "timestamp": "2025-11-19T10:03:00Z"
}
```

6. **Crawl Failed**
```json
{
  "type": "crawl_failed",
  "jobId": "crawl_abc123",
  "error": "Maximum retries exceeded",
  "timestamp": "2025-11-19T10:02:00Z"
}
```

## Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `INVALID_URL` | 400 | URL format is invalid |
| `INVALID_PARAMS` | 400 | Request parameters are invalid |
| `UNAUTHORIZED` | 401 | Invalid or missing API key |
| `RATE_LIMIT_EXCEEDED` | 429 | Rate limit exceeded |
| `INSUFFICIENT_CREDITS` | 402 | Not enough credits |
| `JOB_NOT_FOUND` | 404 | Crawl job not found |
| `TIMEOUT` | 408 | Request timeout |
| `CRAWL_ERROR` | 500 | Internal crawl error |
| `SERVICE_UNAVAILABLE` | 503 | Service temporarily unavailable |

**Error Response Format**:
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Rate limit exceeded. Please try again later.",
    "details": "You have made 1001 requests in the past hour. Limit: 1000/hour.",
    "retryAfter": 3600
  }
}
```

## Pagination

For endpoints returning large lists (e.g., crawl results), use cursor-based pagination:

**Request**:
```http
GET /v1/crawl/crawl_abc123/results?limit=50&cursor=eyJwYWdlIjoxfQ==
```

**Response**:
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "limit": 50,
    "hasMore": true,
    "nextCursor": "eyJwYWdlIjoyfQ==",
    "total": 247
  }
}
```

## Webhooks (Future)

Configure webhooks to receive notifications when crawl jobs complete.

**Endpoint**: `POST /v1/webhooks`

**Request Body**:
```json
{
  "url": "https://yourapp.com/webhook",
  "events": ["crawl.completed", "crawl.failed"],
  "secret": "your_webhook_secret"
}
```

**Webhook Payload**:
```json
{
  "event": "crawl.completed",
  "jobId": "crawl_abc123",
  "data": {...},
  "timestamp": "2025-11-19T10:03:00Z"
}
```

## API Versioning

The API uses URL-based versioning (`/v1/`, `/v2/`). Breaking changes will result in a new version. Non-breaking changes (new fields, new endpoints) will be added to existing versions.

**Deprecation Policy**: Old API versions will be supported for 12 months after a new version is released.

## SDK Usage Examples

### JavaScript/TypeScript

```typescript
import WebCrawler from '@webcrawler/sdk';

const crawler = new WebCrawler({ apiKey: 'wcs_live_...' });

// Single page scrape
const result = await crawler.scrape({
  url: 'https://example.com',
  formats: ['markdown'],
});

// Multi-page crawl with real-time updates
const crawl = await crawler.crawl({
  url: 'https://example.com',
  maxPages: 100,
  onProgress: (progress) => {
    console.log(`${progress.percentComplete}% complete`);
  },
  onPageCompleted: (page) => {
    console.log(`Scraped: ${page.url}`);
  },
});

// ARW discovery
const arw = await crawler.discoverARW({ domain: 'example.com' });
```

### Python

```python
from webcrawler import WebCrawler

crawler = WebCrawler(api_key='wcs_live_...')

# Single page scrape
result = crawler.scrape(
    url='https://example.com',
    formats=['markdown']
)

# Multi-page crawl with callback
def on_page_completed(page):
    print(f"Scraped: {page['url']}")

crawl = crawler.crawl(
    url='https://example.com',
    max_pages=100,
    on_page_completed=on_page_completed
)

# ARW discovery
arw = crawler.discover_arw(domain='example.com')
```

## Testing

**Test API Key**: `wcs_test_1234567890abcdef`

**Test Endpoint**: `https://api.webcrawler.io/v1/test`

The test endpoint provides mock responses for integration testing without consuming credits.

---

**Document Version**: 1.0
**Last Updated**: 2025-11-19
**Author**: System Architecture Designer
**Status**: Draft for Review
