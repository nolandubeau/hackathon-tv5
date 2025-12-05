# ARW and Emerging Agentic Protocols: A Layered Architecture

**How Agent-Ready Web Complements MCP, Agentic Commerce, and Agent2Agent**

---

## Executive Summary

The agentic web is evolving rapidly with multiple protocol initiatives:

- **Model Context Protocol (MCP)**: Anthropic's standard for agent-to-data source connections
- **Agentic Commerce Protocol (ACP)**: OpenAI + Stripe's standard for agent checkout
- **Agent2Agent (A2A)**: Google's protocol for multi-agent collaboration

**Key insight:** Agent-Ready Web (ARW) doesn't compete with these protocols—it complements them by providing HTTP-based discovery and a universal web presentation layer.

**Regardless of which agent-to-agent protocols emerge as standards, the web/HTTP surface area remains the primary entry point and irreplaceable foundation for agent discovery.**

---

## The Protocol Stack

Think of agentic systems as a layered architecture:

```
┌─────────────────────────────────────────────────┐
│  🤝 Agent-to-Agent Layer                        │
│     Specialized protocols for agent communication│
│     • A2A (multi-agent collaboration)           │
│     • MCP (persistent data connections)         │
│     • Custom enterprise protocols               │
└─────────────────────────────────────────────────┘
                     ↕
          Discovered via HTTP/Web
                     ↕
┌─────────────────────────────────────────────────┐
│  💰 Commerce & Actions Layer                    │
│     Transaction and operation protocols         │
│     • Agentic Commerce Protocol (instant checkout)│
│     • ARW Declarative Actions (OAuth-enforced)  │
│     • Payment delegation systems                │
└─────────────────────────────────────────────────┘
                     ↕
          Discovered via HTTP/Web
                     ↕
┌─────────────────────────────────────────────────┐
│  🌐 Web Presentation Layer (ARW)                │
│     Universal HTTP-based discovery and content  │
│     • Discovery files (llms.txt, sitemap.json)  │
│     • Machine views (.llm.md)                   │
│     • Observability headers                     │
│     • Policy declarations                       │
└─────────────────────────────────────────────────┘
                     ↕
┌─────────────────────────────────────────────────┐
│  📄 Traditional Web Layer                       │
│     • HTML/CSS/JavaScript (for humans)          │
│     • REST APIs                                 │
│     • GraphQL                                   │
│     • Existing infrastructure                   │
└─────────────────────────────────────────────────┘
```

**ARW sits at the web presentation layer**, making traditional HTTP surfaces agent-accessible while enabling discovery of specialized protocol endpoints.

---

## Why Multiple Protocols?

Different protocols solve different problems:

| Protocol | Primary Purpose               | Strength                                 | When to Use                                      |
| -------- | ----------------------------- | ---------------------------------------- | ------------------------------------------------ |
| **ARW**  | Web-layer agent accessibility | Universal HTTP, works everywhere         | Discovery, content, baseline actions             |
| **MCP**  | Agent-to-data connections     | Persistent connections, structured tools | Complex data queries, real-time updates          |
| **ACP**  | Agentic commerce              | Instant checkout, payment delegation     | E-commerce transactions, subscriptions           |
| **A2A**  | Multi-agent collaboration     | Agent orchestration, task delegation     | Complex workflows requiring multiple specialists |

**They're not competing—they're complementary layers solving different aspects of the agentic web.**

---

## ARW + Model Context Protocol (MCP)

### What is MCP?

Model Context Protocol (Anthropic) enables AI applications to connect to external data sources through standardized server implementations. Think of MCP as "database connectors for AI agents."

### How ARW Complements MCP

**Problem**: Agents need to discover which MCP servers exist and what they offer.

**Solution**: ARW provides HTTP-based discovery for MCP endpoints.

### Example: E-Commerce Product Catalog

**ARW Discovery** (`/llms.txt`):

