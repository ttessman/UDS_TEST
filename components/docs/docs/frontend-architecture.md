# Frontend Architecture

The frontend is the catalog experience. It should stay thin at the app and feature layer, while repeated rendering lives in shared renderer families.

## Source Layout

| Layer | Responsibility |
| --- | --- |
| `components/frontend/src/App.tsx` | App composition, page-level state, refresh orchestration, and feature wiring. |
| `components/frontend/src/api/` | Browser API clients for backend endpoints. |
| `components/frontend/src/components/` | Frontend-only UI surfaces, renderer adapters, and subcomponents. Files that render JSX belong here, including package resource definitions and status indicator composition. |
| `components/frontend/src/hooks/` | App-level hooks that coordinate runtime behavior, such as package actions and user preferences. |
| `components/frontend/src/types/` | Frontend domain types plus typed definition constants such as package states and action labels. |
| `components/frontend/src/store/` | State storage helpers only. Stores should not own React hook composition. |
| `components/frontend/src/utils/` | Pure TypeScript domain behavior, package shaping, endpoint formatting, filters, and metadata helpers. No JSX should live here. |
| `shared-ui/src/components/` | Shared cards, lists, sections, buttons, menus, modals, tables, status chips, and site chrome. |
| `shared-ui/src/lib/` | Shared formatting and shape utilities used by frontend and docs UI. |
| `shared/src/` | TypeScript contracts shared by frontend and backend. |

The docs app may import shared UI primitives when it needs the same product look, but docs-only storytelling components stay in the docs container.

## Renderer Pattern

Prefer this shape:

```tsx
<ResourceSection data={items} content={content} context={context} />
```

The buckets are:

| Bucket | Owns |
| --- | --- |
| `data` | Incoming records/resources. |
| `content` | Visible labels, copy, empty messages, and presentation definitions. |
| `context` | Runtime callbacks, permissions, busy state, selected IDs, and external dependencies. |

## Component Rule

Before adding a component, ask whether it is really a new concept or just another card, list, section, table, modal, or metadata renderer. If it is a renderer variant, keep it under that base family and use `resourceTypes/` only for adapters that translate domain data into the base primitive.

## Frontend Organization

| Folder | Current Role |
| --- | --- |
| `components/` | `CatalogStoreSection`, `RegistryPackageTable`, modal composition, package resource adapters, status indicator composition, and package presentation subcomponents. |
| `hooks/` | Runtime hooks such as `usePackageActions` and `useUserPreferences`. |
| `types/` | Package context types, backend modal types, and package definition constants. |
| `utils/` | Pure package actions, filters, endpoint helpers, catalog shaping, and package metadata helpers. |
| `store/` | User preference persistence helpers. |

Package data remains split by domain:

| Domain | Meaning |
| --- | --- |
| Registry packages | Available package metadata from registry/OCI/package inspection. |
| Installed packages | Live cluster state from Kubernetes Package custom resources. |

Do not collapse these into one generic app model until real UDS metadata proves the shape.

## Shared UI Direction

The docs microsite now imports shared frontend UI where visual parity matters, especially resource cards and control buttons. That keeps the sales page aligned with the actual app catalog while still letting docs build its own one-off story sections.
