# Authentication

The ARW Crawler API uses API keys for authentication. All requests must include a valid API key in the `Authorization` header.

## Getting Your API Key

1. **Sign Up** - Create an account at [https://api.arw.dev/signup](https://api.arw.dev/signup)
2. **Generate Key** - Navigate to your dashboard and click "Create API Key"
3. **Store Securely** - Save your key in environment variables (never commit to version control)

## API Key Format

API keys follow this format:

```
arw_sk_<40_character_secret>
```

Example:
```
arw_sk_1234567890abcdefghijklmnopqrstuvwxyz1234
```

## Authentication Methods

### Bearer Token (Recommended)

Include your API key in the `Authorization` header:

```bash
curl -X POST https://api.arw.dev/v1/scrape \
  -H "Authorization: Bearer arw_sk_your_api_key" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com"}'
```

### Query Parameter (Not Recommended)

For quick testing only:

```bash
curl "https://api.arw.dev/v1/scrape?apiKey=arw_sk_your_api_key&url=https://example.com"
```

⚠️ **Warning**: Query parameters appear in logs and browser history. Use Bearer tokens in production.

## Environment Variables

### Bash/Zsh

```bash
export ARW_API_KEY="arw_sk_your_api_key"
```

### Node.js

Create `.env` file:

```env
ARW_API_KEY=arw_sk_your_api_key
```

Load with dotenv:

```javascript
require('dotenv').config();
const apiKey = process.env.ARW_API_KEY;
```

### Python

```python
import os
api_key = os.environ.get('ARW_API_KEY')
```

## SDK Authentication

### Node.js / TypeScript

```typescript
import { ARWCrawler } from '@arw/crawler-client';

// Option 1: Pass API key directly
const client = new ARWCrawler({
  apiKey: 'arw_sk_your_api_key'
});

// Option 2: Use environment variable (recommended)
const client = new ARWCrawler(); // Reads from ARW_API_KEY env var
```

### Python

```python
from arw_crawler import ARWCrawler

# Option 1: Pass API key directly
client = ARWCrawler(api_key='arw_sk_your_api_key')

# Option 2: Use environment variable (recommended)
client = ARWCrawler()  # Reads from ARW_API_KEY env var
```

## Managing API Keys

### Creating Keys

```bash
curl -X POST https://api.arw.dev/v1/keys \
  -H "Authorization: Bearer arw_sk_existing_key" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Production Key",
    "permissions": ["read", "write"]
  }'
```

Response:

```json
{
  "success": true,
  "data": {
    "id": "key_abc123",
    "key": "arw_sk_new_key_here",
    "name": "Production Key",
    "createdAt": "2025-01-27T10:00:00Z"
  }
}
```

### Listing Keys

```bash
curl https://api.arw.dev/v1/keys \
  -H "Authorization: Bearer arw_sk_your_api_key"
```

Response:

```json
{
  "success": true,
  "data": [
    {
      "id": "key_abc123",
      "name": "Production Key",
      "lastUsed": "2025-01-27T10:00:00Z",
      "createdAt": "2025-01-20T10:00:00Z"
    },
    {
      "id": "key_def456",
      "name": "Development Key",
      "lastUsed": "2025-01-26T15:30:00Z",
      "createdAt": "2025-01-15T10:00:00Z"
    }
  ]
}
```

### Revoking Keys

```bash
curl -X DELETE https://api.arw.dev/v1/keys/key_abc123 \
  -H "Authorization: Bearer arw_sk_your_api_key"
```

Response:

```json
{
  "success": true,
  "message": "API key revoked successfully"
}
```

## Key Rotation

Best practice: Rotate keys every 90 days

```bash
# 1. Create new key
NEW_KEY=$(curl -X POST https://api.arw.dev/v1/keys \
  -H "Authorization: Bearer $OLD_KEY" \
  -H "Content-Type: application/json" \
  -d '{"name": "Rotated Key"}' | jq -r '.data.key')

# 2. Update environment variables
export ARW_API_KEY=$NEW_KEY

# 3. Test new key
curl https://api.arw.dev/v1/health \
  -H "Authorization: Bearer $NEW_KEY"

# 4. Revoke old key
curl -X DELETE https://api.arw.dev/v1/keys/$OLD_KEY_ID \
  -H "Authorization: Bearer $NEW_KEY"
```

## Permissions

API keys support granular permissions:

| Permission | Description |
|------------|-------------|
| `read` | Read-only access (GET requests) |
| `write` | Create and modify resources (POST, PUT) |
| `delete` | Delete resources (DELETE requests) |
| `admin` | Full access including key management |

### Scoped Keys

Create keys with limited permissions:

```bash
curl -X POST https://api.arw.dev/v1/keys \
  -H "Authorization: Bearer arw_sk_admin_key" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Read-Only Key",
    "permissions": ["read"],
    "scopes": ["scrape", "crawl"]
  }'
```

## Error Responses

### 401 Unauthorized

Missing or invalid API key:

```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid or missing API key",
    "details": "Provide a valid API key in the Authorization header"
  }
}
```

### 403 Forbidden

Insufficient permissions:

```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "Insufficient permissions",
    "details": "This API key does not have 'write' permission"
  }
}
```

### 429 Rate Limit Exceeded

Too many requests:

```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Rate limit exceeded",
    "details": "Limit: 100 requests/hour. Resets at 2025-01-27T11:00:00Z",
    "retryAfter": 3600
  }
}
```

## Security Best Practices

### ✅ Do

- Store keys in environment variables
- Use different keys for dev/staging/production
- Rotate keys regularly (every 90 days)
- Revoke unused keys immediately
- Use read-only keys when possible
- Monitor key usage in dashboard

### ❌ Don't

- Commit keys to version control
- Share keys via email/chat
- Use production keys in development
- Embed keys in client-side code
- Use query parameter authentication in production

## Testing Authentication

Test your API key:

```bash
curl https://api.arw.dev/v1/health \
  -H "Authorization: Bearer $ARW_API_KEY"
```

Response:

```json
{
  "success": true,
  "authenticated": true,
  "keyInfo": {
    "id": "key_abc123",
    "name": "Production Key",
    "permissions": ["read", "write"]
  }
}
```

## Troubleshooting

### Issue: "Invalid API Key"

**Solution:**
1. Verify key format: `arw_sk_*`
2. Check for extra spaces/newlines
3. Ensure key hasn't been revoked
4. Try creating a new key

### Issue: "Rate Limit Exceeded"

**Solution:**
1. Wait for rate limit to reset
2. Upgrade to higher plan
3. Implement exponential backoff
4. Use batch endpoints for multiple URLs

### Issue: "Forbidden"

**Solution:**
1. Check key permissions in dashboard
2. Create new key with required permissions
3. Verify endpoint requires correct scope

## Next Steps

- [Rate Limits](./rate-limits.md)
- [Scrape Endpoint](./endpoints/scrape.md)
- [Error Handling](./errors.md)
- [SDK Getting Started](../sdk/getting-started.md)
