import type { InstalledPackage, RegistryPackage } from "@uds-poc/shared";
import type { FilterField } from "@uds-poc/shared-ui/components/filter/filter.types";
import { resourceTypeFieldDefinition, resourceTypeOptions } from "@uds-poc/shared-ui/components/chip/resourceTypes/ResourceTypeChip";
import {
  getInstalledPackageState,
  getInstalledPackageResourceType,
  getRegistryPackageState,
  getRegistryPackageResourceType,
} from "./packageActions.js";
import { installedPackageStateOptions, packageStateFieldDefinition, registryPackageStateOptions } from "./packageDefinitions.js";

export function getRegistryPackageFilterFields({
  getInstalledPackage
}: {
  getInstalledPackage: (pkg: RegistryPackage) => InstalledPackage | null;
}): Array<FilterField<RegistryPackage>> {
  return [
    {
      allLabel: resourceTypeFieldDefinition.allLabel,
      apply: (pkg, value) => {
        const selected = String(value ?? "");
        if (!selected) {
          return true;
        }

        return getRegistryPackageResourceType(pkg, getInstalledPackage(pkg)) === selected;
      },
      label: resourceTypeFieldDefinition.label,
      name: "type",
      options: resourceTypeOptions,
      placeholder: resourceTypeFieldDefinition.allLabel,
      type: "select"
    },
    {
      allLabel: packageStateFieldDefinition.allLabel,
      apply: (pkg, value) => {
        const selected = String(value ?? "");
        if (!selected) {
          return true;
        }

        return getRegistryPackageState(getInstalledPackage(pkg)) === selected;
      },
      label: packageStateFieldDefinition.label,
      name: "state",
      options: registryPackageStateOptions,
      placeholder: packageStateFieldDefinition.allLabel,
      type: "select"
    }
  ];
}

export function getInstalledPackageFilterFields(): Array<FilterField<InstalledPackage>> {
  return [
    {
      allLabel: resourceTypeFieldDefinition.allLabel,
      apply: (pkg, value) => {
        const selected = String(value ?? "");
        if (!selected) {
          return true;
        }

        return getInstalledPackageResourceType(pkg) === selected;
      },
      label: resourceTypeFieldDefinition.label,
      name: "type",
      options: resourceTypeOptions,
      placeholder: resourceTypeFieldDefinition.allLabel,
      type: "select"
    },
    {
      allLabel: packageStateFieldDefinition.allLabel,
      apply: (pkg, value) => {
        const selected = String(value ?? "");
        if (!selected) {
          return true;
        }

        return getInstalledPackageState(pkg) === selected;
      },
      label: packageStateFieldDefinition.label,
      name: "state",
      options: installedPackageStateOptions,
      placeholder: packageStateFieldDefinition.allLabel,
      type: "select"
    }
  ];
}
