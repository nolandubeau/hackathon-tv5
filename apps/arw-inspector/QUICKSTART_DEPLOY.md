# ARW Inspector - Quick Deploy to Vercel

## 🚀 Deploy in 2 Minutes

### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

### Step 2: Navigate to Inspector Directory

```bash
cd tools/arw-inspector
```

### Step 3: Deploy

```bash
# Login to Vercel (first time only)
vercel login

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

That's it! Vercel will provide you with a URL.

## 📋 What You'll Be Asked

When you run `vercel` for the first time:

1. **Set up and deploy?** → Yes
2. **Which scope?** → Select your personal account or team
3. **Link to existing project?** → No (first time) or Yes (if project exists)
4. **What's your project's name?** → `arw-inspector` (or your choice)
5. **In which directory is your code located?** → `./` (it's already in the right directory)

Vercel will auto-detect the configuration from `vercel.json`.

## 🔗 Suggested Domain Setup

After deploying, you can set up a custom domain:

1. Go to your project in Vercel Dashboard
2. Settings → Domains
3. Add domain: `inspector.arw.dev` (or your preferred subdomain)

## 🔄 Update Deployment

To redeploy after making changes:

```bash
cd tools/arw-inspector
vercel --prod
```

## 🤖 Automated Deployments (GitHub Actions)

For automatic deployments on git push:

1. **Get Vercel tokens** from Vercel Dashboard:
   - Settings → Tokens → Create new token
   - Project → Settings → General → Copy Project ID and Org ID

2. **Add GitHub Secrets**:
   - Go to GitHub repo → Settings → Secrets → Actions
   - Add:
     - `VERCEL_TOKEN`
     - `VERCEL_ORG_ID`
     - `VERCEL_PROJECT_ID_INSPECTOR`

3. **Workflows are already created**:
   - `.github/workflows/vercel-inspector-production.yml`
   - `.github/workflows/vercel-inspector-preview.yml`

4. **Deploy automatically**:
   - Push to `main` → Production deployment
   - Push to `preview` → Preview deployment

## ✅ Verify Deployment

After deploying, test your URL:

1. Visit your deployment URL
2. Enter `https://arw.dev` in the inspector
3. Click "Inspect URL"
4. Verify all tabs show data correctly

## 💡 Tips

- **Build locally first**: Run `npm run build` to catch errors before deploying
- **Use preview deployments**: Test with `vercel` before doing `vercel --prod`
- **Monitor deployments**: Check Vercel Dashboard for logs and analytics
- **Enable Analytics**: Vercel provides free analytics for your deployments

## 🐛 Troubleshooting

### Build fails on Vercel

```bash
# Test build locally
npm run build

# Check TypeScript
npm run typecheck
```

### CORS issues in production

This is expected and normal. The inspector uses a CORS proxy (allorigins.win) to inspect sites without CORS headers.

### Wrong directory detected

If Vercel detects the wrong directory, use:

```bash
vercel --cwd tools/arw-inspector
```

Or set up Vercel project with root directory pointing to `tools/arw-inspector`.

---

**Full deployment documentation**: See [DEPLOYMENT.md](./DEPLOYMENT.md)
