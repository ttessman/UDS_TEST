# Frontend Architecture

This frontend should prefer reusable core primitives over duplicated implementations, without forcing every UI into one abstraction.

## Component Direction
pre
- The second similar implementation is a signal to evaluate a shared primitive.
- Shared structure, styling, behavior, and rendering should live in core components.
- Page-level code should stay focused on intent, content, and user experience.
- Prefer composition and named slots for custom layouts.
- Prefer config-driven rendering for systematic, repeatable patterns such as metadata fields.
- Avoid large prop APIs when slots or renderers keep the call site clearer.
- Put readable intent as high as practical. Push repeatable rendering details down.
- Generic renderers should group inputs as data, definition/config, context, and render state rather than accumulating one-off props.

This applies to all reusable components. Cards, sections, metric lists, tables, forms, modals, and log viewers should all prefer:

```text
Data -> Definition/Config -> Context -> Render State
```

over long one-off prop lists.

## Relationship Rule

Before adding a new component, ask whether it is a new concept or a variant of an existing renderer. If it is just a card, list, field, accordion, grid, section, metric, or log pattern, extend that renderer family with a typed definition instead of creating another standalone component.

Current renderer families live under `client/src/components` by base rendering pattern:

- `list`: `List` plus list-specific extensions such as `DefinitionList`, `AccordionList`, and `MetricTileList`.
- `card`: `Card` plus card-specific extensions such as `ResourceCard`.
- `section`: `Section` plus section-specific extensions such as `ResourceSection` and `ListSection`.

Name components by base pattern first, then variant:

- `List -> AccordionList`
- `List -> DefinitionList`
- `List -> MetricTileList`
- `Card -> ResourceCard`
- `Section -> ResourceSection`

Avoid ambiguous names such as `DisclosureList` unless `Disclosure` is the actual base renderer family.

Feature-specific files live under `client/src/features` and should stay thin: select data, pass business context, and choose renderer definitions.

## Current Pattern

The card path follows:

```text
Core Shell -> Generic Resource Renderer -> Typed Resource Definition
```

`ResourceCard` is the only card renderer for package-like resources. It owns the shared shell, layout, styling, metadata rendering, shape inspection, actions area, and command preview behavior.

Resource-specific behavior lives in feature definition files, such as `packageResourceDefinitions.tsx`, `statusDefinitions.ts`, and `logDefinitions.tsx`:

- labels
- titles
- icons
- status chips
- metadata fields
- action renderers
- raw shape sources

Avoid adding files such as `UserCard.tsx`, `ProjectCard.tsx`, `PackageCard.tsx`, or `AppCard.tsx` when the differences can be represented by a typed resource definition.

Do not stop at extracting JSX into smaller layout pieces such as `ResourceCardShell`, `ResourceCardBody`, or `ResourceCardActions`. Those may exist as private implementation details, but resource files should render through the single typed renderer:

```tsx
<ResourceCard item={resource} definition={resourceCardDefinition} context={context} />
```

The renderer owns the repeated structure. Definitions describe what changes.

`DefinitionList` is the current config-driven renderer for repeatable object fields. Use that pattern when the display is systematic and should reveal field changes over time.

`ResourceSection` is the section-level renderer. Product code should describe which resources are shown, what business context matters, and what render state applies. The renderer owns grid/list layout, section framing, empty-state rendering, loading-state rendering, and repeated resource-card mapping.

Current hierarchy:

```text
App/Page
  -> ResourceSection
    -> ResourceCard
      -> ResourceDefinition
```

Ownership:

- `App/Page`: product sections, resource selection, and business context.
- `ResourceSection`: headers, grid/list layout, item mapping, empty states, loading states.
- `ResourceCard`: card layout, status, metadata, actions, shape rendering.
- `packageResourceDefinitions`: labels, fields, actions, business-specific presentation.

Renderer API shape:

```tsx
<ResourceSection
  items={packages}
  definition={registryPackagesSection(totalPackages)}
  context={sectionContext}
  state={state}
/>
```

If renderer props start growing into one-off values such as `title`, `emptyMessage`, `getKey`, `gridTemplateColumns`, or `loadingMessage`, move those values into the typed definition.

Acceptance check: if two feature files contain mostly identical layout, grid, empty-state, loading-state, or card-mapping code, the abstraction is incomplete.

## When To Add Another Primitive

Add a shared primitive when two components repeat the same structure, behavior, or styling and the extraction keeps the call sites easier to read.

Do not add an abstraction just because two files both use MUI. Keep local composition when the repeated code is incidental or the abstraction would become a large option bag.
