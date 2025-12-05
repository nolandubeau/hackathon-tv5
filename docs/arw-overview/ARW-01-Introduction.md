# Agent-Ready Web: Making Websites Native to AI

**Technical Documentation**

## Executive Summary

Agent-Ready Web (ARW) is an open specification that extends web standards to make websites natively accessible and operable to AI agents, while preserving the human web experience and existing SEO investments. As web traffic increasingly comes from AI browsers (ChatGPT, Claude, Perplexity) and autonomous agents, ARW provides the missing infrastructure layer for the agent-first web.

## The Problem: Web Standards Built for Humans, Not Agents

The modern web was designed for human consumption, with HTML optimized for visual rendering and search engine crawling. Today, a new class of users is emerging:

- **AI Browsers:** ChatGPT Atlas, Perplexity Comet, Claude for Chrome
- **Autonomous Agents:** Shopping assistants, research agents, customer service bots
- **Agent-to-Agent Commerce:** B2B automation, supply chain coordination
- **Agentic Protocols:** AI systems negotiating and transacting on behalf of users

These systems face critical challenges:

1. **Parsing overhead:** Converting HTML to semantic understanding
2. **Action discovery:** No standard way to find available operations
3. **State management:** Unclear authentication and authorization patterns
4. **Policy ambiguity:** No machine-readable usage permissions
5. **Content addressability:** Difficulty referencing specific sections

The result: AI agents scrape, guess, and hallucinate. Websites have no standardized way to declare usage terms or enforce transactional boundaries.

## What is ARW?

Agent-Ready Web is a layered specification that adds agent-native affordances to existing websites:

### Core Components

**1. Machine Views**

- Lightweight Markdown representations of HTML pages
- Optimized for LLM parsing and understanding
- Content-Type: `text/x-llm+markdown`
- Maintains semantic structure while reducing tokens

**2. Discovery Architecture**

ARW uses a **layered discovery system** built on RFC 8615 web standards:

**Primary Entrypoint (RFC 8615):**
- `/.well-known/arw-manifest.json` - Standard location for site metadata
  - Agents check here first across all ARW-enabled sites
  - Contains site capabilities, content index, actions, protocols, and policies
  - Content-Type: `application/json; charset=utf-8`

**Dual Canonical Formats:**
- `/llms.json` - JSON format (machine parsing, strict validation)
- `/llms.txt` - YAML format (human editing, comment support)
  - Content-Type: `text/plain; charset=utf-8` (for AI agent compatibility)
- Both formats are first-class citizens with identical capabilities
- Sites choose based on workflow (JSON-first or YAML-first)

**Scale Architecture (for large sites 500+ pages):**
- `/.well-known/arw-content-index.json` - Paginated content index
- `/.well-known/arw-policies.json` - Cacheable policy declarations

**Discovery Flow (3-step process):**
1. **Step 1**: Check `/.well-known/arw-manifest.json` (RFC 8615 standard)
2. **Step 2**: Fallback to `/llms.json` (preferred) or `/llms.txt`
3. **Step 3**: Check `robots.txt` for custom `arw-manifest:` hints

**Existing Web Standards Integration:**
- Standard `sitemap.xml`: For lastmod dates and changefreq
- Standard `robots.txt`: For crawl permissions and discovery hints

**3. Content Chunking**

- `data-chunk-id` attributes on HTML elements
- Addressable content segments for precise references
- Enables incremental updates and citations

**4. Declarative Actions**

- Schema.org JSON-LD for discoverable operations
- OAuth2-based authentication patterns
- Standardized error responses

**5. Observability Headers**

- `AI-Attribution`: Citation requirements
- `AI-Usage-Policy`: Policy file location
- `AI-Chunk-Map`: Content structure reference
- `AI-Rate-Limit`: Usage constraints

## What's Novel?

ARW introduces several innovations that distinguish it from existing approaches:

### 1. **Dual Rendering Architecture**

Unlike proposals to replace HTML or create parallel systems, ARW embraces the existing web:

```
Human Request → HTML + CSS + JavaScript (unchanged)
Agent Request → Markdown + AI Headers (new layer)
```

This means:

- Zero degradation of human experience
- Preserves all existing SEO investments
- No migration required for current infrastructure
- Gradual adoption path

### 2. **Semantic Action Discovery**

Current state: Agents must guess available operations from button text and form fields.

ARW state: Declarative action catalog with:

- Explicit input/output schemas
- Authentication requirements
- Rate limits and constraints
- Human-readable descriptions

```json
{
  "@type": "BuyAction",
  "target": {
    "urlTemplate": "/api/actions/add-to-cart",
    "httpMethod": "POST"
  },
  "instrument": "oauth2:user"
}
```

### 3. **Content Addressability**

Instead of referencing entire pages, agents can cite specific chunks:

