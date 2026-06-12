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
  value,
  view = "icon"
}: {
  iconOnly?: boolean;
  label: string;
  onClick?: () => void;
  state: StatusIndicatorTone;
  tooltip: ReactNode;
  value?: ReactNode;
  view?: "icon" | "dot";
}) {
  const colors = getStatusColors(state);
  const clickable = Boolean(onClick);

  if (view === "dot") {
    return (
      <Tooltip title={tooltip}>
        <Box
          aria-label={label}
          component={clickable ? "button" : "span"}
          onClick={onClick}
          type={clickable ? "button" : undefined}
          sx={{
            appearance: "none",
            bgcolor: colors.main,
            border: "2px solid",
            borderColor: "background.paper",
            borderRadius: "999px",
            cursor: clickable ? "pointer" : "default",
            display: "inline-flex",
            flex: "0 0 auto",
            height: 14,
            m: 0,
            p: 0,
            width: 14
          }}
        />
      </Tooltip>
    );
  }

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
          width: iconOnly ? 26 : "auto",
          "& .MuiChip-icon": { fontSize: 16, mr: iconOnly ? 0 : 0.35 },
          "& .MuiChip-label": { minWidth: 0, px: iconOnly ? 0 : 0.65 }
        }}
        variant="outlined"
      />
    </Tooltip>
  );
}
