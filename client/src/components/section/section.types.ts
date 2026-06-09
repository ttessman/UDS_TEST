import type { ReactNode } from "react";

export type SectionDefinition<T> = {
  count?: (items: T[]) => number;
  subtitle?: (items: T[]) => ReactNode;
  title: string;
};
