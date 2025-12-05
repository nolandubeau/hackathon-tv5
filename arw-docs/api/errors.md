# Error Handling

The ARW Crawler API uses conventional HTTP response codes and returns detailed error information in JSON format.

## HTTP Status Codes

| Status Code | Description |
|-------------|-------------|
| `200` OK | Request succeeded |
| `201` Created | Resource created successfully |
| `400` Bad Request | Invalid request parameters |
| `401` Unauthorized | Missing or invalid API key |
| `403` Forbidden | Insufficient permissions |
| `404` Not Found | Resource not found |
| `422` Unprocessable Entity | Valid request but semantic errors |
| `429` Too Many Requests | Rate limit exceeded |
| `500` Internal Server Error | Server error |
| `502` Bad Gateway | Upstream service error |
| `503` Service Unavailable | Temporary service outage |

## Error Response Format

All errors follow this consistent structure:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": "Additional context about the error",
    "field": "parameterName",
    "value": "invalid-value"
  }
}
```

## Error Codes

### Authentication Errors (401)

#### INVALID_API_KEY

```json
{
  "success": false,
  "error": {
    "code": "INVALID_API_KEY",
    "message": "Invalid API key",
    "details": "The provided API key is invalid or has been revoked"
  }
}
```

**Solution:** Verify your API key is correct and hasn't been revoked.

#### MISSING_API_KEY

```json
{
  "success": false,
  "error": {
    "code": "MISSING_API_KEY",
    "message": "API key required",
    "details": "Provide a valid API key in the Authorization header"
  }
}
```

**Solution:** Include `Authorization: Bearer arw_sk_...` header.

### Authorization Errors (403)

#### INSUFFICIENT_PERMISSIONS

```json
{
  "success": false,
  "error": {
    "code": "INSUFFICIENT_PERMISSIONS",
    "message": "Insufficient permissions",
    "details": "This API key does not have 'write' permission"
  }
}
```

**Solution:** Create a new API key with required permissions.

#### PLAN_LIMIT_EXCEEDED

```json
{
  "success": false,
  "error": {
    "code": "PLAN_LIMIT_EXCEEDED",
    "message": "Plan limit exceeded",
    "details": "Your Free plan allows max 3 crawl depth. Upgrade to Pro for depth up to 10"
  }
}
```

**Solution:** Upgrade your plan or adjust parameters.

### Validation Errors (400)

#### INVALID_URL

```json
{
  "success": false,
  "error": {
    "code": "INVALID_URL",
    "message": "Invalid URL",
    "details": "URL must start with http:// or https://",
    "field": "url",
    "value": "example.com"
  }
}
```

**Solution:** Ensure URL includes protocol: `https://example.com`

#### MISSING_REQUIRED_FIELD

```json
{
  "success": false,
  "error": {
    "code": "MISSING_REQUIRED_FIELD",
    "message": "Missing required field",
    "details": "The 'url' field is required",
    "field": "url"
  }
}
```

**Solution:** Include all required fields in request body.

#### INVALID_PARAMETER

```json
{
  "success": false,
  "error": {
    "code": "INVALID_PARAMETER",
    "message": "Invalid parameter value",
    "details": "maxDepth must be between 1 and 10",
    "field": "maxDepth",
    "value": 15
  }
}
```

**Solution:** Adjust parameter to valid range.

#### INVALID_FORMAT

```json
{
  "success": false,
  "error": {
    "code": "INVALID_FORMAT",
    "message": "Invalid format specified",
    "details": "Format 'pdf' is not supported. Supported: markdown, html, arw, json",
    "field": "formats",
    "value": "pdf"
  }
}
```

**Solution:** Use supported format values.

### Resource Errors (404)

#### RESOURCE_NOT_FOUND

```json
{
  "success": false,
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "Resource not found",
    "details": "Crawl 'crawl_abc123' not found"
  }
}
```

**Solution:** Verify the resource ID is correct.

#### PAGE_NOT_FOUND

```json
{
  "success": false,
  "error": {
    "code": "PAGE_NOT_FOUND",
    "message": "Page not found",
    "details": "The requested URL returned 404 status",
    "url": "https://example.com/nonexistent",
    "statusCode": 404
  }
}
```

**Solution:** Verify the URL exists and is accessible.

### Rate Limit Errors (429)

#### RATE_LIMIT_EXCEEDED

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

