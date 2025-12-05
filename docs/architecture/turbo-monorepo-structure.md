# Turbo Monorepo Structure & Configuration Guide

**Last Updated:** 2025-11-15

## Overview

This project uses a **dual-monorepo** structure with Turbo build orchestration at both the root level and within the achromatic subdirectory.

---

## 📁 Directory Structure

```
agent-ready-web/                    # ROOT MONOREPO
├── package.json                    # Root workspace config
├── turbo.json                      # Root Turbo config
├── pnpm-workspace.yaml             # Root workspace definition (if exists)
│
├── packages/                       # Shared packages (CLI, validators, schemas)
│   ├── cli/
│   ├── validators/
│   └── @arw/schemas/
│
├── examples/                       # Example projects
│
├── platform/                     # NESTED MONOREPO
│   ├── package.json                # Achromatic workspace config
│   ├── turbo.json                  # Achromatic Turbo config
│   ├── pnpm-workspace.yaml         # Achromatic workspace definition
│   │
│   ├── apps/                       # All web applications (4 total)
│   │   ├── www/                    # Main website
│   │   ├── arw-inspector/          # Inspector tool
│   │   ├── dashboard/              # Dashboard app
│   │   └── marketing/              # Marketing site
│   │
│   ├── packages/                   # Achromatic shared packages
│   │   ├── database/
│   │   ├── auth/
│   │   ├── ui/
│   │   └── ... (17+ packages)
│   │
│   └── tooling/                    # Build tooling configs
│       ├── eslint-config/
│       ├── typescript-config/
│       └── tailwind-config/
```

---

## ⚙️ Turbo Configuration Comparison

### Root `turbo.json` - ARW Packages & Examples

**Location:** `/turbo.json`

**Purpose:** Build orchestration for ARW specification packages, CLI tools, validators, and examples

**Scope:**
- `packages/*` - CLI, validators, schemas
- `packages/@arw/*` - ARW-specific packages
- `examples/*` - Example implementations

**Configuration:**
```json
{
  "$schema": "https://turbo.build/schema.json",
  "ui": "tui",
  "globalDependencies": ["tsconfig.json", ".env"],
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "inputs": ["$TURBO_DEFAULT$", ".env*"],
      "outputs": ["dist/**", ".next/**", "!.next/cache/**", "build/**", "out/**"]
    },
    "test": {
      "dependsOn": ["^build"],
      "inputs": ["src/**", "test/**", "tests/**", "**/*.test.{ts,tsx,js,jsx}"],
      "outputs": ["coverage/**"]
    },
    "lint": {
      "dependsOn": ["^build"],
      "inputs": ["src/**", "**/*.{ts,tsx,js,jsx}"]
    },
    "typecheck": {
      "dependsOn": ["^build"],
      "inputs": ["src/**", "**/*.{ts,tsx}"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "clean": {
      "cache": false
    }
  }
}
```

**Key Features:**
- ✅ Generic build outputs for multiple project types
- ✅ Standard testing and linting tasks
- ✅ No environment variable restrictions
- ✅ Suitable for CLI tools, libraries, and examples

---

### Achromatic `turbo.json` - Web Applications

**Location:** `/platform/turbo.json`

**Purpose:** Build orchestration for production Next.js web applications with authentication and billing

**Scope:**
- `apps/*` - www, arw-inspector, dashboard, marketing (4 total)
- `packages/*` - database, auth, billing, ui, etc. (17+ packages)
- `tooling/*` - eslint-config, typescript-config, tailwind-config

**Configuration:**
```json
{
  "$schema": "https://turbo.build/schema.json",
  "ui": "tui",
  "globalEnv": [
    "AUTH_SECRET",
    "AUTH_GOOGLE_CLIENT_ID",
    "AUTH_GOOGLE_CLIENT_SECRET",
    "DATABASE_URL",
    "BILLING_STRIPE_SECRET_KEY",
    "EMAIL_RESEND_API_KEY",
    "NEXT_PUBLIC_DASHBOARD_URL",
    "NEXT_PUBLIC_MARKETING_URL"
    // ... 14+ more environment variables
  ],
  "tasks": {
    "dev": {
      "dependsOn": ["^generate"],
      "cache": false,
      "persistent": true
    },
    "build": {
      "dependsOn": ["^generate"],
      "inputs": ["$TURBO_DEFAULT$", ".env*"],
      "outputs": [".next/**", "!.next/cache/**"]
    },
    "start": {
      "cache": false,
      "persistent": true
    },
    "clean": { "cache": false },
    "check-types": { "dependsOn": ["^check-types"] },
    "format": { "dependsOn": ["^format"] },
    "format:fix": { "dependsOn": ["^format:fix"] },
    "lint": { "dependsOn": ["^lint"] },
    "typecheck": { "dependsOn": ["^typecheck"] },
    "analyze": { "dependsOn": ["^analyze"] },
    "generate": { "cache": false }
  }
}
```

**Key Features:**
- ✅ Next.js-specific build outputs (`.next/**`)
- ✅ Prisma `generate` dependency for database
- ✅ Explicit environment variable whitelist (14+ vars)
- ✅ Additional tasks: `format`, `analyze`, `check-types`
- ✅ Optimized for production web apps

