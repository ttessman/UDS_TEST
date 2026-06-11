import type { ReactNode } from "react";
import type { Slot, SlotChildren } from "@beqa/react-slots";

export type CardDefinition = {
  aspectRatio?: string;
  minHeight?: number;
};

export type CardChildren = SlotChildren<Slot<"content"> | Slot<"actions"> | Slot<"command">>;

export type CardProps = {
  children: CardChildren;
  definition?: CardDefinition;
};
