---
sidebar_position: 2
---

# Quickstart

Use the root Makefile for the Kubernetes and UDS path. The POC is not Docker Compose based.

## Standard Path

```bash
make setup
make deploy-uds
make build
make up
```

## macOS Workaround Path

Use this path only when the official UDS local deploy fails with the known k3d seccomp issue.

```bash
make setup
make deploy-uds-macos
make build
make up
```

By the end of `make up`, the frontend, backend, and docs packages should be deployed into the local UDS cluster.

Open:

- App catalog: `https://app.uds.dev/`
- Docs site: `https://docs.uds.dev/`
- Backend API: `https://api.uds.dev/api/health`

## Add A Sample Package

After the base stack is running, deploy the sample package from another terminal:

```bash
make build/catalog-poc
make up/catalog-poc
```

The same staged shape applies to future installable packages:

```bash
make build/<component>
make up/<component>
```
