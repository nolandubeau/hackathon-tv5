# ARW Specification Amendment: TOON Format Support

**Amendment ID:** ARW-AMEND-TOON-001
**Target Specification:** ARW v1.0
**Status:** PROPOSED
**Date:** 2025-11-13
**Priority:** P2 - Enhancement (Non-Breaking)

---

## Summary

This amendment adds **TOON (Token-Oriented Object Notation)** as an optional content format alongside Markdown (.llm.md) in the Agent-Ready Web specification. The amendment is fully backward compatible and introduces no breaking changes to ARW v0.1 implementations.

---

## Specification Changes

### 1. Section 3.2: Format - Add TOON Support

**Location:** spec/ARW-0.1-draft.md, Section 3.2 (line ~281)

**Current Text:**

```markdown
### 3.2 Format

**Canonical Sources (Dual Format):**

ARW manifests MUST be available in at least one of two canonical formats:
1. YAML Format (/llms.txt)
2. JSON Format (/llms.json)
```

**Amended Text:**

```markdown
### 3.2 Format

**Canonical Sources (Dual Format):**

ARW manifests MUST be available in at least one of two canonical formats:
1. YAML Format (/llms.txt)
2. JSON Format (/llms.json)

**Machine-Readable Content Formats:**

Machine views (referenced in `content.machine_view`) MUST use one of these formats:

1. **Markdown Format** (`.llm.md`):
   - **Content-Type:** `text/markdown; charset=utf-8` (RECOMMENDED) or `text/plain; charset=utf-8`
   - **Use case:** Narrative content, documentation, blog posts
   - **Chunking:** Heading-based or marker-based
   - **Status:** REQUIRED for ARW-1+ conformance

2. **TOON Format** (`.llm.toon`) - *ARW v1.0+*:
   - **Content-Type:** `text/plain; charset=utf-8; format=toon` (RECOMMENDED)
   - **Alternative:** `text/x-llm+toon; charset=utf-8`
   - **Use case:** Structured content, API specs, product catalogs, hierarchical data
   - **Chunking:** Object-based using @-path syntax
   - **Status:** OPTIONAL enhancement (ARW-2+ RECOMMENDED for structured content)

**Format Selection:**

Sites SHOULD choose formats based on content characteristics:
- Narrative, human-centric content → Markdown
- Structured, hierarchical data → TOON
- Mixed content → Provide both formats

Sites MAY provide multiple formats for the same content using format-specific `machine_view_*` fields (see Section 3.5).
```

---

### 2. Section 3.5: ContentItem Schema - Add Format Fields

**Location:** spec/ARW-0.1-draft.md, Section 3.5 (Schema Definition)

**Current Schema (TypeScript):**

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

**Amended Schema:**

```typescript
export interface ContentItem {
  /** Canonical URL of the content */
  url: string;

  /**
   * Primary machine-readable view (any supported format)
   * @deprecated Use format-specific fields for clarity
   */
  machine_view?: string;

  /**
   * Explicit Markdown machine view (ARW v1.0+)
   * Recommended over generic machine_view
   */
  machine_view_markdown?: string;

  /**
   * Explicit TOON machine view (ARW v1.0+)
   * For structured, hierarchical content
   */
  machine_view_toon?: string;

  /**
   * Format declaration (ARW v1.0+)
   * Indicates which format(s) are available
   */
  format?: 'markdown' | 'toon' | 'both' | 'json-ld';

  /**
   * TOON schema URL (ARW v1.0+)
   * Schema definition for TOON content validation
   */
  toon_schema?: string;

  /** Content title */
  title?: string;

  /** Content description */
  description?: string;

  /** Content priority */
  priority?: Priority;

  /** Tags/categories */
  tags?: string[];

  /** Last modified timestamp (ISO 8601) */
  last_modified?: string;

  /** Change frequency */
  changefreq?: string;
}
```

**YAML Schema:**

