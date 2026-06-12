import { useEffect, useMemo, useState } from "react";
import { Alert, Container, Stack, Typography } from "@mui/material";
import type { CommandState, InstalledPackage, RegistryPackage, UdsStatus } from "@uds-poc/shared";
import {
  getInstalledPackages,
  getRegistryPackages,
  getUdsStatus,
  requestPackageInstall
} from "./api/uds.js";
import { StatusIndicatorList } from "./components/list/resourceTypes/StatusIndicatorList.js";
import { BackendCommandOutputModal } from "./components/modal/resourceTypes/BackendCommandOutputModal.js";
import type { ResourceSectionContentConfig } from "./components/section/resourceTypes/ResourceSection.js";
import { ResourceSection } from "./components/section/resourceTypes/ResourceSection.js";
import { RefreshCountButton } from "./components/button/resourceTypes/RefreshCountButton.js";
import { SearchField } from "./components/form/resourceTypes/SearchField.js";
import { Section, sectionTemplate } from "./components/section/Section.js";
import { SiteShell, siteContentSx, siteTemplate } from "./components/site/SiteShell.js";
import { SiteFooter } from "./components/site/SiteFooter.js";
import { SiteHeader } from "./components/site/SiteHeader.js";
import {
  installedPackageResource,
  type InstalledPackageResourceContext,
} from "./features/packages/packageResourceDefinitions.js";
import { RegistryPackageTable } from "./features/packages/RegistryPackageTable.js";
import { udsStatusIndicators } from "./features/status/statusDefinitions.js";

