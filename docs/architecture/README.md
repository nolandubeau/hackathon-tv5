# TOON-ARW Integration Architecture Documentation

**Status:** PROPOSED
**Date:** 2025-11-13
**Version:** 1.0-draft

---

## Overview

This directory contains the comprehensive architectural design for integrating **TOON (Token-Oriented Object Notation)** into the **Agent-Ready Web (ARW)** specification as an optional content format.

**Key Outcome:** TOON and Markdown coexist as complementary formats, providing sites with format flexibility based on content characteristics while maintaining full backward compatibility with ARW v0.1.

---

## Documents in This Directory

### 1. [TOON-ARW-Integration-Architecture.md](./TOON-ARW-Integration-Architecture.md)

**Type:** System Architecture Design
**Audience:** System architects, technical decision-makers
**Length:** Comprehensive (~15,000 words)

**Contents:**
- **Architecture Decision Records (ADRs)** - 5 key architectural decisions with rationale
- **System Architecture Diagrams** - Component interactions, data flow
- **Format Coexistence Strategy** - When to use TOON vs Markdown
- **Content Type & MIME Type Strategy** - File extensions, headers, negotiation
- **Discovery Enhancement Design** - llms.txt schema changes, well-known endpoints
- **Chunking Strategy** - TOON object-based chunking, citation addressing
- **CLI Tool Updates** - Command specifications and architecture
- **Backward Compatibility** - Migration paths and deprecation policy
- **Specification Amendments** - High-level spec changes overview
- **Implementation Roadmap** - 10-week rollout plan

**Use this document to:**
- Understand the overall architecture
- Review architectural decisions and trade-offs
- Plan system integration
- Design implementation strategy

---

### 2. [TOON-Specification-Amendment.md](./TOON-Specification-Amendment.md)

**Type:** Formal Specification Amendment
**Audience:** Specification editors, implementers, standards reviewers
**Length:** Detailed (~10,000 words)

**Contents:**
- **Specification Changes** - Exact text amendments to ARW v0.1-draft
- **Section 3.2: Format Enhancement** - Adding TOON as machine-readable format
- **Section 3.5: ContentItem Schema** - TypeScript and YAML schema updates
- **Section 4.3: TOON Format Specification** - Complete TOON format definition
  - File format, MIME types, syntax overview
  - HTTP headers, chunking strategy, citation format
  - Schema validation, examples, discovery
- **Section 5: Chunks Enhancement** - TOON path support in chunks
- **Section 8: AI-* Headers** - New `AI-Content-Format` header
- **Implementation Guidance** - For CLI maintainers, site implementers, agent developers
- **Testing Requirements** - Validation, integration, and compatibility tests
- **Migration Timeline** - Phase-by-phase rollout schedule
- **Appendix: YAML Schema** - Complete schema definitions

**Use this document to:**
- Draft specification pull requests
- Implement ARW schema changes
- Update validation logic
- Ensure specification compliance

---

### 3. [TOON-Implementation-Guide.md](./TOON-Implementation-Guide.md)

**Type:** Practical Implementation Reference
**Audience:** Developers implementing TOON support
**Length:** Hands-on guide (~8,000 words)

**Contents:**
- **Quick Start** - 5-minute TOON setup
- **Format Selection Decision Tree** - Interactive guide for choosing formats
- **CLI Implementation Examples** - Generating, converting, validating TOON
  - `arw generate --format=toon`
  - `arw convert --to=toon`
  - `arw chunks extract`
  - `arw validate`
- **Server Configuration** - Complete examples for:
  - Nginx
  - Apache
  - Vercel
  - Netlify
- **Code Examples** - Agent implementations in:
  - JavaScript/TypeScript
  - Python
- **Testing Checklist** - Pre-deployment and post-deployment validation
- **Troubleshooting** - Common issues and solutions

**Use this document to:**
- Implement TOON support in ARW CLI
- Configure web servers for TOON
- Build TOON-capable agents
- Debug implementation issues

---

## Quick Reference

### Architecture Decision Records (ADRs)

| ADR     | Decision                              | Status   | Impact        |
|---------|---------------------------------------|----------|---------------|
| ADR-001 | TOON as Optional Format Enhancement   | PROPOSED | Non-breaking  |
| ADR-002 | `.llm.toon` Extension & MIME Types    | PROPOSED | Non-breaking  |
| ADR-003 | Discovery via `format` Field          | PROPOSED | Non-breaking  |
| ADR-004 | TOON Object-Based Chunking            | PROPOSED | Enhancement   |
| ADR-005 | Unified `arw generate --format` CLI   | PROPOSED | Non-breaking  |

