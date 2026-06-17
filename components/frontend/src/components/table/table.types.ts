import type { Dispatch, ReactNode, SetStateAction } from "react";
import type { TableProps } from "@mui/material";
import type { SxProps, Theme } from "@mui/material/styles";
import type { FilterField } from "../filter/filter.types.js";
export type { FilterField, FilterOption } from "../filter/filter.types.js";

export class PaginationControl {
  enabled = false;
  count = 0;
  page = 0;
  perPage = 0;

  constructor(enabled = false, count = 0, page = 0, perPage = 0) {
    this.enabled = enabled;
    this.count = count;
    this.page = page;
    this.perPage = perPage;
  }
}

export type UseFiltersOptions<T> = {
  context?: Record<string, unknown>;
  fields: FilterField<T>[];
  items?: T[];
  portalAnchor?: React.RefObject<HTMLElement | null> | string | null;
  sx?: SxProps<Theme>;
};

export type TableIndexes = {
  row: number;
  column: number;
  filters?: {
    values: Record<string, unknown>;
    setValues: Dispatch<SetStateAction<Record<string, unknown>>>;
  };
};

export type ColumnRenderResult = string | number | { text: string; node: ReactNode };

export type Column<T> = {
  id: string;
  label: string;
  render: (item: T, indexes: TableIndexes) => ColumnRenderResult;
  sortValue?: (item: T) => string | number;
  hidden?: boolean | ((item: T, indexes: TableIndexes) => boolean);
  colSpan?: number | ((item: T, indexes: TableIndexes) => number);
  sx?: SxProps<Theme> | ((item: T, indexes: TableIndexes) => SxProps<Theme>);
  hasNestedTable?: (item: T, indexes: TableIndexes) => ReactNode | undefined;
  nestedTableConfig?: {
    mode?: "always" | "collapsible";
    placement?: "beforeColumn" | "afterColumn";
    anchorColumnId?: string;
    expandButtonContentFlex?: string | number;
  };
};

export type GenericTableProps<T> = {
  columns: Column<T>[];
  data: T[];
  hasSearchModal?: boolean;
  noMargin?: boolean;
  onPageChange?: (page: number) => void;
  onRowsPerPageChange?: (perPage: number) => void;
  onRowClick?: (item: T) => void;
  pagination?: PaginationControl;
  rowKey?: (item: T, index: number) => string | number;
  size?: TableProps["size"];
  sx?: SxProps<Theme>;
  tableLayout?: "auto" | "fixed";
  testId: string;
  useContextMenu?: boolean;
  useFiltersConfig?: UseFiltersOptions<T>;
};
