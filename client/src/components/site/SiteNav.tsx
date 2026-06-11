import { useEffect, useState } from "react";
import { Stack } from "@mui/material";
import type { PaletteMode } from "@mui/material";
import { motion } from "motion/react";
import { IconActionButton } from "../button/resourceTypes/IconActionButton.js";
import { siteMotionTimings, siteNavMotion } from "./site.motion.js";

export function SiteNav({
  colorMode,
  onOpenBackendLogs,
  onToggleColorMode
}: {
  colorMode: PaletteMode;
  onOpenBackendLogs: () => void;
  onToggleColorMode: () => void;
}) {
  const visible = useSiteNavVisibility();

  return (
    <Stack
      animate={visible ? "visible" : "hidden"}
      component={motion.nav}
      direction="row"
      initial={false}
      transition={siteMotionTimings.nav}
      variants={siteNavMotion}
      sx={{
        alignItems: "center",
        bgcolor: "var(--app-bg-default)",
        border: "1px solid",
        borderColor: "var(--app-border)",
        borderRadius: 999,
        boxShadow: "var(--app-shadow-nav)",
        gap: 1,
        justifyContent: { xs: "flex-start", md: "flex-end" },
        p: 0.5,
        pointerEvents: visible ? "auto" : "none",
        position: "fixed",
        right: { xs: 16, md: "max(32px, calc((100vw - 1280px) / 2 + 32px))" },
        top: { xs: 16, md: 24 },
        zIndex: (theme) => theme.zIndex.modal - 1
      }}
    >
      <IconActionButton
        icon="terminal"
        label="Show backend command output"
        onClick={onOpenBackendLogs}
        sx={{ border: "1px solid", borderColor: "var(--app-border)", color: "var(--app-text-secondary)" }}
      />
      <IconActionButton
        icon={colorMode === "dark" ? "lightMode" : "darkMode"}
        label={`Switch to ${colorMode === "dark" ? "light" : "dark"} mode`}
        onClick={onToggleColorMode}
        sx={{ border: "1px solid", borderColor: "var(--app-border)", color: "var(--app-text-secondary)" }}
      />
    </Stack>
  );
}

function useSiteNavVisibility() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    let lastScrollY = window.scrollY;

    function updateNavVisibility() {
      const nextScrollY = window.scrollY;
      const scrollingDown = nextScrollY > lastScrollY;

      setVisible(!scrollingDown || nextScrollY < 24);
      lastScrollY = nextScrollY;
    }

    window.addEventListener("scroll", updateNavVisibility, { passive: true });

    return () => window.removeEventListener("scroll", updateNavVisibility);
  }, []);

  return visible;
}