```yaml
ContentItem:
  type: object
  required:
    - url
  properties:
    url:
      type: string
      format: uri
      description: Canonical URL of the content

    machine_view:
      type: string
      format: uri
      description: |
        Primary machine-readable view (deprecated in v1.0+)
        Use machine_view_markdown or machine_view_toon instead

    machine_view_markdown:
      type: string
      format: uri
      description: Explicit Markdown machine view (.llm.md)

    machine_view_toon:
      type: string
      format: uri
      description: Explicit TOON machine view (.llm.toon)

    format:
      type: string
      enum: [markdown, toon, both, json-ld]
      description: |
        Format declaration for the machine view(s)
        - markdown: Only Markdown available
        - toon: Only TOON available
        - both: Both Markdown and TOON available
        - json-ld: JSON-LD structured data

    toon_schema:
      type: string
      format: uri
      description: URL to TOON schema definition for validation

    title:
      type: string
      description: Content title

    description:
      type: string
      description: Content description

    priority:
      type: string
      enum: [high, medium, low]
      description: Content priority

    tags:
      type: array
      items:
        type: string
      description: Tags/categories

    last_modified:
      type: string
      format: date-time
      description: Last modified timestamp (ISO 8601)

    changefreq:
      type: string
      description: Change frequency
```

---

### 3. Section 4.3: NEW - TOON Format Specification

**Location:** spec/ARW-0.1-draft.md, New Section 4.3 (after Section 4.2)

**New Section Text:**

```markdown
### 4.3 TOON Format Specification (ARW v1.0+)

**Status:** OPTIONAL enhancement for structured content

#### 4.3.1 Overview

TOON (Token-Oriented Object Notation) is a lightweight, structured data format optimized for:
- Hierarchical data representation
- Token-efficient AI agent consumption
- Object-based semantic chunking
- Precise citation addressing

**When to Use TOON:**

Use TOON for content with:
- Deep hierarchical structure (products, APIs, schemas)
- Need for precise sub-object citations
- Structured attributes and relationships
- Complex nested data

Use Markdown for:
- Narrative, linear content (blog posts, articles)
- Documentation with primarily text sections
- Human-centric reading experience

#### 4.3.2 File Format

**File Extension:** `.llm.toon`

**MIME Types (priority order):**

1. **Primary (RECOMMENDED):**
   ```
   Content-Type: text/plain; charset=utf-8; format=toon
   ```
   - Universal agent compatibility
   - No binary data issues
   - Explicit format parameter

2. **Structured Alternative:**
   ```
   Content-Type: text/x-llm+toon; charset=utf-8
   ```
   - ARW-specific MIME type
   - Signals TOON format explicitly
   - Use when clients explicitly support ARW

**Character Encoding:** MUST be UTF-8

**File Naming Convention:**
- Standard: `{page-name}.llm.toon`
- Examples:
  - `/products/keyboard.llm.toon`
  - `/api/reference.llm.toon`
  - `/catalog/items.llm.toon`

#### 4.3.3 Syntax Overview

TOON uses @-prefixed objects for semantic naming:

```toon
@objectName {
  @propertyName: "value"
  @nestedObject: {
    @subProperty: 123
  }
  @arrayProperty: [
    { @item: "first" },
    { @item: "second" }
  ]
}
```

**Key Syntax Elements:**

- `@objectName` - Object identifier (must start with @)
- `@property: value` - Property assignment
- `{ }` - Object boundaries
- `[ ]` - Array boundaries
- `"string"` - String literals
- `123` - Numeric literals
- `true/false` - Boolean literals

**Full TOON Specification:**
See [TOON Language Specification](https://toon-spec.org/v1.0) for complete grammar.

#### 4.3.4 HTTP Headers

TOON content MUST include these HTTP headers:

**Required:**

```http
Content-Type: text/plain; charset=utf-8; format=toon
```

**RECOMMENDED:**

```http
AI-Content-Format: toon
AI-ARW-Version: 1.0
AI-Machine-Readable: true
```

**Optional:**

```http
Link: <https://example.com/page>; rel="canonical"
Link: <https://example.com/page.llm.md>; rel="alternate"; type="text/markdown"
```

**Example Response:**

```http
HTTP/1.1 200 OK
Content-Type: text/plain; charset=utf-8; format=toon
AI-Content-Format: toon
AI-ARW-Version: 1.0
AI-Machine-Readable: true
Cache-Control: public, max-age=3600
ETag: "toon-v2-abc123"
Link: <https://example.com/products/keyboard>; rel="canonical"
Link: <https://example.com/products/keyboard.llm.md>; rel="alternate"; type="text/markdown"

