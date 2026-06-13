import { Box, Typography } from "@mui/material";
import { siteContentSx } from "./SiteShell.js";

export function SiteFooter() {
  return (
    <Box
      component="footer"
      sx={{
        bgcolor: "var(--app-bg-footer)",
        borderTop: "1px solid",
        borderColor: "var(--app-border)",
        color: "var(--app-text-secondary)",
        mt: { xs: 6, md: 8 },
        py: 2.5
      }}
    >
      <Box sx={siteContentSx}>
        <Typography sx={{ color: "var(--app-text-primary)", fontSize: 13, fontWeight: 800 }}>UDS Core POC</Typography>
        <Typography sx={{ fontSize: 12, mt: 0.5, maxWidth: 860 }}>
          Local macOS proof of concept for reading UDS Registry/OCI package metadata, checking local cluster state, and
          modeling future install/launch flows without exposing registry credentials to the frontend.
        </Typography>
      </Box>
    </Box>
  );
}