```yaml
# Website advertises MCP server via standard HTTP
mcp_servers:
  - name: 'product-catalog-mcp'
    description: 'Real-time product search and inventory'
    endpoint: 'mcp://example.com/mcp/products'
    transport: 'sse'
    capabilities: ['product_search', 'inventory_check']
    schema_url: 'https://example.com/mcp/products/schema.json'
```

**Agent Discovery Flow:**

1. Agent visits `example.com/llms.txt` (standard HTTP)
2. Discovers MCP server availability
3. Fetches schema via HTTP
4. If agent supports MCP → connects to MCP server
5. If agent doesn't support MCP → falls back to ARW actions

**Key Benefit:** Web serves as universal discovery layer. MCP becomes opt-in enhancement, not requirement.

---

## ARW + Agentic Commerce Protocol (ACP)

### What is ACP?

**Agentic Commerce Protocol (ACP)** is an open standard for programmatic commerce flows between buyers, AI agents, and businesses. Developed by OpenAI and Stripe, ACP defines machine-readable HTTP APIs (OpenAPI specs) and standardized JSON schemas for checkout sessions, payment delegation, and order fulfillment.

**Specification:** <https://github.com/agentic-commerce-protocol/agentic-commerce-protocol>

**Key Components:**

- **Agentic Checkout API**: Session management (create, update, complete, cancel)
- **Delegate Payment API**: Secure payment token delegation via Stripe
- **JSON Schemas**: Precise data models for CheckoutSession, LineItems, PaymentData, Fulfillment
- **OpenAPI Specs**: Complete API contracts with validation rules

### How ARW Complements ACP

ARW and ACP solve different but synergistic problems:

| Layer         | ARW                             | ACP                          |
| ------------- | ------------------------------- | ---------------------------- |
| **Purpose**   | Discovery & product context     | Transaction execution        |
| **Format**    | YAML discovery + Markdown views | OpenAPI specs + JSON schemas |
| **Scope**     | All action types                | Commerce-specific checkout   |
| **Discovery** | `/llms.txt` (simple)            | OpenAPI (detailed)           |

**Together:** ARW discovers ACP endpoints via HTTP; ACP executes standardized checkout flows.

### Complete Purchase Flow

**Phase 1: Discovery via ARW**

```yaml
# /llms.txt - ARW advertises ACP endpoints
agentic_commerce:
  protocol: 'acp/2025-09-29'

  checkout_api:
    base_url: 'https://example.com'
    openapi_spec: 'https://example.com/acp/openapi.agentic_checkout.yaml'
    endpoints:
      create_session: '/checkout_sessions'
      complete_session: '/checkout_sessions/{id}/complete'

  payment_delegation:
    endpoint: '/agentic_commerce/delegate_payment'
    provider: 'stripe'

  schemas:
    checkout_session: 'https://example.com/acp/schema.agentic_checkout.json'
```

**Phase 2: Product Context via ARW**

```markdown
# Agent reads /products/wireless-keyboard.llm.md

**Price:** $129.99
**Stock:** In Stock (47 units)
**Specs:** Bluetooth 5.0, Cherry MX Brown, RGB backlight
**Rating:** 5.0/5 (324 reviews)
**SKU:** KB-WL-001
```

**Phase 3: ACP Checkout Session**

```
1. Agent → POST /checkout_sessions
   Header: API-Version: 2025-09-29
   Body: {items: [{id: "KB-WL-001", quantity: 1}]}

   ← CheckoutSession (status: not_ready_for_payment)
      {id: "cs_abc123", line_items: [...], totals: [...]}

2. Agent → POST /checkout_sessions/cs_abc123
   Body: {fulfillment_option_id: "ship_standard", address: {...}}

   ← CheckoutSession (status: ready_for_payment)
      {totals updated with shipping: $140.39}

3. Agent → POST /agentic_commerce/delegate_payment
   Body: {card: {...}, allowance: {amount: 14039, currency: "usd"}}

   ← {token: "tok_abc123", allowance: {...}}

4. Agent → POST /checkout_sessions/cs_abc123/complete
   Body: {payment_data: {token: "tok_abc123", provider: "stripe"}}

   ← CheckoutSession (status: completed)
      {order: {id: "CC-12345", permalink_url: "..."}}
```

