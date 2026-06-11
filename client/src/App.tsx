import { useEffect, useMemo, useState } from "react";
import { Alert, Container, Stack } from "@mui/material";
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
import { SiteShell, siteContentSx, siteTemplate } from "./components/site/SiteShell.js";
import { SiteFooter } from "./components/site/SiteFooter.js";
import { SiteHeader } from "./components/site/SiteHeader.js";
import {
  installedPackageResource,
  type InstalledPackageResourceContext,
  registryPackageResource,
  type RegistryPackageResourceContext
} from "./features/packages/packageResourceDefinitions.js";
import { udsStatusIndicators } from "./features/status/statusDefinitions.js";

export function App() {
  const [status, setStatus] = useState<UdsStatus | null>(null);
  const [packages, setPackages] = useState<RegistryPackage[]>([]);
  const [installedPackages, setInstalledPackages] = useState<InstalledPackage[]>([]);
  const [logs, setLogs] = useState<CommandState[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
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

  const installedNames = useMemo(
    () => new Set(installedPackages.map((item) => item.name.toLowerCase())),
    [installedPackages]
  );
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

  const registryPackagesContent = useMemo(
    () =>
      ({
        title: "Airgap Store",
        resource: registryPackageResource,
        emptyMessage: "No registry packages were found.",
        loadingMessage: "Loading registry packages...",
        refreshLabel: (count) => `${count} Airgap Store packages`,
        refreshTooltip: ({ busy: isRefreshing, count }) =>
          `${count} packages. ${isRefreshing ? "Refreshing package data" : "Refresh package data"}`,
        searchLabel: "Search Airgap Store packages",
        searchPlaceholder: "Search store",
        subtitle: (items) =>
          packages.length === items.length
            ? "Catalog entries discovered from registry/OCI metadata. These are install candidates, not proof they are running."
            : `${packages.length} total registry packages, ${items.length} matching the current search.`
      }) satisfies ResourceSectionContentConfig<RegistryPackage, RegistryPackageResourceContext>,
    [packages.length]
  );

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
        subtitle: () => "Packages reported by Kubernetes Package custom resources in the active cluster."
      }) satisfies ResourceSectionContentConfig<InstalledPackage, InstalledPackageResourceContext>,
    []
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

            <ResourceSection<RegistryPackage, RegistryPackageResourceContext>
              data={filteredPackages}
              content={registryPackagesContent}
              context={{
                getItemContext: (pkg) => ({
                  disabled: busy,
                  installed: installedNames.has(pkg.packageName.toLowerCase()),
                  onInstall: (id: string) => void installPackage(id)
                }),
                refresh: {
                  disabled: busy,
                  onClick: () => void refresh()
                },
                search: {
                  enabled: true,
                  onChange: setPackageQuery,
                  value: packageQuery
                },
                status: busy && filteredPackages.length === 0 ? "loading" : "ready"
              }}
            />
            <ResourceSection<InstalledPackage, InstalledPackageResourceContext>
              data={installedPackages}
              content={installedPackagesContent}
              context={{
                getItemContext: (pkg) => ({ registryPackage: packagesByName.get(pkg.name.toLowerCase()) ?? null }),
                refresh: {
                  disabled: busy,
                  onClick: () => void refresh()
                },
                status: busy && installedPackages.length === 0 ? "loading" : "ready"
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
