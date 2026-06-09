import type { ReactNode } from "react";
import { Accordion, AccordionDetails, AccordionSummary } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { List } from "../List.js";
import type { ListDefinition, ListState } from "../list.types.js";

export type AccordionListDefinition<T, C = undefined> = {
  defaultExpanded?: (item: T, index: number, context: C) => boolean;
  details: (item: T, index: number, context: C) => ReactNode;
  emptyMessage?: string;
  getKey: (item: T, index: number) => string;
  loadingMessage?: string;
  summary: (item: T, index: number, context: C) => ReactNode;
};

export function AccordionList<T, C = undefined>({
  context,
  definition,
  items,
  state = "ready"
}: {
  context: C;
  definition: AccordionListDefinition<T, C>;
  items: T[];
  state?: ListState;
}) {
  const listDefinition = {
    emptyMessage: definition.emptyMessage,
    getKey: definition.getKey,
    layout: { gap: 1 },
    loadingMessage: definition.loadingMessage,
    renderItem: ({ context: listContext, index, item }) => (
      <Accordion
        defaultExpanded={definition.defaultExpanded?.(item, index, listContext)}
        disableGutters
        variant="outlined"
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>{definition.summary(item, index, listContext)}</AccordionSummary>
        <AccordionDetails>{definition.details(item, index, listContext)}</AccordionDetails>
      </Accordion>
    )
  } satisfies ListDefinition<T, C>;

  return <List items={items} definition={listDefinition} context={context} state={state} />;
}
