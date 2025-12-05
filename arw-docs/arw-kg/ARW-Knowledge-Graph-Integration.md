# ARW Knowledge Graph Integration Architecture

**Status:** Design Proposal
**Version:** 1.0
**Date:** 2025-11-15
**Author:** Integration Architecture Team

## Executive Summary

This document outlines the modular integration strategy for adding semantic knowledge graph capabilities to Agent-Ready Web (ARW) as an **enterprise-tier extension**. The integration maintains ARW's core modularity while enabling bidirectional content enrichment through a well-defined extension pattern.

**Key Design Principles:**

1. **Modular & Discoverable** - KG capabilities exposed via `.well-known/arw-knowledge-graph.json`
2. **Progressive Enhancement** - Works alongside ARW-1 through ARW-4, doesn't require them
3. **Decoupled Architecture** - ARW and KG can evolve independently
4. **Enterprise Tier** - Optional premium feature on top of ARW core
5. **Bi-directional Integration** - ARW content feeds KG, KG enriches ARW

---

## 1. Architecture Overview

### 1.1 Extension Model: ARW-KG Profile

We introduce a new **optional capability** called **ARW-KG** (Knowledge Graph) that extends ARW's semantic layer.

```yaml
# llms.txt - Optional KG capability declaration
version: "1.0"
profile: "ARW-2"  # Base ARW level

# New: Capabilities section for extensions
capabilities:
  knowledge_graph:
    enabled: true
    version: "1.0"
    tier: "enterprise"
    discovery: "/.well-known/arw-knowledge-graph.json"
    status: "/.well-known/arw-kg-status.json"
```

**Why this approach:**

- ✅ Doesn't pollute llms.txt with KG-specific details
- ✅ Follows ARW's `.well-known` pattern for modular capabilities
- ✅ Enterprise features clearly separated from core ARW
- ✅ Agents can discover KG capabilities if they support them
- ✅ Graceful degradation for agents without KG support

---

## 2. Discovery Layer: `.well-known/arw-knowledge-graph.json`

### 2.1 Primary Knowledge Graph Manifest

This file serves as the **primary entrypoint** for KG discovery, following ARW's pattern.

**Location:** `/.well-known/arw-knowledge-graph.json`
**Content-Type:** `application/json; charset=utf-8`
**Purpose:** Declare graph capabilities, schema, and query endpoints

#### Example Manifest:

