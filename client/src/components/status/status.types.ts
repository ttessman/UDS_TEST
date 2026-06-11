import type { ReactNode } from "react";

export type StatusIndicatorTone = "success" | "error" | "warning" | "info" | "neutral";

export type StatusIndicatorRenderArgs<T, C> = {
  context: C;
  item: T;
};

export type StatusIndicatorDefinition<T, C = undefined> = {
  details?: (args: StatusIndicatorRenderArgs<T, C>) => ReactNode;
  key: string;
  label: string;
  state: (args: StatusIndicatorRenderArgs<T, C>) => StatusIndicatorTone;
  tooltip: (args: StatusIndicatorRenderArgs<T, C>) => ReactNode;
  value: (args: StatusIndicatorRenderArgs<T, C>) => ReactNode;
};

export type StatusIndicatorListDefinition<T, C = undefined> = {
  items: Array<StatusIndicatorDefinition<T, C>>;
  modalTitle: string;
};
