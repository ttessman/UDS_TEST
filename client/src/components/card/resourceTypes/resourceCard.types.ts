import type { ReactNode } from "react";
import type { DefinitionField } from "../../list/resourceTypes/DefinitionList.js";

export type ResourceRenderArgs<T extends object, C> = {
  item: T;
  context: C;
};

export type ResourceCodeBlock<T extends object, C = undefined> = {
  content: (args: ResourceRenderArgs<T, C>) => string | null | undefined;
  language?: string;
  title: string;
};

export type ResolvedCodeBlock = {
  content: string;
  language?: string;
  title: string;
};

export type ResourceCardDefinition<T extends object, C = undefined> = {
  actions?: (args: ResourceRenderArgs<T, C>) => ReactNode;
  aspectRatio?: string;
  codeBlocks?: Array<ResourceCodeBlock<T, C>>;
  commandPreview?: (args: ResourceRenderArgs<T, C>) => string | null | undefined;
  details?: (args: ResourceRenderArgs<T, C>) => ReactNode;
  fields?: Array<DefinitionField<T>>;
  icon?: (args: ResourceRenderArgs<T, C>) => ReactNode;
  label: (args: ResourceRenderArgs<T, C>) => string;
  meta?: (args: ResourceRenderArgs<T, C>) => ReactNode;
  minHeight?: number;
  onSelect?: (args: ResourceRenderArgs<T, C>) => void;
  shape?: {
    title: string;
    value: (args: ResourceRenderArgs<T, C>) => unknown;
  };
  status?: (args: ResourceRenderArgs<T, C>) => ReactNode;
  statusPlacement?: "header" | "icon";
  summary?: (args: ResourceRenderArgs<T, C>) => ReactNode;
  title: (args: ResourceRenderArgs<T, C>) => ReactNode;
};
