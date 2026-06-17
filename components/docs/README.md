# Docs

Docusaurus 3 documentation app for the UDS POC.

The main POC runs docs through Kubernetes and UDS from the repo root:

```bash
make build
make up
```

For local docs authoring only:

```bash
cd components/docs
make install
make dev
```

Local docs default to `http://127.0.0.1:3002/`. The container image builds the static Docusaurus site and serves the generated output through nginx.
