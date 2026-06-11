import type { CommandState, UdsStatus } from "@uds-poc/shared";
import { Stack } from "@mui/material";
import { StatusIndicatorList } from "../../list/resourceTypes/StatusIndicatorList.js";
import type { ListState } from "../../list/list.types.js";
import { udsStatusIndicators } from "../../../features/status/statusDefinitions.js";
import { CommandLogList } from "../../../features/logs/logDefinitions.js";
import { Modal } from "../Modal.js";

export type BackendCommandOutputModalDefinition = {
  modalId: string;
  title: string;
};

export const backendCommandOutputModalDefinition = {
  modalId: "backend-command-output",
  title: "Backend Command Output"
} satisfies BackendCommandOutputModalDefinition;

export function BackendCommandOutputModal({
  definition = backendCommandOutputModalDefinition,
  logs,
  logState,
  status
}: {
  definition?: BackendCommandOutputModalDefinition;
  logs: CommandState[];
  logState: ListState;
  status: UdsStatus | null;
}) {
  return (
    <Modal
      definition={{ contentSx: { bgcolor: "var(--app-bg-default)" }, maxWidth: "md", title: definition.title }}
      modalId={definition.modalId}
    >
      <Stack sx={{ gap: 2 }}>
        <StatusIndicatorList item={status} definition={udsStatusIndicators} context={undefined} />
        <CommandLogList items={logs} state={logState} />
      </Stack>
    </Modal>
  );
}
