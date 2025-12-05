# Crawl Endpoint

Crawl an entire website and extract content from multiple pages with intelligent discovery and rate limiting.

## Endpoint

```
POST /v1/crawl
GET  /v1/crawl/{id}
```

## Starting a Crawl

### POST /v1/crawl

Start a new crawl job.

### Headers

```
Authorization: Bearer arw_sk_your_api_key
Content-Type: application/json
```

### Body Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `url` | string | **Yes** | Starting URL for the crawl |
| `maxDepth` | number | No | Maximum crawl depth (default: `3`, max: `10`) |
| `limit` | number | No | Maximum pages to crawl (default: `50`, max: `10000`) |
| `formats` | string[] | No | Output formats: `markdown`, `html`, `arw` (default: `["markdown"]`) |
| `includePaths` | string[] | No | URL patterns to include (glob patterns) |
| `excludePaths` | string[] | No | URL patterns to exclude (glob patterns) |
| `sameDomain` | boolean | No | Only crawl same domain (default: `true`) |
| `respectRobotsTxt` | boolean | No | Respect robots.txt rules (default: `true`) |
| `maxConcurrency` | number | No | Concurrent page requests (default: `5`, max: `20`) |
| `crawlDelay` | number | No | Delay between requests in ms (default: `1000`) |
| `webhook` | string | No | Webhook URL for progress updates |
| `arw` | object | No | ARW-specific options |

### ARW Options

| Parameter | Type | Description |
|-----------|------|-------------|
| `discoverFromManifest` | boolean | Use ARW manifest to guide crawl (default: `true`) |
| `generateChunks` | boolean | Generate semantic chunks for each page (default: `true`) |
| `extractActions` | boolean | Extract ARW actions (default: `false`) |
| `validateCompliance` | boolean | Check ARW compliance levels (default: `true`) |

## Examples

### Basic Website Crawl

```bash
curl -X POST https://api.arw.dev/v1/crawl \
  -H "Authorization: Bearer $ARW_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://docs.example.com",
    "maxDepth": 3,
    "limit": 100
  }'
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "crawl_abc123",
    "status": "pending",
    "url": "https://docs.example.com",
    "createdAt": "2025-01-27T10:00:00Z",
    "estimatedCompletion": "2025-01-27T10:05:00Z",
    "settings": {
      "maxDepth": 3,
      "limit": 100,
      "formats": ["markdown"]
    }
  }
}
```

### ARW-Optimized Crawl

```bash
curl -X POST https://api.arw.dev/v1/crawl \
  -H "Authorization: Bearer $ARW_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://docs.example.com",
    "maxDepth": 5,
    "limit": 500,
    "formats": ["arw"],
    "arw": {
      "discoverFromManifest": true,
      "generateChunks": true,
      "extractActions": true,
      "validateCompliance": true
    }
  }'
```

### Filtered Crawl

```bash
curl -X POST https://api.arw.dev/v1/crawl \
  -H "Authorization: Bearer $ARW_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com",
    "maxDepth": 3,
    "limit": 200,
    "includePaths": [
      "/docs/**",
      "/api/**",
      "/guides/**"
    ],
    "excludePaths": [
      "**/*.pdf",
      "/admin/**",
      "/private/**"
    ]
  }'
```

### With Webhook Notifications

```bash
curl -X POST https://api.arw.dev/v1/crawl \
  -H "Authorization: Bearer $ARW_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://docs.example.com",
    "maxDepth": 3,
    "limit": 100,
    "webhook": "https://your-app.com/webhooks/crawl-progress"
  }'
```

## Getting Crawl Status

### GET /v1/crawl/{id}

Retrieve crawl status and results.

```bash
curl -X GET https://api.arw.dev/v1/crawl/crawl_abc123 \
  -H "Authorization: Bearer $ARW_API_KEY"
```

### Response (In Progress)

```json
{
  "success": true,
  "data": {
    "id": "crawl_abc123",
    "status": "in_progress",
    "url": "https://docs.example.com",
    "progress": {
      "pagesDiscovered": 156,
      "pagesCrawled": 87,
      "pagesQueued": 69,
      "pagesFailed": 0,
      "percentComplete": 56
    },
    "createdAt": "2025-01-27T10:00:00Z",
    "startedAt": "2025-01-27T10:00:05Z",
    "estimatedCompletion": "2025-01-27T10:05:30Z"
  }
}
```

### Response (Completed)

