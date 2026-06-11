import type { ReactNode } from "react";
import { Stack, Typography } from "@mui/material";
import { Card, cardTemplate } from "../Card.js";

export type MetricDefinition<T> = {
  label: string;
  value: (item: T) => ReactNode;
};

export type MetricCardListOptions = {
  columns?: {
    xs: string;
    md?: string;
  };
};

export function MetricCard<T>({ definition, item }: { definition: MetricDefinition<T>; item: T }) {
  return (
    <Card definition={{ minHeight: 0 }}>
      <cardTemplate.content>
        <Stack sx={{ gap: 1, p: 2 }}>
          <Typography color="text.secondary" sx={{ fontSize: 13 }}>
            {definition.label}
          </Typography>
          <Typography component="strong" sx={{ display: "block", fontSize: 20, fontWeight: 700 }}>
            {definition.value(item)}
          </Typography>
        </Stack>
      </cardTemplate.content>
    </Card>
  );
}
