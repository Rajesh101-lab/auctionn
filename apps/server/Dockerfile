FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json pnpm-lock.yaml tsconfig.json ./
COPY src ./src
RUN npm install -g pnpm && pnpm install --frozen-lockfile && pnpm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY package.json ./
RUN npm install -g pnpm && pnpm install --production --frozen-lockfile
EXPOSE 4000
CMD ["node", "dist/index.mjs"]