```json
{
  "success": true,
  "data": {
    "id": "crawl_abc123",
    "status": "completed",
    "url": "https://docs.example.com",
    "results": {
      "totalPages": 156,
      "successfulPages": 154,
      "failedPages": 2,
      "totalTokens": 125340,
      "averageTokensPerPage": 814,
      "crawlDuration": 342
    },
    "arw": {
      "hasArwImplementation": true,
      "complianceLevel": "ARW-2",
      "manifestUrl": "https://docs.example.com/llms.txt",
      "machineViews": 154,
      "chunks": 687,
      "actions": 0
    },
    "pages": [
      {
        "url": "https://docs.example.com/getting-started",
        "title": "Getting Started",
        "statusCode": 200,
        "markdown": "# Getting Started\n\nWelcome to...",
        "arw": {
          "chunks": 5,
          "tokens": 892,
          "hasMachineView": true
        },
        "depth": 1
      },
      {
        "url": "https://docs.example.com/api/reference",
        "title": "API Reference",
        "statusCode": 200,
        "markdown": "# API Reference\n\nComplete API...",
        "arw": {
          "chunks": 8,
          "tokens": 1245,
          "hasMachineView": true
        },
        "depth": 2
      }
    ],
    "sitemap": {
      "structure": {
        "depth": 3,
        "breadth": 52,
        "sections": [
          {
            "name": "Getting Started",
            "pages": 12
          },
          {
            "name": "API Reference",
            "pages": 67
          },
          {
            "name": "Guides",
            "pages": 45
          }
        ]
      }
    },
    "createdAt": "2025-01-27T10:00:00Z",
    "completedAt": "2025-01-27T10:05:42Z"
  }
}
```

## Webhook Notifications

Receive real-time updates during crawl:

### Webhook Payload Structure

```json
{
  "event": "crawl.progress",
  "crawlId": "crawl_abc123",
  "timestamp": "2025-01-27T10:02:30Z",
  "data": {
    "status": "in_progress",
    "progress": {
      "pagesDiscovered": 156,
      "pagesCrawled": 87,
      "percentComplete": 56
    }
  }
}
```

### Webhook Events

| Event | Description |
|-------|-------------|
| `crawl.started` | Crawl has begun |
| `crawl.progress` | Progress update (every 10% or 1 minute) |
| `crawl.completed` | Crawl finished successfully |
| `crawl.failed` | Crawl failed with errors |
| `crawl.page_discovered` | New page found |
| `crawl.page_completed` | Page successfully crawled |
| `crawl.page_failed` | Page crawl failed |

### Example Webhook Handler (Node.js)

```typescript
import express from 'express';

const app = express();
app.use(express.json());

app.post('/webhooks/crawl-progress', (req, res) => {
  const { event, crawlId, data } = req.body;

  switch (event) {
    case 'crawl.started':
      console.log(`Crawl ${crawlId} started`);
      break;

    case 'crawl.progress':
      console.log(`Crawl ${crawlId}: ${data.progress.percentComplete}% complete`);
      break;

    case 'crawl.completed':
      console.log(`Crawl ${crawlId} completed with ${data.totalPages} pages`);
      // Process results...
      break;

    case 'crawl.failed':
      console.error(`Crawl ${crawlId} failed:`, data.error);
      break;
  }

  res.status(200).send('OK');
});

app.listen(3000);
```

## SDK Examples

### Node.js / TypeScript

```typescript
import { ARWCrawler } from '@arw/crawler-client';

const client = new ARWCrawler({ apiKey: process.env.ARW_API_KEY });

// Start crawl
const crawl = await client.crawl({
  url: 'https://docs.example.com',
  maxDepth: 3,
  limit: 100,
  formats: ['markdown', 'arw'],
  arw: {
    discoverFromManifest: true,
    generateChunks: true
  }
});

console.log(`Crawl started: ${crawl.id}`);
console.log(`Status: ${crawl.status}`);

// Poll for completion
let result;
do {
  await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5s
  result = await client.getCrawl(crawl.id);
  console.log(`Progress: ${result.progress.percentComplete}%`);
} while (result.status === 'in_progress');

// Process results
if (result.status === 'completed') {
  console.log(`✓ Crawled ${result.results.successfulPages} pages`);
  console.log(`✓ Total tokens: ${result.results.totalTokens}`);

  // Access pages
  for (const page of result.pages) {
    console.log(`\n${page.url}`);
    console.log(`  Title: ${page.title}`);
    console.log(`  Chunks: ${page.arw.chunks}`);
    console.log(`  Tokens: ${page.arw.tokens}`);
  }

  // Check ARW compliance
  if (result.arw.hasArwImplementation) {
    console.log(`\n✓ ARW ${result.arw.complianceLevel} implementation found`);
    console.log(`  Machine views: ${result.arw.machineViews}`);
    console.log(`  Chunks: ${result.arw.chunks}`);
  }
}
```

### Python

