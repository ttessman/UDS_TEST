import { createTemplate, useSlot, type Slot, type SlotChildren } from "@beqa/react-slots";
import { Box } from "@mui/material";

export const siteContentSx = {
  maxWidth: 1280,
  mx: "auto",
  px: { xs: 2, sm: 3, md: 4 },
  width: "100%"
} as const;

export type SiteShellChildren = SlotChildren<Slot<"header"> | Slot<"content"> | Slot<"footer">>;

export const siteTemplate = createTemplate<SiteShellChildren>();

export function SiteShell({ children }: { children: SiteShellChildren }) {
  const { slot } = useSlot(children);

  return (
    <Box sx={{ bgcolor: "var(--app-bg-default)", display: "flex", flexDirection: "column", minHeight: "100dvh" }}>
      <slot.header />
      <Box component="main" sx={{ flex: "1 0 auto", pb: { xs: 6, md: 8 } }}>
        <slot.content />
      </Box>
      <slot.footer />
    </Box>
  );
}
