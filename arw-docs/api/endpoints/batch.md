# Batch Endpoint

Process multiple URLs concurrently with a single API request.

## Endpoint

```
POST /v1/batch
GET  /v1/batch/{id}
```

## Overview

The Batch endpoint allows you to:
- Scrape multiple URLs in parallel
- Process up to 1,000 URLs per request
- Track progress with a single job ID
- Receive results for all URLs together

Perfect for:
- Bulk content extraction
- Multi-page documentation processing
- Parallel ARW validation
- Large-scale content migration

## Starting a Batch Job

### POST /v1/batch

Create a new batch processing job.

### Headers

```
Authorization: Bearer arw_sk_your_api_key
Content-Type: application/json
```

### Body Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `urls` | string[] | **Yes** | Array of URLs to process (max: 1,000) |
| `action` | string | **Yes** | Action to perform: `scrape`, `arw-discover`, `arw-validate` |
| `formats` | string[] | No | Output formats (default: `["markdown"]`) |
| `concurrency` | number | No | Parallel requests (default: `10`, max: `50`) |
| `options` | object | No | Action-specific options |
| `webhook` | string | No | Webhook URL for completion notification |
| `failOnError` | boolean | No | Fail entire batch on single error (default: `false`) |

### Action-Specific Options

**For `scrape` action:**

```json
{
  "onlyMainContent": true,
  "includeMetadata": true,
  "timeout": 30000
}
```

**For `arw-discover` action:**

```json
{
  "discoverManifest": true,
  "extractPolicies": true
}
```

**For `arw-validate` action:**

```json
{
  "strictMode": true,
  "checkConsistency": true
}
```

## Examples

### Batch Scraping

```bash
curl -X POST https://api.arw.dev/v1/batch \
  -H "Authorization: Bearer $ARW_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "urls": [
      "https://docs.example.com/getting-started",
      "https://docs.example.com/api/authentication",
      "https://docs.example.com/api/endpoints",
      "https://docs.example.com/deployment"
    ],
    "action": "scrape",
    "formats": ["markdown", "arw"],
    "concurrency": 10
  }'
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "batch_abc123",
    "status": "pending",
    "totalUrls": 4,
    "action": "scrape",
    "createdAt": "2025-01-27T10:00:00Z",
    "estimatedCompletion": "2025-01-27T10:01:00Z"
  }
}
```

### Batch ARW Discovery

```bash
curl -X POST https://api.arw.dev/v1/batch \
  -H "Authorization: Bearer $ARW_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "urls": [
      "https://site1.com",
      "https://site2.com",
      "https://site3.com",
      "https://site4.com",
      "https://site5.com"
    ],
    "action": "arw-discover",
    "options": {
      "discoverManifest": true,
      "extractPolicies": true
    }
  }'
```

### With Webhook Notification

```bash
curl -X POST https://api.arw.dev/v1/batch \
  -H "Authorization: Bearer $ARW_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "urls": [...],
    "action": "scrape",
    "webhook": "https://your-app.com/webhooks/batch-complete"
  }'
```

## Getting Batch Status

### GET /v1/batch/{id}

Retrieve batch job status and results.

```bash
curl -X GET https://api.arw.dev/v1/batch/batch_abc123 \
  -H "Authorization: Bearer $ARW_API_KEY"
```

### Response (In Progress)

```json
{
  "success": true,
  "data": {
    "id": "batch_abc123",
    "status": "in_progress",
    "action": "scrape",
    "progress": {
      "totalUrls": 100,
      "completed": 67,
      "failed": 2,
      "pending": 31,
      "percentComplete": 67
    },
    "createdAt": "2025-01-27T10:00:00Z",
    "startedAt": "2025-01-27T10:00:05Z",
    "estimatedCompletion": "2025-01-27T10:02:30Z"
  }
}
```

### Response (Completed)