```json
{
  "$schema": "https://arw.dev/schemas/arw-knowledge-graph.schema.json",
  "version": "1.0",
  "
": "enterprise",

  "graph": {
    "name": "ARW Content Knowledge Graph",
    "description": "Semantic graph of ARW documentation, relationships, and concepts",
    "database": "mgraph-db",
    "scale": {
      "nodes": 3963,
      "edges": 3953,
      "last_built": "2025-11-15T10:30:00Z",
      "coverage": "100%"
    }
  },

  "schema": {
    "node_types": [
      {
        "type": "Page",
        "count": 10,
        "description": "Website pages with URLs",
        "properties": ["url", "title", "purpose", "last_modified"]
      },
      {
        "type": "Section",
        "count": 127,
        "description": "Content sections within pages",
        "properties": ["heading", "chunk_id", "parent_page"]
      },
      {
        "type": "ContentItem",
        "count": 3826,
        "description": "Individual content pieces and semantic units",
        "properties": ["text", "embedding", "topics", "sentiment"]
      }
    ],
    "edge_types": [
      {
        "type": "CONTAINS",
        "count": 3837,
        "description": "Hierarchical parent-child relationships"
      },
      {
        "type": "HAS_TOPIC",
        "count": 26,
        "description": "Topic assignments with confidence scores"
      },
      {
        "type": "TARGETS",
        "count": 42,
        "description": "Persona-based content relevance"
      },
      {
        "type": "RELATED_TO",
        "count": 48,
        "description": "Semantic similarity relationships"
      }
    ]
  },

  "enrichments": {
    "enabled": ["embeddings", "topics", "sentiment", "personas", "similarity"],
    "embeddings": {
      "model": "sentence-transformers/all-MiniLM-L6-v2",
      "dimensions": 384,
      "cache": "hash-based"
    },
    "topics": {
      "model": "claude-3.5-sonnet",
      "unique_topics": 26,
      "coverage": "100%"
    },
    "sentiment": {
      "model": "gpt-3.5-turbo",
      "types": ["positive", "neutral", "negative", "mixed"]
    },
    "personas": {
      "targets": ["prospective_students", "executives", "researchers", "alumni", "faculty"]
    },
    "similarity": {
      "algorithm": "multi-signal",
      "weights": {
        "embedding": 0.6,
        "topic_overlap": 0.3,
        "entity_similarity": 0.1
      },
      "threshold": 0.7,
      "top_k": 5
    }
  },

  "endpoints": {
    "query": "/api/kg/query",
    "search": "/api/kg/search",
    "nodes": "/api/kg/nodes",
    "edges": "/api/kg/edges",
    "visualization": "/api/kg/visualize",
    "export": "/api/kg/export"
  },

  "protocols": {
    "graphql": {
      "enabled": true,
      "endpoint": "/api/kg/graphql",
      "schema": "/api/kg/graphql/schema"
    },
    "sparql": {
      "enabled": false,
      "note": "Planned for future release"
    },
    "mcp": {
      "enabled": true,
      "endpoint": "/api/mcp/knowledge-graph",
      "description": "MCP server for graph queries and navigation"
    }
  },

  "policies": {
    "access": "enterprise_tier",
    "rate_limits": {
      "free": "10 queries per minute",
      "enterprise": "1000 queries per minute"
    },
    "data_retention": "Graph rebuilt weekly",
    "privacy": "No PII in graph nodes"
  },

  "build": {
    "source": "arw-content",
    "pipeline": "5-stage-enrichment",
    "trigger": "manual | webhook | schedule",
    "last_build": {
      "timestamp": "2025-11-15T10:30:00Z",
      "duration": "247 seconds",
      "status": "success",
      "nodes_processed": 3963,
      "enrichment_cost": "$0.25"
    },
    "next_build": "2025-11-22T10:00:00Z"
  }
}
```

### 2.2 Build Status Endpoint

**Location:** `/.well-known/arw-kg-status.json`
**Purpose:** Real-time build status and health monitoring

```json
{
  "version": "1.0",
  "status": "ready",
  "health": {
    "graph_db": "operational",
    "enrichment_services": "operational",
    "query_api": "operational"
  },
  "build": {
    "current": {
      "timestamp": "2025-11-15T10:30:00Z",
      "status": "success",
      "nodes": 3963,
      "edges": 3953
    },
    "in_progress": false,
    "next_scheduled": "2025-11-22T10:00:00Z"
  },
  "metrics": {
    "avg_query_time_ms": 45,
    "cache_hit_rate": 0.87,
    "uptime_percent": 99.9
  }
}
```

---

## 3. Integration with ARW Core

### 3.1 Optional Reference in `llms.txt`

The KG capability is **optionally** advertised in the main ARW discovery file:

```yaml
# llms.txt
version: "1.0"
profile: "ARW-2"

site:
  name: "Agent-Ready Web"
  homepage: "https://arw.dev"

# Optional: Declare advanced capabilities
capabilities:
  knowledge_graph:
    enabled: true
    version: "1.0"
    tier: "enterprise"
    discovery: "/.well-known/arw-knowledge-graph.json"

# Standard ARW content continues...
content:
  - url: /
    machine_view: /index.llm.md
    purpose: marketing
    # Optional: KG enrichment metadata
    kg_enriched: true
    kg_node_id: "page:homepage"
    kg_topics: ["ai-agents", "web-standards", "efficiency"]
```

**Benefits of this approach:**

