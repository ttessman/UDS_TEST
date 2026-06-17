import { createTemplate, useSlot } from "@beqa/react-slots";
import { Box, Stack, Typography } from "@mui/material";
import type { SectionChildren } from "./section.types.js";

export const sectionTemplate = createTemplate<SectionChildren>();

export function Section({ children }: { children: SectionChildren }) {
  const { hasSlot, slot } = useSlot(children);
  const hasActions = hasSlot.actions;
  const hasHeader = hasSlot.header;
  const hasSubtitle = hasSlot.subtitle;
  const hasTitle = hasSlot.title;

  return (
    <section>
      <Box
        sx={{
          alignItems: { xs: "stretch", lg: "flex-start" },
          display: "flex",
          flexDirection: { xs: "column", lg: "row" },
          gap: 2,
          justifyContent: "space-between",
          mb: 1.25
        }}
      >
        <Stack sx={{ flex: { xs: "0 1 auto", lg: "1 1 520px" }, gap: 0.5, minWidth: 0 }}>
          {hasHeader ? (
            <slot.header />
          ) : hasTitle ? (
            <Typography component="h2" sx={{ fontSize: 28, fontWeight: 800 }}>
              <slot.title />
            </Typography>
          ) : null}
          {hasSubtitle ? (
            <Typography color="text.secondary" sx={{ maxWidth: 760 }}>
              <slot.subtitle />
            </Typography>
          ) : null}
        </Stack>
        {hasActions ? (
          <Stack
            direction="row"
            sx={{
              alignItems: "center",
              flex: { xs: "0 1 auto", lg: "0 1 380px" },
              flexWrap: "wrap",
              gap: 1,
              justifyContent: { xs: "flex-start", lg: "flex-end" },
              maxWidth: "100%",
              minWidth: 0,
              pt: { lg: 0.15 },
              width: { xs: "100%", lg: "auto" }
            }}
          >
            <slot.actions />
          </Stack>
        ) : null}
      </Box>
      <slot.content />
    </section>
  );
}
