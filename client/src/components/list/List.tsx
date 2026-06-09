import { Box, CircularProgress, Stack, Typography } from "@mui/material";
import type { ListDefinition, ListState } from "./list.types.js";

export function List<T, C = undefined>({
  context,
  definition,
  items,
  state = "ready"
}: {
  context: C;
  definition: ListDefinition<T, C>;
  items: T[];
  state?: ListState;
}) {
  const showLoading = state === "loading" && items.length === 0;
  const columns = definition.layout?.gridTemplateColumns;

  return (
    <Box
      sx={{
        display: "grid",
        gap: definition.layout?.gap ?? (columns?.lg || columns?.md ? 3 : 1.5),
        gridTemplateColumns: columns ?? { xs: "1fr" }
      }}
    >
      {showLoading ? (
        <Stack className="empty" direction="row" role="status" sx={{ alignItems: "center", gap: 1.5 }}>
          <CircularProgress size={18} />
          <Typography>{definition.loadingMessage ?? "Loading..."}</Typography>
        </Stack>
      ) : items.length === 0 && definition.emptyMessage ? (
        <Typography className="empty">{definition.emptyMessage}</Typography>
      ) : (
        items.map((item, index) => (
          <Box key={definition.getKey(item, index)}>{definition.renderItem({ context, index, item })}</Box>
        ))
      )}
    </Box>
  );
}
