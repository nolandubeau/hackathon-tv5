# Map Endpoint

Generate a structural map of a website without crawling full content.

## Endpoint

```
POST /v1/map
```

## Overview

The Map endpoint provides fast site discovery by analyzing:
- URL structure and hierarchy
- Internal link relationships
- ARW manifest (if available)
- Sitemap files (sitemap.xml, sitemap.llm.json)
- robots.txt rules

Perfect for:
- Quick site analysis
- Planning full crawls
- Discovering ARW implementation
- Understanding site structure

## Request

### Headers

```
Authorization: Bearer arw_sk_your_api_key
Content-Type: application/json
```

### Body Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `url` | string | **Yes** | Website base URL |
| `maxDepth` | number | No | Maximum depth to map (default: `3`, max: `5`) |
| `includeSitemap` | boolean | No | Include sitemap.xml analysis (default: `true`) |
| `includeRobotsTxt` | boolean | No | Include robots.txt analysis (default: `true`) |
| `discoverArw` | boolean | No | Check for ARW implementation (default: `true`) |
| `analyzeStructure` | boolean | No | Analyze URL patterns and sections (default: `true`) |

## Examples

### Basic Site Map

```bash
curl -X POST https://api.arw.dev/v1/map \
  -H "Authorization: Bearer $ARW_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://docs.example.com"
  }'
```

### Comprehensive Analysis

```bash
curl -X POST https://api.arw.dev/v1/map \
  -H "Authorization: Bearer $ARW_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://docs.example.com",
    "maxDepth": 5,
    "includeSitemap": true,
    "includeRobotsTxt": true,
    "discoverArw": true,
    "analyzeStructure": true
  }'
```

## Response

### Success Response (200 OK)

```json
{
  "success": true,
  "data": {
    "url": "https://docs.example.com",
    "discoveredAt": "2025-01-27T10:00:00Z",
    "structure": {
      "totalUrls": 234,
      "maxDepth": 4,
      "sections": [
        {
          "name": "Getting Started",
          "path": "/getting-started",
          "urls": 15,
          "depth": 1
        },
        {
          "name": "API Reference",
          "path": "/api",
          "urls": 89,
          "depth": 2,
          "subsections": [
            {
              "name": "REST API",
              "path": "/api/rest",
              "urls": 45
            },
            {
              "name": "GraphQL",
              "path": "/api/graphql",
              "urls": 44
            }
          ]
        },
        {
          "name": "Guides",
          "path": "/guides",
          "urls": 67,
          "depth": 1
        }
      ],
      "hierarchy": {
        "https://docs.example.com": {
          "children": [
            "https://docs.example.com/getting-started",
            "https://docs.example.com/api",
            "https://docs.example.com/guides"
          ]
        },
        "https://docs.example.com/api": {
          "children": [
            "https://docs.example.com/api/rest",
            "https://docs.example.com/api/graphql"
          ]
        }
      }
    },
    "arw": {
      "hasImplementation": true,
      "complianceLevel": "ARW-2",
      "discovery": {
        "llmsTxt": {
          "found": true,
          "url": "https://docs.example.com/llms.txt",
          "format": "yaml"
        },
        "llmsJson": {
          "found": true,
          "url": "https://docs.example.com/llms.json"
        },
        "wellKnown": {
          "found": true,
          "url": "https://docs.example.com/.well-known/arw-manifest.json"
        }
      },
      "manifest": {
        "version": "0.1",
        "profile": "ARW-2",
        "site": {
          "name": "Example Documentation",
          "description": "Complete documentation for Example API",
          "homepage": "https://docs.example.com",
          "contact": "ai@example.com"
        },
        "content": {
          "totalItems": 156,
          "machineViews": 156,
          "chunks": 687
        },
        "policies": {
          "training": {
            "allowed": false
          },
          "inference": {
            "allowed": true,
            "restrictions": ["attribution_required"]
          }
        },
        "actions": {
          "total": 0
        },
        "protocols": {
          "total": 0
        }
      }
    },
    "sitemap": {
      "found": true,
      "urls": {
        "sitemap.xml": "https://docs.example.com/sitemap.xml",
        "sitemap.llm.json": "https://docs.example.com/sitemap.llm.json"
      },
      "totalUrls": 234,
      "lastModified": "2025-01-25T10:00:00Z",
      "updateFrequency": "weekly"
    },
    "robotsTxt": {
      "found": true,
      "url": "https://docs.example.com/robots.txt",
      "rules": {
        "userAgents": {
          "*": {
            "allow": ["/"],
            "disallow": []
          },
          "GPTBot": {
            "disallow": ["/"]
          },
          "ChatGPT-User": {
            "allow": ["/"],
            "crawlDelay": 3
          }
        },
        "sitemaps": [
          "https://docs.example.com/sitemap.xml"
        ]
      },
      "aiAgentSupport": {
        "trainingBlocked": true,
        "inferenceAllowed": true,
        "supportedAgents": [
          "ChatGPT-User",
          "ClaudeBot",
          "anthropic-ai"
        ]
      }
    },
    "urlPatterns": {
      "/getting-started/**": {
        "count": 15,
        "avgDepth": 2,
        "example": "https://docs.example.com/getting-started/installation"
      },
      "/api/**": {
        "count": 89,
        "avgDepth": 3,
        "example": "https://docs.example.com/api/rest/authentication"
      },
      "/guides/**": {
        "count": 67,
        "avgDepth": 2,
        "example": "https://docs.example.com/guides/best-practices"
      }
    },
    "recommendations": {
      "crawlStrategy": "Use ARW manifest for efficient crawling",
      "estimatedPages": 234,
      "estimatedTime": "3-5 minutes",
      "suggestedDepth": 4,
      "suggestedLimit": 250
    }
  }
}
```

