import { Stack, Typography } from "@mui/material";

export function StatusTextList({ empty, items }: { empty: string; items: string[] }) {
  if (items.length === 0) {
    return (
      <Typography color="text.secondary" sx={{ fontSize: 13 }}>
        {empty}
      </Typography>
    );
  }

  return (
    <Stack component="ul" sx={{ gap: 0.5, m: 0, pl: 2 }}>
      {items.map((item) => (
        <Typography component="li" key={item} sx={{ fontSize: 13, overflowWrap: "anywhere" }}>
          {item}
        </Typography>
      ))}
    </Stack>
  );
}
