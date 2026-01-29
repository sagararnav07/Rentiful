# Backend deployment – step-by-step

Your frontend is on **Vercel** (e.g. `https://rentiful-three.vercel.app`). This guide gets the backend running in production and wired to it.

---

## Backend overview

| Item | Details |
|------|--------|
| **Stack** | Node.js, Express, TypeScript, Prisma, Socket.IO |
| **Database** | PostgreSQL with **PostGIS** (for `geography(Point, 4326)`) |
| **Build** | `npm run build` → `prisma generate` + `tsc` |
| **Start** | `npm start` → `node dist/src/index.js` |
| **Uploads** | Property images stored under `server/uploads/properties/` (local disk) |
| **Real-time** | Socket.IO (WebSockets) for messaging |

**Required env vars**

| Variable | Purpose |
|----------|--------|
| `DATABASE_URL` | PostgreSQL connection string (must support PostGIS) |
| `JWT_SECRET` | Secret for signing JWTs (use a long random string) |
| `CLIENT_URL` | Frontend origin for CORS (e.g. `https://rentiful-three.vercel.app`) |
| `PORT` | Set by host (Railway/Render/Fly provide it) |
| `NODE_ENV` | `production` in prod |

**Optional**

- `JWT_EXPIRY` – e.g. `7d` (default)

---

## Step 1: Create a production database (PostgreSQL + PostGIS)

You need a **PostgreSQL** database with **PostGIS** enabled.

### Option A: Neon (simple, PostGIS add-on)

