import { CountActionButton } from "./CountActionButton.js";
import type { CountActionButtonProps } from "../button.types.js";

export function RefreshCountButton({
  count,
  disabled,
  label,
  onClick,
  tooltip
}: Pick<CountActionButtonProps, "count" | "disabled" | "label" | "onClick" | "tooltip">) {
  return (
    <CountActionButton
      count={count}
      disabled={disabled}
      icon="refresh"
      label={label}
      onClick={onClick}
      tooltip={tooltip}
    />
  );
}
