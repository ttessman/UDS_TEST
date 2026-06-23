import type { ReactNode } from "react";
import type { InstalledPackage, RegistryPackage } from "@uds-poc/shared";
import type { InstalledPackageResourceContext } from "./package.types.js";

export type BackendCommandOutputModalDefinition = {
  modalId: string;
  title: string;
};

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
