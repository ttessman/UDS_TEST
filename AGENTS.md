# AGENTS.md

## Main Goal

Refactor this singular repo into a clearer containerized monorepo structure with separate frontend, backend, documentation, and sample package areas.

This supports a containerized monorepo for a local UDS package discovery and install-state POC via k8s. The target user flow is:

1. Use make commands to set up local prerequisites. (see existing readme)
2. Deploy UDS Core locally, using the macOS workaround only when needed.
3. Start the backend and frontend containers.
4. Use the frontend to discover package metadata and launch/deploy apps into the UDS cluster.
5. Use the docs app to explain the POC, local development workflow, container workflow, and future Kubernetes/UDS deployment direction.

The refactor is not done until the make-command path is coherent, the app areas are independently runnable/containerized, and the frontend can support the local UDS package launch workflow.

## Engineering Goal

Optimize for:

- Low cognitive load
- Maintainability
- Scalability
- Consistency
- Discoverability

Prefer code that helps Feature 27 ship faster, not just Feature 1.

Higher-level files communicate product intent.
Lower-level files own rendering, styling, layout, repeated behavior, and infrastructure.

---

## Active Resume Checklist: Monorepo Containerization

Read this section first when resuming the repo refactor into containerized POC components.

Current active goal:

- Convert the singular POC repo into a containerized monorepo organized around deployable POC components.
- Keep the POC deployment direction focused on Kubernetes/UDS package structure.
- Make docs a first-class Docusaurus app that documents the POC and can run independently.
- Keep the sample `catalog-poc` package/app as the local UDS package deployment proof point.

Current intended shape:

```text
components/
  frontend/     React 19 + Vite UI container
  backend/      Express API container
  docs/         Docusaurus 3 documentation site container
  catalog-poc/  Sample Zarf/UDS package and sample app container inputs
shared/         Cross-app TypeScript contracts only, not a container
scripts/        Root-level repo/UDS operations, not app utilities
deploy/kubernetes/
kustomization.yaml
                Plain Kubernetes entrypoint for frontend/backend/docs manifests
```

Current decisions:

- Keep React 19 as the repo standard.
- Keep frontend-only UI components under `components/frontend/src/components`.
- Keep `shared/` at the repo root for cross-app domain/API contracts. Do not rename it to `utils`; these are shared types and models, not generic helpers.
- Keep `scripts/` at the repo root because they operate on the whole POC, local registry, k3d/UDS, and repo lifecycle.
- Treat `scripts/` as host-side Make helpers only. Runtime containers should not call repo scripts or depend on local checkout files.
- Script defaults under `scripts/vars/` are build/package/deploy orchestration values, not frontend runtime configuration and not UDS app metadata.
- If Prisma is already present or added, keep it isolated to `components/backend/` and use it for backend-owned persistence such as user settings.
- User settings should move from frontend `localStorage` to API-backed storage once Prisma/backend persistence exists.
- Do not use Docker Compose as a supported path for this POC. UDS runs on Kubernetes.
- The deployment goal remains Kubernetes/UDS manifests and UDS package structure.
- Plain Kubernetes manifests for frontend/backend/docs live under `components/*/manifests`, with root `kustomization.yaml` as the current entrypoint.
- Current exposed UDS hosts are `app.uds.dev` for frontend, `docs.uds.dev` for docs, and `api.uds.dev` for the backend API.
- In-cluster callers should prefer service DNS such as `backend.uds-poc.svc.cluster.local:3001`; browser-facing callers can use the UDS hosts.
- App routing uses UDS Package `network.expose` entries through the tenant gateway. Keep frontend/backend together as the platform package in `uds-poc`. Keep docs as a separate app package in the `docs` namespace. Do not create multiple Package CRs in the same namespace.
- Store data comes from backend-inspected OCI/Zarf package metadata.
- Installed cards come from Kubernetes Package CR state.
- Browser-triggered installs should call the backend API; the backend deploys a selected OCI ref with `zarf package deploy` from inside the backend container.
- The backend container includes the needed CLIs (`kubectl`, `uds`, and `zarf`) and should not shell out to Make or repo scripts.
- The local POC currently grants broad backend cluster permissions so browser-triggered installs can create resources. Harden this before treating the pattern as production-ready.

