import type { ReactNode } from "react";
import { Box, Typography } from "@mui/material";

export function DefinitionItem({
  density,
  label,
  value
}: {
  density: "comfortable" | "compact" | "dense";
  label: string;
  value: ReactNode;
}) {
  const compact = density === "compact";
  const dense = density === "dense";

  return (
    <Box
      sx={{
        alignItems: "start",
        display: "grid",
        gap: dense ? 0.5 : 0.75,
        gridTemplateColumns: { xs: "1fr", sm: `${dense ? 96 : 132}px minmax(0, 1fr)` }
      }}
    >
      <Typography color="text.secondary" component="dt" sx={{ fontSize: compact || dense ? 13 : 14, fontWeight: 700, lineHeight: dense ? 1.2 : 1.35 }}>
        {label}
      </Typography>
      <Typography component="dd" sx={{ fontSize: compact || dense ? 13 : 14, fontWeight: 500, lineHeight: dense ? 1.2 : 1.35, m: 0, overflowWrap: "anywhere" }}>
        {value}
      </Typography>
    </Box>
  );
}