---

## 🔑 Key Differences

### 1. **Environment Variables**

| Aspect | Root | Achromatic |
|--------|------|------------|
| **Strategy** | `globalDependencies: [".env"]` | `globalEnv: [list of vars]` |
| **Security** | Generic, less restrictive | Explicit whitelist (14+ vars) |
| **Use Case** | Development tools | Production apps with secrets |

**Why Different?**
- **Root:** Tools and examples don't need strict env control
- **Achromatic:** Production apps require explicit env var management for security

### 2. **Build Outputs**

| Aspect | Root | Achromatic |
|--------|------|------------|
| **Outputs** | `dist/**`, `.next/**`, `build/**`, `out/**` | `.next/**` only |
| **Flexibility** | Multiple project types | Next.js specific |

**Why Different?**
- **Root:** Supports Rust CLI, TypeScript packages, various frameworks
- **Achromatic:** All apps are Next.js (standardized)

### 3. **Task Dependencies**

| Task | Root | Achromatic |
|------|------|------------|
| **build** | `dependsOn: ["^build"]` | `dependsOn: ["^generate"]` |
| **dev** | `cache: false, persistent: true` | `dependsOn: ["^generate"]` |

**Why Different?**
- **Root:** Standard build chain
- **Achromatic:** Requires Prisma generation before builds

### 4. **Additional Tasks**

| Task | Root | Achromatic |
|------|------|------------|
| **format** | ❌ | ✅ Prettier with cache |
| **format:fix** | ❌ | ✅ Prettier auto-fix |
| **check-types** | ❌ | ✅ Separate from typecheck |
| **analyze** | ❌ | ✅ Bundle analysis |
| **generate** | ❌ | ✅ Prisma generation |

**Why Different?**
- **Achromatic:** Production apps need stricter code quality and database tooling

---

## 📊 Workspace Scopes

### Root Workspace (`package.json`)

```json
{
  "workspaces": [
    "packages/*",
    "packages/@arw/*",
    "tooling/*",
    "examples/*"
  ]
}
```

**Packages:** ~10
- `@agent-ready-web/cli` (Rust + NAPI)
- `@agent-ready-web/validators` (Python + Node)
- `@arw/schemas` (TypeScript)
- Examples and tools

---

### Achromatic Workspace (`platform/pnpm-workspace.yaml`)

```yaml
packages:
  - "apps/*"
  - "packages/*"
  - "tooling/*"
```

**Packages:** ~24
- **Apps (4):** www, arw-inspector, dashboard, marketing
- **Packages (17+):** database, auth, billing, ui, email, etc.
- **Tooling (3):** eslint-config, typescript-config, tailwind-config

---

## 🚀 Build Commands

### From Root

```bash
# Builds ALL workspaces (root + achromatic)
pnpm build

# Filters to specific workspace
pnpm --filter @agent-ready-web/cli build
pnpm --filter @arw/schemas build
```