Current docs status:

- `components/docs/` is now a real Docusaurus app container, not a loose markdown folder.
- Docusaurus content lives under `components/docs/docs/`.
- Starter pages currently include intro, architecture, local development, container runbook, Kubernetes routing, UDS notes, make targets, frontend architecture, and project requirements.
- The docs should explain the POC, the local container workflow, and the future Kubernetes/UDS direction.
- The docs app is a separate Docusaurus app package and is exposed as `https://docs.uds.dev/` from the `docs` Package CR endpoint metadata.
- The primary docs launch path should come from installed package endpoint metadata, not a special nav button.
- The docs root is now a sales-first microsite, not a docs index. Keep `components/docs/src/pages/index.tsx` focused on the POC pitch, product story, and visual proof; keep deeper details under Learn/Reference pages.
- Docs local authoring commands live in `components/docs/Makefile`.
- Latest live check: the docs Package CR is `Ready`, `https://docs.uds.dev/` renders the Introduction page through the UDS tenant gateway, and a cache-bypassed Chrome CDP reload reported zero runtime exceptions.
- Current docs fix: keep the hash-router Docusaurus build path, keep the Docusaurus config/sidebar as `.mjs` files without package-wide `"type": "module"`, and use the custom React microsite page at `components/docs/src/pages/index.tsx` for the root route.
- Do not re-add `"type": "module"` to `components/docs/package.json` without checking the generated browser bundle for raw `require(` calls. Docusaurus generated `.docusaurus/client-modules.js` can otherwise leak build-time `require(...)` into runtime JS.
- `make build/docs` and `make up/docs` have been run after the docs build fix. `deploy-docs` now restarts and waits for the docs Deployment so the mutable `docs:0.1.0` image is pulled after rebuilds.
- Chrome DevTools CDP note: the Raycast Chrome launcher must include `--remote-allow-origins=*`; otherwise HTTP `/json/version` works but WebSocket inspection fails with `403`.
- Component-local authoring commands live in `components/frontend/Makefile`, `components/backend/Makefile`, and `components/docs/Makefile`.
- Historical root docs paths such as `docs/PROJECT_REQUIREMENTS.md` have moved; update IDE tabs and links to `components/docs/docs/project-requirements.md`.

Current command readiness:

- React 19 is the repo standard and is installed for the frontend and docs workspaces.
- Root Makefile commands should stay focused on Kubernetes, UDS, Zarf, registry, and container lifecycle.
- Last known docs build state: `components/docs make build` and root `make build/docs` both pass. Docusaurus uses the hash router, so the sitemap plugin warning is expected and non-fatal.
- Last known backend build state: `npm run build -w @uds-poc/shared`, `npm run build -w @uds-poc/backend`, and `make build/backend` pass.
- Last known backend image: `localhost:5001/uds-poc/backend:0.1.0`.
- Do not assume the full UDS runtime flow is verified yet:
  `make setup && make deploy-uds-macos && make build && make up && make build/catalog-poc && make up/catalog-poc`
- `make up` pushes/packages/publishes/deploys already-built platform and docs images to Kubernetes, then stays running to hold localhost port-forwards open.
- `make build` builds frontend/backend/docs container images. Use `make build/backend`, `make build/frontend`, or `make build/docs` to rebuild one image.
- `make build/catalog-poc` builds the sample app image. `make up/catalog-poc` pushes, packages, publishes, configures, deploys, and verifies the sample app package.
- Use a second terminal for follow-up deploy commands such as `make build/catalog-poc` and `make up/catalog-poc`.
- Before calling the full UDS flow, re-verify cluster state and the local registry/package loop.

Known TODOs:

