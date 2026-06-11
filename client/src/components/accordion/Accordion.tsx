import type { Slot, SlotChildren } from "@beqa/react-slots";
import { createTemplate, useSlot } from "@beqa/react-slots";
import { Accordion as MuiAccordion, AccordionDetails, AccordionSummary } from "@mui/material";
import { AppIcon } from "../icon/AppIcon.js";

export type AccordionChildren = SlotChildren<Slot<"summary"> | Slot<"details">>;

export const accordionTemplate = createTemplate<AccordionChildren>();

export function Accordion({
  children,
  defaultExpanded
}: {
  children: AccordionChildren;
  defaultExpanded?: boolean;
}) {
  const { slot } = useSlot(children);

  return (
    <MuiAccordion defaultExpanded={defaultExpanded} disableGutters variant="outlined">
      <AccordionSummary expandIcon={<AppIcon name="expand" />}>
        <slot.summary />
      </AccordionSummary>
      <AccordionDetails>
        <slot.details />
      </AccordionDetails>
    </MuiAccordion>
  );
}
