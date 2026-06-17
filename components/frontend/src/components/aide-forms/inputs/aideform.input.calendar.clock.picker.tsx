import React, { useState, useEffect, useMemo } from "react";
import { Box, Typography, FilledInput, ToggleButtonGroup, ToggleButton, styled, Tabs, Tab } from "@mui/material";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { MultiSectionDigitalClock } from "@mui/x-date-pickers/MultiSectionDigitalClock";
import dayjs, { Dayjs } from "dayjs";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import AccessTimeIcon from "@mui/icons-material/AccessTime";

interface CalendarClockPickerProps {
  defaultTo?: "min" | "max";
  value: Dayjs | null;
  onChange: (newValue: Dayjs | null) => void;
  minDate?: Dayjs;
  maxDate?: Dayjs;
  ampm?: boolean;
  views?: ("date" | "time")[];
  showPickers?: boolean;
}

const InlineInput = styled(FilledInput)(() => ({
  fontSize: "2rem",
  fontWeight: 600,
  padding: 0,
  minWidth: 0,
  width: "2.5ch",
  height: 35,
  boxShadow: "none",
  borderRadius: 2,
  border: "1px solid transparent",
  backgroundColor: "transparent",
  color: "var(--primary-color)",
  transition: "all 150ms ease",
  "&.Mui-focused": {
    backgroundColor: "var(--primary-color)",
    color: "var(--white)",
  },
  "&:not(.Mui-focused):hover": {
    backgroundColor: "transparent",
    borderColor: "var(--primary-color)",
  },
  "&:before, &:after": {
    display: "none",
  },
  "& .MuiInputBase-input": {
    textAlign: "center",
    fontWeight: 600,
    fontSize: "2rem",
    padding: 0,
    width: "100%",
    height: "100%",
    lineHeight: "inherit",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
}));

export const CalendarClockPicker: React.FC<CalendarClockPickerProps> = ({
  defaultTo = "min",
  value,
  onChange,
  minDate,
  maxDate,
  ampm = true,
  views = ["date", "time"],
  showPickers = true,
}) => {
  const [view, setRawView] = useState<"date" | "time">(views[0]);
  const setView = (next: "date" | "time") => {
    setRawView((prev) => (prev !== next ? next : prev));
  };

  const [month, setMonth] = useState("");
  const [day, setDay] = useState("");
  const [year, setYear] = useState("");
  const [hour, setHour] = useState("");
  const [minute, setMinute] = useState("");

  useEffect(() => {
    let v = value;
    if (!v) {
      if (defaultTo === "min" && minDate) {
        v = minDate;
        onChange(v);
      } else if (defaultTo === "max" && maxDate) {
        v = maxDate;
        onChange(v);
      } else {
        v = dayjs();
      }
    }
    if (v) {
      if (minDate && v.isBefore(minDate, "day")) v = minDate;
      if (maxDate && v.isAfter(maxDate, "day")) v = maxDate;
    }
    if (v) {
      setMonth(String(v.month() + 1).padStart(2, "0"));
      setDay(v.date().toString().padStart(2, "0"));
      setYear(v.year().toString());
      const h = v.hour() % 12 || 12;
      setHour(String(h).padStart(2, "0"));
      setMinute(String(v.minute()).padStart(2, "0"));
    } else {
      const now = dayjs();
      setMonth(String(now.month() + 1).padStart(2, "0"));
      setDay(String(now.date()).padStart(2, "0"));
      setYear(String(now.year()));
      setHour("12");
      setMinute("00");
    }
  }, [value, minDate, maxDate, onChange]);

  const dateForInputs = useMemo(() => {
    const m = parseInt(month, 10) - 1;
    const d = parseInt(day, 10);
    const y = parseInt(year, 10);
    if ([m, d, y].some((n) => isNaN(n))) return null;
    return dayjs().year(y).month(m).date(d);
  }, [month, day, year]);

  const timeForInputs = useMemo(() => {
    const h = parseInt(hour, 10);
    const m = parseInt(minute, 10);
    if ([h, m].some((n) => isNaN(n))) return null;
    const base = dateForInputs || dayjs();
    const pm = (value?.hour() ?? base.hour()) >= 12;
    const hh = (h % 12) + (pm ? 12 : 0);
    return base.hour(hh).minute(m);
  }, [hour, minute, dateForInputs, value]);

  const isDateValid = !!dateForInputs?.isValid();
  const isTimeValid = !!(
    timeForInputs &&
    timeForInputs.isValid() &&
    timeForInputs.hour() >= 0 &&
    timeForInputs.minute() >= 0
  );

  const commitDate = () => {
    if (!dateForInputs?.isValid()) return;

    // Step 1: Clamp date if necessary
    let toCommit = dateForInputs;
    if (minDate && toCommit.isBefore(minDate, "day")) toCommit = minDate;
    if (maxDate && toCommit.isAfter(maxDate, "day")) toCommit = maxDate;

    // Step 2: Combine with existing time inputs
    const hour = timeForInputs?.hour() ?? 0;
    const minute = timeForInputs?.minute() ?? 0;
    let combined = toCommit.hour(hour).minute(minute);

    // Step 3: Adjust only the time *if* combined value is still out of bounds
    if (minDate && combined.isBefore(minDate)) {
      combined = toCommit.hour(minDate.hour()).minute(minDate.minute());
    } else if (maxDate && combined.isAfter(maxDate)) {
      combined = toCommit.hour(maxDate.hour()).minute(maxDate.minute());
    }

    onChange(combined);
  };

  const commitTime = () => {
    if (!isTimeValid || !timeForInputs) return;
    let toCommit = timeForInputs;
    if (minDate && toCommit.isBefore(minDate)) toCommit = minDate;
    if (maxDate && toCommit.isAfter(maxDate)) toCommit = maxDate;
    onChange(toCommit);
  };

  const handleCalendarChange = (d: Dayjs | null) => {
    if (d) onChange(value ? value.year(d.year()).month(d.month()).date(d.date()) : d);
  };

  const handleClockChange = (t: Dayjs | null) => {
    if (!t || !value) return;
    let newTime = value.hour(t.hour()).minute(t.minute());
    if (minDate && newTime.isBefore(minDate)) newTime = minDate;
    if (maxDate && newTime.isAfter(maxDate)) newTime = maxDate;
    onChange(newTime);
  };

  const renderPickers = () => (
    <>
      {views.length === 2 && (
        <Tabs
          value={view}
          onChange={(_, v) => setView(v)}
          variant="fullWidth"
          sx={{
            "& .MuiButtonBase-root svg path": { fill: "var(--text-color)" },
            "& .MuiButtonBase-root.Mui-selected svg path": { fill: "var(--primary-color)" },
            fill: "var(--primary-color)",
            "& .MuiTabs-indicator": { backgroundColor: "var(--primary-color)" },
          }}
        >
          <Tab value="date" icon={<CalendarTodayIcon />} />
          <Tab value="time" icon={<AccessTimeIcon />} />
        </Tabs>
      )}

      {view === "date" && (
        <DateCalendar
          value={value}
          onChange={handleCalendarChange}
          minDate={minDate}
          maxDate={maxDate}
          sx={{
            width: "100%",
            color: "var(--text-color)",
            "svg path": {
              fill: "var(--text-color)",
            },
            ".MuiPickersCalendarHeader-labelContainer": {
              display: "none",
            },
            ".MuiPickersArrowSwitcher-root": {
              ml: "auto",
            },
            "& .MuiDayCalendar-weekDayLabel": {
              color: "var(--text-color)",
            },
            "& .MuiPickersDay-root": {
              color: "var(--primary-color)",
              "&.Mui-selected": {
                backgroundColor: "var(--primary-color)",
                color: "var(--white)",
              },
              "&.Mui-disabled": {
                color: "var(--gray-3)",

                "&:not(.Mui-selected)": {
                  color: "var(--gray-3)",
                },
              },
            },
          }}
        />
      )}

      {view === "time" && (
        <MultiSectionDigitalClock
          timeSteps={{ hours: 1, minutes: 1 }}
          value={value}
          onChange={handleClockChange}
          ampm={ampm}
          views={["hours", "minutes"]}
          shouldDisableTime={(timeValue, viewType) => {
            if (!value) return false;
            let base = dayjs(timeValue);
            if (viewType === "hours") base = base.set("minute", value.minute());
            else if (viewType === "minutes") base = base.set("hour", value.hour());
            if (minDate && base.isBefore(minDate)) return true;
            if (maxDate && base.isAfter(maxDate)) return true;
            return false;
          }}
        />
      )}
    </>
  );

  const renderInputs = () => (
    <Box sx={{ display: "flex", gap: 1 }}>
      {views.includes("date") && (
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 0 }}>
          <InlineInput
            error={!isDateValid}
            value={year}
            inputProps={{ maxLength: 4, inputMode: "numeric" }}
            onFocus={() => setView("date")}
            onChange={(e) => setYear(e.target.value)}
            onBlur={commitDate}
            onKeyDown={(e) => e.key === "Enter" && commitDate()}
            sx={{
              width: "3ch",
              height: 28,
              "& .MuiInputBase-input": {
                fontSize: "1.25rem",
              },
            }}
          />
          <Box display="flex" gap={1} alignItems="center">
            <InlineInput
              error={!isDateValid}
              value={month}
              inputProps={{ maxLength: 2, inputMode: "numeric" }}
              onFocus={() => setView("date")}
              onChange={(e) => setMonth(e.target.value)}
              onBlur={commitDate}
              onKeyDown={(e) => e.key === "Enter" && commitDate()}
            />
            <Typography sx={{ color: "var(--primary-color)" }}>/</Typography>
            <InlineInput
              error={!isDateValid}
              value={day}
              inputProps={{ maxLength: 2, inputMode: "numeric" }}
              onFocus={() => setView("date")}
              onChange={(e) => setDay(e.target.value)}
              onBlur={commitDate}
              onKeyDown={(e) => e.key === "Enter" && commitDate()}
            />
          </Box>
        </Box>
      )}

      {views.includes("time") && (
        <Box sx={{ display: "flex", alignItems: "flex-end", gap: 0, ml: "auto" }}>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <InlineInput
              error={!isTimeValid}
              value={hour}
              inputProps={{ maxLength: 2, inputMode: "numeric" }}
              onFocus={() => setView("time")}
              onChange={(e) => setHour(e.target.value)}
              onBlur={commitTime}
              onKeyDown={(e) => e.key === "Enter" && commitTime()}
              sx={{ width: "3.75ch", height: 45, "& .MuiInputBase-input": { fontSize: "3rem" } }}
            />
            <Typography sx={{ color: "var(--primary-color)", mx: "1px" }}>:</Typography>
            <InlineInput
              error={!isTimeValid}
              value={minute}
              inputProps={{ maxLength: 2, inputMode: "numeric" }}
              onFocus={() => setView("time")}
              onChange={(e) => setMinute(e.target.value)}
              onBlur={commitTime}
              onKeyDown={(e) => e.key === "Enter" && commitTime()}
              sx={{ width: "3.75ch", height: 45, "& .MuiInputBase-input": { fontSize: "3.2rem" } }}
            />
          </Box>
          <ToggleButtonGroup
            exclusive
            size="small"
            value={(value?.hour() ?? 0) >= 12 ? "PM" : "AM"}
            onChange={(_, v) => {
              if (!value || !v) return;
              let h = value.hour() % 12;
              h += v === "PM" ? 12 : 0;
              onChange(value.hour(h));
            }}
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 0.5,
              backgroundColor: "transparent",
              p: 0,
              ml: 0.5,
              border: "none",
              "& .MuiToggleButton-root": {
                p: 0,
                m: 0,
                width: 35,
                height: 20,
                border: "1px solid transparent",
                color: "var(--text-color)",
                backgroundColor: "transparent",
                borderRadius: 0,
                transition: "all 200ms ease",
                "&.Mui-selected": {
                  backgroundColor: "var(--primary-color)",
                  color: "var(--inverse-text-color)",
                  borderColor: "var(--primary-color)",
                  fontWeight: 600,
                },
              },
            }}
          >
            <ToggleButton value="AM" onFocus={() => setView("time")}>
              AM
            </ToggleButton>
            <ToggleButton value="PM" onFocus={() => setView("time")}>
              PM
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
      )}
    </Box>
  );

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 1,
        px: 0,

        "& .MuiPickersLayout-root": {
          backgroundColor: "var(--panel-background-color)",
          color: "var(--text-color)",
          display: "flex",
          flexDirection: "column",
        },

        "& .MuiMultiSectionDigitalClock-root": {
          width: "100%",
          height: 336,
        },
        "& .MuiMultiSectionDigitalClockSection-root": {
          flex: 1,
          minWidth: 0,
          overflowY: "overlay",
          "&::-webkit-scrollbar": {
            width: "8px",
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "var(--gray-4)",
            borderRadius: 4,
            opacity: 0, // initially hidden
            transition: "opacity 150ms ease",
          },
          "&:hover::-webkit-scrollbar-thumb": {
            opacity: 1,
          },

          scrollbarWidth: "thin",
          "&:hover": {
            scrollbarColor: "var(--gray-4) transparent",
          },
        },
        "& .MuiMultiSectionDigitalClockSection-item": {
          width: "100%",

          "&.Mui-selected": {
            backgroundColor: "var(--primary-color)",
          },
        },
      }}
    >
      {!showPickers && renderInputs()}
      {showPickers && renderPickers()}
    </Box>
  );
};
