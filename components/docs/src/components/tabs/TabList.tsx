import { Box } from "@mui/material";
import type { SxProps, Theme } from "@mui/material/styles";

export type TabListItem = {
  label: string;
  value?: string;
};

export type TabListProps = {
  activeValue?: string;
  items: TabListItem[];
  sx?: SxProps<Theme>;
  tabSx?: SxProps<Theme>;
};

export function TabList({ activeValue, items, sx, tabSx }: TabListProps) {
  const selectedValue = activeValue ?? items[0]?.value ?? items[0]?.label;

  return (
    <Box
      aria-label="Resource filters"
      role="tablist"
      sx={{
        display: "flex",
        flexWrap: "wrap",
        gap: 1,
        ...sx
      }}
    >
      {items.map((item) => {
        const value = item.value ?? item.label;
        const selected = value === selectedValue;

        return (
          <Box
            aria-selected={selected}
            component="span"
            key={value}
            role="tab"
            sx={{
              background: selected ? "#2563eb" : "rgba(255, 255, 255, 0.08)",
              borderRadius: 999,
              color: selected ? "#ffffff" : "#dae5f8",
              fontSize: 12,
              fontWeight: 750,
              px: 1.5,
              py: 0.875,
              ...tabSx
            }}
          >
            {item.label}
          </Box>
        );
      })}
    </Box>
  );
}
