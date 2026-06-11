import { useEffect, useRef, useState } from "react";
import { Box, InputAdornment, TextField } from "@mui/material";
import type { TextFieldProps } from "@mui/material";
import { motion, useReducedMotion } from "motion/react";
import { AppIcon } from "../../icon/AppIcon.js";
import { IconActionButton } from "../../button/resourceTypes/IconActionButton.js";
import { searchFieldMotion } from "../form.motion.js";

export function SearchField({
  iconPosition = "start",
  label,
  onChange,
  placeholder,
  sx,
  value,
  ...props
}: Omit<TextFieldProps, "onChange" | "slotProps" | "value"> & {
  iconPosition?: "start" | "end";
  label: string;
  onChange: (value: string) => void;
  placeholder: string;
  value: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const reduceMotion = useReducedMotion();
  const isExpanded = expanded || value.length > 0;
  const rootSx = Array.isArray(sx) ? sx : sx ? [sx] : [];

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
        sx={{ color: "text.secondary", height: 28, ml: iconPosition === "end" ? 0.5 : 0, mr: iconPosition === "start" ? 0.5 : 0, width: 28 }}
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
          ml: iconPosition === "end" ? 1 : 0,
          mr: iconPosition === "start" ? 1 : 0
        }}
      >
        <AppIcon name="search" />
      </Box>
    );

  return (
    <Box
      component={motion.div}
      animate={{ width: isExpanded ? "100%" : 48 }}
      initial={false}
      sx={[
        { display: "flex", justifyContent: "flex-end", maxWidth: 280, minWidth: 48 },
        ...rootSx,
        {
          flex: isExpanded ? undefined : "0 0 48px",
          maxWidth: isExpanded ? undefined : 48
        }
      ]}
      transition={reduceMotion ? { duration: 0 } : searchFieldMotion.transition}
    >
      <TextField
        aria-label={label}
        inputRef={inputRef}
        onChange={(event) => onChange(event.target.value)}
        onClick={() => setExpanded(true)}
        onFocus={() => setExpanded(true)}
        placeholder={isExpanded ? placeholder : ""}
        size="small"
        slotProps={{
          input: {
            endAdornment: iconPosition === "end" ? <InputAdornment position="end">{adornment}</InputAdornment> : undefined,
            startAdornment: iconPosition === "start" ? <InputAdornment position="start">{adornment}</InputAdornment> : undefined,
            sx: {
              cursor: isExpanded ? "text" : "pointer",
              overflow: "hidden",
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
}
