import type { ReactNode } from "react";
import { Box } from "@mui/material";

export function HeroValueList({ children }: { children: ReactNode }) {
  return (
    <Box
      sx={{
        display: "flex",
        flexWrap: "wrap",
        gap: 1.75,
        mt: 4.25,
        maxWidth: 660,
        "& > span": {
          alignItems: "center",
          color: "#dbeafe",
          display: "flex",
          fontSize: 13,
          gap: 1.125,
          lineHeight: 1.35,
          maxWidth: 210,
          minHeight: 48,
          minWidth: 0,
          width: "fit-content"
        },
        "& .icon": {
          aspectRatio: "1",
          height: 30,
          minWidth: 30,
          width: 30
        },
        "& strong, & small": {
          display: "block"
        },
        "& small": {
          color: "#aebfda"
        }
      }}
    >
      {children}
    </Box>
  );
}
