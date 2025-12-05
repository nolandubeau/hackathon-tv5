# ARW Knowledge Graph - Developer Workflow Guide

**Version:** 1.0
**Date:** 2025-11-15
**Audience:** Developers implementing ARW + Knowledge Graph integration

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Installation](#installation)
3. [Initialization](#initialization)
4. [Build Process](#build-process)
5. [Enrichment Pipeline](#enrichment-pipeline)
6. [Integration with ARW](#integration-with-arw)
7. [Deployment](#deployment)
8. [Monitoring & Maintenance](#monitoring--maintenance)
9. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### 1. Existing ARW Implementation

**Minimum Requirement:** ARW-2 (Semantic)

Verify your ARW implementation:

```bash
# Install ARW CLI
npm install -g @arw/cli

# Validate implementation
arw validate --verbose

# Expected output:
# ✅ ARW-2 Semantic Ready
# ✅ llms.txt valid
# ✅ Machine views present
# ✅ Chunks mapped correctly
```

### 2. Content Preparation

Ensure your content is KG-ready:

```bash
# Check content structure
arw validate --check-chunks

# Verify all pages have machine views
arw generate --check-missing

# Expected structure:
# public/
# ├── llms.txt
# ├── index.llm.md
# ├── about.llm.md
# └── .well-known/
#     ├── arw-manifest.json
#     ├── arw-content-index.json
#     └── arw-policies.json
```

### 3. API Keys for Enrichment

Set up LLM API keys for enrichment:

```bash
# Create .env file
cat > .env << EOF
# Embeddings (local, no API key needed)
EMBEDDING_MODEL=sentence-transformers/all-MiniLM-L6-v2

# Topic Extraction (choose one)
ANTHROPIC_API_KEY=sk-ant-xxx  # For Claude 3.5 Sonnet
OPENROUTER_API_KEY=sk-or-xxx  # For multiple models

# Sentiment Analysis
OPENAI_API_KEY=sk-xxx  # For GPT-3.5-turbo
EOF

# Or use environment variables
export ANTHROPIC_API_KEY=sk-ant-xxx
```

---

## Installation

### Option 1: NPM Package (Coming Soon)

```bash
# Install globally
npm install -g @arw/knowledge-graph-builder

# Verify installation
arw-kg --version
# Expected: @arw/knowledge-graph-builder v1.0.0
```

### Option 2: Clone arw-knowledge-graph Repository

```bash
# Clone the KG repository
git clone https://github.com/nolandubeau/arw-knowledge-graph.git
cd arw-knowledge-graph

# Install dependencies
pip install -r requirements.txt

# Verify installation
python -c "import src.graph.mgraph_db as mg; print('MGraph-DB ready')"
```

---

## Initialization

### Step 1: Initialize KG from ARW Content

```bash
# Navigate to your ARW project
cd /path/to/your/arw/project

# Initialize KG
arw-kg init --source=/.well-known/arw-content-index.json

# This creates:
# .arw-kg/
# ├── config.yaml           # KG configuration
# ├── data/                 # Graph data directory
# └── .cache/embeddings/    # Embedding cache
```

### Step 2: Configure KG Settings

Edit `.arw-kg/config.yaml`:

```yaml
# Knowledge Graph Configuration
version: "1.0"

source:
  type: "arw"
  manifest: "/.well-known/arw-content-index.json"
  llms_txt: "/llms.txt"

database:
  engine: "mgraph-db"
  storage: ".arw-kg/data/graph.json"
  cache_dir: ".arw-kg/.cache"

enrichment:
  embeddings:
    enabled: true
    model: "sentence-transformers/all-MiniLM-L6-v2"
    dimensions: 384
    cache: true

  topics:
    enabled: true
    model: "claude-3.5-sonnet"
    provider: "anthropic"
    max_tokens: 1000

  sentiment:
    enabled: true
    model: "gpt-3.5-turbo"
    provider: "openai"

  personas:
    enabled: true
    targets:
      - "prospective_students"
      - "executives"
      - "researchers"
      - "alumni"
      - "faculty"

  similarity:
    enabled: true
    algorithm: "multi-signal"
    weights:
      embedding: 0.6
      topic_overlap: 0.3
      entity_similarity: 0.1
    threshold: 0.7
    top_k: 5

build:
  incremental: true
  parallel: true
  max_workers: 4

output:
  manifest: ".well-known/arw-knowledge-graph.json"
  status: ".well-known/arw-kg-status.json"
  openapi: ".well-known/arw-kg-openapi.json"
```

---

## Build Process

### Step 1: Test Build (Small Sample)

Start with a small sample to verify configuration:

```bash
# Build graph from first 10 pages
arw-kg build --sample=10 --verbose

# Expected output:
# 📊 Extracting content from ARW manifest...
# ✅ Found 10 pages
# 🔨 Creating nodes and edges...
# ✅ Created 150 nodes, 145 edges
# ⏱️  Build completed in 12 seconds
```

### Step 2: Full Build (No Enrichment)

Build the complete graph without enrichment:

```bash
# Full build, structure only
arw-kg build --no-enrich

# Expected output:
# 📊 Extracting content from ARW manifest...
# ✅ Found 50 pages
# 🔨 Creating nodes and edges...
# ✅ Created 3,963 nodes, 3,953 edges
# ⏱️  Build completed in 45 seconds
```

### Step 3: Validate Graph Structure

```bash
# Validate graph integrity
arw-kg validate

# Expected output:
# ✅ Graph structure valid
# ✅ No orphaned nodes
# ✅ All edges have valid source/target
# ✅ Node types conform to schema
# 📊 Statistics:
#    - Nodes: 3,963
#    - Edges: 3,953
#    - Node types: 3 (Page, Section, ContentItem)
#    - Edge types: 4 (CONTAINS, HAS_TOPIC, TARGETS, RELATED_TO)
```

---

## Enrichment Pipeline

### Understanding the 5-Stage Pipeline

The enrichment pipeline adds semantic intelligence to your graph:

```
Stage 1: Embeddings      → Vector representations for semantic search
Stage 2: Topics          → LLM-extracted topic labels
Stage 3: Sentiment       → Content sentiment (positive/neutral/negative)
Stage 4: Personas        → Audience targeting classifications
Stage 5: Similarity      → Multi-signal relationship discovery
```

### Stage 1: Embeddings (Local, Free)

```bash
# Generate embeddings for all nodes
arw-kg enrich --stage=embeddings

# Expected output:
# 🔢 Generating embeddings...
# ✅ Model: sentence-transformers/all-MiniLM-L6-v2
# ✅ Dimensions: 384
# 📦 Processing 3,963 nodes...
# ✅ Embeddings cached (hash-based)
# ⏱️  Completed in 89 seconds
# 💰 Cost: $0.00 (local model)
```

### Stage 2: Topics (LLM, Paid)

```bash
# Extract topics using Claude 3.5 Sonnet
arw-kg enrich --stage=topics

# Expected output:
# 🏷️  Extracting topics...
# ✅ Model: claude-3.5-sonnet
# 📊 Processing 10 pages...
# ✅ Identified 26 unique topics
# ⏱️  Completed in 45 seconds
# 💰 Estimated cost: $0.25
```

**Sample Topic Output:**

```json
{
  "node_id": "page:why-arw",
  "topics": [
    {
      "topic": "publisher-control",
      "confidence": 0.92,
      "relevance": "high"
    },
    {
      "topic": "agent-efficiency",
      "confidence": 0.88,
      "relevance": "high"
    },
    {
      "topic": "web-standards",
      "confidence": 0.85,
      "relevance": "medium"
    }
  ]
}
```

### Stage 3: Sentiment (LLM, Paid)

```bash
# Analyze sentiment
arw-kg enrich --stage=sentiment

# Expected output:
# 😊 Analyzing sentiment...
# ✅ Model: gpt-3.5-turbo
# 📊 Processing 3,743 content items...
# ✅ Sentiment distribution:
#    - Positive: 2,104 (56%)
#    - Neutral: 1,421 (38%)
#    - Negative: 218 (6%)
# ⏱️  Completed in 67 seconds
# 💰 Estimated cost: $0.14
```

### Stage 4: Personas

```bash
# Classify content by persona
arw-kg enrich --stage=personas

# Expected output:
# 👥 Classifying personas...
# 📊 Processing 50 pages...
# ✅ Persona distribution:
#    - Developers: 18 pages
#    - Publishers: 12 pages
#    - AI Platforms: 10 pages
#    - General: 10 pages
# ⏱️  Completed in 34 seconds
```

### Stage 5: Similarity

```bash
# Compute semantic similarity relationships
arw-kg enrich --stage=similarity

# Expected output:
# 🔗 Computing similarity relationships...
# 📊 Algorithm: multi-signal (embedding: 60%, topic: 30%, entity: 10%)
# ✅ Created 48 RELATED_TO edges
# ⏱️  Completed in 23 seconds
```

### Full Enrichment (All Stages)

```bash
# Run all enrichment stages
arw-kg enrich --all

# Or specify stages
arw-kg enrich --stages=embeddings,topics,sentiment

# Expected output:
# 🚀 Running full enrichment pipeline...
# ✅ Stage 1: Embeddings (89s, $0.00)
# ✅ Stage 2: Topics (45s, $0.25)
# ✅ Stage 3: Sentiment (67s, $0.14)
# ✅ Stage 4: Personas (34s, $0.00)
# ✅ Stage 5: Similarity (23s, $0.00)
# ⏱️  Total time: 258 seconds (4m 18s)
# 💰 Total cost: $0.39
```

---

## Integration with ARW

### Step 1: Export Enrichments

Extract KG enrichments for ARW integration:

```bash
# Export enrichments as YAML
arw-kg export --format=arw --output=enrichments.yaml

# enrichments.yaml structure:
# content:
#   - url: /why-arw
#     kg_enriched: true
#     kg_node_id: "page:why-arw"
#     kg_topics: ["publisher-control", "agent-efficiency"]
#     kg_sentiment: "positive"
#     kg_personas: ["publishers", "developers"]
#     kg_related_content:
#       - node_id: "page:quick-start"
#         similarity: 0.85
```

### Step 2: Merge into llms.txt

```bash
# Merge enrichments into llms.txt
arw merge-enrichments enrichments.yaml

# This updates llms.txt with KG metadata while preserving existing structure
```

**Before:**

```yaml
content:
  - url: /why-arw
    machine_view: /why-arw.llm.md
    purpose: education
    priority: high
```

**After:**

```yaml
content:
  - url: /why-arw
    machine_view: /why-arw.llm.md
    purpose: education
    priority: high
    # KG enrichments (enterprise tier)
    kg_enriched: true
    kg_node_id: "page:why-arw"
    kg_topics: ["publisher-control", "agent-efficiency", "web-standards"]
    kg_sentiment: "positive"
    kg_personas: ["publishers", "developers"]
    kg_related_content:
      - node_id: "page:quick-start"
        similarity: 0.85
        reason: "Implementation guidance"
```

### Step 3: Generate KG Manifests

```bash
# Generate .well-known manifests
arw-kg manifest

# This creates:
# .well-known/arw-knowledge-graph.json    # Full KG manifest
# .well-known/arw-kg-status.json          # Build status
# .well-known/arw-kg-openapi.json         # API specification
```

### Step 4: Add Capabilities to llms.txt

```bash
# Automatically add KG capability declaration
arw-kg integrate

# Or manually add to llms.txt:
```

```yaml
# llms.txt
version: "1.0"
profile: "ARW-2"

# Enterprise capabilities
capabilities:
  knowledge_graph:
    enabled: true
    version: "1.0"
    tier: "enterprise"
    discovery: "/.well-known/arw-knowledge-graph.json"
    status: "/.well-known/arw-kg-status.json"
```

### Step 5: Validate Integration

```bash
# Validate ARW + KG integration
arw validate --with-kg

# Expected output:
# ✅ ARW-2 Semantic Ready
# ✅ llms.txt valid
# ✅ KG capability declared
# ✅ KG manifest valid (/.well-known/arw-knowledge-graph.json)
# ✅ KG status endpoint accessible
# ✅ All KG-enriched content has valid node_ids
# ✅ Integration complete
```

---

## Deployment

### Development Server

```bash
# Start local KG API server
arw-kg serve --port=3001

# Expected output:
# 🚀 ARW Knowledge Graph API
# 📍 Listening on http://localhost:3001
# 📊 Graph: 3,963 nodes, 3,953 edges
# ✅ Endpoints:
#    - /api/kg/query
#    - /api/kg/search
#    - /api/kg/nodes
#    - /api/kg/graphql
#    - /api/mcp/knowledge-graph
```

Test endpoints:

```bash
# Query nodes
curl http://localhost:3001/api/kg/nodes/page:why-arw

# Search by topic
curl "http://localhost:3001/api/kg/search?topic=authentication"

# GraphQL
curl -X POST http://localhost:3001/api/kg/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "{ node(id: \"page:why-arw\") { id topics } }"}'
```

### Production Deployment

#### Option 1: Static Files Only

Deploy .well-known manifests as static files:

```bash
# Build manifests
arw-kg manifest --production

# Copy to public directory
cp .well-known/arw-knowledge-graph.json public/.well-known/
cp .well-known/arw-kg-status.json public/.well-known/

# Deploy with your static site
npm run build
npm run deploy
```

#### Option 2: Full API Deployment (Vercel/AWS Lambda)

```bash
# Deploy API to Vercel
arw-kg deploy --platform=vercel

# Or AWS Lambda
arw-kg deploy --platform=aws-lambda

# Or containerized
arw-kg deploy --platform=docker
```

**Docker Example:**

```dockerfile
# Dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY .arw-kg/data ./data
COPY src ./src

EXPOSE 3001

CMD ["python", "-m", "src.api.server"]
```

```bash
# Build and run
docker build -t arw-kg-api .
docker run -p 3001:3001 arw-kg-api
```

---

## Monitoring & Maintenance

### Health Checks

```bash
# Check KG health
arw-kg health

# Expected output:
# ✅ Graph DB: operational
# ✅ Enrichment services: operational
# ✅ Query API: operational
# 📊 Metrics:
#    - Avg query time: 45ms
#    - Cache hit rate: 87%
#    - Uptime: 99.9%
```

### Incremental Rebuilds

When content changes:

```bash
# Detect changed content
arw-kg diff

# Expected output:
# 📊 Content changes detected:
#    - Added: 2 pages
#    - Modified: 5 pages
#    - Deleted: 1 page

# Rebuild only changed content
arw-kg build --incremental

# Expected output:
# 🔨 Incremental build...
# ✅ Processed 8 pages (2 added, 5 updated, 1 removed)
# ⏱️  Completed in 18 seconds
```

### Scheduled Rebuilds

Set up weekly full rebuilds:

```bash
# Using cron
0 2 * * 0 cd /path/to/project && arw-kg build --all && arw-kg manifest

# Or GitHub Actions (see CI/CD example in main integration doc)
```

### Cost Tracking

```bash
# View enrichment costs
arw-kg costs

# Expected output:
# 💰 Enrichment Costs (last 30 days):
#    - Embeddings: $0.00 (local)
#    - Topics: $14.25 (Anthropic)
#    - Sentiment: $3.47 (OpenAI)
#    - Total: $17.72
#
# 📊 Cost per build: $0.39
# 📊 Builds this month: 4
```

---

## Troubleshooting

### Issue: "No ARW manifest found"

**Solution:**

```bash
# Verify ARW implementation first
arw validate

# Ensure .well-known/arw-content-index.json exists
ls -la public/.well-known/

# Re-initialize KG
arw-kg init --source=/.well-known/arw-content-index.json --force
```

### Issue: "Enrichment API key error"

**Solution:**

```bash
# Check environment variables
echo $ANTHROPIC_API_KEY
echo $OPENAI_API_KEY

# Or check .env file
cat .env

# Test API keys
arw-kg test-api-keys

# Expected output:
# ✅ Anthropic API: valid
# ✅ OpenAI API: valid
# ✅ OpenRouter API: not configured (optional)
```

### Issue: "Graph build fails with memory error"

**Solution:**

```bash
# Reduce parallel workers
arw-kg config set build.max_workers 2

# Or build in batches
arw-kg build --batch-size=100

# Or increase system memory
# For Node.js:
NODE_OPTIONS="--max-old-space-size=4096" arw-kg build
```

### Issue: "Enrichment costs too high"

**Solution:**

```bash
# Disable expensive stages
arw-kg config set enrichment.topics.enabled false

# Use cheaper models
arw-kg config set enrichment.topics.model gpt-3.5-turbo

# Or only enrich high-priority content
arw-kg enrich --filter="priority:high"
```

### Issue: "KG manifest not updating"

**Solution:**

```bash
# Clear cache
arw-kg cache clear

# Force rebuild manifests
arw-kg manifest --force

# Verify output
cat .well-known/arw-knowledge-graph.json | jq '.build.last_build'
```

---

## Next Steps

1. **Test with Real Agents**: Use Claude, ChatGPT, or Perplexity to query your KG
2. **Build Visualization**: Create interactive graph explorer
3. **Monitor Usage**: Track which queries agents make
4. **Optimize Costs**: Fine-tune enrichment settings
5. **Scale**: Move to distributed graph database (Neo4j, TigerGraph) for larger sites

---

## Additional Resources

- **Main Integration Architecture**: [ARW-Knowledge-Graph-Integration.md](./ARW-Knowledge-Graph-Integration.md)
- **JSON Schema**: [arw-knowledge-graph.schema.json](./schemas/arw-knowledge-graph.schema.json)
- **API Documentation**: `/.well-known/arw-kg-openapi.json`
- **ARW Specification**: [ARW-v0.1-draft.md](../../spec/ARW-0.1-draft.md)
- **arw-knowledge-graph Repository**: https://github.com/nolandubeau/arw-knowledge-graph

---

**Questions?** Open an issue in the arw-knowledge-graph repository or ARW discussions.
