# Docker workflow

Requires Docker with Linux containers and Compose 2.30+. Start Docker Desktop first. Docker is optional; this app can also run with the Node version in .node-version. The generator still uses Node, but running this generated app with Docker needs no host Node/npm installation.

## Development

If you see dockerDesktopLinuxEngine / "pipe not found", Docker CLI is installed but the Linux engine is not reachable. Start Docker Desktop and wait until `docker info` succeeds before using Compose. If generation reported deferred installation, the source is already complete: do not rerun the generator over this directory. Install dependencies with the command below, then start the app.

From this app directory, if installation was skipped:

```sh
docker compose run --rm app npm install
# Windows PowerShell:
./docker-start.ps1
# macOS/Linux:
bash ./docker-start.sh
```

Open the URL printed by the launcher. At every start it builds the development image and asks Docker to publish port 3000; on a port conflict it retries 3001, 3002, and so on, up to 3999. It sets NEXT_PUBLIC_SITE_URL to the actual localhost origin for that launch, without rewriting .env.local. The container always listens on port 3000. If this project's app is already running, it prints that container's actual URL and leaves it running. `./run.ps1 dev` and `bash run.sh dev` also use this launcher when Docker was selected.

Set APP_PORT in your shell to prefer another starting port; the launcher tries up to 1000 consecutive ports, stopping at 65535. Only port-binding conflicts are retried: build, daemon and configuration errors remain errors. Availability is decided by the actual Docker start, so a conflict after a previous run is handled on the next launch. Use the launcher for this behavior: raw `docker compose up app` and `docker compose start app` do not retry. The development launcher uses a localhost origin; for a custom domain use an explicit APP_PORT and DOCKER_SITE_URL with Compose. Production keeps an explicitly configured port and public origin (see below).

Source changes are mounted live. Dependencies, npm cache and Next cache stay in project-scoped named volumes, not host node_modules. Commit the generated package-lock.json; on another machine initialize dependencies with `docker compose run --rm app npm ci`. After changing package.json, rerun install. Node/npm image upgrades need `docker compose build --pull app`, followed by npm ci. Browser tooling version is pinned in Dockerfile: update it together with @playwright/test.

The launcher starts in the background. View logs with `docker compose logs -f app`; stop with `docker compose stop app`. Remove this project's stopped containers/network with `docker compose down`; named volumes remain for reuse. Docker images/volumes and Docker Desktop consume disk and RAM: portability does not guarantee lower usage. Inspect with `docker system df`; never run global prune or delete volumes automatically. On native Linux, development commands run as root inside the container and may create root-owned host files; configure ownership for your workstation before team use. Production runs as the unprivileged node user.

## Checks and media

Stop the development server before checks: app checks share its .next volume. Run browser tests separately from other browser runs.

```sh
docker compose stop app
docker compose run --rm app npm run check
docker compose run --build --rm browser
docker compose run --rm app npm run doctor
docker compose run --rm app npm run media:optimize -- assets/photo.jpg
```

The optional browser target installs Chromium and Linux libraries in its image. It uses a separate Next cache. Tests read mounted .env.local, so use only a dedicated test provider or leave provider configuration empty. The included browser assertions target the initial, unconfigured app. For provider-specific workflows follow testing.md. Do not run npm ci/install concurrently with dev or tests using the dependency volume.

## Production image

Configure .env.local before building. Only the four explicitly listed NEXT_PUBLIC_* variables are passed to the build; they are public. Private runtime variables stay in .env.local or your deployment secret manager. Remove operator-only keys after use. Never add privileged keys as build arguments. The build context excludes all .env files, host dependencies, Git and local toolchains.

Runtime env_file uses raw format to preserve dollar signs in credentials: write KEY=value without surrounding quotes, as in the generated file. Public build variables are read by Compose's --env-file interpolation; the runtime file alone does not configure the build.

```sh
docker compose down
docker compose --env-file .env.local -f compose.production.yaml up --build -d web
docker compose --env-file .env.local -f compose.production.yaml ps
docker compose --env-file .env.local -f compose.production.yaml down
```

The multi-stage build uses npm ci and Next standalone output; the final image contains traced runtime dependencies, public assets and static chunks. No source bind mount or development dependency volume is used. Rebuild after changing public variables: they are compiled into the client bundle. Generic database drivers must be added to the application and their runtime configuration supplied explicitly.

Ports bind to localhost by default. For a server deployment, configure ingress/TLS and the actual NEXT_PUBLIC_SITE_URL; rebuild for that origin. Remote Docker daemons cannot mount your local source: use the production image. A single container has local Next cache; coordinate cache/invalidation before running multiple replicas. Mock workspaces remain disabled in production. Docker does not create a database or run Supabase locally; cloud providers remain external. Transfer the whole generated source plus lockfile to rebuild elsewhere, or publish the production image deliberately. Never ship .env.local in an image or source archive.

Sources: [Next standalone output](https://nextjs.org/docs/app/api-reference/config/next-config-js/output), [Next self-hosting](https://nextjs.org/docs/app/guides/self-hosting), [Compose interpolation](https://docs.docker.com/compose/how-tos/environment-variables/variable-interpolation/).