@product {
  @id: "wireless-keyboard-v2"
  @name: "Wireless Mechanical Keyboard"
  @price: {
    @amount: 79.99
    @currency: "USD"
  }
}
```

#### 4.3.5 Chunking Strategy

TOON chunks MUST use `toon_path` field to reference object paths:

**Chunk Definition:**

```yaml
chunks:
  - id: product
    toon_path: "@product"
    description: "Complete product object"

  - id: pricing
    toon_path: "@product.@price"
    description: "Product pricing information"
    parent: product
```

**Path Syntax:**

- `@object` - Root object
- `@object.@property` - Nested property
- `@object.@array[0]` - Array element (optional, zero-indexed)
- `@object.@nested.@deep` - Deep nesting

**Chunk Requirements:**

1. All `toon_path` values MUST reference valid objects in the TOON file
2. Chunk IDs SHOULD be derived from object names (lowercase, hyphenated)
3. Parent-child relationships SHOULD follow TOON nesting structure
4. Chunks SHOULD cover all semantically significant objects

**Auto-Generation:**

Chunks MAY be auto-generated from TOON structure using:

```bash
arw chunks extract file.llm.toon [--deep]
```

#### 4.3.6 Citation Format

Agents citing TOON content MUST use this URI format:

```
https://example.com/page.llm.toon#@object.@path
                                  └────┬───────┘
                                   TOON Path
```

**Examples:**

```
# Cite entire product
https://example.com/products/keyboard.llm.toon#@product

# Cite pricing section
https://example.com/products/keyboard.llm.toon#@product.@price

# Cite specific spec
https://example.com/products/keyboard.llm.toon#@product.@specs.@battery
```

**Benefits:**

- Precise citation (only relevant object in context)
- Reduced token usage (95%+ reduction vs full file)
- Clear semantic boundaries
- Human-verifiable references

#### 4.3.7 Schema Validation

Sites MAY declare TOON schemas for validation:

**In llms.txt:**

```yaml
content:
  - url: /api/reference
    machine_view_toon: /api/reference.llm.toon
    toon_schema: https://example.com/schemas/api-v1.toon-schema
```

**Schema Format:**

TOON schemas use JSON Schema-like syntax:

```toon
@schema {
  @version: "1.0"
  @name: "Product Schema"

  @definitions: {
    @product: {
      @type: "object"
      @required: ["@id", "@name", "@price"]
      @properties: {
        @id: { @type: "string" }
        @name: { @type: "string" }
        @price: {
          @type: "object"
          @properties: {
            @amount: { @type: "number" }
            @currency: { @type: "string" }
          }
        }
      }
    }
  }
}
```

**Validation:**

```bash
# Validate TOON file against schema
arw validate file.llm.toon --schema=https://example.com/schema.toon-schema

