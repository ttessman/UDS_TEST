# UDS Core Local POC

Small macOS-local proof of concept with:

- React + Vite + TypeScript frontend in `client`
- Express + TypeScript backend in `server`
- Shared package/cluster types in `shared`

The app checks local prerequisites, reads UDS Registry catalog metadata through the backend when configured, falls back to inspecting configured UDS/Zarf OCI package references, reads installed Zarf Package CRs from the cluster, and models the difference between registry packages available to install and packages already installed in Kubernetes. The frontend uses one generic `ResourceCard` renderer with typed resource definitions instead of separate card components per package state.

Frontend component direction: [docs/FRONTEND_ARCHITECTURE.md](docs/FRONTEND_ARCHITECTURE.md)

Agent/coding guidance: [AGENTS.md](AGENTS.md)

## Start From a Fresh macOS Checkout

This path assumes the repo exists on macOS, but local tooling, dependencies, and the UDS demo cluster may not be ready yet.

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

Open:

```text
http://localhost:5173
```

The backend listens on:

```text
http://localhost:3001
```

## Metadata Sources

This POC does not invent a registry package schema. The shared types are derived from live sources:

- Registry catalog metadata: UDS Registry catalog JSON shaped like `catalog.<org>.repos[]`, matching the card shape observed from `registry.defenseunicorns.com` (`title`, `tagline`, `icon`, `kind`, `repo`, `latest_tag`, `tag_count`, `last_updated`, `architectures`, `flavors`, `categories`).
- Package fallback metadata: `zarf package inspect definition <oci-ref>`, which emits the package `zarf.yaml`.
- Installed package state: `uds zarf tools kubectl get package -A -o json`, which returns Kubernetes Package CRs.
- UDS status: `uds version`, `zarf version`, `kubectl cluster-info`, and namespace discovery.

Unknown fields stay `null` until a real source is available. Registry auth is server-only via environment variables and is never sent to the frontend.

## macOS Prerequisites

```bash
make setup-macos
```

`make setup-macos` installs/checks Homebrew, then installs/checks Homebrew-managed CLI tools where possible and runs the local tool prerequisite check. It is the local-tools phase used by `make setup`. Use `make check-prereqs` later only when you want to reprint local tool status without installing anything.

The backend checks the same prerequisites at runtime.

More detail: [docs/PROJECT_REQUIREMENTS.md](docs/PROJECT_REQUIREMENTS.md)

## UDS Core Local Demo Path

Follow the current official UDS Core local demo/install documentation for your target runtime. To deploy UDS Core with the official local demo path:

```bash
make deploy-uds
```

By default this runs `uds deploy k3d-core-demo:latest --confirm` through `make deploy-core`, matching the official local demo. Override with `UDS_CORE_BUNDLE_REF=k3d-core-demo:<version>` only when testing a specific version.

Verify the deployment and print installed Package CRs with:

```bash
make verify-uds
```

If a local deploy appears stuck, print the focused debug snapshot with:

```bash
make uds-debug
```

If a live-edited macOS workaround run leaves the gateway status watcher printing after the deploy is done, stop only that stale process with:

```bash
make stop-uds-workaround
```

If UDS Core is running, the backend marks `coreRunning` as true when it finds namespaces named `uds-core` or prefixed with `uds-core-`.

If CoreDNS gets stuck in `ContainerCreating` with `seccomp is not supported`, the active Docker runtime is not compatible with the k3d demo. Switch to Docker Desktop as the active Docker context and rerun `make deploy-uds`.

