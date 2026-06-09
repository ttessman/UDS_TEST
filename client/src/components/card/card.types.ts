import type { ReactNode } from "react";

export type CardDefinition = {
  minHeight?: number;
};

export type CardProps = {
  actions?: ReactNode;
  children: ReactNode;
  commandPreview?: string | null;
  definition?: CardDefinition;
};
