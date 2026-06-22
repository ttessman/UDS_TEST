import type { ReactNode } from "react";
import type { CommandState, InstalledPackage, RegistryPackage, UdsStatus } from "@uds-poc/shared";
import { Stack } from "@mui/material";
import { StatusIndicatorList } from "@uds-poc/shared-ui/components/list/resourceTypes/StatusIndicatorList";
import type { ListState } from "@uds-poc/shared-ui/components/list/list.types";
import { CommandLogSection } from "@uds-poc/shared-ui/components/section/resourceTypes/CommandLogSection";
import { ResourceSection, type ResourceSectionContentConfig } from "@uds-poc/shared-ui/components/section/resourceTypes/ResourceSection";
import { ResourceCardVariant } from "@uds-poc/shared-ui/components/card/resourceTypes/ResourceCard";
import { Modal } from "@uds-poc/shared-ui/components/modal/Modal";
import { CatalogStoreSection } from "../packages/CatalogStoreSection.js";
import {
  installedPackageResource,
  type InstalledPackageResourceContext
} from "../packages/packageResourceDefinitions.js";
import { udsStatusIndicators } from "../status/statusDefinitions.js";

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
  canManageApps?: boolean;
  canManageRegistry?: boolean;
  filters?: ReactNode;
  filteredPackages: RegistryPackage[];
  installedPackagesByName: Map<string, InstalledPackage>;
  onInstall: (id: string) => void;
  onOpen: (url: string) => void;
  onRefresh: () => void;
  onSearchChange: (value: string) => void;
  onUninstall: (pkg: InstalledPackage) => void;
  onUnpublish: (id: string) => void;
  packages: RegistryPackage[];
  searchValue: string;
};

export type BackendCommandOutputFavoriteApps = {
  getItemContext: (pkg: InstalledPackage) => InstalledPackageResourceContext;
  items: InstalledPackage[];
};

const favoriteAppsContent = {
  title: "Favorite Apps",
  resource: installedPackageResource,
  emptyMessage: "No favorite apps selected.",
  layout: {
    alignItems: "stretch",
    gap: 1.5,
    gridTemplateColumns: {
      xs: "minmax(0, 1fr)",
      sm: "repeat(2, minmax(0, 1fr))",
      md: "repeat(3, minmax(0, 1fr))",
      lg: "repeat(3, minmax(0, 1fr))",
      xl: "repeat(4, minmax(0, 1fr))"
    },
    justifyContent: "stretch",
    justifyItems: "stretch"
  },
  subtitle: (items) => `${items.length} favorite ${items.length === 1 ? "app" : "apps"}.`,
  variant: ResourceCardVariant.AppLauncher
} satisfies ResourceSectionContentConfig<InstalledPackage, InstalledPackageResourceContext>;

export function BackendCommandOutputModal({
  catalogStore,
  definition = backendCommandOutputModalDefinition,
  favoriteApps,
  logs,
  logState,
  status
}: {
  catalogStore?: BackendCommandOutputCatalogStore;
  definition?: BackendCommandOutputModalDefinition;
  favoriteApps?: BackendCommandOutputFavoriteApps;
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
        {favoriteApps && favoriteApps.items.length > 0 ? (
          <ResourceSection<InstalledPackage, InstalledPackageResourceContext>
            data={favoriteApps.items}
            content={favoriteAppsContent}
            context={{
              getItemContext: favoriteApps.getItemContext,
              status: "ready"
            }}
          />
        ) : null}
        {catalogStore ? <CatalogStoreSection {...catalogStore} /> : null}
        <CommandLogSection items={logs} state={logState} />
      </Stack>
    </Modal>
  );
}
