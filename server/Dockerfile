# Backend API
FROM node:20-slim

# ✅ Install OpenSSL (CRITICAL)
RUN apt-get update && apt-get install -y openssl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copy Prisma schema and generate client
COPY prisma ./prisma/
RUN npx prisma generate

# Copy source
COPY tsconfig.json ./
COPY src ./src

# Build TypeScript
RUN npm run build

# Runtime dirs
RUN mkdir -p uploads/properties

EXPOSE 3002

CMD ["npm", "start"]