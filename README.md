# Family Weekly Budget Tracker Web App


## Local Docker development

Create the local runtime data file if it does not already exist:

```powershell
if (!(Test-Path budget-store.json)) { Copy-Item data/budget-store.example.json budget-store.json }
```

If `budget-store.json` was accidentally created as a directory, stop the app, remove that directory, then run the copy command above again:

```powershell
docker compose -f deploy/docker-compose.yml -p family-budget down
Remove-Item -Recurse budget-store.json
Copy-Item data/budget-store.example.json budget-store.json
```

Build and start locally:

```powershell
docker compose -f deploy/docker-compose.yml -p family-budget up --build
```

Start in the background:

```powershell
docker compose -f deploy/docker-compose.yml -p family-budget up -d --build
```

Stop

```powershell
docker compose -f deploy/docker-compose.yml -p family-budget down
```

Access url

```text
http://127.0.0.1:5173/
```

Example data file

```text
data/budget-store.example.json
```

Local runtime data file

```text
budget-store.json
```

`data/budget-store.example.json` is the repo-safe example file. `budget-store.json` is ignored by git and is used as the live local data file. Docker maps the local `budget-store.json` into the container so your working data stays persistent.

`budget-store.json` must be a JSON file, not a directory. Docker can create a directory at that path if a file bind mount is started before the file exists.

## Production Docker deployment

The VM deployment uses `deploy/docker-compose.prod.yml`, which pulls the published image, redirects HTTP to HTTPS, and mounts certificates from `./certs`.

## Post-build E2E deployment test

After `Docker Image CI` builds and pushes the image from `main`, `Deploy E2E Test` starts an isolated VM test deployment before production deploy runs.

The E2E deployment uses:

```text
deploy/docker-compose.e2e.yml
${VM_APP_PATH}/e2e
family-budget-e2e
VM localhost only: 127.0.0.1:18080 and 127.0.0.1:18443
GitHub Actions runner access: SSH tunnel to https://127.0.0.1:18443/
```

The workflow generates its own `budget-store.json`, localhost TLS certificate, and random `APP_PASSWORD`, then runs Playwright checks through an SSH tunnel against the isolated service. Production deploy is triggered only after the E2E workflow succeeds.

Automatic E2E and production deploys use the immutable Docker tag `sha-<commit>` from the completed build. Manual workflow runs fall back to `latest`.

## GitHub Actions deploy

`docker-image.yml` builds and pushes the Docker image.

`e2e-deploy-test.yml` deploys the pushed image to the isolated E2E environment and runs browser checks.

`deploy-vm.yml` deploys to the VM after successful E2E checks on `main`, or can be run manually with `workflow_dispatch`.

Required GitHub secrets:

```text
DOCKERHUB_TOKEN
VM_SSH_PRIVATE_KEY
VM_SSH_KNOWN_HOSTS
```

Required GitHub variables:

```text
DOCKERHUB_USERNAME
VM_SSH_HOST
VM_SSH_USER
VM_APP_PATH
VM_DOMAIN
```
