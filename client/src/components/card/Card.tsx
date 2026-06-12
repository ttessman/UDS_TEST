import { createTemplate, useSlot } from "@beqa/react-slots";
import { Card as MuiCard, CardActions, CardContent, CardHeader, CardMedia } from "@mui/material";
import type { CardChildren, CardProps } from "./card.types.js";

export const cardTemplate = createTemplate<CardChildren>();

export function Card({ children, content, definition, onClick, onKeyDown }: CardProps) {
  const { hasSlot, slot } = useSlot(children);
  const hasActions = hasSlot.actions || hasSlot.footer;
  const hasHeader = hasSlot.header;
  const hasMedia = hasSlot.media;
  const headerOverMedia = hasHeader && hasMedia;
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
        "--card-padding-x": "18px",
        "--card-padding-y": "12px",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        maxWidth: "100%",
        minWidth: 0,
        minHeight: definition?.minHeight ?? 220,
        overflow: "hidden",
        position: "relative",
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
            insetInline: headerOverMedia ? 0 : undefined,
            pointerEvents: headerOverMedia ? "none" : undefined,
            position: headerOverMedia ? "absolute" : undefined,
            top: headerOverMedia ? 0 : undefined,
            zIndex: headerOverMedia ? 1 : undefined,
            px: "var(--card-padding-x)",
            pt: "var(--card-padding-y)",
            pb: 0,
            "& .MuiCardHeader-content": { minWidth: 0 },
            "& .MuiCardHeader-title": { display: "block", pointerEvents: "auto" }
          }}
        />
      ) : null}
      {hasMedia ? (
        <CardMedia component="div" sx={{ flex: "0 0 auto", minWidth: 0 }}>
          <slot.media />
        </CardMedia>
      ) : null}
      <CardContent
        sx={{
          display: "flex",
          flex: 1,
          flexDirection: "column",
          gap: resourceSpacing ? 1.75 : 0,
          overflow: "hidden",
          px: "var(--card-padding-x)",
          pt: "var(--card-padding-y)",
          pb: hasActions ? 0 : "var(--card-padding-y)",
          "&:last-child": { pb: hasActions ? 0 : "var(--card-padding-y)" },
          ...content?.sx
        }}
      >
        <slot.content />
      </CardContent>
      {hasActions ? (
        <CardActions
          sx={{
            alignItems: "stretch",
            flexDirection: "column",
            gap: 1.25,
            px: "var(--card-padding-x)",
            pb: "var(--card-padding-y)",
            pt: "var(--card-padding-y)"
          }}
        >
          <slot.footer />
          <slot.actions />
        </CardActions>
      ) : null}
    </MuiCard>
  );
}
