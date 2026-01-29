#!/bin/bash
# Push only this client folder to real-estate-frontend GitHub repo.
# Run from the client directory: ./push-to-github.sh

set -e
cd "$(dirname "$0")"

# Initialize repo (safe if already exists)
if [ ! -d .git ]; then
  git init
  git add .
  git commit -m "first commit"
  git branch -M main
  git remote add origin https://github.com/sagararnav07/real-estate-frontend.git
  git push -u origin main
  echo "Done! Repo pushed to https://github.com/sagararnav07/real-estate-frontend"
else
  # Repo exists: remove old origin, add new origin, then push
  git remote remove origin 2>/dev/null || true
  git remote add origin https://github.com/sagararnav07/real-estate-frontend.git
  git branch -M main
  git add .
  if git diff --staged --quiet; then
    echo "No changes to commit. Pushing existing commits..."
  else
    git commit -m "Update frontend"
  fi
  git push -u origin main
  echo "Pushed to https://github.com/sagararnav07/real-estate-frontend"
fi
