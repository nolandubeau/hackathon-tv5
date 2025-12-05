# Web Crawler Service - ARW Integration

## Overview

This document details the Agent-Ready Web (ARW) specific features and integration points in the Web Crawler Service. ARW optimization ensures that content is discovered, extracted, and formatted specifically for AI agent consumption.

## ARW Discovery Pipeline

### Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                  ARW Discovery Pipeline                          │
│                                                                  │
│  1. Initial Discovery                                            │
│     ├─ llms.txt detection (/, /.well-known/)                    │
│     ├─ robots.txt parsing                                        │
│     └─ sitemap.xml discovery                                     │
│                                                                  │
│  2. Content Analysis                                             │
│     ├─ Structured data extraction (Schema.org, JSON-LD)         │
│     ├─ Metadata enrichment (Open Graph, Twitter Cards)          │
│     └─ Machine-readable format detection                        │
│                                                                  │
│  3. Compliance Scoring                                           │
│     ├─ ARW directive compliance                                 │
│     ├─ Content accessibility                                    │
│     └─ Machine readability score                                │
│                                                                  │
│  4. Optimization Recommendations                                 │
│     ├─ Missing ARW elements                                     │
│     ├─ Improvement suggestions                                  │
│     └─ Best practice violations                                 │
└──────────────────────────────────────────────────────────────────┘
```

## llms.txt Discovery & Parsing

### Discovery Process

The service automatically discovers llms.txt files following the ARW specification:

1. **Primary Location**: `https://domain.com/llms.txt`
2. **Well-Known Location**: `https://domain.com/.well-known/llms.txt`
3. **Subdomain Check**: Check subdomains if specified

### llms.txt Parser Implementation

```typescript
// File: src/arw/llms-txt-parser.ts

interface LLMsTxtDirectives {
  allow: string[];
  disallow: string[];
  crawlDelay?: number;
  summary?: string;
  contact?: string;
  preferredFormats?: string[];
  machineReadableUrls?: string[];
  apiEndpoint?: string;
  rateLimit?: number;
  authentication?: {
    required: boolean;
    method?: string;
    endpoint?: string;
  };
}

export class LLMsTxtParser {
  /**
   * Parse llms.txt content
   */
  parse(content: string): LLMsTxtDirectives {
    const directives: LLMsTxtDirectives = {
      allow: [],
      disallow: [],
    };

    const lines = content.split('\n');
    let currentSection = '';

    for (let line of lines) {
      line = line.trim();

      // Skip comments and empty lines
      if (line.startsWith('#') || !line) {
        continue;
      }

      // Section headers
      if (line.startsWith('[') && line.endsWith(']')) {
        currentSection = line.slice(1, -1).toLowerCase();
        continue;
      }

      // Parse directives
      const [key, ...valueParts] = line.split(':');
      const value = valueParts.join(':').trim();

      switch (key.toLowerCase()) {
        case 'allow':
          directives.allow.push(value);
          break;
        case 'disallow':
          directives.disallow.push(value);
          break;
        case 'crawl-delay':
          directives.crawlDelay = parseInt(value, 10);
          break;
        case 'summary':
          directives.summary = value;
          break;
        case 'contact':
          directives.contact = value;
          break;
        case 'preferred-format':
          if (!directives.preferredFormats) {
            directives.preferredFormats = [];
          }
          directives.preferredFormats.push(value);
          break;
        case 'machine-readable-url':
          if (!directives.machineReadableUrls) {
            directives.machineReadableUrls = [];
          }
          directives.machineReadableUrls.push(value);
          break;
        case 'api-endpoint':
          directives.apiEndpoint = value;
          break;
        case 'rate-limit':
          directives.rateLimit = parseInt(value, 10);
          break;
        case 'auth-required':
          if (!directives.authentication) {
            directives.authentication = { required: false };
          }
          directives.authentication.required = value.toLowerCase() === 'true';
          break;
        case 'auth-method':
          if (!directives.authentication) {
            directives.authentication = { required: false };
          }
          directives.authentication.method = value;
          break;
      }
    }

    return directives;
  }

  /**
   * Check if URL is allowed by llms.txt directives
   */
  isAllowed(url: string, directives: LLMsTxtDirectives): boolean {
    const path = new URL(url).pathname;

    // Check disallow patterns first
    for (const pattern of directives.disallow) {
      if (this.matchPattern(path, pattern)) {
        return false;
      }
    }

    // If allow list is empty, allow everything not disallowed
    if (directives.allow.length === 0) {
      return true;
    }

    // Check allow patterns
    for (const pattern of directives.allow) {
      if (this.matchPattern(path, pattern)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Match URL path against glob pattern
   */
  private matchPattern(path: string, pattern: string): boolean {
    // Convert glob pattern to regex
    const regexPattern = pattern
      .replace(/\*/g, '.*')
      .replace(/\?/g, '.');

    const regex = new RegExp(`^${regexPattern}$`);
    return regex.test(path);
  }

  /**
   * Get crawl delay from directives
   */
  getCrawlDelay(directives: LLMsTxtDirectives): number {
    return directives.crawlDelay || 1; // Default 1 second
  }
}
```

