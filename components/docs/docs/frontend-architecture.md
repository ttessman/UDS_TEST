# Frontend Architecture

The frontend is the catalog experience. It should stay thin at the app/feature layer and push repeated rendering into shared renderer families.

## Current Direction

| Layer | Responsibility |
| --- | --- |
| `components/frontend/src/features` | Fetch data, own business state, define package/resource presentation, wire install and launch actions. |
| `shared-ui/src/components` | Shared cards, lists, sections, buttons, menus, modals, tables, status chips, and site chrome. |
| `shared/src` | TypeScript contracts shared by frontend and backend. |
| `components/docs/src` | Docs-only microsite composition that can reuse shared UI primitives when it needs the same product look. |

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

## Shared UI Direction

The docs microsite now imports shared frontend UI where visual parity matters, especially resource cards and control buttons. That keeps the sales page aligned with the actual app catalog while still letting docs build its own one-off story sections.
