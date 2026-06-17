import { useMemo } from "react";
import { TextField, InputAdornment, IconButton, FormControl, FormHelperText } from "@mui/material";
import { AideIcon } from "components/utility/AideIcon";
import { TooltipLabel } from "components/utility/TooltipLabel";
import { AideFieldProps } from "../aideform";
import { createLogger } from "@/utils/shared/constants";

const log = createLogger("[aideform input text]", "#00BCD4");

export const AideTextInput = <TFormData,>({
  field,
  handleChange,
  error,
  showError,
  disabled,
  rawValue,
  uniqueId,
  label,
  helper,
  startAdornment,
  endAdornment,
  passwordVisible,
  onTogglePassword,
  fullContext,
}: AideFieldProps<TFormData>) => {
  const {
    type,
    name,
    placeholder,
    fullWidth,
    size = "medium",
    sx,
    rows,
    maxLength,
    tooltip,
    autoComplete,
    testid,
    required,
  } = field;

  const isPassword = type === "password";
  const inputType = isPassword ? (passwordVisible ? "text" : "password") : type;

  const passwordAdornment = useMemo(
    () =>
      isPassword ? (
        <IconButton
          aria-label={passwordVisible ? "hide the password" : "display the password"}
          onClick={onTogglePassword}
          onMouseDown={(e) => e.preventDefault()}
          tabIndex={0}
        >
          <AideIcon type={passwordVisible ? "visible off" : "visible on"} />
        </IconButton>
      ) : null,
    [isPassword, onTogglePassword, passwordVisible],
  );

  const memoizedStartAdornment = useMemo(
    () => (startAdornment ? <InputAdornment position="start">{startAdornment}</InputAdornment> : undefined),
    [startAdornment],
  );

  const memoizedEndAdornment = useMemo(
    () =>
      endAdornment || passwordAdornment ? (
        <InputAdornment position="end">{endAdornment || passwordAdornment}</InputAdornment>
      ) : undefined,
    [endAdornment, passwordAdornment],
  );

  log("render");

  return (
    <FormControl
      id={uniqueId}
      sx={{
        minWidth: "200px",
        label: {
          display: "flex",
          svg: { display: "none" },
          "&.MuiInputLabel-shrink svg": { display: "inline-block" }, // Only show icon when shrunk
        },
        ...sx,
      }}
      error={showError}
      disabled={disabled}
      required={required}
      fullWidth={fullWidth}
      data-testid={testid || uniqueId}
    >
      <TextField
        type={inputType}
        autoComplete={autoComplete}
        name={String(name)}
        size={size}
        label={<TooltipLabel label={label} tooltip={tooltip ?? ""} />}
        value={(rawValue as string) ?? ""}
        placeholder={placeholder}
        onChange={(e) => handleChange(name as keyof TFormData, e.target.value)}
        onFocus={(e) => field.onFocus?.(e, fullContext)}
        onBlur={(e) => field.onBlur?.(e, fullContext)}
        fullWidth={fullWidth}
        multiline={type === "textarea"}
        rows={type === "textarea" ? (rows ?? 2) : undefined}
        disabled={disabled}
        inputProps={{
          "data-testid": testid ? `${testid}--input` : `${uniqueId}--input`,
        }}
        slotProps={{
          input: {
            ...(maxLength ? { maxLength } : {}),
            ...(memoizedStartAdornment && { startAdornment: memoizedStartAdornment }),
            ...(memoizedEndAdornment && { endAdornment: memoizedEndAdornment }),
          },
        }}
        required={required}
        error={showError}
      />

      {helper && (
        <FormHelperText data-testid={`${uniqueId}-helper`} sx={{ mt: 0.5 }}>
          {helper}
        </FormHelperText>
      )}

      {showError && (
        <FormHelperText data-testid={`${uniqueId}-error`} sx={{ mt: 0.25 }}>
          {error}
        </FormHelperText>
      )}
    </FormControl>
  );
};
