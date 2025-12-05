# Scrape Endpoint

Extract content from a single webpage with ARW-optimized output.

## Endpoint

```
POST /v1/scrape
```

## Request

### Headers

```
Authorization: Bearer arw_sk_your_api_key
Content-Type: application/json
```

### Body Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `url` | string | **Yes** | The URL to scrape |
| `formats` | string[] | No | Output formats: `markdown`, `html`, `arw`, `json` (default: `["markdown"]`) |
| `onlyMainContent` | boolean | No | Extract only main content, exclude navigation/footer (default: `true`) |
| `includeMetadata` | boolean | No | Include page metadata (default: `true`) |
| `waitFor` | number | No | Wait time in milliseconds before scraping (default: `0`) |
| `timeout` | number | No | Request timeout in milliseconds (default: `30000`) |
| `headers` | object | No | Custom HTTP headers to send |
| `arw` | object | No | ARW-specific options (see below) |

### ARW Options

| Parameter | Type | Description |
|-----------|------|-------------|
| `discoverManifest` | boolean | Attempt to find and parse ARW manifest (default: `true`) |
| `generateChunks` | boolean | Generate semantic chunks (default: `true`) |
| `chunkSize` | number | Target chunk size in tokens (default: `500`) |
| `extractPolicies` | boolean | Extract usage policies (default: `true`) |

## Examples

### Basic Scraping

```bash
curl -X POST https://api.arw.dev/v1/scrape \
  -H "Authorization: Bearer $ARW_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://docs.example.com/getting-started"
  }'
```

### Multiple Formats

```bash
curl -X POST https://api.arw.dev/v1/scrape \
  -H "Authorization: Bearer $ARW_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com",
    "formats": ["markdown", "html", "arw"]
  }'
```

### ARW-Optimized Scraping

```bash
curl -X POST https://api.arw.dev/v1/scrape \
  -H "Authorization: Bearer $ARW_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://docs.example.com/api",
    "formats": ["arw"],
    "arw": {
      "discoverManifest": true,
      "generateChunks": true,
      "chunkSize": 500,
      "extractPolicies": true
    }
  }'
```

### Custom Headers and Timeout

```bash
curl -X POST https://api.arw.dev/v1/scrape \
  -H "Authorization: Bearer $ARW_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://api.example.com/docs",
    "timeout": 60000,
    "headers": {
      "User-Agent": "MyBot/1.0",
      "Accept-Language": "en-US"
    }
  }'
```

## Response

### Success Response (200 OK)

```json
{
  "success": true,
  "data": {
    "url": "https://docs.example.com/getting-started",
    "statusCode": 200,
    "title": "Getting Started | Example Docs",
    "description": "Learn how to get started with Example",
    "markdown": "# Getting Started\n\nWelcome to Example! This guide will help you...",
    "html": "<html><head><title>Getting Started</title></head>...",
    "arw": {
      "machineView": "# Getting Started\n\n<!-- chunk: intro -->\n\n## Introduction\n...",
      "chunks": [
        {
          "id": "intro",
          "heading": "Introduction",
          "content": "Welcome to Example! This guide will help you...",
          "urlFragment": "#intro",
          "tokens": 245
        },
        {
          "id": "installation",
          "heading": "Installation",
          "content": "Install Example using npm:\n\n```bash\nnpm install example\n```",
          "urlFragment": "#installation",
          "tokens": 156
        }
      ],
      "hasArwManifest": true,
      "manifestUrl": "https://docs.example.com/llms.txt",
      "complianceLevel": "ARW-2",
      "policies": {
        "training": {
          "allowed": false
        },
        "inference": {
          "allowed": true,
          "restrictions": ["attribution_required"]
        }
      }
    },
    "metadata": {
      "author": "Example Team",
      "publishedDate": "2025-01-15",
      "modifiedDate": "2025-01-27",
      "language": "en",
      "contentType": "text/html; charset=utf-8",
      "responseTime": 342,
      "finalUrl": "https://docs.example.com/getting-started",
      "canonicalUrl": "https://docs.example.com/getting-started"
    },
    "links": {
      "internal": 15,
      "external": 3,
      "total": 18
    },
    "images": [
      {
        "url": "https://docs.example.com/images/hero.png",
        "alt": "Example Dashboard",
        "width": 1200,
        "height": 600
      }
    ]
  }
}
```

### Error Response (400 Bad Request)

```json
{
  "success": false,
  "error": {
    "code": "INVALID_URL",
    "message": "Invalid URL provided",
    "details": "URL must start with http:// or https://"
  }
}
```

### Error Response (404 Not Found)

```json
{
  "success": false,
  "error": {
    "code": "PAGE_NOT_FOUND",
    "message": "Page not found",
    "details": "The requested URL returned 404 status"
  }
}
```

### Error Response (500 Scrape Failed)

```json
{
  "success": false,
  "error": {
    "code": "SCRAPE_FAILED",
    "message": "Failed to scrape the page",
    "details": "Connection timeout after 30000ms"
  }
}
```

## SDK Examples

### Node.js / TypeScript

```typescript
import { ARWCrawler } from '@arw/crawler-client';

const client = new ARWCrawler({ apiKey: process.env.ARW_API_KEY });

// Basic scraping
const result = await client.scrape({
  url: 'https://docs.example.com/getting-started'
});

console.log(result.markdown);
console.log(`Title: ${result.title}`);
console.log(`Response time: ${result.metadata.responseTime}ms`);

// ARW-optimized scraping
const arwResult = await client.scrape({
  url: 'https://docs.example.com/api',
  formats: ['arw'],
  arw: {
    discoverManifest: true,
    generateChunks: true,
    chunkSize: 500
  }
});

// Access chunks
for (const chunk of arwResult.arw.chunks) {
  console.log(`Chunk: ${chunk.heading}`);
  console.log(`Tokens: ${chunk.tokens}`);
  console.log(`Content: ${chunk.content}\n`);
}

// Check ARW compliance
if (arwResult.arw.hasArwManifest) {
  console.log(`✓ ARW ${arwResult.arw.complianceLevel} compliant`);
  console.log(`Manifest: ${arwResult.arw.manifestUrl}`);
}
```