### Example llms.txt File

```text
# Agent-Ready Web Configuration for Example.com
# This file specifies how AI agents should interact with our content

# General Information
summary: Technical documentation and blog about web development
contact: admin@example.com

# Crawling Rules
allow: /blog/*
allow: /docs/*
allow: /api/reference/*
disallow: /admin/*
disallow: /private/*
disallow: *.pdf
crawl-delay: 1

# Preferred Formats
preferred-format: markdown
preferred-format: json

# Machine-Readable URLs
machine-readable-url: https://example.com/api/content
machine-readable-url: https://example.com/blog/machine-view

# API Access
api-endpoint: https://api.example.com/v1/content
rate-limit: 100
auth-required: true
auth-method: Bearer Token

# Structured Content
[content-types]
articles: /blog/*
documentation: /docs/*
api-reference: /api/reference/*

[metadata]
language: en
primary-topic: web-development
update-frequency: daily
```

## robots.txt Integration

### Enhanced robots.txt Parser

The service parses robots.txt with special handling for AI agent user-agents:

```typescript
// File: src/arw/robots-txt-parser.ts

export interface RobotsTxtRules {
  userAgents: Record<string, {
    allow: string[];
    disallow: string[];
    crawlDelay?: number;
  }>;
  sitemaps: string[];
}

export class RobotsTxtParser {
  /**
   * Parse robots.txt content
   */
  parse(content: string): RobotsTxtRules {
    const rules: RobotsTxtRules = {
      userAgents: {},
      sitemaps: [],
    };

    const lines = content.split('\n');
    let currentUserAgent = '*';

    for (let line of lines) {
      line = line.split('#')[0].trim(); // Remove comments

      if (!line) continue;

      const [key, ...valueParts] = line.split(':');
      const value = valueParts.join(':').trim();

      switch (key.toLowerCase()) {
        case 'user-agent':
          currentUserAgent = value;
          if (!rules.userAgents[currentUserAgent]) {
            rules.userAgents[currentUserAgent] = {
              allow: [],
              disallow: [],
            };
          }
          break;
        case 'allow':
          rules.userAgents[currentUserAgent].allow.push(value);
          break;
        case 'disallow':
          rules.userAgents[currentUserAgent].disallow.push(value);
          break;
        case 'crawl-delay':
          rules.userAgents[currentUserAgent].crawlDelay = parseFloat(value);
          break;
        case 'sitemap':
          rules.sitemaps.push(value);
          break;
      }
    }

    return rules;
  }

  /**
   * Get rules for specific user agent
   */
  getRulesForUserAgent(
    rules: RobotsTxtRules,
    userAgent: string
  ): RobotsTxtRules['userAgents'][string] {
    // Check for exact match
    if (rules.userAgents[userAgent]) {
      return rules.userAgents[userAgent];
    }

    // Check for AI agent specific rules
    const aiAgents = ['GPTBot', 'Claude-Web', 'Anthropic-AI', 'ChatGPT-User'];
    for (const agent of aiAgents) {
      if (rules.userAgents[agent] && userAgent.includes(agent)) {
        return rules.userAgents[agent];
      }
    }

    // Fall back to wildcard
    return rules.userAgents['*'] || { allow: [], disallow: [] };
  }
}
```