**Solution:** Wait for rate limit reset or upgrade plan.

### Scraping Errors (422)

#### SCRAPE_FAILED

```json
{
  "success": false,
  "error": {
    "code": "SCRAPE_FAILED",
    "message": "Failed to scrape page",
    "details": "Connection timeout after 30000ms",
    "url": "https://slow-site.com"
  }
}
```

**Solution:** Increase timeout or verify site is accessible.

#### CONTENT_BLOCKED

```json
{
  "success": false,
  "error": {
    "code": "CONTENT_BLOCKED",
    "message": "Content blocked",
    "details": "Site blocks automated access (403 Forbidden)",
    "url": "https://example.com",
    "statusCode": 403
  }
}
```

**Solution:** Site may require authentication or blocks bots.

#### ROBOTS_TXT_DISALLOW

```json
{
  "success": false,
  "error": {
    "code": "ROBOTS_TXT_DISALLOW",
    "message": "Blocked by robots.txt",
    "details": "robots.txt disallows crawling this URL",
    "url": "https://example.com/private"
  }
}
```

**Solution:** Respect robots.txt or set `respectRobotsTxt: false` if you have permission.

### Server Errors (500, 502, 503)

#### INTERNAL_ERROR

```json
{
  "success": false,
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Internal server error",
    "details": "An unexpected error occurred. Please try again or contact support.",
    "requestId": "req_xyz789"
  }
}
```

**Solution:** Retry request. Contact support if persists.

#### SERVICE_UNAVAILABLE

```json
{
  "success": false,
  "error": {
    "code": "SERVICE_UNAVAILABLE",
    "message": "Service temporarily unavailable",
    "details": "The service is undergoing maintenance. Please try again in a few minutes.",
    "retryAfter": 300
  }
}
```

**Solution:** Wait and retry after specified time.

## Error Handling in Code

### Node.js / TypeScript

```typescript
import { ARWCrawler, ARWError } from '@arw/crawler-client';

const client = new ARWCrawler({ apiKey: process.env.ARW_API_KEY });

try {
  const result = await client.scrape({
    url: 'https://example.com'
  });
  console.log(result.markdown);
} catch (error) {
  if (error instanceof ARWError) {
    // Handle specific error codes
    switch (error.code) {
      case 'INVALID_API_KEY':
        console.error('API key is invalid');
        break;

      case 'RATE_LIMIT_EXCEEDED':
        console.log(`Rate limited. Retry after ${error.retryAfter}s`);
        await sleep(error.retryAfter * 1000);
        // Retry request...
        break;

      case 'PAGE_NOT_FOUND':
        console.log(`Page not found: ${error.url}`);
        break;

      case 'SCRAPE_FAILED':
        console.error(`Scrape failed: ${error.details}`);
        break;

      default:
        console.error(`Error: ${error.message}`);
    }
  } else {
    // Network or other errors
    console.error('Unexpected error:', error);
  }
}
```

### Python

```python
from arw_crawler import ARWCrawler, ARWError

client = ARWCrawler(api_key=os.environ['ARW_API_KEY'])

try:
    result = client.scrape(url='https://example.com')
    print(result['markdown'])
except ARWError as error:
    # Handle specific error codes
    if error.code == 'INVALID_API_KEY':
        print('API key is invalid')
    elif error.code == 'RATE_LIMIT_EXCEEDED':
        print(f"Rate limited. Retry after {error.retry_after}s")
        time.sleep(error.retry_after)
        # Retry request...
    elif error.code == 'PAGE_NOT_FOUND':
        print(f"Page not found: {error.url}")
    elif error.code == 'SCRAPE_FAILED':
        print(f"Scrape failed: {error.details}")
    else:
        print(f"Error: {error.message}")
except Exception as error:
    # Network or other errors
    print(f"Unexpected error: {error}")
```

## Retry Strategies

### Exponential Backoff

```typescript
async function scrapeWithRetry(
  url: string,
  maxRetries = 3
): Promise<any> {
  let retries = 0;
  let delay = 1000; // Start with 1s

  while (retries < maxRetries) {
    try {
      return await client.scrape({ url });
    } catch (error) {
      if (shouldRetry(error) && retries < maxRetries - 1) {
        console.log(
          `Retry ${retries + 1}/${maxRetries} after ${delay}ms`
        );
        await sleep(delay);
        delay *= 2; // Exponential backoff
        retries++;
      } else {
        throw error;
      }
    }
  }
}

function shouldRetry(error: ARWError): boolean {
  const retryableCodes = [
    'RATE_LIMIT_EXCEEDED',
    'SERVICE_UNAVAILABLE',
    'INTERNAL_ERROR',
    'SCRAPE_FAILED'
  ];
  return retryableCodes.includes(error.code);
}
```