All ADRs documented in: [TOON-ARW-Integration-Architecture.md](./TOON-ARW-Integration-Architecture.md#architecture-decision-records)

---

### Key Specifications

**TOON File Format:**
- **Extension:** `.llm.toon`
- **MIME Type:** `text/plain; charset=utf-8; format=toon` (PRIMARY)
- **Alternative:** `text/x-llm+toon; charset=utf-8`
- **Encoding:** UTF-8

**TOON Object Syntax:**

```toon
@objectName {
  @propertyName: "value"
  @nestedObject: {
    @subProperty: 123
  }
  @arrayProperty: ["item1", "item2"]
}
```

**Chunk Addressing:**

```yaml
chunks:
  - id: pricing
    toon_path: "@product.@pricing"
    format: toon
```

**Citation URI:**

```
https://example.com/page.llm.toon#@product.@pricing
```

---

### Schema Changes Summary

**ContentItem Enhancement:**

```typescript
export interface ContentItem {
  // Existing fields remain unchanged

  // NEW: Format-specific machine views
  machine_view_markdown?: string;
  machine_view_toon?: string;

  // NEW: Format declaration
  format?: 'markdown' | 'toon' | 'both' | 'json-ld';

  // NEW: TOON schema URL
  toon_schema?: string;
}
```

**Chunk Enhancement:**

```typescript
export interface Chunk {
  // Existing fields remain unchanged

  // NEW: TOON object path
  toon_path?: string;

  // NEW: Format specifier
  format?: 'markdown' | 'toon';
}
```

Full schema: [TOON-Specification-Amendment.md](./TOON-Specification-Amendment.md#appendix-yaml-schema)

---

### CLI Commands Summary

**Generation:**

```bash
# Generate TOON from HTML
arw generate input.html --format=toon --auto-chunks

# Generate both formats
arw generate input.html --format=both

# Recursive generation
arw generate ./content --format=toon --recursive
```

**Conversion:**

```bash
# TOON to Markdown
arw convert page.llm.toon --to=markdown

# Markdown to TOON
arw convert page.llm.md --to=toon
```

**Chunk Extraction:**

```bash
# Extract chunks from TOON
arw chunks extract page.llm.toon --deep
```

**Validation:**

```bash
# Validate TOON file
arw validate page.llm.toon --chunks --strict
```

Complete CLI reference: [TOON-Implementation-Guide.md](./TOON-Implementation-Guide.md#cli-implementation-examples)

---

## Implementation Roadmap

**Timeline:** 10 weeks to production-ready TOON support

| Phase | Duration | Deliverables | Status |
|-------|----------|--------------|--------|
| 1: Foundation | Weeks 1-2 | TOON parser, CLI foundation, schema updates | 🔵 Planned |
| 2: Chunking & Discovery | Weeks 3-4 | Chunk extraction, llms.txt integration | 🔵 Planned |
| 3: Conversion & Interop | Weeks 5-6 | Format conversion, dual format support | 🔵 Planned |
| 4: Documentation | Weeks 7-8 | Spec amendments, examples, guides | 🔵 Planned |
| 5: Validation & Rollout | Weeks 9-10 | Testing, reference sites, community rollout | 🔵 Planned |

Detailed roadmap: [TOON-ARW-Integration-Architecture.md](./TOON-ARW-Integration-Architecture.md#implementation-roadmap)

---

## Format Selection Guide

### Quick Decision Tree

```
Is content narrative/linear?
  YES → Use Markdown
  NO  → Continue

Does content have deep hierarchy (3+ levels)?
  YES → Use TOON
  NO  → Continue

Does content need precise sub-object citations?
  YES → Use TOON
  NO  → Use Markdown (default)
```

### Content Type Matrix

| Content Type         | Format      | Example                          |
|----------------------|-------------|----------------------------------|
| Blog post            | Markdown    | Narrative, paragraphs            |
| Product catalog      | **TOON**    | Hierarchical specs, pricing      |
| API reference        | **TOON**    | Endpoints, params, responses     |
| Documentation        | Markdown    | How-to guides, tutorials         |
| FAQ                  | Markdown    | Q&A pairs                        |
| Configuration schema | **TOON**    | Nested settings, types           |
| Mixed (API docs)     | **Both**    | Overview (MD) + Endpoints (TOON) |

Full decision guide: [TOON-Implementation-Guide.md](./TOON-Implementation-Guide.md#format-selection-decision-tree)

---

## Server Configuration Quick Start

### Nginx

```nginx
location ~ \.llm\.toon$ {
    types { }
    default_type "text/plain; charset=utf-8; format=toon";
    add_header AI-Content-Format "toon" always;
    add_header AI-ARW-Version "1.0" always;
}
```

### Vercel (vercel.json)

```json
{
  "headers": [
    {
      "source": "/(.*)\\.llm\\.toon",
      "headers": [
        {
          "key": "Content-Type",
          "value": "text/plain; charset=utf-8; format=toon"
        },
        {
          "key": "AI-Content-Format",
          "value": "toon"
        }
      ]
    }
  ]
}
```

Complete server configs: [TOON-Implementation-Guide.md](./TOON-Implementation-Guide.md#server-configuration)

---

## Backward Compatibility Guarantee

**Critical Commitments:**

1. ✅ **Markdown will NEVER be deprecated**
2. ✅ **All existing ARW v0.1 implementations remain valid**
3. ✅ **TOON is OPTIONAL, not required**
4. ✅ **Zero breaking changes to existing APIs**
5. ✅ **Sites can adopt TOON incrementally or not at all**

**Migration Strategies:**

- **No Change:** Continue using Markdown (fully supported)
- **Selective Adoption:** TOON for structured content, Markdown for narrative
- **Dual Format:** Provide both formats for maximum compatibility
- **TOON-First:** New sites can use TOON as primary (with Markdown fallback)

Migration details: [TOON-ARW-Integration-Architecture.md](./TOON-ARW-Integration-Architecture.md#backward-compatibility)

---

## Testing & Validation

### Pre-Deployment Checklist

**TOON File:**
- [ ] Valid TOON syntax
- [ ] `.llm.toon` extension
- [ ] UTF-8 encoding
- [ ] Proper MIME type configured

**Chunks:**
- [ ] All `toon_path` values exist
- [ ] No orphaned chunks
- [ ] Auto-generated chunks reviewed

**Server:**
- [ ] MIME type: `text/plain; charset=utf-8; format=toon`
- [ ] `AI-Content-Format: toon` header
- [ ] CORS headers allow agent access
- [ ] Content negotiation works (if dual format)

**Agent Compatibility:**
- [ ] Claude can fetch TOON
- [ ] ChatGPT can fetch TOON
- [ ] No binary data corruption

Complete checklist: [TOON-Implementation-Guide.md](./TOON-Implementation-Guide.md#testing-checklist)

---

## Key Benefits Summary

### Token Efficiency

| Format   | Typical Size | Tokens | Reduction vs HTML |
|----------|--------------|--------|-------------------|
| HTML     | 8,245 B      | 1,892  | Baseline          |
| Markdown | 1,456 B      | 342    | 81.9%             |
| **TOON** | **987 B**    | **218**| **88.5%**         |

**Chunk Precision:**
- Full file: 856 tokens
- TOON chunk (@pricing): 42 tokens
- **Reduction: 95%**

### Structural Advantages

1. **Native Chunking:** TOON objects are semantic boundaries
2. **Precise Citations:** Address specific objects via @-paths
3. **Schema Validation:** Type-safe, validated data
4. **Auto-Generation:** Chunks generated from structure
5. **Hierarchical:** Natural nesting matches content

### Developer Experience

1. **Clear Format Selection:** Decision tree guides choice
2. **Dual Format Option:** Serve both Markdown and TOON
3. **Content Negotiation:** Agents select preferred format
4. **Migration Flexibility:** Adopt incrementally
5. **No Lock-In:** Switch formats without breaking changes

---

## Next Steps

### For ARW Core Team

1. **Review:** Community review of architecture (2 weeks)
2. **Approve:** ADR approval and specification PR
3. **Implement:** Phase 1-5 rollout (10 weeks)
4. **Document:** Update main ARW specification
5. **Announce:** Community announcement and adoption drive

### For Site Implementers

1. **Evaluate:** Review format selection guide
2. **Identify:** Choose content for TOON conversion
3. **Test:** Implement TOON on 1-2 pages
4. **Validate:** Use `arw validate` extensively
5. **Monitor:** Track agent adoption and token reduction
6. **Scale:** Expand TOON usage based on data

### For Agent Developers

1. **Add TOON Support:** Implement TOON parsing in agents
2. **Update Discovery:** Support `format` field in llms.txt
3. **Implement Chunking:** Extract TOON objects via @-paths
4. **Test Compatibility:** Verify TOON fetching works
5. **Provide Feedback:** Report issues and suggestions

### For Community

1. **Review:** Read and comment on architecture
2. **Discuss:** GitHub discussions and issues
3. **Prototype:** Build TOON examples
4. **Share:** Contribute examples and use cases
5. **Adopt:** Implement on production sites

---

## Resources

### Documentation

- **Architecture:** [TOON-ARW-Integration-Architecture.md](./TOON-ARW-Integration-Architecture.md)
- **Specification:** [TOON-Specification-Amendment.md](./TOON-Specification-Amendment.md)
- **Implementation:** [TOON-Implementation-Guide.md](./TOON-Implementation-Guide.md)
- **ARW Spec:** `/spec/ARW-0.1-draft.md`

### Tools

- **ARW CLI:** `npm install -g @arw/cli`
- **TOON Parser:** (Reference implementation TBD)
- **Schema Validator:** `arw validate --schema`

### Community

- **GitHub:** https://github.com/agent-ready-web
- **Discussions:** https://github.com/agent-ready-web/discussions
- **Issues:** https://github.com/agent-ready-web/issues
- **Email:** hello@arw.dev

---

## FAQ

### Q: Will TOON replace Markdown?

**A:** No. Markdown remains fully supported indefinitely. TOON is an OPTIONAL enhancement for structured content. Sites can use Markdown-only, TOON-only, or both.

### Q: Do I need to migrate existing Markdown content to TOON?

**A:** No. Existing Markdown content continues to work. Convert to TOON only if you have structured content that benefits from hierarchical organization.

### Q: What if an agent doesn't support TOON?

**A:** Provide both formats (Markdown and TOON). Agents will use their preferred/supported format. This is the "dual format strategy."

### Q: How do I decide which format to use?

**A:** Use the [Format Selection Decision Tree](./TOON-Implementation-Guide.md#format-selection-decision-tree). Generally: narrative content → Markdown, structured data → TOON.

### Q: Is TOON ARW-specific or a general format?

**A:** TOON is a general-purpose structured data format. ARW uses it with `.llm.toon` extension and specific conventions (like @-paths for chunks).

### Q: What's the performance impact?

**A:** TOON reduces tokens by ~20-30% beyond Markdown (total 88-90% vs HTML). Chunk precision reduces context by 95% for specific citations.

### Q: How does TOON work with ARW's chunking?

**A:** TOON objects become chunks automatically. The `toon_path` field uses @-syntax to reference specific objects (e.g., `@product.@pricing`).

### Q: Can I mix TOON and Markdown on the same site?

**A:** Yes! Use TOON for structured content (products, APIs) and Markdown for narrative (blog, docs). The [Hybrid Strategy](./TOON-ARW-Integration-Architecture.md#hybrid-strategy-using-both-formats-on-one-site) explains this.

### Q: What about TOON schema validation?

**A:** Optional. Sites can declare `toon_schema` URL in llms.txt. Validate with `arw validate --schema=<url>`.

### Q: When will TOON support be available?

**A:** Proposed 10-week implementation timeline after architecture approval. See [Implementation Roadmap](./TOON-ARW-Integration-Architecture.md#implementation-roadmap).

---

## Feedback & Discussion

**This is a PROPOSED architecture.** Community input is essential.

**How to provide feedback:**

1. **GitHub Issues:** https://github.com/agent-ready-web/issues
2. **GitHub Discussions:** https://github.com/agent-ready-web/discussions
3. **Email:** hello@arw.dev
4. **Pull Requests:** Suggest specific changes via PR

**Review Period:** 2 weeks from publication

**Target Adoption:** ARW v1.0 specification

---

## Document Status

| Document                              | Status   | Last Updated | Version |
|---------------------------------------|----------|--------------|---------|
| TOON-ARW-Integration-Architecture.md  | PROPOSED | 2025-11-13   | 1.0     |
| TOON-Specification-Amendment.md       | PROPOSED | 2025-11-13   | 1.0     |
| TOON-Implementation-Guide.md          | PROPOSED | 2025-11-13   | 1.0     |

---

**Questions?** Contact hello@arw.dev

**Contribute:** https://github.com/agent-ready-web

**Learn more:** https://arw.dev

---

**End of Architecture Documentation Index**