**Key ACP Design Principles:**

- **Integer amounts**: All monetary values in minor units (cents)
- **Authoritative state**: Every response returns complete cart state
- **Idempotency**: Create/complete operations support idempotency keys
- **Versioned API**: Clients must send `API-Version: 2025-09-29` header

**Workflow Summary:**

1. **ARW**: Product discovery and detailed specifications (web layer)
2. **ACP**: Checkout session initialization (state machine begins)
3. **ACP**: Fulfillment selection (shipping options)
4. **ACP**: Payment delegation (Stripe tokenization)
5. **ACP**: Complete checkout (order creation)
6. **ARW**: Order confirmation details (attribution maintained)

**Key Benefit:** ARW provides discovery and product context; ACP provides standardized transaction spec. No schema invention required—ARW references ACP.

---

## ARW + Agent2Agent Protocol (A2A)

### What is A2A?

Agent2Agent (Google) enables AI agents from different vendors to collaborate and delegate tasks across enterprise systems.

### How ARW Complements A2A

**Problem**: Agents need to discover what specialized agents are available and what capabilities they offer.

**Solution**: ARW advertises A2A "Agent Cards" via standard HTTP.

### Example: Multi-Agent Shopping Workflow

**ARW Discovery** (`/llms.txt`):

```yaml
a2a_agents:
  - name: 'product-research-agent'
    description: 'Specialized product comparison agent'
    agent_card_url: 'https://example.com/a2a/agents/product-research.json'
    endpoint: 'https://example.com/a2a/agents/product-research'
    protocol: 'a2a/v1'

  - name: 'order-management-agent'
    description: 'Handles order creation and tracking'
    agent_card_url: 'https://example.com/a2a/agents/order-mgmt.json'
    endpoint: 'https://example.com/a2a/agents/order-mgmt'
    protocol: 'a2a/v1'
```

**Multi-Agent Workflow:**

```
User's Agent (ChatGPT)
  ↓ Discovers via ARW
  ├─> Product Research Agent (A2A)
  │     ↓ Accesses data via ARW machine views
  │     ↓ Returns product recommendations
  │
  └─> Order Management Agent (A2A)
        ↓ Creates order
        ↓ Returns tracking info
```

**Collaboration Pattern:**

1. **ARW**: Entry point for discovery
2. **A2A**: Task delegation between agents
3. **ARW**: Data access for A2A agents (machine views)
4. **A2A**: Result aggregation
5. **ARW**: Final attribution to website

**Key Benefit:** ARW provides discovery and data layer; A2A enables sophisticated multi-agent orchestration.

---

## The Unified Discovery Pattern

The power of ARW is that **a single `/llms.txt` file advertises all agent interfaces**:

```yaml
version: 0.1
site:
  title: 'My E-Commerce Site'
  description: 'Electronics and accessories'

# Traditional ARW content (universal)
content:
  - url: /products/keyboard
    machine_view: /products/keyboard.llm.md
    priority: high

# ARW actions (OAuth-enforced)
actions:
  - id: add_to_cart
    endpoint: /api/actions/add-to-cart
    method: POST
    auth: oauth2

# MCP servers (persistent connections)
mcp_servers:
  - name: 'product-catalog'
    endpoint: 'mcp://example.com/mcp/products'
    transport: 'sse'

# Agentic Commerce (instant checkout)
agentic_commerce:
  protocol: 'acp/v1'
  checkout_endpoint: '/acp/checkout'
  product_feed: '/acp/products.json'

# A2A agents (multi-agent collaboration)
a2a_agents:
  - name: 'product-research-agent'
    agent_card_url: '/a2a/agents/product-research.json'
    endpoint: '/a2a/agents/product-research'

# Policies (apply to all protocols)
policies:
  allow_training: false
  allow_inference: true
  require_attribution: true
```

