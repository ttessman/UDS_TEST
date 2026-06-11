import { Box, Stack, Typography } from "@mui/material";
import { getStatusColors, statusIcon } from "../../status/status.utils.js";
import type { StatusIndicatorListDefinition, StatusIndicatorRenderArgs } from "../../status/status.types.js";
import { Modal } from "../Modal.js";

export function StatusDetailsDialog<T, C>({
  args,
  definition,
  modalId
}: {
  args: StatusIndicatorRenderArgs<T, C>;
  definition: StatusIndicatorListDefinition<T, C>;
  modalId: string;
}) {
  return (
    <Modal
      definition={{ contentSx: { bgcolor: "var(--app-bg-default)" }, maxWidth: "sm", title: definition.modalTitle }}
      modalId={modalId}
    >
      <Stack sx={{ gap: 1.25 }}>
        {definition.items.map((status) => {
          const state = status.state(args);
          const colors = getStatusColors(state);

          return (
            <Box
              key={status.key}
              sx={{
                bgcolor: colors.bg,
                border: "1px solid",
                borderColor: colors.border,
                borderRadius: 1,
                p: 1.25
              }}
            >
              <Stack direction="row" sx={{ alignItems: "center", gap: 1 }}>
                <Box sx={{ color: colors.main, display: "flex" }}>{statusIcon(state, "small")}</Box>
                <Typography sx={{ fontSize: 14, fontWeight: 800 }}>{status.label}</Typography>
                <Typography sx={{ color: colors.text, fontSize: 13, fontWeight: 700, ml: "auto" }}>
                  {status.value(args)}
                </Typography>
              </Stack>
              <Box sx={{ color: "var(--app-text-secondary)", fontSize: 13, mt: 1 }}>{status.details?.(args) ?? status.tooltip(args)}</Box>
            </Box>
          );
        })}
      </Stack>
    </Modal>
  );
}
