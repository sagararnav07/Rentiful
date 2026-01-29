# Vercel setup (Rentiful monorepo)

This project is in a **monorepo**. The Next.js app lives in the **`client`** folder.

## Deploy from CLI (rentiful project)

From the **client** folder, link to your Vercel project and deploy:

```bash
cd client
vercel link --yes --project rentiful
vercel --prod
```

Or use the script:

```bash
./deploy-vercel.sh
```

This deploys the **client** app to [rentiful](https://vercel.com/arnav-sagars-projects/rentiful). The Root Directory is not changed by the CLI; it only affects this deployment’s source (the current folder).

## Fix 404 for Git-triggered deployments (dashboard, one-time)

Root Directory **cannot** be set via CLI; it’s a project setting. So that **Git pushes** also build from `client/`:

1. **Vercel Dashboard** → [rentiful](https://vercel.com/arnav-sagars-projects/rentiful) → **Settings** → **General**
2. Under **Root Directory**, click **Edit**
3. Set to: **`client`**
4. Save
5. **Deployments** → **⋯** on latest → **Redeploy**

After that, every push to the connected repo will build from `client/` and the site will work.

## If you use the client-only repo (real-estate-frontend)

Leave **Root Directory** empty — the repo root is already the Next.js app.

---

## Still getting 404?

1. **Use the latest deployment or production URL**  
   The link `rentiful-xxxxx-arnav-sagars-projects.vercel.app` is for a **specific** deployment. If that deployment was built before Root Directory was set, it has no output → 404.  
   - Open [rentiful → Deployments](https://vercel.com/arnav-sagars-projects/rentiful/deployments), find the **top** (latest) deployment.  
   - Click **Visit** on that one, or use the **production** URL: **rentiful-three.vercel.app**.

2. **Confirm the build actually finished**  
   In that deployment’s logs, scroll to the **very end**. You should see:
   - `✓ Compiled successfully` (or similar)
   - `Build Completed in /vercel/output`
   - `Deployment completed`  
   If the build **failed** (e.g. TypeScript error), the deployment has nothing to serve → 404. Fix the error and redeploy.

3. **Root Directory**  
   Settings → General → Root Directory must be exactly **`client`** (no slash, no typo).

4. **Commit and push**  
   A `vercel.json` with `"framework": "nextjs"` was added in `client/`. Commit and push so the next Git deployment uses it.
