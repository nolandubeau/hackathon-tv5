# Rate Limits

The ARW Crawler API implements rate limiting to ensure fair usage and maintain service quality for all users.

## Rate Limit Tiers

### Free Plan

| Resource | Limit |
|----------|-------|
| API Requests | 100 requests/hour |
| Pages per Day | 1,000 pages |
| Concurrent Crawls | 1 |
| Concurrent Batches | 1 |
| Max Crawl Depth | 3 |
| Max Batch URLs | 100 |
| Max Concurrency | 10 |

### Pro Plan

| Resource | Limit |
|----------|-------|
| API Requests | 1,000 requests/hour |
| Pages per Day | 50,000 pages |
| Concurrent Crawls | 5 |
| Concurrent Batches | 5 |
| Max Crawl Depth | 10 |
| Max Batch URLs | 1,000 |
| Max Concurrency | 50 |

### Enterprise Plan

| Resource | Limit |
|----------|-------|
| API Requests | Custom (unlimited available) |
| Pages per Day | Unlimited |
| Concurrent Crawls | Unlimited |
| Concurrent Batches | Unlimited |
| Max Crawl Depth | Unlimited |
| Max Batch URLs | 10,000 |
| Max Concurrency | 100 |

## Rate Limit Headers

Every API response includes rate limit information in headers:

```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 847
X-RateLimit-Reset: 1706356800
X-RateLimit-Resource: requests
```

### Header Descriptions

| Header | Description |
|--------|-------------|
| `X-RateLimit-Limit` | Maximum requests allowed in the window |
| `X-RateLimit-Remaining` | Requests remaining in current window |
| `X-RateLimit-Reset` | Unix timestamp when the limit resets |
| `X-RateLimit-Resource` | Resource type being limited (`requests`, `pages`, `crawls`) |

## Checking Rate Limits

### Using cURL

```bash
curl -I https://api.arw.dev/v1/scrape \
  -H "Authorization: Bearer $ARW_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com"}'
```

Response headers:
```
HTTP/2 200
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 847
X-RateLimit-Reset: 1706356800
```

### Using SDK

```typescript
import { ARWCrawler } from '@arw/crawler-client';

const client = new ARWCrawler({ apiKey: process.env.ARW_API_KEY });

// Make a request
const result = await client.scrape({
  url: 'https://example.com'
});

// Check rate limit info
console.log('Rate Limit Info:');
console.log(`  Limit: ${result.rateLimit.limit}`);
console.log(`  Remaining: ${result.rateLimit.remaining}`);
console.log(`  Resets at: ${new Date(result.rateLimit.reset * 1000)}`);
```

## Rate Limit Exceeded Response

When you exceed rate limits, the API returns a `429 Too Many Requests` response:

```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Rate limit exceeded",
    "details": "You have exceeded the limit of 100 requests per hour",
    "retryAfter": 3600,
    "resetAt": "2025-01-27T11:00:00Z"
  }
}
```

Headers:
```
HTTP/2 429
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1706356800
Retry-After: 3600
```

## Handling Rate Limits

### Exponential Backoff

Implement exponential backoff to handle rate limits gracefully:

```typescript
async function scrapeWithRetry(url: string, maxRetries = 3) {
  let retries = 0;
  let delay = 1000; // Start with 1 second

  while (retries < maxRetries) {
    try {
      return await client.scrape({ url });
    } catch (error) {
      if (error.code === 'RATE_LIMIT_EXCEEDED' && retries < maxRetries - 1) {
        console.log(`Rate limited. Waiting ${delay}ms before retry ${retries + 1}/${maxRetries}`);
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2; // Exponential backoff
        retries++;
      } else {
        throw error;
      }
    }
  }
}
```

### Using Retry-After Header

```typescript
async function scrapeWithRetryAfter(url: string) {
  try {
    return await client.scrape({ url });
  } catch (error) {
    if (error.code === 'RATE_LIMIT_EXCEEDED') {
      const retryAfter = error.retryAfter * 1000; // Convert to ms
      console.log(`Rate limited. Retrying after ${retryAfter}ms`);
      await new Promise(resolve => setTimeout(resolve, retryAfter));
      return await client.scrape({ url });
    }
    throw error;
  }
}
```

### Monitoring Remaining Requests

```typescript
let requestCount = 0;
const WARNING_THRESHOLD = 0.1; // Warn at 10% remaining

async function monitoredScrape(url: string) {
  const result = await client.scrape({ url });
  requestCount++;

  const percentRemaining = result.rateLimit.remaining / result.rateLimit.limit;

  if (percentRemaining < WARNING_THRESHOLD) {
    console.warn(
      `⚠️ Low rate limit: ${result.rateLimit.remaining}/${result.rateLimit.limit} remaining`
    );
    console.warn(`  Resets at: ${new Date(result.rateLimit.reset * 1000)}`);
  }

  return result;
}
```

## Rate Limiting by Resource

Different resources have separate rate limits:

### 1. API Requests

Applies to all API endpoints.

**Reset:** Hourly (top of each hour)

```
X-RateLimit-Resource: requests
```

### 2. Pages

Total pages crawled/scraped per day.

**Reset:** Daily (00:00 UTC)