1. **Minimal llms.txt pollution** - Just a pointer to the full manifest
2. **Graceful degradation** - Agents without KG support ignore it
3. **Clear tier separation** - `tier: "enterprise"` signals premium feature
4. **Progressive disclosure** - Details in `.well-known` file, not main manifest

### 3.2 Enhanced Content Metadata

ARW content entries can **optionally** include KG enrichment metadata:

```yaml
content:
  - url: /why-arw
    machine_view: /why-arw.llm.md
    purpose: education
    priority: high

    # Optional KG enrichments (enterprise tier)
    kg_enriched: true
    kg_node_id: "page:why-arw"
    kg_topics: ["publisher-control", "agent-efficiency", "web-standards"]
    kg_sentiment: "positive"
    kg_personas: ["publishers", "developers", "ai-platforms"]
    kg_related_content:
      - node_id: "page:quick-start"
        similarity: 0.85
        reason: "Implementation guidance"
      - node_id: "page:vs-llmstxt"
        similarity: 0.78
        reason: "Standards comparison"
```

**This metadata enables:**

- AI agents can see semantic relationships without querying the graph
- Efficient content discovery through topic/persona filtering
- Related content recommendations directly in llms.txt
- Graceful fallback: agents without KG support still get core content

---

## 4. Bi-Directional Integration Workflow

### 4.1 Content Flow Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      ARW Core Layer                          │
│  ┌───────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │ llms.txt  │  │  .llm.md     │  │  .well-known/        │  │
│  │ (manifest)│  │  (content)   │  │  (capabilities)      │  │
│  └─────┬─────┘  └──────┬───────┘  └──────────┬───────────┘  │
│        │                │                     │              │
│        └────────────────┼─────────────────────┘              │
│                         │                                    │
│                         ▼                                    │
│              ┌──────────────────────┐                        │
│              │  Content Extraction  │                        │
│              │  (ARW → KG Pipeline) │                        │
│              └──────────┬───────────┘                        │
│                         │                                    │
└─────────────────────────┼────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│              Knowledge Graph Layer (Enterprise)              │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │           MGraph-DB (Python)                         │   │
│  │  ┌────────┐  ┌────────┐  ┌────────┐  ┌───────────┐  │   │
│  │  │ Nodes  │  │ Edges  │  │ Cache  │  │ Enrich    │  │   │
│  │  │ 3,963  │  │ 3,953  │  │ (Hash) │  │ Pipeline  │  │   │
│  │  └────────┘  └────────┘  └────────┘  └───────────┘  │   │
│  └──────────────────────────────────────────────────────┘   │
│                         │                                    │
│                         ▼                                    │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  5-Stage Enrichment Pipeline                         │   │
│  │  1. Embeddings (Sentence-Transformers)               │   │
│  │  2. Topics (Claude 3.5)                              │   │
│  │  3. Sentiment (GPT-3.5)                              │   │
│  │  4. Personas (Classification)                        │   │
│  │  5. Similarity (Multi-signal)                        │   │
│  └──────────────────────┬───────────────────────────────┘   │
│                         │                                    │
│                         ▼                                    │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Enrichment Export (KG → ARW)                        │   │
│  │  - Topic tags for llms.txt                           │   │
│  │  - Related content suggestions                       │   │
│  │  - Persona mappings                                  │   │
│  │  - Sentiment scores                                  │   │
│  └──────────────────────┬───────────────────────────────┘   │
│                         │                                    │
└─────────────────────────┼────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│              Enhanced ARW with KG Metadata                   │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  llms.txt (enriched with KG metadata)                 │  │
│  │  - kg_topics: ["topic1", "topic2"]                   │  │
│  │  - kg_related_content: [...]                         │  │
│  │  - kg_personas: ["persona1", "persona2"]             │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### 4.2 Build Workflow

**Phase 1: Initial ARW Setup (Core Tier)**

```bash
# 1. Developer creates ARW content
arw init
arw generate ./pages --recursive

# 2. Validate ARW implementation
arw validate

# Result: Working ARW-1 or ARW-2 implementation
```

