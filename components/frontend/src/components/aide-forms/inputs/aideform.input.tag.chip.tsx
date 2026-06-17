import { Chip, Tooltip, TooltipProps } from "@mui/material";
import ConditionalWrapper from "components/utility/ConditionalWrapper";
import { AideIcon } from "components/utility/AideIcon";
import React from "react";
import { useTheme } from "themes/AIDEThemeContext";
import { Box } from "@mui/system";

export enum TagVariant {
  INPUT = "INPUT",
  AIDECARD = "AIDECARD",
}

interface TagChipProps {
  label: string;
  variant?: TagVariant;
  onClick?: (e: React.MouseEvent) => void;
  onDelete?: (e: React.MouseEvent) => void;
  tooltip?: string | React.ReactNode;
  placement?: TooltipProps["placement"];
  testId?: string;
}

const styles = {
  chip: {
    AIDECARD: (aideTheme: "light" | "dark", hasDelete: boolean) => ({
      margin: 0,
      borderWidth: "1.5px",
      color: "var(--helper-text-color)",
      maxHeight: "20px",
      borderRadius: "5px",
      fontSize: "0.625rem",
      svg: { fill: "var(--helper-text-color)" },
      ".MuiChip-label": {
        pl: "5px",
        pr: hasDelete ? 0 : "5px",
      },
      "&.MuiChip-clickable:hover": {
        backgroundColor: aideTheme === "dark" ? "var(--altButtonBackgroundHover)" : "var(--background-color)",
      },
    }),
    INPUT: (aideTheme: "light" | "dark", hasDelete: boolean) => ({
      margin: 0,
      color: "var(--text-color)",
      maxHeight: "30px",
      borderRadius: "5px",
      svg: { fill: "var(--text-color)" },
      ".MuiChip-label": {
        pl: "10px",
        pr: hasDelete ? 0 : "10px",
      },
      "&.MuiChip-clickable:hover": {
        backgroundColor: aideTheme === "dark" ? "var(--altButtonBackgroundHover)" : "var(--background-color)",
      },
    }),
  },
  deleteIcon: {
    INPUT: {
      padding: 0,
      marginLeft: "5px",
      marginRight: "10px",
      display: "flex",
      alignItems: "center",
      borderRadius: "35%",
      "&:hover": {
        backgroundColor: "var(--border-color)",
      },
    },
    AIDECARD: {
      padding: 0,
      marginLeft: "5px",
      marginRight: "10px",
      display: "flex",
      alignItems: "center",
      borderRadius: "35%",
      "&:hover": {
        backgroundColor: "var(--border-color)",
      },
    },
  },
};

export const TagChip: React.FC<TagChipProps> = ({
  label,
  variant = TagVariant.INPUT,
  onClick,
  onDelete,
  tooltip = "",
  placement = "top",
  testId,
}) => {
  const { theme: aideTheme } = useTheme();
  const isAideCard = variant === TagVariant.AIDECARD;
  const hasDelete = !!onDelete;

  return (
    <ConditionalWrapper
      useWrapper={Boolean(tooltip)}
      wrapper={({ children: wrapperChildren }: { children: React.ReactNode }) => (
        <Tooltip title={tooltip} placement={placement}>
          <div>{wrapperChildren}</div>
        </Tooltip>
      )}
    >
      <Chip
        size="small"
        variant="outlined"
        sx={isAideCard ? styles.chip.AIDECARD(aideTheme, hasDelete) : styles.chip.INPUT(aideTheme, hasDelete)}
        data-testid={testId}
        onClick={(e) => {
          e.stopPropagation();
          onClick?.(e);
        }}
        label={
          <span style={{ display: "flex", alignItems: "center" }}>
            {label}

            {hasDelete && (
              <Box
                component="span"
                role="button"
                tabIndex={0}
                aria-label={`Remove ${label}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete?.(e);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.stopPropagation();
                    onDelete?.(e as any);
                  }
                }}
                sx={{
                  cursor: "pointer",
                  ...(isAideCard ? styles.deleteIcon.AIDECARD : styles.deleteIcon.INPUT),
                }}
              >
                <AideIcon type="close" />
              </Box>
            )}
          </span>
        }
      />
    </ConditionalWrapper>
  );
};
