# ARW Discovery Guide

This guide explains how ARW implements progressive discovery through multiple, complementary mechanisms.

## Overview

ARW uses a layered discovery approach that balances human readability, machine efficiency, and web standards compatibility:

1. **robots.txt** - Crawl rules and discovery hints
2. **.well-known/** - Machine-optimized JSON endpoints (RFC 8615)
3. **/llms.txt** - Human-readable table of contents (YAML)
4. **sitemap.xml** - Standard web sitemap for dates and change frequency

## Discovery Flow

```mermaid
flowchart LR
  A[Agent] -->|1. Probe| B[/.well-known/arw-manifest.json]
  B -- 200 OK --> C[Parse manifest.links]
  B -- 404 --> D[/llms.txt]
  D -- Parse --> C
  C --> E[/.well-known/arw-content-index.json]
  C --> F[/.well-known/arw-policies.json]
  E --> G[Machine views: *.llm.md]
  A -. Optional .-> H[/robots.txt]
  H -. ARW-Manifest hint .-> B
```

## Implementation Approaches

### Option A: Minimal (ARW-1)

Start with just `/llms.txt` and `.well-known/arw-manifest.json`:

```yaml
# /llms.txt
version: 1.0
profile: ARW-1

site:
  name: 'Your Site'
  homepage: 'https://example.com'
  contact: 'ai@example.com'

content:
  - url: /
    machine_view: /index.llm.md
    priority: high
```

```json
// /.well-known/arw-manifest.json
{
  "arw_version": "1.0",
  "site": {
    "name": "Your Site",
    "homepage": "https://example.com"
  },
  "links": {
    "guide": "/llms.txt",
    "policies": "/.well-known/arw-policies.json"
  }
}
```

### Option B: Standard (ARW-2)

Add policies and content index:

```json
// /.well-known/arw-policies.json
{
  "inference": "allow",
  "training": "conditional",
  "attribution": {
    "required": true,
    "template": "Source: {site_name} ({url})"
  },
  "rate_limits": {
    "anonymous_rps": 2,
    "oauth_rps": 10
  }
}
```

```json
// /.well-known/arw-content-index.json
{
  "version": "1.0",
  "items": [
    {
      "id": "home",
      "type": "llm.md",
      "url": "https://example.com/index.llm.md",
      "hash": "sha256-...",
      "last_modified": "2025-11-01T00:00:00Z",
      "tags": ["marketing", "homepage"]
    }
  ]
}
```

### Option C: Scaled (ARW-3+)

For large sites, add pagination and sharding:

```json
// /.well-known/arw-manifest.json
{
  "arw_version": "1.0",
  "links": {
    "content_index": "/.well-known/arw-content-index.json?limit=500",
    "openapi": "/.well-known/arw-openapi.json"
  },
  "content_shards": [
    "/.well-known/arw-content-index-docs.json",
    "/.well-known/arw-content-index-blog.json"
  ]
}
```

## Sitemap Integration

ARW complements standard `sitemap.xml` rather than replacing it:

### Standard sitemap.xml

Keep your existing sitemap for HTML pages:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://example.com/</loc>
    <lastmod>2025-11-01</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>
```

### Optional sitemap-llm.xml

For sites with many machine views, create a separate sitemap:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://example.com/index.llm.md</loc>
    <lastmod>2025-11-01</lastmod>
    <changefreq>weekly</changefreq>
  </url>
  <url>
    <loc>https://example.com/docs/api.llm.md</loc>
    <lastmod>2025-10-28</lastmod>
    <changefreq>monthly</changefreq>
  </url>
</urlset>
```

Add to robots.txt:

```
User-agent: *
Allow: /

Sitemap: https://example.com/sitemap.xml
Sitemap: https://example.com/sitemap-llm.xml

# ARW Discovery
ARW-Manifest: /.well-known/arw-manifest.json
```

## Resolution Algorithm

Agents SHOULD follow this normative resolution sequence:

1. **Probe** `/.well-known/arw-manifest.json`

   - If 200: Parse `ArwManifest` and follow `links`
   - If 404: Continue to step 2

2. **Probe** `/llms.txt`

   - If 200: Parse YAML and follow `links`
   - If 404: Discovery fails

3. **Optional**: Check `/robots.txt` for `ARW-Manifest` hint and retry step 1

## Caching and Performance

### HTTP Headers

All discovery files SHOULD include:

```http
Cache-Control: max-age=300, stale-while-revalidate=86400
ETag: "abc123"
Last-Modified: Fri, 01 Nov 2025 00:00:00 GMT
```

### Compression

Enable Gzip/Brotli for all JSON and YAML files:

```http
Content-Encoding: br
Vary: Accept-Encoding
```

### Content Hashing

Use content hashes in `arw-content-index.json` for incremental sync:

```json
{
  "id": "doc-123",
  "url": "https://example.com/docs/api.llm.md",
  "hash": "sha256-8Z0qvCk0f9d7m2VY0I2wz7c8XJc1o3yQkHk0s7gY8V0=",
  "last_modified": "2025-11-01T00:00:00Z"
}
```

Agents can skip re-fetching if hash matches cached version.

## Query Parameters

The content index supports filtering:

- `limit` - Max items per page (default 200, max 1000)
- `cursor` - Opaque pagination token
- `since` - Filter by `last_modified >= date`
- `area` - Filter by content area (docs, blog, etc.)

Example:

```
/.well-known/arw-content-index.json?limit=100&area=docs&since=2025-10-01T00:00:00Z
```

## Best Practices

### 1. Keep Chunk IDs Stable

Use semantic IDs that won't change:

```yaml
chunks:
  - id: product-overview # ✅ Good - semantic
  - id: chunk-1 # ❌ Bad - positional
```

### 2. Update Last-Modified

Keep timestamps accurate for efficient caching:

```json
{
  "id": "doc",
  "last_modified": "2025-11-01T14:30:00Z" // Actual file modification time
}
```

### 3. Progressive Enhancement

Start simple and add features as needed:

- ARW-1: Basic discovery (`llms.txt` + manifest)
- ARW-2: Add policies and content index
- ARW-3: Add OAuth actions
- ARW-4: Add protocol endpoints and sharding

### 4. Validate Regularly

Use the validators in CI:

```bash
python tools/validators/validate-arw.py www/public/llms.txt
```

## Troubleshooting

### Discovery Not Working

1. Check file existence:

   ```bash
   curl https://yoursite.com/.well-known/arw-manifest.json
   curl https://yoursite.com/llms.txt
   ```

2. Validate JSON syntax:

   ```bash
   node -e "JSON.parse(require('fs').readFileSync('www/public/.well-known/arw-manifest.json'))"
   ```

3. Check CORS headers if accessed from browser agents

### Performance Issues

1. Enable compression (Gzip/Brotli)
2. Add `Cache-Control` headers
3. Implement pagination for large content indices
4. Use content sharding for very large sites

## Related Documentation

- [ARW Specification v1.0](../../spec/ARW-v1.0.md)
- [Validator Tools](../../tools/validators/README.md)
- [Schema Reference](../../schemas/)
