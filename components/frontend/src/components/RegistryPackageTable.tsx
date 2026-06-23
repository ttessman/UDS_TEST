import type { InstalledPackage, RegistryPackage } from "@uds-poc/shared";
import { ResourceTypeChip } from "@uds-poc/shared-ui/components/chip/resourceTypes/ResourceTypeChip";
import { StatusIndicatorButton } from "@uds-poc/shared-ui/components/button/resourceTypes/StatusIndicatorButton";
import { GenericTable, type Column } from "@uds-poc/shared-ui/components/table/Table";
import { relativeAge } from "@uds-poc/shared-ui/lib/format";
import { getRegistryPackageResourceType, getRegistryPackageStateLabel } from "../utils/packageActions.js";
import { getRegistryPackageLastUpdated } from "../utils/packageMetadata.js";
import type { RegistryPackageTableContext } from "../types/package.types.js";
import { PackageCell } from "./PackageCell.js";
import { RegistryPackageActions } from "./RegistryPackageActions.js";

export function RegistryPackageTable({
  context,
  data
}: {
  context: RegistryPackageTableContext;
  data: RegistryPackage[];
}) {
  const hasUpdatedColumn = data.some((pkg) => getRegistryPackageLastUpdated(pkg, context.getInstalledPackage(pkg)));
  const columns: Column<RegistryPackage>[] = [
    {
      id: "package",
      label: "Package",
      render: (pkg) => ({
        node: <PackageCell pkg={pkg} />,
        text: `${pkg.displayTitle} ${pkg.packageName} ${pkg.description ?? ""}`
      }),
      sortValue: (pkg) => pkg.displayTitle || pkg.packageName
    },
    {
      id: "type",
      label: "Type",
      render: (pkg) => {
        const installedPackage = context.getInstalledPackage(pkg);
        const type = getRegistryPackageResourceType(pkg, installedPackage);

        return {
          node: <ResourceTypeChip type={type} />,
          text: type
        };
      },
      sortValue: (pkg) => getRegistryPackageResourceType(pkg, context.getInstalledPackage(pkg))
    },
    {
      id: "version",
      label: "Version",
      render: (pkg) => pkg.version ?? pkg.latestTag ?? pkg.tag ?? "",
      sortValue: (pkg) => pkg.version ?? pkg.latestTag ?? pkg.tag ?? ""
    },
    ...(hasUpdatedColumn
      ? [
          {
            id: "updated",
            label: "Updated",
            render: (pkg) => relativeAge(getRegistryPackageLastUpdated(pkg, context.getInstalledPackage(pkg))) ?? "",
            sortValue: (pkg) => getRegistryPackageLastUpdated(pkg, context.getInstalledPackage(pkg)) ?? ""
          } satisfies Column<RegistryPackage>
        ]
      : []),
    {
      id: "status",
      label: "State",
      render: (pkg) => {
        const installedPackage = context.getInstalledPackage(pkg);
        const stateLabel = getRegistryPackageStateLabel(installedPackage);

        return {
          node: installedPackage ? (
            <StatusIndicatorButton
              label={stateLabel}
              state="success"
              tooltip={stateLabel}
              view="chip"
            />
          ) : (
            <StatusIndicatorButton label={stateLabel} state="info" tooltip={`${stateLabel} to the registry`} view="chip" />
          ),
          text: stateLabel
        };
      },
      sortValue: (pkg) => (context.isInstalled(pkg) ? 1 : 0)
    },
    {
      id: "actions",
      label: "",
      render: (pkg) => ({
        node: (
          <RegistryPackageActions
            context={context}
            pkg={pkg}
          />
        ),
        text: "Actions"
      }),
      sx: { textAlign: "right", width: 52 }
    }
  ];

  return (
    <GenericTable
      columns={columns}
      data={data}
      noMargin
      rowKey={(pkg) => pkg.id}
      size="small"
      tableLayout="auto"
      testId="airgap-store-table"
    />
  );
}
