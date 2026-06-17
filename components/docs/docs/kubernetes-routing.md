---
sidebar_position: 5
---

# Kubernetes Routing

UDS runs on Kubernetes, so frontend, backend, and docs deployment should be Kubernetes-first. The current app manifests are plain Deployments and Services under `components/*/manifests`, with root `kustomization.yaml` as the entrypoint.

Routing currently uses UDS Package `network.expose` entries through the tenant gateway. The `uds-poc` namespace has the frontend/backend platform Package CR, and the `docs` namespace has the docs Package CR.

- `https://app.uds.dev/` for frontend
- `https://api.uds.dev/` for backend
- `https://docs.uds.dev/` for docs

Traefik should be treated as a possible Kubernetes routing option for non-UDS experiments, not the default path for this POC. UDS Core already brings gateway and policy expectations, so keep the app-facing route in UDS package structure unless the POC explicitly expands beyond it.
