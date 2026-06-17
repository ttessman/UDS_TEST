import { Button } from "@mui/material";
import { AideIcon } from "components/utility/AideIcon";
import { AideFieldProps } from "../aideform";

export const AideButtonField = <TFormData,>({
  field,
  fullContext,
  label,
  disabled,
  uniqueId,
  handleSubmit,
}: AideFieldProps<TFormData>) => {
  const { buttonVariant, buttonSize, fullWidth, sx, testid, onClick, icon } = field;

  // Resolve Icon
  const iconType = typeof icon?.type === "function" ? icon.type(fullContext) : icon?.type;
  const iconNode = iconType ? <AideIcon type={iconType} fontSize={icon?.fontSize} sx={icon?.sx} /> : undefined;

  return (
    <Button
      key={uniqueId}
      id={uniqueId}
      data-testid={testid || uniqueId}
      variant={buttonVariant || "contained"}
      size={buttonSize || "medium"}
      fullWidth={fullWidth !== false}
      disabled={disabled}
      startIcon={icon?.position !== "end" ? iconNode : undefined}
      endIcon={icon?.position === "end" ? iconNode : undefined}
      onClick={(e) => (onClick ? onClick(e as any, fullContext) : handleSubmit())}
      sx={{ mb: 2, ...sx }}
    >
      {label}
    </Button>
  );
};
