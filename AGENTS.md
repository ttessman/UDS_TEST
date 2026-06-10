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
MetricGrid -> Metric Tile List
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
    MetricTileList.tsx

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
List -> MetricTileList

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
