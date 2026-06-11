# AGENTS.md

## Primary Goal

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

Detailed history and rationale: [docs/MACOS_UDS_WORKAROUND.md](docs/MACOS_UDS_WORKAROUND.md)

---

## Current POC TODOs And Resume Notes

Use this section when resuming the UDS POC work.

Current verified state:

- `make deploy-uds-macos` can deploy the slim local Core path on macOS with the seccomp workaround.
- `make verify-uds` succeeds even when no literal `uds-core` namespace exists.
- Core evidence currently comes from ready Package CRs:
  - `authservice/authservice Ready`
  - `keycloak/keycloak Ready`
- The frontend at `http://localhost:5173/` renders:
  - UDS installed: yes
  - Cluster reachable: yes
  - UDS Core running: yes
  - Core evidence: `Package CR authservice/authservice Ready`
  - Installed Packages count: 2
- The installed package side is real cluster state from:

```bash
uds zarf tools kubectl get package -A -o json
```

Known mismatch to fix next:

- The available package side is still using fallback refs:
  - `oci://ghcr.io/defenseunicorns/packages/uds/core:latest`
  - `oci://ghcr.io/defenseunicorns/packages/uds/podinfo:latest`
- Both currently fail `zarf package inspect definition` on arm64 with `not found`.
- This means the UI correctly distinguishes Registry Packages vs Installed Packages, but the Registry Package source is not yet a useful local app-package source.

Next required milestone:

- Add a local registry push/pull/deploy loop for a non-Core sample app package.
- This is required to test real app packages end to end.

Recommended implementation order:

1. Add a tiny sample Zarf package under `examples/uds-poc-sample/`.
2. Include a simple workload, service, and a valid `uds.dev/v1alpha1` Package CR so installed package count/status can prove deployment.
3. Add local registry make targets, likely:
   - `make registry-up`
   - `make registry-down`
   - `make package-sample`
   - `make publish-sample`
   - `make deploy-sample`
   - `make verify-sample`
4. Prefer a separate local `registry:2` on `localhost:5001` for the first POC loop unless there is a deliberate reason to use the in-cluster Zarf registry.
5. After publish, set or generate `UDS_REGISTRY_PACKAGE_REFS` to the local OCI ref so `GET /api/uds/packages` reads the sample from real OCI/package metadata.
6. Deploy the same OCI ref through the backend or make target.
7. Confirm the frontend shows:
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

For layout templates, bias toward reducing props to behavior/state and moving visible content into named slots. Data renderers can still accept `items`, `definition`, and `context` because those are the resource rendering contract.

Base renderers should be slot shells, not data-mapping containers. A base component such as `List`, `Section`, `Card`, `Modal`, or `Accordion` owns shared layout, spacing, state handling, and styling. Specialized resource components render the actual children and place that resolved content into named slots.

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
<Section items={items} definition={definition} state={state}>
  <sectionTemplate.content>
    <ResourceList items={items} definition={resourceDefinition} />
  </sectionTemplate.content>
</Section>
```

Avoid page-level prop plumbing such as passing site navigation color-mode handlers through `App` when the site header can own that behavior through context/hooks.

After introducing slots or templates, do a cleanup pass. Remove pass-through wrappers that only render children inside the slot target; put that markup directly in the slot call site when it makes the content easier to scan. Keep the template as the stable shell and keep the slot content visible.

Renderer files should generally contain the component, closely related local types, and small render-only helpers. Shared value shaping such as normalization, empty-value detection, parsing, grouping, sorting, and label formatting belongs in nearby `*.utils.ts` or feature helper files. Do not hide reusable data logic as private functions inside component files.

Reusable primitives should live in their own base family, not under the first component that uses them. For example, an `Accordion` belongs under `components/accordion`, while `DefinitionItem`, `MetaItem`, and `ListItem` belong under `components/list/items` because they are list item primitives.

---

## Generic Renderer Rule

Prefer:

```tsx
<ResourceSection items={items} definition={definition} context={context} state={state} />
```

```tsx
<ResourceCard item={item} definition={definition} context={context} />
```

```tsx
<AideForm config={formConfig} />
```

Avoid feature-specific components when they mostly duplicate rendering structure.

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

- Data/content
- Definition/config
- Context
- Render state

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
MetricGrid -> List rendering MetricCard
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
    MetricCard.tsx
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
Card -> MetricCard

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
