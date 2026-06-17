import React, { useState } from "react";
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Switch,
  RadioGroup,
  Radio,
  FormLabel,
  FormHelperText,
  Box,
  Rating,
  ListItemText,
  IconButton,
} from "@mui/material";
import { TooltipLabel } from "components/utility/TooltipLabel";
import { MetaItem, MetaItemProps } from "components/MetaItem/MetaItem";
import { TagInput } from "components/forms/inputs/aideform.input.tag";
import { AideIcon, getIconByString } from "components/utility/AideIcon";
import { AideSlider } from "components/forms/inputs/aideform.input.slider";
import { AideFieldProps } from "../aideform";

/**
 * COMMON STYLE:
 * text colors use the variable and icons only appear in shrunk labels.
 */
const oldFormControlSx = {
  mb: 2,
  minWidth: "200px",
  "& .MuiInputBase-root": {
    color: "var(--text-color)",
  },
  "& .MuiInputLabel-root": {
    color: "var(--text-color)",
    display: "flex",
    svg: { display: "none" },
    "&.MuiInputLabel-shrink svg": { display: "inline-block" },
  },
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: "var(--alt-border-color, rgba(0, 0, 0, 0.23))",
  },
};

/**
 * CASE: select
 * Single selection with loading states and value validation
 */
export const AideSelectField = <TFormData,>({
  field,
  handleChange,
  error,
  showError,
  disabled,
  rawValue,
  uniqueId,
  label,
  helper,
  options,
  loading,
}: AideFieldProps<TFormData> & { loading?: boolean }) => {
  const { name, fullWidth, sx, required, tooltip, testid } = field;

  const dedupedOptions = Array.from(new Map(options.map((o) => [o.value, o])).values());
  const validValues = dedupedOptions.map((opt) => opt.value);
  const isValidValue = validValues.includes(rawValue);
  const safeValue = isValidValue ? rawValue : "";

  return (
    <FormControl
      key={uniqueId}
      id={uniqueId}
      data-testid={testid || uniqueId}
      fullWidth={fullWidth}
      sx={{ ...oldFormControlSx, ...sx }}
      required={required}
      disabled={disabled}
      error={showError}
    >
      <InputLabel id={`${uniqueId}-label`}>
        <TooltipLabel label={label} tooltip={tooltip} />
      </InputLabel>

      <Select
        labelId={`${uniqueId}-label`}
        data-testid={testid ? `${testid}-select` : `${uniqueId}-select`}
        value={safeValue}
        label={<TooltipLabel label={label} tooltip={tooltip} />}
        variant="outlined"
        onChange={(e) => handleChange(name as keyof TFormData, e.target.value)}
      >
        {(loading || !isValidValue) && (
          <MenuItem key="loading-placeholder" value="0" disabled sx={{ display: "none !important" }}>
            <em>{loading ? "Loading..." : "None"}</em>
          </MenuItem>
        )}

        {dedupedOptions.map((option) => (
          <MenuItem key={option.value} value={option.value} disabled={option.disabled}>
            {option.label}
          </MenuItem>
        ))}
      </Select>

      {(helper || showError) && (
        <FormHelperText data-testid={`${uniqueId}-helper`}>{showError ? error : helper}</FormHelperText>
      )}
    </FormControl>
  );
};

/**
 * CASE: select-multiple
 * Multiple selection with custom renderValue, clear button, and portal-disabled Menu
 */
