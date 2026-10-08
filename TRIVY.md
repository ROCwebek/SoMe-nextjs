# Security scanning with Trivy

Trivy is a tool that scans for known vulnerabilities (CVEs), bad configuration and hardcoded secrets. This guide shows how to use it in this project.

## 1. Installation

**Mac (Homebrew):**

```bash
brew install trivy
```

**Other systems:** see https://trivy.dev

Check that it works:

```bash
trivy --version
```

## 2. Build the project first

Image scanning requires the image to exist locally. Run this from the project root:

```bash
docker compose build
```

Check the image names:

```bash
docker images
```

In this project they are:

- `some-nextjs-backend`
- `some-nextjs-webapp`

(`postgres:16-alpine` is an official image and can be scanned the same way.)

## 3. The main scans

### Scan images (OS packages and npm dependencies)

```bash
trivy image some-nextjs-backend
trivy image some-nextjs-webapp
trivy image postgres:16-alpine
```

### Scan configuration (Dockerfile)

```bash
trivy config .
```

Finds things like containers running as root, a missing `USER` in the Dockerfile and missing healthchecks.

In this project, `trivy config .` reports DS-0002 (no `USER` in the Dockerfile).
This is a false positive: the base image is a distroless `nonroot` image, so the
container already runs as a non-root user. Trivy only reads the Dockerfile and
cannot see this.

### Check that the containers run as non-root

```bash
docker inspect --format '{{.Config.User}}' some-nextjs-backend
docker inspect --format '{{.Config.User}}' some-nextjs-webapp
```

If the result is `65532` (or `nonroot`), the container is not running as root.
An empty result means it runs as root.

## 4. Make the output easier to read

Show only serious findings:

```bash
trivy image --severity HIGH,CRITICAL some-nextjs-webapp
```

## 5. How to read the result

| Column            | Meaning                                           |
| ----------------- | ------------------------------------------------- |
| Library           | The vulnerable package                            |
| Vulnerability     | CVE ID (can be looked up online)                  |
| Severity          | LOW, MEDIUM, HIGH or CRITICAL                     |
| Status            | `fixed` (a fix exists) or `affected` (no fix yet) |
| Installed Version | The version in your image                         |
| Fixed Version     | The version that solves the problem               |

If there is a **Fixed Version**, you can fix the issue by:

1. Updating the package in `package.json`, or
2. Switching to a newer base image in the Dockerfile (e.g. a newer `node` tag).

## 6. Recommended workflow

1. `docker compose build`
2. Scan: `trivy image --severity HIGH,CRITICAL <image>`
3. Fix the findings that have a Fixed Version
4. Rebuild and scan again
5. Compare the number of findings before and after