Known upstream issue: [Deployment issues on Mac M4 for `deploy k3d-core-demo:latest`](https://github.com/defenseunicorns/uds-core/issues/2237). The failure is a k3d/kubelet/container-runtime seccomp compatibility issue. The official `k3d-core-demo` bundle creates its own k3d cluster, so custom flags from a separately-created cluster are not inherited by that deploy path.

If the official deploy keeps failing with that seccomp error on macOS, use the workaround target:

```bash
make deploy-uds-macos
```

This deletes/recreates the local `uds` k3d cluster with the kubelet seccomp flag from the upstream issue, adds one k3d agent node by default, maps local HTTP/HTTPS ports, disables the default k3s Traefik addon, disables k3s ServiceLB, waits for CoreDNS, then deploys selected non-cluster packages from `k3d-core-slim-dev:latest`. It skips the bundle's `uds-k3d-dev` package so the workaround cluster is not deleted and recreated without the macOS flag. ServiceLB is disabled because Core creates more than one gateway LoadBalancer; in this local workaround, ServiceLB creates `svclb-*` DaemonSets that compete for host ports `80` and `443` and can keep tenant gateway load balancer pods pending. While deploying, the script patches UDS Core gateway `LoadBalancer` service status to `127.0.0.1` so Helm does not wait forever for an external IP from the disabled ServiceLB controller. It does not change gateway services to `NodePort`, because UDS Core policy rejects NodePort services. Because this is a local experimental workaround, it defaults to `--skip-signature-validation` for the selected package deploy.

This workaround does not fully replace `uds-k3d-dev`. It does not preload the UDS k3d airgap image set, reproduce every cluster bootstrap action from that package, or prove local browser ingress through both Core gateways. It is scoped to getting a compatible local k3d cluster running on macOS so the POC can deploy Core packages and read installed Package CRs.

Signature verification is not the blocker for the local POC goal. The immediate success condition is a working UDS cluster plus installed Package CRs, so the app can show the deployed package count and package status. Proper signature verification should be added before treating registry publish/deploy as a production workflow.

Override the bundle or package list if needed:

```bash
UDS_MACOS_WORKAROUND_BUNDLE_REF=k3d-core-slim-dev:<version> make deploy-uds-macos
UDS_MACOS_WORKAROUND_PACKAGES=init,core-base,core-identity-authorization make deploy-uds-macos
UDS_MACOS_WORKAROUND_SIGNATURE_FLAG= make deploy-uds-macos
UDS_K3D_AGENTS=1 UDS_GATEWAY_STATUS_IP=127.0.0.1 UDS_K3D_API_PORT=6550 UDS_K3D_HTTP_PORT=80 UDS_K3D_HTTPS_PORT=443 make deploy-uds-macos
```

To clean up before retrying either deploy path:

```bash
make down
```

This stops local dev servers on ports `3001` and `5173`, then removes the local `uds` k3d cluster, related k3d containers, the `k3d-uds` Docker network, and the `k3d-uds-images` volume. It does not prune unrelated Docker containers or images. Use `make down-dev` or `make down-uds` when you only want one side of that cleanup.

## Configure Package Inspection

Copy the server environment example:

```bash
cp server/.env.example server/.env
```

Preferred catalog sources:

```bash
UDS_REGISTRY_CATALOG_URL=https://registry.defenseunicorns.com/path/to/catalog-json
UDS_REGISTRY_CATALOG_PATH=/absolute/path/to/exported-catalog.json
```

The direct URL is configurable because the stable public/authorized catalog endpoint is not documented yet. If you capture/export the response used by the registry site, `UDS_REGISTRY_CATALOG_PATH` works today and produces catalog-style cards using the real fields from that payload.

Fallback package refs:

```bash
oci://ghcr.io/defenseunicorns/packages/uds/core:latest
oci://ghcr.io/defenseunicorns/packages/uds/podinfo:latest
```

If your environment uses different public sample packages, edit:

```bash
UDS_REGISTRY_PACKAGE_REFS=oci://registry/path/package:tag,oci://registry/path/another:tag
```

Private registry credentials may be set server-side only:

```bash
UDS_REGISTRY_USERNAME=...
UDS_REGISTRY_PASSWORD=...
```

Install execution is disabled by default. To let the backend actually run `zarf package deploy ... --confirm`:

```bash
UDS_POC_ENABLE_INSTALL=true
```

## Install and Run

```bash
make install
make env
make run dev
```

`make run dev` refuses to start if local setup or UDS deployment did not finish. It checks `server/.env`, `node_modules`, Kubernetes reachability, and installed Package CRs before launching the dev servers.

Open:

```text
http://localhost:5173
```

The Express server listens on:

```text
http://localhost:3001
```

## Scripts

```bash
make dev
make run dev
make check-run-ready
make build
make typecheck
make start
```

`npm run start` starts the compiled Express server. Run `npm run build` first.

Full Make target list: [docs/MAKE_TARGETS.md](docs/MAKE_TARGETS.md)

## API

- `GET /api/health`
- `GET /api/uds/status`
- `GET /api/uds/packages`
- `GET /api/uds/installed-packages`
- `POST /api/uds/packages/:id/install`

## Completion Blockers and Implementation Details

These are the current gaps that prevent the POC from being a complete launcher/installer experience.

| Area | Current state | What blocks completion | Action needed |
| --- | --- | --- | --- |
| Registry catalog source | The backend can read catalog JSON from `UDS_REGISTRY_CATALOG_URL` or `UDS_REGISTRY_CATALOG_PATH`. | A stable public/authorized Defense Unicorns Registry catalog endpoint is not confirmed in this repo. | Confirm the registry API/index source, then replace the configurable placeholder with a real catalog client. |
| Bundle support | The model supports registry catalog entries and Zarf package definitions. | UDS bundles have different inspect/deploy behavior than plain Zarf packages. | Add bundle inspection with `uds inspect <oci-ref> --list-variables` and deployment with `uds deploy <oci-ref> --confirm`. |
| Registry authentication | `authRequired` is intentionally `null`. | The backend does not yet challenge/probe OCI auth or use an authenticated registry client. | Add server-side auth probing and keep credentials out of the frontend. |
| UDS Core health | `coreRunning` checks for `uds-core` namespaces. | Namespace presence does not prove the installed Core version is healthy. | Inspect official Core components, pod health, versions, and conditions for the installed release. |
| Signature verification | The macOS workaround skips signature validation for a local selected-package deploy. | Proper verification material is not wired into this POC flow. | Add a signed package/bundle verification strategy before production registry publish/deploy workflows. |
