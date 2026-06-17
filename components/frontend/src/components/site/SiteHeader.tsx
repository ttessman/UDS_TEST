import { Box, Typography } from "@mui/material";
import { backendCommandOutputModalDefinition } from "../modal/resourceTypes/BackendCommandOutputModal.js";
import { useColorMode } from "../../store/colorMode.store.js";
import { useModalSync } from "../../store/modal.store.js";
import { SiteNav } from "./SiteNav.js";
import { siteContentSx } from "./SiteShell.js";

export function SiteHeader() {
  const { mode, toggleMode } = useColorMode();
  const backendLogsModal = useModalSync(backendCommandOutputModalDefinition.modalId);

  return (
    <Box
      component="header"
      sx={{
        bgcolor: "var(--app-bg-shell)",
        borderBottom: "1px solid",
        borderColor: "var(--app-border)",
        pb: 3,
        pt: 5
      }}
    >
      <Box
        sx={{
          ...siteContentSx,
          alignItems: { xs: "stretch", md: "flex-start" },
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          gap: 2.5,
          justifyContent: "space-between"
        }}
      >
        <Box>
          <Typography component="h1" sx={{ fontSize: 42, fontWeight: 900, letterSpacing: 0, lineHeight: 1.1 }}>
            App Catalog
          </Typography>
          <Typography sx={{ color: "var(--app-text-secondary)", mt: 0.5 }}>
            UDS Registry package metadata, local cluster state, and install readiness.
          </Typography>
        </Box>
        <SiteNav
          colorMode={mode}
          onOpenBackendLogs={backendLogsModal.openModal}
          onToggleColorMode={toggleMode}
        />
      </Box>
    </Box>
  );
}
