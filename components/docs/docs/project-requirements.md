# Project Requirements

## Containerized Monorepo Refactor Prompt

Refactor this singular repo into a containerized monorepo with three app areas:

- `components/frontend/` React UI
- `components/backend/` Express API
- `components/docs/` Docusaurus documentation site

Use the uploaded `portfolio-docs.zip` as the reference shape for the docs app.

Target structure:

```txt
/
  components/
    frontend/
      src/
      package.json
      Dockerfile
    backend/
      src/
      package.json
      Dockerfile
      .env.example
      prisma/ optional
    docs/
      docs/
      static/
      src/
      package.json
      docusaurus.config.mjs
      sidebars.js
      Dockerfile
    catalog-poc/
      zarf.yaml
      manifests/
      app/
  shared/
    src/
    package.json
  kustomization.yaml
  README.md
```

Docs requirements:

- Create `components/docs/` as a real Docusaurus app.
- Use Docusaurus 3.x.
- Include scripts:
  - `npm run start`
  - `npm run build`
- Add a Dockerfile for the docs service.
- Docs should run on port `3001` or another non-conflicting port.
- Include starter pages:
  - `components/docs/docs/intro.md`
  - `components/docs/docs/quickstart.md`
  - `components/docs/docs/product-model.md`
  - `components/docs/docs/user-journeys.md`
  - `components/docs/docs/architecture.md`
  - `components/docs/docs/components.md`
  - `components/docs/docs/kubernetes-runbook.md`
  - `components/docs/docs/uds-notes.md`
- Explain that UDS runs on Kubernetes and the POC should move toward Kubernetes manifests / UDS package structure.
- Do not make docs just a markdown folder. It should be independently runnable and containerized.

Kubernetes setup:

- Add Kubernetes manifests for:
  - `frontend`
  - `backend`
  - `docs`
- Add a root `kustomization.yaml` entrypoint.

Routing target:

```text
/       -> frontend
/api    -> backend
/docs   -> docs
```

Do not guess whether this should be Traefik CRDs, Gateway API, or UDS gateway resources until the UDS package/routing model is confirmed.

Frontend requirements:

- Move React app into `components/frontend/`.
- Use env config for API URL.
- Avoid hard-coded localhost in components.

Backend requirements:

- Move Express API into `components/backend/`.
- Add:
  - `GET /api/health`
  - `GET /api/packages`
- Keep UDS package data mocked or fixture-based unless real registry integration already exists.
- If Prisma exists, keep it isolated to backend.
- If Prisma does not exist, only add it if clean and simple.

README requirements:

- Explain repo layout.
- Explain how to run:
  - frontend only
  - backend only
  - docs only
  - Kubernetes manifest render/apply path
- Include API endpoint summary.
- Include future UDS deployment direction.

Quality bar:

- Preserve existing behavior.
- Do not overbuild.
- Do not guess UDS schemas.
- Leave TODOs where registry/package shape needs confirmation.
- Make sure each app can run independently and has Kubernetes manifests.

After refactor, summarize:

- changed files
- commands to run each service
- container ports
- assumptions made

Big correction: **docs is now a third app**, same level as FE and BE.

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

The UDS local demo deploy creates or updates the local k3d cluster during `make deploy-core`, and `deploy-core` verifies the cluster after deployment. Kubernetes also becomes required for `make up`, where `make check-run-ready` blocks if the cluster or installed Package CRs are missing.

The official k3d demo also requires a Docker runtime with seccomp support. If CoreDNS remains in `ContainerCreating` and events show `seccomp is not supported`, switch to Docker Desktop as the active Docker context and rerun `make deploy-uds`.

