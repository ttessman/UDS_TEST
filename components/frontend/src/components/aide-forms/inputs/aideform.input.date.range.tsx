import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  IconButton,
  Dialog,
  ToggleButtonGroup,
  ToggleButton,
  Button,
  SxProps,
  Tooltip,
  Popper,
} from "@mui/material";
import dayjs, { Dayjs } from "dayjs";
import minMax from "dayjs/plugin/minMax";
import { AideIcon } from "components/utility/AideIcon";
import ConditionalWrapper from "components/utility/ConditionalWrapper";
import { CalendarClockPicker } from "components/forms/inputs/aideform.input.calendar.clock.picker";

dayjs.extend(minMax);

export type DateRangeLayoutType = "modal" | "popper" | "inline";

interface DateRangeProps {
  start: Dayjs | null;
  end: Dayjs | null;
  onChange: (value: [Dayjs | null, Dayjs | null]) => void;
  tooltip?: string;
  size?: "small" | "medium";
  label?: string;
  minDate?: Dayjs;
  maxDate?: Dayjs;
  sx?: SxProps;
  layout?: DateRangeLayoutType;
  open: boolean;
  setOpen: (open: boolean) => void;
}

export const DateRange: React.FC<DateRangeProps> = ({
  start,
  end,
  onChange,
  tooltip = "Select date range",
  size = "medium",
  label = "Date Range",
  minDate,
  maxDate,
  sx,
  layout = "modal",
  open,
  setOpen,
}) => {
  const [pickerState, setPickerState] = useState<"start" | "end">("start");
  const [tempRange, setTempRange] = useState<[Dayjs | null, Dayjs | null]>([start, end]);
  const popperRef = useRef<HTMLDivElement | null>(null);
  const anchorRef = useRef<HTMLElement | null>(null);

  const [tempStart, tempEnd] = tempRange;

  const handleToggle = (_: unknown, newVal: "start" | "end" | null) => {
    if (newVal) setPickerState(newVal);
  };

  const handleIconClick = (e: React.MouseEvent<HTMLElement>) => {
    setTempRange([start, end]);
    anchorRef.current = e.currentTarget;
    setOpen(true);
  };

  const handleStartChange = (val: Dayjs | null) => {
    setTempRange([val, tempEnd]);
  };

  const handleEndChange = (val: Dayjs | null) => {
    setTempRange([tempStart, val]);
  };

  const handleAccept = () => {
    onChange(tempRange);
    setOpen(false);
  };

  const handleNavButton = () => {
    if (pickerState === "start") {
      setPickerState("end");
    } else {
      setPickerState("start");
    }
  };

  const handlePartialClear = () => {
    if (pickerState === "start") {
      setTempRange([null, tempEnd]);
    } else {
      setTempRange([tempStart, null]);
    }
  };

  const handleClose = () => {
    setOpen(false);
  };

  const formattedRange =
    start && end ? `${start.format("YYYY-MM-DD hh:mm A")} to ${end.format("YYYY-MM-DD hh:mm A")}` : "";

  useEffect(() => {
    const onClickOutside = (event: MouseEvent) => {
      if (popperRef.current && !popperRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    if (layout === "popper") document.addEventListener("mousedown", onClickOutside);
    return () => {
      if (layout === "popper") {
        document.removeEventListener("mousedown", onClickOutside);
      }
    };
  }, []);

  const renderCore = () => (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        p: 2,
        width: "100%",
        alignItems: "flex-start",
        border: "1px solid var(--border-color)",
        borderRadius: 1,
        ...(layout !== "inline" && {
          background: "var(--card-background-color)",
          border: "none",
          boxShadow: 3,
          alignItems: "center",
          p: 3,
        }),
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          flexDirection: layout !== "inline" ? "column" : "row",
          width: "100%",
        }}
      >
        <Box component="h5" sx={{ color: "var(--text-color)", fontWeight: "500", mb: 1.5 }}>
          {label}
        </Box>
        <ToggleButtonGroup
          value={pickerState}
          exclusive
          onChange={handleToggle}
          size="small"
          sx={{
            display: "flex",
            gap: 1,
            mx: layout !== "inline" ? "auto" : 0,
            mb: 1,
            backgroundColor: "transparent",
            borderRadius: 1.5,
            p: 0,
            pl: layout !== "inline" ? 1 : 0,
            ml: "auto",
            border: "none",
            "& .MuiToggleButton-root": {
              p: 0,
              m: 0,
              width: 60,
              height: 25,
              border: "1px solid var(--text-color)",
              color: "var(--text-color)",
              backgroundColor: "transparent",
              borderRadius: 1,
              transition: "all 200ms ease",
              "&.Mui-selected": {
                backgroundColor: "var(--primary-color)",
                color: "var(--inverse-text-color)",
                borderColor: "var(--primary-color)",
                fontWeight: 600,
              },
              "&:hover": {
                backgroundColor: "var(--primary-hover-color)",
                borderColor: "var(--primary-color)",
                color: "var(--text-color)",
              },
              "&.Mui-selected:hover": {
                color: "var(--primary-color)",
              },
            },
          }}
        >
          <ToggleButton value="start">Start</ToggleButton>
          <ToggleButton value="end">End</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {pickerState === "start" && (
        <CalendarClockPicker
          value={tempStart}
          onChange={handleStartChange}
          defaultTo="min"
          minDate={minDate}
          maxDate={tempEnd && maxDate ? dayjs.min(tempEnd, maxDate) : tempEnd || maxDate}
          showPickers={false}
        />
      )}

      {pickerState === "end" && (
        <CalendarClockPicker
          value={tempEnd}
          onChange={handleEndChange}
          defaultTo="max"
          minDate={tempStart && minDate ? dayjs.max(tempStart, minDate) : tempStart || minDate}
          maxDate={maxDate}
          showPickers={false}
        />
      )}

      <Box
        sx={{
          display: "flex",
          justifyContent: layout !== "inline" ? "flex-end" : "flex-start",
          gap: 1,
          mt: 2,
          width: "100%",
        }}
      >
        <Tooltip title={`Reset ${pickerState} date`} placement="bottom">
          <Button onClick={handlePartialClear} data-testid="date-range--clear-btn" variant="text">
            Clear
          </Button>
        </Tooltip>
        {layout !== "inline" && (
          <Button onClick={handleClose} data-testid="date-range--close-btn" variant="outlined" sx={{ ml: "auto" }}>
            Cancel
          </Button>
        )}
        <Tooltip title={pickerState === "start" ? "Move to end date" : "Move back to start date"} placement="bottom">
          <Button
            onClick={handleNavButton}
            variant={layout === "inline" ? "outlined" : "contained"}
            data-testid="date-range--okay-btn"
            sx={{ width: 78 }}
          >
            {pickerState === "start" ? "Next" : "Back"}
          </Button>
        </Tooltip>
        <Tooltip title="Apply date range to table" placement="bottom">
          <Button onClick={handleAccept} variant="contained" data-testid="date-range--okay-btn" sx={{ width: 78 }}>
            Apply
          </Button>
        </Tooltip>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1, width: "100%" }}>
      {layout !== "inline" && (
        <Tooltip title={formattedRange || tooltip}>
          <IconButton
            onClick={handleIconClick}
            size={size}
            sx={{
              border: "1px solid",
              borderColor: "var(--border-color)",
              borderRadius: 1,
              height: size === "small" ? 40 : 56,
              px: 1.5,
              justifyContent: "flex-start",
              display: "flex",
              alignItems: "center",
              gap: 1,
              typography: "body2",
              color: "var(--text-color)",
              textAlign: "left",
              "&:hover": {
                borderColor: "var(--text-color)",
                backgroundColor: "transparent",
              },
              fontSize: "1rem",
              ...sx,
            }}
          >
            <Box sx={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{label}</Box>
            <AideIcon type="calendar" />
          </IconButton>
        </Tooltip>
      )}

      <ConditionalWrapper
        useWrapper={layout !== "inline"}
        wrapper={({ children: wrapperChildren }: { children: React.ReactNode }) => {
          if (layout === "modal") {
            return (
              <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
                {wrapperChildren}
              </Dialog>
            );
          }
          if (layout === "popper" && anchorRef.current) {
            return (
              <Popper
                open={open}
                anchorEl={anchorRef.current}
                placement="bottom-start"
                ref={popperRef}
                sx={{ zIndex: 1400 }}
              >
                {wrapperChildren}
              </Popper>
            );
          }
        }}
      >
        {renderCore()}
      </ConditionalWrapper>
    </Box>
  );
};
