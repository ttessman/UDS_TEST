---
sidebar_position: 2
---

# Architecture

The POC is a Kubernetes-first monorepo. Each runtime concern is isolated, containerized, and deployable through the local UDS/Zarf workflow.

| Area | Path | Owns |
| --- | --- | --- |
| Frontend | `components/frontend/` | React catalog UI, package/resource presentation, install actions, launch affordances |
| Backend | `components/backend/` | Express API, UDS/Zarf command boundary, registry inspection, Kubernetes reads |
| Docs | `components/docs/` | Docusaurus microsite and technical follow-up docs |
| Shared contracts | `shared/` | Cross-app TypeScript API/domain types |
| Shared UI | `shared-ui/` | Reusable React renderers and design primitives used by frontend and docs |
| Sample package | `components/catalog-poc/` | Small deployable package used to prove app install and launch flows |

## Request Flow

| Step | Runtime | Description |
| --- | --- | --- |
| Discover | Frontend -> Backend | UI calls `/api` routes for registry/package data. |
| Inspect | Backend -> UDS/Zarf | Backend reads package metadata and Kubernetes Package CRs. |
| Install | Frontend -> Backend -> Cluster | Browser asks the API to install; the backend performs the privileged UDS/Zarf action. |
| Launch | Frontend -> UDS route | Installed resources expose named launch URLs such as `app.uds.dev` or `docs.uds.dev`. |

## Security Boundary

| Concern | Decision |
| --- | --- |
| Registry credentials | Stay server-side in backend runtime configuration. |
| UDS/Zarf CLI access | Owned by the backend container, not the browser. |
| User-facing state | Displayed by the frontend from API responses and Package CR state. |
| Production hardening | Move toward scoped Kubernetes permissions, audited backend actions, and confirmed UDS package metadata schemas. |

UDS runs on Kubernetes. The app manifests and local package model should continue moving toward Kubernetes-native routing and UDS package structure.
