# UDS Core Local POC

Containerized monorepo for a local UDS package discovery and install-state POC.

The repo has three runnable app areas:

- `components/frontend/` React, Vite, and TypeScript UI.
- `components/backend/` Express and TypeScript API.
- `components/docs/` Docusaurus 3 documentation site.

Supporting code lives in:

- `shared/` TypeScript contracts shared by frontend and backend.
- `scripts/` local UDS, k3d, registry, and verification helpers.
- `components/catalog-poc/` sample Zarf/UDS package inputs for local package-loop testing.

UDS runs on Kubernetes. The deployment direction is Kubernetes manifests, Kubernetes-native routing, and UDS package structure.

Kubernetes manifests for the three app containers live in:

- `components/frontend/manifests/`
- `components/backend/manifests/`
- `components/docs/manifests/`
- `deploy/kubernetes/` for shared Kubernetes resources.
- `kustomization.yaml` as the plain-Kubernetes entrypoint.

## UDS POC Workflow

UDS runs on Kubernetes. The app container manifests are under `components/*/manifests`, with root `kustomization.yaml` as the plain-Kubernetes entrypoint. `make build` builds the frontend/backend/docs container images. `make up` pushes, packages, publishes, and deploys the platform and docs packages through Zarf, then opens localhost port-forwards for browser access.

Fresh checkout, official local UDS path:

```bash
make setup
make deploy-uds
make build
make up
```

macOS seccomp workaround path:

```bash
make setup
make deploy-uds-macos
make build
make up
```

By the end of `make up`, frontend, backend, and docs should be deployed in the cluster from the images produced by `make build`. The command stays running to hold localhost port-forwards open.

`make up` also refreshes the local UDS tenant/admin gateways after app deployment. This keeps the named routes usable when long-running local clusters have stale Istio gateway workload certificates.

Additional installable packages follow the same staged shape:

```bash
make build/<component>
make up/<component>
```

For example, the sample package can be built and deployed with `make build/catalog-poc` and `make up/catalog-poc` from another terminal after the base stack is running.

- Frontend: `http://localhost:5173/`
- Backend: `http://localhost:3001/api/health`
- Docs direct debug: `http://localhost:3002/`

The POC app Package exposes these UDS gateway hostnames:

- Frontend endpoint: `https://app.uds.dev/`
- Docs endpoint: `https://docs.uds.dev/`
- Backend API endpoint: `https://api.uds.dev/`

In-cluster callers should use Kubernetes service DNS:

- Backend service: `http://backend.uds-poc.svc.cluster.local:3001`
- Docs service: `http://docs.docs.svc.cluster.local:3002`
- Frontend service: `http://frontend.uds-poc.svc.cluster.local:5173`

Frontend and backend are deployed together as the base platform package in the `uds-poc` namespace. Docs is a separate Docusaurus app package in the `docs` namespace, so it appears as its own installed resource card and Store entry. The cluster-deployed sample app is `components/catalog-poc/`.

The frontend shows registry packages available to install and installed packages from Kubernetes Package CRs. These are intentionally separate domains:

- Available package data remains `RegistryPackage`.
- Cluster-deployed state remains `InstalledPackage`.

TODO: confirm the stable registry catalog/index source and package metadata shape before broadening the model.

Useful staged commands:

```bash
make build
make build/backend
make build/frontend
make build/docs
make push/apps
make package-platform
make publish-platform
make deploy-platform
make package-docs
make publish-docs
make deploy-docs
make refresh-uds-gateways
make ports
make build/<component>
make up/<component>
```

## Kubernetes Manifests

UDS runs on Kubernetes, so the POC app deployment path is Kubernetes-first.

Render the current frontend/backend/docs manifests:

```bash
kubectl kustomize .
```

The checked-in manifests currently use local POC image refs such as `localhost:5001/uds-poc/frontend:0.1.0`. Prefer the staged Make flow over direct `kubectl apply` so images, Zarf packaging, registry publish, and deployment stay together.

Postgres is not required by the current API. If Prisma is already present or added, keep it isolated to `components/backend/` and use it for backend-owned persistence such as user settings. User settings should then move out of frontend `localStorage` and into API-backed storage.

## Documentation

Docusaurus pages live in `components/docs/docs/`.

Useful references:

- [Project requirements](components/docs/docs/project-requirements.md)
- [Commands](components/docs/docs/commands.md)
- [Frontend architecture](components/docs/docs/frontend-architecture.md)
- [UDS notes](components/docs/docs/uds-notes.md)

## UDS Package Notes

This POC uses:

- Kubernetes manifests for app runtime resources.
- UDS Package `network.expose` entries for app routing through the tenant gateway.
- UDS package structure for deployment.

Still to harden:

- Verified registry/package metadata sources.
- Signed package and bundle verification before production-style publish/deploy flows.

Do not guess UDS schemas. Leave TODOs where package shape, catalog shape, auth probing, or deploy behavior needs confirmation from real UDS sources.
