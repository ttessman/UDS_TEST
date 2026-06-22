import { BaseButton } from "../Button.js";
import type { ActionButtonVariant, BaseActionButtonProps } from "../button.types.js";

export type { ActionButtonVariant };

export function ActionButton({
  disabled,
  icon,
  iconPosition = "start",
  label,
  tooltip,
  ...props
}: BaseActionButtonProps) {
  return (
    <BaseButton
      disabled={disabled}
      icon={icon}
      iconPosition={iconPosition}
      label={label}
      mode="action"
      props={props}
      tooltip={tooltip}
    >
      {label}
    </BaseButton>
  );
}