# Validate chunks exist
arw validate file.llm.toon --chunks
```

#### 4.3.8 Example: Product Catalog

**File: `/products/keyboard.llm.toon`**

```toon
@product {
  @id: "wireless-keyboard-v2"
  @name: "Wireless Mechanical Keyboard"
  @sku: "KB-WL-MX-001"
  @category: "Electronics > Keyboards"

  @pricing {
    @amount: 79.99
    @currency: "USD"
    @discount: {
      @active: true
      @percentage: 15
      @ends: "2025-12-31T23:59:59Z"
    }
  }

  @specifications {
    @connectivity: "Bluetooth 5.0 + USB-C"
    @battery: {
      @capacity: 2000
      @unit: "mAh"
      @life: "Up to 6 months"
    }
    @layout: "Tenkeyless (TKL)"
    @switches: "Cherry MX Brown"
    @keycaps: {
      @material: "PBT Double-shot"
      @profile: "OEM"
    }
    @dimensions: {
      @width: 355
      @depth: 127
      @height: 40
      @unit: "mm"
    }
    @weight: {
      @value: 780
      @unit: "g"
    }
  }

  @availability {
    @in_stock: true
    @quantity: 47
    @ships_within: "1-2 business days"
  }

  @reviews {
    @average_rating: 4.7
    @total_reviews: 328
    @summary: {
      @5_star: 245
      @4_star: 62
      @3_star: 15
      @2_star: 4
      @1_star: 2
    }
  }
}
```

**Corresponding llms.txt:**

```yaml
content:
  - url: /products/wireless-keyboard
    machine_view_toon: /products/wireless-keyboard.llm.toon
    format: toon
    purpose: product_information
    priority: high
    chunks:
      - id: product
        toon_path: "@product"
        description: "Complete product information"

      - id: pricing
        toon_path: "@product.@pricing"
        description: "Price, currency, and discounts"
        parent: product

      - id: specifications
        toon_path: "@product.@specifications"
        description: "Detailed technical specifications"
        parent: product

      - id: availability
        toon_path: "@product.@availability"
        description: "Stock status and shipping"
        parent: product

      - id: reviews
        toon_path: "@product.@reviews"
        description: "Customer ratings and reviews"
        parent: product
```

**Token Comparison:**

| Format   | Size    | Tokens | Reduction vs HTML |
|----------|---------|--------|-------------------|
| HTML     | 8,245 B | 1,892  | Baseline          |
| Markdown | 1,456 B | 342    | 81.9%             |
| TOON     | 987 B   | 218    | 88.5%             |

**Additional TOON Benefits:**
- Precise chunk citations (e.g., just @pricing: 42 tokens)
- Structured data extraction
- Schema validation
- Auto-generated chunks

#### 4.3.9 Discovery & Negotiation

**Agent Discovery Flow:**

```
1. Fetch /llms.txt or /llms.json
2. Parse content items
3. Check for format field:
   - If format=toon → fetch machine_view_toon
   - If format=markdown → fetch machine_view_markdown
   - If format=both → negotiate based on Accept header