```
Source: CloudCart Product Page
Chunk: product-specs
URL: cloudcart.com/products/keyboard#product-specs
```

This enables:

- Precise attribution
- Incremental content updates
- Context-aware responses
- Better cache invalidation

### 4. **Policy-First Design**

Every ARW-enabled site declares:

- What agents may/may not use for training
- Attribution requirements
- Rate limits
- Consent mechanisms

This shifts from implicit scraping to explicit permissions.

### 5. **Progressive Enhancement**

ARW works as a progressive enhancement:

- Sites remain fully functional without it
- Agents fall back to HTML parsing if ARW unavailable
- Each component can be adopted independently
- No breaking changes to existing infrastructure

## Why This Matters Now

### The Agent Web is Already Here

**Traffic Shifts:**

- OpenAI's ChatGPT: 100M+ weekly active users
- Perplexity: $500M valuation, powering search for millions
- Claude, Gemini, and dozens of specialized agents
- Estimated 20-30% of some sites' traffic from AI browsers by 2025

**Use Cases Emerging Today:**

- Shopping agents comparing products across sites
- Research agents synthesizing documentation
- Customer service bots creating tickets
- Travel agents booking complex itineraries
- Financial agents analyzing pricing

### Economic Implications

**For Businesses:**

- AI traffic is unmonetized (no ads, no tracking)
- No attribution = lost brand recognition
- No standardized policy declarations = extraction without recourse
- Rate limiting challenges without agent identification
- No enforcement mechanism for transactions

**For Users:**

- Better AI answers with structured data
- Faster task completion through direct actions
- Trust through proper attribution
- Privacy through explicit consent

### The Alternative: Chaos

Without standards like ARW, we're heading toward:

**Agent-side:**

- Every AI browser building custom scrapers
- Duplicate engineering effort across vendors
- Brittle parsers breaking with HTML changes
- Higher hallucination rates from parsing errors

**Site-side:**

- DDoS-like traffic from aggressive agents
- Lost attribution and brand equity
- Inability to monetize agent traffic
- Legal uncertainty around AI usage

## ARW in Practice: CloudCart Example

Consider an e-commerce platform implementing ARW:

### Before ARW

```
AI Agent: "Find wireless keyboards under $150"
→ Scrapes HTML, extracts prices from CSS classes
→ Guesses at stock status from button text
→ No way to add to cart programmatically
→ User must visit site manually
```

### After ARW

```
AI Agent: "Find wireless keyboards under $150"
→ Checks /.well-known/arw-manifest.json for site capabilities
→ Reads product catalog structure from manifest
→ Fetches /products/keyboard.llm.md
→ Parses structured price, specs, stock
→ Discovers "add-to-cart" action
→ User authorizes via OAuth
→ Agent adds to cart directly
→ Returns checkout URL
```

**Result:**

- 90% faster response time
- Accurate information (no hallucination)
- Proper attribution to CloudCart
- User maintains control via OAuth (technically enforced)
- Actions cannot be bypassed without user authorization
- Site can track agent-driven conversions
- Policy declarations provide legal foundation (advisory but standardized)

## Implementation Requirements

### Minimal ARW Implementation

To support basic agent access:

1. **Create discovery files** - Choose your approach:
   - **JSON-First (Recommended):** Create `/.well-known/arw-manifest.json`
   - **YAML-First:** Create `/llms.txt` and generate `/llms.json` + `/.well-known/arw-manifest.json`
2. **Add machine views** - Markdown versions of key pages
3. **Declare policy** - State your usage terms
4. **Link from HTML** - `<link rel="alternate" type="text/x-llm+markdown">`

**Effort:** 4-8 hours for a small site
**Impact:** Immediate agent discoverability

### Full ARW Implementation

For agent-operable sites:

5. **Add content chunking** - `data-chunk-id` attributes
6. **Implement actions** - OAuth + API endpoints
7. **Add observability** - `AI-*` headers
8. **Update sitemap.xml** - Ensure standard sitemap includes all machine views

**Effort:** 1-2 weeks for standard web app
**Impact:** Full agent operability

## Standards Alignment

ARW builds on existing web standards:

- **RFC 8615 (.well-known):** Primary discovery mechanism for site metadata
- **Schema.org JSON-LD:** Action declarations
- **OAuth 2.0:** Authentication
- **OpenAPI:** Action schemas
- **Markdown:** Machine views
- **HTTP Headers:** Metadata delivery
- **YAML/JSON:** Dual format support (human editing + machine parsing)
- **sitemap.xml:** Content discovery (existing standard)
- **robots.txt:** Crawl permissions and discovery hints (existing standard)

This means ARW integrates with tools developers already use while following established web architecture patterns.

## The Path Forward

### Adoption Strategy

**Phase 1: Read-Only (Current)**

