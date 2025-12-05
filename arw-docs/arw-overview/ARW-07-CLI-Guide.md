# ARW CLI Developer Guide

**Building Agent-Ready Websites with the Command Line**

---

## Executive Summary

The ARW CLI is a **developer toolkit** for implementing the Agent-Ready Web specification on your website. It provides everything you need to:

- **Validate** ARW implementations against the spec
- **Generate** discovery manifests and machine views
- **Build** complete ARW-enabled sites
- **Test** agent compatibility
- **Scan** existing sites for ARW readiness

**Quick Start:**
```bash
# Run validation (no install required)
npx arw@alpha validate https://yoursite.com

# Install globally
npm install -g arw@alpha

# Generate ARW files
arw generate
```

This guide covers everything from basic validation to advanced CI/CD integration.

---

## Table of Contents

1. [What is the ARW CLI?](#what-is-the-arw-cli)
2. [Installation](#installation)
3. [Getting Started](#getting-started)
4. [Core Commands](#core-commands)
5. [Validation](#validation)
6. [Generation](#generation)
7. [Building](#building)
8. [Testing](#testing)
9. [Advanced Workflows](#advanced-workflows)
10. [CI/CD Integration](#cicd-integration)
11. [Troubleshooting](#troubleshooting)

---

## What is the ARW CLI?

### Overview

The ARW CLI is a **command-line tool** that helps developers implement the Agent-Ready Web specification. Think of it as:

- **Validator** - Like an HTML validator, but for ARW
- **Generator** - Scaffolds ARW files from existing content
- **Builder** - Creates complete ARW implementations
- **Tester** - Simulates agent interactions

### Why Use the CLI?

**Instead of manually creating files:**
```yaml
# Manually editing llms.txt
version: 0.1
profile: ARW-1
site:
  name: 'My Site'
# ... hundreds of lines ...
```

**Use the CLI to automate:**
```bash
# Scan your site and generate ARW files
arw generate --source ./public --output ./public/llms.txt

# Validate everything
arw validate https://yoursite.com
```

### Key Features

**1. Validation**
- Schema validation (JSON/YAML syntax)
- Spec compliance (ARW-1 through ARW-4)
- Link integrity (machine views exist)
- Format consistency (JSON ↔ YAML)

**2. Generation**
- Auto-detect content structure
- Generate discovery manifests
- Create machine views from HTML
- Build chunk annotations

**3. Testing**
- Agent compatibility testing
- HTTP header verification
- MIME type checking
- Performance profiling

**4. Automation**
- CI/CD integration
- Pre-commit hooks
- Watch mode for development
- Batch processing

---

## Installation

### Option 1: npx (No Install Required)

**Best for:** One-time validation, trying ARW

```bash
# Validate a site
npx arw@alpha validate https://example.com

# Generate files
npx arw@alpha generate

# Scan a site
npx arw@alpha scan https://example.com
```

**Pros:**
- No installation needed
- Always uses latest version
- Perfect for CI/CD

**Cons:**
- Slower (downloads each time)
- Requires network connection

### Option 2: Global Install

**Best for:** Regular ARW development

```bash
# Install globally
npm install -g arw@alpha

# Now use directly
arw validate https://example.com
arw generate
arw build
```

**Pros:**
- Faster execution
- Works offline
- Shorter commands

**Cons:**
- Requires manual updates
- One version per system

### Option 3: Project Dependency

**Best for:** Team projects, CI/CD

```bash
# Add to package.json
npm install --save-dev arw@alpha

# Use via npm scripts
npm run arw:validate
npm run arw:build
```

**package.json:**
```json
{
  "scripts": {
    "arw:validate": "arw validate https://localhost:3000",
    "arw:generate": "arw generate --source ./src --output ./public",
    "arw:build": "arw build",
    "arw:test": "arw test --agent-compat"
  },
  "devDependencies": {
    "arw": "^0.1.0-alpha"
  }
}
```

### Verify Installation

```bash
# Check version
arw --version
# Output: arw/0.1.0-alpha

# Show help
arw --help

# Check available commands
arw commands
```

---

## Getting Started

### Your First ARW Implementation

**Scenario:** You have a documentation site and want to make it agent-ready.

**Step 1: Scan your existing site**

```bash
arw scan https://docs.yoursite.com

# Output:
# 🔍 Scanning https://docs.yoursite.com...
# ✅ Found 47 pages
# ✅ Detected structure: documentation site
# ✅ sitemap.xml present
# ⚠️  No ARW manifest found
#
# Recommendations:
# 1. Run: arw generate --source ./public
# 2. Create machine views for top 10 pages
# 3. Add /.well-known/arw-manifest.json
```

**Step 2: Generate ARW files**

```bash
arw generate --source ./public --output ./public

# Output:
# 🚀 Generating ARW files...
# ✅ Created /public/llms.txt (47 pages)
# ✅ Created /public/llms.json
# ✅ Created /public/.well-known/arw-manifest.json
# ⚠️  Machine views not created (use --create-machine-views)
#
# Next steps:
# 1. Review /public/llms.txt
# 2. Customize priorities and purposes
# 3. Create .llm.md files for key pages
# 4. Run: arw validate
```

**Step 3: Create machine views**

```bash
arw generate --create-machine-views --pages "getting-started,api-reference"

# Output:
# 🚀 Creating machine views...
# ✅ /public/getting-started.llm.md (2.3KB, 85% reduction)
# ✅ /public/api-reference.llm.md (5.1KB, 87% reduction)
#
# HTML → Markdown conversion complete
# Chunk annotations added automatically
```

**Step 4: Validate**

```bash
arw validate

# Output:
# ✅ ARW Profile: ARW-1 (Discovery Ready)
# ✅ Schema valid
# ✅ All machine views accessible
# ✅ Format consistency (JSON ↔ YAML)
# ⚠️  Consider implementing ARW-2 (chunks + headers)
#
# Your site is ARW-ready! 🎉
```

---

## Core Commands

### `arw validate`

**Purpose:** Validate ARW implementation against spec

**Basic usage:**
```bash
arw validate https://yoursite.com
```

**With options:**
```bash
# Validate local files
arw validate ./public/llms.txt

# Check specific profile
arw validate --profile ARW-3

# Detailed output
arw validate --verbose

# Check consistency
arw validate --check-consistency

# Save report
arw validate --output report.json
```

**Example output:**
```
🔍 Validating https://yoursite.com...

✅ Discovery
  ✅ /.well-known/arw-manifest.json found (200 OK)
  ✅ Schema valid (v0.1)
  ✅ Profile: ARW-2 (Semantic Ready)

✅ Content
  ✅ 47 pages indexed
  ✅ All machine views accessible
  ✅ Chunk IDs unique and valid

✅ Headers
  ✅ AI-Attribution present
  ✅ AI-Training declared
  ✅ AI-Inference allowed

⚠️  Warnings
  ⚠️  Consider adding OAuth actions (ARW-3)
  ⚠️  Rate limits not specified

📊 Summary
  Profile: ARW-2
  Pages: 47
  Chunks: 312
  Validation: PASSED ✅
```

### `arw generate`

**Purpose:** Generate ARW files from existing content

**Basic usage:**
```bash
arw generate
```

**With options:**
```bash
# Specify source directory
arw generate --source ./src/content

# Specify output location
arw generate --output ./public/llms.txt

# Generate both JSON and YAML
arw generate --format both

# Create machine views
arw generate --create-machine-views

# Only generate for specific pages
arw generate --pages "home,about,docs/*"

# Use sitemap as source
arw generate --from-sitemap https://yoursite.com/sitemap.xml
```

**Example:**
```bash
arw generate --source ./content --create-machine-views --format both

# Output:
# 🚀 Scanning ./content...
# ✅ Found 47 pages
# ✅ Detected patterns:
#    - /blog/*.md → blog posts
#    - /docs/*.md → documentation
#    - /pages/*.md → static pages
#
# 🚀 Generating manifests...
# ✅ Created ./public/llms.txt (47 pages)
# ✅ Created ./public/llms.json
# ✅ Created ./public/.well-known/arw-manifest.json
#
# 🚀 Creating machine views...
# ✅ 47 machine views created (avg 85% reduction)
#
# ✨ Generation complete!
```

### `arw build`

**Purpose:** Build complete ARW implementation

**Basic usage:**
```bash
arw build
```

**With options:**
```bash
# Build with specific profile
arw build --profile ARW-3

# Include OAuth setup
arw build --with-oauth

# Generate sample actions
arw build --actions "add_to_cart,checkout"

# Build for production
arw build --env production

# Watch mode
arw build --watch
```

**Example:**
```bash
arw build --profile ARW-3 --with-oauth

# Output:
# 🚀 Building ARW implementation (ARW-3)...
#
# ✅ Discovery files
#    ✅ /.well-known/arw-manifest.json
#    ✅ /llms.json
#    ✅ /llms.txt
#
# ✅ Content
#    ✅ 47 machine views (.llm.md)
#    ✅ 312 chunks annotated
#
# ✅ Actions
#    ✅ OAuth configuration generated
#    ✅ Sample endpoints created
#    ⚠️  Review and customize OAuth scopes
#
# ✅ Policies
#    ✅ /.well-known/arw-policies.json
#    ⚠️  Review training/inference settings
#
# 📊 Build Summary
#    Profile: ARW-3
#    Files created: 52
#    Token reduction: 85% avg
#
# Next steps:
# 1. Review generated OAuth config
# 2. Implement action endpoints
# 3. Test with: arw test --agent-compat
```

### `arw scan`

**Purpose:** Analyze existing site for ARW readiness

**Basic usage:**
```bash
arw scan https://yoursite.com
```

**With options:**
```bash
# Scan local files
arw scan ./public

# Deep scan (check all linked pages)
arw scan --deep

# Save report
arw scan --output scan-report.json

# Check specific aspects
arw scan --check-only headers,structure
```

**Example output:**
```
🔍 Scanning https://docs.yoursite.com...

📄 Site Structure
  ✅ sitemap.xml found (47 URLs)
  ✅ robots.txt found
  ❌ No ARW manifest found
  ⚠️  HTML pages are large (avg 55KB)

📊 Content Analysis
  ✅ 47 pages detected
  ✅ Hierarchical structure detected
  ✅ Semantic HTML structure
  ⚠️  No chunk annotations

🔍 Headers
  ❌ No AI-* headers present
  ⚠️  CORS headers missing

📈 Opportunities
  Token savings potential: 85% (55KB → 8KB avg)
  Estimated implementation time: 2-4 hours
  Recommended profile: ARW-2

💡 Recommendations
  1. Run: arw generate --source ./public
  2. Create machine views for top 10 pages
  3. Add AI-Attribution headers
  4. Implement chunk annotations

📊 ARW Readiness Score: 4/10
```

---

## Validation

### Schema Validation

**Validate manifest syntax:**

```bash
# Validate YAML
arw validate ./public/llms.txt

# Validate JSON
arw validate ./public/llms.json

# Validate both and check consistency
arw validate --check-consistency
```

**Example errors:**

```
❌ Schema Validation Failed

Error in /public/llms.txt:12
  Expected: version: "0.1"
  Found: version: "1.0"
  Fix: Update version to "0.1"

Error in /public/llms.txt:18
  Missing required field: machine_view
  Location: content[0]
  Fix: Add machine_view property

⚠️  Warning in /public/llms.txt:25
  Unknown field: machine_url
  Did you mean: machine_view?
```

### Profile Validation

**Check conformance level:**

```bash
# Validate against specific profile
arw validate --profile ARW-1

# Check if site meets higher profile
arw validate --target-profile ARW-3
```

**Example:**

```
🔍 Validating against ARW-3 (Action Ready)...

✅ ARW-1 Requirements
  ✅ /llms.txt present
  ✅ Machine views created
  ✅ AI-Attribution header

✅ ARW-2 Requirements
  ✅ Chunk annotations
  ✅ Full AI-* header suite
  ✅ Rate limiting configured

❌ ARW-3 Requirements
  ❌ OAuth endpoints missing
  ❌ No actions declared
  ⚠️  Schema.org potentialAction not found

📊 Profile: ARW-2 ✅
    Target: ARW-3 ❌

To reach ARW-3:
1. Implement OAuth 2.0 server
2. Add actions to manifest
3. Add Schema.org potentialAction to HTML
```

### Link Validation

**Check all referenced URLs:**

```bash
arw validate --check-links

# Output:
# 🔍 Checking 47 machine views...
# ✅ /docs/getting-started.llm.md (200 OK)
# ✅ /docs/api-reference.llm.md (200 OK)
# ❌ /docs/deprecated.llm.md (404 Not Found)
# ⚠️  /blog/post.llm.md (301 Redirect)
#
# Summary:
# ✅ 45 accessible
# ❌ 1 broken link
# ⚠️  1 redirect
```

### Format Consistency

**Ensure JSON and YAML match:**

```bash
arw validate --check-consistency

# Output:
# 🔍 Checking format consistency...
#
# Comparing:
#   /public/llms.txt
#   /public/llms.json
#   /.well-known/arw-manifest.json
#
# ❌ Inconsistency found:
#
# /llms.txt line 15:
#   priority: high
#
# /llms.json line 18:
#   "priority": "medium"
#
# Fix: Update priority to "high" in /llms.json
```

---

## Generation

### Auto-Generate from Content

**Scan and generate:**

```bash
arw generate --source ./content

# Detected patterns:
# /content/blog/*.md → blog posts
# /content/docs/*.md → documentation
# /content/pages/*.md → static pages
```

**Generated `llms.txt`:**

```yaml
version: 0.1
profile: ARW-1

site:
  name: 'Your Site'
  homepage: 'https://yoursite.com'

content:
  # Auto-detected from /content/docs/
  - url: /docs/getting-started
    machine_view: /docs/getting-started.llm.md
    purpose: documentation
    priority: high

  # Auto-detected from /content/blog/
  - url: /blog/arw-introduction
    machine_view: /blog/arw-introduction.llm.md
    purpose: blog_post
    priority: medium
```

### Create Machine Views

**Generate .llm.md from HTML:**

```bash
arw generate --create-machine-views

# Or for specific pages:
arw generate --create-machine-views --pages "docs/*"
```

**Before (HTML - 55KB):**
```html
<!DOCTYPE html>
<html>
<head>
  <title>Getting Started</title>
  <link rel="stylesheet" href="styles.css">
  <script src="analytics.js"></script>
</head>
<body>
  <nav>...</nav>
  <aside>...</aside>
  <main>
    <h1>Getting Started</h1>
    <p>Welcome to our documentation...</p>
  </main>
  <footer>...</footer>
</body>
</html>
```

**After (Markdown - 8KB, 85% reduction):**
```markdown
<!-- chunk:introduction -->
# Getting Started

Welcome to our documentation...

<!-- chunk:installation -->
## Installation

Install the package using npm:

\`\`\`bash
npm install example-package
\`\`\`

<!-- chunk:configuration -->
## Configuration

Configure your environment:

\`\`\`javascript
const config = {
  apiKey: 'your-key'
};
\`\`\`
```

### Generate from Sitemap

**Use existing sitemap.xml:**

```bash
arw generate --from-sitemap https://yoursite.com/sitemap.xml

# Output:
# 🔍 Fetching sitemap...
# ✅ Found 47 URLs
#
# 🚀 Generating manifest...
# ✅ Created llms.txt with 47 pages
# ⚠️  lastmod dates imported from sitemap
# ⚠️  Review and customize priorities
```

### Format Conversion

**Convert between formats:**

```bash
# YAML → JSON
arw convert --input llms.txt --output llms.json

# JSON → YAML
arw convert --input llms.json --output llms.txt

# Generate both from one source
arw generate --format both
```

---

## Building

### Quick Build

**Build complete ARW implementation:**

```bash
arw build

# Creates:
# ✅ /.well-known/arw-manifest.json
# ✅ /llms.json
# ✅ /llms.txt
# ✅ Machine views for all pages
```

### Build with Profile

**Build for specific conformance level:**

```bash
# ARW-1: Discovery only
arw build --profile ARW-1

# ARW-2: Semantic + chunks
arw build --profile ARW-2

# ARW-3: Actions + OAuth
arw build --profile ARW-3
```

**ARW-3 example:**

```bash
arw build --profile ARW-3

# Output:
# 🚀 Building ARW-3 implementation...
#
# ✅ Discovery files
# ✅ Machine views
# ✅ Chunk annotations
# ✅ AI-* headers configuration
# ✅ OAuth scaffold
# ✅ Sample actions:
#    - /api/actions/sample-action.ts
# ✅ Policy file
#
# ⚠️  TODO:
# 1. Implement OAuth endpoints
# 2. Customize action logic
# 3. Review policies
```

### Watch Mode

**Auto-rebuild on changes:**

```bash
arw build --watch

# Output:
# 👀 Watching for changes...
#
# ✅ Initial build complete
#
# [12:34:56] File changed: /content/docs/api.md
# 🔄 Rebuilding...
# ✅ Updated /docs/api.llm.md
# ✅ Updated llms.txt
```

### Production Build

**Optimized for production:**

```bash
arw build --env production

# Optimizations:
# ✅ Minified JSON
# ✅ Compressed machine views
# ✅ Generated ETag headers
# ✅ Optimized chunk sizes
```

---

## Testing

### Agent Compatibility Testing

**Test with agent simulators:**

```bash
arw test --agent-compat

# Output:
# 🤖 Testing agent compatibility...
#
# ✅ Claude WebFetch
#    ✅ Can fetch /.well-known/arw-manifest.json
#    ✅ Can parse llms.txt (text/plain)
#    ✅ Can fetch machine views
#    ✅ MIME types compatible
#
# ✅ ChatGPT Browser
#    ✅ CORS headers present
#    ✅ Can parse JSON manifest
#    ✅ Chunk addressing works
#
# ⚠️  Perplexity
#    ⚠️  Aggressive caching detected
#    💡 Add versioned URLs or strong ETags
#
# 📊 Compatibility: 95% (3/3 major agents)
```

### HTTP Header Testing

**Verify headers:**

```bash
arw test --check-headers

# Output:
# 🔍 Checking HTTP headers...
#
# /.well-known/arw-manifest.json
#   ✅ Content-Type: application/json; charset=utf-8
#   ✅ Cache-Control: public, max-age=3600
#   ✅ Access-Control-Allow-Origin: *
#
# /llms.txt
#   ✅ Content-Type: text/plain; charset=utf-8
#   ⚠️  Cache-Control: no-cache
#   💡 Consider: public, max-age=3600
#
# /docs/api.llm.md
#   ✅ AI-Attribution: required; format=link
#   ✅ AI-Training: disallowed
#   ✅ AI-Inference: allowed
#   ❌ AI-Rate-Limit: missing
```

### Performance Testing

**Measure token reduction:**

```bash
arw test --performance

# Output:
# 📊 Performance Analysis
#
# Token Reduction:
#   Average HTML size: 55KB
#   Average .llm.md size: 8KB
#   Reduction: 85%
#
# Per-page breakdown:
#   /docs/getting-started: 47KB → 7KB (85%)
#   /docs/api-reference: 120KB → 18KB (85%)
#   /blog/post: 38KB → 6KB (84%)
#
# Discovery Speed:
#   Traditional crawl: 15 seconds (47 pages)
#   ARW manifest: 1.2 seconds
#   Improvement: 12.5x faster
```

### Integration Testing

**Test full workflow:**

```bash
arw test --integration

# Output:
# 🔄 Running integration tests...
#
# Test 1: Discovery Flow
#   ✅ Agent finds /.well-known/arw-manifest.json
#   ✅ Manifest parses correctly
#   ✅ Content index accessible
#
# Test 2: Machine View Access
#   ✅ All machine views return 200 OK
#   ✅ Chunk addressing works
#   ✅ Content matches source
#
# Test 3: Policy Compliance
#   ✅ Policies declared
#   ✅ Attribution template valid
#   ✅ Rate limits specified
#
# ✅ All tests passed (15/15)
```

---

## Advanced Workflows

### Custom Configuration

**Create `arw.config.js`:**

```javascript
// arw.config.js
module.exports = {
  // Source directories
  source: './src/content',
  output: './public',

  // Content detection
  patterns: {
    blog: '/content/blog/**/*.md',
    docs: '/content/docs/**/*.md',
    pages: '/content/pages/**/*.md'
  },

  // Machine view generation
  machineViews: {
    enabled: true,
    chunkAnnotations: true,
    removeNavigation: true,
    removeFooter: true,
    customSelectors: {
      exclude: ['.advertisement', '.sidebar']
    }
  },

  // Profile settings
  profile: 'ARW-2',

  // Policies
  policies: {
    training: false,
    inference: true,
    attribution: {
      required: true,
      format: 'link'
    }
  },

  // OAuth (ARW-3+)
  oauth: {
    authorizationUrl: '/oauth/authorize',
    tokenUrl: '/oauth/token',
    scopes: ['read', 'write']
  }
};
```

**Use config:**

```bash
arw build --config arw.config.js
```

### Batch Processing

**Process multiple sites:**

```bash
arw batch --config sites.json

# sites.json:
# [
#   {
#     "name": "docs",
#     "url": "https://docs.example.com",
#     "source": "./docs-content"
#   },
#   {
#     "name": "blog",
#     "url": "https://blog.example.com",
#     "source": "./blog-content"
#   }
# ]
```

### Incremental Updates

**Only update changed files:**

```bash
arw build --incremental

# Output:
# 🔍 Detecting changes...
# ✅ 2 files modified
# ✅ 1 file deleted
# ✅ 3 files added
#
# 🔄 Updating:
#   ✅ /docs/api.llm.md (modified)
#   ✅ /blog/new-post.llm.md (added)
#   ✅ llms.txt (updated index)
```

### Custom Templates

**Use custom templates:**

```bash
arw generate --template custom-template.hbs

# custom-template.hbs (Handlebars):
# version: {{version}}
# profile: {{profile}}
#
# site:
#   name: '{{site.name}}'
#   custom_field: '{{site.custom}}'
#
# {{#each content}}
# - url: {{url}}
#   machine_view: {{machine_view}}
#   custom_priority: {{priority}}
# {{/each}}
```

### Plugin System

**Create custom plugins:**

```javascript
// arw-plugin-analytics.js
module.exports = {
  name: 'analytics',
  hooks: {
    afterBuild: (ctx) => {
      // Custom analytics logic
      console.log(`Built ${ctx.pages.length} pages`);
      console.log(`Token reduction: ${ctx.stats.reduction}%`);
    }
  }
};
```

**Use plugin:**

```bash
arw build --plugin ./arw-plugin-analytics.js
```

---

## CI/CD Integration

### GitHub Actions

**`.github/workflows/arw-validate.yml`:**

```yaml
name: ARW Validation

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Validate ARW
        run: npx arw@alpha validate ./public/llms.txt

      - name: Check consistency
        run: npx arw@alpha validate --check-consistency

      - name: Test agent compatibility
        run: npx arw@alpha test --agent-compat
```

**Auto-build on content changes:**

```yaml
name: ARW Build

on:
  push:
    paths:
      - 'content/**/*.md'

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Build ARW files
        run: |
          npx arw@alpha build --source ./content --output ./public

      - name: Commit changes
        run: |
          git config user.name "ARW Bot"
          git add public/
          git commit -m "chore: Update ARW files"
          git push
```

### Pre-commit Hook

**`.git/hooks/pre-commit`:**

```bash
#!/bin/sh

# Validate ARW before commit
npx arw@alpha validate --quiet

if [ $? -ne 0 ]; then
  echo "❌ ARW validation failed. Fix errors before committing."
  exit 1
fi

echo "✅ ARW validation passed"
```

### Vercel Integration

**`vercel.json`:**

```json
{
  "buildCommand": "npm run build && npx arw@alpha build",
  "devCommand": "npm run dev",
  "installCommand": "npm install && npm install -g arw@alpha"
}
```

### Netlify Integration

**`netlify.toml`:**

```toml
[build]
  command = "npm run build && npx arw@alpha build"
  publish = "public"

[[plugins]]
  package = "netlify-plugin-arw"

  [plugins.inputs]
    source = "./content"
    profile = "ARW-2"
```

---

## Troubleshooting

### Common Errors

**Error: "Invalid YAML syntax"**

```bash
arw validate ./public/llms.txt

# Error:
# ❌ YAML Parse Error at line 15
#    Expected: key-value pair
#    Found: invalid indentation
#
# Fix:
#   Line 15: Ensure proper indentation (2 spaces)
```

**Fix:**
```yaml
# ❌ Wrong (mixed spaces/tabs)
content:
	- url: /page

# ✅ Correct (2 spaces)
content:
  - url: /page
```

**Error: "Machine view not found"**

```bash
# Error:
# ❌ 404 Not Found: /docs/api.llm.md
#    Referenced in llms.txt line 18
```

**Fix:**
```bash
# Create missing machine view
arw generate --create-machine-views --pages "docs/api"
```

**Error: "Format inconsistency"**

```bash
# Error:
# ❌ /llms.txt and /llms.json differ
#    Field: content[0].priority
#    YAML: "high"
#    JSON: "medium"
```

**Fix:**
```bash
# Re-generate JSON from YAML
arw convert --input llms.txt --output llms.json
```

### Validation Issues

**Issue: "Profile requirements not met"**

```bash
# Declared: ARW-3
# Actual: ARW-2
#
# Missing:
# - OAuth endpoints
# - Action declarations
```

**Fix:**
```bash
# Downgrade profile
arw build --profile ARW-2

# Or implement missing features
arw build --profile ARW-3 --with-oauth
```

### Performance Issues

**Issue: "Build taking too long"**

```bash
# For large sites (1000+ pages)
arw build --incremental --parallel
```

**Issue: "Machine views too large"**

```bash
# Optimize chunk sizes
arw generate --max-chunk-size 2000
```

### Agent Compatibility

**Issue: "Claude can't parse llms.txt"**

```bash
# Check MIME type
arw test --check-headers

# Fix:
# Ensure Content-Type: text/plain; charset=utf-8
```

**Issue: "ChatGPT CORS error"**

```bash
# Add CORS headers:
# Access-Control-Allow-Origin: *
# Access-Control-Allow-Methods: GET, OPTIONS
```

---

## CLI Reference

### Quick Command Reference

```bash
# Validation
arw validate [url|file]              # Validate ARW implementation
arw validate --profile ARW-3         # Check specific profile
arw validate --check-consistency     # Verify format consistency

# Generation
arw generate                         # Generate ARW files
arw generate --create-machine-views  # Create .llm.md files
arw generate --from-sitemap [url]    # Generate from sitemap

# Building
arw build                            # Build complete implementation
arw build --profile ARW-3            # Build with specific profile
arw build --watch                    # Watch mode

# Testing
arw test --agent-compat              # Test agent compatibility
arw test --check-headers             # Verify HTTP headers
arw test --performance               # Performance analysis

# Utilities
arw scan [url]                       # Scan site for ARW readiness
arw convert [input] [output]         # Convert formats
arw version                          # Show version
arw help [command]                   # Show help
```

### Global Options

```bash
--verbose, -v       # Verbose output
--quiet, -q         # Suppress output
--config [file]     # Use config file
--output [file]     # Save output to file
--format [type]     # Output format (json, yaml, text)
```

---

## What's Next?

### Learning Path

1. **Start here:** Basic validation and generation
2. **Next:** Machine view creation and optimization
3. **Advanced:** CI/CD integration and automation
4. **Expert:** Custom plugins and workflows

### Additional Resources

- **Specification:** [ARW v0.1-draft](../../spec/ARW-0.1-draft.md)
- **Examples:** [ARW Examples Repository](https://github.com/agent-ready-web/examples)
- **API Docs:** [CLI API Reference](https://docs.arw.dev/cli)
- **Community:** [GitHub Discussions](https://github.com/agent-ready-web/arw/discussions)

### Getting Help

**Documentation:**
```bash
arw help              # General help
arw help validate     # Command-specific help
arw docs              # Open documentation
```

**Community:**
- GitHub Issues: Report bugs
- Discussions: Ask questions
- Discord: Real-time help

**Professional Support:**
- Email: support@arw.dev
- Enterprise: Contact for SLA and priority support

---

## Conclusion

The ARW CLI provides everything developers need to implement the Agent-Ready Web specification:

**Core Capabilities:**
- ✅ Validation against spec
- ✅ Auto-generation from content
- ✅ Machine view creation
- ✅ Agent compatibility testing
- ✅ CI/CD integration

**Getting Started:**
```bash
# Install
npm install -g arw@alpha

# Generate
arw generate

# Validate
arw validate

# Deploy
git commit && git push
```

**The Result:**

Websites that are efficiently discoverable and navigable by AI agents, built with developer-friendly tools.

---

**Version:** 0.1-draft
**Date:** January 2025
**License:** Apache 2.0

**Related Documents:**
- [ARW Specification v0.1-draft](../../spec/ARW-0.1-draft.md)
- [ARW Introduction](./ARW-Introduction.md)
- [ARW Discovery Architecture](./ARW-Discovery-Architecture.md)
- [ARW Overview and Benefits](./ARW-Overview-and-Benefits.md)

**CLI Repository:** https://github.com/agent-ready-web/arw-cli
**Contact:** ai@arw.dev
**Community:** github.com/agent-ready-web
