import type { ReactNode } from "react";
import type { ListState } from "../../list/list.types.js";
import { Section } from "../Section.js";
import type { SectionDefinition } from "../section.types.js";

export type ListSectionDefinition<T, C = undefined> = SectionDefinition<T> & {
  renderList: (args: { context: C; items: T[]; state: ListState }) => ReactNode;
};

export function ListSection<T, C = undefined>({
  context,
  definition,
  items,
  state = "ready"
}: {
  context: C;
  definition: ListSectionDefinition<T, C>;
  items: T[];
  state?: ListState;
}) {
  return (
    <Section items={items} definition={definition}>
      {definition.renderList({ context, items, state })}
    </Section>
  );
}
