import type { ReactNode } from "react";
import { Box } from "@mui/material";

export function IconWithStatus({ icon, status }: { icon: ReactNode; status: ReactNode }) {
  if (!icon) {
    return null;
  }

  return (
    <Box sx={{ display: "inline-flex", flex: "0 0 auto", position: "relative" }}>
      {icon}
      {status ? (
        <Box
          sx={{
            bottom: -5,
            position: "absolute",
            right: -5
          }}
        >
          {status}
        </Box>
      ) : null}
    </Box>
  );
}
