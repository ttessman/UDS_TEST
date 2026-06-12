import { createTemplate, useSlot } from "@beqa/react-slots";
import { Card as MuiCard, CardActions, CardContent, CardHeader } from "@mui/material";
import type { CardChildren, CardProps } from "./card.types.js";

export const cardTemplate = createTemplate<CardChildren>();

export function Card({ children, content, definition, onClick, onKeyDown }: CardProps) {
  const { hasSlot, slot } = useSlot(children);
  const hasActions = hasSlot.actions || hasSlot.footer;
  const hasHeader = hasSlot.header;
  const interactive = Boolean(onClick);
  const resourceSpacing = content?.spacing === "resource";

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
        maxWidth: "100%",
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
      {hasHeader ? (
        <CardHeader
          title={<slot.header />}
          sx={{
            px: resourceSpacing ? 3 : 2,
            pt: resourceSpacing ? 1.5 : 2,
            pb: 0,
            "& .MuiCardHeader-content": { minWidth: 0 },
            "& .MuiCardHeader-title": { display: "block" }
          }}
        />
      ) : null}
      <CardContent
        sx={{
          display: "flex",
          flex: 1,
          flexDirection: "column",
          gap: resourceSpacing ? 1.75 : 0,
          overflow: "hidden",
          px: resourceSpacing ? 3 : 2,
          pt: resourceSpacing ? 1.5 : 2,
          pb: resourceSpacing ? 0 : 2,
          "&:last-child": { pb: resourceSpacing ? 0 : 2 },
          ...content?.sx
        }}
      >
        <slot.content />
      </CardContent>
      {hasActions ? (
        <CardActions sx={{ alignItems: "stretch", flexDirection: "column", gap: 1.25, px: resourceSpacing ? 3 : 2, pb: resourceSpacing ? 1.5 : 2, pt: 0 }}>
          <slot.footer />
          <slot.actions />
        </CardActions>
      ) : null}
    </MuiCard>
  );
}
