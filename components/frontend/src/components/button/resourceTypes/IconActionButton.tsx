import { BaseButton } from "../Button.js";
import type { BaseIconButtonProps } from "../button.types.js";

export function IconActionButton({
  bordered = false,
  disabled,
  icon,
  label,
  sx,
  tooltip,
  ...props
}: BaseIconButtonProps & { bordered?: boolean }) {
  return (
    <BaseButton
      disabled={disabled}
      icon={icon}
      label={label}
      mode="icon"
      props={{
        ...props,
        sx: {
          border: bordered ? "1px solid" : "1px solid transparent",
          borderColor: bordered ? "divider" : "transparent",
          borderRadius: "50%",
          height: 28,
          width: 28,
          "&:hover": {
            borderColor: bordered ? "text.secondary" : "transparent"
          },
          "& svg": { fontSize: 18 },
          ...sx
        }
      }}
      tooltip={tooltip}
    />
  );
}
