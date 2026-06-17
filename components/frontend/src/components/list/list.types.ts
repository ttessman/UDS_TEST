import type { ReactNode } from "react";
import type { Slot, SlotChildren } from "@beqa/react-slots";

export type ListState = "idle" | "loading" | "ready";

export type ListRenderState = {
  emptyMessage?: ReactNode;
  isEmpty?: boolean;
  loadingMessage?: ReactNode;
  status?: ListState;
};

export type ListLayout = {
  alignItems?: "start" | "center" | "end" | "stretch";
  gap?: number;
  gridTemplateColumns?: {
    xs: string;
    sm?: string;
    md?: string;
    lg?: string;
    xl?: string;
  };
  justifyContent?: "start" | "center" | "end" | "stretch";
  itemMaxWidth?: number | string;
  justifyItems?: "start" | "center" | "end" | "stretch";
};

export type ListChildren = SlotChildren<Slot<"content"> | Slot<"empty"> | Slot<"loading">>;
