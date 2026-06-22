import type { ReactNode } from "react";
import { Box } from "@mui/material";

export function NavLabel({ children }: { children: ReactNode }) {
  return (
    <Box
      component="span"
      sx={{
        color: "var(--docs-nav-label)",
        display: "block",
        fontSize: 12,
        fontWeight: 850,
        letterSpacing: "0.08em",
        mb: 0.75,
        mt: 2.25,
        textTransform: "uppercase"
      }}
    >
      {children}
    </Box>
  );
}
