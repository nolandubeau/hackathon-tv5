# ARW Inspector - Vercel Deployment Guide

This guide explains how to deploy the ARW Inspector to Vercel.

## Prerequisites

- Vercel account (free tier works fine)
- Vercel CLI installed: `npm install -g vercel`
- Git repository with the code

## Deployment Options

### Option 1: Deploy via Vercel CLI (Recommended for testing)

From the `tools/arw-inspector` directory:

```bash
# Login to Vercel (first time only)
vercel login

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

The CLI will guide you through:
1. Setting up a new project (or linking to existing)
2. Selecting your scope/team
3. Configuring build settings (defaults from vercel.json are used)

### Option 2: Deploy via Vercel Dashboard

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your Git repository
3. Set the **Root Directory** to: `tools/arw-inspector`
4. Vercel will auto-detect the configuration from `vercel.json`
5. Click "Deploy"

### Option 3: GitHub Actions CI/CD (Recommended for production)

Create a GitHub Actions workflow for automated deployments.

#### Setup Steps

1. **Get Vercel Tokens** (from Vercel Dashboard):
   - Go to Settings → Tokens
   - Create a new token
   - Go to your project → Settings → General
   - Copy your Project ID and Org ID

2. **Add GitHub Secrets**:
   - Go to your GitHub repo → Settings → Secrets and variables → Actions
   - Add these secrets:
     - `VERCEL_TOKEN` - Your Vercel token
     - `VERCEL_ORG_ID` - Your Org ID
     - `VERCEL_PROJECT_ID_INSPECTOR` - Your Project ID for inspector

3. **Create workflow file**:

Create `.github/workflows/vercel-inspector-production.yml`:

```yaml
name: Deploy ARW Inspector to Vercel (Production)

on:
  push:
    branches:
      - main
    paths:
      - 'tools/arw-inspector/**'
      - '.github/workflows/vercel-inspector-production.yml'

env:
  VERCEL_ORG_ID: \${{ secrets.VERCEL_ORG_ID }}
  VERCEL_PROJECT_ID: \${{ secrets.VERCEL_PROJECT_ID_INSPECTOR }}

jobs:
  deploy-production:
    name: Deploy ARW Inspector to Vercel Production
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: tools/arw-inspector/package-lock.json

      - name: Install Vercel CLI
        run: npm install --global vercel@latest

      - name: Install dependencies
        working-directory: ./tools/arw-inspector
        run: npm ci

      - name: Pull Vercel Environment Information
        working-directory: ./tools/arw-inspector
        run: vercel pull --yes --environment=production --token=\${{ secrets.VERCEL_TOKEN }}

      - name: Build Project Artifacts
        working-directory: ./tools/arw-inspector
        run: vercel build --prod --token=\${{ secrets.VERCEL_TOKEN }}

      - name: Deploy Project Artifacts to Vercel
        id: deploy
        working-directory: ./tools/arw-inspector
        run: |
          url=\$(vercel deploy --prebuilt --prod --token=\${{ secrets.VERCEL_TOKEN }})
          echo "url=\$url" >> \$GITHUB_OUTPUT
          echo "### 🚀 Inspector Production Deployment" >> \$GITHUB_STEP_SUMMARY
          echo "" >> \$GITHUB_STEP_SUMMARY
          echo "**URL:** \$url" >> \$GITHUB_STEP_SUMMARY

      - name: Comment on commit
        uses: actions/github-script@v7
        with:
          script: |
            github.rest.repos.createCommitComment({
              owner: context.repo.owner,
              repo: context.repo.repo,
              commit_sha: context.sha,
              body: '🚀 ARW Inspector deployed to production: \${{ steps.deploy.outputs.url }}'
            })
```

Create `.github/workflows/vercel-inspector-preview.yml`:

```yaml
name: Deploy ARW Inspector to Vercel (Preview)

on:
  push:
    branches:
      - preview
    paths:
      - 'tools/arw-inspector/**'
      - '.github/workflows/vercel-inspector-preview.yml'

env:
  VERCEL_ORG_ID: \${{ secrets.VERCEL_ORG_ID }}
  VERCEL_PROJECT_ID: \${{ secrets.VERCEL_PROJECT_ID_INSPECTOR }}

