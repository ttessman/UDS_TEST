---
sidebar_position: 4
---

# Kubernetes Container Runbook

UDS runs on Kubernetes. The frontend, backend, and docs app containers should be deployed with Kubernetes resources and then wrapped in the UDS/Zarf package structure.

Plain Kubernetes manifests are checked in at:

- `components/frontend/manifests/`
- `components/backend/manifests/`
- `components/docs/manifests/`
- root `kustomization.yaml`

The manifests define the frontend, backend, and docs Deployments and Services. Frontend and backend are exposed through the platform Package CR in `uds-poc`; docs is exposed through its own Package CR in the `docs` namespace.

Render the current Kubernetes manifests:

```bash
kubectl kustomize .
```

The normal local POC command builds, packages, deploys, and port-forwards the app containers:

```bash
make build
make up
make build/catalog-poc
make up/catalog-poc
```

Use staged commands when you want to stop between lifecycle phases:

```bash
make build
make push/apps
make package-platform
make publish-platform
make deploy-platform
make package-docs
make publish-docs
make deploy-docs
make ports
make build/catalog-poc
make up/catalog-poc
```

Default service ports:

- Frontend: `5173`
- Backend: `3001`
- Docs direct debug port: `3002`

Resource cards should prefer named UDS gateway URLs:

- Frontend: `https://app.uds.dev/`
- Docs: `https://docs.uds.dev/`
- Backend API: `https://api.uds.dev/`

In-cluster callers should prefer service DNS:

- Backend service: `backend.uds-poc.svc.cluster.local:3001`
- Docs service: `docs.docs.svc.cluster.local:3002`
- Frontend service: `frontend.uds-poc.svc.cluster.local:5173`

Browser API traffic can go through `https://api.uds.dev/` or through the frontend `/api` proxy during local development.

Postgres is intentionally not deployed yet. Do not add Prisma or database dependencies until the backend has a simple, confirmed need for persistent state.

TODO: confirm the final UDS routing model for cluster-native `/`, `/api`, and `/docs` access without relying on localhost port-forwards.
