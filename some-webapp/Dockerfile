# Stage 1: build the Next.js app (Alpine image with Node and npm)
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: runtime image (distroless: no shell, no npm, runs as non-root)
FROM gcr.io/distroless/nodejs22-debian12:nonroot AS runner
WORKDIR /app
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
ENV NODE_ENV=production
EXPOSE 3000
CMD ["server.js"]