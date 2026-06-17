import type { ReactNode } from "react";
import { Box } from "@mui/material";

export function ListItem({
  children,
  maxWidth
}: {
  children: ReactNode;
  maxWidth?: number | string;
}) {
  return (
    <Box sx={{ maxWidth, minWidth: 0, width: "100%" }}>
      {children}
    </Box>
  );
}
