import { BaseButton } from "../Button.js";
import type { BaseIconButtonProps } from "../button.types.js";

export function IconActionButton({
  disabled,
  icon,
  label,
  tooltip,
  ...props
}: BaseIconButtonProps) {
  return <BaseButton disabled={disabled} icon={icon} label={label} mode="icon" props={props} tooltip={tooltip} />;
}
