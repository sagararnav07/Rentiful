#!/bin/bash
# Deploy client to Vercel project "rentiful" from the client folder.
# Run from repo root: ./client/deploy-vercel.sh
# Or from client folder: ./deploy-vercel.sh

set -e
cd "$(dirname "$0")"

# Link to rentiful project (idempotent)
vercel link --yes --project rentiful

# Deploy to production
vercel --prod

echo "Deployed to https://rentiful-three.vercel.app (or your project URL)"
echo "To fix Git-triggered builds (404), set Root Directory to 'client' once in Vercel Dashboard → Settings → General."
