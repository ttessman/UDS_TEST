import type { ReactNode } from "react";
import { useState } from "react";
import { createTemplate, useSlot } from "@beqa/react-slots";
import type { Slot, SlotChildren } from "@beqa/react-slots";
import { Box } from "@mui/material";
import { CtaButton } from "../button/CtaButton";

export type SidebarChildren = SlotChildren<Slot<"actions"> | Slot<"brand"> | Slot<"nav"> | Slot<"cta">>;

export const sidebarTemplate = createTemplate<SidebarChildren>();

export type SidebarProps = {
  children: SidebarChildren;
  id?: string;
  menuLabel?: ReactNode;
};

export function Sidebar({ children, id = "microsite-navigation", menuLabel = "Menu" }: SidebarProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { hasSlot, slot } = useSlot(children);
  const closeDrawer = () => setIsDrawerOpen(false);

  return (
    <>
      <Box
        component="header"
        sx={{
          alignItems: "center",
          background: "var(--docs-sidebar-bg)",
          borderBottom: "1px solid var(--docs-sidebar-border)",
          display: { xs: "flex", lg: "none" },
          justifyContent: "space-between",
          minHeight: 86,
          px: 3,
          position: "sticky",
          top: 0,
          zIndex: 6
        }}
      >
        {hasSlot.brand ? <slot.brand /> : null}
        <Box sx={{ alignItems: "center", display: "flex", gap: 1 }}>
          <CtaButton
            aria-controls={id}
            aria-expanded={isDrawerOpen}
            component="button"
            onClick={() => setIsDrawerOpen(true)}
            type="button"
            variant="chrome"
          >
            {menuLabel}
          </CtaButton>
        </Box>
      </Box>
      {isDrawerOpen ? (
        <Box
          aria-label="Close menu"
          component="button"
          onClick={closeDrawer}
          sx={{
            background: "var(--docs-scrim)",
            border: 0,
            display: { xs: "block", lg: "none" },
            inset: 0,
            position: "fixed",
            zIndex: 7
          }}
          type="button"
        />
      ) : null}
      <Box
        component="aside"
        id={id}
        sx={{
          background: "var(--docs-sidebar-bg)",
          borderRight: "1px solid var(--docs-sidebar-border)",
          boxShadow: "var(--docs-sidebar-shadow)",
          display: "flex",
          flexDirection: "column",
          gap: 2.75,
          height: "100vh",
          left: { xs: 0, lg: "auto" },
          maxWidth: { xs: 390, lg: "none" },
          overflowY: "auto",
          p: "22px 18px",
          position: { xs: "fixed", lg: "sticky" },
          top: 0,
          transform: { xs: isDrawerOpen ? "translateX(0)" : "translateX(-105%)", lg: "none" },
          transition: "transform 180ms ease",
          width: { xs: "86vw", lg: "auto" },
          zIndex: 8
        }}
      >
        <Box sx={{ alignItems: "center", display: "flex", gap: 2, justifyContent: "space-between" }}>
          {hasSlot.brand ? <slot.brand /> : null}
          <Box sx={{ alignItems: "center", display: "flex", gap: 1 }}>
            {hasSlot.actions ? <slot.actions /> : null}
            <CtaButton
              component="button"
              onClick={closeDrawer}
              sx={{ display: { xs: "inline-flex", lg: "none" } }}
              type="button"
              variant="chrome"
            >
              Close
            </CtaButton>
          </Box>
        </Box>
        <Box onClick={closeDrawer}>{hasSlot.nav ? <slot.nav /> : null}</Box>
        {hasSlot.cta ? <Box sx={{ mt: "auto" }}><slot.cta /></Box> : null}
      </Box>
    </>
  );
}
