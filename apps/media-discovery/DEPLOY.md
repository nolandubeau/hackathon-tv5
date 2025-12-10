# Deployment Guide for Media Discovery

## Problem
The app has a local workspace dependency (`@agent-ready-web/nextjs-plugin`) that breaks Docker builds when deploying from the app directory alone.

## Solution
Deploy from the **monorepo root** to include workspace packages in the Docker build context.

## Quick Deploy

### Option 1: Using Cloud Build (Recommended)
```bash
cd /path/to/hackathon-tv5
npm run deploy --workspace=apps/media-discovery
```

Or directly:
```bash
cd /path/to/hackathon-tv5
gcloud builds submit --config apps/media-discovery/cloudbuild.yaml --project agentics-foundation
```

### Option 2: Local Docker Build + Deploy
```bash
cd /path/to/hackathon-tv5
npm run deploy:docker --workspace=apps/media-discovery
```

## Manual Steps

1. **Build from monorepo root:**
```bash
cd /path/to/hackathon-tv5
docker build -t gcr.io/agentics-foundation/media-discovery -f Dockerfile.media-discovery .
```

2. **Push to GCR:**
```bash
docker push gcr.io/agentics-foundation/media-discovery
```

3. **Deploy to Cloud Run:**
```bash
gcloud run deploy media-discovery \
  --image gcr.io/agentics-foundation/media-discovery \
  --region us-central1 \
  --project agentics-foundation \
  --allow-unauthenticated
```

## Files Created/Modified

1. **`/Dockerfile.media-discovery`** - Multi-stage Dockerfile that builds from monorepo root
2. **`/apps/media-discovery/cloudbuild.yaml`** - Cloud Build configuration
3. **`/.gcloudignore`** - Excludes unnecessary files from upload
4. **`/apps/media-discovery/package.json`** - Updated deploy scripts

## Key Changes

- Dockerfile now copies workspace packages before npm install
- Build context is monorepo root (not app directory)
- Local dependency `@agent-ready-web/nextjs-plugin` is properly included
- Uses multi-stage build for optimized image size
- Standalone Next.js output for minimal runtime

## Troubleshooting

**Error: `npm ci` fails with workspace dependency**
- Ensure you're running from monorepo root
- Check that `packages/nextjs-plugin` exists

**Error: Module not found during build**
- Verify `next.config.ts` has `output: 'standalone'`
- Check that all dependencies are in `package.json`

**Error: Cloud Build timeout**
- Increase timeout: `--timeout=20m`
- Use larger machine: already set to `E2_HIGHCPU_8`
