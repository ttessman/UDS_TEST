import { createTemplate, useSlot } from "@beqa/react-slots";
import { Box, CircularProgress, Stack, Typography } from "@mui/material";
import type { SxProps, Theme } from "@mui/material/styles";
import type { ListChildren, ListLayout, ListRenderState } from "./list.types.js";

export function List({
  children,
  layout,
  state = {},
  sx
}: {
  children: ListChildren;
  layout?: ListLayout;
  state?: ListRenderState;
  sx?: SxProps<Theme>;
}) {
  const { hasSlot, slot } = useSlot(children);
  const showLoading = state.status === "loading" && state.isEmpty;
  const showEmpty = state.isEmpty && !showLoading;
  const columns = layout?.gridTemplateColumns;

  return (
    <Box
      sx={{
        alignItems: layout?.alignItems,
        display: "grid",
        gap: layout?.gap ?? (columns?.lg || columns?.md ? 3 : 1.5),
        gridAutoRows: "1fr",
        gridTemplateColumns: columns ?? { xs: "1fr" },
        justifyContent: layout?.justifyContent,
        justifyItems: layout?.justifyItems,
        ...sx
      }}
    >
      {showLoading ? (
        <Stack className="empty" direction="row" role="status" sx={{ alignItems: "center", gap: 1.5, gridColumn: "1 / -1", width: "100%" }}>
          <CircularProgress size={18} />
          {hasSlot.loading ? <slot.loading /> : <Typography>{state.loadingMessage ?? "Loading..."}</Typography>}
        </Stack>
      ) : showEmpty && (hasSlot.empty || state.emptyMessage) ? (
        <Typography className="empty" sx={{ gridColumn: "1 / -1", width: "100%" }}>
          {hasSlot.empty ? <slot.empty /> : state.emptyMessage}
        </Typography>
      ) : (
        <slot.content />
      )}
    </Box>
  );
}

export const listTemplate = createTemplate<ListChildren>();
