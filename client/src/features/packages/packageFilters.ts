import type { InstalledPackage, RegistryPackage } from "@uds-poc/shared";
import type { FilterField } from "../../components/filter/filter.types.js";
import {
  getInstalledPackageResourceType,
  getRegistryPackageResourceType,
  isInstalledPackageDeployed
} from "./packageActions.js";

export function getRegistryPackageFilterFields({
  getInstalledPackage
}: {
  getInstalledPackage: (pkg: RegistryPackage) => InstalledPackage | null;
}): Array<FilterField<RegistryPackage>> {
  return [
    {
      allLabel: "All types",
      apply: (pkg, value) => {
        const selected = String(value ?? "");
        if (!selected) {
          return true;
        }

        return getRegistryPackageResourceType(pkg, getInstalledPackage(pkg)) === selected;
      },
      label: "Type",
      name: "type",
      options: resourceTypeOptions,
      placeholder: "All types",
      type: "select"
    },
    {
      allLabel: "All states",
      apply: (pkg, value) => {
        const selected = String(value ?? "");
        if (!selected) {
          return true;
        }

        return getPackageStateValue(getInstalledPackage(pkg)) === selected;
      },
      label: "Active state",
      name: "state",
      options: packageStateOptions,
      placeholder: "All states",
      type: "select"
    }
  ];
}

export function getInstalledPackageFilterFields(): Array<FilterField<InstalledPackage>> {
  return [
    {
      allLabel: "All types",
      apply: (pkg, value) => {
        const selected = String(value ?? "");
        if (!selected) {
          return true;
        }

        return getInstalledPackageResourceType(pkg) === selected;
      },
      label: "Type",
      name: "type",
      options: resourceTypeOptions,
      placeholder: "All types",
      type: "select"
    },
    {
      allLabel: "All states",
      apply: (pkg, value) => {
        const selected = String(value ?? "");
        if (!selected) {
          return true;
        }

        return getPackageStateValue(pkg) === selected;
      },
      label: "Active state",
      name: "state",
      options: packageStateOptions.filter((option) => option.value !== "published"),
      placeholder: "All states",
      type: "select"
    }
  ];
}

function getPackageStateValue(installedPackage: InstalledPackage | null) {
  if (!installedPackage) {
    return "published";
  }

  return isInstalledPackageDeployed(installedPackage) ? "deployed" : "installed";
}

const resourceTypeOptions = [
  { label: "Core", value: "core" },
  { label: "App", value: "app" },
  { label: "Package", value: "package" },
  { label: "Unknown", value: "unknown" }
];

const packageStateOptions = [
  { label: "Published", value: "published" },
  { label: "Installed", value: "installed" },
  { label: "Deployed", value: "deployed" }
];
