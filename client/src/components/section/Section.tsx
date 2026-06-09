import type { ReactNode } from "react";
import { Box, Chip, Stack, Typography } from "@mui/material";
import type { SectionDefinition } from "./section.types.js";

export function Section<T>({
  children,
  definition,
  items
}: {
  children: ReactNode;
  definition: SectionDefinition<T>;
  items: T[];
}) {
  return (
    <section>
      <Box sx={{ alignItems: "center", display: "flex", justifyContent: "space-between", mb: 1.25 }}>
        <Stack direction="row" sx={{ alignItems: "baseline", gap: 1.5 }}>
          <Typography component="h2" sx={{ fontSize: 28, fontWeight: 800 }}>
            {definition.title}
          </Typography>
          {definition.subtitle ? <Typography color="text.secondary">{definition.subtitle(items)}</Typography> : null}
        </Stack>
        <Chip label={definition.count?.(items) ?? items.length} size="small" />
      </Box>
      {children}
    </section>
  );
}
