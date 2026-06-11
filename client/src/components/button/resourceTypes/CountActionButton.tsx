import { BaseButton } from "../Button.js";
import type { CountActionButtonProps } from "../button.types.js";

export function CountActionButton({
  count,
  disabled,
  icon,
  label,
  onClick,
  tooltip,
  ...props
}: CountActionButtonProps) {
  return (
    <BaseButton
      disabled={disabled}
      icon={icon}
      iconPosition="end"
      label={label}
      mode="action"
      props={{
        component: onClick ? "button" : "span",
        disableRipple: !onClick,
        onClick,
        tabIndex: onClick ? undefined : -1,
        variant: "outlined",
        ...props,
        sx: {
          borderColor: "var(--app-border)",
          borderRadius: 2.25,
          color: "var(--app-text-secondary)",
          fontSize: 14,
          fontWeight: 700,
          height: 28,
          minWidth: icon ? 54 : 48,
          px: icon ? 0.75 : 1.25,
          py: 0,
          textTransform: "none",
          "&:hover": {
            borderColor: "var(--app-text-secondary)",
            bgcolor: "var(--app-bg-paper-hover)"
          },
          "& .MuiButton-endIcon": {
            borderLeft: icon ? "1px solid" : undefined,
            borderColor: "var(--app-border)",
            ml: icon ? 0.7 : undefined,
            mr: 0,
            pl: icon ? 0.7 : undefined
          },
          ...props.sx
        }
      }}
      tooltip={tooltip}
    >
      {count}
    </BaseButton>
  );
}
