import type { ReactNode } from "react";

export type ListState = "idle" | "loading" | "ready";

export type ListLayout = {
  gap?: number;
  gridTemplateColumns?: {
    xs: string;
    md?: string;
    lg?: string;
  };
};

export type ListRenderArgs<T, C> = {
  context: C;
  index: number;
  item: T;
};

export type ListDefinition<T, C = undefined> = {
  emptyMessage?: string;
  getKey: (item: T, index: number) => string;
  layout?: ListLayout;
  loadingMessage?: string;
  renderItem: (args: ListRenderArgs<T, C>) => ReactNode;
};
