import type { ReactNode } from "react";
import { Dialog, DialogActions, DialogContent, DialogTitle, Stack } from "@mui/material";
import { ActionButton } from "../button/resourceTypes/ActionButton.js";
import { IconActionButton } from "../button/resourceTypes/IconActionButton.js";
import { modalMotion } from "./modal.motion.js";
import { useModalSync, type ModalId } from "../../store/modal.store.js";
import type { ModalDefinition } from "./modal.types.js";

export function Modal({
  children,
  definition,
  modalId,
  onClose,
  restoreFocus = true
}: {
  children: ReactNode;
  definition: ModalDefinition;
  modalId: ModalId;
  onClose?: () => void;
  restoreFocus?: boolean;
}) {
  const { closeModal, isActive } = useModalSync(modalId);

  function handleClose() {
    closeModal();
    onClose?.();
  }

  return (
    <Dialog
      disableRestoreFocus={!restoreFocus}
      fullWidth
      keepMounted
      maxWidth={definition.maxWidth ?? "sm"}
      onClose={handleClose}
      open={isActive}
      slots={{ transition: modalMotion.transitionComponent }}
      slotProps={{
        backdrop: {
          sx: {
            backdropFilter: "blur(2px) brightness(var(--app-scrim-brightness))",
            bgcolor: "var(--app-scrim)"
          },
          transitionDuration: modalMotion.backdropTransitionDuration
        },
        paper: {
          sx: {
            ...modalMotion.paperSx,
            bgcolor: "var(--app-bg-default)",
            border: "1px solid",
            borderColor: "var(--app-border)",
            borderRadius: 1.5,
            boxShadow: "var(--app-shadow-modal)",
            boxSizing: "border-box",
            maxHeight: "calc(100dvh - 32px)",
            maxWidth: "calc(100vw - 32px)",
            overflow: "hidden",
            width: {
              xs: "calc(100vw - 32px)",
              sm: undefined
            }
          }
        },
        transition: { timeout: modalMotion.transitionTimeout }
      }}
    >
      <DialogTitle
        sx={{
          alignItems: "center",
          bgcolor: "var(--app-bg-paper)",
          borderBottom: "1px solid var(--app-border)",
          color: "var(--app-text-primary)",
          minWidth: 0,
          display: "flex",
          gap: 2,
          justifyContent: "space-between",
          px: 3,
          py: 2.25
        }}
      >
        <span style={{ minWidth: 0, overflowWrap: "anywhere" }}>{definition.title}</span>
        <IconActionButton
          icon="close"
          label="Close modal"
          onClick={handleClose}
          sx={{ color: "var(--app-text-secondary)", flex: "0 0 auto" }}
        />
      </DialogTitle>
      <DialogContent
        dividers={definition.dividers ?? true}
        sx={{
          borderColor: "var(--app-border)",
          color: "var(--app-text-primary)",
          maxWidth: "100%",
          minWidth: 0,
          overflowX: "hidden",
          ...definition.contentSx
        }}
      >
        {children}
      </DialogContent>
      {definition.actions?.length ? (
        <DialogActions sx={{ bgcolor: "var(--app-bg-default)", borderTop: "1px solid var(--app-border)", px: 3, py: 1.5 }}>
          <Stack direction="row" sx={{ gap: 1 }}>
            {definition.actions.map((action) => (
              <ActionButton
                disabled={action.disabled}
                icon={action.icon}
                key={action.label}
                label={action.label}
                onClick={action.onClick}
                variant={action.variant ?? "text"}
              />
            ))}
          </Stack>
        </DialogActions>
      ) : null}
    </Dialog>
  );
}