```json
{
  "success": true,
  "data": {
    "id": "batch_abc123",
    "status": "completed",
    "action": "scrape",
    "results": {
      "totalUrls": 100,
      "successful": 98,
      "failed": 2,
      "totalTokens": 87560,
      "averageTokensPerUrl": 894,
      "duration": 142
    },
    "urls": [
      {
        "url": "https://docs.example.com/getting-started",
        "status": "success",
        "statusCode": 200,
        "title": "Getting Started",
        "markdown": "# Getting Started\n\nWelcome...",
        "arw": {
          "chunks": 5,
          "tokens": 892,
          "hasMachineView": true
        }
      },
      {
        "url": "https://docs.example.com/api",
        "status": "success",
        "statusCode": 200,
        "title": "API Reference",
        "markdown": "# API Reference\n\nComplete...",
        "arw": {
          "chunks": 8,
          "tokens": 1245,
          "hasMachineView": true
        }
      },
      {
        "url": "https://docs.example.com/nonexistent",
        "status": "failed",
        "error": {
          "code": "PAGE_NOT_FOUND",
          "message": "Page not found",
          "statusCode": 404
        }
      }
    ],
    "createdAt": "2025-01-27T10:00:00Z",
    "completedAt": "2025-01-27T10:02:22Z"
  }
}
```

## Webhook Notifications

### Completion Webhook Payload

```json
{
  "event": "batch.completed",
  "batchId": "batch_abc123",
  "timestamp": "2025-01-27T10:02:22Z",
  "data": {
    "status": "completed",
    "action": "scrape",
    "results": {
      "totalUrls": 100,
      "successful": 98,
      "failed": 2,
      "duration": 142
    },
    "downloadUrl": "https://api.arw.dev/v1/batch/batch_abc123/download"
  }
}
```

### Webhook Events

| Event | Description |
|-------|-------------|
| `batch.started` | Batch processing started |
| `batch.progress` | Progress update (every 25%) |
| `batch.completed` | Batch completed successfully |
| `batch.failed` | Batch failed |

## SDK Examples

### Node.js / TypeScript

```typescript
import { ARWCrawler } from '@arw/crawler-client';

const client = new ARWCrawler({ apiKey: process.env.ARW_API_KEY });

// Prepare URLs
const urls = [
  'https://docs.example.com/getting-started',
  'https://docs.example.com/api/authentication',
  'https://docs.example.com/api/rest',
  'https://docs.example.com/api/graphql',
  'https://docs.example.com/deployment',
  // ... up to 1,000 URLs
];

// Start batch job
const batch = await client.batch({
  urls,
  action: 'scrape',
  formats: ['markdown', 'arw'],
  concurrency: 20,
  options: {
    onlyMainContent: true,
    includeMetadata: true
  }
});

console.log(`Batch started: ${batch.id}`);
console.log(`Total URLs: ${batch.totalUrls}`);

// Wait for completion
const result = await client.waitForBatch(batch.id);

// Process results
console.log(`\n✓ Batch completed in ${result.results.duration}s`);
console.log(`  Successful: ${result.results.successful}`);
console.log(`  Failed: ${result.results.failed}`);
console.log(`  Total tokens: ${result.results.totalTokens}`);

// Access individual results
for (const item of result.urls) {
  if (item.status === 'success') {
    console.log(`\n${item.url}`);
    console.log(`  Title: ${item.title}`);
    console.log(`  Tokens: ${item.arw.tokens}`);
    console.log(`  Chunks: ${item.arw.chunks}`);
  } else {
    console.error(`✗ ${item.url}: ${item.error.message}`);
  }
}

// Export results
await fs.writeFile(
  'batch-results.json',
  JSON.stringify(result.urls, null, 2)
);
```

### Python

```python
from arw_crawler import ARWCrawler
import json

client = ARWCrawler(api_key=os.environ['ARW_API_KEY'])

# Prepare URLs
urls = [
    'https://docs.example.com/getting-started',
    'https://docs.example.com/api/authentication',
    # ... up to 1,000 URLs
]

# Start batch job
batch = client.batch(
    urls=urls,
    action='scrape',
    formats=['markdown', 'arw'],
    concurrency=20,
    options={
        'onlyMainContent': True,
        'includeMetadata': True
    }
)

print(f"Batch started: {batch['id']}")
print(f"Total URLs: {batch['totalUrls']}")

# Wait for completion
result = client.wait_for_batch(batch['id'])

# Process results
print(f"\n✓ Batch completed in {result['results']['duration']}s")
print(f"  Successful: {result['results']['successful']}")
print(f"  Failed: {result['results']['failed']}")

# Export results
with open('batch-results.json', 'w') as f:
    json.dump(result['urls'], f, indent=2)
```

