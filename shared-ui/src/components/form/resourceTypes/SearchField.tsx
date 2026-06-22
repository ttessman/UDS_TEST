import { useEffect, useRef, useState, type ReactNode } from "react";
import { Box, InputAdornment, TextField } from "@mui/material";
import type { TextFieldProps } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { motion, useReducedMotion } from "motion/react";
import { AppIcon } from "../../icon/AppIcon.js";
import { IconActionButton } from "../../button/resourceTypes/IconActionButton.js";
import { searchFieldMotion } from "../form.motion.js";

const searchFieldHeight = 40;
const searchFieldCollapsedWidth = 40;
const searchFieldExpandedWidth = 280;

export function SearchField({
  addon,
  iconPosition = "start",
  label,
  onChange,
  placeholder,
  sx,
  value,
  ...props
}: Omit<TextFieldProps, "onChange" | "slotProps" | "value"> & {
  addon?: ReactNode;
  iconPosition?: "start" | "end";
  label: string;
  onChange: (value: string) => void;
  placeholder: string;
  value: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const reduceMotion = useReducedMotion();
  const theme = useTheme();
  const forceExpanded = useMediaQuery(theme.breakpoints.down(640));
  const isExpanded = forceExpanded || expanded || value.length > 0;
  const rootSx = Array.isArray(sx) ? sx : sx ? [sx] : [];
  const fieldRootSx = addon ? [] : rootSx;

  useEffect(() => {
    if (isExpanded) {
      inputRef.current?.focus();
    }
  }, [isExpanded]);

  const adornment =
    value.length > 0 ? (
      <IconActionButton
        icon="close"
        label={`Clear ${placeholder}`}
        onClick={() => onChange("")}
        sx={{ color: "text.secondary", height: 32, width: 32 }}
      />
    ) : (
      <Box
        aria-hidden="true"
        component="span"
        onClick={() => {
          setExpanded(true);
          inputRef.current?.focus();
        }}
        sx={{
          alignItems: "center",
          color: "text.secondary",
          cursor: "pointer",
          display: "inline-flex",
          height: searchFieldHeight,
          justifyContent: "center",
          width: searchFieldHeight
        }}
      >
        <AppIcon name="search" />
      </Box>
    );

  const field = (
    <Box
      component={motion.div}
      animate={{ width: isExpanded ? "100%" : searchFieldCollapsedWidth }}
      initial={false}
      sx={[
        {
          display: "flex",
          height: searchFieldHeight,
          justifyContent: "flex-end",
          maxWidth: searchFieldExpandedWidth,
          minWidth: searchFieldCollapsedWidth
        },
        ...fieldRootSx,
        {
          flex: isExpanded ? "1 1 0" : `0 0 ${searchFieldCollapsedWidth}px`,
          maxWidth: isExpanded ? "none" : searchFieldCollapsedWidth,
          width: isExpanded ? "100%" : searchFieldCollapsedWidth
        }
      ]}
      transition={reduceMotion ? { duration: 0 } : searchFieldMotion.transition}
    >
      <TextField
        aria-label={label}
        inputRef={inputRef}
        onChange={(event) => onChange(event.target.value)}
        onClick={() => setExpanded(true)}
        onBlur={() => {
          if (!forceExpanded && value.length === 0) {
            setExpanded(false);
          }
        }}
        onFocus={() => setExpanded(true)}
        placeholder={isExpanded ? placeholder : ""}
        size="small"
        slotProps={{
          input: {
            endAdornment: iconPosition === "end" ? <InputAdornment position="end">{adornment}</InputAdornment> : undefined,
            startAdornment: iconPosition === "start" ? <InputAdornment position="start">{adornment}</InputAdornment> : undefined,
            sx: {
              borderRadius: "var(--app-radius-control)",
              cursor: isExpanded ? "text" : "pointer",
              height: searchFieldHeight,
              overflow: "hidden",
              px: isExpanded ? undefined : 0,
              "& .MuiInputAdornment-root": {
                height: searchFieldHeight,
                m: 0,
                maxHeight: "none"
              },
              "& .MuiOutlinedInput-notchedOutline": {
                borderRadius: "var(--app-radius-control)"
              },
              "& input": {
                cursor: isExpanded ? "text" : "pointer",
                opacity: isExpanded ? 1 : 0,
                p: isExpanded ? undefined : 0,
                width: isExpanded ? "100%" : 0
              }
            }
          }
        }}
        value={isExpanded ? value : ""}
        {...props}
        sx={{ width: "100%" }}
      />
    </Box>
  );

  if (!addon) {
    return field;
  }

  return (
    <Box
      sx={[
        {
          alignItems: "center",
          display: "flex",
          flexWrap: "nowrap",
          gap: 1,
          justifyContent: "flex-end",
          maxWidth: searchFieldExpandedWidth + searchFieldCollapsedWidth + 8,
          minWidth: 0,
          width: "100%"
        },
        ...rootSx
      ]}
    >
      {addon}
      {field}
    </Box>
  );
}
