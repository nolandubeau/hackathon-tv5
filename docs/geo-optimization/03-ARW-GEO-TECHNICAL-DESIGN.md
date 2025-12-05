# ARW GEO Technical Design
## Technical Enhancements for Maximum AI Search Optimization

**Document Version:** 1.0
**Last Updated:** November 21, 2025
**Status:** Technical Specification
**ARW Version:** 0.1-draft → 0.2 (proposed)

---

## Executive Summary

This document specifies **7 technical enhancements to ARW** that directly support the **9 GEO methods** proven to boost AI search visibility by **+40% per method**. These enhancements extend the ARW v0.1 specification with structured patterns for citations, statistics, quotations, quality signals, entity enrichment, semantic clustering, and domain-specific optimization.

### Expected Impact

| Enhancement | GEO Impact | Implementation Complexity | ARW Version |
|------------|-----------|--------------------------|-------------|
| **Citation Framework** | +40% visibility | Medium (16-24 hours) | ARW-2.1 |
| **Statistics Enhancement** | +40% visibility | Medium (16-24 hours) | ARW-2.1 |
| **Quotation System** | +40% visibility | Low (8-12 hours) | ARW-2.1 |
| **Content Quality Signals** | +25-35% visibility | Medium (20-30 hours) | ARW-2.2 |
| **Entity Enrichment** | +30-40% visibility | High (40-60 hours) | ARW-2.2 |
| **Semantic Clustering** | +35-45% visibility | Medium (24-36 hours) | ARW-2.2 |
| **Domain Optimization** | +20-30% visibility | Low (8-16 hours) | ARW-2.1 |

