import type { ReactNode } from "react";
import { Card, CardContent, Typography } from "@mui/material";
import { List } from "../List.js";
import type { ListDefinition } from "../list.types.js";

export type MetricDefinition<T> = {
  label: string;
  value: (item: T) => ReactNode;
};

export type MetricTileListDefinition<T> = {
  columns?: {
    xs: string;
    md?: string;
  };
  metrics: Array<MetricDefinition<T>>;
};

export function MetricTileList<T>({ definition, item }: { definition: MetricTileListDefinition<T>; item: T }) {
  const listDefinition = {
    getKey: (metric) => metric.label,
    layout: {
      gap: 1.5,
      gridTemplateColumns: definition.columns ?? { xs: "1fr 1fr", md: "repeat(4, 1fr)" }
    },
    renderItem: ({ item: metric, context }) => <MetricTile label={metric.label} value={metric.value(context)} />
  } satisfies ListDefinition<MetricDefinition<T>, T>;

  return <List items={definition.metrics} definition={listDefinition} context={item} />;
}

function MetricTile({ label, value }: { label: string; value: ReactNode }) {
  return (
    <Card variant="outlined">
      <CardContent>
        <Typography color="text.secondary" sx={{ fontSize: 13 }}>
          {label}
        </Typography>
        <Typography component="strong" sx={{ display: "block", fontSize: 20, fontWeight: 700, mt: 1 }}>
          {value}
        </Typography>
      </CardContent>
    </Card>
  );
}
