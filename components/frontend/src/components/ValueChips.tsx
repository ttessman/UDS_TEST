import { Chip, Stack } from "@mui/material";

export function ValueChips({ values }: { values: Array<string | number | null | undefined> }) {
  const uniqueValues = [...new Set(values.filter((value): value is string | number => Boolean(value)))];

  if (uniqueValues.length === 0) {
    return null;
  }

  return (
    <Stack direction="row" sx={{ alignItems: "center", flexWrap: "wrap", gap: 0.5 }}>
      {uniqueValues.map((value) => (
        <Chip key={value} label={String(value)} size="small" variant="outlined" />
      ))}
    </Stack>
  );
}
