# Frontend

React 19 + Vite UI for the UDS POC.

The main POC runs this app through Kubernetes and UDS from the repo root:

```bash
make build
make up
```

For local UI authoring only:

```bash
cd components/frontend
make install
make dev
```

The local Vite dev server proxies `/api` to the backend dev server and `/docs` to the docs dev server.
