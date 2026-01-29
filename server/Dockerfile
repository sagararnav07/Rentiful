# Backend API - use when Railway service Root Directory is set to "server"
FROM node:20-slim

WORKDIR /app

# Copy package files and install dependencies (including devDependencies for build)
COPY package.json package-lock.json ./
RUN npm ci

# Copy Prisma schema and generate client
COPY prisma ./prisma/
RUN npx prisma generate

# Copy source and config
COPY tsconfig.json ./
COPY src ./src

# Build TypeScript
RUN npm run build

# Create uploads dir so the app can write property images at runtime
RUN mkdir -p uploads/properties

EXPOSE 3002

CMD ["npm", "start"]
