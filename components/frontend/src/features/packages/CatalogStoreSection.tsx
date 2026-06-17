import type { ReactNode } from "react";
import type { InstalledPackage, RegistryPackage } from "@uds-poc/shared";
import { Stack, Typography } from "@mui/material";
import { RefreshCountButton } from "../../components/button/resourceTypes/RefreshCountButton.js";
import { SearchField } from "../../components/form/resourceTypes/SearchField.js";
import { Section, sectionTemplate } from "../../components/section/Section.js";
import { RegistryPackageTable } from "./RegistryPackageTable.js";

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

export function CatalogStoreSection({
  busy,
  canManageApps = true,
  canManageRegistry = false,
  filters,
  filteredPackages,
  installedPackagesByName,
  onInstall,
  onOpen,
  onRefresh,
  onSearchChange,
  onUninstall,
  onUnpublish,
  packages,
  searchValue
}: CatalogStoreSectionProps) {
  return (
    <Section>
      <sectionTemplate.header>
        <Stack direction="row" sx={{ alignItems: "center", gap: 1 }}>
          <Typography component="h2" sx={{ fontSize: 28, fontWeight: 800 }}>
            UDS Store
          </Typography>
          <RefreshCountButton
            count={filteredPackages.length}
            disabled={busy}
            label={`${filteredPackages.length} UDS Registry packages`}
            onClick={onRefresh}
            tooltip={`${filteredPackages.length} packages. ${busy ? "Refreshing package data" : "Refresh package data"}`}
          />
        </Stack>
      </sectionTemplate.header>
      <sectionTemplate.actions>
        <SearchField
          addon={filters}
          iconPosition="end"
          label="Search UDS store packages"
          onChange={onSearchChange}
          placeholder="Search store"
          sx={{
            flex: { xs: "1 1 100%", lg: "0 1 328px" },
            maxWidth: { xs: "100%", lg: 328 },
            minWidth: 0
          }}
          value={searchValue}
        />
      </sectionTemplate.actions>
      <sectionTemplate.subtitle>
        {packages.length === filteredPackages.length
          ? "Known packages from registry/OCI metadata and installed cluster Package CRs. Core rows are visible but not actionable."
          : `${packages.length} total known packages, ${filteredPackages.length} matching the current search.`}
      </sectionTemplate.subtitle>
      <sectionTemplate.content>
        <RegistryPackageTable
          data={filteredPackages}
          context={{
            canManageApps,
            canManageRegistry,
            disabled: busy,
            getInstalledPackage: (pkg) =>
              installedPackagesByName.get(pkg.packageName.toLowerCase()) ??
              installedPackagesByName.get(pkg.displayTitle.toLowerCase()) ??
              null,
            isInstalled: (pkg) =>
              installedPackagesByName.has(pkg.packageName.toLowerCase()) ||
              installedPackagesByName.has(pkg.displayTitle.toLowerCase()),
            onInstall,
            onOpen,
            onUninstall,
            onUnpublish
          }}
        />
      </sectionTemplate.content>
    </Section>
  );
}
