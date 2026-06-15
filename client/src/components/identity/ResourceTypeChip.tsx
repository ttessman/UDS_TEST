import { Box, Chip, Tooltip } from "@mui/material";
import { AppIcon, type AppIconName } from "../icon/AppIcon.js";

export type ResourceType = "app" | "core" | "package" | "unknown";

const resourceTypeLabels = {
  app: "APP",
  core: "CORE",
  package: "PACKAGE",
  unknown: "UNKNOWN"
} satisfies Record<ResourceType, string>;

const resourceTypeIcons = {
  app: "resourceApp",
  core: "resourceCore",
  package: "resourcePackage",
  unknown: "resourceUnknown"
} satisfies Record<ResourceType, AppIconName>;

const resourceTypeColors = {
  app: {
    bg: "var(--app-resource-type-app-bg)",
    border: "var(--app-resource-type-app-border)",
    main: "var(--app-resource-type-app-main)"
  },
  core: {
    bg: "var(--app-resource-type-core-bg)",
    border: "var(--app-resource-type-core-border)",
    main: "var(--app-resource-type-core-main)"
  },
  package: {
    bg: "var(--app-resource-type-package-bg)",
    border: "var(--app-resource-type-package-border)",
    main: "var(--app-resource-type-package-main)"
  },
  unknown: {
    bg: "var(--app-resource-type-unknown-bg)",
    border: "var(--app-resource-type-unknown-border)",
    main: "var(--app-resource-type-unknown-main)"
  }
} satisfies Record<ResourceType, { bg: string; border: string; main: string }>;

export function ResourceTypeChip({ type }: { type: ResourceType }) {
  const label = resourceTypeLabels[type];
  const colors = resourceTypeColors[type];

  return (
    <Tooltip title={`${label} resource`}>
      <Chip
        aria-label={`${label} resource type`}
        icon={
          <Box
            aria-hidden="true"
            component="span"
            sx={{
              color: `${colors.main} !important`,
              display: "inline-flex",
              ml: "5px !important"
            }}
          >
            <AppIcon name={resourceTypeIcons[type]} sx={{ fontSize: 15 }} />
          </Box>
        }
        label={label}
        size="small"
        sx={{
          bgcolor: colors.bg,
          borderColor: colors.border,
          color: colors.main,
          fontSize: 11,
          fontWeight: 900,
          height: 26,
          letterSpacing: 0,
          maxWidth: "100%",
          "& .MuiChip-icon": {
            mr: 0.65
          },
          "& .MuiChip-label": {
            pl: 0,
            pr: 0.85
          }
        }}
        variant="outlined"
      />
    </Tooltip>
  );
}
