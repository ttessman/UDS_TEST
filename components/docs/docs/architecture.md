---
sidebar_position: 2
---

# Architecture

The repo is organized as a containerized monorepo:

- `components/frontend/` is the React and Vite UI.
- `components/backend/` is the Express API and UDS integration boundary.
- `components/docs/` is this Docusaurus documentation site.
- `shared/` contains TypeScript types shared by the frontend and backend.

The frontend talks to the backend through `/api` routes. Local Vite development can proxy those calls during authoring; the POC deployment path should route them inside Kubernetes.

The backend owns registry inspection, cluster reads, and optional deploy commands. Private registry values and UDS CLI execution stay server-side.

UDS runs on Kubernetes. The app manifests should move toward Kubernetes-native routing and UDS package structure.
