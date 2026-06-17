import { useEffect, useMemo, useState } from "react";
import { Alert, Container, Stack } from "@mui/material";
import type { CommandState, InstalledPackage, RegistryPackage, UdsStatus } from "@uds-poc/shared";
import {
  getInstalledPackages,
  getRegistryPackages,
  getUdsStatus
} from "./api/uds.js";
import { useFilters } from "./components/filter/useFilters.js";
import { StatusIndicatorList } from "./components/list/resourceTypes/StatusIndicatorList.js";
import { BackendCommandOutputModal } from "./components/modal/resourceTypes/BackendCommandOutputModal.js";
import type { ResourceSectionContentConfig } from "./components/section/resourceTypes/ResourceSection.js";
import { ResourceSection } from "./components/section/resourceTypes/ResourceSection.js";
import { SiteShell, siteContentSx, siteTemplate } from "./components/site/SiteShell.js";
import { SiteFooter } from "./components/site/SiteFooter.js";
import { SiteHeader } from "./components/site/SiteHeader.js";
import {
  installedPackageResource,
  type InstalledPackageResourceContext
} from "./features/packages/packageResourceDefinitions.js";
import { getInstalledPackageResourceType } from "./features/packages/packageActions.js";
import { getInstalledPackageFilterFields, getRegistryPackageFilterFields } from "./features/packages/packageFilters.js";
import { usePackageActions } from "./features/packages/usePackageActions.js";
import { udsStatusIndicators } from "./features/status/statusDefinitions.js";
import { getInstalledPackagePreferenceId, useUserPreferences } from "./store/userPreferences.store.js";

const canManageApps = true;
const canManageRegistry = true;

