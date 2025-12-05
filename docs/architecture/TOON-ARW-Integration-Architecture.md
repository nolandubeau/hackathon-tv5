# TOON-ARW Integration Architecture

**Document Type:** System Architecture Design
**Status:** PROPOSED
**Date:** 2025-11-13
**Target:** ARW v1.0 Specification Amendment
**Author:** System Architecture Designer

---

## Executive Summary

This document defines the comprehensive architecture for integrating **TOON (Token-Oriented Object Notation)** as an optional content format within the **Agent-Ready Web (ARW)** specification. The integration maintains backward compatibility with existing ARW implementations while providing a more token-efficient, structurally rich format optimized for AI agent consumption.

**Key Design Goals:**

1. **Format Coexistence**: TOON and Markdown (.llm.md) as complementary formats
2. **Zero Breaking Changes**: Full backward compatibility with ARW v0.1
3. **Progressive Adoption**: Sites can adopt TOON incrementally
4. **Token Optimization**: Further reduce token consumption beyond Markdown
5. **Structural Richness**: Leverage TOON's hierarchical object notation

**Expected Benefits:**

- **Additional 20-30% token reduction** over .llm.md (total 90%+ vs HTML)
- **Enhanced structural semantics** for complex content hierarchies
- **Better chunking precision** through native TOON object boundaries
- **Improved citation accuracy** with structured object addressing
- **Maintained human readability** (TOON is human-editable text)

---

## Table of Contents

