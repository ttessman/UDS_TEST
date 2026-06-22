import { useMemo, type ReactNode } from "react";
import { Accordion, accordionTemplate } from "../../accordion/Accordion.js";
import { List, listTemplate } from "../List.js";
import type { ListState } from "../list.types.js";

export type AccordionListItem = {
  defaultExpanded?: boolean;
  details: ReactNode;
  key: string;
  summary: ReactNode;
};

export type AccordionListDefinition = {
  emptyMessage?: string;
  loadingMessage?: string;
};

export function AccordionList({
  definition,
  items,
  state = "ready"
}: {
  definition: AccordionListDefinition;
  items: AccordionListItem[];
  state?: ListState;
}) {
  const accordionItems = useMemo(
    () =>
      items.map((item) => (
        <Accordion key={item.key} defaultExpanded={item.defaultExpanded}>
          <accordionTemplate.summary>{item.summary}</accordionTemplate.summary>
          <accordionTemplate.details>{item.details}</accordionTemplate.details>
        </Accordion>
      )),
    [items]
  );

  return (
    <List
      layout={{ gap: 1 }}
      state={{
        emptyMessage: definition.emptyMessage,
        isEmpty: items.length === 0,
        loadingMessage: definition.loadingMessage,
        status: state
      }}
    >
      <listTemplate.content>
        <>{accordionItems}</>
      </listTemplate.content>
    </List>
  );
}
