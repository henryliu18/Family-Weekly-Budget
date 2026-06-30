# Family Weekly Budget Tracker Web App

A small family budget web app with three operational layers:

- local Docker development for day-to-day product work
- Docker image build plus isolated VM E2E validation in GitHub Actions
- OCI infrastructure managed with Terraform

## Repo layout

- `deploy/`: Dockerfile and compose files for local, E2E, and production runtime
- `data/budget-store.example.json`: repo-safe starter data file
- `tests/e2e/post-deploy.spec.js`: Playwright smoke and regression checks
- `infra-bootstrap/`: one-time Terraform stack that creates the OCI Object Storage bucket for Terraform state
- `infra/`: main OCI Terraform stack for networking, VM, NLB, and cloud-init

## Local Docker development

Create the local runtime data file if it does not already exist:

```powershell
if (!(Test-Path budget-store.json)) { Copy-Item data/budget-store.example.json budget-store.json }
```

If `budget-store.json` was accidentally created as a directory, stop the app, remove that directory, then recreate the file:

```powershell
docker compose -f deploy/docker-compose.yml -p family-budget down
Remove-Item -Recurse budget-store.json
Copy-Item data/budget-store.example.json budget-store.json
```

Run locally:

```powershell
docker compose -f deploy/docker-compose.yml -p family-budget up --build
```

Run in the background:

```powershell
docker compose -f deploy/docker-compose.yml -p family-budget up -d --build
```

Stop:

```powershell
docker compose -f deploy/docker-compose.yml -p family-budget down
```

Local URL:

```text
http://127.0.0.1:5173/
```

Notes:

- local runtime uses `deploy/docker-compose.yml`
- local runtime is HTTP only, on port `5173`
- local `budget-store.json` is bind-mounted into `/app/budget-store.json` for the default workspace
- local `workspace-stores/` is bind-mounted into `/app/workspace-stores` for additional workspace-owned data files
- `budget-store.json` must be a file, not a directory

### Password hash helper

Generate an account password hash locally with:

```powershell
npm.cmd run hash-password -- "your-password-here"
```

The output is a `scrypt$<salt>$<key>` value suitable for the `DEFAULT_ACCOUNT_PASSWORD_HASH` GitHub Actions secret. Treat this hash as sensitive authentication material. Do not commit it to the repo or paste it into logs.

## Docker image build and E2E validation

The published app image is built from:

```text
deploy/Dockerfile
```

### `docker-image.yml`

This workflow:

- builds the Docker image on pushes to `main`, pull requests to `main`, and manual dispatch
- ignores `infra/**` changes
- pushes `latest` and `sha-<commit>` tags for non-PR builds
- pushes `pr-<head-sha>` tags for same-repo pull requests
- runs an isolated VM-hosted E2E deployment after a successful build when:
  - pushing to `main`
  - manually dispatching the workflow
  - opening a same-repo pull request

### E2E deployment model

The automated E2E deployment uses:

```text
deploy/docker-compose.e2e.yml
${VM_APP_PATH}/e2e-<github.run_id>
project name: family-budget-e2e
VM localhost only: 127.0.0.1:18080 and 127.0.0.1:18443
GitHub Actions access: SSH tunnel to https://127.0.0.1:18443/
```

The workflow:

- creates an isolated app directory on the VM
- copies `deploy/docker-compose.e2e.yml`
- copies `data/budget-store.example.json` as runtime `budget-store.json`
- generates a short-lived localhost TLS certificate on the VM
- generates a random app password
- pulls the just-built immutable image tag
- runs Playwright through an SSH tunnel with:

```powershell
npm install
npx playwright install --with-deps chromium
npm run test:e2e -- --project=chromium
```

If E2E fails, the workflow prints the container logs and then cleans up the isolated deployment.

## Production VM deployment

Production deployment uses:

```text
deploy/docker-compose.prod.yml
```

This compose file:

- pulls `docker.io/henryhhl18/family-budget-app:${APP_IMAGE_TAG:-latest}`
- exposes `80:5173` and `443:5443`
- redirects HTTP to HTTPS
- mounts runtime certs from `./certs`
- mounts default workspace data from `./budget-store.json`
- mounts additional workspace data from `./workspace-stores`

### `deploy-vm.yml`

This workflow runs:

- automatically after a successful `Docker Image CI` workflow run on `main`
- manually with `workflow_dispatch`

