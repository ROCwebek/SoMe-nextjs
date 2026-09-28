# some-backend

NestJS REST API serving the posts used by [`some-webapp`](../some-webapp),
backed by PostgreSQL through TypeORM.

Most of the time you want to run this through Docker Compose from the repo root
(see the [root README](../README.md)). The instructions below are for running it
directly on your host, which is quicker when iterating on the API alone.

## Running on your host

Requires Node.js 20 and a local PostgreSQL.

```bash
# 1. create the database
createdb some

# 2. copy the env template at the repo root and fill in your credentials
cp ../.env.example ../.env

# 3. install and start
npm install
npm run start:dev
```

The API listens on `http://localhost:3006`. Set `PORT` to change that.

Configuration lives in the **repo root** `.env` - there is one env file for the
whole project, and `AppModule` points at it. See the
[root README](../README.md#configuration) for the full table. The variables this
service reads are `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASS`, `DB_NAME` and
`PORT`.

If you really want settings that apply to this service alone, a
`some-backend/.env` takes precedence over the root one. You normally do not need
it.

The `posts` table is created automatically from `src/post/entities/post.entity.ts`,
because `synchronize: true` is set in `AppModule`. That is convenient while
learning and **must not be used in production** - it will alter and drop columns
to match the entity.

## The posts API

| Method | Route | Does |
| --- | --- | --- |
| `GET` | `/posts` | every post |
| `GET` | `/posts/:id` | one post, 404 if the id is unknown |
| `POST` | `/posts` | create; the database assigns `id` and `created_at` |
| `PUT` | `/posts/:id` | replace `title`, `body` and `author`, 404 if unknown |
| `DELETE` | `/posts/:id` | delete, returning the removed post, 404 if unknown |

Bodies are validated by `class-validator`, so a missing or empty `title`, `body`
or `author` is rejected with a 400 before the controller runs.

## Layout

```
src/
├── main.ts           bootstrap, global ValidationPipe
├── app.module.ts     config + TypeORM connection, imports PostModule
└── post/
    ├── post.controller.ts   the routes above
    ├── post.service.ts      repository access, 404s on unknown ids
    ├── entities/            the Post entity, source of the posts table
    └── dtos/                create/update shapes + validation rules
```

## Other scripts

```bash
npm test          # unit tests (repository is mocked, no database needed)
npm run test:cov  # with coverage
npm run build     # compile to dist/
npm run lint      # eslint --fix
npm run format    # prettier
```
