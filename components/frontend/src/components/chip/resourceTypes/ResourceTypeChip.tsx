import { Box, Chip, Tooltip } from "@mui/material";
import { AppIcon, type AppIconName } from "../../icon/AppIcon.js";

export type ResourceTypeDefinition = {
  icon: AppIconName;
  label: string;
  token: string;
};

export const resourceTypeFieldDefinition = {
  allLabel: "All Types",
  label: "Type"
} as const;

export const resourceTypeDefinitions = {
  app: {
    icon: "resourceApp",
    label: "APP",
    token: "app"
  },
  core: {
    icon: "resourceCore",
    label: "CORE",
    token: "core"
  },
  package: {
    icon: "resourcePackage",
    label: "PACKAGE",
    token: "package"
  },
  unknown: {
    icon: "resourceUnknown",
    label: "UNKNOWN",
    token: "unknown"
  }
} satisfies Record<string, ResourceTypeDefinition>;

export type ResourceType = keyof typeof resourceTypeDefinitions;

export const resourceTypeOptions = Object.entries(resourceTypeDefinitions).map(([value, definition]) => ({
  label: definition.label,
  value
}));

export function ResourceTypeChip({ type }: { type: ResourceType }) {
  const definition = resourceTypeDefinitions[type];
  const colorToken = `--app-resource-type-${definition.token}`;

  return (
    <Tooltip title={`${definition.label} resource`}>
      <Chip
        aria-label={`${definition.label} resource type`}
        icon={
          <Box
            aria-hidden="true"
            component="span"
            sx={{
              color: `var(${colorToken}-main) !important`,
              display: "inline-flex",
              ml: "5px !important"
            }}
          >
            <AppIcon name={definition.icon} sx={{ fontSize: 15 }} />
          </Box>
        }
        label={definition.label}
        size="small"
        sx={{
          bgcolor: `var(${colorToken}-bg)`,
          borderColor: `var(${colorToken}-border)`,
          color: `var(${colorToken}-main)`,
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
