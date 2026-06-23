import { Box, Typography } from "@mui/material";

export function StatusDetail({ lines }: { lines: Array<[string, string]> }) {
  return (
    <Box component="dl" sx={{ display: "grid", gap: 0.75, m: 0 }}>
      {lines.map(([label, value]) => (
        <Box key={label} sx={{ display: "grid", gap: 0.75, gridTemplateColumns: "120px minmax(0, 1fr)" }}>
          <Typography color="text.secondary" component="dt" sx={{ fontSize: 13 }}>
            {label}
          </Typography>
          <Typography component="dd" sx={{ fontSize: 13, m: 0, overflowWrap: "anywhere" }}>
            {value}
          </Typography>
        </Box>
      ))}
    </Box>
  );
}
