# SoMe-nextjs – Containerized Web Application

SoMe-nextjs is a small social media web application where users can create posts. It consists of a Next.js webapp, a NestJS backend and a PostgreSQL database.
This project containerizes the application with Docker and manages the three services together with Docker Compose.

| Service   | Technology    | Image                                         | Host port → container port |
| --------- | ------------- | --------------------------------------------- | -------------------------- |
| `webapp`  | Next.js       | built from `some-webapp/Dockerfile`           | `3000 → 3000`              |
| `backend` | NestJS        | built from `some-backend/Dockerfile`          | `3001 → 3006`              |
| `db`      | PostgreSQL 16 | `postgres:16-alpine` (pulled from Docker Hub) | not published              |

## Architecture

```
Browser ──► localhost:3000 ──► webapp ──► backend:3006 ──► db:5432
                               (Next.js)   (NestJS)        (PostgreSQL)
                                                              │
                                                       volume: pgdata
        all three containers are on the network: some-network
```

- The browser only talks to the webapp on port 3000.
- Containers talk to each other on the Docker network `some-network`, using the service name as the address (e.g. `db`, `backend`).
- Database data is stored in the named volume `pgdata`.

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (includes Docker Compose)
- Ports `3000` and `3001` must be free on your machine
- A local `.env` file (see below). No real credentials are stored in the repository.

## Running and stopping

```bash
git clone https://github.com/ROCwebek/SoMe-nextjs.git
cd SoMe-nextjs
cp .env.example .env     # then edit the values in .env
docker compose up --build
docker compose ps        # check that all three services are running
```

Open **http://localhost:3000**.

Stop and remove the containers and the network (the data is kept):

```bash
docker compose down
```

> **Delete the volume.**
> `docker compose down -v` deletes the `pgdata` volume and all database data. Only use `-v` if you want to start over with an empty database.

### `.env` file

`.env.example` shows which variables are needed:

```
DB_NAME=
DB_USER=
DB_PASSWORD=
DB_HOST=
DB_PORT=
```

## Docker configuration

| File                      | Role                                                                           |
| ------------------------- | ------------------------------------------------------------------------------ |
| `docker-compose.yml`      | Defines the three services, the network `some-network` and the volume `pgdata` |
| `some-backend/Dockerfile` | Builds the NestJS backend image (3 stages)                                     |
| `some-webapp/Dockerfile`  | Builds the Next.js webapp image (2 stages)                                     |

Key settings in `docker-compose.yml`:

- `build:` on `backend` and `webapp` builds an image from the Dockerfile in that folder. `db` uses a ready-made image.
- `env_file:` passes configuration into the containers.
- `depends_on:` controls start order: `db` → `backend` → `webapp`.
- `deploy.resources.limits` limits the backend to 0.5 CPU and 256 MB memory.

Dockerfile stages:

- **Backend:** `build` (compiles the code) → `prod-deps` (production dependencies only) → `runner` (distroless, copies in `node_modules` and `dist`).
- **Webapp:** `builder` (builds Next.js in standalone mode) → `runner` (distroless, copies in the standalone output).

To see the final configuration with all variables filled in:

```bash
docker-compose config
```

## Volumes and persistence

| Volume   | Mounted at                                | Stores                                   |
| -------- | ----------------------------------------- | ---------------------------------------- |
| `pgdata` | `pgdata:/var/lib/postgresql/data` in `db` | All PostgreSQL data (posts, users, etc.) |

The data survives `docker compose down` and `docker compose up`, because the volume is not removed. It is removed only with `docker compose down -v`.

Check the volume with:

```bash
docker volume ls
```

## Networking

- **Network:** `some-network` (defined as `app-net` in the Compose file). All three services are connected to it.
- **Host ports (used from the browser or terminal):** `3000` (webapp) and `3001` (backend). The backend port is published so the API can be tested directly from the host, for example with `curl` fx `curl http://localhost:3001/posts`.
- **Internal addresses (used between containers):** `backend:3006` and `db:5432`. For example the webapp uses `BACKEND_URL=http://backend:3006`, and the backend uses `DB_HOST=db`.
- **The database is not published to the host.** It can only be reached from containers on `some-network`, which reduces the attack surface.

## Security and efficiency

What was implemented:

- **Multi-stage builds** keep the final images small: build tools and dev dependencies stay in the build stages.
- **Distroless runtime image** (`gcr.io/distroless/nodejs22-debian12:nonroot`): no shell and no package manager, and fewer packages than a normal Node image.
- **Non-root user:** the `:nonroot` image runs as user `65532`. This was verified, not only assumed (see Testing).
- **Limited exposure:** the database port is not published.
- **Resource limits:** the backend is limited to 0.5 CPU and 256 MB.
- **No secrets in the repository:** credentials are read from `.env`.

Trade-offs:

- Distroless images have no shell, so you cannot use `docker exec ... sh` to look inside a container. Use `docker compose logs` instead.
- Trivy reports finding DS-0002 ("no USER in Dockerfile") because it only reads the Dockerfile, while the non-root user comes from the base image. It is a false positive here. See [TRIVY.md](TRIVY.md) for how to scan the images.

## Testing and verification

| Check                  | Command                                                                                      | What to expect                        |
| ---------------------- | -------------------------------------------------------------------------------------------- | ------------------------------------- |
| Resolved configuration | `docker compose config`                                                                      | No errors                             |
| Services running       | `docker compose ps`                                                                          | `db`, `backend` and `webapp` are `Up` |
| Recent logs            | `docker compose logs --tail=50`                                                              | No errors from the services           |
| Non-root user          | `docker inspect --format '{{.Config.User}}' some-nextjs-backend` (also `some-nextjs-webapp`) | `65532`                               |
| Resource use           | `docker stats`                                                                               | CPU and memory per container          |

### Persistence test

1. `docker compose up --build`
2. Open http://localhost:3000 and create a post.
3. `docker compose down`
4. `docker compose up`
5. Reload the page: the post should still be there.

### Resource use

Measured with `docker stats` on a Mac with Docker Desktop, while the stack was
running right after startup:

| Container | CPU    | Memory   | Limit   |
| --------- | ------ | -------- | ------- |
| webapp    | 0.00 % | 43 MiB   | none    |
| backend   | 0.00 % | 48.5 MiB | 256 MiB |
| db        | 0.01 % | 24 MiB   | none    |

## Limitations and next steps

- **No healthcheck:** `depends_on` only waits for the `db` container to start, not for PostgreSQL to be ready. On the very first start the backend may fail to connect and need a restart (`docker compose up` again).
- **Resource limits** are only set on the backend, not on `webapp` or `db`.
- **Manual setup:** the `.env` file must be created by hand from `.env.example`.
- **Known Trivy findings:** In this project, `trivy config .` reports DS-0002 (no `USER` in the Dockerfile).
  This is a false positive: the base image is a distroless `nonroot` image, so the container already runs as a
  non-root user. Trivy only reads the Dockerfile and cannot see this.
- **No automated tests** for the containers; verification is done manually with the commands above.
