import { Box } from "@mui/material";
import { AideFieldProps } from "../aideform";

export const AideHeadingField = <TFormData,>({ field, content, uniqueId }: AideFieldProps<TFormData>) => {
  const displayContent = content;
  if (!displayContent) return null;

  return (
    <Box
      key={uniqueId}
      id={uniqueId}
      data-testid={field.testid || uniqueId}
      component={field.headingVariant || "h6"}
      sx={field.sx}
    >
      {displayContent}
    </Box>
  );
};
