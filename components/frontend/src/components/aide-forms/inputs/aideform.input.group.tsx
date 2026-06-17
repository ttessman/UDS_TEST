import React from "react";
import { Box, Collapse, IconButton } from "@mui/material";
import { AideIcon } from "components/utility/AideIcon";
import { AideFieldProps } from "../aideform";

export interface AideGroupFieldProps<TFormData> extends AideFieldProps<TFormData> {
  expanded: boolean;
  hasError: boolean;
  onToggle: () => void;
  renderChildren: () => React.ReactNode;
}

export const AideGroupField = <TFormData,>({
  field,
  uniqueId,
  label,
  content,
  expanded,
  hasError,
  onToggle,
  renderChildren,
}: AideGroupFieldProps<TFormData>) => {
  const { isCollapsible, heading, headingVariant, wrapperSx, sx, testid } = field;

  return (
    <React.Fragment key={uniqueId}>
      {isCollapsible && (
        <IconButton
          onClick={onToggle}
          size="large"
          sx={{
            mr: 1,
            color: hasError ? "var(--error-color)" : "var(--text-color)",
            width: "max-content",
            height: "max-content",
            gridArea: "collapse",
          }}
        >
          <AideIcon type={expanded ? "unfold less" : "unfold more"} fontSize="medium" />
        </IconButton>
      )}

      <Box id={uniqueId} data-testid={testid || uniqueId} sx={{ width: "100%", ...wrapperSx }}>
        {(heading || label || content) && (
          <Box sx={{ display: "flex", flexDirection: "column", width: "100%" }}>
            {(heading || label) && (
              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                <Box
                  component={headingVariant || "h6"}
                  sx={{ flexGrow: 1, color: "var(--text-color)", fontWeight: 600 }}
                >
                  {heading || label}
                </Box>
              </Box>
            )}
            {content && <Box sx={{ mb: 2, color: "var(--text-color)" }}>{content}</Box>}
          </Box>
        )}

        <Collapse in={expanded} sx={{ width: "100%" }}>
          <Box sx={{ width: "100%", ...sx }}>{renderChildren()}</Box>
        </Collapse>
      </Box>
    </React.Fragment>
  );
};
