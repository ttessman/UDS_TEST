# Backend

Express API for the UDS POC.

The main POC runs this app through Kubernetes and UDS from the repo root:

```bash
make build
make up
```

For local API authoring only:

```bash
cd components/backend
make install
make env
make dev
```

`make env` creates `components/backend/.env` from `.env.example` when it is missing. Keep backend persistence here if Prisma is added later.

## API Summary

- `GET /api/health`
- `GET /api/packages`
- `GET /api/uds/status`
- `GET /api/uds/packages`
- `GET /api/uds/installed-packages`
- `POST /api/uds/packages/:id/install`
- `POST /api/uds/packages/publish`
- `POST /api/uds/packages/:id/unpublish`
- `POST /api/uds/installed-packages/:namespace/:name/undeploy`

The shorter `GET /api/packages` route is an alias for registry package data. Existing UDS-specific routes are kept for current frontend behavior.