```python
from arw_crawler import ARWCrawler
import time

client = ARWCrawler(api_key=os.environ['ARW_API_KEY'])

# Start crawl
crawl = client.crawl(
    url='https://docs.example.com',
    max_depth=3,
    limit=100,
    formats=['markdown', 'arw'],
    arw={
        'discoverFromManifest': True,
        'generateChunks': True
    }
)

print(f"Crawl started: {crawl['id']}")
print(f"Status: {crawl['status']}")

# Poll for completion
while True:
    time.sleep(5)
    result = client.get_crawl(crawl['id'])
    print(f"Progress: {result['progress']['percentComplete']}%")

    if result['status'] in ['completed', 'failed']:
        break

# Process results
if result['status'] == 'completed':
    print(f"✓ Crawled {result['results']['successfulPages']} pages")
    print(f"✓ Total tokens: {result['results']['totalTokens']}")

    # Access pages
    for page in result['pages']:
        print(f"\n{page['url']}")
        print(f"  Title: {page['title']}")
        print(f"  Chunks: {page['arw']['chunks']}")
        print(f"  Tokens: {page['arw']['tokens']}")

    # Check ARW compliance
    if result['arw']['hasArwImplementation']:
        print(f"\n✓ ARW {result['arw']['complianceLevel']} implementation found")
        print(f"  Machine views: {result['arw']['machineViews']}")
        print(f"  Chunks: {result['arw']['chunks']}")
```

## Use Cases

### 1. Documentation Indexing

```typescript
const crawl = await client.crawl({
  url: 'https://docs.example.com',
  maxDepth: 5,
  limit: 1000,
  formats: ['arw'],
  includePaths: ['/docs/**', '/api/**'],
  arw: {
    generateChunks: true,
    discoverFromManifest: true
  }
});

// Wait for completion...
const result = await client.waitForCrawl(crawl.id);

// Build search index
const searchIndex = result.pages.flatMap(page =>
  page.arw.chunks.map(chunk => ({
    url: `${page.url}${chunk.urlFragment}`,
    title: page.title,
    heading: chunk.heading,
    content: chunk.content,
    tokens: chunk.tokens
  }))
);
```

### 2. ARW Compliance Audit

```typescript
const sites = [
  'https://site1.com',
  'https://site2.com',
  'https://site3.com'
];

const audits = [];

for (const url of sites) {
  const crawl = await client.crawl({
    url,
    maxDepth: 2,
    limit: 50,
    arw: {
      discoverFromManifest: true,
      validateCompliance: true
    }
  });

  const result = await client.waitForCrawl(crawl.id);

  audits.push({
    url,
    hasArw: result.arw.hasArwImplementation,
    level: result.arw.complianceLevel,
    machineViews: result.arw.machineViews,
    chunks: result.arw.chunks,
    totalPages: result.results.totalPages
  });
}

console.table(audits);
```

### 3. Content Migration

```typescript
// Crawl old site
const oldSite = await client.crawl({
  url: 'https://old.example.com',
  maxDepth: 5,
  limit: 500,
  formats: ['arw']
});

const result = await client.waitForCrawl(oldSite.id);

// Export content for migration
for (const page of result.pages) {
  const filename = page.url
    .replace('https://old.example.com', '')
    .replace(/\//g, '_') + '.md';

  await fs.writeFile(
    `migration/${filename}`,
    page.markdown
  );
}
```

## Rate Limits

| Plan | Concurrent Crawls | Pages/Day | Max Depth |
|------|-------------------|-----------|-----------|
| Free | 1 | 1,000 | 3 |
| Pro | 5 | 50,000 | 10 |
| Enterprise | Unlimited | Unlimited | Unlimited |

## Best Practices

1. **Use ARW manifest discovery** - Much faster than blind crawling
2. **Set appropriate limits** - Start small, increase as needed
3. **Filter paths** - Use `includePaths`/`excludePaths` to focus crawl
4. **Respect robots.txt** - Keep `respectRobotsTxt: true`
5. **Use webhooks** - For long-running crawls
6. **Monitor progress** - Poll `/v1/crawl/{id}` for status

## Troubleshooting

### Issue: Crawl Taking Too Long

**Solutions:**
- Reduce `maxDepth` or `limit`
- Increase `maxConcurrency` (Pro/Enterprise)
- Use `includePaths` to filter URLs
- Enable `arw.discoverFromManifest` for faster discovery

### Issue: Missing Pages

**Solutions:**
- Increase `maxDepth`
- Check `excludePaths` patterns
- Verify `sameDomain` setting
- Review `respectRobotsTxt` if needed

### Issue: High Token Count

**Solutions:**
- Enable `onlyMainContent: true`
- Use `formats: ['arw']` instead of HTML
- Reduce `limit`
- Filter paths more aggressively

## Next Steps

- [Map Endpoint](./map.md) - Site structure mapping
- [Batch Endpoint](./batch.md) - Multiple URL processing
- [ARW Discovery Guide](../../guides/arw-discovery.md)
- [Best Practices](../../guides/best-practices.md)
