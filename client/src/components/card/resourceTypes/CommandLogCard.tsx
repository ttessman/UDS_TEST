import { useId, useMemo } from "react";
import type { CommandState } from "@uds-poc/shared";
import { Box, Stack, Typography } from "@mui/material";
import { IconActionButton } from "../../button/resourceTypes/IconActionButton.js";
import { useModalSync } from "../../../store/modal.store.js";
import { StatusIndicatorButton } from "../../button/resourceTypes/StatusIndicatorButton.js";
import { CommandOutputDialog } from "../../modal/resourceTypes/CommandOutputDialog.js";
import { DefinitionItem } from "../../list/items/DefinitionItem.js";
import { List, listTemplate } from "../../list/List.js";
import type { CommandLogListDefinition } from "../../list/resourceTypes/commandLog.types.js";

export function CommandLogCard({ definition, log }: { definition: CommandLogListDefinition; log: CommandState }) {
  const outputModalId = useId();
  const outputModal = useModalSync(outputModalId);
  const summary = useMemo(() => definition.summarize(log), [definition, log]);
  const hasOutput = Boolean(log.stdout || log.stderr);
  const commandFields = useMemo(
    () =>
      summary.fields.map(([label, value]) => (
        <DefinitionItem key={label} density="compact" label={label} value={value} />
      )),
    [summary.fields]
  );
  const commandMessage = useMemo(() => {
    if (!summary.message) {
      return null;
    }

    return (
      <Box
        component="code"
        sx={{
          bgcolor: summary.tone === "error" ? "var(--app-error-bg)" : "var(--app-code-bg)",
          borderColor: summary.tone === "error" ? "var(--app-error-border)" : "var(--app-code-border)",
          color: summary.tone === "error" ? "var(--app-error-text)" : "var(--app-code-text)",
          display: "block",
          fontSize: 11.5,
          lineHeight: 1.45,
          maxHeight: 92,
          overflow: "auto",
          pb: 1.25,
          pt: 0.9,
          px: 0.9,
          whiteSpace: "pre-wrap"
        }}
      >
        {summary.message}
      </Box>
    );
  }, [summary.message, summary.tone]);

  return (
    <>
      <Box
        sx={{
          bgcolor: "background.paper",
          border: "1px solid",
          borderColor: summary.tone === "error" ? "error.main" : "divider",
          borderRadius: 1,
          display: "flex",
          flexDirection: "column",
          gap: 1,
          height: "100%",
          minHeight: 132,
          p: 1.25,
          position: "relative"
        }}
      >
        {hasOutput ? (
          <Box sx={{ position: "absolute", right: 8, top: 8 }}>
            <IconActionButton icon="terminal" label="View raw command output" onClick={outputModal.openModal} />
          </Box>
        ) : null}

        <Stack direction="row" sx={{ alignItems: "center", gap: 1, minWidth: 0, pr: hasOutput ? 4 : 0 }}>
          <Box sx={{ pt: 0.1 }}>
            <StatusIndicatorButton
              iconOnly
              label={summary.tone === "error" ? `${summary.title}: needs attention` : `${summary.title}: completed`}
              state={summary.tone}
              tooltip={summary.tone === "error" ? "Needs attention" : "Command completed"}
            />
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ color: "var(--app-text-primary)", fontSize: 13, fontWeight: 800, overflowWrap: "anywhere" }}>
              {summary.title}
            </Typography>
          </Box>
        </Stack>

        <Typography sx={{ color: "var(--app-text-secondary)", fontSize: 13, lineHeight: 1.4, pr: hasOutput ? 4 : 0 }}>
          {summary.description}
        </Typography>

        {summary.fields.length > 0 ? (
          <List layout={{ gap: 0.55 }} state={{ isEmpty: summary.fields.length === 0 }}>
            <listTemplate.content>
              <>{commandFields}</>
            </listTemplate.content>
          </List>
        ) : null}

        {commandMessage}
      </Box>

      <CommandOutputDialog log={log} modalId={outputModalId} title={summary.title} />
    </>
  );
}
