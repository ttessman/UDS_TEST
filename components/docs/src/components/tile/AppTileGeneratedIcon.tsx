import type { ReactNode } from "react";
import { Box } from "@mui/material";

export type AppTileGeneratedIconTone = "blue" | "cyan" | "rose" | "orange";

const iconToneSx = {
  blue: "linear-gradient(135deg, #2563eb, #60a5fa)",
  cyan: "linear-gradient(135deg, #0891b2, #67e8f9)",
  orange: "linear-gradient(135deg, #ea580c, #fdba74)",
  rose: "linear-gradient(135deg, #e11d48, #fb7185)"
} satisfies Record<AppTileGeneratedIconTone, string>;

export type AppTileGeneratedIconProps = {
  icon?: ReactNode;
  size?: number;
  title: string;
  tone?: AppTileGeneratedIconTone;
};

export function AppTileGeneratedIcon({ icon, size = 58, title, tone = "blue" }: AppTileGeneratedIconProps) {
  return (
    <Box
      component="span"
      sx={{
        alignItems: "center",
        aspectRatio: "1",
        background: iconToneSx[tone],
        borderRadius: "8px",
        color: "#020617",
        display: "inline-flex",
        flex: "0 0 auto",
        fontSize: Math.round(size * 0.44),
        fontWeight: 850,
        height: size,
        justifyContent: "center",
        lineHeight: 1,
        width: size
      }}
    >
      {icon ?? (title.trim().slice(0, 1).toUpperCase() || "?")}
    </Box>
  );
}
