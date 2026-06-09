# UDS Core Local POC

Small macOS-local proof of concept with:

- React + Vite + TypeScript frontend in `client`
- Express + TypeScript backend in `server`
- Shared package/cluster types in `shared`

The app checks local prerequisites, reads UDS Registry catalog metadata through the backend when configured, falls back to inspecting configured UDS/Zarf OCI package references, reads installed Zarf Package CRs from the cluster, and models the difference between registry packages available to install and packages already installed in Kubernetes. The frontend uses one generic `ResourceCard` renderer with typed resource definitions instead of separate card components per package state.

Frontend component direction: [docs/FRONTEND_ARCHITECTURE.md](docs/FRONTEND_ARCHITECTURE.md)

Agent/coding guidance: [AGENTS.md](AGENTS.md)

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
make check-prereqs
```

The backend checks the same prerequisites at runtime.

More detail: [docs/PROJECT_REQUIREMENTS.md](docs/PROJECT_REQUIREMENTS.md)

## UDS Core Local Demo Path

Follow the current official UDS Core local demo/install documentation for your target runtime. For this POC, the important local verification commands are:

```bash
make verify-uds
```

If UDS Core is running, the backend marks `coreRunning` as true when it finds namespaces named `uds-core` or prefixed with `uds-core-`.

To deploy UDS Core with the official local demo path:

```bash
make deploy-core
```

By default this runs `uds deploy k3d-core-demo:latest --confirm`, matching the official local demo. Override with `UDS_CORE_BUNDLE_REF=k3d-core-demo:<version>` only when testing a specific version.

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
make dev
```

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

## Current Limits and TODOs

- TODO: Replace configurable `UDS_REGISTRY_CATALOG_URL` with the confirmed stable public/authorized UDS Registry catalog endpoint once Defense Unicorns documents it.
- TODO: Add bundle-level support with `uds inspect <oci-ref> --list-variables` and `uds deploy <oci-ref> --confirm` for UDS bundles.
- TODO: Derive auth-required state from an authenticated registry client or explicit OCI challenge result instead of leaving it unknown.
- TODO: Expand UDS Core health checks beyond namespace presence by checking the official Core components for the installed version.
