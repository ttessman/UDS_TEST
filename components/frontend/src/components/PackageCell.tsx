import type { RegistryPackage } from "@uds-poc/shared";
import { Box, Chip, Stack, Typography } from "@mui/material";
import { PackageIcon } from "./PackageIcon.js";

export function PackageCell({ pkg }: { pkg: RegistryPackage }) {
  const title = pkg.displayTitle || pkg.packageName;

  return (
    <Stack direction="row" sx={{ alignItems: "center", gap: 1.25, minWidth: 0 }}>
      <PackageIcon icon={pkg.icon} size={34} title={title} />
      <Box sx={{ minWidth: 0 }}>
        <Typography sx={{ color: "text.primary", fontSize: 14, fontWeight: 800, lineHeight: 1.2 }}>
          {title}
        </Typography>
        <Typography color="text.secondary" sx={{ fontSize: 13, lineHeight: 1.35, overflowWrap: "anywhere" }}>
          {pkg.tagline ?? pkg.description ?? "No registry description discovered."}
        </Typography>
        {pkg.categories.length > 0 ? (
          <Stack direction="row" sx={{ flexWrap: "wrap", gap: 0.5, mt: 0.75 }}>
            {pkg.categories.slice(0, 3).map((category) => (
              <Chip key={category} label={category} size="small" variant="outlined" />
            ))}
          </Stack>
        ) : null}
      </Box>
    </Stack>
  );
}