1. [Architecture Decision Records (ADRs)](#architecture-decision-records)
2. [System Architecture](#system-architecture)
3. [Format Coexistence Strategy](#format-coexistence-strategy)
4. [Content Type & MIME Type Strategy](#content-type-mime-type-strategy)
5. [Discovery Enhancement Design](#discovery-enhancement-design)
6. [Chunking Strategy](#chunking-strategy)
7. [CLI Tool Updates](#cli-tool-updates)
8. [Backward Compatibility](#backward-compatibility)
9. [Specification Amendments](#specification-amendments)
10. [Implementation Roadmap](#implementation-roadmap)

---

## Architecture Decision Records

### ADR-001: TOON as Optional Format Enhancement

**Status:** PROPOSED
**Context:** ARW currently uses Markdown (.llm.md) as the machine-readable format. While effective (85% token reduction), opportunities exist for further optimization through structured notation.

**Decision:**
Introduce TOON (Token-Oriented Object Notation) as an **optional alternative** to Markdown, not a replacement.

**Rationale:**
- Markdown is established, well-understood, and human-friendly
- TOON provides superior structure for complex, hierarchical content
- Optional adoption prevents breaking existing implementations
- Sites can choose the format that best fits their content type
- Some content types benefit more from TOON (APIs, specs, data) vs Markdown (blog posts, narratives)

**Consequences:**
- ARW must support dual content formats
- Discovery mechanisms need format negotiation
- CLI tools need dual generation/validation paths
- Documentation must guide format selection

**Alternatives Considered:**
1. ❌ Replace Markdown with TOON - Breaking change, poor adoption
2. ❌ TOON-only for ARW-4 - Creates fragmentation
3. ✅ **Optional coexistence** - Best of both worlds

---

### ADR-002: TOON File Extension and MIME Type

**Status:** PROPOSED
**Context:** TOON files need distinct identification while maintaining ARW conventions.

**Decision:**
- **File extension:** `.llm.toon`
- **Primary MIME type:** `text/plain; charset=utf-8; format=toon`
- **Alternative MIME type:** `application/x-toon+text; charset=utf-8`
- **Structured MIME type:** `text/x-llm+toon; charset=utf-8`

**Rationale:**
- `.llm.toon` maintains ARW's `.llm.*` namespace convention
- `text/plain` ensures universal agent compatibility (learned from llms.txt issues)
- `format=toon` parameter allows explicit format signaling
- Alternative MIME types support content negotiation
- Follows ARW's proven approach of using safe, standard MIME types

**Consequences:**
- Web servers need MIME type configuration for `.llm.toon`
- Agents need TOON parsing capability
- HTTP Accept headers can request specific formats
- File extension clearly signals format without inspection

**Alternatives Considered:**
1. ❌ `.toon` - Breaks ARW namespace convention
2. ❌ `application/toon` - May trigger binary data issues (learned from application/yaml)
3. ✅ **`.llm.toon` with `text/plain`** - Safe, conventional, explicit

---

### ADR-003: Discovery Through llms.txt Format Field

**Status:** PROPOSED
**Context:** Agents need to discover TOON content without pre-fetching files.

**Decision:**
Add optional `format` field to content items in `llms.txt`:

```yaml
content:
  - url: /api/reference
    machine_view: /api/reference.llm.toon
    format: toon  # NEW FIELD
    purpose: api_documentation
```

**Rationale:**
- Explicit format declaration prevents parsing ambiguity
- Agents can prioritize formats they support
- Backward compatible (field is optional)
- Minimal schema change
- Enables content negotiation strategies

**Consequences:**
- Schema update to ARWManifest type
- Validation rules need format field support
- Agents can filter content by format capability
- Sites signal format expectations clearly

**Alternatives Considered:**
1. ❌ Infer from file extension - Requires URL parsing
2. ❌ Separate `toon_content` array - Schema fragmentation
3. ✅ **Optional `format` field** - Clean, minimal, extensible

---

### ADR-004: Chunking Strategy - TOON Object Boundaries

**Status:** PROPOSED
**Context:** ARW chunks enable precise citations. TOON's object notation provides natural boundaries.

**Decision:**
Map TOON top-level objects to ARW chunks automatically:

**TOON Structure:**
```toon
@product {
  @id: "wireless-keyboard"
  @name: "Wireless Mechanical Keyboard"
  @price: {
    @amount: 79.99
    @currency: "USD"
  }
  @specs: {
    @connectivity: "Bluetooth 5.0"
    @battery: "2000mAh"
  }
  @reviews: [
    { @rating: 5, @text: "Excellent keyboard!" }
  ]
}
```

**ARW Chunk Mapping:**
```yaml
chunks:
  - id: product
    toon_path: "@product"
  - id: product-price
    toon_path: "@product.@price"
  - id: product-specs
    toon_path: "@product.@specs"
  - id: product-reviews
    toon_path: "@product.@reviews"
```

**Rationale:**
- TOON objects are semantic boundaries (not arbitrary)
- `@`-prefixed paths create addressable URIs
- Hierarchical chunking matches TOON's tree structure
- Auto-generation reduces manual chunk definition
- Precise object paths improve citation accuracy

**Consequences:**
- CLI must generate chunks from TOON structure
- Agents can address TOON objects via `toon_path`
- Chunk IDs can be auto-derived from TOON paths
- Validation ensures chunk paths exist in TOON file

**Alternatives Considered:**
1. ❌ Manual chunk markers (like Markdown) - Loses TOON's structural advantage
2. ❌ Flat chunks only - Ignores TOON hierarchy
3. ✅ **Automatic hierarchical chunks from TOON objects** - Leverages format strength

---

### ADR-005: CLI Command Naming - Unified Generate with Format Flag

**Status:** PROPOSED
**Context:** CLI needs to generate both Markdown and TOON formats.

**Decision:**
Extend existing `arw generate` command with `--format` flag:

```bash
# Existing (default)
arw generate input.html --format=markdown  # Generates .llm.md

# New TOON support
arw generate input.html --format=toon      # Generates .llm.toon
arw generate input.json --format=toon      # JSON → TOON conversion

# Dual generation
arw generate input.html --format=both      # Generates both formats
```

**Rationale:**
- Consistent with existing CLI patterns
- `--format` flag is intuitive and discoverable
- Avoids command proliferation (`arw generate-toon`, etc.)
- `--format=both` enables dual-format sites
- Extensible to future formats

**Consequences:**
- `arw generate` needs format detection and routing
- Help text must document format options
- Default remains Markdown (backward compatible)
- Format-specific generators pluggable architecture

**Alternatives Considered:**
1. ❌ Separate `arw toon-generate` command - Command sprawl
2. ❌ Auto-detect from input - Ambiguous, error-prone
3. ✅ **`--format` flag on unified command** - Clean, extensible

---

## System Architecture

### High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                        ARW Discovery Layer                          │
│                         (llms.txt / llms.json)                      │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────┐     │
│  │ Content Discovery Manifest                                │     │
│  │ - Declares available formats (md, toon)                   │     │
│  │ - Maps URLs to machine views                             │     │
│  │ - Defines chunks with format-specific paths              │     │
│  └──────────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
        ┌─────────────────────┴─────────────────────┐
        ↓                                           ↓
┌─────────────────────┐                  ┌──────────────────────┐
│  Markdown Format    │                  │    TOON Format       │
│   (.llm.md)         │                  │    (.llm.toon)       │
├─────────────────────┤                  ├──────────────────────┤
│ • Narrative content │                  │ • Structured data    │
│ • Blog posts        │                  │ • API references     │
│ • Documentation     │                  │ • Product catalogs   │
│ • Human-centric     │                  │ • Configuration      │
│                     │                  │ • Schemas            │
│ MIME Type:          │                  │                      │
│ text/markdown       │                  │ MIME Type:           │
│ text/plain          │                  │ text/plain;          │
│                     │                  │   format=toon        │
│                     │                  │                      │
│ Chunking:           │                  │ Chunking:            │
│ - Heading markers   │                  │ - Object boundaries  │
│ - Manual markers    │                  │ - @-path addressing  │
│ - Regex patterns    │                  │ - Hierarchical       │
└─────────────────────┘                  └──────────────────────┘
        ↓                                           ↓
┌─────────────────────────────────────────────────────────────────┐
│                  ARW Chunking & Citation Layer                  │
│                                                                 │
│  Unified chunk addressing:                                      │
│  - Markdown: #chunk-id → heading section                       │
│  - TOON: #chunk-id → @object.@path                             │
│                                                                 │
│  Citation format:                                               │
│  https://example.com/page.llm.md#section-id                    │
│  https://example.com/page.llm.toon#@product.@specs             │
└─────────────────────────────────────────────────────────────────┘
        ↓
┌─────────────────────────────────────────────────────────────────┐
│                    AI Agent Consumption                         │
│                                                                 │
│  Agent workflow:                                                │
│  1. Fetch llms.txt/llms.json                                    │
│  2. Check format field for each content item                   │
│  3. Select format based on capability & preference             │
│  4. Parse format-specific content                              │
│  5. Use chunks for precise citation                            │
└─────────────────────────────────────────────────────────────────┘
```

### Component Interaction Diagram

```
┌────────────┐          ┌──────────────┐         ┌─────────────┐
│  AI Agent  │          │  ARW Server  │         │   Storage   │
└──────┬─────┘          └──────┬───────┘         └──────┬──────┘
       │                       │                        │
       │ 1. GET /llms.json     │                        │
       ├──────────────────────>│                        │
       │                       │                        │
       │ 2. Return manifest    │                        │
       │    with format fields │                        │
       │<──────────────────────┤                        │
       │                       │                        │
       │ 3. Parse & select     │                        │
       │    preferred format   │                        │
       │    (toon if supported)│                        │
       │                       │                        │
       │ 4. GET /page.llm.toon │                        │
       │    Accept: text/plain;│                        │
       │            format=toon│                        │
       ├──────────────────────>│                        │
       │                       │ 5. Fetch .llm.toon     │
       │                       ├───────────────────────>│
       │                       │                        │
       │                       │ 6. Return TOON content │
       │                       │<───────────────────────┤
       │                       │                        │
       │ 7. Return with        │                        │
       │    Content-Type       │                        │
       │<──────────────────────┤                        │
       │                       │                        │
       │ 8. Parse TOON         │                        │
       │    structure          │                        │
       │                       │                        │
       │ 9. Extract chunks     │                        │
       │    via @-paths        │                        │
       │                       │                        │
       │ 10. Cite with         │                        │
       │     URL + toon_path   │                        │
       │                       │                        │
```

### Data Flow: Dual Format Content Pipeline

```
┌────────────────┐
│  Source Content│
│  (HTML/JSON/   │
│   Database)    │
└────────┬───────┘
         │
         ↓
┌────────────────────────────────────┐
│   ARW CLI / Build Process          │
│                                    │
│   arw generate --format=both       │
└────────┬───────────────────────────┘
         │
    ┌────┴────┐
    ↓         ↓
┌─────────┐ ┌────────────┐
│ .llm.md │ │ .llm.toon  │
│ Generator│ │  Generator │
└────┬────┘ └─────┬──────┘
     │            │
     ↓            ↓
┌─────────┐  ┌──────────┐
│ page.   │  │ page.    │
│ llm.md  │  │ llm.toon │
└────┬────┘  └─────┬────┘
     │            │
     └────┬───────┘
          ↓
┌──────────────────────┐
│  Chunk Extractor     │
│  - MD: heading-based │
│  - TOON: object-based│
└──────────┬───────────┘
           │
           ↓
┌──────────────────────┐
│  llms.txt Updater    │
│  - Add content items │
│  - Set format field  │
│  - Map chunks        │
└──────────┬───────────┘
           │
           ↓
┌──────────────────────┐
│  Deployment          │
│  - Publish files     │
│  - Configure MIME    │
│  - Update manifest   │
└──────────────────────┘
```

---

## Format Coexistence Strategy

### Decision Matrix: When to Use Each Format

| Content Type              | Recommended Format | Rationale                                           |
|---------------------------|--------------------|-----------------------------------------------------|
| Blog posts                | **Markdown**       | Narrative structure, human-centric                  |
| Documentation (narrative) | **Markdown**       | Headings, lists, inline code work well              |
| API References            | **TOON**           | Structured endpoints, parameters, responses         |
| Product Catalogs          | **TOON**           | Hierarchical attributes, specs, pricing             |
| Configuration Schemas     | **TOON**           | Nested objects, type definitions                    |
| FAQ / Support Articles    | **Markdown**       | Q&A format, conversational                          |
| OpenAPI Specs             | **TOON**           | Already structured, maps naturally                  |
| Data Tables               | **TOON**           | Rows as objects, columns as fields                  |
| Legal Documents           | **Markdown**       | Linear structure, section references                |
| Technical Specifications  | **Both**           | Narrative + structured data sections                |

### Hybrid Strategy: Using Both Formats on One Site

**Scenario:** E-commerce site with diverse content

```yaml
# /llms.txt
version: 1.0
profile: ARW-2

content:
  # Narrative content → Markdown
  - url: /blog/2024-holiday-guide
    machine_view: /blog/2024-holiday-guide.llm.md
    format: markdown
    purpose: blog_post

  # Structured content → TOON
  - url: /products/wireless-keyboard
    machine_view: /products/wireless-keyboard.llm.toon
    format: toon
    purpose: product_information
    chunks:
      - id: product
        toon_path: "@product"
      - id: specs
        toon_path: "@product.@specs"

  # Mixed content → Provide both formats
  - url: /docs/api/authentication
    machine_view: /docs/api/authentication.llm.md
    machine_view_toon: /docs/api/authentication.llm.toon
    format: both
    purpose: technical_documentation
```

### Content Negotiation Strategy

**HTTP Accept Header Mechanism:**

```http
# Agent requests TOON if available, Markdown as fallback
GET /products/wireless-keyboard
Accept: text/plain; format=toon, text/markdown;q=0.9, */*;q=0.8
```

**Server Response Logic:**

```
1. Check if TOON version exists (.llm.toon)
2. If yes and Accept includes format=toon → return TOON
3. Else if Markdown exists (.llm.md) → return Markdown
4. Else fallback to HTML (human view)
```

**Implementation Pattern (Nginx):**

```nginx
location ~ ^(/.*) {
    set $base_path $1;

    # Try TOON if accepted
    if ($http_accept ~* "format=toon") {
        try_files $base_path.llm.toon $base_path.llm.md $base_path/index.html =404;
    }

    # Default: try Markdown first
    try_files $base_path.llm.md $base_path/index.html =404;
}
```

### Format Conversion Workflow

**TOON ↔ Markdown Conversion:**

```bash
# Convert Markdown to TOON (for structured content)
arw convert page.llm.md --to=toon --output=page.llm.toon

# Convert TOON to Markdown (for narrative rendering)
arw convert page.llm.toon --to=markdown --output=page.llm.md

# Validation after conversion
arw validate page.llm.toon --strict
```

**Conversion Fidelity:**

| Conversion Path    | Fidelity | Notes                                      |
|--------------------|----------|--------------------------------------------|
| MD → TOON          | Medium   | Loses some narrative flow                  |
| TOON → MD          | High     | Renders objects as structured Markdown     |
| HTML → TOON        | High     | Semantic HTML maps well to TOON objects    |
| HTML → MD          | High     | Existing ARW pipeline                      |

---

## Content Type & MIME Type Strategy

### MIME Type Specification

**TOON MIME Type Priority (in order of safety):**

1. **Primary (Recommended):**
   `text/plain; charset=utf-8; format=toon`
   - **Pros:** Universal agent compatibility, no binary data issues
   - **Cons:** Requires format parameter parsing
   - **Use:** Default for maximum compatibility

2. **Structured Alternative:**
   `text/x-llm+toon; charset=utf-8`
   - **Pros:** Signals ARW-specific TOON format
   - **Cons:** Custom MIME type may trigger issues in some agents
   - **Use:** When clients explicitly support ARW

3. **Generic Alternative:**
   `application/x-toon+text; charset=utf-8`
   - **Pros:** Follows MIME type conventions for custom formats
   - **Cons:** May trigger binary data handling
   - **Use:** Advanced use cases with guaranteed agent support

**Recommendation:**
Use `text/plain; charset=utf-8; format=toon` as default. This follows ARW's proven strategy from the llms.txt MIME type fix (Amendment #1).

### File Extension Specification

**TOON File Extensions:**

- **Standard:** `.llm.toon`
- **Alternative:** `.toon` (if outside ARW context)
- **Combined:** `.llm.toon.txt` (for restrictive servers)

**Rationale for `.llm.toon`:**
- Maintains ARW namespace (`.llm.*`)
- Clearly signals machine-readable content
- Distinguishes from raw `.toon` files
- Follows `.llm.md` precedent

### HTTP Header Strategy

**Required Headers for TOON Content:**

```http
HTTP/1.1 200 OK
Content-Type: text/plain; charset=utf-8; format=toon
AI-Content-Format: toon
AI-ARW-Version: 1.0
AI-Machine-Readable: true
Cache-Control: public, max-age=3600
ETag: "toon-v2-abc123"
Link: <https://example.com/page>; rel="canonical"
Link: <https://example.com/page.llm.md>; rel="alternate"; type="text/markdown"
```

**Header Semantics:**

- `Content-Type`: Primary MIME type with format parameter
- `AI-Content-Format`: Explicit format signal (new ARW header)
- `AI-ARW-Version`: ARW specification version
- `Link rel=canonical`: Points to human HTML version
- `Link rel=alternate`: Points to Markdown alternative (if available)

**New ARW Header Proposal: `AI-Content-Format`**

```http
AI-Content-Format: toon
AI-Content-Format: markdown
AI-Content-Format: json-ld
```

**Purpose:**
- Eliminates MIME type parsing ambiguity
- Explicit format signaling for agents
- Enables format-specific processing
- Backward compatible (optional header)

---

## Discovery Enhancement Design

### llms.txt Schema Changes

**Current ARW Schema (ContentItem):**

```typescript
export interface ContentItem {
  url: string;
  machine_view?: string;
  title?: string;
  description?: string;
  priority?: Priority;
  tags?: string[];
  last_modified?: string;
  changefreq?: string;
}
```

**Enhanced Schema with TOON Support:**

```typescript
export interface ContentItem {
  url: string;

  // Format-specific machine views
  machine_view?: string;              // Primary machine view (any format)
  machine_view_markdown?: string;     // Explicit Markdown view
  machine_view_toon?: string;         // Explicit TOON view

  // Format declaration
  format?: 'markdown' | 'toon' | 'both' | 'json-ld';  // NEW FIELD

  title?: string;
  description?: string;
  priority?: Priority;
  tags?: string[];
  last_modified?: string;
  changefreq?: string;

  // TOON-specific metadata
  toon_schema?: string;               // URL to TOON schema definition
}
```

**Backward Compatibility:**
- `machine_view` remains primary field (no breaking change)
- `format` is optional (defaults to 'markdown' if not specified)
- `machine_view_markdown` and `machine_view_toon` are explicit overrides
- Existing ARW v0.1 manifests remain valid

**Example: Dual Format Content**

```yaml
content:
  - url: /api/reference
    machine_view_markdown: /api/reference.llm.md
    machine_view_toon: /api/reference.llm.toon
    format: both
    purpose: api_documentation
    chunks:
      # Markdown chunks
      - id: overview
        heading: "API Overview"
        format: markdown

      # TOON chunks (hierarchical)
      - id: endpoints
        toon_path: "@api.@endpoints"
        format: toon

      - id: authentication
        toon_path: "@api.@authentication"
        format: toon
```

### Discovery Flow Enhancement

**Agent Discovery Algorithm (Updated):**

```javascript
async function discoverContent(domain, contentItem) {
  const { format, machine_view, machine_view_toon, machine_view_markdown } = contentItem;

  // Priority 1: Explicit format-specific views
  if (machine_view_toon && agentSupports('toon')) {
    return await fetchTOON(domain + machine_view_toon);
  }

  if (machine_view_markdown) {
    return await fetchMarkdown(domain + machine_view_markdown);
  }

  // Priority 2: Generic machine_view with format hint
  if (machine_view) {
    if (format === 'toon' && agentSupports('toon')) {
      return await fetchTOON(domain + machine_view);
    } else if (format === 'markdown' || !format) {
      return await fetchMarkdown(domain + machine_view);
    } else if (format === 'both') {
      // Content negotiation
      return await fetchWithNegotiation(domain + machine_view);
    }
  }

  // Priority 3: Fallback to canonical URL
  return await fetchHTML(domain + contentItem.url);
}
```

### Well-Known Endpoint Enhancement

**New Discovery Endpoint: `/.well-known/arw-formats.json`**

```json
{
  "arw_version": "1.0",
  "supported_formats": ["markdown", "toon"],
  "default_format": "markdown",
  "format_capabilities": {
    "markdown": {
      "mime_types": ["text/markdown", "text/plain"],
      "extensions": [".llm.md"],
      "chunking": "heading-based"
    },
    "toon": {
      "mime_types": ["text/plain; format=toon", "text/x-llm+toon"],
      "extensions": [".llm.toon"],
      "chunking": "object-based",
      "schema": "https://toon-spec.org/v1.0"
    }
  },
  "negotiation": {
    "enabled": true,
    "accept_header": true
  }
}
```

**Purpose:**
- Advertise format capabilities upfront
- Prevent unnecessary HTTP requests
- Enable intelligent format selection
- Document MIME types and extensions

---

## Chunking Strategy

### TOON Object-Based Chunking

**Core Principle:**
TOON objects are semantic boundaries that map naturally to ARW chunks.

**TOON Path Syntax:**

```
@object             → Root object
@object.@property   → Nested property
@object.@array[0]   → Array element
@object.@nested.@deep  → Deep path
```

**Example: Product Data**

**TOON File (`product.llm.toon`):**

```toon
@product {
  @id: "wireless-keyboard-v2"
  @name: "Wireless Mechanical Keyboard"
  @category: "Electronics > Keyboards"

  @pricing {
    @amount: 79.99
    @currency: "USD"
    @discount: {
      @active: true
      @percentage: 15
      @ends: "2025-12-31"
    }
  }

  @specifications {
    @connectivity: "Bluetooth 5.0 + USB-C"
    @battery: "2000mAh rechargeable"
    @layout: "Tenkeyless (TKL)"
    @switches: "Cherry MX Brown"
    @dimensions: {
      @width: 355
      @depth: 127
      @height: 40
      @unit: "mm"
    }
  }

  @reviews {
    @average_rating: 4.7
    @total_reviews: 328
    @items: [
      {
        @author: "JohnD"
        @rating: 5
        @title: "Best keyboard I've owned"
        @text: "Excellent build quality and typing feel."
        @verified: true
      }
    ]
  }
}
```

**Generated ARW Chunks:**

```yaml
chunks:
  # Root object
  - id: product
    toon_path: "@product"
    title: "Product Overview"
    description: "Complete product information"

  # Top-level sections
  - id: pricing
    toon_path: "@product.@pricing"
    title: "Pricing Information"
    description: "Price, currency, and active discounts"

  - id: specifications
    toon_path: "@product.@specifications"
    title: "Technical Specifications"
    description: "Detailed product specifications"

  - id: reviews
    toon_path: "@product.@reviews"
    title: "Customer Reviews"
    description: "Ratings and customer feedback"

  # Nested chunks (optional, for deep addressing)
  - id: pricing-discount
    toon_path: "@product.@pricing.@discount"
    title: "Active Discount"
    parent: pricing

  - id: specs-dimensions
    toon_path: "@product.@specifications.@dimensions"
    title: "Physical Dimensions"
    parent: specifications
```

### Chunk Addressing & Citation

**Citation URI Format:**

```
https://example.com/products/wireless-keyboard.llm.toon#@product.@pricing
                                                        └─────┬──────┘
                                                         TOON Path
```

**Agent Workflow:**

1. Fetch TOON file: `GET /products/wireless-keyboard.llm.toon`
2. Parse TOON structure
3. Extract chunk via path: `@product.@pricing`
4. Use only that object in context (precise citation)
5. Cite source: `https://example.com/products/wireless-keyboard.llm.toon#@product.@pricing`

**Token Efficiency:**

```
Scenario: Agent needs pricing info

Without chunks (full file): 856 tokens
With TOON chunk (@pricing): 42 tokens
Reduction: 95%

With HTML scraping: 1,247 tokens
Reduction vs HTML: 96.6%
```

### Automatic Chunk Generation Algorithm

**CLI Implementation:**

```bash
arw generate product.html --format=toon --auto-chunks
```

**Algorithm:**

```
1. Parse TOON file to AST
2. Identify all top-level @ objects
3. For each object:
   a. Generate chunk ID from object name
   b. Create toon_path
   c. Extract title from object properties (if exists)
   d. Calculate depth
4. Optionally recurse for nested objects (--deep-chunks flag)
5. Generate chunks YAML
6. Append to llms.txt content item
```

**Example Output:**

```yaml
# Auto-generated chunks from product.llm.toon
chunks:
  - id: product
    toon_path: "@product"
    auto_generated: true
  - id: pricing
    toon_path: "@product.@pricing"
    auto_generated: true
    parent: product
  - id: specifications
    toon_path: "@product.@specifications"
    auto_generated: true
    parent: product
  - id: reviews
    toon_path: "@product.@reviews"
    auto_generated: true
    parent: product
```

### Hybrid Chunking: Markdown + TOON

**Scenario:** API documentation with narrative + structured data

**Structure:**

```
/docs/api/authentication.llm.md (Narrative)
/docs/api/authentication.llm.toon (Endpoint specs)
```

**Unified Chunks:**

```yaml
content:
  - url: /docs/api/authentication
    machine_view_markdown: /docs/api/authentication.llm.md
    machine_view_toon: /docs/api/authentication.llm.toon
    format: both
    chunks:
      # Markdown chunks
      - id: overview
        heading: "## Overview"
        format: markdown

      - id: oauth-flow
        heading: "## OAuth 2.0 Flow"
        format: markdown

      # TOON chunks (structured endpoints)
      - id: endpoints
        toon_path: "@endpoints"
        format: toon

      - id: token-endpoint
        toon_path: "@endpoints.@token"
        format: toon
        parent: endpoints
```

**Agent Strategy:**
- Read Markdown for conceptual understanding
- Read TOON for precise parameter/response details
- Combine both for comprehensive context

---

## CLI Tool Updates

### Command Structure

**New Commands:**

```bash
# Generate TOON from HTML/JSON
arw generate <input> --format=toon [--output=<file>]

# Generate both formats
arw generate <input> --format=both

# Convert between formats
arw convert <input> --to=toon|markdown [--output=<file>]

# Validate TOON files
arw validate <file.llm.toon> [--schema=<url>]

# Auto-generate chunks from TOON
arw chunks extract <file.llm.toon> [--deep] [--format=yaml|json]

# Test format compatibility
arw test-format <url> --format=toon
```

### Command Specifications

#### `arw generate --format=toon`

**Syntax:**

```bash
arw generate [OPTIONS] <INPUT>

Options:
  --format=<markdown|toon|both>   Output format (default: markdown)
  --output=<path>                 Output file path
  --auto-chunks                   Auto-generate chunks from structure
  --deep-chunks                   Generate nested chunks (TOON only)
  --schema=<url>                  TOON schema URL for validation
  --recursive                     Process directories recursively
```

**Examples:**

```bash
# Generate TOON from HTML
arw generate product.html --format=toon --output=product.llm.toon

# Generate TOON from JSON API response
arw generate api-response.json --format=toon --auto-chunks

# Generate both formats with chunks
arw generate docs.html --format=both --auto-chunks --deep-chunks

# Recursive generation
arw generate ./content --format=toon --recursive
```

**Output:**

```
✓ Generated product.llm.toon (842 bytes)
✓ Auto-generated 5 chunks
✓ Validated against TOON schema

  Files created:
    - product.llm.toon
    - product.llm.toon.chunks.yaml

  Next steps:
    1. Review generated TOON structure
    2. Run: arw validate product.llm.toon
    3. Add to llms.txt manifest
```

#### `arw convert`

**Syntax:**

```bash
arw convert [OPTIONS] <INPUT>

Options:
  --to=<markdown|toon|json-ld>    Target format
  --output=<path>                 Output file path
  --preserve-chunks               Keep existing chunk definitions
  --validate                      Validate after conversion
```

**Examples:**

```bash
# TOON to Markdown
arw convert api.llm.toon --to=markdown --output=api.llm.md

# Markdown to TOON (if structure is detected)
arw convert blog.llm.md --to=toon --output=blog.llm.toon

# With validation
arw convert api.llm.toon --to=markdown --validate
```

**Conversion Matrix:**

| From → To   | Markdown | TOON | JSON-LD |
|-------------|----------|------|---------|
| Markdown    | N/A      | ⚠️   | ✅      |
| TOON        | ✅       | N/A  | ✅      |
| JSON-LD     | ✅       | ✅   | N/A     |
| HTML        | ✅       | ✅   | ⚠️      |

✅ High fidelity
⚠️ Lossy conversion (structure detection required)

#### `arw chunks extract`

**Syntax:**

```bash
arw chunks extract [OPTIONS] <TOON_FILE>

Options:
  --deep                  Extract nested chunks
  --format=<yaml|json>    Output format (default: yaml)
  --output=<path>         Output file path
  --max-depth=<n>         Maximum nesting depth (default: 3)
  --min-size=<bytes>      Minimum chunk size threshold
```

**Examples:**

```bash
# Extract top-level chunks
arw chunks extract product.llm.toon

# Deep extraction with nesting
arw chunks extract api.llm.toon --deep --max-depth=5

# Output as JSON
arw chunks extract product.llm.toon --format=json --output=chunks.json
```

**Output:**

```yaml
# Auto-extracted from product.llm.toon
chunks:
  - id: product
    toon_path: "@product"
    size_bytes: 842
    depth: 0

  - id: pricing
    toon_path: "@product.@pricing"
    size_bytes: 156
    depth: 1
    parent: product

  - id: specifications
    toon_path: "@product.@specifications"
    size_bytes: 312
    depth: 1
    parent: product

# Total: 3 chunks extracted
# Deepest: 1 levels
# Largest: product (842 bytes)
```

#### `arw validate --format=toon`

**Enhanced Validation:**

```bash
arw validate <file> [OPTIONS]

Options:
  --format=<auto|toon|markdown|yaml>  Format (auto-detected by default)
  --schema=<url>                      Schema URL for validation
  --strict                            Strict validation mode
  --chunks                            Validate chunk paths exist
```

**TOON-Specific Validations:**

1. **Syntax validation**: Valid TOON grammar
2. **Schema validation**: Matches declared schema (if provided)
3. **Chunk path validation**: All `toon_path` values exist in file
4. **MIME type check**: Correct Content-Type header (if URL)
5. **File extension check**: Uses `.llm.toon`

**Example:**

```bash
arw validate product.llm.toon --strict --chunks

# Output:
✓ TOON syntax valid
✓ File extension correct (.llm.toon)
✓ All chunk paths exist (5/5)
✓ No duplicate object keys
⚠ Warning: No schema declared

  Summary:
    Format: TOON
    Size: 842 bytes
    Objects: 5
    Max depth: 2 levels
    Chunks: 5 validated

  Recommendation:
    Add toon_schema field to llms.txt for full validation
```

### CLI Architecture Changes

**File Structure:**

```
packages/cli/src/
├── commands/
│   ├── generate.rs         # Enhanced with format flag
│   ├── convert.rs          # NEW: Format conversion
│   ├── chunks.rs           # NEW: Chunk extraction
│   └── validate.rs         # Enhanced with TOON support
├── generators/
│   ├── markdown.rs         # Existing Markdown generator
│   └── toon.rs             # NEW: TOON generator
├── parsers/
│   ├── html.rs
│   ├── markdown.rs
│   └── toon.rs             # NEW: TOON parser
├── validators/
│   ├── arw.rs
│   └── toon.rs             # NEW: TOON validator
└── utils/
    ├── chunks.rs           # NEW: Chunk utilities
    └── formats.rs          # NEW: Format detection
```

**Rust Dependencies:**

```toml
[dependencies]
# Existing
serde = "1.0"
serde_yaml = "0.9"
serde_json = "1.0"

# New for TOON
toon-parser = "0.1"       # TOON parsing library
toon-schema = "0.1"       # TOON schema validation
```

---

## Backward Compatibility

### Compatibility Matrix

| ARW Version | TOON Support | Markdown Support | Breaking Changes |
|-------------|--------------|------------------|------------------|
| v0.1        | ❌ None      | ✅ Full          | N/A              |
| v1.0-toon   | ✅ Full      | ✅ Full          | ❌ None          |
| Future      | ✅ Enhanced  | ✅ Full          | TBD              |

### Migration Strategies

#### Strategy 1: Additive Migration (Zero Risk)

**For existing ARW sites:**

```
Phase 1: No changes (continue using Markdown)
  ✓ Existing .llm.md files work
  ✓ llms.txt format unchanged
  ✓ No action required

Phase 2: Selective TOON adoption (optional)
  1. Identify structured content (products, APIs)
  2. Generate TOON versions: arw generate --format=toon
  3. Add format field to llms.txt
  4. Serve both formats

Phase 3: Full TOON (optional)
  1. Convert remaining content
  2. Update llms.txt with format fields
  3. Keep Markdown as fallback
```

#### Strategy 2: Dual Format (Maximum Compatibility)

**Serve both formats for all content:**

```yaml
# llms.txt
content:
  - url: /products/keyboard
    machine_view_markdown: /products/keyboard.llm.md
    machine_view_toon: /products/keyboard.llm.toon
    format: both
```

**Benefits:**
- Agents choose preferred format
- No agent left behind
- A/B testing format effectiveness
- Gradual agent ecosystem transition

**Build Process:**

```bash
#!/bin/bash
# Dual format generation

for html_file in content/*.html; do
  base=$(basename "$html_file" .html)

  # Generate Markdown
  arw generate "$html_file" --format=markdown \
      --output="public/${base}.llm.md"

  # Generate TOON
  arw generate "$html_file" --format=toon \
      --output="public/${base}.llm.toon" \
      --auto-chunks

  # Update llms.txt
  arw update-manifest --url="/${base}" \
      --markdown="/${base}.llm.md" \
      --toon="/${base}.llm.toon" \
      --format=both
done
```

#### Strategy 3: TOON-First (Modern Sites)

**For new ARW implementations:**

```yaml
# Use TOON as primary, Markdown as fallback
content:
  - url: /api/reference
    machine_view: /api/reference.llm.toon  # Primary
    machine_view_markdown: /api/reference.llm.md  # Fallback
    format: toon
```

### Deprecation Policy

**Markdown will NEVER be deprecated.**

ARW's commitment:
- Markdown is a permanent, supported format
- TOON is an additional option, not a replacement
- Sites can use Markdown-only indefinitely
- No forced migrations

**Rationale:**
- Markdown is established and well-understood
- Many content types are better suited for Markdown
- Community adoption relies on stability
- Format choice should be based on content needs, not mandates

---

## Specification Amendments

### Amendment Proposal: ARW v1.0 with TOON Support

**Specification Changes Required:**

#### 1. Section 3.2: Format Enhancement

**Current:**

```markdown
### 3.2 Format

ARW manifests MUST be available in at least one of two canonical formats:
1. YAML Format (/llms.txt)
2. JSON Format (/llms.json)
```

**Amended:**

```markdown
### 3.2 Format

ARW manifests MUST be available in at least one of two canonical formats:
1. YAML Format (/llms.txt)
2. JSON Format (/llms.json)

Machine-readable content MUST use at least one of these formats:
1. Markdown (.llm.md) - Narrative content
2. TOON (.llm.toon) - Structured content (ARW v1.0+)

Sites MAY provide multiple formats for the same content.
```

#### 2. Section 4: Machine Views - TOON Format

**New Section 4.3: TOON Format Specification**

```markdown
### 4.3 TOON Format Specification

**File Extension:** `.llm.toon`

**MIME Types (priority order):**
1. `text/plain; charset=utf-8; format=toon` (RECOMMENDED)
2. `text/x-llm+toon; charset=utf-8` (ACCEPTABLE)

**Use Cases:**
- API documentation and specifications
- Product catalogs with hierarchical attributes
- Configuration schemas
- Structured data with complex nesting

**Chunking:**
TOON chunks MUST use `toon_path` field with @-path syntax:

```yaml
chunks:
  - id: pricing
    toon_path: "@product.@pricing"
```

**HTTP Headers:**
TOON content MUST include:
- `Content-Type: text/plain; charset=utf-8; format=toon`
- `AI-Content-Format: toon` (RECOMMENDED)
- `Link: <url>; rel="alternate"; type="text/markdown"` (if Markdown version exists)

**Schema Declaration:**
Sites MAY declare TOON schemas:

```yaml
content:
  - url: /api/spec
    machine_view_toon: /api/spec.llm.toon
    toon_schema: https://example.com/schemas/api-v1.toon-schema
```

**Validation:**
TOON files SHOULD be validated using:
```bash
arw validate file.llm.toon --schema=<url>
```
```

#### 3. Section 3.3: ContentItem Schema Update

**Current TypeScript:**

```typescript
export interface ContentItem {
  url: string;
  machine_view?: string;
  title?: string;
  // ...
}
```

**Amended:**

```typescript
export interface ContentItem {
  url: string;

  // Format-neutral machine view
  machine_view?: string;

  // Format-specific machine views (v1.0+)
  machine_view_markdown?: string;
  machine_view_toon?: string;

  // Format declaration
  format?: 'markdown' | 'toon' | 'both' | 'json-ld';

  // TOON-specific
  toon_schema?: string;  // URL to TOON schema

  title?: string;
  // ... rest unchanged
}
```

#### 4. Section 5: Chunks Enhancement

**Current:**

```yaml
chunks:
  - id: section-id
    heading: "## Heading"
```

**Amended:**

```yaml
chunks:
  # Markdown chunk (existing)
  - id: section-id
    heading: "## Heading"
    format: markdown

  # TOON chunk (new)
  - id: pricing
    toon_path: "@product.@pricing"
    format: toon

  # Hierarchical TOON chunk (new)
  - id: pricing-discount
    toon_path: "@product.@pricing.@discount"
    format: toon
    parent: pricing
```

**New Chunk Fields:**

- `toon_path` (string, optional): TOON object path using @-syntax
- `format` (enum, optional): 'markdown' | 'toon'
- `parent` (string, optional): Parent chunk ID for hierarchical chunks

#### 5. Section 8: AI-* Headers - New Format Header

**New Header:**

```http
AI-Content-Format: <format>
```

**Values:**
- `markdown` - Markdown content
- `toon` - TOON content
- `json-ld` - JSON-LD structured data
- `html` - Human HTML view

**Example:**

```http
GET /products/keyboard.llm.toon HTTP/1.1
Host: example.com

HTTP/1.1 200 OK
Content-Type: text/plain; charset=utf-8; format=toon
AI-Content-Format: toon
AI-ARW-Version: 1.0
AI-Machine-Readable: true
```

**Purpose:**
- Explicit format signaling
- Eliminates MIME type parsing
- Enables format-specific agent processing
- Optional but RECOMMENDED

---

## Implementation Roadmap

### Phase 1: Foundation (Weeks 1-2)

**Deliverables:**

1. **TOON Parser & Validator**
   - Implement TOON syntax parser (Rust)
   - Schema validation support
   - Error reporting

2. **CLI Foundation**
   - `arw generate --format=toon` basic implementation
   - `arw validate` TOON support
   - File extension handling

3. **Schema Updates**
   - TypeScript types for TOON fields
   - JSON schema updates
   - LinkML schema amendments

**Testing:**
- Unit tests for TOON parser
- Integration tests for CLI
- Schema validation tests

**Success Criteria:**
- [ ] Can generate basic TOON from HTML
- [ ] Can validate TOON syntax
- [ ] Schema changes backward compatible

### Phase 2: Chunking & Discovery (Weeks 3-4)

**Deliverables:**

1. **Chunk Extraction**
   - `arw chunks extract` command
   - Auto-generation algorithm
   - Deep nesting support

2. **llms.txt Integration**
   - `format` field support
   - `machine_view_toon` field
   - `toon_path` chunk field

3. **Discovery Updates**
   - `/.well-known/arw-formats.json` spec
   - Format negotiation logic
   - Agent discovery algorithm

**Testing:**
- Chunk extraction accuracy tests
- Discovery flow integration tests
- Format negotiation tests

**Success Criteria:**
- [ ] Auto-generates chunks from TOON
- [ ] llms.txt validates with TOON fields
- [ ] Agents can discover TOON content

### Phase 3: Conversion & Interop (Weeks 5-6)

**Deliverables:**

1. **Format Conversion**
   - `arw convert` command
   - TOON ↔ Markdown conversion
   - Fidelity testing

2. **Dual Format Support**
   - `--format=both` generation
   - Build pipeline examples
   - Nginx configuration templates

3. **HTTP Headers**
   - `AI-Content-Format` header support
   - MIME type configuration guides
   - Server config examples

**Testing:**
- Conversion round-trip tests
- Dual format serving tests
- HTTP header compliance tests

**Success Criteria:**
- [ ] Can convert between formats
- [ ] Can serve dual formats
- [ ] Headers correctly set

### Phase 4: Documentation & Examples (Weeks 7-8)

**Deliverables:**

1. **Specification Amendment**
   - ARW v1.0 spec updates
   - TOON format specification
   - Migration guide

2. **Examples**
   - Product catalog (TOON)
   - API reference (TOON)
   - Hybrid site (both formats)

3. **Documentation**
   - CLI command reference
   - Format selection guide
   - Chunking best practices

**Testing:**
- Example site validation
- Documentation accuracy review
- User testing feedback

**Success Criteria:**
- [ ] Spec amendments complete
- [ ] 3+ working examples
- [ ] Documentation comprehensive

### Phase 5: Validation & Rollout (Weeks 9-10)

**Deliverables:**

1. **Comprehensive Testing**
   - Agent compatibility testing
   - Performance benchmarks
   - Edge case validation

2. **Reference Implementations**
   - Update arw.dev with TOON
   - CloudCart example site
   - API documentation site

3. **Community Rollout**
   - Announce TOON support
   - Gather feedback
   - Iterate on issues

**Testing:**
- Real-world site testing
- Agent tool testing (Claude, ChatGPT, etc.)
- Performance profiling

**Success Criteria:**
- [ ] 3+ real sites using TOON
- [ ] No major issues reported
- [ ] Agent compatibility verified

### Timeline Summary

```
Weeks 1-2:  Foundation
Weeks 3-4:  Chunking & Discovery
Weeks 5-6:  Conversion & Interop
Weeks 7-8:  Documentation & Examples
Weeks 9-10: Validation & Rollout

Total: 10 weeks to production-ready TOON support
```

### Resource Requirements

**Development:**
- 1 Rust developer (CLI implementation)
- 1 TypeScript developer (schema & validation)
- 1 Technical writer (documentation)

**Testing:**
- 1 QA engineer (test suite)
- Community beta testers (3-5 sites)

**Infrastructure:**
- CI/CD pipeline updates
- Example site hosting
- Schema registry hosting

---

## Appendix A: TOON Format Quick Reference

### What is TOON?

**TOON (Token-Oriented Object Notation)** is a lightweight, human-readable structured data format optimized for AI agent consumption.

**Key Features:**
- **@-prefixed objects**: Semantic object naming
- **Hierarchical**: Native nesting support
- **Token-efficient**: Minimal syntax overhead
- **Type-safe**: Explicit type declarations
- **Schema-aware**: Validation support

**Example:**

```toon
@person {
  @name: "Alice Johnson"
  @age: 32
  @email: "alice@example.com"
  @address: {
    @street: "123 Main St"
    @city: "Springfield"
    @zip: "12345"
  }
  @skills: ["Python", "Rust", "TypeScript"]
}
```

**Equivalent JSON (for comparison):**

```json
{
  "person": {
    "name": "Alice Johnson",
    "age": 32,
    "email": "alice@example.com",
    "address": {
      "street": "123 Main St",
      "city": "Springfield",
      "zip": "12345"
    },
    "skills": ["Python", "Rust", "TypeScript"]
  }
}
```

**Token Comparison:**

- TOON: ~87 tokens
- JSON: ~95 tokens
- Markdown: ~102 tokens
- HTML: ~145 tokens

**Reduction: ~40% vs HTML, ~15% vs Markdown**

---

## Appendix B: Example Integration - CloudCart E-commerce

### Scenario

CloudCart wants to provide both Markdown (for blog/docs) and TOON (for product catalog).

### Implementation

**1. Generate Content:**

```bash
# Blog posts → Markdown
arw generate blog/*.html --format=markdown --output=public/blog/

# Product pages → TOON
arw generate products/*.html --format=toon --auto-chunks --output=public/products/

# API docs → Both formats
arw generate api-docs/*.html --format=both --output=public/docs/
```

**2. llms.txt Manifest:**

```yaml
version: 1.0
profile: ARW-2

site:
  name: "CloudCart"
  homepage: "https://cloudcart.example.com"
  contact: "ai@cloudcart.example.com"

content:
  # Blog (Markdown)
  - url: /blog/2024-holiday-guide
    machine_view: /blog/2024-holiday-guide.llm.md
    format: markdown
    purpose: blog_post

  # Products (TOON)
  - url: /products/wireless-keyboard
    machine_view: /products/wireless-keyboard.llm.toon
    format: toon
    purpose: product_information
    chunks:
      - id: product
        toon_path: "@product"
      - id: pricing
        toon_path: "@product.@pricing"
      - id: specs
        toon_path: "@product.@specs"
      - id: reviews
        toon_path: "@product.@reviews"

  # API Docs (Both)
  - url: /docs/api/authentication
    machine_view_markdown: /docs/api/authentication.llm.md
    machine_view_toon: /docs/api/authentication.llm.toon
    format: both
    purpose: technical_documentation
```

**3. Nginx Configuration:**

```nginx
# MIME type configuration
types {
    text/markdown                     md;
    text/plain                        txt llm.md;
}

# TOON MIME type
location ~ \.llm\.toon$ {
    types { }
    default_type "text/plain; charset=utf-8; format=toon";
    add_header AI-Content-Format "toon" always;
    add_header AI-ARW-Version "1.0" always;
    add_header AI-Machine-Readable "true" always;
}

# Markdown MIME type
location ~ \.llm\.md$ {
    types { }
    default_type "text/markdown; charset=utf-8";
    add_header AI-Content-Format "markdown" always;
    add_header AI-ARW-Version "1.0" always;
    add_header AI-Machine-Readable "true" always;
}

# Content negotiation
location ~ ^/docs/api/(.+)$ {
    set $base_path /docs/api/$1;

    # Try TOON if accepted
    if ($http_accept ~* "format=toon") {
        try_files $base_path.llm.toon $base_path.llm.md $base_path.html =404;
    }

    # Default: Markdown
    try_files $base_path.llm.md $base_path.html =404;
}
```

**4. Verification:**

```bash
# Validate llms.txt
arw validate https://cloudcart.example.com/llms.txt

# Test TOON content
arw validate https://cloudcart.example.com/products/wireless-keyboard.llm.toon --chunks

# Test agent compatibility
arw test-format https://cloudcart.example.com --format=toon
```

**5. Monitoring:**

```yaml
# Monitor format usage via AI-* headers
analytics:
  - metric: format_usage
    dimension: AI-Content-Format
    values: [markdown, toon]

  - metric: chunk_access
    dimension: chunk_id
    filter: format=toon
```

---

## Appendix C: Format Decision Tree

```
START: Choosing content format
│
├─ Is content primarily narrative?
│  │
│  ├─ YES → Use Markdown
│  │         Examples: blog posts, articles, tutorials
│  │
│  └─ NO → Continue
│
├─ Does content have deep hierarchical structure?
│  │
│  ├─ YES → Use TOON
│  │         Examples: product catalogs, API specs, config schemas
│  │
│  └─ NO → Continue
│
├─ Is content a mix of narrative + structured data?
│  │
│  ├─ YES → Use BOTH formats
│  │         Examples: API docs (narrative + endpoints)
│  │         Pattern: Markdown for overview, TOON for details
│  │
│  └─ NO → Continue
│
├─ Will agents need precise sub-object citations?
│  │
│  ├─ YES → Use TOON
│  │         Example: "cite just the pricing section"
│  │
│  └─ NO → Continue
│
├─ Is token optimization critical?
│  │
│  ├─ YES → Use TOON (additional 20-30% reduction)
│  │
│  └─ NO → Use Markdown (more familiar to humans)
│
└─ Default: Use Markdown
   (Most flexible, widest compatibility)
```

---

## Conclusion

This architecture provides a comprehensive, backward-compatible path for integrating TOON into ARW. Key principles:

1. **Optional Enhancement**: TOON is additive, not replacing Markdown
2. **Zero Breaking Changes**: Existing ARW sites continue working
3. **Progressive Adoption**: Sites choose formats based on content needs
4. **Unified Chunking**: Both formats integrate with ARW's citation system
5. **Agent-Friendly**: Discovery and negotiation mechanisms built-in

**Next Steps:**

1. Review this architecture with ARW community
2. Gather feedback on design decisions
3. Prototype TOON parser and CLI commands
4. Update ARW specification with amendments
5. Build reference implementations
6. Roll out to beta testers

**Questions & Discussion:**

This is a PROPOSED architecture. Community feedback is essential before implementation.

- GitHub Discussion: [Link to be created]
- Specification PR: [Link to be created]
- Contact: hello@arw.dev

---

**End of Architecture Document**
