# Web Crawler Service - System Architecture

## Executive Summary

This document outlines the system architecture for a production-grade web crawler service optimized for Agent-Ready Web (ARW) discovery and machine-consumable content generation. The system is designed for high scalability, reliability, and efficiency in extracting structured data for AI agents.

## Architecture Overview

### System Context (C4 Level 1)

```
┌─────────────────────────────────────────────────────────────────┐
│                    Web Crawler Service                          │
│                                                                 │
│  Provides web scraping, crawling, and ARW discovery            │
│  capabilities with machine-readable output for AI agents       │
└─────────────────────────────────────────────────────────────────┘
         ▲              ▲              ▲              ▲
         │              │              │              │
    ┌────┴────┐    ┌───┴────┐    ┌───┴────┐    ┌───┴────┐
    │   AI    │    │  Web   │    │  CLI   │    │  SDK   │
    │ Agents  │    │  Apps  │    │ Tools  │    │ Users  │
    └─────────┘    └────────┘    └────────┘    └────────┘
         │              │              │              │
         └──────────────┴──────────────┴──────────────┘
                         │
                    HTTP/WebSocket
                         │
         ┌───────────────┴────────────────┐
         │     Target Websites            │
         │  (llms.txt, robots.txt, etc.)  │
         └────────────────────────────────┘
```

