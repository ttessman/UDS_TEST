import React from "react";
import { Box } from "@mui/material";
import { AideFieldProps } from "../aideform";

export const AideContentField = <TFormData,>({
  field,
  content,
  showError,
  error,
  uniqueId,
}: AideFieldProps<TFormData>) => {
  const displayContent = content ?? "NO VALUE FOR CONTENT";

  return (
    <Box
      key={uniqueId}
      id={uniqueId}
      data-testid={field.testid || uniqueId}
      sx={{ color: "var(--text-color)", ...field.sx }}
      component={field.component || "div"}
    >
      {displayContent}

      {showError && (
        <Box color="var(--error-color)" fontSize="0.75rem">
          {error}
        </Box>
      )}
    </Box>
  );
};
