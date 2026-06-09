# Make Targets

Run `make` or `make help` to print the command list.

## First Run

```bash
make setup-macos
make env
make install
make dev
```

Open:

```text
http://localhost:5173
```

## Verification

```bash
make typecheck
make build
make verify-uds
```

## UDS Helpers

```bash
make inspect-packages
make installed-packages
make deploy-core
```

`make deploy-core` defaults to the official local demo bundle `k3d-core-demo:latest`.

## Common Environment

Put local values in `server/.env`:

```bash
UDS_REGISTRY_PACKAGE_REFS=oci://ghcr.io/defenseunicorns/packages/uds/core:latest,oci://ghcr.io/defenseunicorns/packages/uds/podinfo:latest
UDS_REGISTRY_CATALOG_URL=
UDS_REGISTRY_CATALOG_PATH=
UDS_CORE_BUNDLE_REF=k3d-core-demo:latest
UDS_POC_ENABLE_INSTALL=false
UDS_REGISTRY_USERNAME=
UDS_REGISTRY_PASSWORD=
```
