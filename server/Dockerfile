FROM node:18-bullseye

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY prisma ./prisma
RUN npx prisma generate

COPY tsconfig.json ./
COPY src ./src

RUN npm run build

RUN mkdir -p uploads/properties

EXPOSE 3002

CMD ["npm", "start"]