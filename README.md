# SoMe - a containerised multi-service web app

A small social-media style app: you read a feed of posts and write new ones.
It is built as three containers wired together by Docker Compose - a Next.js
frontend, a NestJS REST API, and a PostgreSQL database.

This repo is the submission for the **Development Environments** project,
*Containerizing a Web Application*.

## Repo layout

| Path | What it is |
| --- | --- |
| [`some-webapp/`](some-webapp) | Next.js 15 (App Router) frontend - see its [README](some-webapp/README.md) |
| [`some-backend/`](some-backend) | NestJS REST API over PostgreSQL via TypeORM - see its [README](some-backend/README.md) |
| [`docker-compose.yml`](docker-compose.yml) | Builds and wires up all three services |

## Quick start

You need Docker Desktop (or any Docker engine with the Compose plugin). Nothing
else - no Node.js install, no local PostgreSQL.

```bash
# 1. copy the env template (sets the database credentials)
cp .env.example .env

# 2. build the images and start everything
docker compose up --build
```

Then open:

- Frontend: <http://localhost:3000>
- API: <http://localhost:3006/posts>

Stop everything with:

```bash
docker compose down
```

## The services

| Service | Built from | Port | Notes |
| --- | --- | --- | --- |
| `db` | `postgres:16-alpine` | internal only | Data persists in the named volume `some_db_data` |
| `backend` | [`some-backend/Dockerfile`](some-backend/Dockerfile) | `3006` | Waits for `db` to pass its healthcheck before starting |
| `frontend` | [`some-webapp/Dockerfile`](some-webapp/Dockerfile) | `3000` | Reaches the API at `http://backend:3006` over the internal network |

The database port is deliberately **not** published to the host - only the
frontend and the API can reach it, over the private network.

## How the containerisation requirements are met

**Multi-stage builds.** Both Dockerfiles separate a `deps` stage (installs
dependencies) and a `build` stage (compiles) from a slim `runtime` stage that
copies in only the build output. The backend adds a `prod-deps` stage so that
`npm ci --omit=dev` output ships instead of the full dev toolchain; the frontend
uses Next.js `output: "standalone"`, which emits a minimal server with only the
modules it actually imports. The compilers and dev dependencies never reach the
final image.

**Rootless.** Each runtime stage ends with `USER node`, the unprivileged user
baked into `node:20-alpine`. Files copied into the image are `--chown`ed to that
user, so nothing runs as root.

**Small base images.** Every stage builds on Alpine variants.

**Named volume.** `some_db_data` is mounted at `/var/lib/postgresql/data`, so the
database survives the containers being removed and recreated.

**Named network.** All three services join `some-net`. Containers address each
other by service name (`db`, `backend`) rather than by IP.

**Resource limits.** Each service caps out at `mem_limit: 512m` and `cpus: 0.75`,
so no single container can starve the others.

**Startup ordering.** `db` has a `pg_isready` healthcheck, and `backend` uses
`depends_on: condition: service_healthy` so the API does not try to connect to a
database that is still initialising.

## Configuration

There is **one** env file, at the repo root. Copy `.env.example` to `.env` and
adjust if you want non-default values. It serves both ways of running the
project: Compose reads it automatically, and the backend reads it too when you
run that on your host instead.

| Variable | Meaning | Default |
| --- | --- | --- |
| `DB_USER` | PostgreSQL user, created on first start | `some` |
| `DB_PASS` | That user's password | `some` |
| `DB_NAME` | Database name | `some` |
| `DB_HOST` | Database host, host-mode only | `localhost` |
| `DB_PORT` | Database port, host-mode only | `5432` |
| `PORT` | Port the backend listens on | `3006` |
| `BACKEND_URL` | Where the frontend reaches the API | `http://localhost:3006` |

Under Compose, `docker-compose.yml` overrides `DB_HOST`/`DB_PORT` with `db` and
`5432` and `BACKEND_URL` with `http://backend:3006`, because inside the network
the services are reachable at their service names. Values set in
`docker-compose.yml` always win over the file, so the host-mode entries above
are simply ignored there.

The stack also starts with no `.env` at all - every value has a default.

## Verifying it works

**The volume really persists data.** Add a post through the frontend, then:

```bash
docker compose down     # removes the containers, keeps the volume
docker compose up       # no --build needed
```

The post is still in the feed. Only `docker compose down -v` (or
`docker volume rm some_db_data`) wipes the database.

**Resource usage.** With the stack running:

```bash
docker stats
```

Each container should sit well under its 512 MB / 0.75 CPU cap.

**Image sizes.** To see what the multi-stage builds saved:

```bash
docker images | grep some-nextjs
```

**The API directly.**

```bash
curl http://localhost:3006/posts
curl -X POST http://localhost:3006/posts \
  -H 'Content-Type: application/json' \
  -d '{"title":"Hello","body":"First post","author":"Oscar"}'
```

## Remote access (optional)

To demo the app running on a remote machine, forward the port over SSH rather
than exposing it publicly:

```bash
ssh -L 3000:127.0.0.1:3000 you@your-remote
```

The remote container's port 3000 then answers at <http://localhost:3000> in your
own browser.

## Troubleshooting

**Port already in use.** Something else is on 3000 or 3006. Stop it, or change
the left-hand side of the `ports` mapping in `docker-compose.yml`.

**Backend exits with a connection error.** Usually a stale volume whose
credentials no longer match `.env` - Postgres only applies `POSTGRES_USER` and
`POSTGRES_PASSWORD` when it initialises an *empty* data directory. Reset with
`docker compose down -v && docker compose up --build`.

**Frontend loads but the feed is empty and logs "Could not load posts".** The
API is not reachable. Check `docker compose ps` that `backend` is running, and
`docker compose logs backend`.

**Changes to the source do not show up.** The images are built, not
bind-mounted, so rebuild with `docker compose up --build`.

## Developing without Docker

Both services run directly on a host with Node.js 20 and a local PostgreSQL -
useful for fast iteration on one service. They use the same root `.env`. See
[`some-backend/README.md`](some-backend/README.md) and
[`some-webapp/README.md`](some-webapp/README.md).
