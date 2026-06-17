import { Chip } from "@mui/material";
import { getStatusColors } from "./status.utils.js";
import type { StatusIndicatorTone } from "./status.types.js";

export function StateChip({
  label,
  state,
  variant = "filled"
}: {
  label: string;
  state: StatusIndicatorTone;
  variant?: "filled" | "outline" | "plain";
}) {
  const colors = getStatusColors(state);
  const outlined = variant === "outline";
  const plain = variant === "plain";

  return (
    <Chip
      label={label}
      size="small"
      sx={{
        alignSelf: "flex-start",
        bgcolor: outlined || plain ? "transparent" : colors.main,
        border: plain ? 0 : "1px solid",
        borderColor: colors.main,
        color: outlined || plain ? colors.main : "var(--app-bg-default)",
        fontWeight: 800,
        justifyContent: "flex-start",
        px: plain ? 0 : undefined,
        textTransform: "capitalize",
        "& .MuiChip-label": {
          px: plain ? 0 : undefined
        }
      }}
      variant={outlined ? "outlined" : "filled"}
    />
  );
}
