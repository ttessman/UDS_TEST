import type { CommandState } from "@uds-poc/shared";
import { Box, Stack, Typography } from "@mui/material";
import { Modal } from "../Modal.js";

export function CommandOutputDialog({
  log,
  modalId,
  title
}: {
  log: CommandState;
  modalId: string;
  title: string;
}) {
  return (
    <Modal
      definition={{ contentSx: { bgcolor: "var(--app-bg-default)" }, maxWidth: "md", title }}
      modalId={modalId}
    >
      <Stack sx={{ gap: 1.5 }}>
        <OutputBlock title="stdout" value={log.stdout.trim()} />
        {log.stderr ? <OutputBlock title="stderr" value={log.stderr.trim()} tone="error" /> : null}
        {!log.stdout && !log.stderr ? <Typography sx={{ color: "var(--app-text-secondary)" }}>No command output was captured.</Typography> : null}
      </Stack>
    </Modal>
  );
}

function OutputBlock({ title, value, tone = "default" }: { title: string; value: string; tone?: "default" | "error" }) {
  if (!value) {
    return null;
  }

  return (
    <Box>
      <Typography sx={{ color: "var(--app-text-primary)", fontSize: 13, fontWeight: 800, mb: 0.75 }}>{title}</Typography>
      <Box component="pre" className={tone === "error" ? "stderr" : undefined} sx={{ maxHeight: 420, m: 0, overflow: "auto" }}>
        {value}
      </Box>
    </Box>
  );
}