## Sitemap.xml Discovery & Parsing

### Sitemap Parser

```typescript
// File: src/arw/sitemap-parser.ts

export interface SitemapURL {
  loc: string;
  lastmod?: string;
  changefreq?: string;
  priority?: number;
}

export interface Sitemap {
  type: 'urlset' | 'sitemapindex';
  urls: SitemapURL[];
  sitemaps?: string[]; // For sitemap index
}

export class SitemapParser {
  /**
   * Parse sitemap XML
   */
  async parse(content: string): Promise<Sitemap> {
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'text/xml');

    // Check if it's a sitemap index
    const sitemapIndex = doc.querySelector('sitemapindex');
    if (sitemapIndex) {
      return this.parseSitemapIndex(doc);
    }

    // Parse urlset
    return this.parseUrlset(doc);
  }

  private parseSitemapIndex(doc: Document): Sitemap {
    const sitemapElements = doc.querySelectorAll('sitemap');
    const sitemaps: string[] = [];

    sitemapElements.forEach(element => {
      const loc = element.querySelector('loc')?.textContent;
      if (loc) {
        sitemaps.push(loc);
      }
    });

    return {
      type: 'sitemapindex',
      urls: [],
      sitemaps,
    };
  }

  private parseUrlset(doc: Document): Sitemap {
    const urlElements = doc.querySelectorAll('url');
    const urls: SitemapURL[] = [];

    urlElements.forEach(element => {
      const loc = element.querySelector('loc')?.textContent;
      if (!loc) return;

      const url: SitemapURL = { loc };

      const lastmod = element.querySelector('lastmod')?.textContent;
      if (lastmod) url.lastmod = lastmod;

      const changefreq = element.querySelector('changefreq')?.textContent;
      if (changefreq) url.changefreq = changefreq;

      const priority = element.querySelector('priority')?.textContent;
      if (priority) url.priority = parseFloat(priority);

      urls.push(url);
    });

    return {
      type: 'urlset',
      urls,
    };
  }

  /**
   * Recursively fetch all URLs from sitemap index
   */
  async getAllUrls(sitemapUrl: string): Promise<SitemapURL[]> {
    const response = await fetch(sitemapUrl);
    const content = await response.text();
    const sitemap = await this.parse(content);

    if (sitemap.type === 'sitemapindex') {
      const allUrls: SitemapURL[] = [];

      for (const sitemapUrl of sitemap.sitemaps!) {
        const urls = await this.getAllUrls(sitemapUrl);
        allUrls.push(...urls);
      }

      return allUrls;
    }

    return sitemap.urls;
  }
}
```

## Machine View Generator

### Content Transformation for AI Agents

