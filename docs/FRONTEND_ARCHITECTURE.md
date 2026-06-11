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
- Named slots expose stable content regions while props/config describe renderer behavior and state.

This applies to all reusable components. Cards, sections, lists, tables, forms, modals, and log viewers should all prefer:

```text
Data -> Definition/Config -> Context -> Render State
```

over long one-off prop lists.

## Slots And State

Use slots when a renderer has stable regions and the caller should make content obvious.

Examples:

- `SiteShell`: owns invariant header chrome; exposes content and footer slots.
- `Section`: owns section layout; exposes content/action/title regions and uses state/config to decide behavior.
- Future modal templates: should own modal chrome and expose content/action slots.

The rule is:

- Content should be visible and easy to discern at the call site.
- State should stay as a small renderer input.
- The renderer decides what loading, empty, hidden, or action-placement state means.
- Layout templates should reduce props toward behavior/state and use named slots for visible content.
- Data renderers can still accept `items`, `definition`, and `context`; that is their resource rendering contract.

This keeps page files readable without making them responsible for layout mechanics.

Base renderers are slot shells. They own shared mechanics such as grid layout, empty/loading state, spacing, and styling. Specialized resource components render the actual repeated children and place the resolved content into the base renderer's slots.

Prefer preparing visible children before the slot:

```tsx
const rows = useMemo(
  () => fields.map((field) => <DefinitionItem key={field.key} field={field} />),
  [fields]
);

<List state={{ isEmpty: fields.length === 0 }}>
  <listTemplate.content>
    <>{rows}</>
  </listTemplate.content>
</List>
```

Avoid passing nested `{ key, content }` objects into base renderers when slots can show the content directly.

Slots should expose resolved content. Avoid named slots that merely wrap callback output such as `summary(item, index, context)` or `details(item, index, context)` when the caller could pass the summary/details content directly. Callback render functions belong in true data renderers; named slots belong to readable content regions.

After adding slots or templates, remove pass-through wrappers that no longer carry behavior. A wrapper that only places `children` in a container is usually cleanup debt once the template can own placement and the call site can show content directly.

Keep component files renderer-focused. Shared normalization, empty-value checks, parsing, grouping, and formatting should live in nearby utility/helper files rather than private functions inside the renderer.

## Relationship Rule

Before adding a new component, ask whether it is a new concept or a variant of an existing renderer. If it is just a card, list, field, accordion, grid, section, metric, or log pattern, extend that renderer family with a typed definition instead of creating another standalone component.

Current renderer families live under `client/src/components` by base rendering pattern:

- `list`: `List` plus list-specific extensions such as `DefinitionList` and `AccordionList`.
- `list/items`: list-only item primitives such as `ListItem`, `DefinitionItem`, and `MetaItem`.
- `accordion`: reusable accordion primitives shared by list/card/resource renderers.
- `card`: `Card` plus card-specific extensions such as `ResourceCard` and `MetricCard`.
- `section`: `Section` plus section-specific extensions such as `ResourceSection` and `ListSection`.

Name components by base pattern first, then variant:

- `List -> AccordionList`
- `List -> DefinitionList`
- `Card -> ResourceCard`
- `Card -> MetricCard`
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

`ResourceSection` is the section-level renderer. Product code should describe which resources are shown, what visible content belongs to the section, and what runtime state matters. The renderer owns grid/list layout, section framing, empty-state rendering, loading-state rendering, search placement, count/refresh placement, and repeated resource-card mapping.

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
  data={packages}
  content={sectionContent}
  context={sectionContext}
/>
```

Use the three-bucket contract:

- `data`: incoming records/resources.
- `content`: visible copy, labels, placeholders, and resource presentation config.
- `context`: runtime state and behavior, including callbacks, busy state, selected IDs, permissions, and search values.

Do not add more top-level props when the concern fits one of those buckets. Do not place layout styles in `content`; layout belongs to the renderer or a lower-level shell.

Acceptance check: if two feature files contain mostly identical layout, grid, empty-state, loading-state, or card-mapping code, the abstraction is incomplete.

## When To Add Another Primitive

Add a shared primitive when two components repeat the same structure, behavior, or styling and the extraction keeps the call sites easier to read.

Do not add an abstraction just because two files both use MUI. Keep local composition when the repeated code is incidental or the abstraction would become a large option bag.
