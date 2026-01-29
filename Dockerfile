FROM node:18-bullseye

WORKDIR /app

# copy server deps
COPY server/package.json server/package-lock.json ./
RUN npm ci

# clean old prisma engines
RUN rm -rf node_modules/.prisma

# prisma
COPY server/prisma ./prisma
RUN npx prisma generate

# source
COPY server/tsconfig.json ./
COPY server/src ./src

RUN npm run build

RUN mkdir -p uploads/properties

EXPOSE 3002
CMD ["npm", "start"]

CMD npx prisma migrate deploy && npm start