```typescript
// File: src/arw/machine-view-generator.ts

export interface MachineView {
  url: string;
  title: string;
  summary: string;
  content: string;
  sections: Section[];
  entities: Entity[];
  links: Link[];
  metadata: Metadata;
  structuredData?: any;
  tokenCount: number;
  contextOptimized: boolean;
}

export interface Section {
  id: string;
  heading: string;
  level: number;
  content: string;
  subsections: Section[];
  tokenCount: number;
}

export interface Entity {
  text: string;
  type: string; // PERSON, ORG, LOCATION, DATE, etc.
  confidence: number;
}

export class MachineViewGenerator {
  /**
   * Generate machine-optimized view of content
   */
  async generate(
    html: string,
    url: string,
    options: MachineViewOptions = {}
  ): Promise<MachineView> {
    // 1. Extract main content
    const mainContent = this.extractMainContent(html);

    // 2. Parse structure (headings, sections)
    const sections = this.parseStructure(mainContent);

    // 3. Extract entities (NER)
    const entities = await this.extractEntities(mainContent);

    // 4. Extract links with context
    const links = this.extractLinks(mainContent);

    // 5. Extract metadata
    const metadata = this.extractMetadata(html);

    // 6. Extract structured data
    const structuredData = this.extractStructuredData(html);

    // 7. Generate summary
    const summary = await this.generateSummary(mainContent);

    // 8. Optimize for context window
    const optimized = this.optimizeForContext(sections, options.maxTokens);

    // 9. Count tokens
    const tokenCount = this.countTokens(optimized.content);

    return {
      url,
      title: metadata.title || '',
      summary,
      content: optimized.content,
      sections: optimized.sections,
      entities,
      links,
      metadata,
      structuredData,
      tokenCount,
      contextOptimized: optimized.wasOptimized,
    };
  }

  /**
   * Extract main content using readability algorithm
   */
  private extractMainContent(html: string): string {
    // Use Readability.js or similar
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const article = new Readability(doc).parse();
    return article?.content || '';
  }

  /**
   * Parse hierarchical structure from HTML
   */
  private parseStructure(html: string): Section[] {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const sections: Section[] = [];

    let currentSection: Section | null = null;
    const sectionStack: Section[] = [];

    doc.querySelectorAll('h1, h2, h3, h4, h5, h6, p').forEach(element => {
      if (element.tagName.match(/^H[1-6]$/)) {
        const level = parseInt(element.tagName[1]);
        const section: Section = {
          id: this.generateId(element.textContent || ''),
          heading: element.textContent || '',
          level,
          content: '',
          subsections: [],
          tokenCount: 0,
        };

        // Pop stack until we find parent level
        while (sectionStack.length > 0 &&
               sectionStack[sectionStack.length - 1].level >= level) {
          sectionStack.pop();
        }

        // Add as subsection or root section
        if (sectionStack.length > 0) {
          sectionStack[sectionStack.length - 1].subsections.push(section);
        } else {
          sections.push(section);
        }

        sectionStack.push(section);
        currentSection = section;
      } else if (currentSection) {
        currentSection.content += element.textContent + '\n\n';
      }
    });

    // Calculate token counts
    sections.forEach(section => this.calculateTokenCounts(section));

    return sections;
  }

  /**
   * Extract named entities using NLP
   */
  private async extractEntities(html: string): Promise<Entity[]> {
    // Use NLP library (compromise, natural, or API)
    const text = this.htmlToText(html);
    const entities: Entity[] = [];

    // Simplified entity extraction (use proper NLP in production)
    const patterns = {
      PERSON: /\b([A-Z][a-z]+ [A-Z][a-z]+)\b/g,
      ORG: /\b([A-Z][a-z]+ (?:Inc|LLC|Corp|Ltd))\b/g,
      DATE: /\b(\d{1,2}\/\d{1,2}\/\d{4}|\d{4}-\d{2}-\d{2})\b/g,
    };

    for (const [type, pattern] of Object.entries(patterns)) {
      const matches = text.matchAll(pattern);
      for (const match of matches) {
        entities.push({
          text: match[1],
          type,
          confidence: 0.8, // Placeholder
        });
      }
    }

    return entities;
  }

  /**
   * Extract links with surrounding context
   */
  private extractLinks(html: string): Link[] {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const links: Link[] = [];

    doc.querySelectorAll('a[href]').forEach(element => {
      const anchor = element as HTMLAnchorElement;
      const link: Link = {
        text: anchor.textContent || '',
        url: anchor.href,
        type: this.classifyLink(anchor.href),
        context: this.getLinkContext(anchor),
      };

      links.push(link);
    });

    return links;
  }

  /**
   * Optimize content for token budget
   */
  private optimizeForContext(
    sections: Section[],
    maxTokens: number = 8000
  ): { content: string; sections: Section[]; wasOptimized: boolean } {
    let totalTokens = 0;
    sections.forEach(section => {
      totalTokens += section.tokenCount;
    });

    if (totalTokens <= maxTokens) {
      return {
        content: this.sectionsToMarkdown(sections),
        sections,
        wasOptimized: false,
      };
    }

    // Prioritize sections by importance
    const prioritized = this.prioritizeSections(sections);

    // Truncate to fit budget
    const optimized: Section[] = [];
    let currentTokens = 0;

    for (const section of prioritized) {
      if (currentTokens + section.tokenCount <= maxTokens) {
        optimized.push(section);
        currentTokens += section.tokenCount;
      } else {
        // Add summary of remaining sections
        optimized.push({
          id: 'truncated',
          heading: 'Additional Content (Truncated)',
          level: 1,
          content: `... ${prioritized.length - optimized.length} sections truncated to fit context window ...`,
          subsections: [],
          tokenCount: 50,
        });
        break;
      }
    }

    return {
      content: this.sectionsToMarkdown(optimized),
      sections: optimized,
      wasOptimized: true,
    };
  }

  /**
   * Convert sections to markdown
   */
  private sectionsToMarkdown(sections: Section[]): string {
    let markdown = '';

    const processSection = (section: Section) => {
      markdown += '#'.repeat(section.level) + ' ' + section.heading + '\n\n';
      markdown += section.content + '\n\n';
      section.subsections.forEach(processSection);
    };

    sections.forEach(processSection);
    return markdown;
  }

  /**
   * Count tokens (simplified)
   */
  private countTokens(text: string): number {
    // Rough estimate: 1 token ≈ 4 characters
    return Math.ceil(text.length / 4);
  }

  private generateId(text: string): string {
    return text.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  }

  private calculateTokenCounts(section: Section): void {
    section.tokenCount = this.countTokens(section.heading + section.content);
    section.subsections.forEach(sub => {
      this.calculateTokenCounts(sub);
      section.tokenCount += sub.tokenCount;
    });
  }

  private htmlToText(html: string): string {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || '';
  }

  private classifyLink(url: string): 'internal' | 'external' {
    // Simplified classification
    return url.startsWith('http') ? 'external' : 'internal';
  }

  private getLinkContext(anchor: HTMLAnchorElement): string {
    // Get surrounding text (50 chars before and after)
    const parent = anchor.parentElement;
    if (!parent) return '';

    const text = parent.textContent || '';
    const index = text.indexOf(anchor.textContent || '');
    const start = Math.max(0, index - 50);
    const end = Math.min(text.length, index + (anchor.textContent?.length || 0) + 50);

    return text.substring(start, end);
  }

  private prioritizeSections(sections: Section[]): Section[] {
    // Prioritize by:
    // 1. Level (H1 > H2 > H3...)
    // 2. Position (earlier = more important)
    // 3. Length (longer = more content)

    const flatSections: Section[] = [];

    const flatten = (section: Section) => {
      flatSections.push(section);
      section.subsections.forEach(flatten);
    };

    sections.forEach(flatten);

    return flatSections.sort((a, b) => {
      if (a.level !== b.level) return a.level - b.level;
      return 0; // Keep original order
    });
  }

  private extractMetadata(html: string): Metadata {
    const doc = new DOMParser().parseFromString(html, 'text/html');

    return {
      title: doc.querySelector('title')?.textContent || '',
      description: doc.querySelector('meta[name="description"]')?.getAttribute('content') || '',
      author: doc.querySelector('meta[name="author"]')?.getAttribute('content') || '',
      keywords: doc.querySelector('meta[name="keywords"]')?.getAttribute('content')?.split(',') || [],
      language: doc.documentElement.lang || 'en',
      ogImage: doc.querySelector('meta[property="og:image"]')?.getAttribute('content') || '',
    };
  }

  private extractStructuredData(html: string): any {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const scripts = doc.querySelectorAll('script[type="application/ld+json"]');

    const structured: any[] = [];
    scripts.forEach(script => {
      try {
        const data = JSON.parse(script.textContent || '');
        structured.push(data);
      } catch (e) {
        // Ignore invalid JSON
      }
    });

    return structured;
  }

  private async generateSummary(html: string): Promise<string> {
    // Use extractive summarization or call LLM API
    const text = this.htmlToText(html);
    const sentences = text.split(/[.!?]+/);

    // Simple extractive summary: first 3 sentences
    return sentences.slice(0, 3).join('. ') + '.';
  }
}

interface MachineViewOptions {
  maxTokens?: number;
  includeEntities?: boolean;
  includeStructuredData?: boolean;
  optimizeForContext?: boolean;
}

interface Link {
  text: string;
  url: string;
  type: 'internal' | 'external';
  context?: string;
}

interface Metadata {
  title: string;
  description: string;
  author: string;
  keywords: string[];
  language: string;
  ogImage: string;
}
```