**Agent Decision Flow:**

1. Agent fetches `/llms.txt`
2. Sees all available capabilities
3. Chooses best protocol based on:
   - Agent's own capabilities
   - Task requirements
   - Latency needs
   - Security requirements

**Result:** Progressive enhancement. Advanced agents use specialized protocols; basic agents use HTTP/ARW.

---

## Why the Web Layer Remains Irreplaceable

Even with emerging protocols, the HTTP/web surface is critical:

### 1. Universal Entry Point

**Every AI agent can make HTTP requests.**

- Not all support MCP
- Not all support ACP
- Not all support A2A

HTTP/web is the **lowest common denominator** that works universally.

### 2. Human-Agent Parity

**Same URLs serve humans and agents:**

```
example.com/products/keyboard
  → Human browser → HTML
  → AI agent → Markdown (.llm.md)
```

- SEO benefits remain
- Brand presence maintained
- No parallel infrastructure

### 3. Discovery Foundation

**Even protocol-specific agents start somewhere.**

How does an agent discover:

- Which MCP servers exist?
- Which merchants support ACP?
- Which A2A agents are available?

**Answer: HTTP-based discovery via ARW.**

The web remains the phonebook for the agentic ecosystem.

### 4. Gradual Adoption

Organizations can adopt incrementally:

**Week 1:** Add ARW (`/llms.txt`, machine views)
**Month 1:** Add OAuth actions
**Month 2:** Advertise MCP server (if applicable)
**Month 3:** Add ACP support (if e-commerce)
**Month 4:** Deploy A2A agents (if complex workflows)

**No breaking changes. Each step adds value.**

### 5. Fallback and Resilience

**If specialized protocol fails → fall back to HTTP:**

- MCP server down? → Use ARW actions
- ACP checkout error? → Redirect to web checkout
- A2A agent unavailable? → Direct HTTP actions

ARW ensures baseline functionality always works.

### 6. Observability and Control

**HTTP headers provide governance:**

```
AI-Usage-Policy: /policy.json
AI-Attribution: required; link=https://example.com
AI-Rate-Limit: 100/hour
```

Works across all protocols. Standard web security model applies.

---

## Real-World Scenarios

### Scenario 1: Simple Product Lookup

**User Query:** "What are the specs of wireless keyboard KB-001?"

**Solution:** ARW machine views (direct HTTP)

- Fast (single request)
- Simple (no protocol negotiation)
- Universal (works for all agents)

**No specialized protocol needed.**

---

### Scenario 2: Real-Time Inventory Check

**User Query:** "How many KB-001 units are available right now?"

**Options:**

1. **MCP** (if agent supports): Persistent connection, real-time updates
2. **ARW action** (fallback): HTTP GET request
3. **Machine view** (cached): May be slightly stale

**Best:** MCP (if available), ARW action (otherwise)
**ARW role:** Discovery of both options

---

### Scenario 3: Purchase with Instant Checkout

**User Query:** "Buy KB-001 keyboard"

**Flow:**

1. **ARW discovery:** Find product, check ACP support
2. **ARW machine view:** Get current price/stock
3. **ACP checkout:** Instant purchase via Stripe delegation
4. **ARW attribution:** Website credited for sale

**Hybrid approach:** ARW for discovery, ACP for transaction.

---

### Scenario 4: Complex Multi-Product Research

**User Query:** "Compare keyboards under $150, recommend best for programming"

**Flow:**

1. **ARW discovery:** Find A2A product research agent
2. **A2A delegation:** User's agent → research agent
3. **Research agent** accesses:
   - ARW machine views (product data)
   - MCP server (real-time inventory)
4. **A2A response:** Structured comparison
5. **ARW attribution:** All products attributed to website

**Multi-protocol:** A2A orchestration + ARW data + MCP queries.

---

## Implementation Guidance

### For Website Operators

**Start with ARW foundation:**

```yaml
# Week 1: Basic ARW
content:
  - url: /products/keyboard
    machine_view: /products/keyboard.llm.md

actions:
  - id: check_stock
    endpoint: /api/actions/check-stock
    method: GET
    auth: none
```