export const AideSelectMultipleField = <TFormData,>({
  field,
  handleChange,
  error,
  showError,
  disabled,
  rawValue,
  uniqueId,
  label,
  helper,
  options,
}: AideFieldProps<TFormData>) => {
  const { name, fullWidth, sx, tooltip, testid, size } = field;
  const [openSelectMulti, setOpenSelectMulti] = useState(false);
  const valueArray: any[] = Array.isArray(rawValue) ? rawValue : [];

  return (
    <FormControl
      id={uniqueId}
      data-testid={testid || uniqueId}
      size={size}
      fullWidth={fullWidth}
      sx={{ ...oldFormControlSx, ...(!fullWidth && { width: 300 }), ...sx }}
      disabled={disabled}
      error={showError}
    >
      <InputLabel id={`${uniqueId}-label`}>
        <TooltipLabel label={label} tooltip={tooltip} />
      </InputLabel>
      <Select
        multiple
        size={size}
        fullWidth={fullWidth}
        labelId={`${uniqueId}-label`}
        label={<TooltipLabel label={label} tooltip={tooltip} />}
        variant="outlined"
        open={openSelectMulti}
        value={valueArray}
        onOpen={() => setOpenSelectMulti(true)}
        onClose={() => setOpenSelectMulti(false)}
        onChange={(e) => handleChange(name as keyof TFormData, e.target.value)}
        renderValue={(selected) => {
          const selectedLabels = selected
            .map((val) => options.find((o) => o.value === val)?.label)
            .filter(Boolean)
            .join(", ");
          return (
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Box sx={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "85%" }}>
                {selectedLabels}
              </Box>
              {valueArray.length > 0 && (
                <Box sx={{ ml: "auto", position: "relative" }}>
                  <IconButton
                    onClick={(event) => {
                      event.stopPropagation();
                      handleChange(name as keyof TFormData, []);
                    }}
                    sx={{
                      p: "4px",
                      position: "absolute",
                      transform: "translate(-100%, -50%)",
                      transformOrigin: "center",
                      visibility: "hidden",
                    }}
                    className="MuiAutocomplete-clearIndicator"
                  >
                    <AideIcon type="clear" fontSize="small" />
                  </IconButton>
                </Box>
              )}
            </Box>
          );
        }}
        MenuProps={{
          anchorOrigin: { vertical: "bottom", horizontal: "left" },
          transformOrigin: { vertical: "top", horizontal: "left" },
          disablePortal: true,
          hideBackdrop: true,
          PaperProps: {
            onBlur: () => setOpenSelectMulti(false),
            onKeyDown: (e: React.KeyboardEvent) => {
              if (e.key === "Escape") setOpenSelectMulti(false);
            },
            sx: { pointerEvents: "auto" },
          },
          sx: {
            pointerEvents: "none",
            "& .MuiMenu-list": { width: "100%", "li.MuiMenuItem-root": { display: "flex" } },
          },
        }}
        sx={{
          "&:hover .MuiAutocomplete-clearIndicator": { visibility: "visible" },
          "&:focus-within .MuiAutocomplete-clearIndicator": { visibility: "visible" },
        }}
      >
        {options.map((option) => (
          <MenuItem key={option.value} value={option.value} disabled={option.disabled}>
            <Checkbox checked={valueArray.includes(option.value)} sx={{ py: 0 }} />
            <ListItemText primary={option.label} />
          </MenuItem>
        ))}
      </Select>
      {(helper || showError) && (
        <FormHelperText data-testid={`${uniqueId}-helper`}>{showError ? error : helper}</FormHelperText>
      )}
    </FormControl>
  );
};

/**
 * RATING
 */
export const AideRatingField = <TFormData,>({
  field,
  handleChange,
  error,
  showError,
  disabled,
  rawValue,
  label,
  helper,
}: AideFieldProps<TFormData>) => {
  const { tooltip, sx, ratingConfig: cfg = {} } = field;
  const [hover, setHover] = useState<number>(-1);
  const precision = cfg.precision ?? 0.5;

  const labels: Record<string, string> = {
    "0.0": "🤔",
    "1.0": "😞",
    "2.0": "🙁",
    "3.0": "🙂",
    "4.0": "😃",
    "5.0": "🌟",
    ...((cfg.labels as Record<string, string>) ?? {}),
  };

  const displayVal = hover !== -1 ? hover : Number(rawValue) || 0;
  const labelKey = (Math.round((displayVal + Number.EPSILON) / precision) * precision).toFixed(1);

  return (
    <FormControl error={showError} sx={{ mb: 2, width: "100%", alignItems: "center", ...sx }}>
      <FormLabel sx={{ mb: 1, color: "var(--text-color) !important" }}>
        <TooltipLabel label={label} tooltip={tooltip} />
      </FormLabel>
      <Box sx={{ display: "flex", alignItems: "center", flexDirection: "column" }}>
        <Rating
          precision={precision}
          value={Number(rawValue) || null}
          onChange={(_, nv) => handleChange(field.name as keyof TFormData, nv)}
          onChangeActive={(_, h) => setHover(h)}
          disabled={disabled}
          size="large"
          icon={<AideIcon type="star" fontSize="inherit" />}
          emptyIcon={<AideIcon type="star-border" fontSize="inherit" />}
        />
        {cfg.showEmoji !== false && <Box sx={{ fontSize: "2rem", mt: 1 }}>{labels[labelKey] || ""}</Box>}
      </Box>
      {(showError || helper) && <FormHelperText error={showError}>{showError ? error : helper}</FormHelperText>}
    </FormControl>
  );
};

