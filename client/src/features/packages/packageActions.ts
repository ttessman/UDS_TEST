import type { InstalledPackage, RegistryPackage } from "@uds-poc/shared";
import type { AppIconName } from "../../components/icon/AppIcon.js";
import type { ResourceType } from "../../components/chip/resourceTypes/ResourceTypeChip.js";

export const packageActionIds = ["publish", "unpublish", "install", "uninstall"] as const;

export type PackageActionId = (typeof packageActionIds)[number];

export type PackageActionDefinition = {
  failureMessage: string;
  icon: AppIconName;
  label: string;
};

export const packageActionDefinitions = {
  publish: {
    failureMessage: "Publish request failed",
    icon: "publish",
    label: "Publish"
  },
  unpublish: {
    failureMessage: "Unpublish request failed",
    icon: "unpublish",
    label: "Unpublish"
  },
  install: {
    failureMessage: "Install request failed",
    icon: "install",
    label: "Install App"
  },
  uninstall: {
    failureMessage: "Uninstall request failed",
    icon: "uninstall",
    label: "Uninstall App"
  }
} satisfies Record<PackageActionId, PackageActionDefinition>;

export function canInstallPackage(pkg: RegistryPackage, installedPackage: InstalledPackage | null): boolean {
  return pkg.installable && Boolean(pkg.installAction) && !installedPackage;
}

export function canUnpublishPackage(pkg: RegistryPackage): boolean {
  return /^oci:\/\/(localhost|127\.0\.0\.1):\d+\/uds-poc\/catalog-poc:/.test(pkg.ociReference);
}

export function canUninstallPackage(pkg: InstalledPackage): boolean {
  return pkg.name === "catalog-poc" || pkg.namespace === "catalog-poc";
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

export function getInstalledPackageState(item: InstalledPackage | null): "not-installed" | "installed" | "deployed" {
  if (!item) {
    return "not-installed";
  }

  return isInstalledPackageDeployed(item) ? "deployed" : "installed";
}

export function getInstalledPackageStateLabel(item: InstalledPackage | null): string {
  const state = getInstalledPackageState(item);

  if (state === "deployed") {
    return "Deployed";
  }

  if (state === "installed") {
    return "Installed";
  }

  return "Not installed";
}

export function getRegistryPackageStateLabel(installedPackage: InstalledPackage | null): string {
  return installedPackage ? getInstalledPackageStateLabel(installedPackage) : "Published";
}

export function isInstalledPackageDeployed(item: InstalledPackage | null): boolean {
  return item?.phase === "Ready" || item?.status === "Ready";
}

function isCorePackageName(value: string | null | undefined) {
  return Boolean(value && /^(authservice|keycloak|uds-core|core|istio|pepr|uds-)/i.test(value));
}
