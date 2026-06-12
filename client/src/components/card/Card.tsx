import { createTemplate, useSlot } from "@beqa/react-slots";
import { Card as MuiCard, CardActions } from "@mui/material";
import type { CardChildren, CardProps } from "./card.types.js";

export const cardTemplate = createTemplate<CardChildren>();

export function Card({ children, definition, onClick, onKeyDown }: CardProps) {
  const { hasSlot, slot } = useSlot(children);
  const hasFooter = hasSlot.actions || hasSlot.command;
  const interactive = Boolean(onClick);

  return (
    <MuiCard
      onClick={onClick}
      onKeyDown={onKeyDown}
      role={interactive ? "button" : undefined}
      tabIndex={interactive ? 0 : undefined}
      variant="outlined"
      sx={{
        bgcolor: "background.paper",
        borderColor: "divider",
        borderRadius: 1.5,
        display: "flex",
        flexDirection: "column",
        height: "100%",
        aspectRatio: definition?.aspectRatio,
        minWidth: 0,
        minHeight: definition?.minHeight ?? 220,
        overflow: "hidden",
        cursor: interactive ? "pointer" : "default",
        "&:hover": {
          bgcolor: "var(--app-bg-paper-hover)",
          borderColor: "var(--app-border-strong)"
        }
      }}
    >
      <slot.content />
      {hasFooter ? (
        <CardActions sx={{ alignItems: "stretch", flexDirection: "column", gap: 1.25, px: 3.75, pb: 3 }}>
          <slot.actions />
          <slot.command />
        </CardActions>
      ) : null}
    </MuiCard>
  );
}
