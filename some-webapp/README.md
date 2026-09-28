# some-webapp

Next.js 15 (App Router) frontend for the SoMe posts API, replacing the original
Expo/React Native app in `some-mobileapp`.

Most of the time you want to run this through Docker Compose from the repo root
(see the [root README](../README.md)). The instructions below are for running it
directly on your host.

## Running on your host

Requires Node.js 20, and [`some-backend`](../some-backend) running.

```bash
npm install
npm run dev
```

Opens on <http://localhost:3000>.

## Configuration

| Variable | Meaning | Default |
| --- | --- | --- |
| `BACKEND_URL` | Where to reach the NestJS API | `http://localhost:3006` |

This directory has no env file and needs none - the default in
[`lib/api.ts`](lib/api.ts) already works when the backend runs on your host, and
under Docker Compose `docker-compose.yml` sets `BACKEND_URL` to
`http://backend:3006`. To point somewhere else, set it in the repo root `.env`
(see the [root README](../README.md#configuration)) or export it in your shell.

Deliberately **do not** add a `some-webapp/.env`: Next.js would inline
`BACKEND_URL` at build time, and the value Compose passes in at runtime would
stop taking effect.

## Layout

```
app/
├── layout.tsx        root layout, renders the NavBar
├── page.tsx          the feed - a server component, fetches posts directly
├── new-post/         the create form - a client component
├── settings/         placeholder
├── api/posts/        POST proxy the client form submits to
└── globals.css       Tailwind import + the shared colour tokens
components/           NavBar, Post, Button
lib/api.ts            server-side client for the backend
types/                the DTOs shared with the API
```

Fetching happens server-side in [`lib/api.ts`](lib/api.ts), so the browser never
talks to the API directly and the backend needs no CORS configuration.

Styling is Tailwind v4, configured entirely from CSS - the shared colours are
`@theme` tokens in `app/globals.css`, and there is no `tailwind.config.ts`.
