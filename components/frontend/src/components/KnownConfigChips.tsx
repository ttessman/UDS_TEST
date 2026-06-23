import type { RegistryPackage } from "@uds-poc/shared";
import { Chip, Stack, Typography } from "@mui/material";

export function KnownConfigChips({ pkg }: { pkg: RegistryPackage }) {
  return (
    <Stack direction="row" sx={{ alignItems: "center", flexWrap: "wrap", gap: 1 }}>
      <Typography component="strong" sx={{ color: "var(--app-text-primary)", fontWeight: 700 }}>
        Known config
      </Typography>
      {pkg.variables.map((variable) => (
        <Chip key={variable.name} label={variable.name} size="small" variant="outlined" />
      ))}
    </Stack>
  );
}
