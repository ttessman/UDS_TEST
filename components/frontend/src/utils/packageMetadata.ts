import type { InstalledPackage, RegistryPackage } from "@uds-poc/shared";

export function getInstalledPackageVersion(item: InstalledPackage, registryPackage: RegistryPackage | null) {
  return item.version ?? registryPackage?.version ?? null;
}

export function getInstalledPackageTag(item: InstalledPackage, registryPackage: RegistryPackage | null) {
  const version = getInstalledPackageVersion(item, registryPackage);
  const tag = registryPackage?.latestTag ?? registryPackage?.tag ?? null;

  return tag && tag !== version ? tag : null;
}

export function getRegistryPackageLastUpdated(pkg: RegistryPackage, installedPackage: InstalledPackage | null) {
  return installedPackage?.lastUpdated ?? pkg.lastUpdated;
}

export function packageKindLabel(kind: string | null): string {
  if (kind === "zarf") {
    return "PACKAGE";
  }

  return (kind ?? "package").toUpperCase();
}