## SDK Examples

### Node.js / TypeScript

```typescript
import { ARWCrawler } from '@arw/crawler-client';

const client = new ARWCrawler({ apiKey: process.env.ARW_API_KEY });

// Generate site map
const map = await client.map({
  url: 'https://docs.example.com',
  maxDepth: 5,
  discoverArw: true
});

console.log(`Site Structure:`);
console.log(`  Total URLs: ${map.structure.totalUrls}`);
console.log(`  Max Depth: ${map.structure.maxDepth}`);
console.log(`  Sections: ${map.structure.sections.length}`);

// ARW analysis
if (map.arw.hasImplementation) {
  console.log(`\n✓ ARW ${map.arw.complianceLevel} Implementation Found`);
  console.log(`  Manifest: ${map.arw.discovery.llmsTxt.url}`);
  console.log(`  Machine Views: ${map.arw.manifest.content.machineViews}`);
  console.log(`  Chunks: ${map.arw.manifest.content.chunks}`);

  // Check policies
  const policies = map.arw.manifest.policies;
  console.log(`\n  Training: ${policies.training.allowed ? 'Allowed' : 'Not allowed'}`);
  console.log(`  Inference: ${policies.inference.allowed ? 'Allowed' : 'Not allowed'}`);
}

// Sitemap analysis
if (map.sitemap.found) {
  console.log(`\n✓ Sitemap Found`);
  console.log(`  URLs: ${map.sitemap.totalUrls}`);
  console.log(`  Last Modified: ${map.sitemap.lastModified}`);
}

// robots.txt analysis
if (map.robotsTxt.found) {
  console.log(`\n✓ robots.txt Found`);
  console.log(`  Training Blocked: ${map.robotsTxt.aiAgentSupport.trainingBlocked}`);
  console.log(`  Inference Allowed: ${map.robotsTxt.aiAgentSupport.inferenceAllowed}`);
}

// Use recommendations for crawl
console.log(`\nRecommended Crawl Settings:`);
console.log(`  Strategy: ${map.recommendations.crawlStrategy}`);
console.log(`  Depth: ${map.recommendations.suggestedDepth}`);
console.log(`  Limit: ${map.recommendations.suggestedLimit}`);
console.log(`  Estimated Time: ${map.recommendations.estimatedTime}`);
```

### Python

