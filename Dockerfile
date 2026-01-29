# Backend API - builds server/ from repo root (no Root Directory setting needed on Railway).
# Railway auto-uses this Dockerfile when building from the repo.
FROM node:20-slim

WORKDIR /app

# Copy server package files
COPY server/package.json server/package-lock.json ./
RUN npm ci

# Copy Prisma and generate client
COPY server/prisma ./prisma/
RUN npx prisma generate

# Copy server source and config
COPY server/tsconfig.json ./
COPY server/src ./src

# Build
RUN npm run build

RUN mkdir -p uploads/properties

EXPOSE 3002

CMD ["npm", "start"]
