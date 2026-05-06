FROM node:20-alpine AS builder
WORKDIR /app

RUN npm config set fetch-retries 5 \
 && npm config set fetch-retry-mintimeout 20000 \
 && npm config set fetch-retry-maxtimeout 600000 \
 && npm config set fetch-timeout 600000

COPY package*.json ./
RUN npm ci --prefer-offline --no-audit --no-fund
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN npm config set fetch-retries 5 \
 && npm config set fetch-retry-mintimeout 20000 \
 && npm config set fetch-retry-maxtimeout 600000 \
 && npm config set fetch-timeout 600000

COPY package*.json ./
RUN npm ci --omit=dev --prefer-offline --no-audit --no-fund
COPY --from=builder /app/dist ./dist
EXPOSE 5001
CMD ["node", "dist/main.js"]