4. Parse format-specific content
5. Use chunks for precise citations
```

**Content Negotiation:**

Agents MAY request specific formats via Accept header:

```http
GET /products/keyboard HTTP/1.1
Accept: text/plain; format=toon, text/markdown;q=0.9, */*;q=0.8
```

Server response priority:
1. TOON if `format=toon` in Accept and TOON exists
2. Markdown if Markdown exists
3. HTML (canonical human view)

**Example Nginx Config:**

```nginx
location ~ ^/products/(.+)$ {
    set $base /products/$1;

    # TOON requested and exists
    if ($http_accept ~* "format=toon") {
        try_files $base.llm.toon $base.llm.md $base/index.html =404;
    }

    # Default: try Markdown first
    try_files $base.llm.md $base/index.html =404;
}
```

#### 4.3.10 Validation Requirements

TOON content SHOULD be validated before deployment:

**Syntax Validation:**

```bash
arw validate file.llm.toon
```

Checks:
- Valid TOON grammar
- No syntax errors
- Proper object nesting
- Valid data types

**Chunk Validation:**

```bash
arw validate file.llm.toon --chunks
```

Checks:
- All `toon_path` values exist in file
- No orphaned chunks
- Valid parent references

**Schema Validation:**

```bash
arw validate file.llm.toon --schema=<url>
```

Checks:
- Conforms to declared schema
- Required fields present
- Type correctness

**HTTP Validation:**

```bash
arw validate https://example.com/page.llm.toon --http
```

Checks:
- Correct Content-Type header
- AI-* headers present (if RECOMMENDED)
- File extension matches format

#### 4.3.11 Migration Path

**From Markdown to TOON:**

Sites with structured Markdown content MAY convert to TOON:

```bash
# Convert structured Markdown
arw convert page.llm.md --to=toon --output=page.llm.toon

# Validate conversion
arw validate page.llm.toon --strict
```

**Dual Format Strategy:**

Sites MAY provide both formats for maximum compatibility:

```yaml
content:
  - url: /api/reference
    machine_view_markdown: /api/reference.llm.md
    machine_view_toon: /api/reference.llm.toon
    format: both
```

**Benefits:**
- Agents choose preferred format
- No agent left behind
- A/B testing format effectiveness
- Gradual ecosystem transition

**Backward Compatibility:**

Markdown remains fully supported. TOON is an OPTIONAL enhancement, not a replacement.
```

---

### 4. Section 5: Chunks - Add TOON Path Support

**Location:** spec/ARW-0.1-draft.md, Section 5 (Chunks)

**Current Chunk Schema:**

```typescript
export interface Chunk {
  id: string;
  title?: string;
  content?: string;
  type?: string;
  parent?: string;
}
```

**Amended Chunk Schema:**

```typescript
export interface Chunk {
  /** Unique chunk identifier */
  id: string;

  /** Chunk title/heading */
  title?: string;

  /** Chunk content (for inline chunks) */
  content?: string;

  /** Chunk type/category */
  type?: string;

  /** Parent chunk ID (for hierarchical chunks) */
  parent?: string;

  /**
   * Markdown heading reference (Markdown format)
   * Example: "## Heading Text"
   */
  heading?: string;

  /**
   * TOON object path (TOON format, ARW v1.0+)
   * Example: "@product.@pricing"
   */
  toon_path?: string;

  /**
   * Format specifier (ARW v1.0+)
   * Indicates which format this chunk applies to
   */
  format?: 'markdown' | 'toon';

  /**
   * Chunk description
   */
  description?: string;
}
```

**YAML Example:**

```yaml
chunks:
  # Markdown chunk (existing)
  - id: introduction
    heading: "## Introduction"
    format: markdown
    description: "Overview section"

  # TOON chunk (new)
  - id: pricing
    toon_path: "@product.@pricing"
    format: toon
    description: "Product pricing information"

  # Nested TOON chunk (new)
  - id: pricing-discount
    toon_path: "@product.@pricing.@discount"
    format: toon
    parent: pricing
    description: "Active discount details"
```

**Validation Rules:**

1. If `format=markdown`, chunk MUST have `heading` field
2. If `format=toon`, chunk MUST have `toon_path` field
3. `toon_path` values MUST reference valid objects in the TOON file
4. `parent` references MUST point to existing chunk IDs
5. Chunk IDs MUST be unique within a content item

---

### 5. Section 8: HTTP Headers - Add AI-Content-Format

**Location:** spec/ARW-0.1-draft.md, Section 8 (HTTP Headers)

**New Header Specification:**

```markdown
#### AI-Content-Format (ARW v1.0+)

**Status:** RECOMMENDED for format disambiguation

**Purpose:**
Explicitly signals the format of machine-readable content, eliminating MIME type parsing ambiguity.

**Syntax:**

```http
AI-Content-Format: <format>
```

**Valid Values:**

- `markdown` - Markdown content (.llm.md)
- `toon` - TOON content (.llm.toon)
- `json-ld` - JSON-LD structured data
- `html` - Human HTML view (canonical)

**Examples:**

```http
# TOON content
AI-Content-Format: toon

# Markdown content
AI-Content-Format: markdown

# JSON-LD structured data
AI-Content-Format: json-ld
```