jobs:
  deploy-preview:
    name: Deploy ARW Inspector to Vercel Preview
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: tools/arw-inspector/package-lock.json

      - name: Install Vercel CLI
        run: npm install --global vercel@latest

      - name: Install dependencies
        working-directory: ./tools/arw-inspector
        run: npm ci

      - name: Pull Vercel Environment Information
        working-directory: ./tools/arw-inspector
        run: vercel pull --yes --environment=preview --token=\${{ secrets.VERCEL_TOKEN }}

      - name: Build Project Artifacts
        working-directory: ./tools/arw-inspector
        run: vercel build --token=\${{ secrets.VERCEL_TOKEN }}

      - name: Deploy Project Artifacts to Vercel
        id: deploy
        working-directory: ./tools/arw-inspector
        run: |
          url=\$(vercel deploy --prebuilt --token=\${{ secrets.VERCEL_TOKEN }})
          echo "url=\$url" >> \$GITHUB_OUTPUT
          echo "### 🔍 Inspector Preview Deployment" >> \$GITHUB_STEP_SUMMARY
          echo "" >> \$GITHUB_STEP_SUMMARY
          echo "**URL:** \$url" >> \$GITHUB_STEP_SUMMARY

      - name: Comment on commit
        uses: actions/github-script@v7
        with:
          script: |
            github.rest.repos.createCommitComment({
              owner: context.repo.owner,
              repo: context.repo.repo,
              commit_sha: context.sha,
              body: '🔍 ARW Inspector deployed to preview: \${{ steps.deploy.outputs.url }}'
            })
```

## Build Configuration

The project uses these build settings (defined in `vercel.json` and `package.json`):

- **Build Command**: `npm run build` (runs TypeScript compilation and Vite build)
- **Output Directory**: `dist`
- **Install Command**: `npm install`
- **Dev Command**: `npm run dev`

## Environment Variables

The ARW Inspector is a static site and doesn't require environment variables.

## Post-Deployment

After deploying, you can:

1. **Set a custom domain** (optional):
   - Go to your Vercel project → Settings → Domains
   - Add your custom domain (e.g., `inspector.arw.dev`)

2. **Configure deployment protection** (optional):
   - Settings → Deployment Protection
   - Enable password protection or Vercel Authentication for previews

3. **Test the deployment**:
   - Visit your deployed URL
   - Try inspecting `https://arw.dev` to verify it works
   - Test with `http://localhost:3000` (will use CORS proxy)

## Troubleshooting

### Build Fails

If the build fails, check:
- TypeScript compilation errors: `npm run typecheck`
- Dependencies are up to date: `npm install`
- Build locally first: `npm run build`

### CORS Issues

The inspector uses a CORS proxy (`allorigins.win`) for inspecting sites without CORS headers. This is normal and expected behavior.

### Large Bundle Size

The current bundle includes:
- React and React DOM
- Syntax highlighting (Prism)
- YAML parser
- Markdown renderer

To optimize:
- Code splitting is already configured in Vite
- Tree shaking removes unused code
- Minification is enabled in production builds

## Monitoring

Monitor your deployment:
- **Vercel Dashboard**: Real-time logs, analytics, and performance metrics
- **GitHub Actions**: Build logs and deployment history
- **Vercel CLI**: `vercel logs [deployment-url]`

## Maintenance

### Update Dependencies

```bash
cd tools/arw-inspector
npm update
npm audit fix
npm run build  # Test build works
```

### Redeploy

**Via CLI:**
```bash
cd tools/arw-inspector
vercel --prod
```

**Via GitHub:**
```bash
git push origin main  # Triggers production deployment
git push origin preview  # Triggers preview deployment
```

## Comparison with Main Website

| Aspect | ARW Website (`www/`) | ARW Inspector (`tools/arw-inspector/`) |
|--------|---------------------|---------------------------------------|
| Framework | Next.js 15 (App Router) | Vite + React 18 (SPA) |
| Build | SSR + Serverless | Static SPA |
| Deployment | Separate Vercel project | Separate Vercel project |
| Domain | arw.dev | inspector.arw.dev (suggested) |
| Purpose | Marketing, documentation | Developer tool for inspection |
| Update frequency | Regular content updates | Feature updates as needed |

## Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)
- [ARW Specification](../../spec/ARW-v1.0.md)
- [GitHub Actions for Vercel](https://vercel.com/guides/how-can-i-use-github-actions-with-vercel)

---

**Part of the [Agent-Ready Web](https://arw.dev) specification**
