import { List } from "../../list/List.js";
import type { ListDefinition, ListLayout, ListState } from "../../list/list.types.js";
import { ResourceCard, type ResourceCardDefinition } from "../../card/resourceTypes/ResourceCard.js";
import { Section } from "../Section.js";
import type { SectionDefinition } from "../section.types.js";

export type ResourceSectionDefinition<T extends object, C = undefined> = SectionDefinition<T> & {
  emptyMessage: string;
  getKey: (item: T) => string;
  layout?: ListLayout;
  loadingMessage?: string;
  resource: ResourceCardDefinition<T, C>;
};

export function ResourceSection<T extends object, C = undefined>({
  context,
  definition,
  items,
  state = "ready"
}: {
  context: (item: T) => C;
  definition: ResourceSectionDefinition<T, C>;
  items: T[];
  state?: ListState;
}) {
  return (
    <Section items={items} definition={definition}>
      <List
        items={items}
        context={context}
        state={state}
        definition={{
          emptyMessage: definition.emptyMessage,
          getKey: (item) => definition.getKey(item),
          layout: definition.layout,
          loadingMessage: definition.loadingMessage,
          renderItem: ({ context: getItemContext, item }) => (
            <ResourceCard item={item} definition={definition.resource} context={getItemContext(item)} />
          )
        } satisfies ListDefinition<T, (item: T) => C>}
      />
    </Section>
  );
}