The workflow:

- writes `APP_SSL_CERT` and `APP_SSL_KEY` secrets into temporary files
- copies the cert files to `${VM_APP_PATH}/certs`
- copies `deploy/docker-compose.prod.yml` to `${VM_APP_PATH}/docker-compose.yml`
- writes `.env` values on the VM for:
  - `APP_IMAGE_TAG`
  - `APP_PASSWORD`
  - `DEFAULT_ACCOUNT_PASSWORD_HASH`
  - `APP_BUILD_VERSION`
  - `APP_BUILD_TIME`
- ensures `${VM_APP_PATH}/workspace-stores` exists for workspace-owned budget files
- pulls the selected image and starts the compose project `family-budget`

Automatic deploys use the immutable `sha-<commit>` image tag from the upstream build workflow. Manual runs fall back to `latest`.

Production authentication checks the account registry password hash first. If the default account does not yet have a `passwordHash`, the server bootstraps it from `DEFAULT_ACCOUNT_PASSWORD_HASH`. `APP_PASSWORD` remains as a fallback during the current development phase so a bad hash secret does not lock out the only user.

## Terraform infrastructure

Terraform is intentionally split in two parts.

### `infra-bootstrap/`

Purpose:

- create the OCI Object Storage bucket used for Terraform remote state

State model:

- local state only

Typical use:

```powershell
cd infra-bootstrap
terraform init -reconfigure
terraform plan
terraform apply
```

This stack is low-frequency and mainly exists to bootstrap the remote state bucket.

### `infra/`

Purpose:

- manage the OCI VCN, subnets, security lists, VM, NLB, and cloud-init

State model:

- OCI remote backend via `backend "oci" {}`
- local machine uses a local `backend.hcl` file that is intentionally ignored by git

Typical use after a machine move or backend change:

```powershell
cd infra
terraform init -reconfigure -backend-config="backend.hcl"
terraform plan
```

Helpful notes:

- `cloud-init.yaml` installs Docker on first boot
- `REMOTE_STATE_MIGRATION.md` documents the original local-to-OCI state migration flow
- local `terraform.tfvars` and `backend.hcl` are machine-specific and should stay out of git

### Terraform GitHub Actions

`terraform-infra.yml` runs when `infra/**` changes on PRs or pushes to `main`, and can also be run manually.

It:

- writes OCI credentials to `~/.oci/oci_api_key.pem`
- generates `infra/backend.hcl` inside CI
- runs `terraform init -backend-config=backend.hcl -reconfigure`
- runs `terraform plan`
- uploads the plan artifact
- runs `terraform apply` on `main`

## GitHub Actions configuration

### Secrets used by image / E2E / deploy workflows

```text
DOCKERHUB_TOKEN
VM_SSH_PRIVATE_KEY
VM_SSH_KNOWN_HOSTS
APP_PASSWORD
DEFAULT_ACCOUNT_PASSWORD_HASH
APP_SSL_CERT
APP_SSL_KEY
```

`DEFAULT_ACCOUNT_PASSWORD_HASH` is a secret, not a variable. It should contain the `scrypt$<salt>$<key>` output from `npm.cmd run hash-password`. Keep `APP_PASSWORD` during the transition; it remains the fallback password if the account hash is missing or invalid.

### Variables used by image / E2E / deploy workflows

```text
DOCKERHUB_USERNAME
VM_SSH_HOST
VM_SSH_USER
VM_APP_PATH
VM_DOMAIN
```

### Secrets used by Terraform workflow

```text
OCI_PRIVATE_KEY
OCI_TENANCY_OCID
OCI_USER_OCID
OCI_FINGERPRINT
TF_VAR_COMPARTMENT_OCID
TF_VAR_IMAGE_OCID
VM_SSH_PUBLIC_KEY
```

### Terraform workflow environment defaults

The workflow currently sets these defaults internally:

```text
TF_VAR_region=ap-sydney-1
TF_VAR_availability_domain=AD-1
TF_VAR_instance_shape=VM.Standard.E2.1.Micro
```

## Quick operational summary

- product work: local Docker on `http://127.0.0.1:5173/`
- image publishing: `docker-image.yml`
- isolated VM validation: built-in `e2e` job in `docker-image.yml`
- production deployment: `deploy-vm.yml`
- state bucket bootstrap: `infra-bootstrap/`
- main OCI infrastructure: `infra/`
