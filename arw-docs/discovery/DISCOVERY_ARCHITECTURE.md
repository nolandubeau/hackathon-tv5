# ARW Discovery Architecture

**RFC 8615-Based Layered Discovery System**

---

## Executive Summary

ARW uses a **layered discovery system** built on RFC 8615 (Well-Known URIs) to enable efficient agent-web interaction. This architecture provides:

- **Primary Entrypoint**: `/.well-known/arw-manifest.json` (RFC 8615 standard)
- **Dual Canonical Formats**: Both JSON and YAML are first-class citizens
- **Progressive Disclosure**: Scale architecture for large sites
- **Graceful Fallback**: 3-step discovery flow

This document provides the complete technical specification for ARW's discovery layer.

---

## Table of Contents

1. [Overview](#overview)
2. [Discovery Flow](#discovery-flow)
3. [Primary Entrypoint: .well-known](#primary-entrypoint-well-known)
4. [Dual Canonical Formats](#dual-canonical-formats)
5. [Scale Architecture](#scale-architecture)
6. [Discovery Hints](#discovery-hints)
7. [Implementation Guide](#implementation-guide)
8. [Best Practices](#best-practices)
9. [Examples](#examples)

---

## Overview

### The Problem ARW Discovery Solves

Traditional web discovery relies on:
- `robots.txt` - Crawl permissions (advisory only)
- `sitemap.xml` - URL enumeration (no semantic structure)
- HTML scraping - Brittle and inefficient

These mechanisms were designed for search engines, not AI agents. AI agents need:
- **Structured capability discovery** - What can the agent do on this site?
- **Efficient content navigation** - How to find relevant information quickly?
- **Machine-readable policies** - What are the usage terms?
- **Action discovery** - What operations are available?

### ARW's Solution: Layered Discovery

ARW introduces a three-layer discovery system:

**Layer 1: Primary Entrypoint**
- `/.well-known/arw-manifest.json` (RFC 8615)
- Single source of truth for site capabilities
- Optimized for machine parsing

**Layer 2: Dual Canonical Formats**
- `/llms.json` - JSON format (machine parsing)
- `/llms.txt` - YAML format (human editing)
- Both formats have identical capabilities

**Layer 3: Scale Architecture**
- `/.well-known/arw-content-index.json` - Paginated content index
- `/.well-known/arw-policies.json` - Cacheable policies
- For sites with 500+ pages or complex policy requirements

---

## Discovery Flow

Agents follow this discovery sequence:

```
┌─────────────────────────────────────────────────────────┐
│ Step 1: Check RFC 8615 Standard Location               │
│ GET /.well-known/arw-manifest.json                      │
│                                                         │
│ ✓ Found → Use this as primary manifest                 │
│ ✗ Not Found → Continue to Step 2                       │
└─────────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│ Step 2: Check Dual Canonical Formats                   │
│ GET /llms.json (JSON format)                            │
│ GET /llms.txt (YAML format)                             │
│                                                         │
│ ✓ Found → Use either format (JSON preferred)           │
│ ✗ Not Found → Continue to Step 3                       │
└─────────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│ Step 3: Check Discovery Hints                          │
│ GET /robots.txt                                         │
│ Look for: arw-manifest: <custom-url>                   │
│                                                         │
│ ✓ Found → Follow hint to custom location               │
│ ✗ Not Found → Site not ARW-enabled                     │
└─────────────────────────────────────────────────────────┘
```

### Flow Details

**Step 1: RFC 8615 Standard Location**

Agents check `/.well-known/arw-manifest.json` first. This is the **recommended** location for ARW manifests.

**Why .well-known?**
- RFC 8615 establishes `.well-known/` as the standard location for site metadata
- Used by many existing standards (security.txt, change-password, etc.)
- Agents can check one standard location across all sites
- Separate from application routes (no routing conflicts)

**Response:**
- `200 OK` → Manifest found, use as primary source
- `404 Not Found` → Continue to Step 2
- `301/302 Redirect` → Follow redirect to custom location

**Step 2: Dual Canonical Formats**

If `.well-known/arw-manifest.json` is not found, agents check both:
- `/llms.json` - JSON format
- `/llms.txt` - YAML format

**Both formats are first-class citizens:**
- Neither is "legacy" or "deprecated"
- Sites choose based on their workflow:
  - JSON-first: Generate `/llms.json` and `/.well-known/arw-manifest.json`
  - YAML-first: Write `/llms.txt`, generate `/llms.json` and `.well-known`

**Format Priority:**
- If both exist, prefer `/llms.json` (stricter validation)
- If only `/llms.txt` exists, parse as YAML
- Content should be identical across formats

**Step 3: Discovery Hints**

If standard locations are not found, check `robots.txt` for custom hints:

```
# robots.txt
User-agent: *
Allow: /

# ARW Discovery Hint
arw-manifest: https://example.com/custom/location/manifest.json
```

This allows sites with non-standard architectures to participate in ARW.

---

## Primary Entrypoint: .well-known

### RFC 8615 Background

RFC 8615 defines "Well-Known Uniform Resource Identifiers (URIs)" as a standard way to publish site-wide metadata.

**Standard Location:**
```
https://example.com/.well-known/{identifier}
```

**ARW Identifiers:**
- `arw-manifest.json` - Primary manifest (required)
- `arw-content-index.json` - Content index for large sites (optional)
- `arw-policies.json` - Policy declarations for large sites (optional)

### Manifest Structure

**Minimal Manifest:**

```json
{
  "version": "0.1",
  "profile": "ARW-1",
  "site": {
    "name": "Example Site",
    "description": "A site demonstrating ARW",
    "homepage": "https://example.com",
    "contact": "ai@example.com"
  },
  "content": [
    {
      "url": "/docs/getting-started",
      "machine_view": "/docs/getting-started.llm.md",
      "purpose": "documentation",
      "priority": "high"
    }
  ]
}
```

**Complete Manifest Schema:**

See [ARW Specification Section 3.1](../../spec/ARW-0.1-draft.md#31-discovery-files) for complete schema.

### Benefits of .well-known

1. **Standardization**: RFC 8615 is a web standard, not ARW-specific
2. **Discoverability**: Agents know where to check first
3. **Separation**: No routing conflicts with application paths
4. **Security**: Can apply different security policies to `.well-known/`
5. **Caching**: Can cache separately from application content
6. **Future-proof**: Extensible for future ARW features

---

## Dual Canonical Formats

ARW supports **two canonical formats**, both first-class:

### JSON Format (`/llms.json`)

**Purpose**: Machine parsing, strict validation

**Advantages:**
- Strict schema validation
- Native JavaScript parsing
- Smaller file size (no comments)
- Better for programmatic generation

**When to use:**
- JSON-first workflows
- Automated generation from databases
- CI/CD pipelines
- Strict validation requirements

**Example:**

```json
{
  "version": "0.1",
  "profile": "ARW-1",
  "content": [
    {
      "url": "/products/keyboard",
      "machine_view": "/products/keyboard.llm.md",
      "priority": "high",
      "chunks": 8
    }
  ]
}
```

### YAML Format (`/llms.txt`)

**Purpose**: Human editing, comments, readability

**Advantages:**
- Human-readable and editable
- Supports comments
- Less verbose
- Better for manual maintenance

**When to use:**
- YAML-first workflows
- Manual editing by content teams
- Version control with comments
- Documentation-heavy sites

**Example:**

```yaml
version: 0.1
profile: ARW-1

# Main product catalog
content:
  - url: /products/keyboard
    machine_view: /products/keyboard.llm.md
    priority: high
    chunks: 8
    # Updated weekly with new inventory
```

### Format Equivalence

**Both formats must contain identical information:**

```yaml
# /llms.txt
content:
  - url: /docs/api
    priority: high
```

Is equivalent to:

```json
{
  "content": [
    {
      "url": "/docs/api",
      "priority": "high"
    }
  ]
}
```

### Implementation Approaches

**Approach A: JSON-First**

1. Generate `/llms.json` from database or CMS
2. Copy to `/.well-known/arw-manifest.json`
3. Optionally generate `/llms.txt` for human readers

```bash
# Example workflow
npm run generate:llms-json
cp public/llms.json public/.well-known/arw-manifest.json
npm run generate:llms-txt # optional
```

**Approach B: YAML-First**

1. Manually edit `/llms.txt` (YAML source of truth)
2. Generate `/llms.json` and `/.well-known/arw-manifest.json`

```bash
# Example workflow
# 1. Edit llms.txt manually
vim public/llms.txt

# 2. Generate JSON formats
arw generate --input public/llms.txt
# Creates: public/llms.json
# Creates: public/.well-known/arw-manifest.json
```

### Format Consistency

Sites should ensure consistency across formats:

**Validation:**
```bash
arw validate --check-consistency
```

**Checks:**
- `/llms.txt` and `/llms.json` contain same data
- `/.well-known/arw-manifest.json` matches canonical format
- All machine views referenced are accessible
- Priority values are consistent

---

## Scale Architecture

For large sites (500+ pages) or complex policy requirements, ARW provides a **scale architecture** with separate files for different concerns.

### Content Index: `/.well-known/arw-content-index.json`

**Purpose**: Paginated content index for large sites

**When to use:**
- Sites with 500+ pages
- Frequent content updates
- Complex hierarchical structure

**Benefits:**
- Main manifest remains small and cacheable
- Content index can be paginated
- Incremental updates without re-downloading entire manifest
- Better cache invalidation

**Structure:**

```json
{
  "version": "0.1",
  "totalPages": 1247,
  "pageSize": 100,
  "pages": [
    {
      "page": 1,
      "url": "/.well-known/arw-content-index.json?page=1",
      "items": [
        {
          "url": "/docs/getting-started",
          "machine_view": "/docs/getting-started.llm.md",
          "priority": "high",
          "lastModified": "2025-01-15T10:00:00Z"
        }
        // ... 99 more items
      ]
    },
    {
      "page": 2,
      "url": "/.well-known/arw-content-index.json?page=2"
      // Next page reference
    }
  ]
}
```

**Main Manifest Reference:**

```json
{
  "version": "0.1",
  "profile": "ARW-1",
  "content": {
    "index": "/.well-known/arw-content-index.json",
    "totalItems": 1247
  }
}
```

### Policy File: `/.well-known/arw-policies.json`

**Purpose**: Separate, cacheable policy declarations

**When to use:**
- Complex policy requirements
- Frequently accessed policies
- Separate caching strategy for policies

**Benefits:**
- Policies can be cached with long TTL
- Main manifest remains focused on content structure
- Easier to update policies without touching manifest
- Can serve policies from CDN edge

**Structure:**

```json
{
  "version": "0.1",
  "usage": {
    "training": {
      "allowed": false,
      "reasoning": "Content is proprietary"
    },
    "inference": {
      "allowed": true,
      "conditions": ["attribution_required"]
    }
  },
  "attribution": {
    "required": true,
    "format": "Example Site <https://example.com>"
  },
  "rateLimits": {
    "anonymous": "10/hour",
    "authenticated": "100/hour"
  }
}
```

**Main Manifest Reference:**

```json
{
  "version": "0.1",
  "profile": "ARW-1",
  "policies": "/.well-known/arw-policies.json"
}
```

### Scale Architecture Decision Tree

```
Is your site > 500 pages?
│
├─ NO → Use single manifest
│       /.well-known/arw-manifest.json (all content inline)
│
└─ YES → Do you have complex policies?
         │
         ├─ NO → Use content index only
         │       /.well-known/arw-manifest.json (metadata)
         │       /.well-known/arw-content-index.json (paginated)
         │
         └─ YES → Use full scale architecture
                  /.well-known/arw-manifest.json (metadata)
                  /.well-known/arw-content-index.json (paginated)
                  /.well-known/arw-policies.json (policies)
```

---

## Discovery Hints

For sites with non-standard architectures, use `robots.txt` discovery hints.

### robots.txt Hint Syntax

```
# Standard robots.txt directives
User-agent: *
Allow: /

# ARW Discovery Hint
arw-manifest: https://example.com/custom/manifest.json
```

### Use Cases

**Use Case 1: Custom CDN Location**

```
arw-manifest: https://cdn.example.com/arw/manifest.json
```

**Use Case 2: Subdomain Architecture**

```
arw-manifest: https://api.example.com/.well-known/arw-manifest.json
```

**Use Case 3: Legacy Path Constraints**

```
arw-manifest: https://example.com/api/v2/arw-manifest.json
```

### Discovery Hint Priority

If multiple discovery methods exist, agents use this priority:

1. `/.well-known/arw-manifest.json` (RFC 8615 standard)
2. `/llms.json` or `/llms.txt` (canonical formats)
3. `robots.txt` hint (custom location)

**Note:** Sites should prefer standard locations. Discovery hints are for exceptional cases only.

---

## Implementation Guide

### Step 1: Choose Your Approach

**Option A: JSON-First (Recommended for new sites)**

Benefits:
- Strict validation
- Programmatic generation
- Better for automated workflows

Workflow:
1. Generate `/llms.json` from database/CMS
2. Copy to `/.well-known/arw-manifest.json`
3. Optionally generate `/llms.txt` for documentation

**Option B: YAML-First (Recommended for manual editing)**

Benefits:
- Human-readable
- Comments for documentation
- Better for content teams

Workflow:
1. Manually edit `/llms.txt`
2. Generate `/llms.json` and `/.well-known/arw-manifest.json`
3. Validate consistency

### Step 2: Create Discovery Files

**For Small Sites (< 100 pages):**

Create single manifest at `/.well-known/arw-manifest.json`:

```json
{
  "version": "0.1",
  "profile": "ARW-1",
  "site": {
    "name": "My Site",
    "homepage": "https://mysite.com"
  },
  "content": [
    // All content inline
  ]
}
```

**For Large Sites (> 500 pages):**

Create manifest with external content index:

```json
{
  "version": "0.1",
  "profile": "ARW-1",
  "site": {
    "name": "Large Site",
    "homepage": "https://largesite.com"
  },
  "content": {
    "index": "/.well-known/arw-content-index.json"
  }
}
```

### Step 3: Configure Server

**Ensure .well-known is accessible:**

Most static hosts automatically serve `.well-known/` directory. Verify:

```bash
curl https://yoursite.com/.well-known/arw-manifest.json
```

**Set correct MIME type:**

```
Content-Type: application/json
```

**Configure caching:**

```
Cache-Control: public, max-age=3600
```

### Step 4: Validate

Use ARW CLI to validate:

```bash
npm install -g arw-cli
arw validate https://yoursite.com
```

**Checks:**
- `/.well-known/arw-manifest.json` is accessible
- JSON is valid and follows schema
- Machine views are accessible
- Content consistency across formats

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

**Why:** RFC 8615 provides a standard location that agents know to check first.

### 2. Maintain Format Consistency

If you provide multiple formats, ensure they're consistent:

```bash
# Validate consistency
arw validate --check-consistency
```

### 3. Use Appropriate Caching

**Manifest files:**
```
Cache-Control: public, max-age=3600
```

**Policy files:**
```
Cache-Control: public, max-age=86400
```

**Content index (large sites):**
```
Cache-Control: public, max-age=1800
```

### 4. Version Your Manifests

Include version in manifest:

```json
{
  "version": "0.1",
  "manifestVersion": 2,
  "lastModified": "2025-01-15T10:00:00Z"
}
```

### 5. Use Content Index for Large Sites

If you have > 500 pages, use external content index:

```json
{
  "content": {
    "index": "/.well-known/arw-content-index.json",
    "totalItems": 1247
  }
}
```

### 6. Provide Discovery Hints Only When Necessary

**Standard architecture:**
```
/.well-known/arw-manifest.json (no hints needed)
```

**Non-standard architecture:**
```
# robots.txt
arw-manifest: https://cdn.example.com/arw/manifest.json
```

---

## Examples

### Example 1: Small Documentation Site

**File: `/.well-known/arw-manifest.json`**

```json
{
  "version": "0.1",
  "profile": "ARW-1",
  "site": {
    "name": "MyDocs",
    "description": "Technical documentation",
    "homepage": "https://docs.example.com",
    "contact": "ai@example.com"
  },
  "content": [
    {
      "url": "/getting-started",
      "machine_view": "/getting-started.llm.md",
      "purpose": "documentation",
      "priority": "high",
      "chunks": 5
    },
    {
      "url": "/api-reference",
      "machine_view": "/api-reference.llm.md",
      "purpose": "documentation",
      "priority": "high",
      "chunks": 12
    },
    {
      "url": "/tutorials",
      "machine_view": "/tutorials.llm.md",
      "purpose": "documentation",
      "priority": "medium",
      "chunks": 8
    }
  ]
}
```

### Example 2: E-Commerce Site (YAML-First)

**File: `/llms.txt`**

```yaml
version: 0.1
profile: ARW-2  # Supports actions

site:
  name: 'CloudCart'
  description: 'Online shopping platform'
  homepage: 'https://cloudcart.com'
  contact: 'ai@cloudcart.com'

# Product catalog
content:
  - url: /products/keyboards
    machine_view: /products/keyboards.llm.md
    purpose: e-commerce
    priority: high
    chunks: 15
    metadata:
      category: electronics
      updateFrequency: daily

  - url: /products/mice
    machine_view: /products/mice.llm.md
    purpose: e-commerce
    priority: high
    chunks: 12

# Shopping actions
actions:
  - id: add_to_cart
    name: Add to Cart
    endpoint: /api/actions/cart
    method: POST
    auth: oauth2
    schema:
      input:
        productId: string
        quantity: number

  - id: checkout
    name: Checkout
    endpoint: /api/actions/checkout
    method: POST
    auth: oauth2
```

**Generated: `/llms.json` and `/.well-known/arw-manifest.json`**

### Example 3: Large News Site (Scale Architecture)

**File: `/.well-known/arw-manifest.json`**

```json
{
  "version": "0.1",
  "profile": "ARW-1",
  "site": {
    "name": "News Daily",
    "homepage": "https://newsdaily.com",
    "contact": "ai@newsdaily.com"
  },
  "content": {
    "index": "/.well-known/arw-content-index.json",
    "totalItems": 15000
  },
  "policies": "/.well-known/arw-policies.json"
}
```

**File: `/.well-known/arw-content-index.json`**

```json
{
  "version": "0.1",
  "totalPages": 15000,
  "pageSize": 100,
  "pages": [
    {
      "page": 1,
      "url": "/.well-known/arw-content-index.json?page=1",
      "items": [
        {
          "url": "/articles/2025/01/breaking-news",
          "machine_view": "/articles/2025/01/breaking-news.llm.md",
          "priority": "high",
          "publishedAt": "2025-01-15T08:00:00Z",
          "category": "breaking-news"
        }
        // ... 99 more items
      ]
    }
  ]
}
```

**File: `/.well-known/arw-policies.json`**

```json
{
  "version": "0.1",
  "usage": {
    "training": {
      "allowed": false
    },
    "inference": {
      "allowed": true,
      "conditions": ["attribution_required", "excerpt_only"]
    }
  },
  "attribution": {
    "required": true,
    "format": "News Daily <article-url>",
    "excerptLimit": 150
  }
}
```

---

## Conclusion

ARW's discovery architecture provides a **layered, standards-based system** for agent-web interaction:

- **RFC 8615 foundation** ensures standardization
- **Dual canonical formats** support both machine and human workflows
- **Progressive disclosure** scales from small blogs to large platforms
- **Graceful fallback** ensures backward compatibility

By following this architecture, websites can make their content and capabilities efficiently discoverable to AI agents while maintaining full control over policies and operations.

---

**Version:** 1.0
**Date:** January 2025
**Related Documents:**
- [ARW Specification](../../spec/ARW-0.1-draft.md)
- [ARW Introduction](../arw-overview/ARW-Introduction.md)
- [ARW Overview and Benefits](../arw-overview/ARW-Overview-and-Benefits.md)

**Contact:** ai@arw.dev