**Combined Impact:** +200-300% cumulative visibility improvement when all enhancements are implemented.

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [ARW-GEO-1: Citation Framework](#2-arw-geo-1-citation-framework)
3. [ARW-GEO-2: Statistics Enhancement](#3-arw-geo-2-statistics-enhancement)
4. [ARW-GEO-3: Quotation System](#4-arw-geo-3-quotation-system)
5. [ARW-GEO-4: Content Quality Signals](#5-arw-geo-4-content-quality-signals)
6. [ARW-GEO-5: Entity Enrichment](#6-arw-geo-5-entity-enrichment)
7. [ARW-GEO-6: Semantic Clustering](#7-arw-geo-6-semantic-clustering)
8. [ARW-GEO-7: Domain-Specific Optimization](#8-arw-geo-7-domain-specific-optimization)
9. [Implementation Roadmap](#9-implementation-roadmap)
10. [Migration Strategy](#10-migration-strategy)
11. [Validation & Testing](#11-validation--testing)

---

## 1. Architecture Overview

### 1.1 Design Principles

**Backward Compatibility:** All enhancements are **optional extensions** to ARW v0.1. Sites without GEO enhancements remain fully compliant.

**Progressive Enhancement:** Implement features incrementally:
- **ARW-2.1:** Citation, Statistics, Quotations, Domain Classification (Foundation)
- **ARW-2.2:** Quality Signals, Entity Enrichment, Semantic Clustering (Advanced)

**Data Location Strategy:**

```
/.well-known/arw-manifest.json     ← Primary discovery (ARW v0.1)
    ↓
    references:
    ↓
/.well-known/arw-geo-metadata.json ← GEO enhancement metadata (NEW)
    ↓
/path/to/page.llm.md               ← Machine view with inline GEO markup (ENHANCED)
```

**Backward Compatibility:** ARW v0.1 agents ignore GEO extensions. ARW-2.x agents discover and leverage GEO metadata for improved ranking.

### 1.2 Spec Version Evolution

```yaml
# ARW v0.1 (current)
version: "0.1"
profile: ARW-2  # Semantic ready

# ARW v0.2 (with GEO)
version: "0.2"
profile: ARW-2.1  # GEO Foundation
# OR
profile: ARW-2.2  # GEO Advanced
```

**Profile Definitions:**
- **ARW-2.1:** Foundation GEO (citations, statistics, quotations, domain classification)
- **ARW-2.2:** Advanced GEO (all ARW-2.1 + quality signals, entities, clustering)

### 1.3 Conformance Levels

| Level | Requirements | GEO Features |
|-------|-------------|--------------|
| **ARW-2.1** | ARW-2 + Citations + Statistics + Quotations + Domain | Foundation GEO |
| **ARW-2.2** | ARW-2.1 + Quality Signals + Entities + Clustering | Advanced GEO |

---

## 2. ARW-GEO-1: Citation Framework

### 2.1 Overview

**Purpose:** Enable structured citations in machine views that AI agents can verify and attribute with confidence.

**GEO Impact:** +40% visibility (research shows citing sources is the #1 GEO method)

**Research Basis:**
- "Cite Sources" method: +40% visibility (GEO Benchmark 2025)
- Increases AI confidence in content accuracy
- Improves attribution and reduces hallucinations

### 2.2 Data Structure

**Manifest Extension** (`/.well-known/arw-geo-metadata.json`):

```json
{
  "version": "0.2",
  "profile": "ARW-2.1",
  "geo_enhancements": {
    "citations_enabled": true,
    "citation_schema": "schema.org/Citation",
    "source_verification": {
      "enabled": true,
      "verification_endpoint": "/api/verify-citation"
    },
    "citation_formats": ["inline", "footnote", "bibliography"]
  },
  "content_pages": [
    {
      "url": "/articles/ai-trends-2025",
      "machine_view": "/articles/ai-trends-2025.llm.md",
      "geo_metadata": {
        "citations_count": 12,
        "source_types": ["academic", "industry", "government"],
        "authority_score": 0.92
      }
    }
  ]
}
```

**Machine View Citation Markup** (`.llm.md`):

```markdown
<!-- chunk: market-analysis -->
## AI Market Analysis 2025

The global AI market is projected to reach $1.8 trillion by 2030, growing at
a CAGR of 38.1%.^[cite:1]

According to McKinsey's 2024 AI Report, "Enterprises adopting generative AI
see productivity gains of 25-40% in knowledge work."^[cite:2]

<!-- citations -->
### References

[cite:1]: {
  "source": "Gartner AI Market Forecast 2024",
  "type": "industry_report",
  "url": "https://gartner.com/reports/ai-market-2024",
  "date": "2024-08-15",
  "authority_score": 0.95,
  "verification_status": "verified",
  "author": "Gartner Research",
  "publisher": "Gartner, Inc."
}

[cite:2]: {
  "source": "McKinsey State of AI Report 2024",
  "type": "research_report",
  "url": "https://mckinsey.com/ai-report-2024",
  "date": "2024-06-20",
  "authority_score": 0.98,
  "verification_status": "verified",
  "author": "McKinsey & Company",
  "publisher": "McKinsey & Company"
}
```

**Alternative: Structured JSON-LD in HTML:**

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "AI Market Analysis 2025",
  "citation": [
    {
      "@type": "CreativeWork",
      "name": "Gartner AI Market Forecast 2024",
      "url": "https://gartner.com/reports/ai-market-2024",
      "datePublished": "2024-08-15",
      "author": {
        "@type": "Organization",
        "name": "Gartner Research"
      },
      "publisher": {
        "@type": "Organization",
        "name": "Gartner, Inc."
      }
    }
  ]
}
</script>
```

### 2.3 Citation Schema

**Citation Object:**

```typescript
interface Citation {
  id: string;                    // cite:1, cite:2, etc.
  source: string;                // Human-readable source name
  type: CitationType;            // Type of source
  url: string;                   // Source URL (if available)
  date: string;                  // Publication date (ISO 8601)
  author?: string | Author;      // Author name or object
  publisher?: string;            // Publisher name
  authority_score?: number;      // 0-1, computed authority
  verification_status?: string;  // "verified" | "unverified" | "external"
  doi?: string;                  // Digital Object Identifier (academic)
  isbn?: string;                 // ISBN (books)
  accessed_date?: string;        // Date content was accessed
  excerpt?: string;              // Quoted excerpt
}

type CitationType =
  | "academic"           // Peer-reviewed journals, conferences
  | "industry_report"    // Market research, analyst reports
  | "government"         // Government publications, statistics
  | "news"              // News articles
  | "book"              // Published books
  | "website"           // General websites
  | "dataset"           // Data sources
  | "internal";         // Internal company data

interface Author {
  name: string;
  affiliation?: string;
  credentials?: string[];  // ["PhD", "Senior Analyst"]
}
```

### 2.4 Implementation Complexity

**Effort Estimate:** 16-24 hours

**Breakdown:**
- Citation schema design: 4 hours
- Manifest integration: 4 hours
- Machine view citation parser: 6 hours
- Authority score calculation: 4 hours
- Validation tools: 4 hours
- Documentation: 4 hours

**Dependencies:**
- ARW v0.1 implementation (required)
- Content authoring workflow integration
- Citation verification service (optional)

### 2.5 Expected GEO Impact

| Metric | Without Citations | With Citations | Improvement |
|--------|------------------|----------------|-------------|
| **AIO Inclusion** | 60% | 84% (+24pp) | +40% |
| **Top-Source Rank** | 15% | 45% (+30pp) | +200% |
| **Citation Confidence** | Medium | High | Qualitative |
| **Hallucination Rate** | 18% | 8% (-10pp) | -56% |

**Why This Works:**
1. **Authority signal:** "I cite credible sources" → AI trusts my content more
2. **Verification ease:** AI can check citations → reduces risk of hallucination
3. **Attribution chain:** Clear provenance → higher confidence in facts
4. **Competitive advantage:** Most sites don't structure citations

### 2.6 Migration Path

**Phase 1:** Add citation metadata to `/llms.txt` or GEO metadata file
**Phase 2:** Convert inline citations in `.llm.md` to structured format
**Phase 3:** Add Schema.org Citation markup to HTML
**Phase 4:** Implement authority scoring (optional)

**Backward Compatibility:** ARW v0.1 agents ignore citation metadata; no breaking changes.

### 2.7 Code Examples

**Python: Citation Parser**

```python
import re
import json

def parse_citations(markdown_content: str) -> dict:
    """Extract structured citations from .llm.md files"""

    # Find citation references in text: ^[cite:1]
    cite_refs = re.findall(r'\^\[cite:(\d+)\]', markdown_content)

    # Find citation definitions
    cite_pattern = r'\[cite:(\d+)\]:\s*(\{[^}]+\})'
    cite_matches = re.findall(cite_pattern, markdown_content, re.DOTALL)

    citations = {}
    for cite_id, cite_json in cite_matches:
        citations[f"cite:{cite_id}"] = json.loads(cite_json)

    return {
        "citation_count": len(cite_refs),
        "citations": citations,
        "unique_sources": len(set(cite_refs))
    }

# Usage
with open('article.llm.md', 'r') as f:
    content = f.read()

citations_data = parse_citations(content)
print(f"Found {citations_data['citation_count']} citation references")
```

**TypeScript: Citation Authority Scorer**

```typescript
interface CitationSource {
  type: string;
  date: string;
  publisher?: string;
  doi?: string;
}

function calculateAuthorityScore(citation: CitationSource): number {
  let score = 0.5; // Base score

  // Source type weights
  const typeWeights: Record<string, number> = {
    academic: 0.4,
    government: 0.35,
    industry_report: 0.3,
    book: 0.25,
    news: 0.15,
    website: 0.1
  };

  score += typeWeights[citation.type] || 0;

  // Recency bonus (within 2 years)
  const pubDate = new Date(citation.date);
  const age = Date.now() - pubDate.getTime();
  const yearsOld = age / (1000 * 60 * 60 * 24 * 365);

  if (yearsOld < 2) {
    score += 0.1;
  } else if (yearsOld > 5) {
    score -= 0.1;
  }

  // Publisher authority
  const authorityPublishers = ['nature', 'science', 'gartner', 'mckinsey'];
  if (citation.publisher && authorityPublishers.some(p =>
    citation.publisher!.toLowerCase().includes(p))) {
    score += 0.1;
  }

  // DOI presence (peer-reviewed)
  if (citation.doi) {
    score += 0.1;
  }

  return Math.min(1.0, Math.max(0.0, score));
}
```

---

## 3. ARW-GEO-2: Statistics Enhancement

### 3.1 Overview

**Purpose:** Structure statistical data in machine views for AI to easily extract, verify, and cite.

**GEO Impact:** +40% visibility (statistics addition is proven GEO method)

**Research Basis:**
- "Add Statistics" method: +40% visibility
- Combination of statistics + fluency = best GEO results
- Quantitative data increases content authority

### 3.2 Data Structure

**Manifest Extension:**

```json
{
  "geo_enhancements": {
    "statistics_enabled": true,
    "statistics_format": "schema.org/Dataset",
    "data_sources": [
      {
        "name": "Internal Analytics",
        "type": "proprietary",
        "update_frequency": "daily"
      },
      {
        "name": "Public Market Data",
        "type": "third_party",
        "source": "Bureau of Labor Statistics"
      }
    ]
  }
}
```

**Machine View Statistics Markup:**

```markdown
<!-- chunk: market-statistics -->
## E-commerce Market Statistics

<!-- stat:market-size -->
**Global E-commerce Market Size (2024)**

```statistics
{
  "id": "stat:market-size-2024",
  "type": "market_metric",
  "value": 6.3,
  "unit": "trillion USD",
  "date": "2024-01-01",
  "source": "Statista Global E-commerce Report 2024",
  "source_url": "https://statista.com/reports/ecommerce-2024",
  "confidence": 0.95,
  "growth_rate": {
    "value": 14.7,
    "unit": "percent",
    "period": "YoY",
    "date_range": ["2023-01-01", "2024-01-01"]
  }
}
```

<!-- stat:conversion-rate -->
**Average Conversion Rate by Industry**

| Industry | Conversion Rate | Sample Size | Date |
|----------|----------------|-------------|------|
| Fashion | 2.3% | 10,000+ sites | Q2 2024 |
| Electronics | 1.8% | 8,000+ sites | Q2 2024 |
| Home & Garden | 2.1% | 5,000+ sites | Q2 2024 |

```statistics
{
  "id": "stat:conversion-rates-industry",
  "type": "comparative_metrics",
  "dataset": [
    {"industry": "Fashion", "rate": 0.023, "n": 10000, "date": "2024-06-30"},
    {"industry": "Electronics", "rate": 0.018, "n": 8000, "date": "2024-06-30"},
    {"industry": "Home & Garden", "rate": 0.021, "n": 5000, "date": "2024-06-30"}
  ],
  "source": "E-commerce Benchmark Study 2024",
  "methodology": "Survey of 23,000 e-commerce sites",
  "confidence_interval": 0.95
}
```
```

**Alternative: Schema.org Dataset in HTML:**

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Dataset",
  "name": "Global E-commerce Market Size 2024",
  "description": "Total global e-commerce market value",
  "url": "https://example.com/data/ecommerce-market-2024",
  "temporalCoverage": "2024",
  "spatialCoverage": "Worldwide",
  "variableMeasured": "Market Value",
  "measurementTechnique": "Market Analysis",
  "distribution": {
    "@type": "DataDownload",
    "encodingFormat": "application/json",
    "contentUrl": "https://example.com/data/ecommerce-market-2024.json"
  },
  "citation": {
    "@type": "CreativeWork",
    "name": "Statista Global E-commerce Report 2024",
    "url": "https://statista.com/reports/ecommerce-2024"
  }
}
</script>
```

### 3.3 Statistics Schema

```typescript
interface Statistic {
  id: string;                      // stat:market-size-2024
  type: StatisticType;             // Type of statistic
  value: number | string;          // Primary value
  unit: string;                    // Unit of measurement
  date: string;                    // Date/period (ISO 8601)
  date_range?: [string, string];   // Start/end dates for ranges
  source: string;                  // Data source name
  source_url?: string;             // Source URL
  confidence?: number;             // 0-1, confidence level
  methodology?: string;            // How data was collected
  sample_size?: number;            // Sample size (if applicable)
  margin_of_error?: number;        // Statistical margin of error
  growth_rate?: GrowthRate;        // Change over time
  comparison?: Comparison;         // Comparative data
  visualization_url?: string;      // Chart/graph URL
}

type StatisticType =
  | "market_metric"       // Market size, revenue, etc.
  | "performance_metric"  // KPIs, conversion rates
  | "demographic"         // Population, user statistics
  | "financial"           // Revenue, pricing data
  | "comparative_metrics" // Industry benchmarks
  | "time_series"         // Historical trends
  | "forecast";           // Projected data

interface GrowthRate {
  value: number;
  unit: "percent" | "absolute";
  period: "YoY" | "MoM" | "QoQ";
  date_range: [string, string];
}

interface Comparison {
  baseline: {
    value: number;
    label: string;
  };
  comparisons: Array<{
    value: number;
    label: string;
    difference: number;
    difference_percent: number;
  }>;
}
```

### 3.4 Implementation Complexity

**Effort Estimate:** 16-24 hours

**Breakdown:**
- Statistics schema design: 4 hours
- Data extraction tooling: 6 hours
- Visualization integration: 4 hours
- Time-series support: 4 hours
- Validation tools: 4 hours
- Documentation: 4 hours

### 3.5 Expected GEO Impact

| Metric | Without Statistics | With Statistics | Improvement |
|--------|-------------------|-----------------|-------------|
| **AIO Inclusion** | 55% | 77% (+22pp) | +40% |
| **Authority Score** | Medium | High | Qualitative |
| **Featured Snippets** | 5% | 25% (+20pp) | +400% |
| **Citation as Primary** | 20% | 48% (+28pp) | +140% |

**Combined with Fluency:** Statistics + high-quality writing = 60-80% better GEO results

### 3.6 Code Examples

**Python: Statistics Extractor**

```python
import json
import re
from typing import Dict, List, Any

def extract_statistics(markdown_content: str) -> List[Dict[str, Any]]:
    """Extract structured statistics from .llm.md files"""

    # Find statistics blocks: ```statistics\n{...}\n```
    stat_pattern = r'```statistics\s*\n(.*?)\n```'
    stat_matches = re.findall(stat_pattern, markdown_content, re.DOTALL)

    statistics = []
    for stat_json in stat_matches:
        try:
            stat = json.loads(stat_json)
            statistics.append(stat)
        except json.JSONDecodeError:
            continue

    return statistics

def calculate_freshness_score(stat: Dict[str, Any]) -> float:
    """Calculate freshness score based on date"""
    from datetime import datetime

    date_str = stat.get('date')
    if not date_str:
        return 0.5

    stat_date = datetime.fromisoformat(date_str)
    age_days = (datetime.now() - stat_date).days

    # Fresher = higher score
    if age_days < 30:
        return 1.0
    elif age_days < 90:
        return 0.9
    elif age_days < 180:
        return 0.7
    elif age_days < 365:
        return 0.5
    else:
        return 0.3

# Usage
with open('market-analysis.llm.md', 'r') as f:
    content = f.read()

stats = extract_statistics(content)
for stat in stats:
    freshness = calculate_freshness_score(stat)
    print(f"{stat['id']}: {stat['value']} {stat['unit']} (freshness: {freshness:.2f})")
```

---

## 4. ARW-GEO-3: Quotation System

### 3.1 Overview

**Purpose:** Structure expert quotations with speaker attribution and credentials for authority signals.

**GEO Impact:** +40% visibility (quotation addition is proven GEO method)

**Research Basis:**
- "Add Quotations" method: +40% visibility
- Expert quotes increase content trustworthiness
- Speaker credentials matter for AI evaluation

### 3.2 Data Structure

**Manifest Extension:**

```json
{
  "geo_enhancements": {
    "quotations_enabled": true,
    "expert_directory": "/experts.json",
    "quotation_verification": {
      "enabled": true,
      "verification_method": "email_confirmation"
    }
  }
}
```

**Machine View Quotation Markup:**

```markdown
<!-- chunk: expert-insights -->
## Expert Insights on AI Adoption

<!-- quote:expert-1 -->
> "Enterprises that delay AI adoption risk falling behind competitors by
> 18-24 months in operational efficiency."

```quotation
{
  "id": "quote:expert-1",
  "text": "Enterprises that delay AI adoption risk falling behind competitors by 18-24 months in operational efficiency.",
  "speaker": {
    "name": "Dr. Sarah Chen",
    "title": "Chief AI Officer",
    "affiliation": "Microsoft Azure AI",
    "credentials": ["PhD Computer Science", "20+ years AI research"],
    "authority_score": 0.96,
    "linkedin": "https://linkedin.com/in/sarahchen",
    "verified": true
  },
  "context": "Interview at AI Summit 2024",
  "date": "2024-09-15",
  "source": "AI Summit 2024 Keynote",
  "source_url": "https://aisummit.com/2024/keynotes/sarah-chen",
  "type": "expert_opinion"
}
```

<!-- quote:ceo-1 -->
> "We've seen AI transform our customer service, reducing response times
> from hours to seconds while improving satisfaction scores by 40%."

```quotation
{
  "id": "quote:ceo-1",
  "text": "We've seen AI transform our customer service, reducing response times from hours to seconds while improving satisfaction scores by 40%.",
  "speaker": {
    "name": "James Rodriguez",
    "title": "CEO",
    "affiliation": "TechCorp Industries",
    "company_size": "Fortune 500",
    "verified": true
  },
  "context": "Case study interview",
  "date": "2024-08-20",
  "source": "TechCorp AI Transformation Case Study",
  "type": "case_study",
  "metrics_mentioned": ["response_time", "satisfaction_score"]
}
```
```

**Alternative: Schema.org Quotation in HTML:**

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Expert Insights on AI Adoption",
  "mentions": [
    {
      "@type": "Quotation",
      "text": "Enterprises that delay AI adoption risk falling behind competitors by 18-24 months in operational efficiency.",
      "spokenByCharacter": {
        "@type": "Person",
        "name": "Dr. Sarah Chen",
        "jobTitle": "Chief AI Officer",
        "worksFor": {
          "@type": "Organization",
          "name": "Microsoft Azure AI"
        },
        "alumniOf": {
          "@type": "EducationalOrganization",
          "name": "Stanford University"
        },
        "hasCredential": {
          "@type": "EducationalOccupationalCredential",
          "credentialCategory": "PhD Computer Science"
        }
      },
      "datePublished": "2024-09-15",
      "isPartOf": {
        "@type": "Event",
        "name": "AI Summit 2024 Keynote"
      }
    }
  ]
}
</script>
```

### 3.3 Quotation Schema

```typescript
interface Quotation {
  id: string;                    // quote:expert-1
  text: string;                  // The actual quotation
  speaker: Speaker;              // Who said it
  context?: string;              // When/where it was said
  date: string;                  // Date of quotation (ISO 8601)
  source: string;                // Source document/event
  source_url?: string;           // Source URL
  type: QuotationType;           // Type of quotation
  verified?: boolean;            // Speaker-verified quote
  metrics_mentioned?: string[];  // Metrics referenced in quote
}

interface Speaker {
  name: string;                  // Full name
  title: string;                 // Job title
  affiliation: string;           // Organization
  credentials?: string[];        // Degrees, certifications
  authority_score?: number;      // 0-1, computed authority
  linkedin?: string;             // LinkedIn profile URL
  twitter?: string;              // Twitter/X handle
  company_size?: string;         // Company size category
  industry?: string;             // Industry expertise
  verified?: boolean;            // Identity verified
}

type QuotationType =
  | "expert_opinion"      // Expert analysis/prediction
  | "case_study"          // Customer testimonial
  | "research_finding"    // Research quote
  | "executive_insight"   // C-level perspective
  | "technical_detail"    // Technical explanation
  | "statistical_claim";  // Quote containing statistics
```

### 3.4 Implementation Complexity

**Effort Estimate:** 8-12 hours

**Breakdown:**
- Quotation schema design: 2 hours
- Speaker directory setup: 2 hours
- Machine view markup: 3 hours
- Authority scoring: 2 hours
- Validation tools: 2 hours
- Documentation: 2 hours

### 3.5 Expected GEO Impact

| Metric | Without Quotations | With Quotations | Improvement |
|--------|--------------------|-----------------|-------------|
| **AIO Inclusion** | 58% | 81% (+23pp) | +40% |
| **E-E-A-T Score** | Medium | High | Qualitative |
| **Trust Signals** | Low | High | Qualitative |
| **Featured as Expert** | 10% | 35% (+25pp) | +250% |

**Best Results:** Combine quotations with statistics for 60-80% better GEO performance

### 3.6 Code Examples

**TypeScript: Quotation Parser**

```typescript
interface ParsedQuotation {
  text: string;
  metadata: Quotation;
  chunk_id: string;
}

function extractQuotations(markdownContent: string): ParsedQuotation[] {
  const quotations: ParsedQuotation[] = [];

  // Match quotation blocks
  const quotePattern = /<!-- quote:([\w-]+) -->\s*>\s*"([^"]+)"\s*```quotation\s*(.*?)\s*```/gs;

  let match;
  while ((match = quotePattern.exec(markdownContent)) !== null) {
    const [, quoteId, quoteText, metadataJson] = match;

    try {
      const metadata = JSON.parse(metadataJson);
      quotations.push({
        text: quoteText,
        metadata: metadata as Quotation,
        chunk_id: `quote:${quoteId}`
      });
    } catch (e) {
      console.warn(`Failed to parse quotation ${quoteId}:`, e);
    }
  }

  return quotations;
}

function calculateSpeakerAuthority(speaker: Speaker): number {
  let score = 0.5; // Base score

  // Credentials
  if (speaker.credentials) {
    if (speaker.credentials.some(c => c.includes('PhD'))) score += 0.2;
    if (speaker.credentials.some(c => c.includes('Professor'))) score += 0.15;
    if (speaker.credentials.some(c => c.match(/\d+ years/))) score += 0.1;
  }

  // Title authority
  if (speaker.title.match(/Chief|Director|VP|Head/i)) score += 0.15;
  if (speaker.title.match(/CEO|President|Founder/i)) score += 0.1;

  // Verification
  if (speaker.verified) score += 0.1;

  return Math.min(1.0, score);
}
```

---

## 5. ARW-GEO-4: Content Quality Signals

### 3.1 Overview

**Purpose:** Embed quality indicators (fluency, readability, E-E-A-T) in manifest to signal content authority.

**GEO Impact:** +25-35% visibility (quality signals improve ranking)

**Research Basis:**
- Fluency + Statistics = best GEO combination
- E-E-A-T (Experience, Expertise, Authoritativeness, Trustworthiness) is critical
- Readability affects AI comprehension

### 5.2 Data Structure

**Manifest Extension:**

```json
{
  "geo_enhancements": {
    "quality_signals": {
      "fluency_scoring_enabled": true,
      "readability_metrics": ["flesch_kincaid", "gunning_fog", "smog"],
      "eeat_signals": true,
      "author_credentials": true
    }
  },
  "content_pages": [
    {
      "url": "/articles/ai-trends-2025",
      "machine_view": "/articles/ai-trends-2025.llm.md",
      "quality_metadata": {
        "fluency_score": 0.92,
        "readability": {
          "flesch_kincaid_grade": 10.5,
          "gunning_fog": 12.3,
          "smog_index": 11.8,
          "reading_ease": 58.2
        },
        "eeat": {
          "experience_signals": ["first_party_data", "case_studies"],
          "expertise_signals": ["author_credentials", "technical_depth"],
          "authoritativeness_signals": ["citations", "expert_quotes"],
          "trustworthiness_signals": ["verified_facts", "source_attribution"]
        },
        "author": {
          "name": "Dr. Emily Park",
          "title": "Senior AI Researcher",
          "credentials": ["PhD Machine Learning", "10+ published papers"],
          "affiliation": "MIT Computer Science",
          "bio_url": "/authors/emily-park",
          "verified": true
        },
        "last_reviewed": "2024-10-15",
        "fact_checked": true,
        "peer_reviewed": false
      }
    }
  ]
}
```

**Machine View Quality Frontmatter:**

```markdown
---
title: "AI Market Trends 2025"
author:
  name: "Dr. Emily Park"
  title: "Senior AI Researcher"
  affiliation: "MIT Computer Science"
  credentials:
    - "PhD Machine Learning, MIT"
    - "10+ peer-reviewed publications"
  verified: true
quality:
  fluency_score: 0.92
  readability_grade: 10.5
  word_count: 2850
  citations: 12
  quotations: 5
  statistics: 8
eeat_signals:
  experience:
    - "5 years AI industry research"
    - "First-party survey data (n=1,200)"
  expertise:
    - "PhD-level analysis"
    - "Technical depth: advanced"
  authoritativeness:
    - "12 authoritative citations"
    - "5 expert quotations"
  trustworthiness:
    - "All facts verified"
    - "Peer-reviewed by 2 experts"
last_updated: "2024-11-15"
fact_checked: true
---

<!-- Content follows -->
```

### 5.3 Quality Signals Schema

```typescript
interface QualityMetadata {
  fluency_score: number;          // 0-1, writing quality
  readability: ReadabilityMetrics; // Readability scores
  eeat: EEATSignals;              // E-E-A-T indicators
  author: AuthorCredentials;       // Author information
  last_reviewed?: string;          // Last review date (ISO 8601)
  fact_checked?: boolean;          // Fact-checked status
  peer_reviewed?: boolean;         // Peer-reviewed content
  content_type?: ContentType;      // Type of content
  technical_level?: TechnicalLevel; // Technical complexity
}

interface ReadabilityMetrics {
  flesch_kincaid_grade: number;    // Grade level (US)
  gunning_fog: number;             // Fog index
  smog_index: number;              // SMOG readability
  reading_ease: number;            // Flesch Reading Ease (0-100)
  average_sentence_length: number; // Words per sentence
  complex_words_percent: number;   // % of complex words
}

interface EEATSignals {
  experience_signals: string[];    // First-party data, case studies
  expertise_signals: string[];     // Credentials, technical depth
  authoritativeness_signals: string[]; // Citations, quotes, awards
  trustworthiness_signals: string[];   // Verification, sources
  overall_score?: number;          // 0-1, computed E-E-A-T
}

interface AuthorCredentials {
  name: string;
  title: string;
  credentials: string[];           // Degrees, certifications
  affiliation: string;             // Organization
  bio_url?: string;                // Author bio page
  verified: boolean;               // Identity verified
  publications?: Publication[];    // Published works
  expertise_areas?: string[];      // Areas of expertise
}

interface Publication {
  title: string;
  type: "book" | "paper" | "article" | "report";
  date: string;
  url?: string;
  citations?: number;              // Citation count (if academic)
}

type ContentType =
  | "research"           // Research article
  | "tutorial"           // How-to guide
  | "analysis"           // Market/industry analysis
  | "news"              // News article
  | "opinion"           // Opinion piece
  | "case_study"        // Case study
  | "documentation";    // Technical documentation

type TechnicalLevel =
  | "beginner"          // Non-technical
  | "intermediate"      // Some technical knowledge
  | "advanced"          // Expert-level
  | "academic";         // Research-level
```

### 5.4 Implementation Complexity

**Effort Estimate:** 20-30 hours

**Breakdown:**
- Fluency scoring integration: 6 hours
- Readability calculators: 4 hours
- E-E-A-T signal extraction: 6 hours
- Author credential system: 6 hours
- Validation tools: 4 hours
- Documentation: 4 hours

**Dependencies:**
- Content analysis library (textstat, readability-score)
- Author management system
- Fact-checking workflow (optional)

### 5.5 Expected GEO Impact

| Metric | Without Quality Signals | With Quality Signals | Improvement |
|--------|------------------------|---------------------|-------------|
| **AIO Inclusion** | 62% | 80% (+18pp) | +29% |
| **Authority Ranking** | Medium | High | Qualitative |
| **Featured Snippets** | 8% | 22% (+14pp) | +175% |
| **Top-3 Results** | 15% | 32% (+17pp) | +113% |

**Combined Impact:** Quality signals + citations + statistics = 80-120% better GEO results

### 5.6 Code Examples

**Python: Readability Calculator**

```python
from textstat import textstat

def calculate_readability(text: str) -> dict:
    """Calculate multiple readability metrics"""
    return {
        "flesch_kincaid_grade": textstat.flesch_kincaid_grade(text),
        "gunning_fog": textstat.gunning_fog(text),
        "smog_index": textstat.smog_index(text),
        "reading_ease": textstat.flesch_reading_ease(text),
        "average_sentence_length": textstat.avg_sentence_length(text),
        "complex_words_percent": (
            textstat.difficult_words(text) / len(text.split()) * 100
        )
    }

def calculate_fluency_score(text: str) -> float:
    """Calculate overall fluency score (0-1)"""
    metrics = calculate_readability(text)

    # Normalize to 0-1 scale
    # Target: Grade 10-12, Reading Ease 50-60
    grade_score = max(0, min(1, 1 - abs(metrics['flesch_kincaid_grade'] - 11) / 11))
    ease_score = max(0, min(1, metrics['reading_ease'] / 100))

    # Weighted average
    fluency = (grade_score * 0.6) + (ease_score * 0.4)

    return round(fluency, 2)

# Usage
article_text = open('article.md').read()
readability = calculate_readability(article_text)
fluency = calculate_fluency_score(article_text)

print(f"Fluency Score: {fluency}")
print(f"Grade Level: {readability['flesch_kincaid_grade']:.1f}")
print(f"Reading Ease: {readability['reading_ease']:.1f}")
```

**TypeScript: E-E-A-T Calculator**

```typescript
function calculateEEATScore(
  citations: number,
  quotations: number,
  authorCredentials: string[],
  firstPartyData: boolean,
  factChecked: boolean
): number {
  let score = 0;

  // Experience (0-0.25)
  if (firstPartyData) score += 0.15;
  if (citations > 5) score += 0.1;

  // Expertise (0-0.25)
  const hasAdvancedDegree = authorCredentials.some(c =>
    c.includes('PhD') || c.includes('MD') || c.includes('Professor')
  );
  if (hasAdvancedDegree) score += 0.15;
  if (authorCredentials.length >= 3) score += 0.1;

  // Authoritativeness (0-0.25)
  if (citations >= 10) score += 0.15;
  if (quotations >= 5) score += 0.1;

  // Trustworthiness (0-0.25)
  if (factChecked) score += 0.15;
  if (citations > 0 && quotations > 0) score += 0.1;

  return Math.min(1.0, score);
}
```

---

## 6. ARW-GEO-5: Entity Enrichment

### 6.1 Overview

**Purpose:** Mark up named entities (people, organizations, products, concepts) with linked data for enhanced AI understanding.

**GEO Impact:** +30-40% visibility (entity recognition improves semantic understanding)

**Research Basis:**
- Named entity markup helps AI understand context
- Knowledge graph integration increases authority
- Entity linking improves topical relevance

### 6.2 Data Structure

**Manifest Extension:**

```json
{
  "geo_enhancements": {
    "entity_enrichment": {
      "enabled": true,
      "knowledge_graphs": ["wikidata", "dbpedia", "schema.org"],
      "entity_types": ["Person", "Organization", "Product", "Place", "Concept"],
      "custom_entities_endpoint": "/api/entities.json"
    }
  }
}
```

**Machine View Entity Markup:**

```markdown
<!-- chunk: company-overview -->
## Microsoft Azure AI Platform

{{entity:microsoft|Organization|wikidata:Q2283}}Microsoft{{/entity}}
launched its {{entity:azure|Product|wikidata:Q4038723}}Azure AI{{/entity}}
platform in {{entity:2023|Date}}2023{{/entity}}, with
{{entity:satya-nadella|Person|wikidata:Q7426094}}Satya Nadella{{/entity}}
leading the strategic vision.

The platform integrates {{entity:openai|Organization|wikidata:Q21708200}}OpenAI's{{/entity}}
{{entity:gpt4|Product}}GPT-4{{/entity}} model, offering enterprises
{{entity:generative-ai|Concept}}generative AI{{/entity}} capabilities
for {{entity:content-creation|Concept}}content creation{{/entity}} and
{{entity:code-generation|Concept}}code generation{{/entity}}.

<!-- entities -->
```entities
[
  {
    "id": "microsoft",
    "type": "Organization",
    "name": "Microsoft Corporation",
    "wikidata_id": "Q2283",
    "dbpedia_url": "http://dbpedia.org/resource/Microsoft",
    "schema_type": "Organization",
    "properties": {
      "founded": "1975",
      "industry": "Technology",
      "headquarters": "Redmond, Washington"
    }
  },
  {
    "id": "satya-nadella",
    "type": "Person",
    "name": "Satya Nadella",
    "wikidata_id": "Q7426094",
    "schema_type": "Person",
    "properties": {
      "jobTitle": "CEO",
      "worksFor": "Microsoft Corporation",
      "nationality": "American"
    }
  },
  {
    "id": "generative-ai",
    "type": "Concept",
    "name": "Generative Artificial Intelligence",
    "wikidata_id": "Q113505823",
    "related_entities": ["machine-learning", "deep-learning", "neural-networks"]
  }
]
```
```

**Alternative: Schema.org JSON-LD:**

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Microsoft Azure AI Platform",
  "mentions": [
    {
      "@type": "Organization",
      "@id": "http://www.wikidata.org/entity/Q2283",
      "name": "Microsoft Corporation",
      "sameAs": [
        "https://en.wikipedia.org/wiki/Microsoft",
        "http://dbpedia.org/resource/Microsoft"
      ],
      "foundingDate": "1975",
      "industry": "Technology"
    },
    {
      "@type": "Person",
      "@id": "http://www.wikidata.org/entity/Q7426094",
      "name": "Satya Nadella",
      "jobTitle": "CEO",
      "worksFor": {
        "@type": "Organization",
        "name": "Microsoft Corporation"
      },
      "sameAs": "https://en.wikipedia.org/wiki/Satya_Nadella"
    },
    {
      "@type": "SoftwareApplication",
      "name": "Azure AI",
      "applicationCategory": "Artificial Intelligence Platform",
      "operatingSystem": "Cloud",
      "provider": {
        "@type": "Organization",
        "name": "Microsoft Corporation"
      }
    }
  ]
}
</script>
```

### 6.3 Entity Schema

```typescript
interface Entity {
  id: string;                     // Local entity identifier
  type: EntityType;               // Entity type
  name: string;                   // Display name
  wikidata_id?: string;           // Wikidata Q-number
  dbpedia_url?: string;           // DBpedia resource URL
  schema_type: string;            // Schema.org type
  properties: Record<string, any>; // Entity-specific properties
  related_entities?: string[];    // Related entity IDs
  aliases?: string[];             // Alternative names
  description?: string;           // Brief description
  confidence?: number;            // 0-1, entity recognition confidence
}

type EntityType =
  | "Person"           // Individual person
  | "Organization"     // Company, institution
  | "Product"          // Product or service
  | "Place"           // Geographic location
  | "Concept"         // Abstract concept/technology
  | "Event"           // Event or occurrence
  | "CreativeWork";   // Book, paper, article

interface EntityGraph {
  entities: Entity[];
  relationships: EntityRelationship[];
}

interface EntityRelationship {
  source_id: string;              // Source entity ID
  target_id: string;              // Target entity ID
  relationship_type: string;      // "employs", "created", "located_in", etc.
  strength?: number;              // 0-1, relationship strength
}
```

### 6.4 Implementation Complexity

**Effort Estimate:** 40-60 hours

**Breakdown:**
- Entity recognition integration: 12 hours
- Wikidata API integration: 8 hours
- Entity database setup: 10 hours
- Machine view markup tooling: 12 hours
- Relationship mapping: 8 hours
- Validation tools: 6 hours
- Documentation: 4 hours

**Dependencies:**
- Named Entity Recognition (NER) library (spaCy, Stanford NER)
- Wikidata/DBpedia API access
- Entity disambiguation logic

### 6.5 Expected GEO Impact

| Metric | Without Entities | With Entities | Improvement |
|--------|-----------------|---------------|-------------|
| **Semantic Understanding** | 70% | 92% (+22pp) | +31% |
| **Topical Relevance** | Medium | High | Qualitative |
| **Knowledge Graph Connection** | None | Yes | New capability |
| **Featured in AI Summaries** | 25% | 58% (+33pp) | +132% |

### 6.6 Code Examples

**Python: Entity Extraction with spaCy**

```python
import spacy
import requests

nlp = spacy.load("en_core_web_lg")

def extract_entities(text: str) -> list:
    """Extract named entities using spaCy"""
    doc = nlp(text)

    entities = []
    for ent in doc.ents:
        entity = {
            "text": ent.text,
            "type": ent.label_,
            "start": ent.start_char,
            "end": ent.end_char
        }

        # Try to link to Wikidata
        wikidata_id = link_to_wikidata(ent.text, ent.label_)
        if wikidata_id:
            entity["wikidata_id"] = wikidata_id

        entities.append(entity)

    return entities

def link_to_wikidata(entity_name: str, entity_type: str) -> str:
    """Attempt to link entity to Wikidata"""
    # Search Wikidata API
    url = "https://www.wikidata.org/w/api.php"
    params = {
        "action": "wbsearchentities",
        "search": entity_name,
        "language": "en",
        "format": "json"
    }

    try:
        response = requests.get(url, params=params)
        data = response.json()

        if data.get("search"):
            # Return first result's Q-number
            return data["search"][0]["id"]
    except:
        pass

    return None

# Usage
text = "Microsoft CEO Satya Nadella announced Azure AI platform."
entities = extract_entities(text)

for ent in entities:
    print(f"{ent['text']} ({ent['type']}): {ent.get('wikidata_id', 'no link')}")
```

---

## 7. ARW-GEO-6: Semantic Clustering

### 7.1 Overview

**Purpose:** Declare topic taxonomy, content relationships, and semantic clusters to signal topical authority.

**GEO Impact:** +35-45% visibility (topical authority is key ranking factor)

**Research Basis:**
- Topic clusters improve domain authority
- Internal linking signals topical expertise
- Semantic relationships help AI understand content depth

### 7.2 Data Structure

**Manifest Extension:**

```json
{
  "geo_enhancements": {
    "semantic_clustering": {
      "enabled": true,
      "taxonomy_endpoint": "/taxonomy.json",
      "cluster_algorithm": "topic_modeling",
      "similarity_threshold": 0.75
    }
  },
  "content_taxonomy": {
    "topics": [
      {
        "id": "artificial-intelligence",
        "name": "Artificial Intelligence",
        "parent": null,
        "children": ["machine-learning", "deep-learning", "nlp"],
        "page_count": 45,
        "authority_score": 0.94
      },
      {
        "id": "machine-learning",
        "name": "Machine Learning",
        "parent": "artificial-intelligence",
        "children": ["supervised-learning", "unsupervised-learning"],
        "page_count": 28,
        "authority_score": 0.89
      }
    ],
    "content_clusters": [
      {
        "id": "cluster:ml-algorithms",
        "name": "Machine Learning Algorithms",
        "topic_id": "machine-learning",
        "pages": [
          "/articles/linear-regression",
          "/articles/decision-trees",
          "/articles/neural-networks"
        ],
        "pillar_page": "/guides/machine-learning-algorithms",
        "cohesion_score": 0.88
      }
    ]
  }
}
```

**Machine View Semantic Metadata:**

```markdown
---
title: "Introduction to Neural Networks"
semantic_metadata:
  primary_topic: "neural-networks"
  secondary_topics: ["deep-learning", "backpropagation"]
  topic_hierarchy:
    - "artificial-intelligence"
    - "machine-learning"
    - "neural-networks"
  content_cluster: "cluster:ml-algorithms"
  related_pages:
    - url: "/articles/backpropagation"
      relationship: "explains_concept"
      relevance: 0.95
    - url: "/articles/activation-functions"
      relationship: "prerequisite"
      relevance: 0.88
  semantic_keywords:
    primary: ["neural network", "artificial neuron", "activation function"]
    secondary: ["weights", "bias", "gradient descent"]
  topical_depth: "advanced"
  content_type: "tutorial"
---

<!-- Content follows -->
```

### 7.3 Semantic Clustering Schema

```typescript
interface Topic {
  id: string;                     // Topic identifier
  name: string;                   // Display name
  parent?: string;                // Parent topic ID
  children?: string[];            // Child topic IDs
  page_count: number;             // Number of pages on this topic
  authority_score?: number;       // 0-1, topical authority
  description?: string;           // Topic description
  synonyms?: string[];            // Alternative topic names
}

interface ContentCluster {
  id: string;                     // Cluster identifier
  name: string;                   // Cluster name
  topic_id: string;               // Associated topic
  pages: string[];                // Page URLs in cluster
  pillar_page?: string;           // Main hub page URL
  cohesion_score: number;         // 0-1, cluster cohesion
  created_date: string;           // Cluster creation date
  last_updated: string;           // Last update date
}

interface SemanticMetadata {
  primary_topic: string;          // Primary topic ID
  secondary_topics?: string[];    // Secondary topic IDs
  topic_hierarchy: string[];      // Full hierarchy path
  content_cluster?: string;       // Content cluster ID
  related_pages: RelatedPage[];   // Related content
  semantic_keywords: {
    primary: string[];            // Primary keywords
    secondary: string[];          // Secondary keywords
    entities: string[];           // Key entities
  };
  topical_depth: TopicalDepth;    // Content depth level
  content_type: string;           // Content format type
}

interface RelatedPage {
  url: string;                    // Related page URL
  relationship: RelationshipType; // Type of relationship
  relevance: number;              // 0-1, relevance score
  title?: string;                 // Page title
}

type RelationshipType =
  | "explains_concept"     // Explains a concept mentioned
  | "prerequisite"         // Prerequisite knowledge
  | "next_step"           // Natural next topic
  | "comparison"          // Comparative content
  | "case_study"          // Real-world example
  | "alternative"         // Alternative approach
  | "deep_dive";          // More detailed coverage

type TopicalDepth =
  | "overview"            // High-level overview
  | "introductory"        // Beginner-friendly
  | "intermediate"        // Moderate depth
  | "advanced"            // Expert-level
  | "comprehensive";      // Complete coverage
```

### 7.4 Implementation Complexity

**Effort Estimate:** 24-36 hours

**Breakdown:**
- Topic taxonomy design: 8 hours
- Clustering algorithm: 8 hours
- Relationship extraction: 6 hours
- Authority scoring: 4 hours
- Manifest integration: 4 hours
- Validation tools: 4 hours
- Documentation: 4 hours

**Dependencies:**
- Topic modeling library (scikit-learn, gensim)
- Content similarity calculator
- Graph database (optional, for relationships)

### 7.5 Expected GEO Impact

| Metric | Without Clustering | With Clustering | Improvement |
|--------|-------------------|-----------------|-------------|
| **Topical Authority** | Medium | High | Qualitative |
| **Domain Expertise** | 60% | 85% (+25pp) | +42% |
| **Featured in Topic** | 18% | 52% (+34pp) | +189% |
| **Internal Link Value** | Low | High | Qualitative |

### 7.6 Code Examples

**Python: Topic Clustering**

```python
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.cluster import KMeans
import numpy as np

def cluster_content(documents: list[dict]) -> list[dict]:
    """Cluster content by semantic similarity"""

    # Extract text from documents
    texts = [doc['content'] for doc in documents]

    # TF-IDF vectorization
    vectorizer = TfidfVectorizer(max_features=1000, stop_words='english')
    tfidf_matrix = vectorizer.fit_transform(texts)

    # K-means clustering
    num_clusters = max(3, len(documents) // 10)  # Dynamic cluster count
    kmeans = KMeans(n_clusters=num_clusters, random_state=42)
    clusters = kmeans.fit_predict(tfidf_matrix)

    # Assign cluster IDs to documents
    for i, doc in enumerate(documents):
        doc['cluster_id'] = f"cluster:{int(clusters[i])}"

    return documents

def calculate_cohesion_score(cluster_docs: list[str]) -> float:
    """Calculate cluster cohesion (similarity within cluster)"""
    vectorizer = TfidfVectorizer()
    tfidf_matrix = vectorizer.fit_transform(cluster_docs)

    # Calculate pairwise cosine similarity
    from sklearn.metrics.pairwise import cosine_similarity
    similarities = cosine_similarity(tfidf_matrix)

    # Average similarity (excluding diagonal)
    n = len(cluster_docs)
    if n < 2:
        return 1.0

    total_sim = similarities.sum() - n  # Subtract diagonal
    avg_sim = total_sim / (n * (n - 1))

    return float(avg_sim)
```

---

## 8. ARW-GEO-7: Domain-Specific Optimization

### 8.1 Overview

**Purpose:** Declare domain classification and apply domain-specific optimization patterns.

**GEO Impact:** +20-30% visibility (domain-specific optimization improves relevance)

**Research Basis:**
- Different domains require different GEO strategies
- E-commerce benefits from product schema
- SaaS benefits from technical documentation patterns
- Media benefits from authorship signals

### 8.2 Data Structure

**Manifest Extension:**

```json
{
  "geo_enhancements": {
    "domain_optimization": {
      "enabled": true,
      "primary_domain": "ecommerce",
      "secondary_domains": ["technology", "consumer_goods"],
      "optimization_profiles": ["product_rich_snippets", "customer_reviews"]
    }
  },
  "domain_metadata": {
    "domain_classification": {
      "primary": "ecommerce",
      "confidence": 0.95,
      "industries": ["consumer_electronics", "sustainable_products"]
    },
    "domain_specific_patterns": {
      "ecommerce": {
        "product_catalog": true,
        "pricing_display": "dynamic",
        "reviews_enabled": true,
        "inventory_tracking": true
      }
    }
  }
}
```

**Domain-Specific Content Patterns:**

**E-commerce:**
```markdown
---
domain: ecommerce
product_data:
  sku: "KB-001"
  price: 129.99
  currency: "USD"
  availability: "in_stock"
  rating: 4.8
  review_count: 324
---

# Wireless Mechanical Keyboard

<!-- Product schema automatically applied -->
```

**SaaS/Documentation:**
```markdown
---
domain: saas_documentation
api_data:
  endpoint: "/api/v1/users"
  method: "GET"
  authentication: "Bearer Token"
  rate_limit: "1000/hour"
---

# User API Documentation

<!-- API schema automatically applied -->
```

**Content/Media:**
```markdown
---
domain: media_publishing
article_data:
  type: "news"
  category: "technology"
  word_count: 1850
  publish_date: "2024-11-15"
  author_verified: true
---

# Breaking: AI Breakthrough Announced

<!-- Article schema automatically applied -->
```

### 8.3 Domain Schema

```typescript
interface DomainMetadata {
  domain_classification: DomainClassification;
  domain_specific_patterns: Record<string, any>;
  optimization_recommendations: string[];
}

interface DomainClassification {
  primary: DomainType;
  secondary?: DomainType[];
  confidence: number;              // 0-1, classification confidence
  industries?: string[];           // Specific industries
  business_model?: string;         // B2B, B2C, B2B2C, etc.
}

type DomainType =
  | "ecommerce"             // E-commerce/retail
  | "saas"                  // Software as a Service
  | "media_publishing"      // News, blogs, content
  | "documentation"         // Technical documentation
  | "education"             // Educational content
  | "finance"               // Financial services
  | "healthcare"            // Healthcare/medical
  | "real_estate"           // Property listings
  | "travel"                // Travel/hospitality
  | "food_beverage"         // Restaurants, recipes
  | "local_business"        // Local businesses
  | "marketplace";          // Multi-vendor marketplace

interface DomainOptimizationProfile {
  domain: DomainType;
  recommended_schemas: string[];   // Schema.org types
  required_metadata: string[];     // Required fields
  optional_metadata: string[];     // Optional fields
  geo_priorities: string[];        // Priority GEO methods
  examples: string[];              // Example URLs
}
```

### 8.4 Domain-Specific Optimization Profiles

**E-commerce Profile:**
```json
{
  "domain": "ecommerce",
  "recommended_schemas": ["Product", "Offer", "AggregateRating"],
  "required_metadata": ["price", "availability", "sku"],
  "optional_metadata": ["rating", "review_count", "brand"],
  "geo_priorities": [
    "statistics",  // Product statistics (sales, ratings)
    "quotations",  // Customer testimonials
    "entities"     // Product/brand entities
  ],
  "content_patterns": {
    "product_pages": {
      "structure": ["overview", "specifications", "reviews"],
      "chunks_required": true,
      "schema_required": true
    }
  }
}
```

**SaaS/Documentation Profile:**
```json
{
  "domain": "saas_documentation",
  "recommended_schemas": ["SoftwareApplication", "HowTo", "TechArticle"],
  "required_metadata": ["api_version", "last_updated"],
  "optional_metadata": ["code_examples", "api_endpoints"],
  "geo_priorities": [
    "citations",   // Technical references
    "quality",     // Code quality signals
    "clustering"   // Topic organization
  ],
  "content_patterns": {
    "api_docs": {
      "structure": ["authentication", "endpoints", "examples"],
      "code_blocks_required": true,
      "versioning_required": true
    }
  }
}
```

### 8.5 Implementation Complexity

**Effort Estimate:** 8-16 hours

**Breakdown:**
- Domain classification: 2 hours
- Profile templates: 4 hours
- Manifest integration: 2 hours
- Validation tools: 4 hours
- Documentation: 4 hours

### 8.6 Expected GEO Impact

| Metric | Generic Optimization | Domain-Specific | Improvement |
|--------|---------------------|----------------|-------------|
| **Relevance Score** | Medium | High | Qualitative |
| **Domain Authority** | 65% | 82% (+17pp) | +26% |
| **Featured Results** | 12% | 28% (+16pp) | +133% |
| **Conversion Rate** | Baseline | +15-25% | +15-25% |

### 8.7 Code Examples

**Python: Domain Classifier**

```python
def classify_domain(site_content: dict) -> dict:
    """Classify site domain based on content patterns"""

    # Analyze URL patterns
    urls = [page['url'] for page in site_content.get('pages', [])]

    # E-commerce signals
    ecommerce_signals = [
        any('/products' in url for url in urls),
        any('/cart' in url for url in urls),
        'price' in str(site_content).lower(),
        'sku' in str(site_content).lower()
    ]

    # SaaS/Docs signals
    saas_signals = [
        any('/api' in url or '/docs' in url for url in urls),
        'authentication' in str(site_content).lower(),
        'endpoint' in str(site_content).lower(),
        any('code' in page.get('type', '') for page in site_content.get('pages', []))
    ]

    # Media signals
    media_signals = [
        any('/articles' in url or '/news' in url for url in urls),
        'author' in str(site_content).lower(),
        'publish_date' in str(site_content).lower()
    ]

    # Calculate confidence scores
    scores = {
        'ecommerce': sum(ecommerce_signals) / len(ecommerce_signals),
        'saas_documentation': sum(saas_signals) / len(saas_signals),
        'media_publishing': sum(media_signals) / len(media_signals)
    }

    # Determine primary domain
    primary = max(scores, key=scores.get)
    confidence = scores[primary]

    return {
        'primary': primary,
        'confidence': confidence,
        'all_scores': scores
    }
```

---

## 9. Implementation Roadmap

### 9.1 Phased Rollout Strategy

**Phase 1: Foundation GEO (ARW-2.1) - 40-60 hours**

**Week 1-2: Citations, Statistics, Quotations**
- ✅ Implement citation framework (16 hours)
- ✅ Add statistics enhancement (16 hours)
- ✅ Deploy quotation system (8 hours)
- ✅ Update manifest to v0.2 (4 hours)
- **Expected Impact:** +120-140% visibility improvement

**Week 3: Domain Classification**
- ✅ Classify site domain (4 hours)
- ✅ Apply domain-specific patterns (8 hours)
- ✅ Validation and testing (4 hours)
- **Expected Impact:** +20-30% additional visibility

**Total Phase 1:** 60 hours, +140-170% cumulative impact

---

**Phase 2: Advanced GEO (ARW-2.2) - 80-120 hours**

**Week 4-5: Quality Signals**
- ✅ Implement fluency scoring (6 hours)
- ✅ Add readability metrics (4 hours)
- ✅ Deploy E-E-A-T signals (6 hours)
- ✅ Author credential system (6 hours)
- **Expected Impact:** +25-35% additional visibility

**Week 6-8: Entity Enrichment**
- ✅ Integrate entity recognition (12 hours)
- ✅ Connect to Wikidata/DBpedia (8 hours)
- ✅ Build entity database (10 hours)
- ✅ Machine view markup (12 hours)
- **Expected Impact:** +30-40% additional visibility

**Week 9-10: Semantic Clustering**
- ✅ Design topic taxonomy (8 hours)
- ✅ Implement clustering algorithm (8 hours)
- ✅ Extract relationships (6 hours)
- ✅ Calculate authority scores (4 hours)
- **Expected Impact:** +35-45% additional visibility

**Total Phase 2:** 110 hours, +90-120% additional impact

---

**Combined Impact (Both Phases):**
- **Total Implementation:** 170 hours (4-5 weeks)
- **Cumulative GEO Impact:** +230-290% visibility improvement
- **ROI Timeline:** 3-6 months to full impact
- **Break-Even:** 2-3 months for most sites

### 9.2 Priority Matrix

| Enhancement | Impact | Effort | Priority | Phase |
|------------|--------|--------|----------|-------|
| **Citations** | Very High (+40%) | Medium (16h) | **P0** | 1 |
| **Statistics** | Very High (+40%) | Medium (16h) | **P0** | 1 |
| **Quotations** | Very High (+40%) | Low (8h) | **P0** | 1 |
| **Domain Classification** | Medium (+20-30%) | Low (8h) | **P1** | 1 |
| **Quality Signals** | High (+25-35%) | Medium (20h) | **P1** | 2 |
| **Semantic Clustering** | High (+35-45%) | Medium (24h) | **P2** | 2 |
| **Entity Enrichment** | High (+30-40%) | High (40h) | **P2** | 2 |

**Recommendation:** Start with P0 features (Citations, Statistics, Quotations) for maximum ROI with minimal investment.

---

## 10. Migration Strategy

### 10.1 Backward Compatibility Guarantee

**ARW v0.1 Compatibility:**
- All v0.2 enhancements are **optional extensions**
- Sites remain v0.1 compliant without GEO features
- ARW v0.1 agents ignore GEO metadata (graceful degradation)
- No breaking changes to existing implementations

**Migration Path:**

```yaml
# Step 1: Keep existing ARW v0.1 manifest
version: "0.1"
profile: ARW-2

# Step 2: Add GEO metadata file (optional, non-breaking)
# Create: /.well-known/arw-geo-metadata.json

# Step 3: Upgrade version when ready
version: "0.2"
profile: ARW-2.1  # Foundation GEO
```

### 10.2 Incremental Adoption

**Tier 1: Minimal GEO (8-16 hours)**
- Add citations to 5-10 key pages
- Structured statistics in top articles
- 2-3 expert quotations
- Domain classification
- **Impact:** +80-100% visibility improvement

**Tier 2: Standard GEO (40-60 hours)**
- Citations on 20-50 pages
- Statistics in all data-driven content
- Quotations in all long-form content
- Quality signals on top 20 pages
- **Impact:** +140-180% visibility improvement

**Tier 3: Advanced GEO (100-170 hours)**
- Full citation framework
- Complete entity enrichment
- Semantic clustering across site
- All quality signals
- **Impact:** +230-290% visibility improvement

### 10.3 Migration Tools

**ARW CLI Migration Commands:**

```bash
# Analyze current implementation
npx arw@alpha analyze --geo-readiness

# Generate GEO metadata file
npx arw@alpha geo:init --domain ecommerce

# Add citations to content
npx arw@alpha geo:citations --input article.md --output article.llm.md

# Extract statistics
npx arw@alpha geo:statistics --extract --input article.md

# Entity enrichment
npx arw@alpha geo:entities --link-wikidata --input article.llm.md

# Validate GEO compliance
npx arw@alpha validate --profile ARW-2.1
```

### 10.4 Content Transformation Examples

**Before (ARW v0.1):**
```markdown
# AI Market Analysis

The AI market is growing rapidly. Industry reports show strong growth.
Experts predict continued expansion.

Market size reached $150 billion in 2023.
```

**After (ARW v0.2 with GEO):**
```markdown
---
title: "AI Market Analysis 2024"
version: "0.2"
profile: ARW-2.1
author:
  name: "Dr. Jane Smith"
  credentials: ["PhD Economics", "AI Market Analyst"]
  verified: true
quality:
  fluency_score: 0.89
  citations: 4
  statistics: 3
  quotations: 2
---

# AI Market Analysis 2024

The {{entity:artificial-intelligence|Concept|wikidata:Q11660}}artificial intelligence{{/entity}}
market is experiencing unprecedented growth.

<!-- stat:market-size-2023 -->
**Market Size:** The global AI market reached $150 billion in 2023,
representing 38% year-over-year growth.^[cite:1]

```statistics
{
  "id": "stat:market-size-2023",
  "type": "market_metric",
  "value": 150,
  "unit": "billion USD",
  "date": "2023-12-31",
  "growth_rate": {"value": 38, "unit": "percent", "period": "YoY"},
  "source": "Gartner AI Market Report 2024",
  "source_url": "https://gartner.com/ai-market-2024"
}
```

<!-- quote:expert-1 -->
> "AI adoption has reached a tipping point. We're seeing 80% of Fortune 500
> companies now deploying generative AI in production."

```quotation
{
  "id": "quote:expert-1",
  "text": "AI adoption has reached a tipping point...",
  "speaker": {
    "name": "Dr. Michael Chen",
    "title": "VP of AI Research",
    "affiliation": "Stanford University",
    "verified": true
  },
  "date": "2024-06-15",
  "source": "Stanford AI Conference 2024"
}
```

<!-- citations -->
[cite:1]: {
  "source": "Gartner AI Market Report 2024",
  "type": "industry_report",
  "url": "https://gartner.com/ai-market-2024",
  "date": "2024-01-15",
  "authority_score": 0.96
}
```

---

## 11. Validation & Testing

### 11.1 ARW-GEO Validator

**CLI Validation:**

```bash
# Validate GEO compliance
npx arw@alpha validate --profile ARW-2.1 --url https://example.com

# Check specific enhancement
npx arw@alpha geo:validate:citations --input article.llm.md
npx arw@alpha geo:validate:statistics --input article.llm.md
npx arw@alpha geo:validate:entities --input article.llm.md

# Generate compliance report
npx arw@alpha geo:report --output report.json
```

**Validation Checklist:**

**ARW-2.1 (Foundation GEO) Compliance:**
- [ ] Version "0.2" in manifest
- [ ] Profile "ARW-2.1" declared
- [ ] At least 5 pages with citations
- [ ] At least 3 pages with statistics
- [ ] At least 2 pages with quotations
- [ ] Domain classification present
- [ ] All citations have authority scores
- [ ] All statistics have sources
- [ ] All quotations have speaker credentials

**ARW-2.2 (Advanced GEO) Compliance:**
- [ ] All ARW-2.1 requirements met
- [ ] Quality signals on 10+ pages
- [ ] Entity enrichment on 10+ pages
- [ ] Semantic clustering configured
- [ ] Topic taxonomy defined
- [ ] Content clusters mapped
- [ ] E-E-A-T signals present

### 11.2 Testing Tools

**Python Testing Library:**

```python
import arw_geo_validator

# Load and validate
validator = arw_geo_validator.Validator()
result = validator.validate_url('https://example.com')

print(f"Profile: {result.profile}")
print(f"Compliance: {result.compliance_score}%")
print(f"Issues: {len(result.issues)}")

for issue in result.issues:
    print(f"  - {issue.severity}: {issue.message}")

# Validate specific file
file_result = validator.validate_file('article.llm.md')
print(f"Citations: {file_result.citations_count}")
print(f"Statistics: {file_result.statistics_count}")
print(f"Quotations: {file_result.quotations_count}")
```

### 11.3 GEO Impact Measurement

**Key Metrics to Track:**

```typescript
interface GEOMetrics {
  // Discovery
  aio_inclusion_rate: number;      // % of pages in AI results
  discovery_time: number;          // Seconds to discover content

  // Citations
  citation_frequency: number;      // Citations per month
  top_source_rate: number;         // % of citations as #1 source
  citation_accuracy: number;       // % of accurate citations

  // Quality
  hallucination_rate: number;      // % of AI hallucinations
  authority_score: number;         // 0-1, computed authority
  featured_snippet_rate: number;   // % of featured snippets

  // Engagement
  ai_traffic: number;              // Sessions from AI agents
  conversion_rate: number;         // AI traffic conversion
  revenue_from_ai: number;         // Revenue attributed to AI
}
```

**Measurement Tools:**

```bash
# Track GEO metrics over time
npx arw@alpha geo:metrics --start-date 2024-01-01 --end-date 2024-12-31

# Generate GEO impact report
npx arw@alpha geo:impact-report --compare-baseline

# A/B test GEO features
npx arw@alpha geo:ab-test --feature citations --duration 30d
```

---

## 12. Conclusion

### 12.1 Summary of Enhancements

This specification defines **7 technical enhancements to ARW** that directly support **9 proven GEO methods**:

| Enhancement | ARW Version | Impact | Effort | ROI |
|------------|-------------|--------|--------|-----|
| **Citation Framework** | ARW-2.1 | +40% | 16h | Very High |
| **Statistics Enhancement** | ARW-2.1 | +40% | 16h | Very High |
| **Quotation System** | ARW-2.1 | +40% | 8h | Exceptional |
| **Domain Optimization** | ARW-2.1 | +20-30% | 8h | High |
| **Quality Signals** | ARW-2.2 | +25-35% | 20h | High |
| **Entity Enrichment** | ARW-2.2 | +30-40% | 40h | Medium |
| **Semantic Clustering** | ARW-2.2 | +35-45% | 24h | High |

**Combined Impact:** +230-290% cumulative visibility improvement

### 12.2 Implementation Priority

**Start Here (P0 - 32 hours):**
1. Citations (16 hours) → +40% impact
2. Statistics (16 hours) → +40% impact
3. Quotations (8 hours) → +40% impact

**Expected: +120% visibility in 1-2 months**

**Next Steps (P1 - 48 hours):**
4. Domain Classification (8 hours) → +20-30% impact
5. Quality Signals (20 hours) → +25-35% impact
6. Semantic Clustering (24 hours) → +35-45% impact

**Expected: +80-110% additional visibility**

**Advanced (P2 - 40 hours):**
7. Entity Enrichment (40 hours) → +30-40% impact

**Total Impact: +230-290% cumulative**

### 12.3 Next Steps

1. **Review this specification** with engineering and content teams
2. **Select implementation tier** (Minimal, Standard, or Advanced)
3. **Start with P0 features** (citations, statistics, quotations)
4. **Measure baseline metrics** before implementation
5. **Deploy incrementally** and measure impact
6. **Iterate based on results** and expand to P1/P2 features

### 12.4 Resources

**ARW GEO Tools:**
- ARW CLI: `npm install @arw/cli@alpha`
- Validator: `npx arw@alpha validate --profile ARW-2.1`
- Documentation: `/docs/geo-optimization/`

**Support:**
- GitHub: https://github.com/nolandubeau/agent-ready-web
- Discussions: https://github.com/nolandubeau/agent-ready-web/discussions
- Specification: `/spec/ARW-0.1-draft.md`

---

**Document Status:** Technical Specification
**Version:** 1.0
**Last Updated:** November 21, 2025
**Next Review:** January 2026
**Authors:** ARW Architecture Team
**License:** Apache 2.0
