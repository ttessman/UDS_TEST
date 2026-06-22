import { createTemplate, useSlot } from "@beqa/react-slots";
import type { Slot, SlotChildren } from "@beqa/react-slots";
import { Box } from "@mui/material";
import type { SxProps, Theme } from "@mui/material/styles";

type ContentCardChildren = SlotChildren<Slot<"body"> | Slot<"media"> | Slot<"title">>;

export const contentCardTemplate = createTemplate<ContentCardChildren>();

export type ContentCardProps = {
  children: ContentCardChildren;
  sx?: SxProps<Theme>;
  titleHeading?: "h1" | "h2" | "h3";
};

export function ContentCard({ children, sx, titleHeading = "h3" }: ContentCardProps) {
  const { hasSlot, slot } = useSlot(children);

  return (
    <Box sx={sx}>
      {hasSlot.media ? <slot.media /> : null}
      {hasSlot.title ? <Box component={titleHeading}><slot.title /></Box> : null}
      {hasSlot.body ? <slot.body /> : null}
    </Box>
  );
}
