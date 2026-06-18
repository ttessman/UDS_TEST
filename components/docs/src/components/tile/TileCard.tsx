import { createTemplate, useSlot } from "@beqa/react-slots";
import type { Slot, SlotChildren } from "@beqa/react-slots";
import { Box } from "@mui/material";
import type { SxProps, Theme } from "@mui/material/styles";

export type TileCardChildren = SlotChildren<Slot<"media"> | Slot<"title"> | Slot<"meta"> | Slot<"actions"> | Slot<"status">>;

export const tileCardTemplate = createTemplate<TileCardChildren>();

export type TileCardProps = {
  children: TileCardChildren;
  minHeight?: number;
  sx?: SxProps<Theme>;
  variant?: "launcher" | "compact";
};

export function TileCard({ children, minHeight, sx, variant = "launcher" }: TileCardProps) {
  const compact = variant === "compact";
  const { hasSlot, slot } = useSlot(children);

  return (
    <Box
      component="article"
      sx={[
        {
          alignItems: "center",
          background: "rgba(255, 255, 255, 0.07)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          borderRadius: "8px",
          display: "grid",
          gridTemplateRows: "1fr auto",
          minHeight: minHeight ?? (compact ? 148 : 168),
          minWidth: 0,
          overflow: "hidden",
          p: compact ? 1.75 : 2,
          position: "relative"
        },
        ...(Array.isArray(sx) ? sx : [sx])
      ]}
    >
      <Box
        sx={{
          alignItems: "center",
          display: "grid",
          gap: compact ? 1 : 1.5,
          justifyItems: "center",
          minWidth: 0,
          placeSelf: "center"
        }}
      >
        {hasSlot.media ? <slot.media /> : null}
        {hasSlot.title ? <slot.title /> : null}
      </Box>
      <Box
        sx={{
          alignItems: "end",
          display: "flex",
          gap: 1.25,
          justifyContent: "space-between",
          minWidth: 0
        }}
      >
        <Box
          sx={{
            color: "#b9c7dc",
            flex: "1 1 auto",
            fontSize: 12,
            minWidth: 0,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap"
          }}
        >
          {hasSlot.meta ? <slot.meta /> : null}
        </Box>
        <Box sx={{ display: "flex", flex: "0 0 auto", gap: 1 }}>
          {hasSlot.actions ? <slot.actions /> : null}
        </Box>
      </Box>
      {hasSlot.status ? <slot.status /> : null}
    </Box>
  );
}
