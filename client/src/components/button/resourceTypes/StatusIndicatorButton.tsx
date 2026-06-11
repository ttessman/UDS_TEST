import type { ReactNode } from "react";
import { Box, Chip, Stack, Tooltip, Typography } from "@mui/material";
import { getStatusColors, statusIcon } from "../../status/status.utils.js";
import type { StatusIndicatorTone } from "../../status/status.types.js";

export function StatusIndicatorButton({
  iconOnly = false,
  label,
  onClick,
  state,
  tooltip,
  value
}: {
  iconOnly?: boolean;
  label: string;
  onClick?: () => void;
  state: StatusIndicatorTone;
  tooltip: ReactNode;
  value?: ReactNode;
}) {
  const colors = getStatusColors(state);
  const clickable = Boolean(onClick);

  return (
    <Tooltip title={tooltip}>
      <Chip
        aria-label={label}
        clickable={clickable}
        icon={
          <Box
            aria-hidden="true"
            component="span"
            sx={{
              color: `${colors.main} !important`,
              display: "flex",
              ml: iconOnly ? "0 !important" : "2px !important"
            }}
          >
            {statusIcon(state, "inherit")}
          </Box>
        }
        label={
          iconOnly ? (
            ""
          ) : (
            <Stack component="span" direction="row" sx={{ alignItems: "center", gap: 0.5 }}>
              <Typography component="span" sx={{ fontSize: 11.5, fontWeight: 800 }}>
                {label}
              </Typography>
              {value ? (
                <Typography component="span" sx={{ color: colors.text, fontSize: 11.5, fontWeight: 800 }}>
                  {value}
                </Typography>
              ) : null}
            </Stack>
          )
        }
        onClick={onClick}
        sx={{
          bgcolor: colors.bg,
          borderColor: colors.border,
          color: "var(--app-text-primary)",
          fontSize: 12,
          height: 26,
          justifyContent: iconOnly ? "center" : "flex-start",
          maxWidth: "100%",
          px: 0,
          width: iconOnly ? 26 : { xs: "100%", md: "auto" },
          "& .MuiChip-icon": { fontSize: 16, mr: iconOnly ? 0 : 0.35 },
          "& .MuiChip-label": { minWidth: 0, px: iconOnly ? 0 : 0.65 }
        }}
        variant="outlined"
      />
    </Tooltip>
  );
}
