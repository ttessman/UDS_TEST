import type { InstalledPackage, RegistryPackage } from "@uds-poc/shared";
import type { ResourceType } from "@uds-poc/shared-ui/components/chip/resourceTypes/ResourceTypeChip";
import {
  installedPackageInstalledState,
  installedPackageUninstalledState,
  packageStateLabels,
  registryPackagePublishedState,
  type InstalledPackageStateId,
  type RegistryPackageStateId
} from "./packageDefinitions.js";

export function canInstallPackage(pkg: RegistryPackage, installedPackage: InstalledPackage | null): boolean {
  return pkg.installable && Boolean(pkg.installAction) && !installedPackage;
}

export function canUnpublishPackage(pkg: RegistryPackage): boolean {
  return /^oci:\/\/(localhost|127\.0\.0\.1|host\.k3d\.internal):\d+\/uds-poc\/[^/:]+:/.test(pkg.ociReference);
}

export function canUninstallPackage(pkg: InstalledPackage): boolean {
  return isLocalPocAppPackage(pkg.name, pkg.namespace);
}

export function getInstalledPackageResourceType(pkg: InstalledPackage): ResourceType {
  if (isCorePackageName(pkg.name) || isCorePackageName(pkg.namespace)) {
    return "core";
  }

  if (pkg.launchUrl || canUninstallPackage(pkg)) {
    return "app";
  }

  return "package";
}

export function getRegistryPackageResourceType(pkg: RegistryPackage, installedPackage: InstalledPackage | null): ResourceType {
  if (installedPackage) {
    return getInstalledPackageResourceType(installedPackage);
  }

  if (pkg.udsCoreRequired === true || isCorePackageName(pkg.packageName)) {
    return "core";
  }

  if (pkg.kind === "zarf" || pkg.installable) {
    return "package";
  }

  return "unknown";
}

export function getInstalledPackageState(item: InstalledPackage | null): InstalledPackageStateId {
  if (!item) {
    return installedPackageUninstalledState;
  }

  return installedPackageInstalledState;
}

export function getRegistryPackageState(installedPackage: InstalledPackage | null): RegistryPackageStateId {
  return installedPackage ? getInstalledPackageState(installedPackage) : registryPackagePublishedState;
}

export function getInstalledPackageStateLabel(item: InstalledPackage | null): string {
  return packageStateLabels[getInstalledPackageState(item)];
}

export function getRegistryPackageStateLabel(installedPackage: InstalledPackage | null): string {
  return packageStateLabels[getRegistryPackageState(installedPackage)];
}

function isCorePackageName(value: string | null | undefined) {
  return Boolean(value && /^(authservice|keycloak|uds-core|uds-poc|core|istio|pepr)$/i.test(value));
}

function isLocalPocAppPackage(name: string | null | undefined, namespace: string | null | undefined) {
  return ["catalog-poc", "docs"].some((packageName) => name === packageName || namespace === packageName);
}