1. Re-verify the docs installed package launch action from the frontend card.
2. Re-verify cluster health after docs redeploy.
3. Verify the full frontend/backend/docs app image set with `make build`.
4. Verify the frontend/backend platform Zarf package with `make package-platform`.
5. Verify the docs Zarf package with `make package-docs`.
6. Re-verify `make up` from a clean UDS Core state; it should deploy the platform package and docs package, then port-forward frontend/backend/docs.
7. Confirm the backend pod can run `kubectl`, `uds`, and `zarf`, can read Package CRs, and can inspect/deploy the configured local OCI refs.
8. Confirm Store entries include separate `docs` and `catalog-poc` packages, not a generic `uds-poc-apps` bundle.
9. Re-verify the staged catalog sample flow:
   - `make build/catalog-poc`
   - `make up/catalog-poc`
10. Verify the UDS gateway host routing for `https://app.uds.dev/`, `https://api.uds.dev/`, and `https://docs.uds.dev/`.
11. Re-verify the full UDS flow after the move:
   - `make deploy-uds-macos`
   - `make build`
   - `make up`
   - `make build/catalog-poc`
   - `make up/catalog-poc`
12. Confirm the installed package card can launch the docs endpoint URL `https://docs.uds.dev/` from docs Package CR endpoint metadata.
13. Confirm the frontend can show the sample package as both available from registry metadata and installed from Package CR state.
14. Keep `components/catalog-poc` as the sample app/package container area for the local registry push/pull/deploy loop.

---

## UDS macOS Workaround Context

Start with the seccomp issue.

The macOS deploy workaround exists because the official UDS local demo can fail in k3d before Core is useful:

```text
CoreDNS stuck in ContainerCreating
FailedCreatePodSandBox
failed to generate seccomp spec opts: seccomp is not supported
```