1. Go to [neon.tech](https://neon.tech) and sign up.
2. Create a project; pick a region near your backend.
3. In the project, enable **PostGIS** (Extensions → PostGIS → Enable).
4. Copy the connection string (e.g. `postgresql://user:pass@ep-xxx.region.aws.neon.tech/neondb?sslmode=require`).
5. Save it as `DATABASE_URL` for the next steps.

### Option B: Supabase

1. Go to [supabase.com](https://supabase.com) and create a project.
2. In **Settings → Database** copy the **Connection string (URI)**.
3. PostGIS is available; ensure the Prisma schema matches (you already use `extensions = [postgis]`).
4. Use this as `DATABASE_URL`.

### Option C: Railway Postgres

1. In [Railway](https://railway.app), New Project → **Provision PostgreSQL**.
2. Open the Postgres service → **Variables** (or **Connect**) and copy `DATABASE_URL`.
3. Railway Postgres supports PostGIS; enable it in the DB if required by your provider.

Use one of these as your production `DATABASE_URL` in Step 3.

---

## Step 2: Choose where to run the backend

The app needs:

- Node.js
- Persistent process (long-running server + Socket.IO)
- WebSocket support

Good options:

- **Railway** – You already have `railway.toml`; minimal config, good for this stack.
- **Render** – Free tier, WebSockets; add a Web Service.
- **Fly.io** – Global, good for WebSockets; slightly more setup.

Below, **Railway** is the main example. Steps for **Render** are summarized after.

---

## Step 3: Deploy backend on Railway

### 3.1 Create project and connect repo

1. Go to [railway.app](https://railway.app) and sign in (e.g. GitHub).
2. **New Project** → **Deploy from GitHub repo**.
3. Select the **Rentiful** repo (or the repo that contains the `server` folder).
4. When asked for the root directory, set **Root Directory** to **`server`** (so the project root is the backend).

### 3.2 Set environment variables

In the Railway project:

1. Click your **service** (the backend).
2. Open **Variables**.
3. Add:

| Name | Value |
|------|--------|
| `DATABASE_URL` | Your production Postgres URL (from Step 1) |
| `JWT_SECRET` | A long random string (e.g. `openssl rand -base64 32`) |
| `CLIENT_URL` | `https://rentiful-three.vercel.app` (or your Vercel frontend URL) |
| `NODE_ENV` | `production` |

Do **not** set `PORT`; Railway sets it automatically.

### 3.3 Configure build and start (Railway)

Your repo already has `server/railway.toml`:

- **Build:** `npm install && npm run build`
- **Start:** `npm start`

Railway will use this. If the service was created without a root directory:

- In **Settings** for the service, set **Root Directory** to **`server`**.
- Redeploy.

### 3.4 Run migrations and seed (one-time)

Railway runs `npm install && npm run build`; it does **not** run Prisma migrate or seed by default.

**Option 1 – Run locally against production DB (simplest)**

1. In `server/`, create a `.env.production` (or use a one-off env) with the same `DATABASE_URL` as in Railway.
2. From your machine:

   ```bash
   cd server
   export DATABASE_URL="your-production-database-url"
   npx prisma migrate deploy
   npx prisma db seed   # optional, if you have seed data
   ```

**Option 2 – Add a deploy script (optional)**

- Add a script in `package.json`, e.g. `"deploy:db": "prisma migrate deploy"`, and run it in Railway’s build phase or a one-off job if your plan supports it. For a first deploy, Option 1 is usually enough.

### 3.5 Get the backend URL

After deploy:

1. In Railway, open your service → **Settings** → **Networking** (or **Generate domain**).
2. Generate a public domain, e.g. `your-app.up.railway.app`.
3. Your API base URL is: **`https://your-app.up.railway.app`** (no trailing slash).

Check:

- `https://your-app.up.railway.app/health` → `{"status":"healthy",...}`
- `https://your-app.up.railway.app/` → `{"message":"Real Estate API",...}`

---

## Step 4: Point the frontend at the backend

The frontend uses `NEXT_PUBLIC_API_BASE_URL` for all API and (in your setup) Socket.IO.

1. In **Vercel**: open the **rentiful** (or frontend) project → **Settings** → **Environment Variables**.
2. Add:
   - **Name:** `NEXT_PUBLIC_API_BASE_URL`
   - **Value:** `https://your-app.up.railway.app` (Railway URL from Step 3.5)
   - **Environment:** Production (and Preview if you want).
3. Save and **redeploy** the frontend so the new value is baked in.

After redeploy, the app will call your production backend and connect to Socket.IO there.

---

## Step 5: CORS and Socket.IO

Backend already allows origins from `process.env.CLIENT_URL` and localhost. As long as:

- **Backend** `CLIENT_URL` = your real frontend URL (e.g. `https://rentiful-three.vercel.app`),
- **Frontend** `NEXT_PUBLIC_API_BASE_URL` = your backend URL,

CORS and Socket.IO should work. If you add more frontend domains (e.g. custom domain), add them to `allowedOrigins` in `server/src/index.ts` or via an env list if you later refactor.

---

## Alternative: Deploy on Render

1. [render.com](https://render.com) → **New** → **Web Service**.
2. Connect the same GitHub repo; set **Root Directory** to **`server`**.
3. **Build command:** `npm install && npm run build`
4. **Start command:** `npm start`
5. Add env vars: `DATABASE_URL`, `JWT_SECRET`, `CLIENT_URL`, `NODE_ENV=production`. Render sets `PORT`.
6. Create the service; Render will assign a URL like `https://your-service.onrender.com`.
7. Run migrations (and optional seed) locally with that `DATABASE_URL` (same as Step 3.4).
8. In Vercel, set `NEXT_PUBLIC_API_BASE_URL` to `https://your-service.onrender.com` and redeploy (same as Step 4).

---

## Uploads (property images)

Today the app writes files to `server/uploads/properties/`. On Railway/Render the filesystem is **ephemeral** – uploads can be lost on redeploy or scale.

- For a **first version**, you can still deploy; new uploads will work until the next deploy/restart.
- For **production**, plan to store images in **object storage** (e.g. AWS S3, Cloudflare R2) and save URLs in the DB; then the backend becomes stateless and survives restarts. That would be a follow-up change (multer → S3, and `photoUrls` pointing to S3 URLs).

---

## Checklist summary

1. [ ] Create PostgreSQL DB (with PostGIS) and copy `DATABASE_URL`.
2. [ ] Deploy backend (e.g. Railway) with **Root Directory** = `server`.
3. [ ] Set env vars: `DATABASE_URL`, `JWT_SECRET`, `CLIENT_URL`, `NODE_ENV=production`.
4. [ ] Run `npx prisma migrate deploy` (and optional `npx prisma db seed`) against production DB.
5. [ ] Get backend URL and test `/health` and `/`.
6. [ ] In Vercel, set `NEXT_PUBLIC_API_BASE_URL` to backend URL and redeploy frontend.
7. [ ] Test login, listings, and messaging from the live frontend.

After this, the frontend (Vercel) and backend (e.g. Railway) are deployed and connected end-to-end.
