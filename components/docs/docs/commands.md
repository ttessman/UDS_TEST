---
sidebar_position: 8
---

# Commands

Run `make` or `make help` from the repo root to print the command list.

## Base Flow

| Command | Purpose |
| --- | --- |
| `make setup` | Installs local dependencies and prepares backend env defaults. |
| `make deploy-uds` | Starts the local registry, deploys the official local UDS path, and verifies the cluster. |
| `make deploy-uds-macos` | Uses the macOS k3d/seccomp workaround path. |
| `make build` | Builds frontend, backend, and docs container images. |
| `make up` | Pushes, packages, publishes, deploys, and port-forwards the base POC apps. |

## Staged Base Package

| Command | Purpose |
| --- | --- |
| `make build/frontend` | Builds the frontend image. |
| `make build/backend` | Builds the backend image. |
| `make build/docs` | Builds the docs image. |
| `make package-platform` | Creates the frontend/backend platform Zarf package. |
| `make publish-platform` | Publishes the platform package to the local registry. |
| `make deploy-platform` | Deploys the platform package to the cluster. |
| `make package-docs` | Creates the docs Zarf package. |
| `make publish-docs` | Publishes the docs package to the local registry. |
| `make deploy-docs` | Deploys and restarts the docs package rollout. |

## Sample Package

| Command | Purpose |
| --- | --- |
| `make build/catalog-poc` | Builds the sample app image. |
| `make up/catalog-poc` | Pushes, packages, publishes, deploys, and verifies the sample package. |
| `make verify-catalog-poc` | Rechecks the sample package without rebuilding. |

## Debug

| Command | Purpose |
| --- | --- |
| `make verify-uds` | Verifies the cluster and installed Package CRs. |
| `make uds-debug` | Prints a focused UDS and cluster diagnostic snapshot. |
| `make down` | Removes repo-deployed apps, the local UDS cluster, and the local registry. |
| `make down-deploy` | Removes repo-deployed sample app namespaces from the current cluster. |
