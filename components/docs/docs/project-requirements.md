# Project Requirements

The POC refactors a singular local repo into a Kubernetes-first, containerized monorepo for UDS package discovery, install state, and launch workflows.

## Runtime Areas

| Area | Path | Requirement |
| --- | --- | --- |
| Frontend | `components/frontend/` | React catalog UI, no hard-coded localhost in components, API URL from runtime configuration. |
| Backend | `components/backend/` | Express API, UDS/Zarf command boundary, package metadata, cluster state, health endpoints. |
| Docs | `components/docs/` | Real Docusaurus 3 app, independently runnable, containerized, deployable, visible as a catalog resource. |
| Sample package | `components/catalog-poc/` | Small package used to prove local app deploy and launch behavior. |
| Shared contracts | `shared/` | Cross-app TypeScript contracts. |
| Shared UI | `shared-ui/` | Reusable UI primitives shared by frontend and docs. |

## Core Endpoints

| Route | Purpose |
| --- | --- |
| `GET /api/health` | API health check. |
| `GET /api/packages` | Alias for available registry/package data. |
| `GET /api/uds/status` | UDS CLI, cluster, Core, registry, and Zarf readiness summary. |
| `GET /api/uds/packages` | Available packages discovered from registry/catalog/package refs. |
| `GET /api/uds/installed-packages` | Installed Package CR state from the cluster. |
| `POST /api/uds/packages/:id/install` | Backend-mediated package install. |
| `POST /api/uds/installed-packages/:namespace/:name/undeploy` | Backend-mediated undeploy. |

## Make Flow

| Command | Requirement |
| --- | --- |
| `make setup` | Prepare local tools, npm dependencies, and backend env defaults. |
| `make deploy-uds` | Deploy the standard local UDS path when Docker seccomp support works. |
| `make deploy-uds-macos` | Use the macOS k3d/seccomp workaround path only when needed. |
| `make build` | Build container images for the POC apps. |
| `make up` | Push, package, publish, deploy, and port-forward the base POC apps. |
| `make build/<component>` | Rebuild one component image. |
| `make up/<component>` | Redeploy one component/package into the running cluster. |

## Quality Bar

| Concern | Requirement |
| --- | --- |
| Behavior | Preserve existing app behavior while refactoring. |
| UDS schemas | Do not guess future UDS package schemas; leave explicit notes where shape needs confirmation. |
| Package model | Keep available package metadata separate from installed cluster state. |
| Credentials | Keep registry credentials and UDS/Zarf access in the backend, not the frontend. |
| Docs | Keep docs as a deployed app and a concise explanation of the POC direction. |
| Kubernetes | Prefer Kubernetes manifests and UDS/Zarf packaging over Docker Compose. |

## Open Questions

| Question | Current Status |
| --- | --- |
| Stable registry catalog source | Configurable until confirmed. |
| Production install permissions | Needs hardening before browser-triggered installs are production-ready. |
| User settings persistence | Prisma is optional and should stay backend-owned if added. |
| Final metadata shape | Confirm from real UDS/Zarf package metadata before expanding models. |
