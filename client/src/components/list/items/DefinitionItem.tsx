import type { ReactNode } from "react";
import { Box, Typography } from "@mui/material";

export function DefinitionItem({
  density,
  label,
  value
}: {
  density: "comfortable" | "compact";
  label: string;
  value: ReactNode;
}) {
  const compact = density === "compact";

  return (
    <Box
      sx={{
        alignItems: "start",
        display: "grid",
        gap: 0.75,
        gridTemplateColumns: { xs: "1fr", sm: "132px minmax(0, 1fr)" }
      }}
    >
      <Typography color="text.secondary" component="dt" sx={{ fontSize: compact ? 13 : 14, fontWeight: 700, lineHeight: 1.35 }}>
        {label}
      </Typography>
      <Typography component="dd" sx={{ fontSize: compact ? 13 : 14, fontWeight: 500, lineHeight: 1.35, m: 0, overflowWrap: "anywhere" }}>
        {value}
      </Typography>
    </Box>
  );
}
