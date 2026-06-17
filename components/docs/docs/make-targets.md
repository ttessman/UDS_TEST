# Make Targets

Run `make` or `make help` to print the command list.

## Fresh macOS Checkout

Use this order when the repo exists but local tooling, dependencies, and the UDS demo cluster may not be ready yet. Use the official path first when Docker supports the UDS local demo.

```bash
make setup
make deploy-uds
make build
make up
make build/catalog-poc
make up/catalog-poc
```

| Command | Purpose |
| --- | --- |
| `make setup` | Sets up local tools, installs npm dependencies, and creates `components/backend/.env`. |
| `make deploy-uds` | Starts the local POC registry, then runs the official UDS Core local demo deploy and verifies the cluster. Docker Desktop must already be installed and running. |
| `make build` | Builds all frontend/backend/docs container images. |
| `make up` | Verifies setup, pushes/packages/publishes/deploys the built platform and docs images to Kubernetes, then port-forwards them. |
| `make build/catalog-poc` | Builds the minimal sample app container image. |
| `make up/catalog-poc` | Pushes, packages, publishes, configures, deploys, and verifies the minimal sample app package. |

Expanded setup path:

```bash
make setup-macos
make deploy-uds
make verify-uds
```

`make setup` stops at local repo setup. `make deploy-uds` performs the official UDS local demo deploy step. Internally, `make deploy-core` is the lower-level target that creates/updates the local k3d cluster and verifies it.

Open:

```text
http://localhost:5173
```

To test a specific Core demo bundle, run `UDS_CORE_BUNDLE_REF=k3d-core-demo:<version> make deploy-uds`.

Full macOS workaround path:

If the official deploy fails with the known macOS k3d/seccomp issue, use this full alternate flow:

```bash
make setup
make deploy-uds-macos
make build
make up
make build/catalog-poc
make up/catalog-poc
```

| Command | Purpose |
| --- | --- |
| `make deploy-uds-macos` | Starts the local POC registry, then runs the experimental macOS workaround for the known k3d/seccomp failure. |
| `make down` | Removes repo-deployed apps, deletes the local `uds` k3d cluster, and removes the local POC registry for a clean retry. |
| `make down-deploy` | Removes repo-deployed sample apps from the current UDS cluster only. |
| `make down-uds` | Deletes the local `uds` k3d cluster, project-owned k3d leftovers, and the local POC registry, then reviews shared gateway ports. |

## App-Only Run

Use this when UDS Core/local Kubernetes is already running and you want to bring up the project app package.

```bash
make build
make up
```

`make up` refuses to start if local setup or UDS deployment did not finish. It checks `components/backend/.env`, `node_modules`, Kubernetes reachability, and installed Package CRs before deploying the project app package and opening port-forwards. It expects images from `make build` to already exist locally.

Local authoring commands live in component folders, not the root Makefile:

```bash
cd components/frontend && make dev
cd components/backend && make dev
cd components/docs && make dev
```

## Verification

```bash
make build
make verify-uds
make uds-debug
```

`make check-prereqs` is a diagnostic target only. It prints local tool status without installing anything. `make setup-macos` is the installer path for Homebrew and Homebrew-managed tools. It does not check Kubernetes because the cluster is created by `make deploy-core`.

`make build` builds backend/frontend/docs container images. Use `make build/backend`, `make build/frontend`, or `make build/docs` to rebuild one image. Component-local compile/typecheck commands live in `components/*/Makefile`.

`make check-run-ready` is a blocking run preflight. It is used by `make up`.

`make verify-uds` verifies the active cluster and prints installed Package CRs. Use `make installed-packages` later only when you want to rerun the installed package query by itself.

`make uds-debug` prints a focused deploy/debug snapshot: nodes, pods, deployments, gateway services, installed Package CRs, Helm releases, recent warning events, any running `uds deploy` process, and any running macOS workaround process. Use it while `make deploy-uds` or `make deploy-uds-macos` appears stuck.

## UDS Helpers

```bash
make inspect-packages
make installed-packages
make uds-debug
make fix-uds-ports
make fix-uds-gateway-routing
make stop-uds-workaround
make deploy-core
```

