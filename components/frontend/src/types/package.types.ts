import type { ReactNode } from "react";
import type { InstalledPackage, RegistryPackage } from "@uds-poc/shared";

export type RegistryPackageResourceContext = {
  disabled: boolean;
  installed: boolean;
  installedPackage: InstalledPackage | null;
  onInstall: (id: string) => void;
  onOpen: (url: string) => void;
};

export type InstalledPackageResourceContext = {
  canManageApps?: boolean;
  isFavorite?: boolean;
  onUninstall?: (pkg: InstalledPackage) => void;
  onToggleFavorite?: (pkg: InstalledPackage) => void;
  onOpen: (url: string) => void;
  registryPackage: RegistryPackage | null;
};

export type RegistryPackageTableContext = {
  canManageApps: boolean;
  canManageRegistry: boolean;
  disabled: boolean;
  getInstalledPackage: (pkg: RegistryPackage) => InstalledPackage | null;
  isInstalled: (pkg: RegistryPackage) => boolean;
  onInstall: (id: string) => void;
  onOpen: (url: string) => void;
  onUninstall: (pkg: InstalledPackage) => void;
  onUnpublish: (id: string) => void;
};

export type CatalogStoreSectionProps = {
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
