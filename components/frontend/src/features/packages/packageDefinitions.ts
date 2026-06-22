import type { AppIconName } from "@uds-poc/shared-ui/components/icon/AppIcon";

export const registryPackageStateLabels = {
  published: "Published",
  unpublished: "Unpublished"
} as const;

export const installedPackageStateLabels = {
  installed: "Installed",
  uninstalled: "Uninstalled"
} as const;

export type InstalledPackageStateId = keyof typeof installedPackageStateLabels;

export const installedPackageInstalledState = "installed" satisfies InstalledPackageStateId;
export const installedPackageUninstalledState = "uninstalled" satisfies InstalledPackageStateId;

export const packageStateLabels = {
  ...registryPackageStateLabels,
  ...installedPackageStateLabels,
  unknown: "Unknown"
} as const;

export type PackageStateId = keyof typeof packageStateLabels;

export type RegistryPackageStateId = keyof typeof packageStateLabels;

export const registryPackagePublishedState = "published" satisfies RegistryPackageStateId;

export const registryPackageActionDefinitions = {
  publish: {
    failureMessage: "Publish request failed",
    icon: "publish",
    label: "Publish"
  },
  unpublish: {
    failureMessage: "Unpublish request failed",
    icon: "unpublish",
    label: "Unpublish"
  }
} satisfies Record<string, { failureMessage: string; icon: AppIconName; label: string }>;

export const installedPackageActionDefinitions = {
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
} satisfies Record<string, { failureMessage: string; icon: AppIconName; label: string }>;

export const packageActionDefinitions = {
  ...registryPackageActionDefinitions,
  ...installedPackageActionDefinitions
};

export type PackageActionId = keyof typeof packageActionDefinitions;

export const packageStateFieldDefinition = {
  allLabel: "All States",
  label: "Package State"
} as const;

export const registryPackageStateOptions = stateOptions(packageStateLabels);

export const installedPackageStateOptions = stateOptions({
  ...installedPackageStateLabels,
  unknown: packageStateLabels.unknown
});

function stateOptions<T extends Record<string, string>>(labels: T) {
  return Object.entries(labels)
    .sort(([a], [b]) => Number(a === "unknown") - Number(b === "unknown"))
    .map(([value, label]) => ({ label, value }));
}
