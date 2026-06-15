import type { InstalledPackage, RegistryPackage } from "@uds-poc/shared";
import { Avatar, Box, Chip, Stack, Typography } from "@mui/material";
import { IconActionButton } from "../../components/button/resourceTypes/IconActionButton.js";
import { ResourceTypeChip } from "../../components/chip/resourceTypes/ResourceTypeChip.js";
import { StatusIndicatorButton } from "../../components/button/resourceTypes/StatusIndicatorButton.js";
import { useContextMenu, type ContextMenuAction } from "../../components/menu/resourceTypes/ContextMenu.js";
import { GenericTable, type Column } from "../../components/table/Table.js";
import { relativeAge } from "../../lib/format.js";
import {
  canInstallPackage,
  canUninstallPackage,
  canUnpublishPackage,
  getRegistryPackageResourceType,
  getRegistryPackageStateLabel
} from "./packageActions.js";
import { packageActionDefinitions } from "./packageDefinitions.js";

export type RegistryPackageTableContext = {
  canManageApps: boolean;
  canManageRegistry: boolean;
  disabled: boolean;
  getInstalledPackage: (pkg: RegistryPackage) => InstalledPackage | null;
  isInstalled: (pkg: RegistryPackage) => boolean;
  onInstall: (id: string) => void;
  onOpen: (url: string) => void;
  onUninstall: (pkg: InstalledPackage) => void;
  onUnpublish: (id: string) => void;
};

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

function PackageCell({ pkg }: { pkg: RegistryPackage }) {
  const title = pkg.displayTitle || pkg.packageName;

  return (
    <Stack direction="row" sx={{ alignItems: "center", gap: 1.25, minWidth: 0 }}>
      <PackageIcon icon={pkg.icon} title={title} />
      <Box sx={{ minWidth: 0 }}>
        <Typography sx={{ color: "text.primary", fontSize: 14, fontWeight: 800, lineHeight: 1.2 }}>
          {title}
        </Typography>
        <Typography color="text.secondary" sx={{ fontSize: 13, lineHeight: 1.35, overflowWrap: "anywhere" }}>
          {pkg.tagline ?? pkg.description ?? "No registry description discovered."}
        </Typography>
        {pkg.categories.length > 0 ? (
          <Stack direction="row" sx={{ flexWrap: "wrap", gap: 0.5, mt: 0.75 }}>
            {pkg.categories.slice(0, 3).map((category) => (
              <Chip key={category} label={category} size="small" variant="outlined" />
            ))}
          </Stack>
        ) : null}
      </Box>
    </Stack>
  );
}

function RegistryPackageActions({
  context,
  pkg
}: {
  context: RegistryPackageTableContext;
  pkg: RegistryPackage;
}) {
  const installedPackage = context.getInstalledPackage(pkg);
  const launchUrl = installedPackage ? getLiveLaunchUrl(installedPackage) : null;
  const title = pkg.displayTitle || pkg.packageName;
  const actions: ContextMenuAction[] = [
    ...(launchUrl
      ? [
          {
            icon: "open" as const,
            label: "Open App",
            onSelect: () => context.onOpen(launchUrl)
          }
        ]
      : []),
    ...(context.canManageApps && canInstallPackage(pkg, installedPackage)
      ? [
          {
            icon: packageActionDefinitions.install.icon,
            label: packageActionDefinitions.install.label,
            onSelect: () => context.onInstall(pkg.id)
          }
        ]
      : []),
    ...(context.canManageApps && installedPackage && canUninstallPackage(installedPackage)
      ? [
          {
            icon: packageActionDefinitions.uninstall.icon,
            label: packageActionDefinitions.uninstall.label,
            onSelect: () => context.onUninstall(installedPackage)
          }
        ]
      : []),
    ...(context.canManageRegistry && canUnpublishPackage(pkg)
      ? [
          {
            icon: packageActionDefinitions.unpublish.icon,
            label: packageActionDefinitions.unpublish.label,
            onSelect: () => context.onUnpublish(pkg.id)
          }
        ]
      : [])
  ];
  const menu = useContextMenu({
    actions,
    actionsLabel: "Package actions",
    state: {
      content: (
        <Box component="li" sx={{ listStyle: "none", px: 1.5, pb: 0.15 }}>
          <StatusIndicatorButton
            label={`${title} ${getRegistryPackageStateLabel(installedPackage)}`}
            state={installedPackage ? "success" : "info"}
            tooltip={`${title} ${getRegistryPackageStateLabel(installedPackage)}`}
            view="text"
          />
        </Box>
      ),
      label: "Package state"
    }
  });

  if (!menu.hasMenu) {
    return null;
  }

  return (
    <Box
      onClick={(event) => event.stopPropagation()}
      sx={{ display: "inline-flex" }}
    >
      <IconActionButton
        icon="more"
        label={`More actions for ${pkg.displayTitle || pkg.packageName}`}
        onClick={menu.openContextMenu}
      />
      {menu.contextMenu}
    </Box>
  );
}

function PackageIcon({ icon, title }: { icon: string | null; title: string }) {
  if (icon) {
    return <Avatar alt="" src={icon} variant="rounded" sx={{ bgcolor: "transparent", flex: "0 0 auto", height: 34, width: 34 }} />;
  }

  return (
    <Avatar variant="rounded" sx={{ bgcolor: "var(--app-brand-bg)", flex: "0 0 auto", fontSize: 18, fontWeight: 800, height: 34, width: 34 }}>
      {title.slice(0, 1).toUpperCase()}
    </Avatar>
  );
}

function getLiveLaunchUrl(item: InstalledPackage) {
  return item.launchUrl && (item.phase === "Ready" || item.status === "Ready") ? item.launchUrl : null;
}

function getRegistryPackageLastUpdated(pkg: RegistryPackage, installedPackage: InstalledPackage | null) {
  return installedPackage?.lastUpdated ?? pkg.lastUpdated;
}