**What Runs:**
- Root turbo.json orchestrates packages/*, examples/*
- Achromatic apps NOT included (separate workspace)

---

### From Achromatic

```bash
cd achromatic

# Builds ALL achromatic apps + packages
pnpm build

# Filters to specific app
pnpm --filter dashboard build
pnpm --filter marketing build
```

**What Runs:**
- Achromatic turbo.json orchestrates apps/*, packages/*, tooling/*
- Root packages NOT included (separate workspace)

---

## 🎯 When to Use Each

### Use Root Turbo (`pnpm build` from root)

**When building:**
- ✅ CLI tools (`@agent-ready-web/cli`)
- ✅ Validators (`@agent-ready-web/validators`)
- ✅ Schemas (`@arw/schemas`)
- ✅ Examples
- ✅ Documentation tooling

**Example:**
```bash
# From root
pnpm build                           # All root packages
pnpm --filter @agent-ready-web/cli build
```

---

### Use Achromatic Turbo (`pnpm build` from platform/)

**When building:**
- ✅ Production web apps (www, dashboard, marketing, arw-inspector)
- ✅ Shared packages (database, auth, ui)
- ✅ Development servers
- ✅ Vercel deployments

**Example:**
```bash
# From platform/
pnpm build                           # All achromatic apps + packages
pnpm --filter dashboard build        # Just dashboard
pnpm dev                             # Start all dev servers in parallel
```

---

## 📦 Package Dependencies

### Cross-Workspace Dependencies

Achromatic apps **DO NOT depend on** root packages:
- ❌ `@agent-ready-web/cli` (not used by web apps)
- ❌ `@agent-ready-web/validators` (not used by web apps)
- ❌ `@arw/schemas` (not used by web apps)

Root packages **DO NOT depend on** achromatic packages:
- ❌ `@workspace/auth` (achromatic-specific)
- ❌ `@workspace/database` (achromatic-specific)

**Why Separate?**
- Clean separation of concerns
- Independent deployment cycles
- Different versioning strategies
- Reduced bundle sizes

---

## 🔄 Deployment Strategy

### Root Packages

**Deployment:** NPM registry
- `@agent-ready-web/cli` → npm publish
- `@arw/schemas` → npm publish

---

### Achromatic Apps

**Deployment:** Vercel
- `www` → arw.dev (production)
- `arw-inspector` → inspector.arw.dev (production)
- `dashboard` → dashboard.arw.dev (production)
- `marketing` → marketing.arw.dev (production)

**Build Process:**
1. Turbo builds all dependencies
2. Next.js optimizes for production
3. Vercel deploys the `.next` output

---

## 🛠️ Development Workflow

### Working on CLI/Packages (Root)

```bash
# Install dependencies
pnpm install

# Build everything
pnpm build

# Run CLI
cd packages/cli
cargo build --release --features napi

# Test
pnpm test
```

---

### Working on Web Apps (Achromatic)

```bash
# Navigate to achromatic
cd achromatic

# Install dependencies
pnpm install

# Generate Prisma client
pnpm --filter @workspace/database generate

# Start all dev servers
pnpm dev

# Start specific app
pnpm --filter dashboard dev
```

---

## ⚡ Cache Strategy

### Root Turbo

**Cache Directory:** `.turbo/`
**Cache Scope:** Packages, examples
**Cache Invalidation:** File changes in `src/**`, `tsconfig.json`, `.env`

---

### Achromatic Turbo

**Cache Directory:** `platform/.turbo/`
**Cache Scope:** Apps, packages, tooling
**Cache Invalidation:** File changes, `.env*`, Prisma schema changes
**Cache Optimization:** `--cache-dir=.turbo` flag in package.json

**Example:**
```json
{
  "scripts": {
    "build": "turbo build --cache-dir=.turbo",
    "lint": "turbo lint --cache-dir=.turbo --continue"
  }
}
```

---

## 🎯 Best Practices

### 1. Always Run from Correct Directory

```bash
# ✅ CORRECT: Building CLI
cd /path/to/agent-ready-web
pnpm --filter @agent-ready-web/cli build

# ✅ CORRECT: Building web apps
cd /path/to/agent-ready-web/achromatic
pnpm --filter dashboard build
```

```bash
# ❌ WRONG: Trying to build achromatic from root
cd /path/to/agent-ready-web
pnpm --filter dashboard build    # Won't work! Not in root workspace
```

---

### 2. Use Filters for Specific Targets

```bash
# Build only dashboard and its dependencies
pnpm --filter dashboard build

# Build dashboard and ALL its dependencies
pnpm --filter dashboard... build

# Build everything that depends on UI package
pnpm --filter ...@workspace/ui build
```

---

### 3. Leverage Turbo Cache

```bash
# First build (cache miss)
pnpm build              # ~30s

# Second build (cache hit)
pnpm build              # ~1s ⚡

# Force rebuild (bypass cache)
pnpm build --force
```

---

### 4. Environment Variables

**Root:**
```bash
# .env at root (generic)
NODE_ENV=development
```

**Achromatic:**
```bash
# platform/.env.local (production secrets)
AUTH_SECRET=xxx
DATABASE_URL=postgresql://...
BILLING_STRIPE_SECRET_KEY=sk_test_...
```

---

## 🚨 Common Issues & Solutions

### Issue: "Package not found in workspace"

**Problem:** Trying to build achromatic app from root
```bash
cd /path/to/agent-ready-web
pnpm --filter dashboard build    # ❌ Error!
```

**Solution:** Navigate to achromatic first
```bash
cd /path/to/agent-ready-web/achromatic
pnpm --filter dashboard build    # ✅ Works!
```

---

### Issue: "Environment variable not found"

**Problem:** Using root turbo for achromatic apps
```bash
cd /path/to/agent-ready-web
pnpm build                       # Missing DATABASE_URL, AUTH_SECRET
```

**Solution:** Achromatic apps need their own env vars
```bash
cd achromatic
cp .env.example .env.local       # Add secrets
pnpm build                       # ✅ Works!
```

---

### Issue: "Prisma client not generated"

**Problem:** Building without Prisma generation
```bash
cd achromatic
pnpm --filter dashboard build    # ❌ Error: Cannot find Prisma client
```

**Solution:** Generate Prisma client first (or use turbo's dependency chain)
```bash
# Option 1: Manual generation
pnpm --filter @workspace/database generate
pnpm --filter dashboard build

# Option 2: Turbo handles it automatically
pnpm build                       # ✅ Turbo runs generate first
```

---

## 📖 Summary

| Aspect | Root Turbo | Achromatic Turbo |
|--------|-----------|------------------|
| **Purpose** | CLI, packages, examples | Production web apps |
| **Workspaces** | ~10 packages | ~24 packages |
| **Environment** | Generic `.env` | Explicit whitelist (14+ vars) |
| **Build Outputs** | Multi-format | Next.js only |
| **Dependencies** | Standard | Prisma generation |
| **Deployment** | NPM registry | Vercel |
| **Development** | CLI/library dev | Full-stack web apps |

**Key Takeaway:** Two separate monorepos with different purposes, build configurations, and deployment strategies. They do NOT depend on each other and should be built/deployed independently.

---

**Last Updated:** 2025-11-15
**Maintainer:** Agent-Ready Web Team
