FROM node:20-alpine AS builder
WORKDIR /app

# Config de npm resiliente a redes flaky (ECONNRESET / timeouts).
RUN npm config set fetch-retries 5 \
 && npm config set fetch-retry-mintimeout 20000 \
 && npm config set fetch-retry-maxtimeout 600000 \
 && npm config set fetch-timeout 600000

COPY package.json ./
COPY package-lock.json* ./
# npm install (no ci) tolera lock desync con Node version; regenera si necesario
RUN npm install --prefer-offline --no-audit --no-fund

COPY . .
ARG NEXT_PUBLIC_API_URL=http://localhost:5001
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_JIKAN_VIA_BACKEND=true
ENV NEXT_PUBLIC_JIKAN_VIA_BACKEND=$NEXT_PUBLIC_JIKAN_VIA_BACKEND
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
EXPOSE 5000
ENV PORT=5000
CMD ["node", "server.js"]
