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
- Docker runtime seccomp support for the official k3d UDS demo

Use this for local CLI setup only:

```bash
make setup-macos
```

`make setup-macos` can install Homebrew if missing, then install `uds`, `k3d`, and `kubectl` with Homebrew before running the prerequisite check. It does not install Docker Desktop or create a Kubernetes cluster.

Use `make check-prereqs` later only when you want to reprint local tool status without installing anything.

Use this for local repo setup:

```bash
make setup
```

That target runs local CLI setup, blocks if hard setup prerequisites are missing, then runs npm dependency installation and env file creation.

Use this for UDS Core deployment:

```bash
make deploy-uds
```

The UDS local demo deploy creates or updates the local k3d cluster during `make deploy-core`, and `deploy-core` verifies the cluster after deployment. Kubernetes also becomes required for `make run dev`, where `make check-run-ready` blocks if the cluster or installed Package CRs are missing.

The official k3d demo also requires a Docker runtime with seccomp support. If CoreDNS remains in `ContainerCreating` and events show `seccomp is not supported`, switch to Docker Desktop as the active Docker context and rerun `make deploy-uds`.

Known upstream issue: [Deployment issues on Mac M4 for `deploy k3d-core-demo:latest`](https://github.com/defenseunicorns/uds-core/issues/2237). In that failure mode, the UDS-created k3d cluster does not inherit custom k3s/kubelet flags from a manually-created cluster.

If the official deploy repeatedly fails with that seccomp error on macOS, use:

```bash
make deploy-uds-macos
```

This is an experimental workaround target. It deletes/recreates the local `uds` k3d cluster with kubelet seccomp disabled, maps local HTTP/HTTPS ports, disables the default k3s Traefik addon, waits for CoreDNS, then deploys selected non-cluster packages from `k3d-core-slim-dev:latest`. It skips `uds-k3d-dev` so the bundle does not delete and recreate the workaround cluster. It defaults to `--skip-signature-validation` because the selected package deploy can fail without verification material in this local workaround path.

The workaround does not fully replace `uds-k3d-dev`; it does not preload the UDS k3d airgap image set or reproduce every cluster bootstrap action from that package. It is scoped to getting a compatible local k3d cluster running on macOS so the POC can deploy Core packages and read installed Package CRs.

Use this before retrying either deploy path when the local cluster is in a bad state:

```bash
make down
```

It removes only the local `uds` k3d cluster and related k3d Docker leftovers. It does not run a global Docker prune.

Use `make down-dev` when you only want to stop the local Express/Vite dev servers. Use `make down-uds` when you only want to remove the local UDS cluster. `make down` runs both.

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

Blocker: the exact stable public/authorized UDS Registry catalog endpoint is configurable, not hardcoded, until it is documented or confirmed. Completion needs a real catalog client wired to that source.

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

From a fresh repo, prefer:

```bash
make setup
make deploy-uds
```

That keeps local repo setup separate from deploying the UDS Core demo cluster.

## Running The App

Use:

```bash
make run dev
```

This target runs a blocking preflight before starting the dev servers. If `make setup` or `make deploy-uds` was interrupted or failed, `make run dev` exits and tells you which setup command to rerun.

For this POC, the deploy success signal is that `make verify-uds` can reach the cluster and print installed Zarf Package CRs. The frontend uses those Package CRs to show the installed package count and package status.

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

## Completion Blockers

These are actionable gaps that prevent this POC from being a complete launcher/installer flow.

| Area | Current state | What blocks completion | Action needed |
| --- | --- | --- | --- |
| Registry catalog source | Catalog JSON can come from `UDS_REGISTRY_CATALOG_URL` or `UDS_REGISTRY_CATALOG_PATH`. | The repo does not yet have a confirmed stable public/authorized Defense Unicorns Registry catalog endpoint. | Confirm the registry API/index source and replace the configurable placeholder with a real catalog client. |
| Bundle support | Package definitions and registry catalog entries are modeled. | UDS bundles need `uds inspect` and `uds deploy` behavior, which differs from plain Zarf package deployment. | Add bundle inspection with `uds inspect <oci-ref> --list-variables` and deployment with `uds deploy <oci-ref> --confirm`. |
| Registry authentication | Registry credentials are server-side only, and `authRequired` remains unknown when not discoverable. | The backend does not yet perform OCI challenge/auth probing. | Add server-side auth probing through an authenticated registry client or explicit OCI challenge result. |
| UDS Core health | Core detection checks `uds-core` namespaces. | Namespace presence does not prove Core is healthy or identify the installed version. | Inspect official Core components, pod health, versions, and Kubernetes conditions. |
| Signature verification | The macOS workaround skips signature validation for a local selected-package deploy. | Proper verification material is not wired into this POC flow. | Add a signed package/bundle verification strategy before production registry publish/deploy workflows. |
