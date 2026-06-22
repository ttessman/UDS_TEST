import type { ElementType, ReactNode } from "react";
import { createTemplate, useSlot } from "@beqa/react-slots";
import type { Slot, SlotChildren } from "@beqa/react-slots";
import { Box } from "@mui/material";
import type { SxProps, Theme } from "@mui/material/styles";

type SectionSlotChildren = SlotChildren<Slot<"header"> | Slot<"content">>;

export const sectionTemplate = createTemplate<SectionSlotChildren>();

export type SectionData<T> = {
  items: T[];
};

export type SectionContext<T> = {
  headerSx?: SxProps<Theme>;
  itemComponent?: ElementType;
  itemSx?: SxProps<Theme> | ((item: T, index: number) => SxProps<Theme> | undefined);
  listSx?: SxProps<Theme>;
  sx?: SxProps<Theme>;
  variant?: string;
};

export type SectionProps<T> = {
  children?: ReactNode;
  context?: SectionContext<T>;
  data?: SectionData<T>;
  getKey?: (item: T, index: number) => string | number;
  renderConnector?: (item: T, index: number) => ReactNode;
  renderItem?: (item: T, index: number) => ReactNode;
};

export function Section<T>({
  children,
  context = {},
  data,
  getKey,
  renderConnector,
  renderItem
}: SectionProps<T>) {
  const { hasSlot, slot } = useSlot(children as SectionSlotChildren);
  const itemComponent = context.itemComponent ?? "article";
  const sectionContent = hasSlot.content ? (
    <slot.content />
  ) : (
    <>
      {data?.items.map((item, index) => (
        <Box
          component={itemComponent}
          data-section-item
          key={getKey?.(item, index) ?? getDefaultKey(item, index)}
          sx={resolveValue(context.itemSx, item, index)}
        >
          {renderItem?.(item, index)}
          {index < data.items.length - 1 ? renderConnector?.(item, index) : null}
        </Box>
      ))}
    </>
  );

  return (
    <Box component="section" data-section-variant={context.variant} sx={[{ mt: 0 }, ...(Array.isArray(context.sx) ? context.sx : [context.sx])]}>
      {hasSlot.header ? <Box sx={context.headerSx}><slot.header /></Box> : null}
      <Box sx={context.listSx}>
        {sectionContent}
      </Box>
    </Box>
  );
}

function resolveValue<T, V>(value: V | ((item: T, index: number) => V), item: T, index: number): V | undefined {
  if (typeof value === "function") {
    return (value as (item: T, index: number) => V)(item, index);
  }

  return value;
}

function getDefaultKey(item: unknown, index: number) {
  if (item && typeof item === "object") {
    if ("id" in item && typeof item.id === "string") {
      return item.id;
    }

    if ("title" in item && typeof item.title === "string") {
      return item.title;
    }

    if ("name" in item && typeof item.name === "string") {
      return item.name;
    }
  }

  return index;
}
