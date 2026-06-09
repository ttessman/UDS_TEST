# Project Requirements

This POC has three runtime layers. They are intentionally separate because package discovery, cluster state, and package installation have different requirements.

## 1. Local Tooling

Required for basic API status and package inspection:

- macOS
- Node.js 20 or newer
- npm
- Homebrew
- UDS CLI
- Zarf CLI, normally available through `uds zarf`
- k3d
- kubectl
- Docker Desktop or a Lima-compatible container runtime for local Kubernetes work

Use:

```bash
make setup-macos
make check-prereqs
```

`make setup-macos` can install `uds`, `k3d`, and `kubectl` with Homebrew. It does not install Docker Desktop or create a Kubernetes cluster.

## 2. Registry/OCI Access

Required for best `GET /api/uds/packages` behavior:

- A UDS Registry catalog JSON URL in `UDS_REGISTRY_CATALOG_URL`, or a captured catalog JSON file in `UDS_REGISTRY_CATALOG_PATH`
- Network access to that catalog URL if using URL mode
- Server-side credentials if the future catalog endpoint requires auth

The registry catalog shape observed from `registry.defenseunicorns.com` is:

```text
catalog.<org>.repos[] {
  title, tagline, icon, kind, repo, latest_tag, tag_count,
  last_updated, last_build, architectures, flavors, categories, size
}
```

If no catalog URL/file is configured, the backend falls back to package references in `UDS_REGISTRY_PACKAGE_REFS` and inspects each package with:

```bash
zarf package inspect definition <oci-ref>
```

The frontend never receives registry credentials. Put private registry values in `server/.env`:

```bash
UDS_REGISTRY_USERNAME=...
UDS_REGISTRY_PASSWORD=...
```

Current limitation: the exact stable public/authorized UDS Registry catalog endpoint is configurable, not hardcoded, until it is documented.

## 3. Kubernetes and UDS Core

Required for installed package state:

- A reachable Kubernetes cluster in the active kubeconfig
- UDS/Zarf Package CRDs installed in the cluster

The backend reads installed packages with:

```bash
uds zarf tools kubectl get package -A -o json
```

UDS Core is considered running when namespaces named `uds-core` or prefixed with `uds-core-` exist. That is a deliberately lightweight POC check. A production check should inspect the official UDS Core components and their health for the installed version.

Use:

```bash
make verify-uds
```

## Does UDS Core Need To Be Running?

For browsing registry package metadata: no.

For showing installed packages: a cluster with Zarf Package CRDs must be reachable.

For installing or launching UDS-dependent packages: yes, UDS Core generally needs to be installed and healthy unless the package metadata proves otherwise. This app leaves `udsCoreRequired` as `null` when it cannot derive the answer from real metadata.

## Deploying UDS Core

This repo includes a helper that follows the official local demo:

```bash
make deploy-core
```

By default it runs:

```bash
uds deploy k3d-core-demo:latest --confirm
```

Override with `UDS_CORE_BUNDLE_REF=k3d-core-demo:<version>` when testing a specific version.

## Install Flow Guardrail

The API exposes:

```text
POST /api/uds/packages/:id/install
```

It returns the generated install command by default, but it will not execute deploys unless the server has:

```bash
UDS_POC_ENABLE_INSTALL=true
```

This keeps accidental local cluster changes out of normal browsing.