export function App() {
  const [status, setStatus] = useState<UdsStatus | null>(null);
  const [packages, setPackages] = useState<RegistryPackage[]>([]);
  const [installedPackages, setInstalledPackages] = useState<InstalledPackage[]>([]);
  const [logs, setLogs] = useState<CommandState[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [installedPackageQuery, setInstalledPackageQuery] = useState("");
  const [packageQuery, setPackageQuery] = useState("");
  const userPreferences = useUserPreferences();

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
  const catalogPackages = useMemo(
    () => mergeRegistryAndInstalledCorePackages(packages, installedPackages),
    [installedPackages, packages]
  );
  const packagesByName = useMemo(() => {
    const byName = new Map<string, RegistryPackage>();

    catalogPackages.forEach((pkg) => {
      byName.set(pkg.packageName.toLowerCase(), pkg);
      byName.set(pkg.displayTitle.toLowerCase(), pkg);
    });

    return byName;
  }, [catalogPackages]);

  const filteredPackages = useMemo(() => {
    const query = packageQuery.trim().toLowerCase();
    if (!query) {
      return catalogPackages;
    }

    return catalogPackages.filter((pkg) =>
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
  }, [catalogPackages, packageQuery]);

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
  const favoriteInstalledPackages = useMemo(
    () =>
      sortFavoriteInstalledPackages(
        installedPackages.filter((pkg) =>
          userPreferences.isFavoriteInstalledPackage(getInstalledPackagePreferenceId(pkg.namespace, pkg.name))
        ),
        userPreferences.favoriteInstalledPackageIds
      ),
    [installedPackages, userPreferences]
  );
  const sortedFilteredInstalledPackages = useMemo(
    () => sortFavoriteInstalledPackages(filteredInstalledPackages, userPreferences.favoriteInstalledPackageIds),
    [filteredInstalledPackages, userPreferences.favoriteInstalledPackageIds]
  );
  const installedPackageFilterFields = useMemo(() => getInstalledPackageFilterFields(), []);
  const installedPackageFilters = useFilters({
    fields: installedPackageFilterFields,
    items: sortedFilteredInstalledPackages,
    modalTitle: "Filter installed packages"
  });
  const registryPackageFilterFields = useMemo(
    () =>
      getRegistryPackageFilterFields({
        getInstalledPackage: (pkg) =>
          installedPackagesByName.get(pkg.packageName.toLowerCase()) ??
          installedPackagesByName.get(pkg.displayTitle.toLowerCase()) ??
          null
      }),
    [installedPackagesByName]
  );
  const registryPackageFilters = useFilters({
    fields: registryPackageFilterFields,
    items: filteredPackages,
    modalTitle: "Filter store packages"
  });
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

  const packageActions = usePackageActions({
    refresh,
    setBusy,
    setError,
    setLogs
  });

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
            <StatusIndicatorList item={status} definition={udsStatusIndicators} context={undefined} />
            {error ? <Alert severity="error">{error}</Alert> : null}
            <ResourceSection<InstalledPackage, InstalledPackageResourceContext>
              data={installedPackageFilters.filteredItems}
              content={installedPackagesContent}
              context={{
                filters: installedPackageFilters.control,
                getItemContext: (pkg) => ({
                  canManageApps,
                  isFavorite: userPreferences.isFavoriteInstalledPackage(getInstalledPackagePreferenceId(pkg.namespace, pkg.name)),
                  onUninstall: (packageToUninstall) => void packageActions.uninstall(packageToUninstall),
                  onToggleFavorite: (packageToToggle) =>
                    userPreferences.toggleFavoriteInstalledPackage(getInstalledPackagePreferenceId(packageToToggle.namespace, packageToToggle.name)),
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
                status: busy && installedPackageFilters.filteredItems.length === 0 ? "loading" : "ready"
              }}
            />
          </Stack>
        </Container>
      </siteTemplate.content>
      <siteTemplate.footer>
        <SiteFooter />
        <BackendCommandOutputModal
          catalogStore={{
            busy,
            canManageApps,
            canManageRegistry,
            filteredPackages: registryPackageFilters.filteredItems,
            filters: registryPackageFilters.control,
            installedPackagesByName,
            onInstall: (packageId) => void packageActions.install(packageId),
            onOpen: openInstalledApp,
            onRefresh: () => void refresh(),
            onSearchChange: setPackageQuery,
            onUninstall: (pkg) => void packageActions.uninstall(pkg),
            onUnpublish: (packageId) => void packageActions.unpublish(packageId),
            packages: catalogPackages,
            searchValue: packageQuery
          }}
          favoriteApps={{
            items: favoriteInstalledPackages,
            getItemContext: (pkg) => ({
              canManageApps,
              isFavorite: userPreferences.isFavoriteInstalledPackage(getInstalledPackagePreferenceId(pkg.namespace, pkg.name)),
              onUninstall: (packageToUninstall) => void packageActions.uninstall(packageToUninstall),
              onToggleFavorite: (packageToToggle) =>
                userPreferences.toggleFavoriteInstalledPackage(getInstalledPackagePreferenceId(packageToToggle.namespace, packageToToggle.name)),
              onOpen: openInstalledApp,
              registryPackage: packagesByName.get(pkg.name.toLowerCase()) ?? null
            })
          }}
          logs={logs}
          logState={busy && logs.length === 0 ? "loading" : "ready"}
          status={status}
        />
      </siteTemplate.footer>
    </SiteShell>
  );
}

function mergeRegistryAndInstalledCorePackages(
  registryPackages: RegistryPackage[],
  installedPackages: InstalledPackage[]
) {
  const byPackageName = new Map(registryPackages.map((pkg) => [pkg.packageName.toLowerCase(), pkg]));
  const rows = [...registryPackages];

  installedPackages.forEach((pkg) => {
    if (getInstalledPackageResourceType(pkg) !== "core") {
      return;
    }

    const key = pkg.name.toLowerCase();
    if (byPackageName.has(key)) {
      return;
    }

    rows.push(installedCorePackageToRegistryPackage(pkg));
  });

  return rows;
}

function installedCorePackageToRegistryPackage(pkg: InstalledPackage): RegistryPackage {
  return {
    id: `installed:${pkg.namespace}/${pkg.name}`,
    displayTitle: pkg.name,
    packageName: pkg.name,
    kind: "kubernetes-package",
    repoName: null,
    orgName: null,
    icon: null,
    tagline: `${pkg.name} is installed in the cluster as Core/platform infrastructure.`,
    version: pkg.version,
    tag: null,
    latestTag: null,
    ociReference: "",
    registry: null,
    architecture: pkg.architecture,
    architectures: [],
    flavor: null,
    flavors: [],
    categories: ["core"],
    tagCount: null,
    sizeBytes: null,
    lastUpdated: pkg.lastUpdated,
    lastBuild: null,
    description: `Reported by Package CR ${pkg.namespace}/${pkg.name}. This POC treats it as always-on infrastructure, not an install candidate.`,
    authRequired: null,
    udsCoreRequired: true,
    variables: [],
    installable: false,
    installAction: null,
    rawMetadata: pkg.sourcePackageData,
    sources: ["kubernetes-package-crd", "backend-derived"],
    errors: []
  };
}

function sortFavoriteInstalledPackages(items: InstalledPackage[], favoriteIds: string[]) {
  const favoriteOrder = new Map(favoriteIds.map((id, index) => [id, index]));

  return [...items].sort((a, b) => {
    const aOrder = favoriteOrder.get(getInstalledPackagePreferenceId(a.namespace, a.name));
    const bOrder = favoriteOrder.get(getInstalledPackagePreferenceId(b.namespace, b.name));

    if (aOrder == null && bOrder == null) {
      return 0;
    }

    if (aOrder == null) {
      return 1;
    }

    if (bOrder == null) {
      return -1;
    }

    return aOrder - bOrder;
  });
}
