# Make Targets

Run `make` or `make help` to print the command list.

## Fresh macOS Checkout

Use this order when the repo exists but local tooling, dependencies, and the UDS demo cluster may not be ready yet:

```bash
make setup
make deploy-uds
make run dev
```

| Command | Purpose |
| --- | --- |
| `make setup` | Sets up local tools, installs npm dependencies, and creates `server/.env`. |
| `make deploy-uds` | Runs the official UDS Core local demo deploy and verifies the cluster. Docker Desktop must already be installed and running. |
| `make run dev` | Verifies setup completed, then starts the Express API and Vite frontend. |

Expanded setup path:

```bash
make setup-macos
make install
make env
make deploy-uds
make verify-uds
```

`make setup` stops at local repo setup. `make deploy-uds` performs the official UDS local demo deploy step. Internally, `make deploy-core` is the lower-level target that creates/updates the local k3d cluster and verifies it.

Open:

```text
http://localhost:5173
```

To test a specific Core demo bundle, run `UDS_CORE_BUNDLE_REF=k3d-core-demo:<version> make deploy-uds`.

Retry and workaround commands:

If the official deploy fails with the known macOS k3d/seccomp issue, use this full alternate flow:

```bash
make setup
make deploy-uds-macos
make run dev
```

| Command | Purpose |
| --- | --- |
| `make deploy-uds-macos` | Experimental macOS workaround for the known k3d/seccomp failure. |
| `make down` | Stops local dev servers and deletes the local `uds` k3d cluster for a clean retry. |
| `make down-dev` | Stops local dev servers only. |
| `make down-uds` | Deletes the local `uds` k3d cluster and project-owned k3d leftovers only. |

## App-Only Run

Use this when UDS Core/local Kubernetes is already running, or when you only want to inspect backend prerequisite/catalog behavior.

```bash
make install
make env
make run dev
```

`make run dev` refuses to start if local setup or UDS deployment did not finish. It checks `server/.env`, `node_modules`, Kubernetes reachability, and installed Package CRs before launching the dev servers.

## Verification

```bash
make typecheck
make build
make verify-uds
make uds-debug
```

`make check-prereqs` is a diagnostic target only. It prints local tool status without installing anything. `make setup-macos` is the installer path for Homebrew and Homebrew-managed tools. It does not check Kubernetes because the cluster is created by `make deploy-core`.

`make check-run-ready` is a blocking run preflight. It is used by `make run dev`.

`make verify-uds` verifies the active cluster and prints installed Package CRs. Use `make installed-packages` later only when you want to rerun the installed package query by itself.

`make uds-debug` prints a focused deploy/debug snapshot: nodes, pods, deployments, gateway services, installed Package CRs, Helm releases, recent warning events, any running `uds deploy` process, and any running macOS workaround process. Use it while `make deploy-uds` or `make deploy-uds-macos` appears stuck.

## UDS Helpers

```bash
make inspect-packages
make installed-packages
make uds-debug
make fix-uds-ports
make stop-uds-workaround
make deploy-core
```

- `make inspect-packages` inspects configured `UDS_REGISTRY_PACKAGE_REFS`.
- `make installed-packages` runs `uds zarf tools kubectl get package -A -o json`.
- `make uds-debug` prints a concise operational snapshot for diagnosing local UDS deploy waits.
- `make fix-uds-ports` removes project-owned k3d leftovers, then re-checks host ports `80` and `443`; if another owner remains, it prints exact `docker stop ...`, safe `kill ...`, or Docker Desktop stale-forwarding guidance.
- `make stop-uds-workaround` stops a stale `deploy-uds-macos` workaround process without deleting the cluster.
- `make deploy-uds` deploys and verifies the official local demo bundle.
- `make deploy-uds-macos` deletes/recreates the local `uds` k3d cluster with kubelet seccomp disabled, adds one k3d agent by default, maps local HTTP/HTTPS ports, disables default k3s Traefik and ServiceLB, waits for CoreDNS, patches Core gateway `LoadBalancer` service status while deploying, prints phase/heartbeat progress output, then deploys selected non-cluster packages from `k3d-core-slim-dev:latest`.
- `make down` runs both `down-dev` and `down-uds`.
- `make down-dev` stops local dev servers on ports `3001` and `5173`.
- `make down-uds` deletes the local `uds` k3d cluster, related k3d containers, `k3d-uds` network, and `k3d-uds-images` volume.
- `make deploy-core` is the lower-level bundle deploy target and defaults to `k3d-core-demo:latest`.
- `make setup` runs local tool setup, `install`, and `env`.
- `make setup-local-demo` is an alias for `make deploy-uds`.

## Local catalog-poc Registry Loop

After UDS Core is running, use this app-package loop:

```bash
make registry-up
make publish-catalog-poc
make configure-catalog-poc
make deploy-catalog-poc
make verify-catalog-poc
```

- `make registry-up` starts a local OCI registry on `localhost:5001`.
- `make registry-down` removes the local registry container.
- `make package-catalog-poc` builds the static app image, pushes it to the local registry, and creates the Zarf package archive.
- `make publish-catalog-poc` publishes the Zarf package to `oci://localhost:5001/uds-poc/catalog-poc:0.1.0`.
- `make configure-catalog-poc` points `server/.env` at that OCI ref and enables local install execution.
- `make deploy-catalog-poc` deploys the OCI package into the current UDS cluster.
- `make verify-catalog-poc` waits for rollout and prints the UDS Package CR endpoint.

`make deploy-uds` checks that the active Docker runtime reports seccomp support before deploying, because the k3d demo needs it for pods such as CoreDNS.

Known upstream issue for the same failure signature: [Deployment issues on Mac M4 for `deploy k3d-core-demo:latest`](https://github.com/defenseunicorns/uds-core/issues/2237).

Full workaround history and agent notes: [MACOS_UDS_WORKAROUND.md](MACOS_UDS_WORKAROUND.md)

Use `make deploy-uds-macos` when the official path repeatedly fails with `seccomp is not supported`. The workaround skips the bundle's `uds-k3d-dev` package so the pre-created cluster is not deleted and recreated without the macOS seccomp flag. It also disables k3s ServiceLB because Core gateway LoadBalancers can otherwise create competing `svclb-*` pods for host ports `80` and `443`. Since ServiceLB is disabled, the script patches gateway `LoadBalancer` status to `UDS_GATEWAY_STATUS_IP` while UDS deploys so Helm does not wait forever for an external IP. It does not patch gateway services to `NodePort` because UDS Core policy rejects NodePort services. It defaults to `--skip-signature-validation` because the selected package deploy can fail without verification material in this local workaround path.

## Common Environment

Put local values in `server/.env`:

```bash
UDS_REGISTRY_PACKAGE_REFS=oci://ghcr.io/defenseunicorns/packages/uds/core:latest,oci://ghcr.io/defenseunicorns/packages/uds/podinfo:latest
UDS_REGISTRY_CATALOG_URL=
UDS_REGISTRY_CATALOG_PATH=
UDS_CORE_BUNDLE_REF=k3d-core-demo:latest
UDS_POC_ENABLE_INSTALL=false
UDS_APP_URL_SCHEME=https
UDS_REGISTRY_PLAIN_HTTP=true
UDS_REGISTRY_USERNAME=
UDS_REGISTRY_PASSWORD=
```
