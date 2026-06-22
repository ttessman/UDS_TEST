import type { ReactNode } from "react";
import { Box } from "@mui/material";
import type { SxProps, Theme } from "@mui/material/styles";

export type ChipProps = {
  children: ReactNode;
  sx?: SxProps<Theme>;
};

export function Chip({ children, sx }: ChipProps) {
  return (
    <Box
      component="span"
      sx={[
        {
          alignItems: "center",
          borderRadius: "999px",
          display: "inline-flex",
          fontSize: 11,
          fontWeight: 750,
          letterSpacing: 0,
          lineHeight: 1,
          minHeight: 24,
          px: 1
        },
        ...(Array.isArray(sx) ? sx : [sx])
      ]}
    >
      {children}
    </Box>
  );
}
