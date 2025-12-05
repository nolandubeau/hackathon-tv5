# TOON-ARW Implementation Guide

**Guide Type:** Technical Implementation Reference
**Audience:** Developers implementing TOON support in ARW
**Date:** 2025-11-13
**Version:** 1.0-draft

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [Format Selection Decision Tree](#format-selection-decision-tree)
3. [CLI Implementation Examples](#cli-implementation-examples)
4. [Server Configuration](#server-configuration)
5. [Code Examples](#code-examples)
6. [Testing Checklist](#testing-checklist)
7. [Troubleshooting](#troubleshooting)

---

## Quick Start

### 5-Minute TOON Setup

**Prerequisites:**
- ARW CLI v1.0+ installed
- Existing website with HTML content
- Basic familiarity with ARW concepts

**Steps:**

```bash
# 1. Generate TOON from HTML
arw generate products/keyboard.html --format=toon --auto-chunks

# Output:
# ✓ Generated products/keyboard.llm.toon (987 bytes)
# ✓ Auto-generated 5 chunks

# 2. Add to llms.txt
cat >> llms.txt << 'EOF'
content:
  - url: /products/keyboard
    machine_view_toon: /products/keyboard.llm.toon
    format: toon
    purpose: product_information
    chunks:
      - id: product
        toon_path: "@product"
      - id: pricing
        toon_path: "@product.@pricing"
      - id: specs
        toon_path: "@product.@specifications"
EOF

# 3. Configure server MIME type (Nginx example)
cat >> nginx.conf << 'EOF'
location ~ \.llm\.toon$ {
    types { }
    default_type "text/plain; charset=utf-8; format=toon";
    add_header AI-Content-Format "toon" always;
    add_header AI-ARW-Version "1.0" always;
}
EOF

# 4. Validate
arw validate llms.txt
arw validate products/keyboard.llm.toon --chunks

# 5. Deploy!
```

**Result:**
- TOON file served at `/products/keyboard.llm.toon`
- Discoverable via `/llms.txt`
- Chunks enable precise citations
- 88%+ token reduction vs HTML

---

## Format Selection Decision Tree

### Interactive Decision Guide

```
┌──────────────────────────────────────────────────────────┐
│  START: Which format should I use for this content?     │
└────────────────────────┬─────────────────────────────────┘
                         │
         ┌───────────────▼────────────────┐
         │ What type of content is this?  │
         └───────────────┬────────────────┘
                         │
          ┌──────────────┴──────────────┐
          │                             │
    ┌─────▼─────┐               ┌──────▼──────┐
    │ Narrative │               │ Structured  │
    │  Content  │               │    Data     │
    └─────┬─────┘               └──────┬──────┘
          │                             │
          │                             │
    ┌─────▼──────────┐         ┌────────▼─────────┐
    │ Use MARKDOWN   │         │ Does data have   │
    │                │         │ deep hierarchy?  │
    │ Examples:      │         └────────┬─────────┘
    │ • Blog posts   │                  │
    │ • Articles     │         ┌────────┴────────┐
    │ • Tutorials    │         │ YES        NO   │
    │ • FAQs         │         │                 │
    └────────────────┘    ┌────▼────┐     ┌─────▼─────┐
                          │Use TOON │     │Use either │
                          │         │     │(preference│
                          │Examples:│     │ based)    │
                          │• Products│     │           │
                          │• APIs   │     │Examples:  │
                          │• Catalogs│     │• Tables   │
                          │• Schemas│     │• Lists    │
                          └─────────┘     │• Configs  │
                                          └───────────┘

┌──────────────────────────────────────────────────────────┐
│  SPECIAL CASE: Mixed Content                             │
│  (Both narrative and structured data)                    │
│                                                          │
│  Solution: Provide BOTH formats                         │
│  • Markdown for narrative sections                      │
│  • TOON for structured sections                         │
│  • Agents choose based on need                          │
│                                                          │
│  Example: API documentation                             │
│  - Overview (Markdown)                                  │
│  - Endpoints (TOON)                                     │
└──────────────────────────────────────────────────────────┘
```

### Quick Reference Matrix

| Content Type                  | Format      | Rationale                                                |
|-------------------------------|-------------|----------------------------------------------------------|
| Blog post                     | Markdown    | Linear narrative, human-centric                          |
| News article                  | Markdown    | Story flow, quotes, paragraphs                           |
| Tutorial / How-to             | Markdown    | Step-by-step instructions with explanations              |
| FAQ                           | Markdown    | Q&A pairs, conversational                                |
| Product catalog               | **TOON**    | Hierarchical attributes, specs, pricing                  |
| API reference                 | **TOON**    | Endpoints, parameters, responses (structured)            |
| OpenAPI spec                  | **TOON**    | Already structured, maps naturally                       |
| Product comparison table      | **TOON**    | Rows as objects, columns as properties                   |
| Configuration schema          | **TOON**    | Nested settings, type definitions                        |
| Database schema               | **TOON**    | Tables, columns, relationships                           |
| Legal document                | Markdown    | Linear sections, references                              |
| Privacy policy                | Markdown    | Structured but narrative                                 |
| Technical specification       | **Both**    | Narrative explanation + structured details               |
| API documentation (narrative) | **Both**    | Overview (MD) + Endpoints (TOON)                         |
| Research paper                | Markdown    | Abstract, sections, citations                            |
| Recipe                        | Markdown    | Ingredients list + instructions                          |
| Contact information           | Either      | Simple structure, preference-based                       |
| About page                    | Markdown    | Narrative company story                                  |

### Decision Criteria

**Choose TOON if content has:**

✅ **Deep nesting** (3+ levels of hierarchy)
```toon
@product {
  @specs {
    @battery {
      @capacity: 2000
    }
  }
}
```

✅ **Many attributes** (10+ structured fields)
```toon
@product {
  @id, @name, @sku, @price, @category,
  @weight, @dimensions, @color, @material,
  @warranty, @manufacturer
}
```

✅ **Need for precise sub-citations**
```
Agent needs just the pricing section, not entire product
→ Cite: #@product.@pricing (42 tokens vs 856 tokens)
```

✅ **Repeated structure** (catalog of similar items)
```toon
@products: [
  { @id: "1", @name: "Item 1", ... }
  { @id: "2", @name: "Item 2", ... }
]
```

**Choose Markdown if content has:**

✅ **Narrative flow** (story, explanation)
```markdown
## Introduction

The Wireless Mechanical Keyboard represents...
```

✅ **Code samples** (inline code, code blocks)
```markdown
## Usage

To install:

```bash
npm install keyboard-driver
```
```

✅ **Human reading experience priority**
```markdown
Markdown is more familiar to humans editing content
```

✅ **Linear sections** (not deeply nested)
```markdown
## Section 1
## Section 2
## Section 3
```

---

## CLI Implementation Examples

### Generating TOON Content

#### From HTML

```bash
# Single file
arw generate product.html --format=toon --output=product.llm.toon

# With auto-generated chunks
arw generate product.html --format=toon --auto-chunks

# Deep chunk extraction (nested chunks)
arw generate product.html --format=toon --auto-chunks --deep-chunks

# Recursive directory processing
arw generate ./products --format=toon --recursive --auto-chunks

# Both formats simultaneously
arw generate product.html --format=both
# Creates: product.llm.md AND product.llm.toon
```

**Example Output:**

```
✓ Parsed product.html (8.2 KB)
✓ Extracted 47 semantic elements
✓ Generated TOON structure with 5 objects
✓ Created product.llm.toon (987 bytes, 88% reduction)
✓ Auto-generated 5 chunks

Files created:
  - product.llm.toon
  - product.llm.toon.chunks.yaml

Chunks generated:
  1. @product (root)
  2. @product.@pricing
  3. @product.@specifications
  4. @product.@availability
  5. @product.@reviews

Next steps:
  1. Review: cat product.llm.toon
  2. Validate: arw validate product.llm.toon --chunks
  3. Add to llms.txt manifest
```

#### From JSON

```bash
# API response to TOON
arw generate api-response.json --format=toon --auto-chunks

# With schema
arw generate api-response.json --format=toon \
    --schema=https://api.example.com/schema.json
```

**Example Input (JSON):**

```json
{
  "product": {
    "id": "kb-001",
    "name": "Wireless Keyboard",
    "price": {
      "amount": 79.99,
      "currency": "USD"
    }
  }
}
```

**Generated TOON:**

```toon
@product {
  @id: "kb-001"
  @name: "Wireless Keyboard"
  @price: {
    @amount: 79.99
    @currency: "USD"
  }
}
```

### Converting Between Formats

```bash
# TOON to Markdown
arw convert product.llm.toon --to=markdown --output=product.llm.md

# Markdown to TOON (if structure detected)
arw convert api.llm.md --to=toon --output=api.llm.toon

# With validation
arw convert product.llm.toon --to=markdown --validate

# Preserve chunks during conversion
arw convert product.llm.toon --to=markdown --preserve-chunks
```

**Conversion Examples:**

**TOON → Markdown:**

```toon
# Input: product.llm.toon
@product {
  @name: "Wireless Keyboard"
  @price: {
    @amount: 79.99
    @currency: "USD"
  }
}
```

```markdown
# Output: product.llm.md
## Product

**Name:** Wireless Keyboard

### Price

- **Amount:** 79.99
- **Currency:** USD
```

**Markdown → TOON:**

```markdown
# Input: api.llm.md
## Authentication

- Endpoint: /auth/token
- Method: POST
- Scopes: read, write
```

```toon
# Output: api.llm.toon
@authentication {
  @endpoint: "/auth/token"
  @method: "POST"
  @scopes: ["read", "write"]
}
```

### Extracting Chunks

```bash
# Extract top-level chunks
arw chunks extract product.llm.toon

# Deep extraction (nested chunks)
arw chunks extract product.llm.toon --deep --max-depth=5

# Output as JSON
arw chunks extract product.llm.toon --format=json

# With size threshold (skip small chunks)
arw chunks extract product.llm.toon --min-size=100

# Output to file
arw chunks extract product.llm.toon --output=chunks.yaml
```

**Example Output:**

```yaml
# Auto-extracted from product.llm.toon
# Generated: 2025-11-13T10:30:00Z

chunks:
  - id: product
    toon_path: "@product"
    title: "Product"
    size_bytes: 842
    depth: 0
    auto_generated: true

  - id: pricing
    toon_path: "@product.@pricing"
    title: "Pricing"
    size_bytes: 156
    depth: 1
    parent: product
    auto_generated: true

  - id: pricing-discount
    toon_path: "@product.@pricing.@discount"
    title: "Discount"
    size_bytes: 68
    depth: 2
    parent: pricing
    auto_generated: true

  - id: specifications
    toon_path: "@product.@specifications"
    title: "Specifications"
    size_bytes: 312
    depth: 1
    parent: product
    auto_generated: true

  - id: reviews
    toon_path: "@product.@reviews"
    title: "Reviews"
    size_bytes: 187
    depth: 1
    parent: product
    auto_generated: true

metadata:
  total_chunks: 5
  max_depth: 2
  largest_chunk: product (842 bytes)
  smallest_chunk: pricing-discount (68 bytes)
  total_size: 1565 bytes
```

### Validating TOON Content

```bash
# Basic syntax validation
arw validate product.llm.toon

# Validate chunks exist
arw validate product.llm.toon --chunks

# Validate against schema
arw validate product.llm.toon --schema=https://example.com/schema.toon

# Strict mode (warnings become errors)
arw validate product.llm.toon --strict

# HTTP validation (headers, MIME type)
arw validate https://example.com/product.llm.toon --http

# Comprehensive validation
arw validate product.llm.toon --chunks --strict --http
```

**Validation Output Examples:**

**Success:**

```
✓ TOON syntax valid
✓ File extension correct (.llm.toon)
✓ All chunk paths exist (5/5)
✓ No duplicate object keys
✓ Proper nesting depth (max: 2 levels)
✓ Valid data types
✓ Content-Type header correct

Summary:
  Format: TOON
  Size: 987 bytes
  Objects: 5
  Max depth: 2 levels
  Chunks: 5 validated

Status: VALID ✓
```

**Errors:**

```
✗ TOON syntax error at line 12
  Expected closing brace, found ']'

✗ Chunk path not found: @product.@warranty
  Referenced in chunk 'warranty' but object doesn't exist

✗ Content-Type header incorrect
  Expected: text/plain; charset=utf-8; format=toon
  Actual: text/html

⚠ Warning: No schema declared
  Consider adding toon_schema field to llms.txt

Summary:
  Errors: 3
  Warnings: 1

Status: INVALID ✗

Fix these issues before deployment.
```

---

## Server Configuration

### Nginx Configuration

**Complete TOON Setup:**

```nginx
# MIME types for TOON
http {
    # Add to existing mime.types or define inline
    types {
        text/markdown                     md;
        text/plain                        txt llm.md;
    }

    # TOON-specific MIME type
    map $uri $toon_content_type {
        ~\.llm\.toon$ "text/plain; charset=utf-8; format=toon";
    }

    server {
        listen 80;
        server_name example.com;

        # Root directory
        root /var/www/html;

        # TOON files
        location ~ \.llm\.toon$ {
            types { }
            default_type "text/plain; charset=utf-8; format=toon";

            # ARW headers
            add_header AI-Content-Format "toon" always;
            add_header AI-ARW-Version "1.0" always;
            add_header AI-Machine-Readable "true" always;

            # CORS for agent access
            add_header Access-Control-Allow-Origin "*" always;
            add_header Access-Control-Allow-Methods "GET, OPTIONS" always;

            # Caching
            add_header Cache-Control "public, max-age=3600" always;

            # Canonical link
            add_header Link "<$scheme://$host$uri>; rel=\"canonical\"" always;
        }

        # Markdown files
        location ~ \.llm\.md$ {
            types { }
            default_type "text/markdown; charset=utf-8";

            add_header AI-Content-Format "markdown" always;
            add_header AI-ARW-Version "1.0" always;
            add_header AI-Machine-Readable "true" always;

            add_header Access-Control-Allow-Origin "*" always;
            add_header Cache-Control "public, max-age=3600" always;
        }

        # Content negotiation for dual-format content
        location ~ ^/api/(.+)$ {
            set $base /api/$1;

            # Check Accept header for format preference
            if ($http_accept ~* "format=toon") {
                try_files $base.llm.toon $base.llm.md $base.html =404;
            }

            # Default: try TOON first (for structured API content)
            try_files $base.llm.toon $base.llm.md $base.html =404;
        }

        # llms.txt manifest
        location = /llms.txt {
            types { }
            default_type "text/plain; charset=utf-8";
            add_header Access-Control-Allow-Origin "*" always;
        }

        # Well-known endpoints
        location /.well-known/arw-manifest.json {
            types { }
            default_type "application/json; charset=utf-8";
            add_header Access-Control-Allow-Origin "*" always;
        }
    }
}
```

### Apache Configuration

**.htaccess:**

```apache
# MIME types for TOON
AddType "text/plain; charset=utf-8; format=toon" .llm.toon
AddType "text/markdown; charset=utf-8" .llm.md

# Headers for TOON files
<FilesMatch "\.llm\.toon$">
    Header set AI-Content-Format "toon"
    Header set AI-ARW-Version "1.0"
    Header set AI-Machine-Readable "true"
    Header set Access-Control-Allow-Origin "*"
    Header set Cache-Control "public, max-age=3600"
</FilesMatch>

# Headers for Markdown files
<FilesMatch "\.llm\.md$">
    Header set AI-Content-Format "markdown"
    Header set AI-ARW-Version "1.0"
    Header set AI-Machine-Readable "true"
    Header set Access-Control-Allow-Origin "*"
    Header set Cache-Control "public, max-age=3600"
</FilesMatch>

# Content negotiation
# (requires mod_rewrite and mod_negotiation)
<IfModule mod_rewrite.c>
    RewriteEngine On

    # If Accept header includes format=toon, try TOON first
    RewriteCond %{HTTP_ACCEPT} format=toon
    RewriteCond %{REQUEST_FILENAME}.llm.toon -f
    RewriteRule ^(.*)$ $1.llm.toon [L]

    # Default: try TOON, then Markdown
    RewriteCond %{REQUEST_FILENAME}.llm.toon -f
    RewriteRule ^(.*)$ $1.llm.toon [L]

    RewriteCond %{REQUEST_FILENAME}.llm.md -f
    RewriteRule ^(.*)$ $1.llm.md [L]
</IfModule>
```

### Vercel Configuration

**vercel.json:**

```json
{
  "headers": [
    {
      "source": "/(.*)\\.llm\\.toon",
      "headers": [
        {
          "key": "Content-Type",
          "value": "text/plain; charset=utf-8; format=toon"
        },
        {
          "key": "AI-Content-Format",
          "value": "toon"
        },
        {
          "key": "AI-ARW-Version",
          "value": "1.0"
        },
        {
          "key": "AI-Machine-Readable",
          "value": "true"
        },
        {
          "key": "Access-Control-Allow-Origin",
          "value": "*"
        },
        {
          "key": "Cache-Control",
          "value": "public, max-age=3600"
        }
      ]
    },
    {
      "source": "/(.*)\\.llm\\.md",
      "headers": [
        {
          "key": "Content-Type",
          "value": "text/markdown; charset=utf-8"
        },
        {
          "key": "AI-Content-Format",
          "value": "markdown"
        },
        {
          "key": "AI-ARW-Version",
          "value": "1.0"
        }
      ]
    }
  ],
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "/api/:path*.llm.toon",
      "has": [
        {
          "type": "header",
          "key": "Accept",
          "value": ".*format=toon.*"
        }
      ]
    }
  ]
}
```

### Netlify Configuration

**netlify.toml:**

```toml
# TOON file headers
[[headers]]
  for = "/*.llm.toon"
  [headers.values]
    Content-Type = "text/plain; charset=utf-8; format=toon"
    AI-Content-Format = "toon"
    AI-ARW-Version = "1.0"
    AI-Machine-Readable = "true"
    Access-Control-Allow-Origin = "*"
    Cache-Control = "public, max-age=3600"

# Markdown file headers
[[headers]]
  for = "/*.llm.md"
  [headers.values]
    Content-Type = "text/markdown; charset=utf-8"
    AI-Content-Format = "markdown"
    AI-ARW-Version = "1.0"
    Access-Control-Allow-Origin = "*"

# llms.txt manifest
[[headers]]
  for = "/llms.txt"
  [headers.values]
    Content-Type = "text/plain; charset=utf-8"
    Access-Control-Allow-Origin = "*"

# Content negotiation redirects
[[redirects]]
  from = "/api/*"
  to = "/api/:splat.llm.toon"
  status = 200
  conditions = {Accept = ".*format=toon.*"}

[[redirects]]
  from = "/api/*"
  to = "/api/:splat.llm.md"
  status = 200
```

---

## Code Examples

### JavaScript/TypeScript Agent

**Fetching TOON Content:**

```typescript
interface TOONContent {
  format: 'toon';
  content: string;
  chunks?: TOONChunk[];
}

interface TOONChunk {
  id: string;
  toon_path: string;
  content: any; // Parsed TOON object
}

async function fetchTOONContent(url: string): Promise<TOONContent> {
  // Fetch with format preference
  const response = await fetch(url, {
    headers: {
      'Accept': 'text/plain; format=toon, text/markdown;q=0.9, */*;q=0.8',
      'User-Agent': 'MyAgent/1.0 (TOON-capable)'
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch: ${response.status}`);
  }

  // Check format
  const contentType = response.headers.get('Content-Type');
  const aiFormat = response.headers.get('AI-Content-Format');

  if (aiFormat !== 'toon' && !contentType?.includes('format=toon')) {
    throw new Error('Expected TOON format, got: ' + contentType);
  }

  const content = await response.text();

  return {
    format: 'toon',
    content,
    chunks: [] // Parse chunks if needed
  };
}

// Parse TOON and extract chunk
function extractTOONChunk(toonContent: string, chunkPath: string): any {
  // Example using hypothetical TOON parser
  const ast = parseTOON(toonContent);
  return extractByPath(ast, chunkPath);
}

// Usage
async function processProduct(productUrl: string) {
  const toon = await fetchTOONContent(productUrl + '.llm.toon');

  // Extract just the pricing chunk
  const pricing = extractTOONChunk(toon.content, '@product.@pricing');

  console.log('Price:', pricing.amount, pricing.currency);
  // Price: 79.99 USD
}
```

**Discovery with Format Selection:**

```typescript
interface ARWManifest {
  version: string;
  content: ContentItem[];
}

interface ContentItem {
  url: string;
  machine_view_markdown?: string;
  machine_view_toon?: string;
  format?: 'markdown' | 'toon' | 'both';
  chunks?: Chunk[];
}

interface Chunk {
  id: string;
  toon_path?: string;
  heading?: string;
  format?: 'markdown' | 'toon';
}

async function discoverAndFetch(domain: string): Promise<void> {
  // 1. Fetch manifest
  const manifest = await fetch(`${domain}/llms.json`).then(r => r.json()) as ARWManifest;

  for (const item of manifest.content) {
    // 2. Select format
    let contentUrl: string;

    if (item.machine_view_toon && supportsTOON()) {
      contentUrl = domain + item.machine_view_toon;
      console.log(`Fetching TOON: ${contentUrl}`);
      const toon = await fetchTOONContent(contentUrl);

      // 3. Extract relevant chunks
      const relevantChunks = item.chunks?.filter(c => c.format === 'toon');
      for (const chunk of relevantChunks || []) {
        if (chunk.toon_path) {
          const chunkData = extractTOONChunk(toon.content, chunk.toon_path);
          console.log(`Chunk ${chunk.id}:`, chunkData);
        }
      }
    } else if (item.machine_view_markdown) {
      contentUrl = domain + item.machine_view_markdown;
      console.log(`Fetching Markdown: ${contentUrl}`);
      // ... fetch markdown
    }
  }
}

function supportsTOON(): boolean {
  // Check if this agent supports TOON parsing
  return typeof parseTOON === 'function';
}
```

### Python Agent

**TOON Fetching:**

```python
import requests
from typing import Optional, Dict, Any

class TOONFetcher:
    def __init__(self, user_agent: str = "MyAgent/1.0"):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': user_agent,
            'Accept': 'text/plain; format=toon, text/markdown;q=0.9, */*;q=0.8'
        })

    def fetch_toon(self, url: str) -> Dict[str, Any]:
        """Fetch TOON content from URL."""
        response = self.session.get(url)
        response.raise_for_status()

        # Verify format
        content_type = response.headers.get('Content-Type', '')
        ai_format = response.headers.get('AI-Content-Format', '')

        if 'format=toon' not in content_type and ai_format != 'toon':
            raise ValueError(f"Expected TOON format, got: {content_type}")

        return {
            'format': 'toon',
            'content': response.text,
            'url': url,
            'headers': dict(response.headers)
        }

    def extract_chunk(self, toon_content: str, toon_path: str) -> Any:
        """Extract specific chunk from TOON content."""
        # Parse TOON (using hypothetical parser)
        from toon_parser import parse, extract_path

        ast = parse(toon_content)
        return extract_path(ast, toon_path)

# Usage
fetcher = TOONFetcher()

# Fetch product TOON
product_toon = fetcher.fetch_toon('https://example.com/products/keyboard.llm.toon')

# Extract just pricing
pricing = fetcher.extract_chunk(product_toon['content'], '@product.@pricing')

print(f"Price: {pricing['amount']} {pricing['currency']}")
# Price: 79.99 USD
```

**Discovery and Multi-Format Handling:**

```python
import requests
from typing import List, Dict, Any, Optional

class ARWAgent:
    def __init__(self):
        self.toon_fetcher = TOONFetcher()

    def discover_content(self, domain: str) -> List[Dict[str, Any]]:
        """Discover all content from ARW manifest."""
        manifest_url = f"{domain}/llms.json"
        response = requests.get(manifest_url)
        response.raise_for_status()

        manifest = response.json()
        return manifest.get('content', [])

    def fetch_best_format(self, domain: str, item: Dict[str, Any]) -> Dict[str, Any]:
        """Fetch content in best available format."""
        format_type = item.get('format', 'markdown')

        # Prefer TOON for structured content
        if format_type in ['toon', 'both'] and item.get('machine_view_toon'):
            url = domain + item['machine_view_toon']
            return self.toon_fetcher.fetch_toon(url)

        # Fallback to Markdown
        elif item.get('machine_view_markdown'):
            url = domain + item['machine_view_markdown']
            response = requests.get(url)
            return {
                'format': 'markdown',
                'content': response.text,
                'url': url
            }

        # Fallback to generic machine_view
        elif item.get('machine_view'):
            url = domain + item['machine_view']
            # Determine format from extension or Content-Type
            if url.endswith('.llm.toon'):
                return self.toon_fetcher.fetch_toon(url)
            else:
                response = requests.get(url)
                return {
                    'format': 'markdown',
                    'content': response.text,
                    'url': url
                }

        raise ValueError("No machine-readable format available")

# Usage
agent = ARWAgent()

# Discover all content
content_items = agent.discover_content('https://example.com')

for item in content_items:
    print(f"Processing: {item['url']}")

    # Fetch in best format
    content = agent.fetch_best_format('https://example.com', item)

    print(f"  Format: {content['format']}")
    print(f"  Size: {len(content['content'])} bytes")

    # Process chunks if TOON
    if content['format'] == 'toon' and item.get('chunks'):
        for chunk in item['chunks']:
            if chunk.get('toon_path'):
                chunk_data = agent.toon_fetcher.extract_chunk(
                    content['content'],
                    chunk['toon_path']
                )
                print(f"  Chunk {chunk['id']}: {chunk_data}")
```

---

## Testing Checklist

### Pre-Deployment Testing

**TOON File Validation:**

- [ ] TOON syntax is valid (no parse errors)
- [ ] File extension is `.llm.toon`
- [ ] UTF-8 encoding verified
- [ ] No BOM (byte order mark)
- [ ] File size reasonable (< 100KB recommended)
- [ ] All object keys start with `@`
- [ ] Proper nesting (matching braces)
- [ ] Valid data types (strings quoted, numbers unquoted)

**Chunk Validation:**

- [ ] All `toon_path` values exist in TOON file
- [ ] No orphaned chunks (all parents exist)
- [ ] Chunk IDs are unique
- [ ] Chunk IDs follow naming convention (lowercase, hyphenated)
- [ ] Parent-child relationships match TOON structure
- [ ] Auto-generated chunks reviewed and approved

**llms.txt Integration:**

- [ ] Content item has `machine_view_toon` or `machine_view` with format=toon
- [ ] `format` field set correctly ('toon' or 'both')
- [ ] `chunks` array includes TOON chunks with `toon_path`
- [ ] `toon_schema` URL valid (if provided)
- [ ] Manifest validates: `arw validate llms.txt`

**Server Configuration:**

- [ ] MIME type correct: `text/plain; charset=utf-8; format=toon`
- [ ] `AI-Content-Format: toon` header present
- [ ] `AI-ARW-Version: 1.0` header present
- [ ] CORS headers allow agent access
- [ ] Caching headers appropriate
- [ ] Content negotiation works (if dual format)
- [ ] File serves over HTTPS
- [ ] No redirect loops

**Agent Compatibility:**

- [ ] Claude can fetch TOON content
- [ ] ChatGPT can fetch TOON content
- [ ] Perplexity can fetch TOON content
- [ ] Content-Type not treated as binary
- [ ] Chunks extractable by agents
- [ ] Citations work correctly

### Post-Deployment Monitoring

**Access Patterns:**

- [ ] Monitor `AI-Content-Format` header in logs
- [ ] Track TOON vs Markdown usage
- [ ] Measure agent adoption rate
- [ ] Identify most-accessed chunks

**Performance Metrics:**

- [ ] Measure token reduction vs HTML baseline
- [ ] Track chunk precision (partial vs full file fetches)
- [ ] Monitor cache hit rates
- [ ] Measure agent response times

**Error Tracking:**

- [ ] Monitor 404s on .llm.toon files
- [ ] Track TOON parse errors (if logging)
- [ ] Log chunk path not found errors
- [ ] Track MIME type issues

---

## Troubleshooting

### Common Issues

#### 1. TOON File Returns Binary Data

**Symptom:**
Agent receives `<binary data>` instead of text content.

**Cause:**
Incorrect Content-Type header (e.g., `application/toon` instead of `text/plain`).

**Solution:**

```nginx
# Correct
Content-Type: text/plain; charset=utf-8; format=toon

# Incorrect
Content-Type: application/toon
Content-Type: text/x-toon
```

**Fix:**

```nginx
location ~ \.llm\.toon$ {
    types { }
    default_type "text/plain; charset=utf-8; format=toon";
}
```

#### 2. Chunk Path Not Found

**Symptom:**
Validation error: "Chunk path @product.@specs not found in TOON file"

**Cause:**
Chunk definition references non-existent TOON object.

**Solution:**

1. Verify TOON object exists:
   ```bash
   grep -n "@specs" product.llm.toon
   ```

2. Check path spelling:
   ```yaml
   # Wrong
   toon_path: "@product.@specifications"  # Object is @specs

   # Correct
   toon_path: "@product.@specs"
   ```

3. Re-generate chunks:
   ```bash
   arw chunks extract product.llm.toon --deep
   ```

#### 3. Content Negotiation Not Working

**Symptom:**
Agent requests TOON but receives Markdown.

**Cause:**
Server not parsing Accept header correctly.

**Solution:**

**Test Accept header:**

```bash
curl -H "Accept: text/plain; format=toon" https://example.com/page
```

**Nginx debugging:**

```nginx
# Log Accept header
log_format debug '$remote_addr - $http_accept';
access_log /var/log/nginx/accept.log debug;

# Check if condition matches
if ($http_accept ~* "format=toon") {
    add_header X-Debug-Format "TOON requested" always;
}
```

#### 4. TOON Syntax Errors

**Symptom:**
`arw validate` reports syntax errors.

**Common Errors:**

**Missing quotes on strings:**

```toon
# Wrong
@name: Wireless Keyboard

# Correct
@name: "Wireless Keyboard"
```

**Trailing commas:**

```toon
# Wrong
@array: [
  "item1",
  "item2",  ← trailing comma
]

# Correct
@array: [
  "item1",
  "item2"
]
```

**Missing @ prefix:**

```toon
# Wrong
product {
  name: "Keyboard"
}

# Correct
@product {
  @name: "Keyboard"
}
```

**Solution:**

Use validator to pinpoint errors:

```bash
arw validate product.llm.toon --strict

# Output:
# ✗ Line 12: Expected '@' before object name
# ✗ Line 15: Missing closing brace
```

#### 5. File Not Served

**Symptom:**
404 error when fetching `.llm.toon` file.

**Checklist:**

1. File exists:
   ```bash
   ls -la public/products/keyboard.llm.toon
   ```

2. Permissions correct:
   ```bash
   chmod 644 public/products/keyboard.llm.toon
   ```

3. Server configured for .llm.toon:
   ```bash
   # Test direct file access
   curl -I https://example.com/products/keyboard.llm.toon
   ```

4. No .gitignore blocking:
   ```bash
   grep "\.llm\.toon" .gitignore
   # Should not match
   ```

#### 6. Schema Validation Fails

**Symptom:**
`arw validate --schema` reports schema violations.

**Debugging:**

```bash
# Validate with verbose output
arw validate product.llm.toon --schema=<url> --verbose

# Sample output:
# ✗ Field '@price.@amount' must be number, got string
# ✗ Required field '@sku' missing
```

**Solution:**

1. Check schema requirements:
   ```bash
   curl <schema-url>
   ```

2. Verify data types:
   ```toon
   # Wrong
   @price: {
     @amount: "79.99"  ← string, should be number
   }

   # Correct
   @price: {
     @amount: 79.99
   }
   ```

3. Add missing fields:
   ```toon
   @product {
     @sku: "KB-001"  ← add required field
   }
   ```

---

## Next Steps

After implementing TOON support:

1. **Start Small:**
   - Convert 1-2 pages to TOON
   - Validate thoroughly
   - Monitor agent access

2. **Gather Data:**
   - Track TOON vs Markdown usage
   - Measure token reduction
   - Collect agent feedback

3. **Iterate:**
   - Adjust chunk granularity
   - Optimize TOON structure
   - Refine format selection

4. **Scale:**
   - Convert more content
   - Automate generation pipeline
   - Update documentation

5. **Share:**
   - Contribute examples
   - Report issues
   - Help community adoption

---

## Resources

**Tools:**
- ARW CLI: `npm install -g @arw/cli`
- TOON Parser: (Reference implementation link)
- Schema Validator: `arw validate --schema`

**Documentation:**
- TOON Specification: https://toon-spec.org/v1.0
- ARW Specification: https://arw.dev/spec
- This guide: https://arw.dev/guides/toon

**Support:**
- GitHub Issues: https://github.com/agent-ready-web/issues
- Community Discord: https://discord.gg/arw
- Email: hello@arw.dev

---

**End of Implementation Guide**
