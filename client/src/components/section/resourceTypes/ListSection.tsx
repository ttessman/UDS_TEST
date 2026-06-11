import type { ReactNode } from "react";
import type { ListState } from "../../list/list.types.js";
import { Section, sectionTemplate } from "../Section.js";

export type ListSectionDefinition<T, C = undefined> = {
  actions?: ReactNode;
  renderList: (args: { context: C; items: T[]; state: ListState }) => ReactNode;
  subtitle?: (items: T[]) => ReactNode;
  title: ReactNode;
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
    <Section>
      <sectionTemplate.title>
        {definition.title}
      </sectionTemplate.title>
      <sectionTemplate.actions>
        <>{definition.actions}</>
      </sectionTemplate.actions>
      <sectionTemplate.subtitle>
        <>{definition.subtitle?.(items)}</>
      </sectionTemplate.subtitle>
      <sectionTemplate.content>
        {definition.renderList({ context, items, state })}
      </sectionTemplate.content>
    </Section>
  );
}