## ARW Compliance Scoring

### Compliance Calculator

```typescript
// File: src/arw/compliance-scorer.ts

export interface ComplianceReport {
  score: number; // 0-1
  passed: boolean;
  checks: ComplianceCheck[];
  recommendations: string[];
}

export interface ComplianceCheck {
  name: string;
  passed: boolean;
  weight: number;
  message: string;
}

export class ARWComplianceScorer {
  /**
   * Calculate ARW compliance score
   */
  calculate(discovery: ARWDiscovery): ComplianceReport {
    const checks: ComplianceCheck[] = [];

    // 1. llms.txt presence (25% weight)
    checks.push({
      name: 'llms.txt_found',
      passed: discovery.llmsTxt?.found || false,
      weight: 0.25,
      message: discovery.llmsTxt?.found
        ? 'llms.txt found and parsed'
        : 'llms.txt not found. Add /llms.txt to help AI agents',
    });

    // 2. robots.txt presence (15% weight)
    checks.push({
      name: 'robots.txt_found',
      passed: discovery.robotsTxt?.found || false,
      weight: 0.15,
      message: discovery.robotsTxt?.found
        ? 'robots.txt found'
        : 'robots.txt not found',
    });

    // 3. Sitemap presence (20% weight)
    checks.push({
      name: 'sitemap_found',
      passed: discovery.sitemaps.length > 0,
      weight: 0.20,
      message: discovery.sitemaps.length > 0
        ? `${discovery.sitemaps.length} sitemap(s) found`
        : 'No sitemaps found. Add sitemap.xml for better discoverability',
    });

    // 4. Structured data (20% weight)
    checks.push({
      name: 'structured_data',
      passed: (discovery.structuredData?.schemaOrg?.length || 0) > 0,
      weight: 0.20,
      message: (discovery.structuredData?.schemaOrg?.length || 0) > 0
        ? 'Structured data found (Schema.org)'
        : 'Add Schema.org structured data for better content understanding',
    });

    // 5. Machine-readable URLs (10% weight)
    checks.push({
      name: 'machine_readable_urls',
      passed: (discovery.llmsTxt?.machineReadableUrls?.length || 0) > 0,
      weight: 0.10,
      message: (discovery.llmsTxt?.machineReadableUrls?.length || 0) > 0
        ? 'Machine-readable URLs specified'
        : 'Specify machine-readable URLs in llms.txt',
    });

    // 6. API endpoint (10% weight)
    checks.push({
      name: 'api_endpoint',
      passed: !!discovery.llmsTxt?.apiEndpoint,
      weight: 0.10,
      message: discovery.llmsTxt?.apiEndpoint
        ? 'API endpoint specified'
        : 'Consider adding API endpoint for programmatic access',
    });

    // Calculate weighted score
    let score = 0;
    checks.forEach(check => {
      if (check.passed) {
        score += check.weight;
      }
    });

    // Generate recommendations
    const recommendations: string[] = checks
      .filter(check => !check.passed)
      .map(check => check.message);

    return {
      score,
      passed: score >= 0.7, // 70% threshold
      checks,
      recommendations,
    };
  }
}
```