### Container Architecture (C4 Level 2)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         Web Crawler Service                             │
│                                                                         │
│  ┌─────────────────┐        ┌──────────────────┐                      │
│  │   API Gateway   │◄───────│  Load Balancer   │                      │
│  │   (FastAPI)     │        │     (Nginx)      │                      │
│  └────────┬────────┘        └──────────────────┘                      │
│           │                                                             │
│           ├──────────┬─────────────┬──────────────┬───────────────┐   │
│           ▼          ▼             ▼              ▼               ▼   │
│  ┌─────────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐│
│  │   Crawler   │ │   ARW    │ │  Content │ │  Machine │ │   Rate   ││
│  │   Engine    │ │Discovery │ │Extractor │ │   View   │ │ Limiter  ││
│  │             │ │  Module  │ │ Pipeline │ │Generator │ │          ││
│  └──────┬──────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘│
│         │             │            │            │            │       │
│         └─────────────┴────────────┴────────────┴────────────┘       │
│                                    │                                   │
│                                    ▼                                   │
│                        ┌────────────────────────┐                     │
│                        │   Message Queue        │                     │
│                        │   (Redis/RabbitMQ)     │                     │
│                        └────────────────────────┘                     │
│                                    │                                   │
│         ┌──────────────────────────┼──────────────────────┐          │
│         ▼                          ▼                      ▼          │
│  ┌─────────────┐         ┌──────────────┐      ┌──────────────┐    │
│  │   Cache     │         │   Database   │      │   Storage    │    │
│  │   (Redis)   │         │ (PostgreSQL) │      │     (S3)     │    │
│  └─────────────┘         └──────────────┘      └──────────────┘    │
└─────────────────────────────────────────────────────────────────────┘
```

## Core Components

### 1. API Gateway

**Technology**: FastAPI / Express.js
**Responsibility**: Request routing, authentication, rate limiting enforcement

**Key Features**:
- REST API endpoints (/scrape, /crawl, /map, /batch)
- WebSocket server for real-time updates
- API key validation and authentication
- Request validation and sanitization
- Response formatting and compression

**Scaling Strategy**: Horizontal scaling with multiple instances behind load balancer

### 2. Crawler Engine

**Technology**: Scrapy / Playwright / Puppeteer
**Responsibility**: Website navigation, content fetching, queue management

**Architecture**:
```
┌──────────────────────────────────────────────────────────┐
│              Crawler Engine                              │
│                                                          │
│  ┌────────────────┐       ┌──────────────────┐         │
│  │  URL Queue     │◄──────│  Queue Manager   │         │
│  │  (Priority)    │       │  (Distributor)   │         │
│  └───────┬────────┘       └──────────────────┘         │
│          │                                               │
│          ▼                                               │
│  ┌────────────────┐       ┌──────────────────┐         │
│  │  Fetch Worker  │──────►│  Response Parser │         │
│  │  Pool (10-50)  │       │                  │         │
│  └────────────────┘       └──────────────────┘         │
│          │                         │                    │
│          ▼                         ▼                    │
│  ┌────────────────┐       ┌──────────────────┐         │
│  │  Robot Parser  │       │  Link Extractor  │         │
│  │  (Compliance)  │       │  (Follow Rules)  │         │
│  └────────────────┘       └──────────────────┘         │
└──────────────────────────────────────────────────────────┘
```

**Queue Management**:
- Priority queue (FIFO with priority levels)
- Deduplication (URL normalization + bloom filter)
- Distributed queue (Redis/RabbitMQ for multi-worker)
- Retry mechanism (exponential backoff)

**Crawler Features**:
- JavaScript rendering (Playwright/Puppeteer)
- Session management and cookies
- Custom headers and user agents
- Proxy rotation support
- Robots.txt compliance
- Sitemap.xml parsing

### 3. ARW Discovery Module

**Responsibility**: Automatic discovery and parsing of Agent-Ready Web resources

**Discovery Pipeline**:
```
┌────────────────────────────────────────────────────────────┐
│           ARW Discovery Module                             │
│                                                            │
│  Input: Domain/URL                                         │
│     │                                                      │
│     ▼                                                      │
│  ┌──────────────────────────────────────┐                │
│  │  Step 1: llms.txt Discovery          │                │
│  │  - Check /llms.txt                   │                │
│  │  - Check /.well-known/llms.txt       │                │
│  │  - Parse directives and metadata     │                │
│  └──────────────┬───────────────────────┘                │
│                 ▼                                          │
│  ┌──────────────────────────────────────┐                │
│  │  Step 2: robots.txt Analysis         │                │
│  │  - Parse crawl rules                 │                │
│  │  - Extract sitemap URLs              │                │
│  │  - Identify crawl-delay              │                │
│  └──────────────┬───────────────────────┘                │
│                 ▼                                          │
│  ┌──────────────────────────────────────┐                │
│  │  Step 3: Sitemap Discovery           │                │
│  │  - Parse sitemap.xml                 │                │
│  │  - Handle sitemap index              │                │
│  │  - Extract URL priorities            │                │
│  └──────────────┬───────────────────────┘                │
│                 ▼                                          │
│  ┌──────────────────────────────────────┐                │
│  │  Step 4: Metadata Extraction         │                │
│  │  - Schema.org structured data        │                │
│  │  - Open Graph metadata               │                │
│  │  - JSON-LD extraction                │                │
│  └──────────────┬───────────────────────┘                │
│                 ▼                                          │
│  Output: ARW Discovery Report                             │
│  {                                                         │
│    "llms_txt": { discovered, directives, urls },          │
│    "robots_txt": { rules, sitemaps, crawl_delay },        │
│    "sitemaps": [ { url, lastmod, priority } ],            │
│    "structured_data": { schema_org, open_graph }          │
│  }                                                         │
└────────────────────────────────────────────────────────────┘
```

**Discovery Features**:
- Automatic llms.txt detection and parsing
- Robots.txt rule extraction
- Sitemap.xml recursive parsing
- Structured data validation
- ARW compliance scoring

### 4. Content Extraction Pipeline

**Technology**: Readability / Trafilatura / Custom NLP
**Responsibility**: Clean content extraction and transformation

**Pipeline Architecture**:
```
┌──────────────────────────────────────────────────────────┐
│          Content Extraction Pipeline                     │
│                                                          │
│  Raw HTML                                                │
│     │                                                    │
│     ▼                                                    │
│  ┌─────────────────────────────────┐                   │
│  │  1. HTML Cleaning               │                   │
│  │  - Remove scripts, styles       │                   │
│  │  - Strip ads and navigation     │                   │
│  │  - Normalize whitespace         │                   │
│  └────────────┬────────────────────┘                   │
│               ▼                                          │
│  ┌─────────────────────────────────┐                   │
│  │  2. Main Content Detection      │                   │
│  │  - Identify article body        │                   │
│  │  - Extract headings hierarchy   │                   │
│  │  - Preserve semantic structure  │                   │
│  └────────────┬────────────────────┘                   │
│               ▼                                          │
│  ┌─────────────────────────────────┐                   │
│  │  3. Metadata Enrichment         │                   │
│  │  - Title, author, date          │                   │
│  │  - Keywords and tags            │                   │
│  │  - Language detection           │                   │
│  └────────────┬────────────────────┘                   │
│               ▼                                          │
│  ┌─────────────────────────────────┐                   │
│  │  4. Format Conversion           │                   │
│  │  - Markdown generation          │                   │
│  │  - JSON structure               │                   │
│  │  - Plain text extraction        │                   │
│  └────────────┬────────────────────┘                   │
│               ▼                                          │
│  Structured Output                                       │
│  {                                                       │
│    "markdown": "...",                                    │
│    "html": "...",                                        │
│    "text": "...",                                        │
│    "metadata": {...}                                     │
│  }                                                       │
└──────────────────────────────────────────────────────────┘
```

**Extraction Features**:
- Main content detection (Readability algorithm)
- Semantic HTML preservation
- Table and list structure retention
- Image alt text extraction
- Code block identification
- Multi-language support

### 5. Machine View Generator

**Responsibility**: Generate AI-optimized representations of content

**Output Formats**:
```
┌──────────────────────────────────────────────────────────┐
│         Machine View Generator                           │
│                                                          │
│  Structured Content                                      │
│     │                                                    │
│     ├────────────────┬──────────────────┬──────────────┐│
│     ▼                ▼                  ▼              ││
│  ┌──────────┐  ┌──────────┐      ┌──────────┐        ││
│  │  JSON    │  │ Markdown │      │   XML    │        ││
│  │  View    │  │   View   │      │  View    │        ││
│  └──────────┘  └──────────┘      └──────────┘        ││
│                                                          │
│  JSON View (LLM-optimized):                             │
│  {                                                       │
│    "url": "...",                                         │
│    "title": "...",                                       │
│    "content": "...",                                     │
│    "sections": [                                         │
│      { "heading": "...", "content": "..." }             │
│    ],                                                    │
│    "links": [ { "text": "...", "url": "..." } ],       │
│    "metadata": {                                         │
│      "author": "...",                                    │
│      "date": "...",                                      │
│      "keywords": [...]                                   │
│    },                                                    │
│    "structured_data": {...}                             │
│  }                                                       │
│                                                          │
│  Markdown View (Human-readable):                        │
│  # Title                                                 │
│  ## Metadata                                             │
│  - Author: ...                                           │
│  - Date: ...                                             │
│  ## Content                                              │
│  ...                                                     │
└──────────────────────────────────────────────────────────┘
```

**Machine View Features**:
- Hierarchical content structure
- Tokenization-friendly formatting
- Context window optimization
- Semantic section boundaries
- Cross-reference linking
- Entity extraction

### 6. Rate Limiter & Request Scheduler

**Technology**: Redis (Token Bucket / Sliding Window)
**Responsibility**: Manage request rates per domain and API key

**Rate Limiting Strategy**:
```
┌──────────────────────────────────────────────────────────┐
│           Rate Limiter Architecture                      │
│                                                          │
│  ┌─────────────────────────────────────────────┐       │
│  │  API Key Rate Limiter (Per Customer)        │       │
│  │  - Tier-based limits (Free/Pro/Enterprise)  │       │
│  │  - Requests per minute/hour/day             │       │
│  │  - Token bucket algorithm                   │       │
│  └────────────────┬────────────────────────────┘       │
│                   ▼                                      │
│  ┌─────────────────────────────────────────────┐       │
│  │  Domain Rate Limiter (Per Target Site)      │       │
│  │  - Respect robots.txt crawl-delay           │       │
│  │  - Adaptive rate adjustment                 │       │
│  │  - Distributed coordination (Redis)         │       │
│  └────────────────┬────────────────────────────┘       │
│                   ▼                                      │
│  ┌─────────────────────────────────────────────┐       │
│  │  Request Scheduler (Priority Queue)         │       │
│  │  - Priority levels (urgent/normal/low)      │       │
│  │  - Fair scheduling across customers         │       │
│  │  - Batch processing optimization            │       │
│  └─────────────────────────────────────────────┘       │
└──────────────────────────────────────────────────────────┘
```

**Rate Limit Tiers**:
- **Free**: 100 requests/hour
- **Pro**: 1,000 requests/hour
- **Enterprise**: 10,000+ requests/hour (custom)

**Domain Protection**:
- Max 1 request per second per domain (default)
- Exponential backoff on errors
- Circuit breaker pattern (fail-fast)
- Concurrent request limiting

### 7. Caching Layer

**Technology**: Redis + CDN
**Responsibility**: Reduce redundant crawls and improve response times

**Cache Strategy**:
```
┌──────────────────────────────────────────────────────────┐
│              Multi-Level Cache                           │
│                                                          │
│  ┌─────────────────────────────────────────────┐       │
│  │  L1: In-Memory Cache (LRU)                  │       │
│  │  - Hot content (1-5 min TTL)                │       │
│  │  - Per-instance cache                       │       │
│  │  - Max 1GB memory                           │       │
│  └────────────────┬────────────────────────────┘       │
│                   ▼ (miss)                              │
│  ┌─────────────────────────────────────────────┐       │
│  │  L2: Distributed Cache (Redis)              │       │
│  │  - Shared across instances                  │       │
│  │  - Configurable TTL (1-24 hours)            │       │
│  │  - Content-based keys                       │       │
│  └────────────────┬────────────────────────────┘       │
│                   ▼ (miss)                              │
│  ┌─────────────────────────────────────────────┐       │
│  │  L3: Object Storage (S3)                    │       │
│  │  - Long-term cache (7-30 days)              │       │
│  │  - Compressed storage                       │       │
│  │  - CDN integration                          │       │
│  └─────────────────────────────────────────────┘       │
│                   ▼ (miss)                              │
│              Fresh Crawl                                 │
└──────────────────────────────────────────────────────────┘
```

**Cache Keys**:
- URL + Content Hash
- URL + Timestamp (time-based caching)
- Domain + ARW Discovery Results

**Cache Invalidation**:
- TTL-based expiration
- Manual purge via API
- Webhook-triggered invalidation
- LRU eviction policy

## Data Storage

### 1. PostgreSQL Database

**Schema Design**:
```sql
-- Crawl Jobs
CREATE TABLE crawl_jobs (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  status VARCHAR(20) NOT NULL, -- pending, running, completed, failed
  url TEXT NOT NULL,
  options JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  pages_crawled INTEGER DEFAULT 0,
  pages_failed INTEGER DEFAULT 0
);

