# ARW Inspector: Visual Validation and Debugging Tool

**Debug and Validate Your ARW Implementation in Real-Time**

---

## Executive Summary

The **ARW Inspector** is a web-based visualization and debugging tool that helps developers and publishers validate their Agent-Ready Web implementations in real-time.

**What it does:**

- **Validates** ARW manifests against the spec
- **Visualizes** discovery architecture and content structure
- **Tests** agent compatibility and HTTP headers
- **Analyzes** token efficiency and performance
- **Debugs** implementation issues with detailed error reporting

**Access it:**

- **Live Tool**: https://inspector.arw.dev
- **Local Development**: `npm run dev` in the inspector package
- **Integrated**: Built into ARW CLI with `arw inspect`

**Quick Start:**

```bash
# Open inspector
open https://inspector.arw.dev

# Enter your site URL
https://yoursite.com

# Get instant validation and visualization
```

This guide explains how to use the Inspector to validate, debug, and optimize your ARW implementation.

---

## Table of Contents

1. [What is the ARW Inspector?](#what-is-the-arw-inspector)
2. [Key Features](#key-features)
3. [Getting Started](#getting-started)
4. [Discovery Validation](#discovery-validation)
5. [Content Analysis](#content-analysis)
6. [Performance Profiling](#performance-profiling)
7. [Agent Compatibility Testing](#agent-compatibility-testing)
8. [Visual Graph Explorer](#visual-graph-explorer)
9. [Error Debugging](#error-debugging)
10. [Use Cases](#use-cases)
11. [Integration Options](#integration-options)
12. [Advanced Features](#advanced-features)

---

## What is the ARW Inspector?

### Overview

The ARW Inspector is a **browser-based development tool** that provides visual validation and debugging for Agent-Ready Web implementations.

Think of it as:

- **Chrome DevTools** for ARW
- **Lighthouse** for agent readiness
- **JSON Schema Validator** with visualization
- **Site analyzer** for AI agent compatibility

### Why Use the Inspector?

**Instead of debugging blind:**

```bash
# Command line only
arw validate https://yoursite.com
# ❌ Error in llms.txt line 47
# (Where is line 47? What's the context?)
```

**Use the Inspector for visual debugging:**

```
ARW Inspector
├── Visual manifest editor (syntax highlighting)
├── Real-time validation (as you type)
├── Error highlighting (with context)
├── Fix suggestions (actionable)
└── Live preview (see changes immediately)
```

### The Problem It Solves

**Challenge 1: Invisible Errors**

Traditional validation tools show errors but not context:

```
Error: Invalid chunk ID
Line: 47
```

**Inspector shows:**

```
[Line 47] chunks:
            - id: product-overview ✅
            - id: product specs     ❌ Invalid (contains space)
                  ↑
                  Chunk IDs must be URL-safe (use hyphens)
```

**Challenge 2: Complex Discovery Flow**

Understanding the 3-step discovery flow is difficult:

```
Step 1: /.well-known/arw-manifest.json
Step 2: /llms.json or /llms.txt
Step 3: robots.txt hints
```

**Inspector visualizes:**

```
Discovery Flow
┌─────────────────────────────────┐
│ Step 1: .well-known             │
│ Status: ✅ 200 OK                │
│ Format: JSON                    │
│ Size: 2.3 KB                    │
│ Cache: 3600s                    │
└─────────────────────────────────┘
         ↓
    [View Content]
```

**Challenge 3: Agent Compatibility**

Testing across multiple AI agents is manual:

```
- Try ChatGPT
- Try Claude
- Try Perplexity
- Check each manually
```

**Inspector automates:**

```
Agent Compatibility Test
┌────────────────────────────────┐
│ Claude WebFetch        ✅ Pass │
│ ChatGPT Browser        ✅ Pass │
│ Perplexity             ⚠️  Warn │
│ Generic HTTP Clients   ✅ Pass │
└────────────────────────────────┘
```

---

## Key Features

### 1. Real-Time Validation

**Validate as you type:**

- Syntax checking (JSON/YAML)
- Schema validation (ARW spec)
- Link verification (machine views exist)
- Format consistency (JSON ↔ YAML)

**Example:**

```yaml
# Type in the editor
version: 0.1
profile: ARW-1

site:
  name: 'My Site'
  homepage: https://mysite.com

# Instant feedback
✅ Syntax: Valid YAML
✅ Schema: Conforms to ARW v0.1
✅ Profile: ARW-1 requirements met
⚠️  Suggestion: Add contact email
```

### 2. Visual Discovery Flow

**See the complete discovery process:**

```
Discovery Timeline
─────────────────────────────────────────
Request 1: /.well-known/arw-manifest.json
  ├─ Status: 200 OK (150ms)
  ├─ Content-Type: application/json ✅
  ├─ Size: 2.3 KB
  └─ Parsed: 47 pages

Request 2: /llms.txt (fallback check)
  └─ Status: 200 OK (valid alternative)

Request 3: robots.txt
  └─ No arw-manifest hint (not needed)

✅ Discovery: Successful via .well-known
```

### 3. Content Structure Visualization

**Tree view of content:**

```
Content Structure (47 pages)
├─ 📄 Homepage
│  ├─ Chunk: hero-section
│  ├─ Chunk: features
│  └─ Chunk: call-to-action
├─ 📁 Documentation (23 pages)
│  ├─ 📄 Getting Started
│  │  ├─ Chunk: installation (1.2 KB)
│  │  ├─ Chunk: configuration (0.8 KB)
│  │  └─ Chunk: first-steps (1.5 KB)
│  └─ 📄 API Reference
│     ├─ Chunk: authentication (2.1 KB)
│     └─ Chunk: endpoints (3.4 KB)
└─ 📁 Blog (24 posts)
```

### 4. Token Efficiency Analysis

**Measure token savings:**

```
Token Efficiency Report
─────────────────────────────────────────
Page: /docs/getting-started

HTML Version:
  Size: 55 KB
  Tokens: ~18,000
  Load Time: 2.3s

Machine View (.llm.md):
  Size: 8 KB
  Tokens: ~2,700
  Load Time: 0.3s

Savings:
  Size: 85% reduction
  Tokens: 85% reduction
  Speed: 7.6x faster

Projected Monthly Savings (10K requests):
  Bandwidth: 470 MB saved
  Tokens: 153M saved
  Cost: $4,590 saved
```

### 5. Agent Compatibility Matrix

**Test against major AI agents:**

```
┌──────────────────┬─────────┬─────────┬─────────┬──────────┐
│ Feature          │ Claude  │ ChatGPT │ Perplex │ Gemini   │
├──────────────────┼─────────┼─────────┼─────────┼──────────┤
│ .well-known      │ ✅      │ ✅      │ ✅      │ ✅       │
│ llms.txt (YAML)  │ ✅      │ ✅      │ ✅      │ ✅       │
│ llms.json        │ ✅      │ ✅      │ ✅      │ ✅       │
│ Machine Views    │ ✅      │ ✅      │ ✅      │ ✅       │
│ Chunk Addressing │ ✅      │ ✅      │ ⚠️      │ ✅       │
│ CORS Headers     │ ✅      │ ✅      │ ✅      │ ✅       │
│ MIME Types       │ ✅      │ ⚠️      │ ✅      │ ✅       │
└──────────────────┴─────────┴─────────┴─────────┴──────────┘

⚠️  Warnings:
  - ChatGPT: Custom MIME types may trigger CORS
  - Perplexity: Aggressive caching detected
```

### 6. HTTP Header Inspector

**Verify headers:**

```
HTTP Headers Analysis
─────────────────────────────────────────

/.well-known/arw-manifest.json
✅ Content-Type: application/json; charset=utf-8
✅ Cache-Control: public, max-age=3600
✅ Access-Control-Allow-Origin: *
✅ ETag: "manifest-v2"
⚠️  No Vary: Accept-Encoding (compression recommended)

/llms.txt
✅ Content-Type: text/plain; charset=utf-8
❌ Cache-Control: no-cache (should be: public, max-age=3600)
✅ Access-Control-Allow-Origin: *

/docs/api.llm.md
✅ AI-Attribution: required; format=link
✅ AI-Training: disallowed
✅ AI-Inference: allowed
❌ AI-Rate-Limit: missing (recommended)
```

---

## Getting Started

### Access the Inspector

**Option 1: Web Interface (No Installation)**

```bash
# Open in browser
open https://inspector.arw.dev

# Enter site URL
https://yoursite.com

# Or paste manifest directly
[Paste llms.txt content]
```

**Option 2: CLI Integration**

```bash
# Install ARW CLI
npm install -g arw@alpha

# Open inspector for your site
arw inspect https://yoursite.com

# Or inspect local files
arw inspect ./public/llms.txt
```

**Option 3: Local Development**

```bash
# Clone repository
git clone https://github.com/agent-ready-web/arw-inspector
cd arw-inspector

# Install dependencies
npm install

# Run locally
npm run dev

# Open http://localhost:3000
```

### Quick Validation

**Step 1: Enter URL**

```
┌─────────────────────────────────────┐
│ Inspect ARW Implementation          │
├─────────────────────────────────────┤
│ URL: https://docs.yoursite.com      │
│                                     │
│ [Inspect]                           │
└─────────────────────────────────────┘
```

**Step 2: View Results**

```
Inspection Results
─────────────────────────────────────────
✅ Discovery: ARW-enabled via .well-known
✅ Schema: Valid ARW v0.1 manifest
✅ Profile: ARW-2 (Semantic Ready)
✅ Content: 47 pages, 312 chunks
⚠️  Warnings: 2 (see details)
❌ Errors: 0

View Details ▼
```

**Step 3: Drill Down**

```
Discovery Details
├─ ✅ /.well-known/arw-manifest.json (200 OK)
├─ ✅ /llms.json (alternative present)
├─ ✅ /llms.txt (alternative present)
└─ ⚠️  Format consistency check
    └─ Priority mismatch: /docs/api
       YAML: "high"
       JSON: "medium"
       [Fix Now] [Ignore]
```

---

## Discovery Validation

### Discovery Flow Visualization

**The Inspector shows each discovery step:**

```
Step 1: RFC 8615 Standard Location
┌─────────────────────────────────────┐
│ GET /.well-known/arw-manifest.json  │
├─────────────────────────────────────┤
│ Status: 200 OK                      │
│ Response Time: 125ms                │
│ Content-Type: application/json ✅   │
│ Size: 2.3 KB                        │
│ Cache-Control: max-age=3600 ✅      │
├─────────────────────────────────────┤
│ [View Raw Response]                 │
│ [Download Manifest]                 │
└─────────────────────────────────────┘
```

### Manifest Schema Validation

**Real-time schema checking:**

```yaml
# Inspector editor with inline validation

version: 0.1  ✅
profile: ARW-2  ✅

site:
  name: 'My Docs'  ✅
  homepage: https://docs.example.com  ✅
  contact: ai@example.com  ✅

content:
  - url: /getting-started  ✅
    machine_view: /getting-started.llm.md  ⚠️ (not found)
    purpose: documentation  ✅
    priority: high  ✅
    chunks:
      - id: installation  ✅
        heading: 'Installation'  ✅
      - id: config setup  ❌ Invalid chunk ID (contains space)
                              Suggestion: Use 'config-setup'
```

### Format Consistency Check

**Compare JSON and YAML:**

```
Format Consistency Report
─────────────────────────────────────────

Comparing Files:
├─ /llms.txt (YAML)
├─ /llms.json (JSON)
└─ /.well-known/arw-manifest.json (JSON)

Inconsistencies Found: 1
─────────────────────────────────────────

content[0].priority
  YAML (/llms.txt): "high"
  JSON (/llms.json): "medium"
  .well-known: "high"

Recommendation: Update /llms.json to match YAML

[Auto-Fix] [Ignore] [View Diff]
```

---

## Content Analysis

### Content Tree Explorer

**Navigate content structure:**

```
Content Tree (47 pages)
─────────────────────────────────────────

📁 Documentation (high priority)
├─ 📄 Getting Started
│  ├─ 📊 Stats: 3 chunks, 3.5 KB
│  ├─ 💾 Token savings: 85%
│  └─ 🔗 Chunks:
│     ├─ installation (1.2 KB)
│     ├─ configuration (0.8 KB)
│     └─ first-steps (1.5 KB)
│
├─ 📄 API Reference
│  ├─ 📊 Stats: 5 chunks, 8.1 KB
│  ├─ 💾 Token savings: 87%
│  └─ 🔗 Chunks:
│     ├─ authentication (2.1 KB)
│     ├─ endpoints (3.4 KB)
│     └─ rate-limiting (1.2 KB)

[Expand All] [Collapse All] [Export Tree]
```

### Chunk Analysis

**Detailed chunk information:**

```
Chunk Details: authentication
─────────────────────────────────────────

Location:
  Page: /docs/api-reference
  URL: /docs/api-reference.llm.md#authentication
  HTML: data-chunk-id="authentication"

Metrics:
  Size: 2.1 KB
  Tokens: ~700
  Word count: 350
  Reading time: 1.5 min

Accessibility:
  ✅ Directly addressable
  ✅ Chunk ID matches HTML
  ✅ Heading present
  ✅ URL-safe ID

Content Preview:
───────────────
# Authentication

Our API uses OAuth 2.0 for secure authentication...

[View Full Content] [Test Access] [Edit]
```

### Link Integrity Check

**Verify all machine views:**

```
Link Integrity Report
─────────────────────────────────────────

Checking 47 machine views...

✅ Accessible: 45 (96%)
❌ Not Found: 1 (2%)
⚠️  Redirects: 1 (2%)

Issues:
─────────────────────────────────────────

❌ /docs/deprecated.llm.md
   Referenced in: llms.txt line 34
   Status: 404 Not Found
   Fix: Remove from manifest or create file

⚠️  /blog/old-post.llm.md
   Referenced in: llms.txt line 67
   Status: 301 → /blog/new-post.llm.md
   Fix: Update URL in manifest

[Auto-Fix All] [Export Report]
```

---

## Performance Profiling

### Token Efficiency Dashboard

**Measure token savings:**

```
Token Efficiency Analysis
─────────────────────────────────────────

Site-Wide Metrics:
├─ Average HTML size: 55 KB
├─ Average .llm.md size: 8 KB
├─ Average reduction: 85%
└─ Total pages: 47

Per-Page Breakdown:
┌──────────────────────┬──────────┬──────────┬───────────┐
│ Page                 │ HTML     │ .llm.md  │ Reduction │
├──────────────────────┼──────────┼──────────┼───────────┤
│ /getting-started     │ 47 KB    │ 7 KB     │ 85%       │
│ /api-reference       │ 120 KB   │ 18 KB    │ 85%       │
│ /blog/post-1         │ 38 KB    │ 6 KB     │ 84%       │
│ Average              │ 55 KB    │ 8 KB     │ 85%       │
└──────────────────────┴──────────┴──────────┴───────────┘

Projected Savings (10,000 agent requests/month):
├─ Bandwidth: 470 MB saved
├─ Tokens: 153 million saved
├─ Cost: $4,590 saved
└─ Response time: 7.6x faster
```

### Discovery Speed Test

**Measure discovery performance:**

```
Discovery Performance Test
─────────────────────────────────────────

Traditional Crawl (baseline):
├─ Method: Recursive HTML crawling
├─ Pages discovered: 47
├─ Total time: 15.2 seconds
├─ Requests: 47
└─ Bandwidth: 2.6 MB

ARW Discovery:
├─ Method: Manifest-based
├─ Pages discovered: 47
├─ Total time: 1.2 seconds
├─ Requests: 1
└─ Bandwidth: 2.3 KB

Improvement:
├─ Speed: 12.6x faster ⚡
├─ Requests: 46 fewer
└─ Bandwidth: 99.9% reduction

[Run Test Again] [Export Results]
```

### Cache Analysis

**Check caching configuration:**

```
Cache Analysis
─────────────────────────────────────────

/.well-known/arw-manifest.json
✅ Cache-Control: public, max-age=3600
✅ ETag: "manifest-v2"
✅ Last-Modified: Tue, 15 Jan 2025 10:00:00 GMT
📊 Efficiency: Optimal

/llms.txt
❌ Cache-Control: no-cache
⚠️  Missing ETag
⚠️  Missing Last-Modified
📊 Efficiency: Poor
💡 Recommendation: Add caching headers

Caching Score: 65/100
[Show Recommendations] [Export Report]
```

---

## Agent Compatibility Testing

### Compatibility Matrix

**Test across AI agents:**

```
Agent Compatibility Test Results
─────────────────────────────────────────

Testing against 4 major AI agents...

┌──────────────────────┬─────────┬─────────┬─────────┐
│ Test                 │ Claude  │ ChatGPT │ Perplex │
├──────────────────────┼─────────┼─────────┼─────────┤
│ Discovery            │ ✅ Pass │ ✅ Pass │ ✅ Pass │
│ Manifest Parsing     │ ✅ Pass │ ✅ Pass │ ✅ Pass │
│ Machine View Fetch   │ ✅ Pass │ ✅ Pass │ ✅ Pass │
│ Chunk Addressing     │ ✅ Pass │ ✅ Pass │ ⚠️  Warn │
│ MIME Types           │ ✅ Pass │ ⚠️  Warn │ ✅ Pass │
│ CORS Compatibility   │ ✅ Pass │ ✅ Pass │ ✅ Pass │
│ Binary Corruption    │ ✅ Pass │ ✅ Pass │ ✅ Pass │
└──────────────────────┴─────────┴─────────┴─────────┘

Overall Score: 95/100 (Excellent)

Warnings:
─────────────────────────────────────────
⚠️  Perplexity: Chunk addressing may fail
    Issue: Aggressive caching strips fragment IDs
    Fix: Use query params (?chunk=id) as fallback

⚠️  ChatGPT: Custom MIME types trigger CORS
    Issue: text/x-llm+markdown not in whitelist
    Fix: Use text/markdown instead

[View Details] [Export Report]
```

### MIME Type Testing

**Verify MIME type compatibility:**

```
MIME Type Compatibility Test
─────────────────────────────────────────

File: /llms.txt
Current: text/plain; charset=utf-8
Status: ✅ Compatible with all agents

Alternatives Tested:
├─ application/yaml → ❌ Claude (binary corruption)
├─ text/yaml → ⚠️  ChatGPT (not whitelisted)
└─ text/plain → ✅ All agents

Recommendation: Keep current (text/plain)

File: /docs/api.llm.md
Current: text/markdown; charset=utf-8
Status: ✅ Compatible with all agents

Alternatives Tested:
├─ text/x-llm+markdown → ⚠️  ChatGPT (CORS issues)
├─ text/plain → ✅ All agents
└─ text/markdown → ✅ All agents (recommended)

[Test Other Files] [Export Report]
```

### Request Simulation

**Simulate agent requests:**

```
Agent Request Simulator
─────────────────────────────────────────

Agent: Claude WebFetch
Request: GET /.well-known/arw-manifest.json

Request Headers:
├─ User-Agent: Claude-Web/1.0
├─ Accept: application/json, text/plain
└─ Accept-Encoding: gzip, deflate

Response:
├─ Status: 200 OK
├─ Content-Type: application/json; charset=utf-8
├─ Content-Length: 2345
└─ Cache-Control: public, max-age=3600

Result: ✅ Success

Parsed Content:
{
  "version": "0.1",
  "profile": "ARW-2",
  ...
}

[Try Different Agent] [Export HAR]
```

---

## Visual Graph Explorer

### Content Graph Visualization

**Interactive content graph:**

```
Content Graph (Interactive)
─────────────────────────────────────────

[Site: My Docs]
    ├─── [Page: Getting Started]
    │       ├─── [Chunk: installation]
    │       ├─── [Chunk: configuration]
    │       └─── [Chunk: first-steps]
    │
    ├─── [Page: API Reference]
    │       ├─── [Chunk: authentication]
    │       │       └─── Related to → [Chunk: oauth-flow]
    │       ├─── [Chunk: endpoints]
    │       └─── [Chunk: rate-limiting]
    │
    └─── [Page: Examples]
            └─── [Chunk: code-samples]
                    └─── Related to → [Chunk: api-reference]

[Zoom In] [Zoom Out] [Export SVG] [3D View]
```

### Relationship Explorer

**Visualize chunk relationships:**

```
Chunk Relationships
─────────────────────────────────────────

Central Node: authentication

Related Content:
├─ oauth-flow (similarity: 0.92)
│  └─ "Implements OAuth 2.0 authentication"
│
├─ api-keys (similarity: 0.85)
│  └─ "Alternative authentication method"
│
└─ rate-limiting (similarity: 0.78)
   └─ "Authentication affects rate limits"

External Links:
├─ https://oauth.net/2/
└─ https://tools.ietf.org/html/rfc6749

[Show More] [Hide External] [Export Graph]
```

---

## Error Debugging

### Error Details Panel

**Comprehensive error information:**

```
Validation Errors (2)
─────────────────────────────────────────

Error 1: Invalid Chunk ID
Location: llms.txt line 34
Severity: Error

Code Context:
32 |   chunks:
33 |     - id: installation
34 |     - id: config setup  ← Error here
35 |     - id: first-steps
36 |

Problem:
  Chunk ID contains space character
  IDs must be URL-safe (a-z, 0-9, hyphens only)

Fix:
  Change "config setup" to "config-setup"

[Auto-Fix] [Ignore] [Learn More]
```

### Common Issues Detector

**Identify common problems:**

```
Common Issues Report
─────────────────────────────────────────

❌ Missing Machine Views (3)
   Pages declared but .llm.md files not found:
   ├─ /docs/advanced.llm.md
   ├─ /blog/post-5.llm.md
   └─ /about.llm.md

   Fix: Create missing files or remove from manifest
   [Generate Files] [Remove from Manifest]

⚠️  Inconsistent Priorities (2)
   Priority values don't match across formats:
   ├─ /docs/api: YAML="high", JSON="medium"
   └─ /blog/post: YAML="low", JSON="medium"

   Fix: Synchronize JSON and YAML
   [Auto-Sync] [View Diff]

⚠️  Large Chunks (1)
   Chunks exceeding recommended 2KB size:
   └─ /docs/api#endpoints (3.8 KB)

   Fix: Split into smaller chunks
   [Suggest Split] [Ignore]
```

### Fix Suggestions

**Actionable recommendations:**

```
Fix Suggestions
─────────────────────────────────────────

Issue: Missing AI-* Headers
Files: 12 machine views

Current:
  HTTP/1.1 200 OK
  Content-Type: text/markdown

Recommended:
  HTTP/1.1 200 OK
  Content-Type: text/markdown
  AI-Attribution: required; format=link
  AI-Training: disallowed
  AI-Inference: allowed
  AI-Rate-Limit: 100;window=60

Implementation (nginx):
  location ~ \.llm\.md$ {
    add_header AI-Attribution "required; format=link";
    add_header AI-Training "disallowed";
    add_header AI-Inference "allowed";
    add_header AI-Rate-Limit "100;window=60";
  }

[Copy Config] [Generate .htaccess] [View Docs]
```

---

## Use Cases

### Use Case 1: Initial Implementation

**Scenario:** You're implementing ARW for the first time

**Workflow:**

1. **Generate initial files**

   ```bash
   arw generate --source ./content
   ```

2. **Open Inspector**

   ```bash
   arw inspect https://localhost:3000
   ```

3. **Review validation results**

   ```
   Initial Scan Results:
   ✅ Basic structure detected
   ⚠️  5 issues found
   ❌ 2 errors (must fix)

   Priority Issues:
   1. Missing AI-Attribution headers
   2. Invalid chunk IDs (2)
   3. Inconsistent priorities (3)
   ```

4. **Fix issues interactively**

   ```
   [Auto-Fix All] ← Click

   ✅ Fixed chunk IDs
   ✅ Synchronized priorities
   ✅ Generated header config

   Remaining: Manual review needed for 1 issue
   ```

5. **Validate again**
   ```
   ✅ All checks passed
   ✅ ARW-2 conformant
   Ready to deploy!
   ```

### Use Case 2: Debugging Production Issues

**Scenario:** Agents can't access your content in production

**Workflow:**

1. **Inspect production site**

   ```bash
   arw inspect https://docs.yoursite.com
   ```

2. **Review agent compatibility**

   ```
   Agent Compatibility Test:
   ✅ Claude: Pass
   ❌ ChatGPT: Fail (CORS error)
   ✅ Perplexity: Pass

   ChatGPT Error:
   CORS policy blocked access to .well-known/arw-manifest.json
   Missing header: Access-Control-Allow-Origin
   ```

3. **Get fix recommendation**

   ```
   Fix: Add CORS headers

   nginx:
   location /.well-known/ {
     add_header Access-Control-Allow-Origin *;
   }

   [Copy Config] [View Guide]
   ```

4. **Test fix**
   ```
   ✅ ChatGPT compatibility restored
   All agents now working
   ```

### Use Case 3: Performance Optimization

**Scenario:** Optimize token usage and response times

**Workflow:**

1. **Run performance profile**

   ```
   Token Efficiency: 85% (good)
   Discovery Speed: 12.6x faster (excellent)
   Cache Hit Rate: 45% (needs improvement)
   ```

2. **Identify opportunities**

   ```
   Opportunities:
   1. Large chunks (3 pages)
      Potential: +10% token savings

   2. Poor caching (12 files)
      Potential: -30% response time

   3. Missing compression (all files)
      Potential: -40% bandwidth
   ```

3. **Apply recommendations**
   ```
   [Apply All Recommendations]

   ✅ Split large chunks
   ✅ Added cache headers
   ✅ Enabled gzip compression

   New Performance:
   Token Efficiency: 92% (+7%)
   Cache Hit Rate: 85% (+40%)
   Bandwidth: -40%
   ```

### Use Case 4: CI/CD Integration

**Scenario:** Validate ARW in your CI pipeline

**Workflow:**

1. **Add to GitHub Actions**

   ```yaml
   - name: Validate ARW
     run: |
       arw inspect https://preview-${{ github.sha }}.vercel.app \
         --output report.json \
         --fail-on-error
   ```

2. **Review in PR**

   ```
   ARW Validation Report:
   ✅ Schema valid
   ✅ All links accessible
   ⚠️  1 warning: Consider adding OAuth (ARW-3)

   Token Efficiency: 87%
   Agent Compatibility: 100%

   [View Full Report]
   ```

3. **Block merge on errors**
   ```
   ❌ Pipeline failed

   ARW validation errors:
   - Invalid chunk ID (config setup)
   - Missing machine view (docs/new-page.llm.md)

   Fix errors before merging
   ```

---

## Integration Options

### Web Interface

**Direct browser access:**

```bash
# Open inspector
open https://inspector.arw.dev

# Enter URL or paste content
https://yoursite.com
```

**Features:**

- No installation required
- Real-time validation
- Visual debugging
- Export reports

### CLI Integration

**Command-line access:**

```bash
# Install ARW CLI
npm install -g arw@alpha

# Inspect site
arw inspect https://yoursite.com

# Inspect local files
arw inspect ./public/llms.txt

# Save report
arw inspect --output report.json
```

### API Access

**Programmatic validation:**

```javascript
// Using ARW Inspector API
import { inspect } from '@arw/inspector';

const result = await inspect('https://yoursite.com');

console.log(result);
// {
//   valid: true,
//   profile: 'ARW-2',
//   errors: [],
//   warnings: [...],
//   stats: { ... }
// }
```

### Browser Extension

**DevTools integration:**

```bash
# Install Chrome extension
chrome://extensions → Load unpacked

# Open site
https://yoursite.com

# Open DevTools → ARW tab
[Inspector UI embedded in DevTools]
```

---

## Advanced Features

### Custom Validation Rules

**Add custom checks:**

```javascript
// arw-inspector.config.js
module.exports = {
  rules: {
    'max-chunk-size': {
      enabled: true,
      maxSize: 2000, // bytes
      level: 'warning'
    },
    'required-chunks': {
      enabled: true,
      chunks: ['installation', 'configuration'],
      level: 'error'
    }
  }
};
```

### Export Options

**Multiple export formats:**

```bash
# JSON report
arw inspect --output report.json

# HTML report
arw inspect --output report.html

# Markdown summary
arw inspect --output summary.md

# CSV for spreadsheets
arw inspect --output data.csv
```

### Comparison Mode

**Compare implementations:**

```
Comparison: Production vs Staging
─────────────────────────────────────────

Production:
├─ Profile: ARW-2
├─ Pages: 47
├─ Token efficiency: 85%
└─ Agent compat: 95%

Staging:
├─ Profile: ARW-3 (+1)
├─ Pages: 52 (+5)
├─ Token efficiency: 89% (+4%)
└─ Agent compat: 98% (+3%)

Changes:
✅ Added OAuth actions
✅ Improved chunk structure
✅ Better caching

[Deploy to Production] [View Diff]
```

### Continuous Monitoring

**Monitor over time:**

```
ARW Health Dashboard
─────────────────────────────────────────

Last 30 Days:
├─ Validation: 100% passing
├─ Avg token efficiency: 86%
├─ Agent compat: 96%
└─ Uptime: 99.9%

Trends:
📈 Token efficiency +2%
📈 Agent requests +45%
📉 Response time -15%

Alerts:
⚠️  Cache hit rate dropped below 80%
    Investigate caching configuration

[View Full Dashboard] [Set Alerts]
```

---

## Conclusion

The ARW Inspector is an essential tool for implementing and maintaining Agent-Ready Web sites:

**Key Benefits:**

- ✅ **Visual debugging** - See errors in context
- ✅ **Real-time validation** - Instant feedback as you edit
- ✅ **Agent testing** - Verify compatibility across AI agents
- ✅ **Performance profiling** - Measure token savings and speed
- ✅ **Actionable fixes** - Auto-fix common issues

**Getting Started:**

```bash
# Try it now
open https://inspector.arw.dev

# Or install CLI
npm install -g arw@alpha
arw inspect https://yoursite.com
```

**The Result:**

Confidence that your ARW implementation works correctly across all major AI agents.

---

**Version:** 0.1-draft
**Date:** January 2025
**License:** Apache 2.0

**Related Documents:**

- [ARW Specification v0.1-draft](../../spec/ARW-0.1-draft.md)
- [ARW CLI Guide](./ARW-CLI-Guide.md)
- [ARW Discovery Architecture](./ARW-Discovery-Architecture.md)
- [ARW Overview and Benefits](./ARW-Overview-and-Benefits.md)

**Inspector:**

- **Web Interface**: https://inspector.arw.dev
- **GitHub**: https://github.com/agent-ready-web/arw-inspector
- **Documentation**: https://docs.arw.dev/inspector

**Contact:** ai@arw.dev
**Community:** github.com/agent-ready-web
