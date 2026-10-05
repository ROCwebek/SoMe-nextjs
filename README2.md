# Frontend: some-webapp/Dockerfile

Frontendens Dockerfile bruger et multi-stage build.

Det betyder, at vi først bygger applikationen og derefter laver et nyt stage, som kun indeholder det, vi skal bruge for at køre den.

## Trin 1: builder

```dockerfile
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build
```

Vi starter med et Node.js Alpine-image og laver `/app` som vores working directory.

Derefter kopierer vi `package.json` og `package-lock.json` ind og kører:

```bash
npm ci
```

Det installerer projektets dependencies.

Vi kopierer package-filerne ind før resten af koden, fordi Docker cacher hvert lag. Hvis vores dependencies ikke har ændret sig, kan Docker derfor genbruge laget i stedet for at installere dem igen ved hvert build.

Derefter kopierer vi resten af koden ind og kører:

```bash
npm run build
```

Det bygger den færdige version af Next.js-applikationen.

Frontend bruger Next.js:

```text
output: "standalone"
```

Det gør, at Next.js laver en standalone-version af applikationen, som kan bruges i vores næste stage.

## Trin 2: runner

I vores runner-stage bruger vi nu et Distroless Node.js image:

```dockerfile
FROM gcr.io/distroless/nodejs22-debian12:nonroot AS runner

WORKDIR /app

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

ENV NODE_ENV=production

EXPOSE 3000

CMD ["server.js"]
```

Runner-stagen kopierer kun den færdige app fra builder-stagen.

Vi behøver derfor ikke tage hele build-miljøet med over i det endelige image.

Alpine bruges stadig til at bygge applikationen, fordi vi har brug for Node.js, `npm` og de andre værktøjer under buildet.

Når applikationen er bygget, kopierer vi kun den færdige standalone-version over i Distroless-imaget.

Multi-stage buildet hjælper derfor med at holde build og runtime adskilt, så build-værktøjerne ikke behøver at være med i det færdige image.

---

# Backend: some-backend/Dockerfile

Backend er bygget med NestJS og bruger TypeORM til at kommunikere med PostgreSQL.

NestJS-koden er skrevet i TypeScript. Når vi bygger backend, bliver TypeScript kompileret til JavaScript og lagt i `dist`-mappen.

Backend bruger også et multi-stage build.

Backend har nu tre stages:

1. `build` – bygger NestJS-applikationen
2. `prod-deps` – installerer production dependencies
3. `runner` – kører den færdige applikation med Distroless

## Trin 1: builder

```dockerfile
FROM node:22-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build
```

I build-stagen installerer vi alle dependencies.

Det inkluderer også development dependencies, som blandt andet bruges til at bygge TypeScript/NestJS-projektet.

Derefter kører vi:

```bash
npm run build
```

Den færdige JavaScript-kode bliver lagt i `dist`.

## Trin 2: production dependencies

Vi har tilføjet et ekstra stage til backend:

```dockerfile
FROM node:22-alpine AS prod-deps

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev
```

Her installerer vi kun de dependencies, der er nødvendige for at køre applikationen:

```bash
npm ci --omit=dev
```

Grunden til, at vi gør dette i et separat Alpine-stage, er, at vores Distroless-image ikke indeholder `npm`.

Vi installerer derfor production dependencies først og kopierer dem derefter over i vores runner-stage.

På den måde behøver vi ikke have development dependencies og build-værktøjer med i det færdige image.

## Trin 3: runner

Det sidste stage bruger Distroless:

```dockerfile
FROM gcr.io/distroless/nodejs22-debian12:nonroot AS runner

WORKDIR /app

COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY package*.json ./

EXPOSE 3006

CMD ["dist/main.js"]
```

Her installerer eller bygger vi ikke længere noget.

Vi kopierer i stedet:

- `node_modules` fra vores `prod-deps` stage
- den færdigbyggede `dist`-mappe fra vores `build` stage
- vores package-filer

Backend kan derefter starte den færdige JavaScript-applikation fra `dist`.

---

## Non-root user

Vores tidligere backend-container brugte:

```dockerfile
USER node
```

for at sikre, at applikationen ikke kørte som root.

I den nye løsning bruger vi i stedet:

```dockerfile
gcr.io/distroless/nodejs22-debian12:nonroot
```

`:nonroot`-versionen af Distroless er lavet til at køre processen som en non-root bruger.

Det betyder, at vi ikke længere behøver at skrive:

```dockerfile
USER node
```

i vores runner-stage.

Både frontend og backend bruger nu `:nonroot`-versionen af Distroless.

Det betyder, at begge applikationer kører uden root-rettigheder i deres runtime-container.

---

# Distroless

Vi har ændret vores runtime-images fra almindelige Node.js Alpine-images til **Distroless**.

Vi bruger:

```text
gcr.io/distroless/nodejs22-debian12:nonroot
```

Et Distroless image er lavet til kun at indeholde det, der er nødvendigt for at køre applikationen.

Det indeholder derfor ikke de samme værktøjer som et almindeligt Linux- eller Node.js-image.

Det har eksempelvis ikke:

- en shell
- `npm`
- almindelige Linux-værktøjer

Derfor bruger vi stadig Alpine-images under build-processen.

Her har vi adgang til de værktøjer, vi skal bruge til blandt andet:

```bash
npm ci
npm run build
```

Når applikationen er bygget, kopierer vi kun de nødvendige filer over i Distroless-imaget.

Frontend-flowet ser derfor sådan ud:

```text
Node Alpine
    ↓
Installer dependencies
    ↓
Byg Next.js
    ↓
Kopier standalone-versionen
    ↓
Distroless nonroot
    ↓
Kør frontend
```

Backend har et ekstra stage, fordi vi også skal bruge production dependencies:

```text
Node Alpine - build
    ↓
Byg NestJS
    ↓
Node Alpine - prod-deps
    ↓
Installer production dependencies
    ↓
Distroless nonroot
    ↓
Kør backend
```

Distroless ændrer altså ikke på, hvordan vi bygger selve applikationerne.

Det ændrer primært på det sidste stage, hvor den færdige applikation bliver kørt.
