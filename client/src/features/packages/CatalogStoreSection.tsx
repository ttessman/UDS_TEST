import type { InstalledPackage, RegistryPackage } from "@uds-poc/shared";
import { Stack, Typography } from "@mui/material";
import { RefreshCountButton } from "../../components/button/resourceTypes/RefreshCountButton.js";
import { SearchField } from "../../components/form/resourceTypes/SearchField.js";
import { Section, sectionTemplate } from "../../components/section/Section.js";
import { RegistryPackageTable } from "./RegistryPackageTable.js";

export type CatalogStoreSectionProps = {
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

export function CatalogStoreSection({
  busy,
  filteredPackages,
  installedPackagesByName,
  onInstall,
  onOpen,
  onRefresh,
  onSearchChange,
  packages,
  searchValue
}: CatalogStoreSectionProps) {
  return (
    <Section>
      <sectionTemplate.header>
        <Stack direction="row" sx={{ alignItems: "center", gap: 1 }}>
          <Typography component="h2" sx={{ fontSize: 28, fontWeight: 800 }}>
            UDS Registry
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
          iconPosition="end"
          label="Search UDS Registry packages"
          onChange={onSearchChange}
          placeholder="Search store"
          sx={{
            flex: { xs: "1 1 100%", lg: "0 1 280px" },
            maxWidth: { xs: "100%", lg: 280 },
            minWidth: 0
          }}
          value={searchValue}
        />
      </sectionTemplate.actions>
      <sectionTemplate.subtitle>
        {packages.length === filteredPackages.length
          ? "Catalog entries discovered from registry/OCI metadata. These are install candidates, not proof they are running."
          : `${packages.length} total registry packages, ${filteredPackages.length} matching the current search.`}
      </sectionTemplate.subtitle>
      <sectionTemplate.content>
        <RegistryPackageTable
          data={filteredPackages}
          context={{
            disabled: busy,
            getInstalledPackage: (pkg) =>
              installedPackagesByName.get(pkg.packageName.toLowerCase()) ??
              installedPackagesByName.get(pkg.displayTitle.toLowerCase()) ??
              null,
            isInstalled: (pkg) =>
              installedPackagesByName.has(pkg.packageName.toLowerCase()) ||
              installedPackagesByName.has(pkg.displayTitle.toLowerCase()),
            onInstall,
            onOpen
          }}
        />
      </sectionTemplate.content>
    </Section>
  );
}
