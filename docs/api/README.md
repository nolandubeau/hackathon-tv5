# ARW Crawler API Documentation

Complete documentation for the Agent-Ready Web (ARW) Crawler API.

## 📚 Documentation Structure

### Getting Started
- **[Introduction](./introduction.md)** - API overview, quick start, and key features
- **[Authentication](./authentication.md)** - API key setup, management, and security

### API Endpoints
- **[Scrape](./endpoints/scrape.md)** - Single page scraping with ARW optimization
- **[Crawl](./endpoints/crawl.md)** - Website crawling with intelligent discovery
- **[Map](./endpoints/map.md)** - Site structure mapping and ARW discovery
- **[Batch](./endpoints/batch.md)** - Concurrent processing of multiple URLs

### API Reference
- **[Rate Limits](./rate-limits.md)** - Rate limiting, quotas, and optimization strategies
- **[Error Handling](./errors.md)** - Error codes, responses, and retry strategies
- **[OpenAPI Specification](../openapi.yaml)** - Machine-readable API specification

### SDK Documentation
- **[SDK Getting Started](../sdk/getting-started.md)** - Installation and quick start for all SDKs
- **[Client API Reference](../sdk/client.md)** - Complete client methods and types
- **[ARW Features](../sdk/arw-features.md)** - ARW-specific SDK features
- **[Usage Examples](../sdk/examples.md)** - Real-world integration examples
- **[TypeScript Support](../sdk/typescript.md)** - TypeScript types and definitions

### Integration Guides
- **[ARW Discovery](../guides/arw-discovery.md)** - Understanding and leveraging ARW
- **[Machine Views](../guides/machine-views.md)** - Working with .llm.md files
- **[Best Practices](../guides/best-practices.md)** - Optimization and efficiency tips
- **[Performance](../guides/performance.md)** - Performance tuning and scaling

## 🚀 Quick Links

### 5-Minute Start

```bash
# 1. Get API key from https://api.arw.dev
export ARW_API_KEY="arw_sk_..."

# 2. Scrape a page
curl -X POST https://api.arw.dev/v1/scrape \
  -H "Authorization: Bearer $ARW_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://docs.example.com"}'
```

### Node.js/TypeScript

```bash
npm install @arw/crawler-client
```

```typescript
import { ARWCrawler } from '@arw/crawler-client';

const client = new ARWCrawler({ apiKey: process.env.ARW_API_KEY });

const result = await client.scrape({
  url: 'https://docs.example.com',
  formats: ['markdown', 'arw']
});

console.log(result.markdown);
```

### Python

```bash
pip install arw-crawler
```

```python
from arw_crawler import ARWCrawler

client = ARWCrawler(api_key=os.environ['ARW_API_KEY'])

result = client.scrape(
    url='https://docs.example.com',
    formats=['markdown', 'arw']
)

print(result['markdown'])
```

## 📖 Common Use Cases

### 1. Documentation Indexing

Extract and index documentation with semantic chunks:

```typescript
// Discover ARW implementation
const map = await client.map({
  url: 'https://docs.example.com',
  discoverArw: true
});

// Crawl with ARW optimization
const crawl = await client.crawl({
  url: map.url,
  arw: {
    discoverFromManifest: map.arw.hasImplementation,
    generateChunks: true
  }
});

const result = await client.waitForCrawl(crawl.id);

// Build search index from chunks
const searchIndex = result.pages.flatMap(page =>
  page.arw.chunks.map(chunk => ({
    url: `${page.url}${chunk.urlFragment}`,
    title: page.title,
    heading: chunk.heading,
    content: chunk.content
  }))
);
```

See: [ARW Discovery Guide](../guides/arw-discovery.md)

### 2. Content Extraction for LLMs

Extract clean, semantic content optimized for LLM processing:

