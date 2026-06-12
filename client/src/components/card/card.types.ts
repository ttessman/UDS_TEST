import type { KeyboardEvent, MouseEvent } from "react";
import type { Slot, SlotChildren } from "@beqa/react-slots";
import type { SystemStyleObject, Theme } from "@mui/system";

export type CardDefinition = {
  aspectRatio?: string;
  minHeight?: number;
};

export type CardContentDefinition = {
  spacing?: "default" | "resource";
  sx?: SystemStyleObject<Theme>;
};

export type CardChildren = SlotChildren<Slot<"actions"> | Slot<"content"> | Slot<"footer"> | Slot<"header"> | Slot<"media">>;

export type CardProps = {
  children: CardChildren;
  content?: CardContentDefinition;
  definition?: CardDefinition;
  onClick?: (event: MouseEvent<HTMLElement>) => void;
  onKeyDown?: (event: KeyboardEvent<HTMLElement>) => void;
};
