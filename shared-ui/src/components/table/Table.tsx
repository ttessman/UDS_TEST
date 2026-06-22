import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import {
  Box,
  IconButton,
  Paper,
  Table as MuiTable,
  TableBody,
  TableCell,
  TableContainer,
  TableFooter,
  TableHead,
  TablePagination,
  TableRow,
  Typography
} from "@mui/material";
import type { SxProps, Theme } from "@mui/material/styles";
import { AppIcon } from "../icon/AppIcon.js";
import type { Column, ColumnRenderResult, FilterField, GenericTableProps, TableIndexes } from "./table.types.js";

export type { Column, ColumnRenderResult, FilterField, GenericTableProps, PaginationControl, TableIndexes, UseFiltersOptions } from "./table.types.js";

export function GenericTable<T extends object>({
  columns,
  data,
  noMargin = false,
  onPageChange,
  onRowClick,
  onRowsPerPageChange,
  pagination,
  rowKey,
  size = "medium",
  sx,
  tableLayout,
  testId,
  useFiltersConfig,
  useContextMenu = true
}: GenericTableProps<T>) {
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [requestedPage, setRequestedPage] = useState(pagination?.page ?? 0);
  const [rowsPerPage, setRowsPerPage] = useState(pagination?.perPage || 10);
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});
  const [filterValues, setFilterValues] = useState<Record<string, unknown>>({});
  const filterContext = useMemo(() => ({ values: filterValues, setValues: setFilterValues }), [filterValues]);
  const visibleHeaderColumns = columns.filter((column) => column.hidden !== true);
  const hasAnyNestedColumns = useMemo(() => columns.some((column) => typeof column.hasNestedTable === "function"), [columns]);

  useEffect(() => {
    if (pagination) {
      setRequestedPage(pagination.page);
      setRowsPerPage(pagination.perPage || 10);
    }
  }, [pagination]);

  const filteredItems = useMemo(() => {
    if (!useFiltersConfig?.fields.length) {
      return data;
    }

    return data.filter((item) => useFiltersConfig.fields.every((field) => applyFilterField(field, item, filterValues)));
  }, [data, filterValues, useFiltersConfig?.fields]);

  const sortedItems = useMemo(() => {
    if (!sortColumn) {
      return filteredItems;
    }

    const column = columns.find((candidate) => candidate.id === sortColumn);

    if (!column?.sortValue) {
      return filteredItems;
    }

    return [...filteredItems].sort((a, b) => {
      const aValue = column.sortValue?.(a) ?? "";
      const bValue = column.sortValue?.(b) ?? "";

      if (aValue < bValue) {
        return sortDirection === "asc" ? -1 : 1;
      }

      if (aValue > bValue) {
        return sortDirection === "asc" ? 1 : -1;
      }

      return 0;
    });
  }, [columns, filteredItems, sortColumn, sortDirection]);

  const maxPage = Math.max(0, Math.floor((sortedItems.length - 1) / rowsPerPage));
  const safePage = Math.min(requestedPage, maxPage);
  const visibleItems = useMemo(() => {
    if (!pagination?.enabled) {
      return sortedItems;
    }

    const start = safePage * rowsPerPage;

    return sortedItems.slice(start, start + rowsPerPage);
  }, [pagination?.enabled, rowsPerPage, safePage, sortedItems]);

  const handleSortClick = useCallback(
    (columnId: string) => {
      const sameColumn = sortColumn === columnId;

      setSortColumn(columnId);
      setSortDirection(sameColumn && sortDirection === "asc" ? "desc" : "asc");
    },
    [sortColumn, sortDirection]
  );

  const toggleExpandedRow = useCallback((key: string) => {
    setExpandedRows((existing) => ({ ...existing, [key]: !existing[key] }));
  }, []);

  return (
    <Box
      data-testid={testId}
      sx={{
        borderRadius: 1,
        boxSizing: "border-box",
        mb: noMargin ? 0 : 3,
        minWidth: 0,
        position: "relative",
        ...sx
      }}
    >
      <TableContainer
        component={Paper}
        variant="outlined"
        sx={{
          bgcolor: "background.paper",
          borderColor: "divider",
          borderRadius: 1.5,
          overflow: "auto"
        }}
      >
        <MuiTable
          data-testid={`${testId}--table`}
          size={size}
          sx={{
            minWidth: 720,
            tableLayout: tableLayout ?? (hasAnyNestedColumns ? "fixed" : "auto"),
            width: "100%"
          }}
        >
          <TableHead>
            <TableRow data-testid={`${testId}--header-row`}>
              {visibleHeaderColumns.map((column, columnIndex) => (
                <TableCell
                  key={column.id}
                  data-testid={`${testId}--header-cell-${safeTestIdPart(column.id)}`}
                  sx={{
                    color: "text.primary",
                    fontSize: 12,
                    fontWeight: 800,
                    letterSpacing: 0,
                    textTransform: "uppercase",
                    ...resolveColumnSx(column, null as unknown as T, { row: -1, column: columnIndex, filters: filterContext })
                  }}
                >
                  <Box sx={{ alignItems: "center", display: "inline-flex", gap: 0.5, minWidth: 0 }}>
                    {column.label}
                    {column.sortValue ? (
                      <IconButton
                        aria-label={`Sort by ${column.label}`}
                        onClick={() => handleSortClick(column.id)}
                        size="small"
                        sx={{ color: "text.secondary", p: 0.25 }}
                      >
                        <AppIcon
                          name="expand"
                          sx={{
                            fontSize: 16,
                            transform: sortColumn === column.id && sortDirection === "desc" ? "rotate(180deg)" : undefined
                          }}
                        />
                      </IconButton>
                    ) : null}
                  </Box>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody data-testid={`${testId}--table-body`}>
            {visibleItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={Math.max(visibleHeaderColumns.length, 1)}>
                  <Typography color="text.secondary">No rows found.</Typography>
                </TableCell>
              </TableRow>
            ) : (
              visibleItems.map((item, rowIndex) => {
                const baseKeyRaw = rowKey ? String(rowKey(item, rowIndex)) : String(rowIndex);
                const baseKey = safeTestIdPart(baseKeyRaw);
                const visibleColumnsForRow = getVisibleColumnsForRow(item, rowIndex, columns, filterContext);
                const nestedColumn = getNestedColumnForRow(item, rowIndex, columns, filterContext);
                const nestedMode = nestedColumn?.nestedTableConfig?.mode ?? "always";
                const placement = nestedColumn?.nestedTableConfig?.placement ?? "afterColumn";
                const anchorColumnId = nestedColumn?.nestedTableConfig?.anchorColumnId ?? visibleColumnsForRow[visibleColumnsForRow.length - 1]?.id;
                const collapsible = nestedMode === "collapsible";
                const expanded = collapsible ? Boolean(expandedRows[baseKeyRaw]) : true;
                const nestedContent = expanded ? nestedColumn?.hasNestedTable?.(item, { row: rowIndex, column: 0, filters: filterContext }) : null;
                const expandButton = collapsible ? (
                  <IconButton
                    aria-label={expanded ? "Collapse row" : "Expand row"}
                    onClick={(event) => {
                      event.stopPropagation();
                      toggleExpandedRow(baseKeyRaw);
                    }}
                    size="small"
                    sx={{ color: "text.secondary", flexShrink: 0, p: 0.25 }}
                  >
                    <AppIcon name="expand" sx={{ fontSize: 18, transform: expanded ? "rotate(180deg)" : undefined }} />
                  </IconButton>
                ) : null;

                const row = (
                  <TableRow
                    data-testid={`${testId}--table-row-${baseKey}`}
                    hover={Boolean(onRowClick)}
                    key={baseKeyRaw}
                    onClick={onRowClick ? () => onRowClick(item) : undefined}
                    sx={{
                      cursor: onRowClick ? "pointer" : "default",
                      "&:last-child td": { borderBottom: nestedContent ? undefined : 0 }
                    }}
                  >
                    {columns.map((column, columnIndex) => {
                      const indexes = { row: rowIndex, column: columnIndex, filters: filterContext };
                      const hidden = typeof column.hidden === "function" ? column.hidden(item, indexes) : column.hidden;

                      if (hidden) {
                        return null;
                      }

                      const cellContent = resolveColumnRenderResult(column.render(item, indexes));
                      const showExpandButton = Boolean(expandButton && column.id === anchorColumnId);

                      return (
                        <TableCell
                          colSpan={typeof column.colSpan === "function" ? column.colSpan(item, indexes) : column.colSpan}
                          data-testid={`${testId}--table-row-${baseKey}--cell-${safeTestIdPart(column.id)}`}
                          key={column.id}
                          onContextMenu={(event) => {
                            if (useContextMenu) {
                              event.preventDefault();
                            }
                          }}
                          sx={{
                            color: "text.secondary",
                            verticalAlign: "middle",
                            ...resolveColumnSx(column, item, indexes)
                          }}
                        >
                          {showExpandButton ? (
                            <Box sx={{ alignItems: "flex-start", display: "flex", gap: 0.75, minWidth: 0, width: "100%" }}>
                              {placement === "beforeColumn" ? expandButton : null}
                              <Box sx={{ flex: nestedColumn?.nestedTableConfig?.expandButtonContentFlex ?? 1, minWidth: 0 }}>{cellContent}</Box>
                              {placement === "afterColumn" ? expandButton : null}
                            </Box>
                          ) : (
                            cellContent
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );

                if (!nestedContent) {
                  return row;
                }

                return (
                  <Fragment key={`fragment-${baseKeyRaw}`}>
                    {row}
                    <TableRow data-testid={`${testId}--table-row-${baseKey}--nested-row`}>
                      <TableCell colSpan={visibleColumnsForRow.length} data-testid={`${testId}--table-row-${baseKey}--nested-cell`} sx={{ p: 0 }}>
                        <Box sx={{ minWidth: 0, overflow: "hidden", width: "100%" }}>{nestedContent}</Box>
                      </TableCell>
                    </TableRow>
                  </Fragment>
                );
              })
            )}
          </TableBody>
          {pagination?.enabled ? (
            <TableFooter>
              <TableRow>
                <TablePagination
                  count={pagination.count}
                  onPageChange={(_, newPage) => {
                    setRequestedPage(newPage);
                    onPageChange?.(newPage);
                  }}
                  onRowsPerPageChange={(event) => {
                    const nextRowsPerPage = Number.parseInt(event.target.value, 10);
                    setRowsPerPage(nextRowsPerPage);
                    setRequestedPage(0);
                    onRowsPerPageChange?.(nextRowsPerPage);
                  }}
                  page={safePage}
                  rowsPerPage={rowsPerPage}
                  rowsPerPageOptions={[5, 10, 25, 50]}
                />
              </TableRow>
            </TableFooter>
          ) : null}
        </MuiTable>
      </TableContainer>
    </Box>
  );
}

function getVisibleColumnsForRow<T>(
  item: T,
  rowIndex: number,
  columns: Column<T>[],
  filterContext: TableIndexes["filters"]
) {
  return columns.filter((column, columnIndex) => {
    const indexes = { row: rowIndex, column: columnIndex, filters: filterContext };
    const hidden = typeof column.hidden === "function" ? column.hidden(item, indexes) : column.hidden;

    return !hidden;
  });
}

function getNestedColumnForRow<T>(
  item: T,
  rowIndex: number,
  columns: Column<T>[],
  filterContext: TableIndexes["filters"]
) {
  return columns.find((column, columnIndex) =>
    Boolean(column.hasNestedTable?.(item, { row: rowIndex, column: columnIndex, filters: filterContext }))
  );
}

function resolveColumnSx<T>(column: Column<T>, item: T, indexes: TableIndexes): SxProps<Theme> {
  if (typeof column.sx === "function") {
    return (column.sx as (item: T, indexes: TableIndexes) => SxProps<Theme>)(item, indexes) ?? {};
  }

  return column.sx ?? {};
}

function resolveColumnRenderResult(result: ColumnRenderResult) {
  if (typeof result === "object" && result !== null) {
    return result.node;
  }

  return String(result);
}

function applyFilterField<T>(field: FilterField<T>, item: T, values: Record<string, unknown>): boolean {
  if (field.children?.length) {
    return field.children.every((child) => applyFilterField(child, item, values));
  }

  return field.apply(item, values[field.name]);
}

function safeTestIdPart(value: string) {
  return value.replace(/\s+/g, "_").replace(/[^a-zA-Z0-9._:-]/g, "_");
}