**Add protocols as needed:**

```yaml
# Month 2: Add MCP for real-time data
mcp_servers:
  - name: 'inventory-mcp'
    endpoint: 'mcp://example.com/mcp/inventory'

# Month 3: Add ACP for instant checkout
agentic_commerce:
  protocol: 'acp/v1'
  checkout_endpoint: '/acp/checkout'

# Month 4: Add A2A for complex workflows
a2a_agents:
  - name: 'product-advisor'
    endpoint: '/a2a/agents/product-advisor'
```

**Key principle:** Each addition is opt-in, non-breaking, and provides incremental value.

---

### For AI Agent Developers

**Read `/llms.txt` first:**

```python
# Agent startup
response = requests.get("https://example.com/llms.txt")
capabilities = parse_yaml(response.text)

# Check what's available
has_mcp = "mcp_servers" in capabilities
has_acp = "agentic_commerce" in capabilities
has_a2a = "a2a_agents" in capabilities

# Choose best approach
if complex_workflow and has_a2a:
    use_a2a_delegation()
elif instant_checkout_needed and has_acp:
    use_acp_checkout()
elif realtime_data_needed and has_mcp:
    connect_to_mcp()
else:
    use_arw_actions()  # Always available
```

**Fallback chain:** A2A → MCP → ACP → ARW → basic HTTP

---

## The Future: Protocol Convergence

We're early in the agentic web era. Protocols will evolve:

**Likely outcomes:**

1. **Consolidation:** Some protocols merge or become extensions of others
2. **Specialization:** Different protocols dominate different domains
3. **Standardization:** W3C or similar bodies formalize specifications

**ARW's role regardless of outcome:**

- Universal HTTP-based discovery
- Baseline functionality that always works
- Bridge between human web and agentic protocols

**The web layer is future-proof because it's the foundation all protocols build upon.**

---

## Key Takeaways

### For Publishers

- **Start with ARW** (universal HTTP layer)
- **Add specialized protocols** as they mature and fit your use case
- **Single discovery file** (`/llms.txt`) advertises all capabilities
- **No breaking changes** - each protocol is opt-in enhancement

### For AI Companies

- **ARW provides discovery** for all protocol types
- **HTTP/web remains universal entry point**
- **Support multiple protocols** for optimal user experience
- **Fall back to ARW** when specialized protocols unavailable

### For Developers

- **ARW doesn't compete** with MCP, ACP, or A2A
- **They're complementary layers** solving different problems
- **Web surface area remains critical** regardless of protocol evolution
- **Progressive adoption** allows gradual implementation

---

## Conclusion

The emergence of MCP, Agentic Commerce Protocol, and Agent2Agent represents exciting progress in the agentic web. Each protocol solves specific problems and enables new capabilities.

**ARW doesn't replace these protocols—it makes them discoverable and accessible through the universal HTTP/web layer.**

Think of it as layers in a stack:

- **A2A/MCP/ACP** = Specialized tools for specific jobs
- **ARW** = Universal language for discovery and baseline functionality
- **HTTP/Web** = Foundation everything builds upon

**The web's presentation layer remains irreplaceable** as the entry point, discovery mechanism, and fallback for the agentic ecosystem.

By implementing ARW, websites ensure they're ready for **any** agentic protocol that emerges—current or future.

---

**Version:** 0.1-draft
**Date:** January 2025
**License:** Apache 2.0
**Related Documents:**

- ARW Specification v0.1-draft (spec/ARW-0.1-draft.md)
- ARW Overview and Benefits (docs/arw-overview/ARW-Overview-and-Benefits.md)
- ARW vs llms.txt Comparison (docs/arw-overview/ARW-vs-llmstxt-Comparison.md)
- ARW Discovery Architecture (docs/arw-overview/ARW-Discovery-Architecture.md)

**Contact:** ai@arw.dev
**Community:** github.com/agent-ready-web
