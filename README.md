# Family Weekly Budget Tracker Web App


## Local Docker development

Create the local runtime data file if it does not already exist:

```powershell
if (!(Test-Path budget-store.json)) { Copy-Item budget-store.example.json budget-store.json }
```

If `budget-store.json` was accidentally created as a directory, stop the app, remove that directory, then run the copy command above again:

```powershell
docker compose -p family-budget down
Remove-Item -Recurse budget-store.json
Copy-Item budget-store.example.json budget-store.json
```

Build and start locally:

```powershell
docker compose -p family-budget up --build
```

Start in the background:

```powershell
docker compose -p family-budget up -d --build
```

Stop

```powershell
docker compose -p family-budget down
```

Access url

```text
http://127.0.0.1:5173/
```

Example data file

```text
budget-store.example.json
```

Local runtime data file

```text
budget-store.json
```

`budget-store.example.json` is the repo-safe example file. `budget-store.json` is ignored by git and is used as the live local data file. Docker maps the local `budget-store.json` into the container so your working data stays persistent.

`budget-store.json` must be a JSON file, not a directory. Docker can create a directory at that path if a file bind mount is started before the file exists.

## Production Docker deployment

The VM deployment uses `docker-compose.prod.yml`, which pulls the published image, redirects HTTP to HTTPS, and mounts certificates from `./certs`.

## GitHub Actions deploy

`docker-image.yml` builds and pushes the Docker image.

`deploy-vm.yml` deploys to the VM after a successful push build on `main`, or can be run manually with `workflow_dispatch`.

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
```