export function App() {
  const [status, setStatus] = useState<UdsStatus | null>(null);
  const [packages, setPackages] = useState<RegistryPackage[]>([]);
  const [installedPackages, setInstalledPackages] = useState<InstalledPackage[]>([]);
  const [logs, setLogs] = useState<CommandState[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [installedPackageQuery, setInstalledPackageQuery] = useState("");
  const [packageQuery, setPackageQuery] = useState("");

  async function refresh() {
    setBusy(true);
    setError(null);

    try {
      const [nextStatus, registry, installed] = await Promise.all([
        getUdsStatus(),
        getRegistryPackages(),
        getInstalledPackages()
      ]);

      setStatus(nextStatus);
      setPackages(registry.packages);
      setInstalledPackages(installed.installedPackages);
      setLogs([...nextStatus.checks, ...registry.logs, ...installed.logs]);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unknown frontend error");
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  const installedPackagesByName = useMemo(() => {
    const byName = new Map<string, InstalledPackage>();

    installedPackages.forEach((pkg) => {
      byName.set(pkg.name.toLowerCase(), pkg);
    });

    return byName;
  }, [installedPackages]);
  const packagesByName = useMemo(() => {
    const byName = new Map<string, RegistryPackage>();

    packages.forEach((pkg) => {
      byName.set(pkg.packageName.toLowerCase(), pkg);
      byName.set(pkg.displayTitle.toLowerCase(), pkg);
    });

    return byName;
  }, [packages]);

  const filteredPackages = useMemo(() => {
    const query = packageQuery.trim().toLowerCase();
    if (!query) {
      return packages;
    }

    return packages.filter((pkg) =>
      [
        pkg.displayTitle,
        pkg.packageName,
        pkg.repoName,
        pkg.kind,
        pkg.tagline,
        pkg.description,
        pkg.latestTag,
        ...pkg.categories,
        ...pkg.architectures,
        ...pkg.flavors
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query))
    );
  }, [packageQuery, packages]);

  const filteredInstalledPackages = useMemo(() => {
    const query = installedPackageQuery.trim().toLowerCase();
    if (!query) {
      return installedPackages;
    }

    return installedPackages.filter((pkg) =>
      [
        pkg.name,
        pkg.namespace,
        pkg.phase,
        pkg.status,
        pkg.version,
        pkg.architecture,
        pkg.lastUpdated,
        pkg.launchUrl,
        ...pkg.endpoints
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query))
    );
  }, [installedPackageQuery, installedPackages]);

  const installedPackagesContent = useMemo(
    () =>
      ({
        title: "Installed Packages",
        resource: installedPackageResource,
        emptyMessage: "No installed Package CRs were returned by the cluster.",
        loadingMessage: "Loading installed packages...",
        refreshLabel: (count) => `${count} installed packages`,
        refreshTooltip: ({ busy: isRefreshing, count }) =>
          `${count} installed packages. ${isRefreshing ? "Refreshing package data" : "Refresh package data"}`,
        searchLabel: "Search installed packages",
        searchPlaceholder: "Search installed",
        subtitle: (items) =>
          installedPackages.length === items.length
            ? "Packages reported by Kubernetes Package custom resources in the active cluster."
            : `${installedPackages.length} total installed packages, ${items.length} matching the current search.`
      }) satisfies ResourceSectionContentConfig<InstalledPackage, InstalledPackageResourceContext>,
    [installedPackages.length]
  );

  async function installPackage(packageId: string) {
    setBusy(true);
    setError(null);

    try {
      const response = await requestPackageInstall(packageId);
      setLogs((existing) => (response.result ? [response.result, ...existing] : existing));

      if (response.error) {
        setError(response.error);
      }

      await refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Install request failed");
    } finally {
      setBusy(false);
    }
  }

  function openInstalledApp(url: string) {
    window.open(url, "_blank", "noopener,noreferrer");
  }

  return (
    <SiteShell>
      <siteTemplate.header>
        <SiteHeader />
      </siteTemplate.header>
      <siteTemplate.content>
        <Container maxWidth={false} sx={{ ...siteContentSx, py: 3 }}>
          <Stack sx={{ gap: 3.25 }}>
            {error ? <Alert severity="error">{error}</Alert> : null}

            <StatusIndicatorList item={status} definition={udsStatusIndicators} context={undefined} />

            <Section>
              <sectionTemplate.header>
                <Stack direction="row" sx={{ alignItems: "center", gap: 1 }}>
                  <Typography component="h2" sx={{ fontSize: 28, fontWeight: 800 }}>
                    Airgap Store
                  </Typography>
                  <RefreshCountButton
                    count={filteredPackages.length}
                    disabled={busy}
                    label={`${filteredPackages.length} Airgap Store packages`}
                    onClick={() => void refresh()}
                    tooltip={`${filteredPackages.length} packages. ${busy ? "Refreshing package data" : "Refresh package data"}`}
                  />
                </Stack>
              </sectionTemplate.header>
              <sectionTemplate.actions>
                <SearchField
                  iconPosition="end"
                  label="Search Airgap Store packages"
                  onChange={setPackageQuery}
                  placeholder="Search store"
                  sx={{
                    flex: { xs: "1 1 100%", lg: "0 1 280px" },
                    maxWidth: { xs: "100%", lg: 280 },
                    minWidth: 0
                  }}
                  value={packageQuery}
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
                    onInstall: (id) => void installPackage(id),
                    onOpen: openInstalledApp
                  }}
                />
              </sectionTemplate.content>
            </Section>
            <ResourceSection<InstalledPackage, InstalledPackageResourceContext>
              data={filteredInstalledPackages}
              content={installedPackagesContent}
              context={{
                getItemContext: (pkg) => ({
                  onOpen: openInstalledApp,
                  registryPackage: packagesByName.get(pkg.name.toLowerCase()) ?? null
                }),
                refresh: {
                  disabled: busy,
                  onClick: () => void refresh()
                },
                search: {
                  enabled: true,
                  onChange: setInstalledPackageQuery,
                  value: installedPackageQuery
                },
                status: busy && filteredInstalledPackages.length === 0 ? "loading" : "ready"
              }}
            />
          </Stack>
        </Container>
      </siteTemplate.content>
      <siteTemplate.footer>
        <SiteFooter />
        <BackendCommandOutputModal
          logs={logs}
          logState={busy && logs.length === 0 ? "loading" : "ready"}
          status={status}
        />
      </siteTemplate.footer>
    </SiteShell>
  );
}
