import type { ReactNode } from "react";
import { Box } from "@mui/material";

export function ResourceIcon({ icon, status }: { icon: ReactNode; status: ReactNode }) {
  if (!icon) {
    return null;
  }

  return (
    <Box sx={{ display: "inline-flex", flex: "0 0 auto", position: "relative" }}>
      {icon}
      {status ? (
        <Box
          sx={{
            bottom: -13,
            position: "absolute",
            right: -7
          }}
        >
          {status}
        </Box>
      ) : null}
    </Box>
  );
}
