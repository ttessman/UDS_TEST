import React, { useState, useRef } from "react";
import styles from "./aideform.input.tag.styles.module.scss";
import cx from "classnames";
import { Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import AutocompletePopover from "components/AutoCompletePopover/AutoCompletePopover";
import { TagChip, TagVariant } from "./aideform.input.tag.chip";

export interface TagInputProps {
  value: string[];
  onChange: (chips: string[]) => void;
  hasBorder?: boolean;
  disabled?: boolean;
  "aria-describedby"?: string;
  "aria-labelledby"?: string;
  testId?: string;
}
/**
 * TagInput is a generic Input to dynamically create
 * a new list of strings commonly seen in tagging components.
 */
export const TagInput: React.FC<TagInputProps> = (props: TagInputProps) => {
  const [inputValue, setInputValue] = useState("");
  const [popoverOpen, setPopoverOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const disabled = props.disabled ?? false;
  const navigate = useNavigate();

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === "Enter" && inputValue.trim() !== "") {
      e.preventDefault();
      if (!props.value.includes(inputValue.trim())) {
        const updatedArray: string[] = [...props.value, inputValue.trim()];
        setInputValue("");
        props.onChange(updatedArray);
      } else {
        setInputValue("");
      }
      setPopoverOpen(false);
    }
  };

  const handleDelete = (chipToDelete: string): void => {
    const updatedArray: string[] = props.value.filter((name) => name !== chipToDelete);
    props.onChange(updatedArray);
  };

  const handleSelectSuggestion = (result: string): void => {
    if (!props.value.includes(result)) {
      props.onChange([...props.value, result]);
    }
    setInputValue("");
    setPopoverOpen(false);
  };

  return (
    <div className={cx(styles.wrapper, { [styles.withPadding]: props.hasBorder })}>
      <Box
        sx={{
          display: "contents",
          justifyContent: "flex-start",
          flexWrap: "wrap",
          listStyle: "none",
          p: 0,
          m: 0,
          border: "none",
          flex: 1,
        }}
        component="ul"
        role="list"
        data-testid="tag-chip-list"
      >
        {props.value.map((chip) => (
          <Box
            component="li"
            key={chip}
            role="listitem"
            sx={{ display: "inline", "&:not(:last-child)": { mr: "5px" } }}
          >
            <TagChip
              label={chip}
              variant={TagVariant.INPUT}
              onDelete={() => handleDelete(chip)}
              onClick={() => navigate(`/search?q=${encodeURIComponent(chip)}`)}
              testId={`tag-chip--${chip.toLowerCase()}`}
            />
          </Box>
        ))}
      </Box>

      <input
        type="text"
        ref={inputRef}
        value={inputValue}
        className={styles.chipInput}
        autoComplete="off"
        onChange={(e) => {
          setInputValue(e.target.value);
          setPopoverOpen(e.target.value.length > 1);
        }}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        aria-labelledby={props["aria-labelledby"]}
        aria-describedby={props["aria-describedby"]}
        data-testid={props.testId}
      />

      <AutocompletePopover
        anchorEl={inputRef.current}
        query={inputValue}
        open={popoverOpen}
        onSelect={handleSelectSuggestion}
        currentTags={props.value ?? []}
      />
    </div>
  );
};
