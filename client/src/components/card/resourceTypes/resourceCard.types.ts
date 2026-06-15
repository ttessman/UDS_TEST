import type { ReactNode } from "react";
import type { DefinitionField } from "../../list/resourceTypes/DefinitionList.js";
import type { MetaItemPresentation } from "../../list/items/MetaItem.js";
import type { ContextMenuAction } from "../../menu/resourceTypes/ContextMenu.js";

export type ResourceRenderArgs<T extends object, C> = {
  item: T;
  context: C;
};

export type ResourceMetaRenderArgs<T extends object, C> = ResourceRenderArgs<T, C> & {
  presentation?: MetaItemPresentation;
};

export type ResourceStatusPresentation = "header" | "icon" | "media";

export type ResourceStatusRenderArgs<T extends object, C> = ResourceRenderArgs<T, C> & {
  presentation?: ResourceStatusPresentation;
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

export enum ResourceCardVariant {
  Default = "default",
  AppLauncher = "appLauncher",
  Compact = "compact",
  MediaFocus = "mediaFocus"
}

export enum ResourceCardMediaBackground {
  Auto = "auto",
  Dark = "dark",
  Light = "light"
}

export enum ResourceCardMetaDisplay {
  IconOnly = "iconOnly",
  IconWithText = "iconWithText"
}

export type ResourceCardDefinition<T extends object, C = undefined> = {
  actions?: (args: ResourceRenderArgs<T, C>) => ReactNode;
  aspectRatio?: string;
  codeBlocks?: Array<ResourceCodeBlock<T, C>>;
  commandPreview?: (args: ResourceRenderArgs<T, C>) => string | null | undefined;
  details?: (args: ResourceRenderArgs<T, C>) => ReactNode;
  fields?: Array<DefinitionField<T>>;
  icon?: (args: ResourceRenderArgs<T, C>) => ReactNode;
  label: (args: ResourceRenderArgs<T, C>) => string;
  menuActions?: (args: ResourceRenderArgs<T, C>) => ContextMenuAction[];
  menuStatus?: (args: ResourceRenderArgs<T, C>) => ReactNode;
  meta?: (args: ResourceMetaRenderArgs<T, C>) => ReactNode;
  mediaBackground?: ResourceCardMediaBackground | ((args: ResourceRenderArgs<T, C>) => ResourceCardMediaBackground);
  mediaMetaDisplay?: ResourceCardMetaDisplay | ((args: ResourceRenderArgs<T, C>) => ResourceCardMetaDisplay);
  minHeight?: number;
  onSelect?: (args: ResourceRenderArgs<T, C>) => void;
  primaryAction?: (args: ResourceRenderArgs<T, C>) => ReactNode;
  shape?: {
    title: string;
    value: (args: ResourceRenderArgs<T, C>) => unknown;
  };
  status?: (args: ResourceStatusRenderArgs<T, C>) => ReactNode;
  statusPlacement?: "header" | "icon";
  summary?: (args: ResourceRenderArgs<T, C>) => ReactNode;
  title: (args: ResourceRenderArgs<T, C>) => ReactNode;
  type?: (args: ResourceRenderArgs<T, C>) => ReactNode;
  variant?: ResourceCardVariant | ((args: ResourceRenderArgs<T, C>) => ResourceCardVariant);
};