- `make inspect-packages` inspects configured `UDS_REGISTRY_PACKAGE_REFS`.
- `make installed-packages` runs `uds zarf tools kubectl get package -A -o json`.
- `make uds-debug` prints a concise operational snapshot for diagnosing local UDS deploy waits.
- `make fix-uds-ports` removes project-owned k3d leftovers, then re-checks host ports `80` and `443`; if another owner remains, it prints exact `docker stop ...`, safe `kill ...`, or Docker Desktop stale-forwarding guidance.
- `make fix-uds-gateway-routing` patches the macOS workaround k3d server load balancer so host `80/443` route to the UDS tenant/admin gateway NodePorts. `make deploy-uds-macos` runs this after Core deploys.
- `make stop-uds-workaround` stops a stale `deploy-uds-macos` workaround process without deleting the cluster.
- `make deploy-uds` starts the repo-owned local OCI registry, then deploys and verifies the official local demo bundle.
- `make deploy-uds-macos` starts the repo-owned local OCI registry, deletes/recreates the local `uds` k3d cluster with kubelet seccomp disabled, adds one k3d agent by default, maps local HTTP/HTTPS ports, disables default k3s Traefik and ServiceLB, waits for CoreDNS, patches Core gateway `LoadBalancer` service status while deploying, prints phase/heartbeat progress output, then deploys selected non-cluster packages from `k3d-core-slim-dev:latest`.
- `make down` runs `down-deploy` and `down-uds`; `down-uds` also removes the repo-owned local OCI registry.
- `make down-deploy` removes repo-deployed sample app namespaces from the current UDS cluster. It defaults to `catalog-poc`; override with `DOWN_DEPLOY_NAMESPACES="catalog-poc other-app" make down-deploy`.
- `make down-uds` deletes the local `uds` k3d cluster, related k3d containers, `k3d-uds` network, `k3d-uds-images` volume, and `uds-poc-registry` container. It then reviews shared gateway ports `80` and `443`; in an interactive terminal, it asks before stopping unrelated Docker containers or processes, and in non-interactive runs it prints the manual cleanup commands.
- `make deploy-core` is the lower-level bundle deploy target and defaults to `k3d-core-demo:latest`.
- `make setup` runs local tool setup, installs root npm dependencies, and creates `components/backend/.env` when missing.
- `make setup-local-demo` is an alias for `make deploy-uds`.

## Local catalog-poc Registry Loop

After UDS Core is running, use this app-package loop:

```bash
make build/catalog-poc
make up/catalog-poc
```

- `make registry-up` starts a local OCI registry on `localhost:5001`.
- `make registry-down` removes the local registry container.
- `make build/catalog-poc` builds the static app image.
- `make push/catalog-poc` pushes the built app image to the local registry.
- `make package-catalog-poc` creates the Zarf package archive from the pushed image.
- `make publish-catalog-poc` publishes the Zarf package to `oci://localhost:5001/uds-poc/catalog-poc:0.1.0`.
- `make up/catalog-poc` runs the publish prerequisite, deploys the OCI package into the current UDS cluster, then verifies rollout and prints the UDS Package CR endpoint.
- `make deploy-catalog-poc` is a compatibility one-shot that runs `make build/catalog-poc` and `make up/catalog-poc`.
- `make verify-catalog-poc` reruns that verification without rebuilding or redeploying.

`make deploy-uds` checks that the active Docker runtime reports seccomp support before deploying, because the k3d demo needs it for pods such as CoreDNS.

Known upstream issue for the same failure signature: [Deployment issues on Mac M4 for `deploy k3d-core-demo:latest`](https://github.com/defenseunicorns/uds-core/issues/2237).

Full workaround history and agent notes: [UDS notes](uds-notes.md)

Use `make deploy-uds-macos` when the official path repeatedly fails with `seccomp is not supported`. The workaround skips the bundle's `uds-k3d-dev` package so the pre-created cluster is not deleted and recreated without the macOS seccomp flag. It also disables k3s ServiceLB because Core gateway LoadBalancers can otherwise create competing `svclb-*` pods for host ports `80` and `443`. Since ServiceLB is disabled, the script patches gateway `LoadBalancer` status to `UDS_GATEWAY_STATUS_IP` while UDS deploys so Helm does not wait forever for an external IP. It does not patch gateway services to `NodePort` because UDS Core policy rejects NodePort services. It defaults to `--skip-signature-validation` because the selected package deploy can fail without verification material in this local workaround path.

## Runtime Configuration

For the Kubernetes POC, backend runtime configuration is supplied through Kubernetes manifests and the Zarf package, not by manually exporting shell variables. The local package refs currently live in `components/backend/manifests/configmap.yaml`:

```bash
UDS_REGISTRY_PACKAGE_REFS=oci://host.k3d.internal:5001/uds-poc/docs:0.1.0,oci://host.k3d.internal:5001/uds-poc/catalog-poc:0.1.0
UDS_REGISTRY_CATALOG_URL=
UDS_REGISTRY_CATALOG_PATH=
UDS_CORE_BUNDLE_REF=k3d-core-demo:latest
UDS_POC_ENABLE_INSTALL=true
UDS_APP_URL_SCHEME=https
UDS_REGISTRY_PLAIN_HTTP=true
```

Component-local `.env` files are only for local backend development outside the Kubernetes POC path.