**Phase 2: KG Build (Enterprise Tier)**

```bash
# 1. Install KG builder
npm install -g @arw/knowledge-graph-builder

# 2. Initialize KG from ARW content
arw-kg init --source=/.well-known/arw-content-index.json

# 3. Run enrichment pipeline
arw-kg enrich --stages=all --llm=claude-3.5-sonnet

# 4. Build graph database
arw-kg build --output=./data/graph.json

# 5. Generate KG manifests
arw-kg manifest --output=./.well-known/arw-knowledge-graph.json

# Result: Knowledge graph built from ARW content
```

**Phase 3: Bi-directional Sync**

```bash
# 1. Export KG enrichments back to ARW
arw-kg export --format=arw --output=./enrichments.yaml

# 2. Merge enrichments into llms.txt
arw merge-enrichments ./enrichments.yaml

# 3. Validate enhanced ARW
arw validate --with-kg

# Result: ARW content enhanced with KG metadata
```

### 4.3 Automated Workflow with Hooks

Using GitHub Actions or CI/CD:

```yaml
# .github/workflows/kg-sync.yml
name: ARW Knowledge Graph Sync

on:
  push:
    paths:
      - 'public/**/*.llm.md'
      - 'public/llms.txt'
  schedule:
    - cron: '0 10 * * 0'  # Weekly rebuild

jobs:
  rebuild-kg:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Install ARW CLI
        run: npm install -g @arw/cli

      - name: Install KG Builder
        run: npm install -g @arw/knowledge-graph-builder

      - name: Build Knowledge Graph
        run: |
          arw-kg init --source=/.well-known/arw-content-index.json
          arw-kg enrich --stages=all --llm=claude-3.5-sonnet
          arw-kg build --output=./data/graph.json

      - name: Generate KG Manifest
        run: arw-kg manifest --output=./.well-known/arw-knowledge-graph.json

      - name: Export Enrichments to ARW
        run: |
          arw-kg export --format=arw --output=./enrichments.yaml
          arw merge-enrichments ./enrichments.yaml

      - name: Validate Integration
        run: arw validate --with-kg

      - name: Commit Changes
        run: |
          git config user.name "ARW KG Bot"
          git config user.email "kg-bot@arw.dev"
          git add .well-known/arw-knowledge-graph.json
          git add public/llms.txt
          git commit -m "chore: Update KG enrichments"
          git push
```

---

## 5. Enterprise Tier Differentiation

### 5.1 Tier Comparison

| Feature | ARW Core (Free) | ARW + KG (Enterprise) |
|---------|-----------------|------------------------|
| **Discovery** | llms.txt manifest | llms.txt + KG manifest |
| **Content** | .llm.md machine views | .llm.md + semantic enrichments |
| **Metadata** | Basic (title, purpose, priority) | Rich (topics, personas, sentiment, similarity) |
| **Query API** | ❌ | ✅ GraphQL + REST endpoints |
| **Embeddings** | ❌ | ✅ Vector search |
| **Topics** | ❌ | ✅ LLM-extracted topics |
| **Sentiment** | ❌ | ✅ Content sentiment analysis |
| **Personas** | ❌ | ✅ Audience targeting |
| **Relationships** | ❌ | ✅ Semantic similarity graph |
| **Visualization** | ❌ | ✅ Interactive graph explorer |
| **MCP Server** | ❌ | ✅ KG navigation via MCP |
| **Build Automation** | Manual | Automated CI/CD hooks |
| **Cost** | Free | Enterprise licensing |

### 5.2 Value Proposition

**For Publishers:**

- **Enhanced discoverability** - AI agents find related content through semantic relationships
- **Better targeting** - Persona-based content delivery
- **Rich analytics** - Topic coverage, sentiment trends, content gaps
- **Competitive advantage** - Enterprise-grade semantic infrastructure

**For AI Agents:**