-- Crawled Pages
CREATE TABLE crawled_pages (
  id UUID PRIMARY KEY,
  job_id UUID REFERENCES crawl_jobs(id),
  url TEXT NOT NULL UNIQUE,
  status_code INTEGER,
  content_type VARCHAR(100),
  content_hash VARCHAR(64),
  raw_html TEXT,
  extracted_content JSONB,
  metadata JSONB,
  crawled_at TIMESTAMP DEFAULT NOW()
);

-- ARW Discovery Results
CREATE TABLE arw_discoveries (
  id UUID PRIMARY KEY,
  domain VARCHAR(255) NOT NULL UNIQUE,
  llms_txt JSONB,
  robots_txt TEXT,
  sitemaps JSONB,
  structured_data JSONB,
  compliance_score FLOAT,
  discovered_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- API Keys & Usage
CREATE TABLE api_keys (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  key_hash VARCHAR(64) NOT NULL UNIQUE,
  tier VARCHAR(20) NOT NULL, -- free, pro, enterprise
  rate_limit INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP
);

CREATE TABLE api_usage (
  id UUID PRIMARY KEY,
  api_key_id UUID REFERENCES api_keys(id),
  endpoint VARCHAR(100) NOT NULL,
  requests_count INTEGER DEFAULT 1,
  timestamp TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_crawl_jobs_user ON crawl_jobs(user_id);
CREATE INDEX idx_crawl_jobs_status ON crawl_jobs(status);
CREATE INDEX idx_crawled_pages_job ON crawled_pages(job_id);
CREATE INDEX idx_crawled_pages_url ON crawled_pages(url);
CREATE INDEX idx_arw_discoveries_domain ON arw_discoveries(domain);
CREATE INDEX idx_api_usage_timestamp ON api_usage(timestamp);
```

### 2. Redis (Cache + Queue)

**Data Structures**:
```
# Rate Limiting (Token Bucket)
rate:api:{key_id}:tokens -> STRING (available tokens)
rate:api:{key_id}:updated -> STRING (last update timestamp)
rate:domain:{domain}:tokens -> STRING

# Cache
cache:page:{url_hash} -> STRING (JSON content)
cache:arw:{domain} -> HASH (ARW discovery results)

# Queue (List)
queue:crawl:pending -> LIST (job IDs)
queue:crawl:processing -> LIST (job IDs)
queue:crawl:failed -> LIST (job IDs)

# WebSocket Subscriptions
ws:job:{job_id}:subscribers -> SET (connection IDs)
```

### 3. S3 Object Storage

**Bucket Structure**:
```
s3://crawler-data/
  ├── raw-html/{job_id}/{url_hash}.html
  ├── extracted-content/{job_id}/{url_hash}.json
  ├── screenshots/{job_id}/{url_hash}.png
  ├── cache/{domain}/{url_hash}.json (long-term cache)
  └── exports/{job_id}/full-export.zip
```

## Non-Functional Requirements

### 1. Performance

**Targets**:
- API response time: < 200ms (P95)
- Crawl speed: 10-50 pages/second (per worker)
- WebSocket latency: < 100ms
- Cache hit rate: > 70%

**Optimization Strategies**:
- Connection pooling (HTTP/2, keep-alive)
- Parallel crawling (worker pool)
- Asynchronous I/O (async/await)
- Database query optimization (indexes, query planning)

### 2. Scalability

**Horizontal Scaling**:
- API Gateway: Auto-scaling based on CPU/memory
- Crawler Workers: Queue-based scaling (0-100 workers)
- Database: Read replicas + connection pooling
- Cache: Redis cluster (sharding)

**Vertical Scaling**:
- Worker memory: 2-8GB per instance
- Database: Up to 32 vCPU, 128GB RAM
- Redis: Up to 16GB memory per node

### 3. Reliability

**High Availability**:
- Multi-AZ deployment (99.9% SLA)
- Database failover (automatic)
- Redis cluster (replication factor 2)
- Load balancer health checks

**Fault Tolerance**:
- Retry logic (exponential backoff)
- Circuit breaker pattern
- Graceful degradation (cache fallback)
- Dead letter queue (failed jobs)

**Monitoring**:
- Prometheus metrics
- Grafana dashboards
- Error tracking (Sentry)
- Log aggregation (ELK stack)

### 4. Security

**Authentication & Authorization**:
- API key authentication (HMAC-SHA256)
- Rate limiting per key
- IP whitelisting (optional)
- OAuth 2.0 support (future)

**Data Protection**:
- HTTPS/TLS 1.3 only
- Encrypted at rest (S3, RDS)
- PII detection and masking
- GDPR compliance

**Network Security**:
- WAF (SQL injection, XSS protection)
- DDoS protection (Cloudflare)
- VPC isolation
- Security groups (least privilege)

## Deployment Architecture

### Production Environment

```
┌───────────────────────────────────────────────────────────────┐
│                        AWS Cloud                              │
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │                  CloudFront CDN                          │ │
│  └───────────────────────┬─────────────────────────────────┘ │
│                          │                                    │
│  ┌───────────────────────▼─────────────────────────────────┐ │
│  │              Application Load Balancer                   │ │
│  └───┬──────────────────────────────────────────────┬──────┘ │
│      │                                               │        │
│  ┌───▼───────────────┐                   ┌──────────▼──────┐ │
│  │  Auto Scaling     │                   │   Auto Scaling   │ │
│  │  Group (API)      │                   │  Group (Workers) │ │
│  │  ┌──────────┐     │                   │  ┌──────────┐   │ │
│  │  │ EC2/ECS  │     │                   │  │ EC2/ECS  │   │ │
│  │  │ Instance │     │                   │  │ Instance │   │ │
│  │  └──────────┘     │                   │  └──────────┘   │ │
│  └───┬───────────────┘                   └──────────┬──────┘ │
│      │                                               │        │
│      └───────────────────┬───────────────────────────┘        │
│                          │                                    │
│  ┌───────────────────────▼─────────────────────────────────┐ │
│  │  ElastiCache (Redis Cluster) - Multi-AZ                 │ │
│  └───────────────────────┬─────────────────────────────────┘ │
│                          │                                    │
│  ┌───────────────────────▼─────────────────────────────────┐ │
│  │  RDS PostgreSQL - Multi-AZ with Read Replicas           │ │
│  └───────────────────────┬─────────────────────────────────┘ │
│                          │                                    │
│  ┌───────────────────────▼─────────────────────────────────┐ │
│  │  S3 Bucket - Versioned, Encrypted, Lifecycle Policies   │ │
│  └─────────────────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────────────────┘
```

### Deployment Strategy

**CI/CD Pipeline**:
1. Code push to GitHub
2. Automated tests (unit, integration)
3. Docker image build
4. Push to ECR (Elastic Container Registry)
5. Blue-green deployment to ECS
6. Health check validation
7. Traffic switch (zero downtime)

**Infrastructure as Code**: Terraform / CloudFormation

## Architecture Decision Records (ADRs)

### ADR-001: Choose FastAPI over Express.js for API Gateway

**Context**: Need high-performance async API framework

**Decision**: Use FastAPI (Python)

**Rationale**:
- Native async/await support
- Automatic OpenAPI documentation
- Built-in data validation (Pydantic)
- Better integration with Python crawler libraries
- Type safety

**Consequences**: Team needs Python expertise

### ADR-002: Use PostgreSQL for Primary Database

**Context**: Need reliable storage for crawl jobs and results

**Decision**: Use PostgreSQL over MongoDB

**Rationale**:
- ACID compliance for job consistency
- Complex queries (JOIN, aggregations)
- JSON support (JSONB) for flexibility
- Proven reliability and tooling
- Strong indexing capabilities

**Consequences**: Schema management required

### ADR-003: Implement Multi-Level Caching

**Context**: Reduce redundant crawls and improve performance

**Decision**: Three-tier cache (Memory, Redis, S3)

**Rationale**:
- Minimize external requests
- Reduce costs (crawling is expensive)
- Improve response times (< 200ms)
- Scalable cache architecture

**Consequences**: Cache invalidation complexity

### ADR-004: Use Redis for Distributed Queue

**Context**: Need reliable queue for multi-worker coordination

**Decision**: Use Redis Lists over RabbitMQ

**Rationale**:
- Simpler operational overhead
- Already using Redis for cache
- Sufficient for our use case
- Better performance for small messages
- Built-in pub/sub for WebSockets

**Consequences**: Limited advanced queue features

## Future Enhancements

### Phase 2 (Q2 2025)
- GraphQL API support
- Webhook notifications
- Custom extraction rules (CSS selectors, XPath)
- Scheduled recurring crawls

### Phase 3 (Q3 2025)
- Machine learning for content classification
- Automatic language translation
- Video/audio content extraction
- Real-time collaboration features

### Phase 4 (Q4 2025)
- Multi-region deployment
- Edge computing (Cloudflare Workers)
- Blockchain-based content verification
- Federated crawler network

## Conclusion

This architecture provides a solid foundation for a production-grade web crawler service optimized for ARW discovery. The design prioritizes scalability, reliability, and performance while maintaining flexibility for future enhancements.

**Key Strengths**:
- Modular, microservices-oriented design
- Horizontal scalability at every layer
- Comprehensive caching strategy
- ARW-first approach
- Production-ready monitoring and security

**Next Steps**:
1. Review and approve architecture
2. Implement prototype (MVP)
3. Load testing and optimization
4. Beta release and user feedback
5. Production deployment

---

**Document Version**: 1.0
**Last Updated**: 2025-11-19
**Author**: System Architecture Designer
**Status**: Draft for Review
