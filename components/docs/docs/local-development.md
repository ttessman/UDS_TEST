---
sidebar_position: 3
---

# Local Development

The normal POC path runs through Kubernetes and UDS from the root Makefile. Local app authoring commands live in each component folder.

Frontend local authoring:

```bash
cd components/frontend
make install
make dev
```

Backend local authoring:

```bash
cd components/backend
make install
make env
make dev
```

Docs local authoring:

```bash
cd components/docs
make install
make dev
```

Default local ports:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3001`
- Docs: `http://localhost:3002/` by default. Local npm scripts read `HOST` and `PORT`, defaulting to `127.0.0.1` and `3002`.

The frontend uses relative `/api` paths by default so Vite, nginx, or the Kubernetes routing layer can proxy them.
