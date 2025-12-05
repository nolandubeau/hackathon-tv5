# Agent-Ready Web

**An open standard for making websites accessible and operable to AI agents, while preserving the human web experience.**

[View the spec](https://github.com/agent-ready-web/spec) • [Reference Implementation](https://github.com/agent-ready-web/reference-nextjs)

---

## Why ARW?

### Universal Discovery

ARW provides a standardized way for AI agents to discover content, capabilities, and actions across any website—no custom integration required.

### Built for Publishers

Website owners retain complete control over what content agents can access, how it's presented, and what actions they can perform. Your SEO and human experience remain unchanged.

### Works Everywhere

Compatible with any AI agent—ChatGPT, Claude, Perplexity, Gemini—and integrates seamlessly with emerging protocols like MCP, ACP, and A2A.

---

## How It Works

**Implement the ARW specification to make your website agent-accessible**

### HTTP-Based Discovery

Add simple YAML files (`/llms.txt`) that tell agents what your site offers. Works with existing web infrastructure—no API rebuild required.

### Machine Views

Provide lightweight Markdown versions of your pages optimized for AI parsing. 60-90% fewer tokens, 10x faster processing, zero hallucination.

### Declarative Actions

Define what agents can do using standard Schema.org JSON-LD and OAuth. From product searches to support tickets to checkout flows.

---

## Who Benefits?

### For Website Operators

**Reach users through AI agents**

Agents are already browsing your site. ARW ensures they get accurate information, attribute your brand, and can complete transactions. Control what agents access and monetize agent traffic.

### For AI Companies

**Build better agent experiences**

Stop scraping HTML and guessing at structure. ARW provides clean, structured data that reduces errors, lowers costs, and enables agent actions. Legal clarity through explicit permissions.

### For Developers

**Simple implementation, powerful results**

Add `/llms.txt` in 2 hours. Create machine views in days. Enable actions in weeks. Progressive enhancement—each step adds value without breaking existing functionality.

---

## Protocol Interoperability

**ARW complements emerging agent protocols by providing universal HTTP/web discovery**

Works alongside specialized protocols:

- **Agentic Commerce Protocol (ACP)**: ARW discovers ACP endpoints; ACP handles checkout
- **Model Context Protocol (MCP)**: ARW advertises MCP servers; MCP provides data connections
- **Agent2Agent (A2A)**: ARW publishes agent cards; A2A enables collaboration

The web/HTTP layer remains the universal entry point agents use to discover specialized capabilities.

---

## Getting Started

### 1. Add Discovery

Create `/llms.txt` listing your key pages and capabilities.

### 2. Create Machine Views

Generate `.llm.md` Markdown versions of important pages.

### 3. Declare Actions

Add Schema.org JSON-LD to enable agent operations.

### 4. Monitor & Optimize

Track agent traffic and refine your implementation.

**Time to first value: 2 hours**

---

## Real-World Impact

**E-commerce example** (wireless keyboard search):

| Metric              | Traditional HTML | ARW           |
| ------------------- | ---------------- | ------------- |
| Tokens used         | 55,000           | 8,400         |
| Response time       | 30-60s           | 5-10s         |
| Accuracy            | ~70%             | ~95%          |
| Transaction support | Redirect to site | OAuth-enabled |
| Attribution         | None             | Full          |

**85% token reduction • 10x faster • 25% more accurate**

---

## Frequently Asked Questions

### Who can implement ARW?

Any website operator. ARW is open source (MIT licensed) and works with any tech stack—Next.js, WordPress, Rails, Django, static sites. Start with basic discovery and add features incrementally.

### Which AI agents support ARW?

ARW uses standard HTTP, Markdown, OAuth, and Schema.org—technologies all agents already support. As the specification matures, AI companies can add native ARW recognition for enhanced features.

### Will ARW automatically make my content appear in AI responses?

No. ARW provides the infrastructure for agents to access your content accurately. AI platforms still control which sources they use and how they present information. ARW ensures proper attribution when they do.

### Does ARW work with Agentic Commerce Protocol?

Yes. ARW and ACP are complementary. ARW's `/llms.txt` advertises ACP checkout endpoints, enabling discovery via the web layer while ACP handles standardized transaction flows.

### How do agents discover ARW-enabled sites?

Agents check for `/llms.txt` (standard HTTP), `<link rel="alternate" type="text/x-llm+markdown">` in HTML, and observability headers. AI platforms can also maintain registries of ARW-compliant sites.

### What about content policies and training?

ARW includes machine-readable policy declarations (`policy.json`) where you specify usage terms. These are advisory (like robots.txt) but provide legal foundation and accountability. Actions are technically enforced via OAuth.

---

## Built for the Agent Web

The web is transforming. After documents became applications, applications are becoming agentic interfaces.

ARW ensures websites work for both humans and agents—without choosing between them.

**Open standard • MIT licensed • Community-driven**

[Read the specification](https://github.com/agent-ready-web/spec) • [Try the reference app](https://github.com/agent-ready-web/reference-nextjs) • [Join the discussion](https://github.com/agent-ready-web/spec/discussions)

---

**Contact:** hello@arw.dev
**Community:** github.com/agent-ready-web