Known upstream issue: [Deployment issues on Mac M4 for `deploy k3d-core-demo:latest`](https://github.com/defenseunicorns/uds-core/issues/2237). In that failure mode, the UDS-created k3d cluster does not inherit custom k3s/kubelet flags from a manually-created cluster.

Full workaround history and agent notes: [UDS notes](uds-notes.md)

If the official deploy repeatedly fails with that seccomp error on macOS, use:

```bash
make deploy-uds-macos
```

This is an experimental workaround target. It deletes/recreates the local `uds` k3d cluster with kubelet seccomp disabled, adds one k3d agent node by default, maps local HTTP/HTTPS ports, disables the default k3s Traefik addon, disables k3s ServiceLB, waits for CoreDNS, then deploys selected non-cluster packages from `k3d-core-slim-dev:latest`. It skips `uds-k3d-dev` so the bundle does not delete and recreate the workaround cluster. ServiceLB is disabled because Core gateway LoadBalancers can otherwise create competing `svclb-*` pods for host ports `80` and `443`, which keeps tenant gateway load balancer pods pending. Since ServiceLB is disabled, the script patches gateway `LoadBalancer` service status while UDS deploys so Helm does not wait forever for an external IP. It does not patch gateway services to `NodePort` because UDS Core policy rejects NodePort services. It defaults to `--skip-signature-validation` because the selected package deploy can fail without verification material in this local workaround path.

The workaround does not fully replace `uds-k3d-dev`; it does not preload the UDS k3d airgap image set, reproduce every cluster bootstrap action from that package, or prove local browser ingress through both Core gateways. It is scoped to getting a compatible local k3d cluster running on macOS so the POC can deploy Core packages and read installed Package CRs.

Use this before retrying either deploy path when the local cluster is in a bad state:

```bash
make down
```

It removes only the local `uds` k3d cluster and related k3d Docker leftovers. It does not run a global Docker prune.

Use `make down-deploy` when you only want to remove repo-deployed app namespaces. Use `make down-uds` when you only want to remove the local UDS cluster. `make down` runs both.

## 2. Registry/OCI Access

Required for best `GET /api/uds/packages` behavior:

- A UDS Registry catalog JSON URL in `UDS_REGISTRY_CATALOG_URL`, or a captured catalog JSON file in `UDS_REGISTRY_CATALOG_PATH`
- Network access to that catalog URL if using URL mode
- Server-side credentials if the future catalog endpoint requires auth
- Local OCI registry support for testing app package push/read/deploy loops

The registry catalog shape observed from `registry.defenseunicorns.com` is:

```text
catalog.<org>.repos[] {
  title, tagline, icon, kind, repo, latest_tag, tag_count,
  last_updated, last_build, architectures, flavors, categories, size
}
```

If no catalog URL/file is configured, the backend uses package references supplied by `UDS_REGISTRY_PACKAGE_REFS` in its Kubernetes runtime config and inspects each package with:

```bash
zarf package inspect definition <oci-ref>
```

The frontend never receives registry credentials. For the Kubernetes POC, private registry values belong in backend runtime configuration supplied by Kubernetes/Zarf, not frontend code:

```bash
UDS_REGISTRY_USERNAME=...
UDS_REGISTRY_PASSWORD=...
```

Blocker: the exact stable public/authorized UDS Registry catalog endpoint is configurable, not hardcoded, until it is documented or confirmed. Completion needs a real catalog client wired to that source.

Local registry path: local push/pull is required to test real app packages end to end. The current model can support a local registry without changing the core package shape. A local registry package should still map to `RegistryPackage` because it is available to install. Once deployed, the cluster state should still come from `InstalledPackage` records read from Package CRs.

The missing implementation is operational:

1. Start or discover a local OCI registry.
2. Package one sample UDS/Zarf app package.
3. Push the package to the local registry.
4. Generate/read a local catalog or inspect the pushed OCI ref.
5. Show that package as available in `GET /api/uds/packages`.
6. Deploy/install it through the backend.
7. Verify the installed app package through Package CRs and surface the deployed count/status in the UI.

## 3. Kubernetes and UDS Core

Required for installed package state:

- A reachable Kubernetes cluster in the active kubeconfig
- UDS/Zarf Package CRDs installed in the cluster

The backend reads installed packages with:

```bash
uds zarf tools kubectl get package -A -o json
```

UDS Core is considered running when namespaces named `uds-core` or prefixed with `uds-core-` exist, or when ready Core Package CR evidence is present. The slim macOS workaround may not create a literal `uds-core` namespace, but it does create ready Package CRs such as `keycloak` and `authservice` from `core-identity-authorization`. A production check should inspect the official UDS Core components and their health for the installed version.

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
make build
make up
make build/catalog-poc
make up/catalog-poc
```

`make build` creates the frontend/backend/docs container images. `make up` runs a blocking preflight, pushes/packages/publishes/deploys those images to Kubernetes through Zarf, then holds localhost port-forwards open. `make build/catalog-poc` and `make up/catalog-poc` do the same staged build/deploy loop for the sample package after the base POC is running. If `make setup` or `make deploy-uds` was interrupted or failed, `make up` exits and tells you which setup command to rerun.

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
| Local registry workflow | Configured OCI refs can be inspected, and catalog JSON can be read from a URL/path. | The repo does not yet run a local OCI registry, push a sample app package, build/read a local catalog/index, or prove deploy from that registry. | Add make targets/scripts for local registry up/down, package push, catalog export or OCI inspection, backend deploy-by-ref, and installed Package CR verification. |
| Bundle support | Package definitions and registry catalog entries are modeled. | UDS bundles need `uds inspect` and `uds deploy` behavior, which differs from plain Zarf package deployment. | Add bundle inspection with `uds inspect <oci-ref> --list-variables` and deployment with `uds deploy <oci-ref> --confirm`. |
| Registry authentication | Registry credentials are server-side only, and `authRequired` remains unknown when not discoverable. | The backend does not yet perform OCI challenge/auth probing. | Add server-side auth probing through an authenticated registry client or explicit OCI challenge result. |
| UDS Core health | Core detection checks `uds-core` namespaces and ready Core Package CR evidence. | This is enough for local POC state, but does not fully prove every official Core component is healthy or identify the installed version. | Inspect official Core components, pod health, versions, and Kubernetes conditions. |
| Signature verification | The macOS workaround skips signature validation for a local selected-package deploy. | Proper verification material is not wired into this POC flow. | Add a signed package/bundle verification strategy before production registry workflows. |
