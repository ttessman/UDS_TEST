import type { Slot, SlotChildren } from "@beqa/react-slots";

export type SectionChildren = SlotChildren<
  Slot<"header"> | Slot<"title"> | Slot<"subtitle"> | Slot<"actions"> | Slot<"content">
>;
