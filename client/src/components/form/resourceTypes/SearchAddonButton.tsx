import { Box, IconButton, Tooltip } from "@mui/material";
import { AppIcon, type AppIconName } from "../../icon/AppIcon.js";

export function SearchAddonButton({
  active = false,
  icon,
  label,
  onClick
}: {
  active?: boolean;
  icon: AppIconName;
  label: string;
  onClick: () => void;
}) {
  return (
    <Box sx={{ display: "inline-flex", flex: "0 0 40px", position: "relative" }}>
      <Tooltip title={label}>
        <IconButton
          aria-label={label}
          onClick={onClick}
          size="small"
          sx={{
            border: "1px solid",
            borderColor: active ? "var(--app-border-strong)" : "var(--app-border)",
            borderRadius: 1.5,
            color: active ? "var(--app-text-primary)" : "var(--app-text-secondary)",
            height: 40,
            width: 40,
            "&:hover": {
              bgcolor: "var(--app-bg-paper-hover)",
              borderColor: "var(--app-border-strong)"
            },
            "& svg": { fontSize: 20 }
          }}
        >
          <AppIcon name={icon} />
        </IconButton>
      </Tooltip>
      {active ? (
        <Box
          aria-hidden="true"
          sx={{
            bgcolor: "var(--app-text-primary)",
            border: "1px solid var(--app-bg-paper)",
            borderRadius: "999px",
            height: 8,
            position: "absolute",
            right: 6,
            top: 6,
            width: 8
          }}
        />
      ) : null}
    </Box>
  );
}