/**
 * CHECKBOX & SWITCH
 */
export const AideToggleField = <TFormData,>({
  field,
  handleChange,
  error,
  showError,
  disabled,
  rawValue,
  label,
  helper,
}: AideFieldProps<TFormData>) => {
  const { type, tooltip, sx, name } = field;
  const Control = type === "switch" ? Switch : Checkbox;
  return (
    <FormControl sx={{ mb: 1, ...sx }} error={showError} disabled={disabled}>
      <FormControlLabel
        control={
          <Control
            checked={!!rawValue}
            onChange={(e) => handleChange(name as keyof TFormData, e.target.checked)}
            disabled={disabled}
          />
        }
        label={
          <Box component="span" sx={{ color: "var(--text-color)" }}>
            <TooltipLabel label={label} tooltip={tooltip} />
          </Box>
        }
      />
      {(showError || helper) && <FormHelperText sx={{ ml: 4 }}>{showError ? error : helper}</FormHelperText>}
    </FormControl>
  );
};

/**
 * TAGS
 */
export const AideTagField = <TFormData,>({
  field,
  handleChange,
  disabled,
  rawValue,
  label,
  uniqueId,
}: AideFieldProps<TFormData>) => {
  const metaTag: MetaItemProps = {
    icon: getIconByString("tags"),
    label: label!,
    value: ({ labeledBy, describedBy }) => (
      <TagInput
        value={Array.isArray(rawValue) ? rawValue : []}
        onChange={(t) => handleChange(field.name as keyof TFormData, t)}
        disabled={disabled}
        aria-describedby={describedBy}
        aria-labelledby={labeledBy}
        testId={uniqueId ? `${uniqueId}--tag-input` : `meta--tag-input`}
      />
    ),
    colSpan: 3,
    labelSx: {
      color: "var(--text-color)",
    },
    iconSx: {
      color: "var(--text-color)",
    },
  };
  return (
    <Box key={uniqueId} sx={{ mb: 2, ...field.sx }}>
      <MetaItem {...metaTag} />
    </Box>
  );
};

/**
 * SLIDER
 */
export const AideSliderField = <TFormData,>({
  field,
  handleChange,
  error,
  showError,
  disabled,
  rawValue,
  label,
  uniqueId,
}: AideFieldProps<TFormData>) => (
  <Box key={uniqueId} sx={{ mb: 2, width: "100%", ...field.wrapperSx }}>
    <AideSlider
      config={{
        label: label!,
        tooltip: field.tooltip,
        ...field.sliderConfig!,
        value: rawValue,
        onChange: (val) => handleChange(field.name as keyof TFormData, val),
        disabled,
        sx: field.sx,
      }}
    />
    {showError && (
      <FormHelperText error sx={{ textAlign: "center" }}>
        {error}
      </FormHelperText>
    )}
  </Box>
);

/**
 * RADIO
 */
export const AideRadioField = <TFormData,>({
  field,
  handleChange,
  error,
  showError,
  disabled,
  rawValue,
  uniqueId,
  label,
  helper,
  options,
  startAdornment,
  endAdornment,
}: AideFieldProps<TFormData>) => (
  <FormControl key={uniqueId} component="fieldset" error={showError} disabled={disabled} sx={{ mb: 2, ...field.sx }}>
    <FormLabel
      component="legend"
      sx={{
        mb: 1,
        display: "flex",
        alignItems: "center",
        gap: 0.5,
        color: "var(--text-color) !important",
        "&.Mui-focused": { color: "var(--text-color) !important" },
      }}
    >
      {startAdornment}
      <TooltipLabel label={label} tooltip={field.tooltip} />
      {endAdornment}
    </FormLabel>
    <RadioGroup
      row
      value={rawValue ?? ""}
      onChange={(e) => handleChange(field.name as keyof TFormData, e.target.value)}
    >
      {options.map((opt) => (
        <FormControlLabel
          key={opt.value}
          value={opt.value}
          control={<Radio sx={{ color: "var(--primary-color)" }} />}
          label={
            <Box component="span" sx={{ color: "var(--text-color)" }}>
              {opt.label}
            </Box>
          }
          disabled={opt.disabled}
        />
      ))}
    </RadioGroup>
    {(showError || helper) && <FormHelperText>{showError ? error : helper}</FormHelperText>}
  </FormControl>
);
