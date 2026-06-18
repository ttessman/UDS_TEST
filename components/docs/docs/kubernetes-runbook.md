---
sidebar_position: 7
---

# Kubernetes Runbook

UDS runs on Kubernetes, so this POC is Kubernetes-first.

Plain Kubernetes manifests live under:

- `components/frontend/manifests/`
- `components/backend/manifests/`
- `components/docs/manifests/`
- `deploy/kubernetes/`
- root `kustomization.yaml`

Render the current manifests:

```bash
kubectl kustomize .
```

Prefer the Make flow over direct `kubectl apply` so image build, local registry push, Zarf package creation, publish, deploy, and rollout waits stay together.

## Hosts

UDS Package `network.expose` entries route these named hosts:

- Frontend: `https://app.uds.dev/`
- Backend API: `https://api.uds.dev/`
- Docs: `https://docs.uds.dev/`

In-cluster callers should use service DNS:

- Backend: `backend.uds-poc.svc.cluster.local:3001`
- Frontend: `frontend.uds-poc.svc.cluster.local:5173`
- Docs: `docs.docs.svc.cluster.local:3002`

## Package Layout

Frontend and backend deploy together as the base `uds-poc` platform package. Docs is a separate app package in the `docs` namespace. Additional installable packages, such as `catalog-poc`, follow the same staged package loop.
