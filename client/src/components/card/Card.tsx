import { Card as MuiCard, CardActions } from "@mui/material";
import type { CardProps } from "./card.types.js";

export function Card({ actions, children, commandPreview, definition }: CardProps) {
  return (
    <MuiCard
      variant="outlined"
      sx={{
        bgcolor: "#111827",
        borderColor: "#334155",
        borderRadius: 1.5,
        display: "flex",
        flexDirection: "column",
        minHeight: definition?.minHeight ?? 220,
        transition: "border-color 160ms ease, background-color 160ms ease",
        "&:hover": {
          bgcolor: "#132033",
          borderColor: "#64748b"
        }
      }}
    >
      {children}
      {actions || commandPreview ? (
        <CardActions sx={{ alignItems: "stretch", flexDirection: "column", gap: 1.25, px: 3.75, pb: 3 }}>
          {actions}
          {commandPreview ? <code>{commandPreview}</code> : null}
        </CardActions>
      ) : null}
    </MuiCard>
  );
}