### Python

```python
from arw_crawler import ARWCrawler

client = ARWCrawler(api_key=os.environ['ARW_API_KEY'])

# Basic scraping
result = client.scrape(
    url='https://docs.example.com/getting-started'
)

print(result['markdown'])
print(f"Title: {result['title']}")
print(f"Response time: {result['metadata']['responseTime']}ms")

# ARW-optimized scraping
arw_result = client.scrape(
    url='https://docs.example.com/api',
    formats=['arw'],
    arw={
        'discoverManifest': True,
        'generateChunks': True,
        'chunkSize': 500
    }
)

# Access chunks
for chunk in arw_result['arw']['chunks']:
    print(f"Chunk: {chunk['heading']}")
    print(f"Tokens: {chunk['tokens']}")
    print(f"Content: {chunk['content']}\n")

# Check ARW compliance
if arw_result['arw']['hasArwManifest']:
    print(f"✓ ARW {arw_result['arw']['complianceLevel']} compliant")
    print(f"Manifest: {arw_result['arw']['manifestUrl']}")
```

### cURL with jq

```bash
# Scrape and extract markdown
curl -s -X POST https://api.arw.dev/v1/scrape \
  -H "Authorization: Bearer $ARW_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://docs.example.com"}' \
  | jq -r '.data.markdown'

# Get chunks
curl -s -X POST https://api.arw.dev/v1/scrape \
  -H "Authorization: Bearer $ARW_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://docs.example.com",
    "formats": ["arw"]
  }' | jq '.data.arw.chunks[]'

# Check ARW compliance
curl -s -X POST https://api.arw.dev/v1/scrape \
  -H "Authorization: Bearer $ARW_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://docs.example.com",
    "formats": ["arw"]
  }' | jq '{
    hasArw: .data.arw.hasArwManifest,
    level: .data.arw.complianceLevel,
    manifest: .data.arw.manifestUrl
  }'
```

## Use Cases

### 1. Content Extraction for LLMs

Extract clean, semantic content optimized for LLM processing:

```typescript
const result = await client.scrape({
  url: 'https://blog.example.com/post',
  formats: ['arw'],
  onlyMainContent: true,
  arw: {
    generateChunks: true,
    chunkSize: 500
  }
});

// Feed to LLM
const context = result.arw.chunks
  .map(c => c.content)
  .join('\n\n');
```

### 2. Documentation Indexing

Build a searchable documentation index:

```typescript
const docs = [
  'https://docs.example.com/getting-started',
  'https://docs.example.com/api',
  'https://docs.example.com/deployment'
];

const index = [];

for (const url of docs) {
  const result = await client.scrape({
    url,
    formats: ['arw'],
    arw: { generateChunks: true }
  });

  for (const chunk of result.arw.chunks) {
    index.push({
      url: result.url,
      chunkId: chunk.id,
      heading: chunk.heading,
      content: chunk.content,
      urlFragment: chunk.urlFragment
    });
  }
}
```

### 3. ARW Compliance Monitoring

Monitor sites for ARW compliance:

```typescript
const sites = [
  'https://site1.com',
  'https://site2.com',
  'https://site3.com'
];

for (const url of sites) {
  const result = await client.scrape({
    url,
    formats: ['arw'],
    arw: { discoverManifest: true, extractPolicies: true }
  });

  console.log(`${url}:`);
  console.log(`  ARW: ${result.arw.hasArwManifest ? '✓' : '✗'}`);
  console.log(`  Level: ${result.arw.complianceLevel || 'N/A'}`);
  console.log(`  Training: ${result.arw.policies?.training?.allowed ? 'Allowed' : 'Not allowed'}`);
}
```

## Rate Limits

| Plan | Requests/Hour | Pages/Day |
|------|---------------|-----------|
| Free | 100 | 1,000 |
| Pro | 1,000 | 50,000 |
| Enterprise | Custom | Unlimited |

See [Rate Limits](../rate-limits.md) for details.

## Best Practices

1. **Use `onlyMainContent: true`** - Excludes navigation, footer, ads
2. **Enable chunk generation** - Better for LLM processing
3. **Check `hasArwManifest`** - Prefer native ARW sites
4. **Handle errors gracefully** - Implement retry with exponential backoff
5. **Respect policies** - Check `arw.policies` before using content

## Troubleshooting

### Issue: Timeout Errors

**Solution:** Increase `timeout` parameter:

```json
{
  "url": "https://slow-site.com",
  "timeout": 60000
}
```

### Issue: Missing Content

**Solution:** Add `waitFor` delay for JavaScript-rendered content:

```json
{
  "url": "https://spa.example.com",
  "waitFor": 2000
}
```

### Issue: Blocked by Website

**Solution:** Use custom `User-Agent` header:

```json
{
  "url": "https://example.com",
  "headers": {
    "User-Agent": "Mozilla/5.0 (compatible; ARWBot/1.0)"
  }
}
```

## Next Steps

- [Crawl Endpoint](./crawl.md) - Crawl entire websites
- [Batch Endpoint](./batch.md) - Process multiple URLs
- [ARW Discovery Guide](../../guides/arw-discovery.md)
- [Error Handling](../errors.md)
