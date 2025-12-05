# ARW Crawler API - Introduction

Welcome to the **Agent-Ready Web (ARW) Crawler API** documentation. Our API enables you to crawl websites, extract content, generate machine-readable views, and validate ARW compliance at scale.

## Overview

The ARW Crawler API provides a powerful, developer-friendly interface for:

- **Web Scraping** - Extract content from any webpage with ARW-optimized output
- **Website Crawling** - Discover and map entire websites efficiently
- **ARW Discovery** - Automatically detect and validate ARW implementations
- **Machine Views** - Generate `.llm.md` files optimized for AI agents (85% token reduction)
- **Compliance Validation** - Check ARW specification conformance
- **Batch Processing** - Process multiple URLs concurrently

## Key Features

### 🚀 **Blazing Fast**
- Distributed crawling with intelligent rate limiting
- Concurrent processing of multiple pages
- Smart caching to avoid redundant requests

### 🤖 **AI-Optimized**
- Automatic machine view generation (`.llm.md` format)
- 85% token reduction vs raw HTML
- Semantic chunking with addressable segments
- ARW discovery and policy extraction

### 🔍 **ARW-Native**
- Detects `llms.txt`, `llms.json`, and `.well-known/arw-manifest.json`
- Validates ARW-1, ARW-2, ARW-3, ARW-4 compliance levels
- Extracts chunks, actions, and protocols
- Policy-aware crawling (respects training/inference permissions)

### 📊 **Rich Output Formats**
- **Markdown** - Clean, semantic content
- **HTML** - Full page source
- **JSON** - Structured data
- **ARW Format** - Machine views with chunks

## Quick Start

### 1. Get Your API Key

Sign up at [https://api.arw.dev](https://api.arw.dev) to get your API key:

```bash
export ARW_API_KEY="arw_sk_..."
```

### 2. Make Your First Request

**Scrape a single page:**

```bash
curl -X POST https://api.arw.dev/v1/scrape \
  -H "Authorization: Bearer $ARW_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com",
    "formats": ["markdown", "arw"]
  }'
```

**Response:**

```json
{
  "success": true,
  "data": {
    "url": "https://example.com",
    "title": "Example Domain",
    "markdown": "# Example Domain\n\nThis domain is for use in illustrative examples...",
    "arw": {
      "machineView": "# Example Domain\n\n<!-- chunk: overview -->...",
      "chunks": [
        {
          "id": "overview",
          "heading": "Example Domain",
          "content": "This domain is for use in illustrative examples..."
        }
      ]
    },
    "metadata": {
      "statusCode": 200,
      "contentType": "text/html",
      "responseTime": 245
    }
  }
}
```

### 3. Crawl an Entire Website

```bash
curl -X POST https://api.arw.dev/v1/crawl \
  -H "Authorization: Bearer $ARW_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://docs.example.com",
    "maxDepth": 3,
    "limit": 50,
    "formats": ["markdown"]
  }'
```

### 4. Check ARW Discovery

```bash
curl -X POST https://api.arw.dev/v1/arw/discover \
  -H "Authorization: Bearer $ARW_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com"
  }'
```

**Response:**

```json
{
  "success": true,
  "data": {
    "hasArw": true,
    "complianceLevel": "ARW-2",
    "discovery": {
      "llmsTxt": "https://example.com/llms.txt",
      "llmsJson": "https://example.com/llms.json",
      "wellKnown": "https://example.com/.well-known/arw-manifest.json"
    },
    "features": {
      "machineViews": true,
      "chunks": true,
      "actions": false,
      "protocols": false
    },
    "policies": {
      "training": {
        "allowed": false,
        "note": "Content not licensed for model training"
      },
      "inference": {
        "allowed": true,
        "restrictions": ["attribution_required"]
      }
    }
  }
}
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/v1/scrape` | POST | Scrape a single page |
| `/v1/crawl` | POST | Crawl an entire website |
| `/v1/crawl/{id}` | GET | Get crawl status and results |
| `/v1/map` | POST | Generate site structure map |
| `/v1/batch` | POST | Process multiple URLs |
| `/v1/batch/{id}` | GET | Get batch job status |
| `/v1/arw/discover` | POST | Detect ARW implementation |
| `/v1/arw/validate` | POST | Validate ARW compliance |
| `/v1/arw/inspect` | POST | Full ARW inspection |

## Base URL

```
https://api.arw.dev/v1
```

## Authentication

All API requests require authentication using an API key in the `Authorization` header:

```
Authorization: Bearer arw_sk_your_api_key_here
```

See [Authentication Guide](./authentication.md) for details.

## Rate Limits

| Plan | Rate Limit | Crawl Limit |
|------|------------|-------------|
| Free | 100 requests/hour | 1,000 pages/day |
| Pro | 1,000 requests/hour | 50,000 pages/day |
| Enterprise | Custom | Unlimited |

See [Rate Limits](./rate-limits.md) for details.

## SDKs

Official SDKs available for:

- [Node.js / TypeScript](../sdk/getting-started.md)
- [Python](../sdk/getting-started.md#python)
- [Go](../sdk/getting-started.md#go)
- [Rust](../sdk/getting-started.md#rust)

**Node.js Example:**

```typescript
import { ARWCrawler } from '@arw/crawler-client';

const client = new ARWCrawler({ apiKey: process.env.ARW_API_KEY });

const result = await client.scrape({
  url: 'https://example.com',
  formats: ['markdown', 'arw']
});

console.log(result.markdown);
```

## Next Steps

- [Authentication Setup](./authentication.md)
- [Scrape Endpoint](./endpoints/scrape.md)
- [Crawl Endpoint](./endpoints/crawl.md)
- [ARW Discovery Guide](../guides/arw-discovery.md)
- [SDK Getting Started](../sdk/getting-started.md)

## Support

- **Documentation**: [https://docs.arw.dev](https://docs.arw.dev)
- **GitHub Issues**: [https://github.com/agent-ready-web/agent-ready-web/issues](https://github.com/agent-ready-web/agent-ready-web/issues)
- **Email**: support@arw.dev
- **Discord**: [https://discord.gg/arw](https://discord.gg/arw)

## Status Page

Check API status: [https://status.arw.dev](https://status.arw.dev)
