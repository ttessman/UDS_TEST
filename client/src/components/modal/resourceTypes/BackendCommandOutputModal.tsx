import type { CommandState, InstalledPackage, RegistryPackage, UdsStatus } from "@uds-poc/shared";
import { Stack } from "@mui/material";
import { StatusIndicatorList } from "../../list/resourceTypes/StatusIndicatorList.js";
import type { ListState } from "../../list/list.types.js";
import { CommandLogSection } from "../../section/resourceTypes/CommandLogSection.js";
import { udsStatusIndicators } from "../../../features/status/statusDefinitions.js";
import { CatalogStoreSection } from "../../../features/packages/CatalogStoreSection.js";
import { Modal } from "../Modal.js";

export type BackendCommandOutputModalDefinition = {
  modalId: string;
  title: string;
};

export const backendCommandOutputModalDefinition = {
  modalId: "backend-command-output",
  title: "Backend Command Output"
} satisfies BackendCommandOutputModalDefinition;

export type BackendCommandOutputCatalogStore = {
  busy: boolean;
  filteredPackages: RegistryPackage[];
  installedPackagesByName: Map<string, InstalledPackage>;
  onInstall: (id: string) => void;
  onOpen: (url: string) => void;
  onRefresh: () => void;
  onSearchChange: (value: string) => void;
  packages: RegistryPackage[];
  searchValue: string;
};

export function BackendCommandOutputModal({
  catalogStore,
  definition = backendCommandOutputModalDefinition,
  logs,
  logState,
  status
}: {
  catalogStore?: BackendCommandOutputCatalogStore;
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
        {catalogStore ? <CatalogStoreSection {...catalogStore} /> : null}
        <CommandLogSection items={logs} state={logState} />
      </Stack>
    </Modal>
  );
}
