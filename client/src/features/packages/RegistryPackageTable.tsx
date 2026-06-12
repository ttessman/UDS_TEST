import type { InstalledPackage, RegistryPackage } from "@uds-poc/shared";
import { Avatar, Box, Chip, Stack, Typography } from "@mui/material";
import { IconActionButton } from "../../components/button/resourceTypes/IconActionButton.js";
import { StatusIndicatorButton } from "../../components/button/resourceTypes/StatusIndicatorButton.js";
import { useContextMenu, type ContextMenuAction } from "../../components/menu/resourceTypes/ContextMenu.js";
import { GenericTable, type Column } from "../../components/table/Table.js";
import { formatBytes, relativeAge } from "../../lib/format.js";

export type RegistryPackageTableContext = {
  disabled: boolean;
  getInstalledPackage: (pkg: RegistryPackage) => InstalledPackage | null;
  isInstalled: (pkg: RegistryPackage) => boolean;
  onInstall: (id: string) => void;
  onOpen: (url: string) => void;
};

export function RegistryPackageTable({
  context,
  data
}: {
  context: RegistryPackageTableContext;
  data: RegistryPackage[];
}) {
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
      id: "version",
      label: "Version",
      render: (pkg) => pkg.version ?? pkg.latestTag ?? pkg.tag ?? "unknown",
      sortValue: (pkg) => pkg.version ?? pkg.latestTag ?? pkg.tag ?? ""
    },
    {
      id: "updated",
      label: "Updated",
      render: (pkg) => relativeAge(pkg.lastUpdated) ?? "unknown",
      sortValue: (pkg) => pkg.lastUpdated ?? ""
    },
    {
      id: "size",
      label: "Size",
      render: (pkg) => formatBytes(pkg.sizeBytes) ?? "unknown",
      sortValue: (pkg) => pkg.sizeBytes ?? 0
    },
    {
      id: "status",
      label: "State",
      render: (pkg) => ({
        node: context.isInstalled(pkg) ? (
          <StatusIndicatorButton label="Installed" state="success" tooltip="Installed" view="chip" />
        ) : (
          <Typography color="text.secondary" sx={{ fontSize: 13, fontWeight: 700 }}>
            Available
          </Typography>
        ),
        text: context.isInstalled(pkg) ? "Installed" : "Available"
      }),
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
    ...(pkg.installable && pkg.installAction && !context.isInstalled(pkg)
      ? [
          {
            icon: "install" as const,
            label: `Install ${pkg.displayTitle || pkg.packageName}`,
            onSelect: () => context.onInstall(pkg.id)
          }
        ]
      : [])
  ];
  const menu = useContextMenu({
    actions,
    actionsLabel: "Package actions",
    state: context.isInstalled(pkg)
      ? {
          content: (
            <Box component="li" sx={{ listStyle: "none", px: 1.5, pb: 0.15 }}>
              <StatusIndicatorButton
                label={`${pkg.displayTitle || pkg.packageName} Installed`}
                state="success"
                tooltip={`${pkg.displayTitle || pkg.packageName} Installed`}
                view="text"
              />
            </Box>
          ),
          label: "Package state"
        }
      : undefined
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
