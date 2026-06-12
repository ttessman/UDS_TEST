import type { ComponentType, ReactNode } from "react";
import { Box, Chip, Stack, Tooltip, Typography } from "@mui/material";
import { getStatusColors, statusIcon } from "../../status/status.utils.js";
import type { StatusIndicatorTone } from "../../status/status.types.js";

export type StatusIndicatorView = "chip" | "dot" | "text";

export function StatusIndicatorButton({
  iconOnly = false,
  label,
  onClick,
  showIcon = true,
  state,
  tooltip,
  value,
  view = "chip"
}: {
  iconOnly?: boolean;
  label: string;
  onClick?: () => void;
  showIcon?: boolean;
  state: StatusIndicatorTone;
  tooltip: ReactNode;
  value?: ReactNode;
  view?: StatusIndicatorView;
}) {
  const colors = getStatusColors(state);
  const clickable = Boolean(onClick);

  if (view === "dot") {
    return (
      <Tooltip title={tooltip}>
        <ConditionalWrapper
          useWrapper={clickable}
          wrapper={({ children }) => (
            <Box aria-label={label} component="button" onClick={onClick} type="button" sx={dotButtonSx}>
              {children}
            </Box>
          )}
        >
          <Box aria-label={clickable ? undefined : label} component="span" sx={dotSx(colors.main, clickable)} />
        </ConditionalWrapper>
      </Tooltip>
    );
  }

  if (view === "text") {
    return (
      <Tooltip title={tooltip}>
        <Chip
          aria-label={label}
          clickable={clickable}
          label={label}
          onClick={onClick}
          size="small"
          sx={{
            alignSelf: "flex-start",
            bgcolor: "transparent",
            border: 0,
            color: colors.main,
            fontWeight: 800,
            justifyContent: "flex-start",
            px: 0,
            textTransform: "capitalize",
            "& .MuiChip-label": {
              px: 0
            }
          }}
          variant="filled"
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
          showIcon ? (
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
          ) : undefined
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
          "& .MuiChip-label": { minWidth: 0, px: iconOnly ? 0 : 0.75 }
        }}
        variant="outlined"
      />
    </Tooltip>
  );
}

const dotButtonSx = {
  alignItems: "center",
  appearance: "none",
  bgcolor: "transparent",
  border: 0,
  cursor: "pointer",
  display: "inline-flex",
  m: 0,
  p: 0
};

function ConditionalWrapper({
  children,
  useWrapper,
  wrapper: Wrapper
}: {
  children: ReactNode;
  useWrapper: boolean;
  wrapper: ComponentType<{ children: ReactNode }>;
}) {
  return useWrapper ? <Wrapper>{children}</Wrapper> : <>{children}</>;
}

function dotSx(color: string, clickable: boolean) {
  return {
    appearance: "none",
    bgcolor: color,
    border: "2px solid",
    borderColor: "background.paper",
    borderRadius: "999px",
    cursor: clickable ? "pointer" : "default",
    display: "inline-flex",
    flex: "0 0 auto",
    height: 17,
    m: 0,
    p: 0,
    width: 17
  };
}
