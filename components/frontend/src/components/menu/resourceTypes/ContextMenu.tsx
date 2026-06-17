import { useCallback, useMemo, useState, type MouseEvent, type ReactNode } from "react";
import { Box, ListItemIcon, ListItemText, Menu, MenuItem } from "@mui/material";
import { AppIcon, type AppIconName } from "../../icon/AppIcon.js";

export type ContextMenuAction = {
  icon: AppIconName;
  label: string;
  onSelect: () => void;
};

export type ContextMenuContent = {
  actions: ContextMenuAction[];
  actionsLabel?: string;
  noActionsLabel?: string;
  state?: {
    content: ReactNode;
    label: string;
  };
};

export function useContextMenu(content: ContextMenuContent) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const hasMenu = Boolean(content.state?.content) || content.actions.length > 0;

  const closeContextMenu = useCallback(() => {
    setAnchorEl(null);
  }, []);
  const openContextMenu = useCallback((event: MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  }, []);

  const contextMenu = useMemo(
    () => (
      <ContextMenu
        anchorEl={anchorEl}
        content={content}
        onClose={closeContextMenu}
      />
    ),
    [anchorEl, closeContextMenu, content]
  );

  return {
    closeContextMenu,
    contextMenu,
    hasMenu,
    openContextMenu
  };
}

function ContextMenu({
  anchorEl,
  content,
  onClose
}: {
  anchorEl: HTMLElement | null;
  content: ContextMenuContent;
  onClose: () => void;
}) {
  const hasState = Boolean(content.state?.content);
  const actions = content.actions;
  const open = Boolean(anchorEl);
  const stateBackground = "color-mix(in srgb, var(--app-bg-paper-hover) 46%, var(--app-bg-paper))";

  return (
    <Menu
      anchorEl={anchorEl}
      anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      onClick={(event) => event.stopPropagation()}
      onClose={onClose}
      open={open}
      transformOrigin={{ horizontal: "right", vertical: "top" }}
      slotProps={{
        list: {
          sx: { py: 0 }
        },
        paper: {
          sx: {
            bgcolor: "var(--app-bg-paper)",
            border: "1px solid",
            borderColor: "var(--app-border)",
            boxShadow: "0 10px 24px rgba(15, 23, 42, 0.16), 0 2px 8px rgba(15, 23, 42, 0.1)",
            mt: 1,
            overflow: "visible",
            "&::before": {
              bgcolor: hasState ? stateBackground : "var(--app-bg-paper)",
              borderLeft: "1px solid var(--app-border)",
              borderTop: "1px solid var(--app-border)",
              boxShadow: "-3px -3px 8px rgba(15, 23, 42, 0.08)",
              content: '""',
              height: 12,
              position: "absolute",
              right: 7,
              top: -6,
              transform: "rotate(45deg)",
              width: 12,
              zIndex: 0
            }
          }
        }
      }}
    >
      {hasState ? (
        <Box component="li" role="none" sx={{ listStyle: "none" }}>
          <Box
            aria-label={content.state?.label}
            component="ul"
            role="group"
            sx={{
              bgcolor: stateBackground,
              listStyle: "none",
              m: 0,
              pb: 1.35,
              pl: 0,
              pt: 1.05
            }}
          >
            {content.state?.content}
          </Box>
        </Box>
      ) : null}
      {hasState && actions.length > 0 ? (
        <Box component="li" role="separator" sx={{ borderTop: "1px solid", borderColor: "divider", listStyle: "none" }} />
      ) : null}
      {actions.length > 0 ? (
        <Box component="li" role="none" sx={{ listStyle: "none" }}>
          <Box
            aria-label={content.actionsLabel ?? "Actions"}
            component="ul"
            role="group"
            sx={{ listStyle: "none", m: 0, pb: 0.2, pl: 0, pt: hasState ? 0.2 : 0 }}
          >
            {actions.map((action) => (
              <ContextMenuActionItem
                action={action}
                hasState={hasState}
                key={action.label}
                onClose={onClose}
              />
            ))}
          </Box>
        </Box>
      ) : null}
      {hasState && actions.length === 0 ? (
        <MenuItem
          disabled
          sx={{
            gap: 0.75,
            minHeight: 0,
            py: 1.05,
            "& .MuiListItemIcon-root": {
              minWidth: 26
            }
          }}
        >
          <ListItemIcon>
            <AppIcon name="info" sx={{ fontSize: 18 }} />
          </ListItemIcon>
          <ListItemText
            primary={content.noActionsLabel ?? "No actions supported"}
            slotProps={{
              primary: {
                sx: { fontSize: 15, lineHeight: 1.2 }
              }
            }}
          />
        </MenuItem>
      ) : null}
    </Menu>
  );
}

function ContextMenuActionItem({
  action,
  hasState,
  onClose
}: {
  action: ContextMenuAction;
  hasState: boolean;
  onClose: () => void;
}) {
  return (
    <MenuItem
      onClick={(event: MouseEvent<HTMLLIElement>) => {
        event.stopPropagation();
        onClose();
        action.onSelect();
      }}
      sx={{
        gap: 0.75,
        minHeight: 0,
        py: 0.85,
        "&:first-of-type": {
          pt: hasState ? 1.05 : 0.85
        },
        "&:last-of-type": {
          pb: 1.05
        },
        "& .MuiListItemIcon-root": {
          minWidth: 26
        }
      }}
    >
      <ListItemIcon>
        <AppIcon name={action.icon} sx={{ fontSize: 18 }} />
      </ListItemIcon>
      <ListItemText
        primary={action.label}
        slotProps={{
          primary: {
            sx: { fontSize: 15, lineHeight: 1.2 }
          }
        }}
      />
    </MenuItem>
  );
}