### With Retry-After Header

```typescript
async function scrapeWithRetryAfter(url: string): Promise<any> {
  try {
    return await client.scrape({ url });
  } catch (error) {
    if (error.retryAfter) {
      console.log(`Retrying after ${error.retryAfter}s`);
      await sleep(error.retryAfter * 1000);
      return await client.scrape({ url });
    }
    throw error;
  }
}
```

### Circuit Breaker

```typescript
class CircuitBreaker {
  private failures = 0;
  private threshold = 5;
  private timeout = 60000; // 1 minute
  private state: 'closed' | 'open' | 'half-open' = 'closed';
  private nextAttempt = 0;

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'open') {
      if (Date.now() < this.nextAttempt) {
        throw new Error('Circuit breaker is open');
      }
      this.state = 'half-open';
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess() {
    this.failures = 0;
    this.state = 'closed';
  }

  private onFailure() {
    this.failures++;
    if (this.failures >= this.threshold) {
      this.state = 'open';
      this.nextAttempt = Date.now() + this.timeout;
    }
  }
}

// Usage
const breaker = new CircuitBreaker();

try {
  const result = await breaker.execute(() =>
    client.scrape({ url: 'https://example.com' })
  );
} catch (error) {
  console.error('Request failed or circuit is open');
}
```

## Error Logging

### Structured Logging

```typescript
import winston from 'winston';

const logger = winston.createLogger({
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

try {
  const result = await client.scrape({ url });
} catch (error) {
  logger.error('Scrape failed', {
    errorCode: error.code,
    errorMessage: error.message,
    url: url,
    timestamp: new Date().toISOString(),
    requestId: error.requestId
  });
}
```

### Error Monitoring

```typescript
// Using Sentry
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: 'your-sentry-dsn'
});

try {
  const result = await client.scrape({ url });
} catch (error) {
  Sentry.captureException(error, {
    tags: {
      errorCode: error.code,
      url: url
    },
    extra: {
      details: error.details,
      requestId: error.requestId
    }
  });
}
```

## Best Practices

1. **Always Handle Errors:** Never ignore errors
2. **Use Specific Error Codes:** Handle specific codes differently
3. **Implement Retry Logic:** Use exponential backoff for transient errors
4. **Log Errors:** Include context and request IDs
5. **Monitor Error Rates:** Track error patterns
6. **Respect Retry-After:** Use the provided retry delay
7. **Graceful Degradation:** Provide fallbacks when possible

## Common Issues

### Issue: Frequent Timeouts

**Causes:**
- Target site is slow
- Network issues
- Default timeout too short

**Solutions:**
```typescript
// Increase timeout
await client.scrape({
  url: 'https://slow-site.com',
  timeout: 60000 // 60 seconds
});
```

### Issue: 403 Forbidden Errors

**Causes:**
- Site blocks automated access
- Missing authentication
- Aggressive bot protection

**Solutions:**
```typescript
// Custom User-Agent
await client.scrape({
  url: 'https://example.com',
  headers: {
    'User-Agent': 'Mozilla/5.0 (compatible; YourBot/1.0)'
  }
});
```

### Issue: robots.txt Blocking

**Check robots.txt:**
```bash
curl https://example.com/robots.txt
```

**Override (if you have permission):**
```typescript
await client.crawl({
  url: 'https://example.com',
  respectRobotsTxt: false
});
```

## Support

If you encounter persistent errors:

1. **Check Status:** [https://status.arw.dev](https://status.arw.dev)
2. **Search Docs:** [https://docs.arw.dev](https://docs.arw.dev)
3. **GitHub Issues:** [https://github.com/agent-ready-web/agent-ready-web/issues](https://github.com/agent-ready-web/agent-ready-web/issues)
4. **Email Support:** support@arw.dev
5. **Include Request ID:** Found in error response

## Next Steps

- [Rate Limits](./rate-limits.md)
- [Best Practices](../guides/best-practices.md)
- [SDK Documentation](../sdk/getting-started.md)
