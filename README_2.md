# SoMe-nextjs – Containerized Web Application

A social media web application containerized with Docker and Docker Compose.

| Service | Technology | Port (host → container) |
|---|---|---|
| `webapp` | Next.js | `3000 → 3000` |
| `backend` | NestJS | `3001 → 3006` |
| `db` | PostgreSQL 16 (alpine) | not exposed (internal only) |

## Project structure

```
.
├── docker-compose.yml
├── .env                 # you create this (not committed)
├── some-backend/
│   └── Dockerfile
└── some-webapp/
    └── Dockerfile
```

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (includes Docker Compose)
- Ports `3000` and `3001` must be free on your machine

## Setup

Create a `.env` file in the project root with the database settings:

```
DB_NAME=<database name>
DB_USER=<database user>
DB_PASSWORD=<database password>
```

## Run the application

```bash
docker compose up --build
```

- `up` starts all containers.
- `--build` builds the backend and webapp images first.

Open the app at **http://localhost:3000**. The backend is available at http://localhost:3001.

Stop and remove the containers (data is kept):

```bash
docker compose down
```

## How it works

### Docker Compose

`docker-compose.yml` defines three services (`db`, `backend`, `webapp`) that run on one named network, `some-network`. The services reach each other by service name, for example the backend connects to the database with `DB_HOST=db`, and the webapp calls the backend at `http://backend:3006`.

The backend starts after the database, and the webapp starts after the backend (`depends_on`).

### Dockerfiles

Both images use **multi-stage builds** to keep the final image small and secure:

- **Build stage** (`node:22-alpine`): installs dependencies and builds the code.
- **Runtime stage** (`gcr.io/distroless/nodejs22-debian12:nonroot`): contains only what is needed to run the app. It has no shell or package manager, and it runs as a **non-root user**.

### Volume

The database data is stored in the named volume `pgdata`, so it survives when containers are removed.

### Resource limits

The backend is limited to 0.5 CPU and 256 MB of memory in `docker-compose.yml`.

## Testing

### Data survives `docker compose down`

1. Start the app: `docker compose up --build`
2. Create something in the app (for example a post).
3. Remove the containers: `docker compose down`
4. Start again: `docker compose up`
5. Check that the post is still there.

> **Warning:** `docker compose down -v` also deletes the volume and all data.

Inspect the volume:

```bash
docker volume ls
```

### Check that containers run as non-root

```bash
docker inspect --format '{{.Config.User}}' some-nextjs-backend
docker inspect --format '{{.Config.User}}' some-nextjs-webapp
```

The result `65532` means the container is not running as root.

### Resource usage

While the app is running:

```bash
docker stats
```

This shows live CPU and memory usage per container.

## Security scanning

See [TRIVY.md](TRIVY.md) for how to scan the images with Trivy.

## Troubleshooting

**`port is already allocated` / `address already in use`**
Another process uses the port. Find it and stop it:

```bash
lsof -i :3000
kill <PID>
```

Or change the host port (the number on the left) in `docker-compose.yml`.

**Reset everything (deletes database data)**

```bash
docker compose down -v
docker compose up --build
```