Known upstream issue: [Deployment issues on Mac M4 for `deploy k3d-core-demo:latest`](https://github.com/defenseunicorns/uds-core/issues/2237)

The official `k3d-core-demo` bundle creates its own k3d cluster, so a separately pre-created cluster with `--kubelet-arg=seccomp-default=false` is not reused by that path. The workaround target creates the cluster itself with the seccomp flag, then deploys selected non-cluster packages from `k3d-core-slim-dev:latest`.

Operational rules for future agents:

- Prefer `make deploy-uds` when the active Docker runtime supports seccomp.
- Use `make deploy-uds-macos` only for the macOS/k3d seccomp failure path.
- Do not remove the `uds-k3d-dev` skip from the workaround without replacing how the cluster keeps the seccomp flag.
- Do not replace the gateway status patch with `NodePort`; UDS Core Pepr policy rejects NodePort services.
- Do not remove the ServiceLB disablement casually. It avoids local `svclb-*` host-port conflicts across UDS gateway LoadBalancer services.
- Do not remove the gateway `LoadBalancer` status patch casually. With ServiceLB disabled, the patch gives deploy waits an external IP value.
- Use `make uds-debug`, `make verify-uds`, and `make stop-uds-workaround` when diagnosing stuck deploys.

Detailed history and rationale: [components/docs/docs/uds-notes.md](components/docs/docs/uds-notes.md)

---

## Current POC TODOs And Resume Notes

Use this section when resuming the UDS POC work.

Current verified state:

- This state partially predates the latest platform/docs split; re-verify after the current cluster restart.
- `make deploy-uds-macos` can deploy the slim local Core path on macOS with the seccomp workaround.
- `make verify-uds` succeeds even when no literal `uds-core` namespace exists.
- Core evidence currently comes from ready Package CRs:
  - `authservice/authservice Ready`
  - `keycloak/keycloak Ready`
- The frontend should be reached through UDS routing at `https://app.uds.dev/` after `make up`; localhost port-forwards are debug conveniences only.
- The frontend has rendered:
  - UDS installed: yes
  - Cluster reachable: yes
  - UDS Core running: yes
  - Core evidence: `Package CR authservice/authservice Ready`
  - Installed Packages count from real Package CR state
- The installed package side is real cluster state from:

```bash
uds zarf tools kubectl get package -A -o json
```

Current package-source expectations:

- The available package side should not rely on remote fallback Core refs.
- The backend should inspect local OCI/Zarf refs for installable packages.
- The expected local Store refs are docs and catalog-poc, published through the local registry/package loop.
- Docs is a separate app package, exposed as `https://docs.uds.dev/`, and should appear as its own Store/installed package entry.
- Catalog POC is the non-Core sample app package used to prove install/deploy from the Store.
- `uds-poc` is the platform package for frontend/backend, not the installable docs/sample app grouping.

Next required milestone:

- Re-verify the local registry push/pull/deploy loop for docs and catalog-poc after the current restart.
- Confirm the backend can inspect local refs from inside the cluster using `host.k3d.internal:5001`.
- Confirm the backend can deploy selected local OCI refs from the frontend install action.
- This is required before treating the full POC flow as ready end to end.

Current sample app/package state:

1. The sample Zarf package now lives under `components/catalog-poc/`.
2. It includes a simple workload, service, and `uds.dev/v1alpha1` Package CR intended to prove deployment through installed package count/status.
3. Local registry make targets exist:
   - `make registry-up`
   - `make registry-down`
   - `make build/catalog-poc`
   - `make package-catalog-poc`
   - `make publish-catalog-poc`
   - `make up/catalog-poc`
   - `make verify-catalog-poc`
4. The local registry path uses `registry:2` on `localhost:5001`.
5. Package push/publish/deploy steps should use the generic scripts under `scripts/package/`, with app-specific values loaded from `scripts/vars/defaults.env`.
6. `make up/catalog-poc` should deploy the same OCI ref into the active UDS cluster.
7. After verification, confirm the frontend shows:
   - sample package available from registry
   - sample package installed from Package CR
   - total installed package count increased beyond the Core baseline

Important modeling rule:

- Available/published package data remains `RegistryPackage`.
- Cluster-deployed state remains `InstalledPackage`.
- Do not merge these into a generic `App` model until real UDS metadata proves that terminology.

Chrome inspection note:

- The Chrome DevTools MCP bridge may fail because it tries `http://192.168.65.254:9222/json/version` while Chrome binds remote debugging to `127.0.0.1:9222`.
- Direct local CDP inspection worked via Node/WebSocket against Chrome on `127.0.0.1`.

---

## Core Architecture Rule

Prefer:

```text
Core Shell
-> Generic Resource Layer
-> Thin Resource Implementation
```

Use:

- Schemas
- Definitions
- Configuration
- Adapters
- Slots

Avoid duplicating component trees when differences are primarily content, fields, actions, metadata, or styling.

---

## User-Facing Domain Rule

Before creating shared types, definitions, options, labels, or action vocabularies, ask:

- What are the actual user-facing domains?
- Which labels, states, actions, and filters belong to each domain?
- Is a generic/shared lookup truly useful, or is it hiding two clearer domain-specific maps?

For example, registry package concepts and installed package concepts may share words, but they are different user-facing domains. Prefer explicit domain maps such as registry package states/actions and installed package states/actions first. Add combined exports only when callers genuinely need a generic lookup.

---

## Cognitive Load Rule

Page and section level should answer:

- What content is shown?
- What resources are involved?
- What actions exist?
- What business state matters?

Renderer level should answer:

- How is it displayed?
- How is it styled?
- How are loading/empty/error states handled?
- How are fields, actions, and layouts rendered?

If a page mostly contains nested MUI/layout markup, the abstraction is probably too low-level.

---

## Preferred Rendering Order

1. Schema / Definition
2. Slots
3. Composition

Prefer schema/config-driven rendering whenever content is:

- Dynamic
- Repeated
- Resource-based
- Expected to grow

## Slot And State Ownership Rule

Use named slots when a renderer has stable layout regions and the caller should make content easy to see.

Slots own content placement:

- title
- subtitle
- actions
- count actions
- content/body
- footer/global overlays

Props/config own renderer behavior:

- state
- variant
- layout mode
- action placement
- item data/context only when the component is a data renderer

The call site should make visible content easy to discern while the component handles what to do with state. Avoid hiding stable content behind generic `children` or pushing shell-specific state up into pages.

For layout templates, bias toward reducing props to behavior/state and moving visible content into named slots. Resource renderers should generally use the `data`, `content`, and `context` contract:

- `data`: incoming records/resources.
- `content`: visible copy, labels, placeholders, and resource presentation config.
- `context`: runtime state, callbacks, permissions, busy state, and selected values.

Do not add more top-level renderer props when the concern fits one of those buckets. Do not put layout styles into `content`.

Base renderers should be slot shells, not data-mapping containers. A base component such as `List`, `Section`, `Card`, `Modal`, or `Accordion` owns shared layout, spacing, state handling, and styling. Files under `resourceTypes/` are resource adapters: they translate resource data/config/context into the base primitive's slots. They should not become a second reusable shell around the base primitive.

Prefer this shape:

```tsx
const renderedItems = useMemo(
  () => items.map((item) => <ResourceCard key={item.id} item={item} />),
  [items]
);

<List layout={layout} state={{ isEmpty: items.length === 0, status }}>
  <listTemplate.content>
    <>{renderedItems}</>
  </listTemplate.content>
</List>
```

Avoid this shape in base renderers:

```tsx
<List
  content={{
    items: items.map((item) => ({
      key: item.id,
      content: <ResourceCard item={item} />
    }))
  }}
/>
```

If rendering repeated JSX is non-trivial, lift it into a named `const` or `useMemo` before the slot. The slot body should read like placement of content, not a nested render maze.

Slots should usually receive resolved visible content, not render callbacks that make readers chase `summary(item, index, context)` or `details(item, index, context)` to understand the UI. If the point of a slot is readability, pass the actual content into the slot. Keep callback-based renderers for true data mapping layers, not for named content regions.

Prefer:

```tsx
<Section state={{ isEmpty: data.length === 0, status }}>
  <sectionTemplate.content>
    <ResourceList data={data} content={content} context={context} />
  </sectionTemplate.content>
</Section>
```

Avoid page-level prop plumbing such as passing site navigation color-mode handlers through `App` when the site header can own that behavior through context/hooks.

After introducing slots or templates, do a cleanup pass. Remove pass-through wrappers that only render children inside the slot target; put that markup directly in the slot call site when it makes the content easier to scan. Keep the template as the stable shell and keep the slot content visible.

Prefer slot composition over wrapper components when the wrapper mostly forwards layout regions. A resource adapter should make visible product structure easy to scan by composing the base primitive directly:

```tsx
<Card>
  <cardTemplate.header>...</cardTemplate.header>
  <cardTemplate.content>...</cardTemplate.content>
  <cardTemplate.footer>...</cardTemplate.footer>
</Card>
```

Avoid extracting `ThingHeader`, `ThingBody`, `ThingFront`, `ThingBack`, or `ThingContent` when those components only hide the same stable slots behind prop plumbing. Use wrapper components only when they own real reusable behavior or repeated rendering logic.

Renderer files should generally contain the component, closely related local types, and small render-only helpers. Shared value shaping such as normalization, empty-value detection, parsing, grouping, sorting, and label formatting belongs in nearby `*.utils.ts` or feature helper files. Do not hide reusable data logic as private functions inside component files.

Reusable primitives should live in their own base family, not under the first component that uses them. For example, an `Accordion` belongs under `components/accordion`, while `DefinitionItem`, `MetaItem`, and `ListItem` belong under `components/list/items` because they are list item primitives.

---

## Generic Renderer Rule

Prefer:

```tsx
<ResourceSection data={data} content={content} context={context} />
```

```tsx
<ResourceCard item={item} definition={definition} context={context} />
```

```tsx
<AideForm config={formConfig} />
```

Avoid feature-specific components when they mostly duplicate rendering structure.

---

## Resource Adapter Rule

Files under `resourceTypes/` are resource adapters, not new base shells.

A resource adapter should:

- translate resource data/config/context into the base primitive's slots
- keep product intent visible at the adapter level
- compose the base primitive directly
- own resource-specific labels, state mapping, metadata selection, actions, and dialogs

A resource adapter should not:

- create another reusable shell around the base primitive
- hide stable slot regions behind prop-heavy wrapper components
- duplicate base primitive layout responsibilities

If a pattern is reusable across multiple resource adapters, move it down into the base primitive family (`Card`, `List`, `Section`, `Accordion`, etc.) or a nearby generic hook/helper. If an abstraction hides visible content while adding prop plumbing, inline it into the base primitive's slots.

Specialized resource types and section components should earn their existence. Create one when it adds behavior, owns a distinct interaction, hides genuinely complex composition, or prevents meaningful duplication. If the difference is mostly content, fields, visual items, or simple layout, use the base renderer directly with data, slots, and a small render callback.

When a specialized component starts to look like a configurable renderer, push that behavior down into the base primitive instead. For example, a timeline should not remain a bespoke `TimelineSection` if the base `Section` can render items and optional connectors with a callback; make the base renderer capable, then use it directly for timeline content.

Reusable specialized compositions should still use the base primitive. A hero section is acceptable when it defines stable named regions such as `left` and `right`, while the caller provides visible content through slots. Avoid fake data plumbing such as one-item arrays and pointless keys just to force a composition through a list renderer.

---

## Config-First Feature Readability Rule

Feature-level components should read like intent plus data flow:

- define state
- define field/resource/action config
- wire validation or business callbacks
- render the generic configured renderer

Use the same mental model as a form renderer:

```tsx
const fields = [
  { type: "text", name: "username", label: "UserID", validate: validateUserId },
  { type: "password", name: "password", label: "Password" },
  { type: "button", name: "submit", label: "Login" }
];

return (
  <AideForm
    config={fields}
    formData={values}
    errors={errors}
    handleChange={handleChange}
    handleSubmit={handleSubmit}
  />
);
```

Apply this beyond forms:

- cards define fields/meta/actions; renderers own layout
- sections define title/search/count/resources; renderers own layout
- modals define content sections/actions; renderers own chrome and motion
- lists define item shape and mapping; renderers own spacing, empty states, and row/card mechanics

Avoid feature configs that hide nested component trees or inline JSX render mazes. If a definition needs repeated metadata, create a reusable metadata renderer such as `MetaList`, `DefinitionList`, or `ResourceSection` and pass typed config into it.

Metadata renderers should also follow the global renderer model. A `MetaList` should be a list/resource renderer variant with typed item definitions, not a one-off component with ad hoc JSX. Think of it like `AideForm`: each meta entry is a typed field/item definition, and the renderer owns layout, labels, empty values, icons, responsive behavior, and appearance variants.

For larger surfaces, prefer a global typed renderer pattern that can compose multiple node/resource types:

- inputs
- field groups
- nested groups
- lists
- cards
- generic sections
- metadata rows
- buttons/actions
- custom slots/renderers when genuinely needed

The AideForm pattern is the reference model: typed config describes what should exist, shared renderer infrastructure owns how it renders, and style/appearance overrides flow through controlled definition fields instead of ad hoc nested JSX. New renderers should be capable of becoming resource types inside this global renderer model rather than isolated components.

Preferred organization for this pattern:

```text
components/forms/
  aideform.tsx
  inputs/
    aideform.input.text.tsx
    aideform.input.button.tsx
    aideform.input.group.tsx
    aideform.input.search.bar.tsx
  resources/
    aideform.resource.login.form.tsx
    aideform.resource.application.create.tsx
    helpers/
      aideform.resource.user.helpers.tsx
```

Translated to this repo, renderer primitives should live under their base renderer family, while feature/resource definitions live under feature/resource folders as thin config and business logic.

Prefer:

```tsx
<MetaList
  item={package}
  definition={{
    fields: [
      { type: "chip", name: "latestTag", label: "Latest tag", value: (item) => item.latestTag },
      { type: "text", name: "ociReference", label: "OCI reference", value: (item) => item.ociReference }
    ]
  }}
/>
```

Avoid:

```tsx
meta: ({ item }) => (
  <>
    <Chip label={item.latestTag} />
    <Stack>...</Stack>
  </>
)
```

The goal is that a feature file can be scanned like product requirements while the renderer family owns implementation mechanics.

---

## Generic Renderer API Rule

Avoid prop soup.

Bad:

```tsx
<ResourceSection
  title={...}
  subtitle={...}
  count={...}
  emptyMessage={...}
  loadingMessage={...}
  getKey={...}
  layout={...}
/>
```

Prefer:

```tsx
<ResourceSection
  items={items}
  definition={definition}
  context={context}
  state={state}
/>
```

Renderer inputs should generally be:

- `data`: incoming records/resources.
- `content`: visible copy, labels, placeholders, and resource presentation config.
- `context`: runtime behavior/state such as callbacks, busy state, selected IDs, permissions, and search values.

Render state should usually live inside `context` unless it belongs to a lower-level shell such as `List` or `Modal`.

---

## Definition vs Context Rule

Definitions own:

- Titles
- Subtitle logic
- Counts
- Layout variants
- Empty/loading messages
- Item keys
- Display rules
- Renderer definitions

Context owns:

- Callbacks
- Permissions
- Busy state
- Selected IDs
- Resource state
- External dependencies

Definitions describe presentation.
Context describes runtime behavior.

---

## Pattern Recognition Rule

Before creating a component ask:

- Is this a new concept?
- Or just another list?
- Another card?
- Another section?
- Another accordion?
- Another definition list?
- Another tile list?

Prefer definitions for existing renderer families over new component families.

Examples:

```text
CommandLogList -> Accordion List
MetadataFields -> Definition List
Field -> Key/Value Row
MetricGrid -> List rendering metric items/cards through a shared list/card primitive
ShapeInspector -> Accordion Details Renderer
```

---

## Base Primitive Organization Rule

Organize by base primitive first.

Prefer:

```text
components/list/
  List.tsx
  resourceTypes/
    AccordionList.tsx
    DefinitionList.tsx

components/card/
  Card.tsx
  resourceTypes/
    ResourceCard.tsx

components/section/
  Section.tsx
  resourceTypes/
    ResourceSection.tsx
```

Avoid unrelated renderer folders that hide relationships.

---

## Naming Rule

Name by base pattern first, variant second.

Good:

```text
List -> AccordionList
List -> DefinitionList

Card -> ResourceCard

Section -> ResourceSection
```

Avoid ambiguous names when a clearer renderer relationship exists.

---

## Styling Rule

Centralize shared styling in:

- Design system components
- Renderers
- Templates
- Theme overrides
- Shared style objects

One style update should improve most usages.

---

## Frontend Animation Rule

Use Motion for React for reusable component animations.

Prefer animation modules beside the renderer family:

```text
components/card/card.motion.tsx
components/list/list.motion.tsx
components/section/section.motion.tsx
```

Animation modules should own:

- motion tokens
- variants
- reduced-motion behavior
- small animated shell components

Feature/resource definitions should not hand-roll animation mechanics.

If Motion usage expands beyond cards, watch bundle size and consider lazy-loading heavier animation surfaces.

---

## ReactNode Rule

If a type accepts ReactNode, render ReactNode.

Do not silently discard JSX values.

---

## Refactor Acceptance Criteria

A refactor is not complete until:

- Product intent is easier to scan.
- Repeated layout code moved downward.
- Repeated rendering code moved downward.
- Renderer APIs remain small.
- Definitions own display decisions.
- Context owns runtime state.
- Similar renderer patterns are grouped.
- Base primitive relationships are obvious.
- Feature wrappers only exist when they contain real business behavior.

---

## When In Doubt

Push implementation details down.

Keep intent visible.

Prefer renderer families over feature-specific components.

Prefer definitions over duplicated markup.

Prefer base primitive folders with resourceTypes/extensions over unrelated renderer folders.
