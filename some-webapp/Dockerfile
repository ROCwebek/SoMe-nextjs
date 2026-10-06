# Trin 1: byg koden
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Trin 2: kør koden
FROM gcr.io/distroless/nodejs22-debian12:nonroot AS runner
WORKDIR /app
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
ENV NODE_ENV=production
EXPOSE 3000
CMD ["server.js"]