```typescript
const result = await client.scrape({
  url: 'https://blog.example.com/post',
  formats: ['arw'],
  onlyMainContent: true,
  arw: {
    generateChunks: true,
    chunkSize: 500
  }
});

// Feed to LLM
const context = result.arw.chunks
  .map(c => c.content)
  .join('\n\n');

const response = await llm.chat({
  messages: [
    { role: 'system', content: 'You are a helpful assistant.' },
    { role: 'user', content: `Using this context:\n\n${context}\n\nAnswer: ...` }
  ]
});
```

See: [Best Practices](../guides/best-practices.md)

### 3. ARW Compliance Monitoring

Monitor websites for ARW implementation:

```typescript
const sites = [
  'https://site1.com',
  'https://site2.com',
  'https://site3.com'
];

const audits = [];

for (const url of sites) {
  const map = await client.map({ url, discoverArw: true });

  audits.push({
    url,
    hasArw: map.arw.hasImplementation,
    level: map.arw.complianceLevel,
    machineViews: map.arw.manifest?.content?.machineViews || 0,
    chunks: map.arw.manifest?.content?.chunks || 0
  });
}

console.table(audits);
```

See: [ARW Discovery Guide](../guides/arw-discovery.md)

## 🎯 Key Features

### ARW-Native
- **85% token reduction** with ARW sites via `.llm.md` machine views
- **10x faster discovery** using ARW manifests
- **Pre-structured chunks** for efficient LLM processing
- **Clear usage policies** (training vs inference permissions)

### Powerful API
- **Multiple formats**: Markdown, HTML, ARW, JSON
- **Batch processing**: Up to 1,000 URLs per request
- **Webhook notifications**: Real-time progress updates
- **Smart rate limiting**: Automatic retry with exponential backoff

### Developer-Friendly SDKs
- **Node.js/TypeScript**: Full type safety and IntelliSense
- **Python**: Pythonic API with type hints
- **Go & Rust**: Coming soon

## 📊 Rate Limits

| Plan | Requests/Hour | Pages/Day | Concurrent Crawls |
|------|---------------|-----------|-------------------|
| **Free** | 100 | 1,000 | 1 |
| **Pro** | 1,000 | 50,000 | 5 |
| **Enterprise** | Custom | Unlimited | Unlimited |

See: [Rate Limits Documentation](./rate-limits.md)

## 🔐 Authentication

All API requests require authentication using an API key:

```bash
Authorization: Bearer arw_sk_your_api_key
```

Get your API key at [https://api.arw.dev/signup](https://api.arw.dev/signup)

See: [Authentication Guide](./authentication.md)

## 📝 API Specification

The complete OpenAPI 3.0 specification is available at:

- **[OpenAPI Spec](../openapi.yaml)** - Machine-readable specification
- **Swagger UI**: [https://api.arw.dev/docs](https://api.arw.dev/docs)
- **ReDoc**: [https://api.arw.dev/redoc](https://api.arw.dev/redoc)

## 🆘 Support

### Documentation
- **API Docs**: [https://docs.arw.dev](https://docs.arw.dev)
- **ARW Spec**: [https://github.com/agent-ready-web/agent-ready-web](https://github.com/agent-ready-web/agent-ready-web)

### Community
- **GitHub Issues**: [Report bugs or request features](https://github.com/agent-ready-web/agent-ready-web/issues)
- **GitHub Discussions**: [Ask questions](https://github.com/agent-ready-web/agent-ready-web/discussions)
- **Discord**: [https://discord.gg/arw](https://discord.gg/arw)

### Contact
- **Email**: support@arw.dev
- **Status**: [https://status.arw.dev](https://status.arw.dev)

## 🔄 API Versions

| Version | Status | Documentation |
|---------|--------|---------------|
| v1 | Current | This documentation |

## 📜 License

The ARW specification and documentation are licensed under MIT License.

---

**Ready to get started?** Check out the [Introduction](./introduction.md) or jump straight to the [Scrape Endpoint](./endpoints/scrape.md)!