**Usage:**

This header SHOULD be included with all machine-readable content responses. It provides:

1. **Format clarity** - No MIME type parsing required
2. **Agent processing** - Enables format-specific handling
3. **Content negotiation** - Confirms format served
4. **Debugging** - Clear format identification

**Complete Response Example:**

```http
HTTP/1.1 200 OK
Content-Type: text/plain; charset=utf-8; format=toon
AI-Content-Format: toon
AI-ARW-Version: 1.0
AI-Machine-Readable: true
AI-Attribution: Required
Cache-Control: public, max-age=3600
Link: <https://example.com/page>; rel="canonical"
Link: <https://example.com/page.llm.md>; rel="alternate"; type="text/markdown"

@product { ... }
```

**Backward Compatibility:**

This header is OPTIONAL. Existing ARW implementations without this header remain compliant. However, new implementations SHOULD include it for clarity.
```

---

## Implementation Guidance

### For ARW CLI Maintainers

**Required Changes:**

1. **Schema Updates:**
   - Add `machine_view_toon`, `format`, `toon_schema` to ContentItem type
   - Add `toon_path`, `format` to Chunk type
   - Update validation rules

2. **Command Updates:**
   - `arw generate --format=toon|markdown|both`
   - `arw convert --to=toon|markdown`
   - `arw chunks extract <file.llm.toon>`
   - `arw validate <file.llm.toon> --chunks --schema`

3. **Parser Implementation:**
   - TOON syntax parser
   - TOON schema validator
   - Chunk path resolver

4. **Generator Implementation:**
   - HTML → TOON conversion
   - JSON → TOON conversion
   - Auto-chunk generation from TOON objects

### For Site Implementers

**Adoption Path:**

**Option 1: Markdown Only (No Change)**

Continue using Markdown for all content. No action required.

**Option 2: Selective TOON Adoption**

1. Identify structured content (products, APIs, catalogs)
2. Generate TOON versions:
   ```bash
   arw generate products/*.html --format=toon --auto-chunks
   ```
3. Update llms.txt with `format` fields
4. Configure MIME types for `.llm.toon`

**Option 3: Dual Format**

Provide both Markdown and TOON for all content:

```bash
arw generate content/*.html --format=both
```

Update llms.txt:

```yaml
content:
  - url: /page
    machine_view_markdown: /page.llm.md
    machine_view_toon: /page.llm.toon
    format: both
```

### For Agent Developers

**Discovery Algorithm:**

```javascript
async function fetchContent(manifest, contentItem) {
  const { format, machine_view_toon, machine_view_markdown } = contentItem;

  // Priority 1: Use format-specific view if available
  if (machine_view_toon && supportsFormat('toon')) {
    return await fetchAndParseTOON(machine_view_toon);
  }

  if (machine_view_markdown) {
    return await fetchAndParseMarkdown(machine_view_markdown);
  }

  // Priority 2: Use generic machine_view with format hint
  if (contentItem.machine_view) {
    if (format === 'toon' && supportsFormat('toon')) {
      return await fetchAndParseTOON(contentItem.machine_view);
    }
    return await fetchAndParseMarkdown(contentItem.machine_view);
  }

  // Fallback: HTML
  return await fetchHTML(contentItem.url);
}
```

**Chunk Extraction:**

```javascript
function extractChunk(toonContent, chunkDef) {
  if (chunkDef.format === 'toon' && chunkDef.toon_path) {
    // Parse TOON and extract object at path
    const ast = parseTOON(toonContent);
    return extractObjectByPath(ast, chunkDef.toon_path);
  }
  // ... handle markdown chunks
}
```

---

## Testing Requirements

### Validation Tests

1. **Schema Validation**
   - [ ] ContentItem with `machine_view_toon` validates
   - [ ] ContentItem with `format=toon` validates
   - [ ] Chunk with `toon_path` validates
   - [ ] Backward compatibility: old manifests still validate

2. **TOON Syntax Validation**
   - [ ] Valid TOON files pass validation
   - [ ] Invalid TOON syntax rejected
   - [ ] Chunk paths validated against TOON content

3. **HTTP Header Validation**
   - [ ] `AI-Content-Format: toon` header detected
   - [ ] MIME type parsing correct
   - [ ] Content negotiation works

### Integration Tests

1. **Generation**
   - [ ] `arw generate --format=toon` produces valid TOON
   - [ ] `arw generate --format=both` creates both files
   - [ ] Auto-chunk generation works

2. **Conversion**
   - [ ] Markdown → TOON conversion produces valid output
   - [ ] TOON → Markdown conversion preserves structure

3. **Validation**
   - [ ] `arw validate file.llm.toon` detects errors
   - [ ] `arw validate --chunks` validates paths
   - [ ] `arw validate --schema` validates against schema

### Compatibility Tests

1. **Backward Compatibility**
   - [ ] ARW v0.1 manifests still validate
   - [ ] Markdown-only sites unchanged
   - [ ] No breaking changes to existing APIs

2. **Agent Compatibility**
   - [ ] Claude can fetch TOON content
   - [ ] ChatGPT can fetch TOON content
   - [ ] MIME type compatibility verified

---

## Migration Timeline

**Phase 1: Specification (Weeks 1-2)**
- Finalize amendment text
- Community review and feedback
- Specification PR merged

**Phase 2: Schema Updates (Weeks 3-4)**
- Update TypeScript types
- Update JSON schemas
- Update LinkML schemas

**Phase 3: CLI Implementation (Weeks 5-8)**
- TOON parser
- TOON generator
- Chunk extraction
- Validation

**Phase 4: Documentation (Weeks 9-10)**
- CLI documentation
- Format selection guide
- Migration examples

**Phase 5: Reference Sites (Weeks 11-12)**
- Update arw.dev with TOON
- Create example sites
- Gather community feedback

---

## Appendix: YAML Schema

**Complete ContentItem Schema with TOON Support:**

```yaml
ContentItem:
  type: object
  required:
    - url
  properties:
    url:
      type: string
      format: uri

    machine_view:
      type: string
      format: uri
      deprecated: true
      description: Use format-specific fields instead

    machine_view_markdown:
      type: string
      format: uri
      description: Explicit Markdown machine view

    machine_view_toon:
      type: string
      format: uri
      description: Explicit TOON machine view (ARW v1.0+)

    format:
      type: string
      enum: [markdown, toon, both, json-ld]
      description: Format declaration

    toon_schema:
      type: string
      format: uri
      description: TOON schema URL (ARW v1.0+)

    title:
      type: string

    description:
      type: string

    priority:
      type: string
      enum: [high, medium, low]

    tags:
      type: array
      items:
        type: string

    last_modified:
      type: string
      format: date-time

    changefreq:
      type: string

    chunks:
      type: array
      items:
        $ref: '#/definitions/Chunk'

Chunk:
  type: object
  required:
    - id
  properties:
    id:
      type: string

    title:
      type: string

    content:
      type: string

    type:
      type: string

    parent:
      type: string

    heading:
      type: string
      description: Markdown heading reference

    toon_path:
      type: string
      pattern: '^@[a-zA-Z0-9_]+(\.@[a-zA-Z0-9_]+)*(\[\d+\])?$'
      description: TOON object path (ARW v1.0+)

    format:
      type: string
      enum: [markdown, toon]
      description: Format specifier (ARW v1.0+)

    description:
      type: string
```

---

## Approval & Review

**Reviewers:**
- ARW Core Team
- Community Contributors
- Agent Platform Representatives (Anthropic, OpenAI, Google)

**Review Period:** 2 weeks from publication

**Feedback:** GitHub Issues and Pull Requests

**Contact:** hello@arw.dev

---

**End of Specification Amendment**
