# ARW Discovery Architecture: A Practical Guide

**Making Websites Discoverable to AI Agents**

---

## Executive Summary

ARW's discovery architecture solves a fundamental problem: **how do AI agents efficiently find and navigate website capabilities without crawling the entire site?**

The solution is a **layered discovery system** built on RFC 8615 (Well-Known URIs) that provides:

- **10x faster discovery** than traditional crawling
- **RFC 8615 compliance** for standardization
- **Dual format support** for both machine and human workflows
- **Progressive disclosure** that scales from small blogs to large platforms
- **Graceful fallback** across different hosting architectures

This guide explains how ARW's discovery architecture works and why it's designed this way.

---

## Table of Contents

1. [The Problem: Agent Discovery at Scale](#the-problem-agent-discovery-at-scale)
2. [The Solution: Layered Discovery System](#the-solution-layered-discovery-system)
3. [Discovery Flow: 3-Step Process](#discovery-flow-3-step-process)
4. [Primary Entrypoint: .well-known](#primary-entrypoint-well-known)
5. [Dual Canonical Formats](#dual-canonical-formats)
6. [Scale Architecture](#scale-architecture)
7. [Discovery Hints](#discovery-hints)
8. [Implementation Guide](#implementation-guide)
9. [Best Practices](#best-practices)
10. [Real-World Examples](#real-world-examples)

---

## The Problem: Agent Discovery at Scale

### Traditional Web Discovery Doesn't Work for Agents

**How search engines discover content:**
1. Fetch `robots.txt` - basic crawl permissions
2. Fetch `sitemap.xml` - list of URLs with timestamps
3. Crawl each URL - scrape HTML, extract links, repeat
4. Index everything - build search index over time

**Why this fails for AI agents:**

- **Too slow**: Agents need information in seconds, not days
- **Too inefficient**: Downloading 55KB HTML to extract 8KB of content (85% waste)
- **No structure**: HTML parsing is brittle and ambiguous
- **No capabilities**: No way to discover what actions are available
- **No policies**: Usage terms buried in legal pages

### What Agents Actually Need

**Agent requirements:**
1. **Fast capability discovery** - "What can I do on this site?" (< 1 second)
2. **Efficient content navigation** - "Where is the information I need?" (< 5 requests)
3. **Machine-readable policies** - "Am I allowed to use this?" (explicit, not inferred)
4. **Action discovery** - "How do I complete transactions?" (OAuth endpoints, schemas)
5. **Protocol negotiation** - "Does this site support MCP/ACP/A2A?" (protocol endpoints)

**Traditional approaches:**
- ❌ Crawling: Too slow (hours to days)
- ❌ Scraping: Too inefficient (85% wasted tokens)
- ❌ Guessing: No standardization

**ARW's approach:**
- ✅ **Single manifest** lists all capabilities (1 request)
- ✅ **Structured content** with chunk-level precision (85% token reduction)
- ✅ **Machine-readable** policies and schemas
- ✅ **Standard location** via RFC 8615 (consistent across sites)

---

## The Solution: Layered Discovery System

ARW uses **three discovery layers**, each optimized for different use cases:

```
┌─────────────────────────────────────────────────────────┐
│ Layer 1: Primary Entrypoint (RFC 8615)                 │
│ /.well-known/arw-manifest.json                          │
│                                                         │
│ Purpose: Standard location for machine parsing         │
│ When: Agents check here first (universal)              │
│ Format: JSON (strict validation)                       │
└─────────────────────────────────────────────────────────┘
                        ↓ (if not found)
┌─────────────────────────────────────────────────────────┐
│ Layer 2: Dual Canonical Formats                        │
│ /llms.json (JSON) + /llms.txt (YAML)                   │
│                                                         │
│ Purpose: Alternative locations for different workflows │
│ When: Fallback if .well-known not present              │
│ Format: Both JSON and YAML are first-class             │
└─────────────────────────────────────────────────────────┘
                        ↓ (if not found)
┌─────────────────────────────────────────────────────────┐
│ Layer 3: Discovery Hints                               │
│ /robots.txt (arw-manifest: hint)                       │
│                                                         │
│ Purpose: Custom locations for non-standard architectures│
│ When: Sites with special hosting requirements          │
│ Format: robots.txt directive                           │
└─────────────────────────────────────────────────────────┘
```

### Why Three Layers?

**Layer 1 (RFC 8615)**: **Standardization**
- Every ARW site has the same primary location
- Agents know exactly where to check first
- Future-proof (RFC 8615 is a web standard)

**Layer 2 (Dual Formats)**: **Flexibility**
- JSON-first workflows: Generate `/llms.json`, copy to `.well-known`
- YAML-first workflows: Edit `/llms.txt`, generate JSON
- No "legacy" format—both are first-class

**Layer 3 (Hints)**: **Compatibility**
- Handles edge cases (CDN architectures, legacy constraints)
- Optional—most sites won't need this
- Graceful degradation

---

## Discovery Flow: 3-Step Process

Agents follow this normative discovery sequence:

### Step 1: Check RFC 8615 Standard Location

```http
GET /.well-known/arw-manifest.json HTTP/1.1
Host: example.com
Accept: application/json
```

**Possible responses:**

**✅ 200 OK** → Manifest found, use as primary source
```json
{
  "version": "0.1",
  "profile": "ARW-3",
  "site": {
    "name": "Example Site",
    "homepage": "https://example.com"
  },
  "content": [
    {
      "url": "/docs/getting-started",
      "machine_view": "/docs/getting-started.llm.md",
      "priority": "high"
    }
  ]
}
```

**❌ 404 Not Found** → Continue to Step 2

**🔄 301/302 Redirect** → Follow redirect, then use as source

### Step 2: Check Dual Canonical Formats

```http
GET /llms.json HTTP/1.1
Host: example.com
Accept: application/json
```

Or:

```http
GET /llms.txt HTTP/1.1
Host: example.com
Accept: text/plain
```

**Format priority:**
1. If both exist, prefer `/llms.json` (stricter validation)
2. If only `/llms.txt` exists, parse as YAML
3. Content must be semantically identical across formats

**✅ Found** → Use this format
**❌ Not Found** → Continue to Step 3

### Step 3: Check Discovery Hints in robots.txt

```http
GET /robots.txt HTTP/1.1
Host: example.com
```

Look for custom hint:

```
User-agent: *
Allow: /

# ARW Discovery Hint (optional)
arw-manifest: https://cdn.example.com/arw/manifest.json
```

**✅ Hint found** → Fetch manifest from custom location
**❌ No hint** → Site is not ARW-enabled

---

## Primary Entrypoint: .well-known

### RFC 8615: Well-Known URIs

**What is RFC 8615?**

RFC 8615 defines `.well-known/` as the **standard location for site-wide metadata** across the entire web.

**Established uses:**
- `/.well-known/security.txt` - Security contact information
- `/.well-known/change-password` - Password change URL
- `/.well-known/openid-configuration` - OpenID Connect discovery
- `/.well-known/arw-manifest.json` - ARW capabilities (new!)

**Why this matters for ARW:**
- **Discoverability**: Agents know where to check first
- **Standardization**: RFC 8615 is a web standard, not ARW-specific
- **Separation**: No routing conflicts with application paths
- **Security**: Can apply different policies to `.well-known/`
- **Caching**: Can cache separately from dynamic content

### ARW Manifest Structure

**Minimal manifest:**

```json
{
  "version": "0.1",
  "profile": "ARW-1",
  "site": {
    "name": "My Site",
    "description": "A demonstration site",
    "homepage": "https://mysite.com",
    "contact": "ai@mysite.com"
  },
  "content": [
    {
      "url": "/docs/getting-started",
      "machine_view": "/docs/getting-started.llm.md",
      "purpose": "documentation",
      "priority": "high",
      "chunks": [
        {
          "id": "installation",
          "heading": "Installation"
        },
        {
          "id": "configuration",
          "heading": "Configuration"
        }
      ]
    }
  ]
}
```

**What's included:**
- Site metadata (name, description, contact)
- Content index (URLs + machine views)
- Chunk metadata (for precise addressing)
- Priority indicators (for agent optimization)

**What's NOT included (to keep it small):**
- Full content (use machine views)
- Large policy documents (use separate policy file)
- Paginated content (use content index)

### Benefits of .well-known

**1. Universal Discovery**
```
https://site1.com/.well-known/arw-manifest.json
https://site2.com/.well-known/arw-manifest.json
https://site3.com/.well-known/arw-manifest.json
```
Same path across all ARW-enabled sites.

**2. No Routing Conflicts**
```
# Application routes
/api/users
/api/products

# ARW manifest (separate namespace)
/.well-known/arw-manifest.json
```

**3. Security Policies**
```nginx
# nginx example
location /.well-known/ {
  # Different security policy
  add_header Access-Control-Allow-Origin *;
  add_header Cache-Control "public, max-age=3600";
}
```

---

## Dual Canonical Formats

ARW supports **two first-class formats**, neither is "legacy":

### JSON Format: `/llms.json`

**Purpose**: Machine parsing, strict validation

**Advantages:**
- Native JavaScript parsing
- Strict schema validation
- Smaller file size (no comments)
- Better for programmatic generation

**When to use:**
- JSON-first workflows
- Automated generation from databases
- CI/CD pipelines
- Sites prioritizing validation

**Example:**

```json
{
  "version": "0.1",
  "profile": "ARW-1",
  "site": {
    "name": "CloudCart"
  },
  "content": [
    {
      "url": "/products/keyboard",
      "machine_view": "/products/keyboard.llm.md",
      "priority": "high"
    }
  ]
}
```

### YAML Format: `/llms.txt`

**Purpose**: Human editing, comments, readability

**MIME Type**: `text/plain; charset=utf-8`
- **Why `text/plain`?** Prevents binary corruption in AI agent web fetch tools
- **Alternative**: `application/yaml` MAY be used if `Accept` header explicitly requests it

**Advantages:**
- Human-readable and editable
- Supports comments
- Less verbose syntax
- Better for version control

**When to use:**
- YAML-first workflows
- Manual editing by content teams
- Documentation-heavy sites
- Sites prioritizing human readability

**Example:**

```yaml
version: 0.1
profile: ARW-1

site:
  name: 'CloudCart'

# Product catalog (updated weekly)
content:
  - url: /products/keyboard
    machine_view: /products/keyboard.llm.md
    priority: high
    # This page has high conversion rates
```

### Format Equivalence

**Both formats must contain identical data:**

Sites implementing both formats MUST ensure consistency:

```bash
# Validate consistency
arw validate --check-consistency

# Expected: Pass
✅ /llms.txt and /llms.json contain identical data
✅ /.well-known/arw-manifest.json matches canonical format
```

### Implementation Workflows

**Workflow A: JSON-First (Recommended for new sites)**

```bash
# 1. Generate JSON from database/CMS
npm run generate:llms-json

# 2. Copy to .well-known
cp public/llms.json public/.well-known/arw-manifest.json

# 3. Optionally generate YAML for documentation
arw convert --input public/llms.json --output public/llms.txt
```

**Workflow B: YAML-First (Recommended for manual editing)**

```bash
# 1. Manually edit YAML (human-friendly source)
vim public/llms.txt

# 2. Generate JSON formats
arw generate --input public/llms.txt
# Creates: public/llms.json
# Creates: public/.well-known/arw-manifest.json

# 3. Validate consistency
arw validate --check-consistency
```

---

## Scale Architecture

For large sites (500+ pages) or complex policy requirements, ARW provides **separate files** for different concerns.

### Content Index: `/.well-known/arw-content-index.json`

**When to use:**
- Sites with 500+ pages
- Frequent content updates
- Need for pagination

**Benefits:**
- Main manifest stays small and cacheable
- Content index can be paginated
- Incremental updates
- Better cache invalidation

**Structure:**

```json
{
  "version": "0.1",
  "totalPages": 1247,
  "pageSize": 100,
  "pagination": {
    "current": 1,
    "next": "/.well-known/arw-content-index.json?page=2",
    "last": 13
  },
  "items": [
    {
      "url": "/docs/getting-started",
      "machine_view": "/docs/getting-started.llm.md",
      "purpose": "documentation",
      "priority": "high",
      "lastModified": "2025-01-15T10:00:00Z",
      "chunks": 8
    }
    // ... 99 more items
  ]
}
```

**Main manifest reference:**

```json
{
  "version": "0.1",
  "profile": "ARW-2",
  "site": {
    "name": "Large Site"
  },
  "content": {
    "index": "/.well-known/arw-content-index.json",
    "totalItems": 1247,
    "pageSize": 100
  }
}
```

### Policy File: `/.well-known/arw-policies.json`

**When to use:**
- Complex policy requirements
- Frequently accessed policies
- Separate caching strategy

**Benefits:**
- Long cache TTL for policies
- Main manifest stays focused
- Easier policy updates
- CDN edge serving

**Structure:**

```json
{
  "version": "0.1",
  "training": {
    "allowed": false,
    "reasoning": "Content is proprietary and licensed"
  },
  "inference": {
    "allowed": true,
    "restrictions": ["attribution_required", "rate_limited"]
  },
  "attribution": {
    "required": true,
    "format": "link",
    "template": "Source: Example Site ({url})"
  },
  "rateLimits": {
    "anonymous": "10/hour",
    "authenticated": "100/hour",
    "burst": 5
  }
}
```

**Main manifest reference:**

```json
{
  "version": "0.1",
  "profile": "ARW-2",
  "policies": "/.well-known/arw-policies.json"
}
```

---

## Discovery Hints

For sites with non-standard architectures, use `robots.txt` discovery hints.

### When to Use Hints

**Standard architecture** → No hints needed
```
/.well-known/arw-manifest.json (preferred)
/llms.json or /llms.txt (fallback)
```

**Non-standard architecture** → Add hint
```
# robots.txt
arw-manifest: https://cdn.example.com/arw/manifest.json
```

### Use Cases

**Use Case 1: Custom CDN Location**

```
# robots.txt
arw-manifest: https://cdn.example.com/arw/manifest.json
```

**Use Case 2: Subdomain Architecture**

```
# robots.txt
arw-manifest: https://api.example.com/.well-known/arw-manifest.json
```

**Use Case 3: Multi-language Sites**

```
# robots.txt
arw-manifest: /en/llms.json
arw-manifest-es: /es/llms.json
arw-manifest-fr: /fr/llms.json
```

---

## Implementation Guide

### Step 1: Choose Your Approach

**Option A: JSON-First** (recommended for new sites)
- Generate `/llms.json` from database/CMS
- Copy to `/.well-known/arw-manifest.json`
- Optionally generate `/llms.txt` for documentation

**Option B: YAML-First** (recommended for manual editing)
- Manually edit `/llms.txt`
- Generate `/llms.json` and `/.well-known/arw-manifest.json`
- Validate consistency

### Step 2: Create Discovery Files

**For small sites (< 100 pages):**

Single manifest at `/.well-known/arw-manifest.json`:

```json
{
  "version": "0.1",
  "profile": "ARW-1",
  "site": {
    "name": "My Blog",
    "homepage": "https://myblog.com"
  },
  "content": [
    // All content inline
  ]
}
```

**For large sites (> 500 pages):**

Manifest with external content index:

```json
{
  "version": "0.1",
  "profile": "ARW-2",
  "site": {
    "name": "Large Site"
  },
  "content": {
    "index": "/.well-known/arw-content-index.json"
  }
}
```

### Step 3: Configure Server

**Ensure .well-known is accessible:**

```bash
curl https://yoursite.com/.well-known/arw-manifest.json
```

**Set correct MIME types:**

```nginx
# nginx example
location /.well-known/arw-manifest.json {
  add_header Content-Type "application/json; charset=utf-8";
}

location /llms.txt {
  add_header Content-Type "text/plain; charset=utf-8";
}

location /llms.json {
  add_header Content-Type "application/json; charset=utf-8";
}
```

**Configure caching:**

```nginx
location /.well-known/ {
  add_header Cache-Control "public, max-age=3600";
  add_header ETag "manifest-v1";
}
```

### Step 4: Validate

```bash
# Install ARW CLI
npm install -g arw-cli

# Validate implementation
arw validate https://yoursite.com

# Check consistency
arw validate --check-consistency
```

---

## Best Practices

### 1. Use RFC 8615 Standard Location

**✅ DO:**
```
/.well-known/arw-manifest.json
```

**❌ DON'T:**
```
/arw-manifest.json
/api/arw/manifest.json
/llms.json (as primary)
```

### 2. Maintain Format Consistency

If providing multiple formats, ensure they're identical:

```bash
arw validate --check-consistency
```

### 3. Use Appropriate Caching

```http
# Manifest files
Cache-Control: public, max-age=3600

# Policy files
Cache-Control: public, max-age=86400

# Content index (large sites)
Cache-Control: public, max-age=1800
```

### 4. Version Your Manifests

```json
{
  "version": "0.1",
  "manifestVersion": 2,
  "lastModified": "2025-01-15T10:00:00Z"
}
```

### 5. Use Content Index for Large Sites

```json
{
  "content": {
    "index": "/.well-known/arw-content-index.json",
    "totalItems": 1247
  }
}
```

---

## Real-World Examples

### Example 1: Small Blog

```json
{
  "version": "0.1",
  "profile": "ARW-1",
  "site": {
    "name": "My Dev Blog",
    "homepage": "https://devblog.com",
    "contact": "ai@devblog.com"
  },
  "content": [
    {
      "url": "/posts/arw-introduction",
      "machine_view": "/posts/arw-introduction.llm.md",
      "purpose": "blog_post",
      "priority": "high",
      "chunks": 5
    },
    {
      "url": "/about",
      "machine_view": "/about.llm.md",
      "purpose": "about_page",
      "priority": "medium",
      "chunks": 2
    }
  ]
}
```

### Example 2: E-Commerce Site

```json
{
  "version": "0.1",
  "profile": "ARW-3",
  "site": {
    "name": "CloudCart",
    "homepage": "https://cloudcart.com"
  },
  "content": {
    "index": "/.well-known/arw-content-index.json",
    "totalItems": 500
  },
  "actions": [
    {
      "id": "add_to_cart",
      "name": "Add to Cart",
      "endpoint": "/api/actions/cart",
      "method": "POST",
      "auth": "oauth2"
    }
  ],
  "policies": "/.well-known/arw-policies.json"
}
```

### Example 3: Large Documentation Site

```json
{
  "version": "0.1",
  "profile": "ARW-2",
  "site": {
    "name": "API Docs",
    "homepage": "https://docs.example.com"
  },
  "content": {
    "index": "/.well-known/arw-content-index.json",
    "totalItems": 2000,
    "shards": [
      "/.well-known/arw-content-getting-started.json",
      "/.well-known/arw-content-api-reference.json",
      "/.well-known/arw-content-guides.json"
    ]
  },
  "policies": "/.well-known/arw-policies.json"
}
```

---

## Conclusion

ARW's discovery architecture provides a **standardized, efficient, and scalable** solution for agent-web interaction:

**Key Benefits:**

1. **10x faster** than traditional crawling
2. **RFC 8615 compliance** for standardization
3. **Dual format support** for flexibility
4. **Progressive disclosure** that scales
5. **Graceful fallback** for compatibility

**Implementation Path:**

1. Start with `/.well-known/arw-manifest.json` (ARW-1)
2. Add policies and content index as needed (ARW-2)
3. Implement actions and protocols (ARW-3+)

**The Result:**

Websites that are efficiently discoverable to AI agents while maintaining full control over content, policies, and operations.

---

**Version:** 0.1-draft
**Date:** January 2025
**License:** Apache 2.0

**Related Documents:**
- [ARW Specification v0.1-draft](../../spec/ARW-0.1-draft.md)
- [ARW Introduction](./ARW-Introduction.md)
- [ARW Overview and Benefits](./ARW-Overview-and-Benefits.md)
- [ARW vs llms.txt Comparison](./ARW-vs-llmstxt-Comparison.md)
- [ARW Protocol Interoperability](./ARW-Protocol-Interoperability.md)
- [Discovery Architecture (Technical)](../discovery/DISCOVERY_ARCHITECTURE.md)
- [Discovery to Knowledge Graph](../discovery/ARW-DISCOVERY-TO-KNOWLEDGE-GRAPH.md)

**Contact:** ai@arw.dev
**Community:** github.com/agent-ready-web
