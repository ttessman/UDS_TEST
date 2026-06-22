---
sidebar_position: 99
---

# History & Notes

This POC started as a local app catalog and moved into a Kubernetes-first monorepo so the UI can model how UDS packages are actually discovered, installed, deployed, and launched.

| Decision | Current Direction |
| --- | --- |
| Runtime model | Kubernetes and UDS/Zarf packages, not Docker Compose. |
| App areas | Frontend, backend, docs, and sample packages live as separate containerized components. |
| Docs role | The docs app is both a deployed catalog item and a sales-first explanation of the POC. |
| Security boundary | Browser actions go through the backend; UDS/Zarf access stays server-side. |
| UI model | Installed resources come from Package CR state; available packages come from registry/package metadata. |
| Shared UI | Frontend components are moving into `shared-ui/` so docs can reuse the same catalog look where useful. |

Open decisions remain around the stable registry catalog source, production-grade backend permissions, and the final UDS package metadata shape.