## Use Cases

### 1. Documentation Indexing

```typescript
// Get all documentation URLs
const map = await client.map({ url: 'https://docs.example.com' });

// Extract all page URLs
const urls = map.structure.sections
  .flatMap(section => section.urls);

// Batch process with ARW
const batch = await client.batch({
  urls,
  action: 'scrape',
  formats: ['arw'],
  concurrency: 50
});

const result = await client.waitForBatch(batch.id);

// Build search index
const searchIndex = result.urls
  .filter(item => item.status === 'success')
  .flatMap(page =>
    page.arw.chunks.map(chunk => ({
      url: `${page.url}${chunk.urlFragment}`,
      title: page.title,
      heading: chunk.heading,
      content: chunk.content
    }))
  );
```

### 2. Bulk ARW Compliance Check

```typescript
const sites = [
  'https://site1.com',
  'https://site2.com',
  // ... hundreds of sites
];

const batch = await client.batch({
  urls: sites,
  action: 'arw-discover',
  concurrency: 50
});

const result = await client.waitForBatch(batch.id);

// Generate compliance report
const report = result.urls.map(item => ({
  url: item.url,
  hasArw: item.hasArwImplementation,
  level: item.complianceLevel,
  trainingAllowed: item.policies?.training?.allowed,
  inferenceAllowed: item.policies?.inference?.allowed
}));

console.table(report);
```

### 3. Content Migration

```typescript
// Get URLs from old site
const oldSiteUrls = await getOldSiteUrls();

// Batch extract content
const batch = await client.batch({
  urls: oldSiteUrls,
  action: 'scrape',
  formats: ['arw'],
  concurrency: 30
});

const result = await client.waitForBatch(batch.id);

// Export for new site
for (const page of result.urls) {
  if (page.status === 'success') {
    const filename = page.url
      .replace('https://old.example.com', '')
      .replace(/\//g, '_') + '.md';

    await fs.writeFile(
      `migration/${filename}`,
      page.markdown
    );
  }
}
```

## Rate Limits

| Plan | Concurrent Batches | URLs per Batch | Max Concurrency |
|------|--------------------|--------------------|-----------------|
| Free | 1 | 100 | 10 |
| Pro | 5 | 1,000 | 50 |
| Enterprise | Unlimited | 10,000 | 100 |

## Best Practices

1. **Chunk large batches** - Split > 1,000 URLs into multiple batches
2. **Set appropriate concurrency** - Higher isn't always better
3. **Use webhooks** - For batches > 100 URLs
4. **Handle failures** - Check individual URL status
5. **Monitor progress** - Poll for status on long batches

## Troubleshooting

### Issue: Batch Taking Too Long

**Solutions:**
- Increase `concurrency` (if on Pro/Enterprise)
- Split into smaller batches
- Check individual URL timeouts

### Issue: High Failure Rate

**Check:**
- URL validity
- Site availability
- Rate limiting on target site
- Authentication requirements

### Issue: Memory Issues (SDK)

**Solution:** Use streaming or pagination:

```typescript
// Process in chunks
const chunkSize = 100;
for (let i = 0; i < urls.length; i += chunkSize) {
  const chunk = urls.slice(i, i + chunkSize);
  const batch = await client.batch({ urls: chunk, action: 'scrape' });
  const result = await client.waitForBatch(batch.id);
  await processResults(result);
}
```

## Next Steps

- [Scrape Endpoint](./scrape.md) - Single URL processing
- [Crawl Endpoint](./crawl.md) - Website crawling
- [Best Practices](../../guides/best-practices.md)
- [Performance Optimization](../../guides/performance.md)
