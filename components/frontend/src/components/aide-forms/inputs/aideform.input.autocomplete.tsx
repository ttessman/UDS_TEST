import {
  Autocomplete,
  TextField,
  Checkbox,
  ListItemText,
  MenuItem,
  InputAdornment,
  AutocompleteRenderGroupParams,
  Box,
  Chip,
} from "@mui/material";
import { TooltipLabel } from "components/utility/TooltipLabel";
import { AideIcon } from "components/utility/AideIcon";
import { AideFieldProps } from "../aideform";

export const renderGroupLabel = (params: AutocompleteRenderGroupParams) => (
  <li key={params.key}>
    <Box
      sx={{
        position: "sticky",
        top: "-8px",
        padding: "4px 16px",
        backgroundColor: "var(--panel-background-color, #fff)",
        fontWeight: "600",
        fontSize: "0.75rem",
        zIndex: 1,
        color: "var(--text-color)",
        borderBottom: "1px solid var(--border-color)",
        textTransform: "uppercase",
      }}
    >
      {params.group}
    </Box>
    <Box component="ul" sx={{ m: 0, p: 0, listStyle: "none" }}>
      {params.children}
    </Box>
  </li>
);

export const AideAutocompleteFields = <TFormData,>({
  field,
  handleChange,
  disabled,
  rawValue,
  uniqueId,
  label,
  options,
  showError,
  error,
  helper,
}: AideFieldProps<TFormData>) => {
  const { type, name, placeholder, fullWidth, size, sx, tooltip, testid } = field;

  const autocompleteSx = {
    mb: 2,
    "& .MuiInputBase-root": { color: "var(--text-color)" },
    "& .MuiOutlinedInput-notchedOutline": { borderColor: "var(--border-color)" },
    "& .MuiChip-root": {
      height: "24px",
      backgroundColor: "var(--primary-color-alpha, rgba(255, 255, 255, 0.1))",
      color: "var(--text-color)",
      "& .MuiChip-label": { color: "inherit" },
      "& .MuiChip-deleteIcon": { color: "inherit", opacity: 0.7 },
    },
    ...sx,
  };

  const slotProps = {
    paper: {
      sx: {
        backgroundColor: "var(--panel-background-color, #fff)",
        color: "var(--text-color)",
        border: "1px solid var(--border-color)",
        "& .MuiAutocomplete-noOptions": { color: "var(--text-color)", padding: "12px 16px" },
      },
    },
    listbox: {
      sx: {
        p: 0.5,
        "& .MuiAutocomplete-option": {
          minHeight: "unset !important",
          padding: "6px 16px !important",
          color: "var(--text-color)",
        },
      },
    },
  };

  if (type === "autocomplete-multiple") {
    const valueArray = Array.isArray(rawValue) ? rawValue : [];
    const groupedOptions = options
      .map((o) => ({
        ...o,
        group: valueArray.includes(o.value) ? "Selected" : o.group || "Available",
      }))
      .sort((a, b) => {
        if (a.group === b.group) return 0;
        return a.group === "Selected" ? -1 : 1;
      });

    return (
      <Autocomplete
        key={uniqueId}
        id={uniqueId}
        multiple
        size={size || "small"}
        options={groupedOptions}
        groupBy={(opt) => opt.group!}
        renderGroup={renderGroupLabel}
        getOptionLabel={(opt) => opt.label}
        value={options.filter((o) => valueArray.includes(o.value))}
        onChange={(_, nv) =>
          handleChange(
            name as keyof TFormData,
            nv.map((v) => v.value),
          )
        }
        disabled={disabled}
        slotProps={slotProps}
        renderTags={(tagValue, getTagProps) =>
          tagValue.map((option, index) => <Chip label={option.label} {...getTagProps({ index })} size="small" />)
        }
        renderOption={(props, opt) => (
          <MenuItem
            {...props}
            sx={{ color: "var(--text-color)" }}
            data-testid={`${testid || uniqueId}--option-${opt.value}`}
          >
            <Checkbox checked={valueArray.includes(opt.value)} size="small" sx={{ p: 0, mr: 1.5 }} />
            <ListItemText primary={opt.label} primaryTypographyProps={{ fontSize: "0.875rem" }} sx={{ m: 0 }} />
          </MenuItem>
        )}
        renderInput={(params) => (
          <TextField
            {...params}
            inputProps={{ ...params.inputProps, "data-testid": testid || `${uniqueId}--input` }}
            label={<TooltipLabel label={label} tooltip={tooltip} />}
            placeholder={valueArray.length === 0 ? placeholder : ""}
            error={showError}
            helperText={showError ? error : helper}
            InputProps={{
              ...params.InputProps,
              startAdornment: (
                <>
                  <InputAdornment position="start" sx={{ mr: 0 }}>
                    <AideIcon type="event" fontSize="small" />
                  </InputAdornment>
                  {params.InputProps.startAdornment}
                </>
              ),
            }}
          />
        )}
        sx={autocompleteSx}
        fullWidth={fullWidth !== false}
      />
    );
  }

  return (
    <Autocomplete
      key={uniqueId}
      id={uniqueId}
      options={options}
      size={size || "small"}
      getOptionLabel={(opt) => opt.label}
      value={options.find((o) => o.value === rawValue) || null}
      onChange={(_, nv) => handleChange(name as keyof TFormData, nv?.value)}
      disabled={disabled}
      slotProps={slotProps}
      renderOption={(props, opt) => (
        <MenuItem
          {...props}
          sx={{ color: "var(--text-color)", fontSize: "0.875rem" }}
          data-testid={`${testid || uniqueId}--option-${opt.value}`}
        >
          {opt.label}
        </MenuItem>
      )}
      renderInput={(params) => (
        <TextField
          {...params}
          inputProps={{ ...params.inputProps, "data-testid": testid || `${uniqueId}--input` }}
          label={<TooltipLabel label={label} tooltip={tooltip} />}
          error={showError}
          helperText={showError ? error : helper}
          InputProps={{
            ...params.InputProps,
            startAdornment: (
              <InputAdornment position="start" sx={{ mr: 0 }}>
                <AideIcon type="event" fontSize="small" />
              </InputAdornment>
            ),
          }}
        />
      )}
      sx={autocompleteSx}
      fullWidth={fullWidth !== false}
    />
  );
};
