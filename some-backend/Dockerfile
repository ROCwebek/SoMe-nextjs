# Trin 1: installer og byg (Alpine, har shell og npm)
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Trin 2: kun produktions-dependencies (stadig Alpine)
FROM node:22-alpine AS prod-deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev

# Trin 3: distroless, kun filkopiering
FROM gcr.io/distroless/nodejs22-debian12:nonroot AS runner
WORKDIR /app
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY package*.json ./
EXPOSE 3006
CMD ["dist/main.js"]