```
X-RateLimit-Resource: pages
X-RateLimit-Limit: 50000
X-RateLimit-Remaining: 32145
```

### 3. Concurrent Operations

Maximum concurrent crawls or batch jobs.

```
X-RateLimit-Resource: concurrent-crawls
X-RateLimit-Limit: 5
X-RateLimit-Remaining: 3
```

## Optimizing for Rate Limits

### 1. Use Batch Operations

Instead of multiple scrape requests, use batch:

**❌ Inefficient:**
```typescript
// Uses 100 requests
for (const url of urls) {
  await client.scrape({ url });
}
```

**✅ Efficient:**
```typescript
// Uses 1 request
const batch = await client.batch({
  urls,
  action: 'scrape'
});
```

### 2. Cache Results

```typescript
const cache = new Map();

async function cachedScrape(url: string) {
  if (cache.has(url)) {
    console.log(`Cache hit: ${url}`);
    return cache.get(url);
  }

  const result = await client.scrape({ url });
  cache.set(url, result);
  return result;
}
```

### 3. Use ARW Discovery

ARW-enabled sites provide efficient access:

```typescript
// First, check for ARW implementation
const map = await client.map({
  url: 'https://docs.example.com',
  discoverArw: true
});

if (map.arw.hasImplementation) {
  // Use manifest for efficient crawling
  const crawl = await client.crawl({
    url: map.url,
    arw: {
      discoverFromManifest: true // Much faster!
    }
  });
}
```

### 4. Implement Request Queuing

```typescript
class RateLimitedQueue {
  private queue: Array<() => Promise<any>> = [];
  private processing = false;
  private requestsPerMinute: number;

  constructor(requestsPerMinute: number) {
    this.requestsPerMinute = requestsPerMinute;
  }

  async add<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await fn();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });

      if (!this.processing) {
        this.process();
      }
    });
  }

  private async process() {
    this.processing = true;
    const delay = (60 * 1000) / this.requestsPerMinute;

    while (this.queue.length > 0) {
      const task = this.queue.shift();
      if (task) {
        await task();
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    this.processing = false;
  }
}

// Usage
const queue = new RateLimitedQueue(1000 / 60); // 1000 requests/hour

for (const url of urls) {
  await queue.add(() => client.scrape({ url }));
}
```

## Upgrading Plans

To increase rate limits:

1. **View Current Usage:**
   ```bash
   curl https://api.arw.dev/v1/usage \
     -H "Authorization: Bearer $ARW_API_KEY"
   ```

2. **Upgrade Plan:**
   Visit [https://api.arw.dev/pricing](https://api.arw.dev/pricing)

3. **Enterprise Quotas:**
   Contact sales@arw.dev for custom limits

## Rate Limit Errors

### Common Error Codes

| Code | Description | Solution |
|------|-------------|----------|
| `RATE_LIMIT_EXCEEDED` | Request limit exceeded | Wait for reset or upgrade |
| `PAGE_LIMIT_EXCEEDED` | Daily page limit exceeded | Wait until 00:00 UTC or upgrade |
| `CONCURRENT_LIMIT_EXCEEDED` | Too many concurrent operations | Wait for jobs to complete |
| `QUOTA_EXCEEDED` | Monthly quota exceeded | Upgrade plan |

### Example Error Handling

```typescript
try {
  const result = await client.scrape({ url });
} catch (error) {
  switch (error.code) {
    case 'RATE_LIMIT_EXCEEDED':
      console.log(`Rate limited. Retry after ${error.retryAfter}s`);
      await sleep(error.retryAfter * 1000);
      // Retry...
      break;

    case 'PAGE_LIMIT_EXCEEDED':
      console.log('Daily page limit reached. Retry tomorrow.');
      break;

    case 'CONCURRENT_LIMIT_EXCEEDED':
      console.log('Too many concurrent crawls. Wait for completion.');
      break;

    case 'QUOTA_EXCEEDED':
      console.log('Monthly quota exceeded. Upgrade plan.');
      break;

    default:
      throw error;
  }
}
```

## Fair Use Policy

### ✅ Acceptable Use

- Respect rate limits
- Implement exponential backoff
- Cache results when possible
- Use batch operations for multiple URLs
- Respect target site's robots.txt

### ❌ Prohibited Use

- Rate limit circumvention (multiple API keys)
- Excessive retry attempts without backoff
- Distributed attacks on target sites
- Ignoring 429 responses
- Reselling API access

Violations may result in API key suspension.

## Monitoring

Track your usage in the dashboard:

```
https://api.arw.dev/dashboard/usage
```

Features:
- Real-time request count
- Daily page usage
- Rate limit status
- Historical usage graphs
- Usage alerts

## Best Practices

1. **Monitor Headers:** Check `X-RateLimit-Remaining` before making requests
2. **Implement Backoff:** Use exponential backoff for retries
3. **Use Batch:** Process multiple URLs in single request
4. **Cache Results:** Avoid redundant requests
5. **Upgrade When Needed:** Don't work around limits, upgrade your plan

## Next Steps

- [Error Handling](./errors.md)
- [Best Practices](../guides/best-practices.md)
- [Performance Optimization](../guides/performance.md)