## Integration with Crawler Engine

### ARW-Aware Crawling

```typescript
// File: src/crawler/arw-crawler.ts

export class ARWCrawler {
  private llmsTxtParser: LLMsTxtParser;
  private robotsTxtParser: RobotsTxtParser;
  private sitemapParser: SitemapParser;

  /**
   * Crawl with ARW awareness
   */
  async crawl(url: string, options: CrawlOptions): Promise<CrawlResult> {
    const domain = new URL(url).hostname;

    // 1. Discover ARW resources
    const arwDiscovery = await this.discoverARW(domain);

    // 2. Apply llms.txt directives
    if (arwDiscovery.llmsTxt?.found) {
      options = this.applyLLMsTxtDirectives(options, arwDiscovery.llmsTxt);
    }

    // 3. Apply robots.txt rules
    if (arwDiscovery.robotsTxt?.found) {
      options = this.applyRobotsTxtRules(options, arwDiscovery.robotsTxt);
    }

    // 4. Use sitemap for URL discovery
    let urls: string[] = [url];
    if (options.followSitemaps && arwDiscovery.sitemaps.length > 0) {
      urls = await this.getUrlsFromSitemaps(arwDiscovery.sitemaps);
    }

    // 5. Crawl pages
    const results = await this.crawlPages(urls, options, arwDiscovery);

    return {
      urls: results,
      arwDiscovery,
      complianceScore: this.calculateCompliance(arwDiscovery),
    };
  }

  /**
   * Apply llms.txt directives to crawl options
   */
  private applyLLMsTxtDirectives(
    options: CrawlOptions,
    llmsTxt: LLMsTxtDirectives
  ): CrawlOptions {
    // Apply crawl delay
    if (llmsTxt.crawlDelay) {
      options.crawlDelay = Math.max(options.crawlDelay || 0, llmsTxt.crawlDelay);
    }

    // Apply allow/disallow patterns
    if (llmsTxt.allow.length > 0) {
      options.includePatterns = llmsTxt.allow;
    }
    if (llmsTxt.disallow.length > 0) {
      options.excludePatterns = llmsTxt.disallow;
    }

    // Apply rate limit
    if (llmsTxt.rateLimit) {
      options.rateLimit = Math.min(options.rateLimit || 100, llmsTxt.rateLimit);
    }

    return options;
  }

  /**
   * Discover all ARW resources for a domain
   */
  private async discoverARW(domain: string): Promise<ARWDiscovery> {
    const [llmsTxt, robotsTxt, sitemaps] = await Promise.all([
      this.discoverLLMsTxt(domain),
      this.discoverRobotsTxt(domain),
      this.discoverSitemaps(domain),
    ]);

    return {
      domain,
      llmsTxt,
      robotsTxt,
      sitemaps,
      discoveredAt: new Date().toISOString(),
    };
  }
}
```

## Conclusion

The ARW integration in the Web Crawler Service provides comprehensive support for discovering, parsing, and respecting Agent-Ready Web standards. This ensures that AI agents can efficiently and respectfully access machine-optimized content from websites that implement ARW standards.

**Key Benefits**:
- Automatic discovery of ARW resources
- Compliance scoring and recommendations
- Machine-optimized content generation
- Respect for website preferences
- Enhanced metadata extraction

**Next Steps**:
1. Implement ARW parsers and generators
2. Add ARW compliance testing
3. Create ARW documentation for site owners
4. Build ARW compliance dashboard

---

**Document Version**: 1.0
**Last Updated**: 2025-11-19
**Author**: System Architecture Designer
**Status**: Draft for Review
