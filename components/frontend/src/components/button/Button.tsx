import { Button as MuiButton, IconButton as MuiIconButton, Tooltip } from "@mui/material";
import { AppIcon } from "../icon/AppIcon.js";
import type { BaseButtonProps } from "./button.types.js";

export function BaseButton({
  children,
  disabled,
  icon,
  iconPosition = "start",
  label,
  mode,
  props,
  tooltip = label
}: BaseButtonProps) {
  const iconNode = icon ? <AppIcon fontSize="small" name={icon} /> : undefined;

  return (
    <Tooltip title={tooltip}>
      <span>
        {mode === "icon" ? (
          <MuiIconButton
            aria-label={label}
            disabled={disabled}
            size="small"
            {...props}
          >
            {iconNode}
          </MuiIconButton>
        ) : (
          <MuiButton
            aria-label={label}
            disabled={disabled}
            endIcon={iconPosition === "end" ? iconNode : undefined}
            size="small"
            startIcon={iconPosition === "start" ? iconNode : undefined}
            {...props}
          >
            {children}
          </MuiButton>
        )}
      </span>
    </Tooltip>
  );
}
