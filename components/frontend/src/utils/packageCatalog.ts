import type { InstalledPackage, RegistryPackage } from "@uds-poc/shared";
import { getInstalledPackagePreferenceId } from "../store/userPreferences.store.js";
import { getInstalledPackageResourceType } from "./packageActions.js";

export function mergeRegistryAndInstalledCorePackages(
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

export function sortFavoriteInstalledPackages(items: InstalledPackage[], favoriteIds: string[]) {
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

export function installedCorePackageToRegistryPackage(pkg: InstalledPackage): RegistryPackage {
  return {
    architecture: pkg.architecture,
    architectures: [],
    authRequired: null,
    categories: ["core"],
    description: `Reported by Package CR ${pkg.namespace}/${pkg.name}. This POC treats it as always-on infrastructure, not an install candidate.`,
    displayTitle: pkg.name,
    errors: [],
    flavor: null,
    flavors: [],
    icon: null,
    id: `installed:${pkg.namespace}/${pkg.name}`,
    installAction: null,
    installable: false,
    kind: "kubernetes-package",
    lastUpdated: pkg.lastUpdated,
    lastBuild: null,
    latestTag: null,
    ociReference: "",
    orgName: null,
    packageName: pkg.name,
    rawMetadata: pkg.sourcePackageData,
    registry: null,
    repoName: null,
    sizeBytes: null,
    sources: ["kubernetes-package-crd", "backend-derived"],
    tag: null,
    tagline: `${pkg.name} is installed in the cluster as Core/platform infrastructure.`,
    tagCount: null,
    udsCoreRequired: true,
    variables: [],
    version: pkg.version
  };
}