- **Faster navigation** - Graph traversal vs. linear content reading
- **Better context** - Understand relationships between concepts
- **Precise retrieval** - Vector search for semantic matching
- **Reduced hallucination** - Explicit relationship modeling

**For Developers:**

- **GraphQL API** - Flexible querying with standard tooling
- **MCP Integration** - Knowledge graph accessible via Model Context Protocol
- **Automated enrichment** - LLM-powered semantic analysis
- **Visualization tools** - Interactive graph exploration

---

## 6. Developer Experience

### 6.1 Quick Start for Enterprise Users

**Step 1: Set up ARW Core** (prerequisite)

```bash
# Initialize ARW
npx arw@alpha init

# Generate machine views
arw generate ./pages --recursive

# Validate
arw validate
```

**Step 2: Add Knowledge Graph**

```bash
# Install KG extension
npm install -g @arw/knowledge-graph-builder

# Initialize KG from ARW content
arw-kg init

# Configure enrichment
arw-kg configure
```

**Step 3: Build and Deploy**

```bash
# Build graph with enrichments
arw-kg build --enrich

# Deploy to production
arw-kg deploy --environment=production

# Verify
curl https://yoursite.com/.well-known/arw-knowledge-graph.json
```

### 6.2 Querying the Knowledge Graph

**REST API:**

```bash
# Search for content by topic
curl https://yoursite.com/api/kg/search?topic=authentication&persona=developers

# Get related content
curl https://yoursite.com/api/kg/nodes/page:quick-start/related

# Find by sentiment
curl https://yoursite.com/api/kg/search?sentiment=positive&min_score=0.8
```

**GraphQL API:**

```graphql
query GetRelatedContent {
  node(id: "page:why-arw") {
    id
    type
    properties {
      title
      url
    }
    topics
    sentiment
    relatedNodes(limit: 5, minSimilarity: 0.7) {
      id
      similarity
      relationship
      properties {
        title
      }
    }
  }
}
```

**MCP Integration:**

```typescript
// Using Model Context Protocol
import { MCPClient } from '@modelcontextprotocol/client';

const client = new MCPClient({
  endpoint: 'https://yoursite.com/api/mcp/knowledge-graph'
});

// Query the graph
const results = await client.query({
  type: 'semantic_search',
  query: 'How do I implement authentication?',
  filters: {
    persona: 'developers',
    topics: ['authentication', 'security']
  }
});
```

---

## 7. Technical Specifications

### 7.1 Data Model

**Node Structure:**

```json
{
  "id": "page:why-arw",
  "type": "Page",
  "properties": {
    "url": "/why-arw",
    "title": "Why ARW?",
    "purpose": "education",
    "last_modified": "2025-11-15T00:00:00Z",
    "machine_view": "/why-arw.llm.md"
  },
  "enrichments": {
    "topics": ["publisher-control", "agent-efficiency", "web-standards"],
    "sentiment": "positive",
    "confidence": 0.94,
    "personas": ["publishers", "developers"],
    "embedding": [0.123, 0.456, ...]  // 384 dimensions
  }
}
```

**Edge Structure:**

```json
{
  "id": "edge:related:page:why-arw:page:quick-start",
  "type": "RELATED_TO",
  "source": "page:why-arw",
  "target": "page:quick-start",
  "properties": {
    "similarity": 0.85,
    "reason": "Implementation guidance",
    "confidence": 0.91,
    "signals": {
      "embedding_similarity": 0.82,
      "topic_overlap": 0.75,
      "entity_similarity": 0.88
    }
  }
}
```

### 7.2 API Specifications

**OpenAPI Schema:** `/.well-known/arw-kg-openapi.json`

