import React from "react";
import { Box, Slider, SliderProps as MuiSliderProps, SxProps, Theme, TextField, styled } from "@mui/material";
import { TooltipLabel } from "components/utility/TooltipLabel";
import { useTheme } from "themes/AIDEThemeContext";

type SliderMarksProp = React.ComponentProps<typeof Slider>["marks"];
export type SliderMark = Extract<SliderMarksProp, any[]>[number];

export interface AideSliderConfig {
  min: number;
  max: number;
  step: number;
  marks: SliderMark[];
  showInput?: boolean;
  label?: string;
  tooltip?: string;
  valueLabelDisplay?: MuiSliderProps["valueLabelDisplay"];
  value?: number;
  onChange?: (val: number) => void;
  initialValue?: number;
  sx?: SxProps<Theme>;
  disabled?: boolean;
}

export interface AideSliderProps {
  config: AideSliderConfig;
}

export const AideStyledSlider = styled(Slider, {
  shouldForwardProp: (prop) => prop !== "aideTheme",
})<{ aideTheme: "light" | "dark" }>(({ aideTheme }) => ({
  color: "var(--primary-color)",
  height: 4,
  padding: "14px 0",
  "& .MuiSlider-thumb": {
    height: 22,
    width: 22,
    backgroundColor: aideTheme === "dark" ? "var(--primary-color)" : "var(--white, #fff)",
    borderStyle: "solid",
    borderWidth: "2px",
    borderColor: "var(--primary-color)",
    "&:focus, &:hover, &.Mui-active, &.Mui-focusVisible": {
      boxShadow: "0px 0px 0px 8px rgba(var(--primary-color-rgb), 0.16)",
    },
    "&::before": {
      display: "none",
    },
  },
  "& .MuiSlider-track": {
    height: 4,
    backgroundColor: "var(--primary-color)",
  },
  "& .MuiSlider-rail": {
    height: 4,
    color: aideTheme === "dark" ? "var(--border-alt-color, #444)" : "var(--border-color, #ccc)",
    opacity: 1,
  },
  "& .MuiSlider-mark": {
    backgroundColor: "var(--primary-color)",
    height: 8,
    width: 2,
    marginTop: -2,
  },
  "& .MuiSlider-markLabel": {
    color: "var(--text-color)",
    fontSize: "0.75rem",
    top: 30,
  },
  "& .MuiSlider-valueLabel": {
    backgroundColor: "var(--tooltip-bg-color, #333)",
    color: "var(--tooltip-text-color, #fff)",
    borderRadius: "4px",
  },
}));

export const AideSlider: React.FC<AideSliderProps> = ({ config }) => {
  const { theme: aideTheme } = useTheme();
  const {
    min,
    max,
    step,
    marks,
    showInput = false,
    label,
    tooltip,
    valueLabelDisplay = "auto",
    value,
    onChange,
    initialValue = min,
    sx,
    disabled,
  } = config;

  const isControlled = value !== undefined && onChange !== undefined;
  const [internalValue, setInternalValue] = React.useState(initialValue);
  const currentValue = isControlled ? value : internalValue;

  const updateValue = (newVal: number) => {
    if (isControlled) {
      onChange(newVal);
    } else {
      setInternalValue(newVal);
    }
  };

  const handleSliderChange = (_: Event, newValue: number | number[]) => {
    updateValue(newValue as number);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = Number(event.target.value);
    if (!isNaN(newVal)) updateValue(newVal);
  };

  const handleBlur = () => {
    if (currentValue < min) updateValue(min);
    else if (currentValue > max) updateValue(max);
  };

  return (
    <Box
      sx={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        mb: "0.5rem",
        gap: "0.5rem",
        ...sx,
      }}
    >
      {(label || showInput) && (
        <Box
          sx={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            // Icons in labels only show on interaction/shrink
            // Since Sliders don't 'shrink', we default them to flex but allow custom logic
            "& svg": {
              fontSize: "1.1rem",
              ml: 0.5,
              color: "var(--primary-color)",
              verticalAlign: "middle",
            },
          }}
        >
          {label && (
            <Box
              component="label"
              sx={{
                fontSize: "0.875rem",
                fontWeight: 500,
                color: "var(--text-color)",
                display: "flex",
                alignItems: "center",
              }}
            >
              <TooltipLabel label={label} tooltip={tooltip} />
            </Box>
          )}
          {showInput && (
            <TextField
              variant="outlined"
              value={currentValue}
              type="number"
              size="small"
              onChange={handleInputChange}
              onBlur={handleBlur}
              disabled={disabled}
              inputProps={{
                step,
                min,
                max,
              }}
              sx={{
                width: "max-content",
                ml: "auto",
                "& .MuiInputBase-root": {
                  color: "var(--text-color)",
                  fontSize: "0.875rem",
                  backgroundColor: "var(--input-bg-color, transparent)",
                },
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "var(--border-color)",
                },
                input: {
                  py: "4px",
                  px: "8px",
                  textAlign: "center",
                  width: "60px",
                },
              }}
            />
          )}
        </Box>
      )}

      <AideStyledSlider
        value={currentValue}
        onChange={handleSliderChange}
        marks={marks}
        step={step}
        min={min}
        max={max}
        valueLabelDisplay={valueLabelDisplay}
        sx={{
          mx: "10px",
          width: "calc(100% - 20px)",
        }}
        aideTheme={aideTheme}
        disabled={disabled}
      />
    </Box>
  );
};