```python
from arw_crawler import ARWCrawler

client = ARWCrawler(api_key=os.environ['ARW_API_KEY'])

# Generate site map
map_result = client.map(
    url='https://docs.example.com',
    max_depth=5,
    discover_arw=True
)

print("Site Structure:")
print(f"  Total URLs: {map_result['structure']['totalUrls']}")
print(f"  Max Depth: {map_result['structure']['maxDepth']}")
print(f"  Sections: {len(map_result['structure']['sections'])}")

# ARW analysis
if map_result['arw']['hasImplementation']:
    print(f"\n✓ ARW {map_result['arw']['complianceLevel']} Implementation Found")
    print(f"  Manifest: {map_result['arw']['discovery']['llmsTxt']['url']}")
    print(f"  Machine Views: {map_result['arw']['manifest']['content']['machineViews']}")
    print(f"  Chunks: {map_result['arw']['manifest']['content']['chunks']}")

# Use recommendations
recommendations = map_result['recommendations']
print(f"\nRecommended Crawl Settings:")
print(f"  Strategy: {recommendations['crawlStrategy']}")
print(f"  Depth: {recommendations['suggestedDepth']}")
print(f"  Limit: {recommendations['suggestedLimit']}")
```

## Use Cases

### 1. Pre-Crawl Analysis

```typescript
// Analyze before crawling
const map = await client.map({
  url: 'https://large-site.com',
  discoverArw: true
});

// Use recommendations to optimize crawl
const crawl = await client.crawl({
  url: map.url,
  maxDepth: map.recommendations.suggestedDepth,
  limit: map.recommendations.suggestedLimit,
  arw: {
    discoverFromManifest: map.arw.hasImplementation
  }
});
```

### 2. ARW Compliance Check

```typescript
const sites = [
  'https://site1.com',
  'https://site2.com',
  'https://site3.com'
];

const compliance = [];

for (const url of sites) {
  const map = await client.map({ url, discoverArw: true });

  compliance.push({
    url,
    hasArw: map.arw.hasImplementation,
    level: map.arw.complianceLevel,
    manifest: map.arw.discovery.llmsTxt.found,
    machineViews: map.arw.manifest?.content?.machineViews || 0,
    trainingAllowed: map.arw.manifest?.policies?.training?.allowed
  });
}

console.table(compliance);
```

### 3. Site Structure Documentation

```typescript
const map = await client.map({
  url: 'https://docs.example.com',
  analyzeStructure: true
});

// Generate site structure report
const report = {
  overview: {
    totalPages: map.structure.totalUrls,
    depth: map.structure.maxDepth,
    sections: map.structure.sections.length
  },
  sections: map.structure.sections.map(section => ({
    name: section.name,
    path: section.path,
    pages: section.urls,
    subsections: section.subsections?.length || 0
  })),
  arw: map.arw.hasImplementation ? {
    level: map.arw.complianceLevel,
    features: {
      machineViews: map.arw.manifest.content.machineViews,
      chunks: map.arw.manifest.content.chunks,
      actions: map.arw.manifest.actions.total
    }
  } : null
};

await fs.writeFile(
  'site-structure.json',
  JSON.stringify(report, null, 2)
);
```

## Rate Limits

| Plan | Requests/Hour |
|------|---------------|
| Free | 100 |
| Pro | 1,000 |
| Enterprise | Unlimited |

Map requests are lightweight and don't count against crawl limits.

## Best Practices

1. **Always map before crawling** - Understand site structure first
2. **Check ARW implementation** - Use manifest for efficient crawling
3. **Respect robots.txt** - Review rules before crawling
4. **Use recommendations** - Apply suggested crawl settings
5. **Cache map results** - Reduce redundant requests

## Troubleshooting

### Issue: No ARW Discovery

**Check:**
- `/llms.txt` - YAML format manifest
- `/llms.json` - JSON format manifest
- `/.well-known/arw-manifest.json` - Standard location

### Issue: Incomplete Structure

**Solutions:**
- Increase `maxDepth`
- Check if site uses JavaScript routing
- Verify sitemap.xml is accessible

### Issue: Missing Sections

**Possible causes:**
- Pages behind authentication
- JavaScript-only navigation
- Blocked by robots.txt

## Next Steps

- [Crawl Endpoint](./crawl.md) - Full content crawling
- [ARW Discovery Guide](../../guides/arw-discovery.md)
- [Best Practices](../../guides/best-practices.md)