```yaml
openapi: 3.1.0
info:
  title: ARW Knowledge Graph API
  version: 1.0.0
  description: Enterprise knowledge graph for ARW content

paths:
  /api/kg/query:
    post:
      summary: Query knowledge graph
      requestBody:
        content:
          application/json:
            schema:
              type: object
              properties:
                query:
                  type: string
                  description: Natural language or structured query
                filters:
                  type: object
                  properties:
                    topics:
                      type: array
                      items:
                        type: string
                    personas:
                      type: array
                      items:
                        type: string
                    sentiment:
                      type: string
                      enum: [positive, neutral, negative, mixed]
      responses:
        '200':
          description: Query results
          content:
            application/json:
              schema:
                type: object
                properties:
                  nodes:
                    type: array
                    items:
                      $ref: '#/components/schemas/Node'
                  edges:
                    type: array
                    items:
                      $ref: '#/components/schemas/Edge'

  /api/kg/nodes/{node_id}:
    get:
      summary: Get node by ID
      parameters:
        - name: node_id
          in: path
          required: true
          schema:
            type: string
      responses:
        '200':
          description: Node details
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Node'

components:
  schemas:
    Node:
      type: object
      properties:
        id:
          type: string
        type:
          type: string
          enum: [Page, Section, ContentItem]
        properties:
          type: object
        enrichments:
          type: object

    Edge:
      type: object
      properties:
        id:
          type: string
        type:
          type: string
          enum: [CONTAINS, HAS_TOPIC, TARGETS, RELATED_TO]
        source:
          type: string
        target:
          type: string
        properties:
          type: object
```

---

## 8. Implementation Roadmap

### Phase 1: Core Integration (Weeks 1-2)

- [ ] Design `.well-known/arw-knowledge-graph.json` schema
- [ ] Implement KG manifest generation
- [ ] Add `capabilities` section to llms.txt spec
- [ ] Create basic ARW → KG extraction pipeline
- [ ] Document integration architecture

### Phase 2: Build Tooling (Weeks 3-4)

- [ ] Develop `arw-kg` CLI tool
- [ ] Implement 5-stage enrichment pipeline
- [ ] Create KG → ARW export functionality
- [ ] Build automated sync workflow
- [ ] Add CI/CD integration examples

### Phase 3: API Layer (Weeks 5-6)

- [ ] Implement REST API endpoints
- [ ] Build GraphQL API
- [ ] Create MCP server for KG navigation
- [ ] Add authentication and rate limiting
- [ ] Document API specifications (OpenAPI)

### Phase 4: Developer Experience (Weeks 7-8)

- [ ] Build interactive graph visualization tool
- [ ] Create SDK for common languages (TS, Python)
- [ ] Write comprehensive developer docs
- [ ] Provide example implementations
- [ ] Create video tutorials

### Phase 5: Enterprise Features (Weeks 9-10)

- [ ] Implement advanced analytics dashboard
- [ ] Add content gap analysis
- [ ] Build persona-based recommendations
- [ ] Create topic trend analysis
- [ ] Develop enterprise licensing model

---

## 9. Migration Guide

### For Existing ARW Implementations

**Step 1: Assess Readiness**

```bash
# Check current ARW level
arw validate --verbose

# Minimum requirement: ARW-2 (Semantic)
```

**Step 2: Prepare Content**

```bash
# Ensure all content has machine views
arw generate --missing-only

# Validate content structure
arw validate --check-chunks
```

**Step 3: Install KG Extension**

```bash
# Install globally
npm install -g @arw/knowledge-graph-builder

# Or add to project
npm install --save-dev @arw/knowledge-graph-builder
```

**Step 4: Initial Build**

```bash
# Initialize with current content
arw-kg init --source=/.well-known/arw-content-index.json

# Run test build (subset)
arw-kg build --sample=10

# Verify results
arw-kg validate
```

**Step 5: Full Build and Deploy**

```bash
# Full enrichment build
arw-kg build --enrich --all

# Export enrichments
arw-kg export --format=arw

# Merge into llms.txt
arw merge-enrichments

# Deploy
arw-kg deploy
```

---

## 10. Best Practices

### 10.1 Content Preparation

**Do:**