- Discovery files
- Machine views
- Attribution headers
  → Enables AI-powered search and research

**Phase 2: Authenticated Read**

- OAuth implementation
- User consent flows
- Personalized responses
  → Enables user-specific AI assistance

**Phase 3: Agent Actions**

- Declarative operations
- Transaction support
- Multi-step workflows
  → Enables agentic commerce

### Ecosystem Development

ARW requires coordination across:

**Site Operators:**

- Implement specification
- Define usage policies
- Monitor agent traffic

**AI Browser Vendors:**

- Support ARW content types
- Respect policy declarations
- Attribute sources properly

**Tool Builders:**

- Validation tools
- Testing frameworks
- Analytics platforms

**Standards Bodies:**

- Refinement of specification
- Integration with existing standards
- Cross-vendor compatibility

## Comparison: ARW vs. Alternatives

| Approach          | Description                       | Limitations                    |
| ----------------- | --------------------------------- | ------------------------------ |
| **HTML Scraping** | Current state: parse HTML as-is   | Brittle, slow, error-prone     |
| **Custom APIs**   | Build agent-specific endpoints    | Not discoverable, no standards |
| **GraphQL**       | Query language for APIs           | Requires full API rebuild      |
| **RSS/Atom**      | XML feeds                         | Limited to content, no actions |
| **JSON-LD Only**  | Embed structured data             | Verbose, large payload         |
| **ARW**           | Lightweight layer on existing web | Requires adoption              |

ARW's advantage: **Progressive enhancement without replacement**

## Economic Model

### For Websites

**Costs:**

- Initial implementation: 1-2 weeks
- Maintenance: Minimal (parallel to HTML updates)

**Benefits:**

- Attribution requests in machine-readable format
- Standardized policy declarations (advisory but legally defensible)
- Technical enforcement of transactions (OAuth-gated)
- Observability and accountability (identify AI companies)
- First-mover advantage in agent ecosystem

**ROI Example:**

- E-commerce site: 10% of traffic from agents
- Proper attribution → 5% conversion increase
- $1M/month revenue → $50K additional revenue
- Implementation cost: $10-20K
- Break-even: < 1 month

### For Users

**Value:**

- Faster, more accurate AI responses
- Ability to transact through agents
- Transparency in data usage
- Technical enforcement through OAuth consent (for actions)

### For AI Companies

**Value:**

- Reduced hallucination (structured data)
- Lower operational costs (efficient parsing)
- Legal clarity (explicit permissions)
- Better user experience (actions support)

## Security Considerations

ARW includes security by design:

1. **Authentication:** OAuth 2.0 required for actions
2. **Rate Limiting:** Declared in headers and policy
3. **Audit Logging:** Track all agent operations
4. **Consent Management:** Users authorize each action
5. **Scope Limitation:** Granular permission system

## Privacy Implications

ARW improves transparency and accountability vs. current state:

**Current:** Sites cannot distinguish humans from agents
**ARW:** Explicit agent identification via observability headers → better tracking

**Current:** No standard for declaring usage terms
**ARW:** Machine-readable policy declarations (advisory but standardized)

**Current:** No user consent mechanism for agent actions
**ARW:** OAuth consent technically enforced for all actions

## Call to Action

### For Website Operators

1. **Read the specification:** github.com/agent-ready-web/spec
2. **Try the reference implementation:** Install ARW CLI
3. **Start with discovery:** Create `/.well-known/arw-manifest.json` or `/llms.txt`
4. **Join the community:** Share feedback and use cases

### For AI Companies

1. **Support ARW content types:** Recognize `text/x-llm+markdown`
2. **Respect policies:** Honor training/inference permissions
3. **Attribute sources:** Use `AI-Attribution` headers
4. **Contribute to spec:** Help refine the standard

### For Developers

1. **Build tools:** Validators, generators, analytics
2. **Create integrations:** CMS plugins, framework middleware
3. **Share patterns:** Document real-world implementations
4. **Improve spec:** Submit issues and PRs

## Conclusion

The web is undergoing its third major transformation:

1. **Static HTML (1990s):** Documents
2. **Dynamic Web Apps (2000s):** Applications
3. **Agent-Ready Web (2020s):** Agentic Interfaces

ARW provides the missing infrastructure for this transition. By making websites natively accessible to AI agents while preserving the human web, ARW enables:

- Better AI experiences for users
- Standardized policy declarations for publishers (foundation for accountability)
- Technical enforcement of transactions (OAuth-protected)
- Observability and identification of AI companies
- Legal clarity and attribution mechanisms
- A foundation for agentic commerce

The agent web is not coming—it's here. ARW ensures it works for everyone.

---

**Version:** 0.1-draft
**Status:** Editor's Draft (Work in Progress)
**License:** Apache 2.0
**Community:** github.com/agent-ready-web
**Contact:** ai@arw.dev
