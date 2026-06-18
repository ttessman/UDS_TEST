import type { ReactNode } from "react";
import { Box } from "@mui/material";
import type { SxProps, Theme } from "@mui/material/styles";
import { AppTileGeneratedIcon } from "./AppTileGeneratedIcon";
import type { AppTileGeneratedIconTone } from "./AppTileGeneratedIcon";
import { AppTileStatusDot } from "./AppTileStatusDot";
import type { AppTileStatus } from "./AppTileStatusDot";
import { TileCard, tileCardTemplate } from "./TileCard";

export type AppTileProps = {
  action?: ReactNode;
  icon?: ReactNode;
  iconTone?: AppTileGeneratedIconTone;
  meta?: ReactNode;
  minHeight?: number;
  status?: AppTileStatus | ReactNode;
  sx?: SxProps<Theme>;
  title: string;
  variant?: "launcher" | "compact";
};

export function AppTile({
  action,
  icon,
  iconTone = "blue",
  meta,
  minHeight,
  status,
  sx,
  title,
  variant = "launcher"
}: AppTileProps) {
  const compact = variant === "compact";

  return (
    <TileCard minHeight={minHeight} sx={sx} variant={variant}>
      <tileCardTemplate.media>
        <AppTileGeneratedIcon icon={icon} size={compact ? 58 : 74} title={title} tone={iconTone} />
      </tileCardTemplate.media>
      <tileCardTemplate.title>
        <Box
          component="strong"
          title={title}
          sx={{
            color: "#ffffff",
            fontSize: compact ? 14 : 16,
            fontWeight: 800,
            lineHeight: 1.15,
            maxWidth: "100%",
            overflow: "hidden",
            textAlign: "center",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap"
          }}
        >
          {title}
        </Box>
      </tileCardTemplate.title>
      <tileCardTemplate.meta>
        {meta}
      </tileCardTemplate.meta>
      <tileCardTemplate.actions>
        {action}
      </tileCardTemplate.actions>
      {status ? (
        <tileCardTemplate.status>
          <AppTileStatusDot status={status} />
        </tileCardTemplate.status>
      ) : null}
    </TileCard>
  );
}
