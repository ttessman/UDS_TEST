import type { ReactNode } from "react";
import { Box, Typography } from "@mui/material";
import { List } from "../List.js";
import type { ListDefinition } from "../list.types.js";

export type DefinitionField<T> = {
  key: keyof T | string;
  label: string;
  value: (item: T) => ReactNode;
};

export type DefinitionListDefinition<T> = {
  emptyValue?: ReactNode;
  fields: Array<DefinitionField<T>>;
};

export function DefinitionList<T extends object>({
  definition,
  item
}: {
  definition: DefinitionListDefinition<T>;
  item: T;
}) {
  const listDefinition = {
    getKey: (field) => String(field.key),
    layout: { gap: 1 },
    renderItem: ({ item: field, context }) => (
      <DefinitionRow label={field.label} value={field.value(context) ?? definition.emptyValue ?? "unknown"} />
    )
  } satisfies ListDefinition<DefinitionField<T>, T>;

  return <List items={definition.fields} definition={listDefinition} context={item} />;
}

function DefinitionRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <Box sx={{ display: "grid", gap: 0.5, gridTemplateColumns: { xs: "1fr", sm: "150px minmax(0, 1fr)" } }}>
      <Typography color="text.secondary" component="dt">
        {label}
      </Typography>
      <Typography component="dd" sx={{ m: 0, overflowWrap: "anywhere" }}>
        {value}
      </Typography>
    </Box>
  );
}