- ✅ Ensure all pages have `.llm.md` machine views
- ✅ Use semantic chunk IDs (`<!-- chunk:meaningful-id -->`)
- ✅ Keep content under 10,000 words per page for optimal enrichment
- ✅ Use consistent heading structure
- ✅ Include metadata in frontmatter

**Don't:**

- ❌ Mix multiple topics in single chunks (breaks topic extraction)
- ❌ Use auto-generated or meaningless chunk IDs
- ❌ Include PII or sensitive data (it will be in the graph!)
- ❌ Create circular relationships manually

### 10.2 Enrichment Optimization

**Cost Management:**

- Use local embeddings (Sentence-Transformers) for prototypes
- Batch LLM calls for topic/sentiment extraction
- Cache enrichments aggressively (hash-based)
- Run full enrichment weekly, incremental daily

**Performance:**

- Build graph incrementally when possible
- Use parallel processing for enrichment stages
- Implement smart caching strategies
- Monitor enrichment costs and optimize prompts

### 10.3 Graph Maintenance

**Weekly Tasks:**

- Rebuild graph from updated content
- Validate node/edge counts
- Check enrichment quality scores
- Review new topics and personas

**Monthly Tasks:**

- Analyze content coverage gaps
- Review topic taxonomy
- Optimize similarity thresholds
- Update enrichment models if needed

---

## 11. FAQ

**Q: Do I need ARW to use the knowledge graph?**

A: Yes. The KG is built from ARW content (llms.txt + .llm.md files). ARW-2 (Semantic) is the minimum requirement.

**Q: Can I use the KG without enterprise licensing?**

A: The KG builder tools will be open source, but enterprise features (hosted API, advanced analytics, MCP server) require licensing.

**Q: How often should I rebuild the graph?**

A: Weekly for most sites. Daily for rapidly changing content. The build is incremental, so it's efficient.

**Q: What's the enrichment cost?**

A: For 3,963 nodes: ~$0.25 for topics, ~$0.14 for sentiment, ~$0 for embeddings (local). Total: ~$14 for full enrichment at scale.

**Q: Can agents query the graph directly?**

A: Yes! Via REST API, GraphQL, or MCP protocol. All authenticated with OAuth.

**Q: How does this compare to vector databases?**

A: The KG uses embeddings for similarity, but also includes structured relationships, topics, personas, and sentiment. It's richer than pure vector search.

**Q: Can I customize the enrichment pipeline?**

A: Yes. The pipeline is modular. You can swap LLM providers, add custom enrichment stages, or disable stages you don't need.

**Q: Is the graph schema extensible?**

A: Yes. You can add custom node types, edge types, and properties. The schema is defined in JSON Schema for validation.

**Q: How does this integrate with MCP?**

A: We provide an MCP server at `/api/mcp/knowledge-graph` that exposes graph navigation, search, and querying capabilities to MCP-compatible agents.

**Q: What about privacy and GDPR?**

A: The graph should only contain public content from your ARW implementation. Never include PII. For user-generated content, implement proper access controls.

---

## 12. Conclusion

This modular integration architecture provides:

1. **Clean separation** - KG as optional enterprise extension
2. **Progressive enhancement** - Works alongside ARW-1 through ARW-4
3. **Discoverable** - Via `.well-known/arw-knowledge-graph.json`
4. **Bi-directional** - ARW feeds KG, KG enriches ARW
5. **Enterprise value** - Rich semantic capabilities justify premium tier
6. **Developer-friendly** - Clear APIs, tooling, and workflows
7. **Future-proof** - Extensible schema and enrichment pipeline

The integration respects ARW's core principles while adding significant value for enterprise users who need advanced semantic capabilities.

---

**Next Steps:**

1. Review this architecture with ARW maintainers
2. Create JSON Schema for KG manifest
3. Build prototype KG builder CLI
4. Implement reference integration on arw.dev
5. Document API specifications
6. Create developer tutorials

**Questions or feedback?** Open an issue or discussion in the ARW repository.
