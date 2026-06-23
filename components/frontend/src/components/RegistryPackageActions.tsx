import type { InstalledPackage, RegistryPackage } from "@uds-poc/shared";
import { Box } from "@mui/material";
import { IconActionButton } from "@uds-poc/shared-ui/components/button/resourceTypes/IconActionButton";
import { StatusIndicatorButton } from "@uds-poc/shared-ui/components/button/resourceTypes/StatusIndicatorButton";
import { useContextMenu, type ContextMenuAction } from "@uds-poc/shared-ui/components/menu/resourceTypes/ContextMenu";
import {
  canInstallPackage,
  canUninstallPackage,
  canUnpublishPackage,
  getRegistryPackageResourceType,
  getRegistryPackageStateLabel
} from "../utils/packageActions.js";
import { getLiveLaunchUrl } from "../utils/packageEndpoints.js";
import { packageActionDefinitions } from "../types/packageDefinitions.js";
import type { RegistryPackageTableContext } from "../types/package.types.js";

export function RegistryPackageActions({
  context,
  pkg
}: {
  context: RegistryPackageTableContext;
  pkg: RegistryPackage;
}) {
  const installedPackage = context.getInstalledPackage(pkg);
  const resourceType = getRegistryPackageResourceType(pkg, installedPackage);
  const launchUrl = installedPackage ? getLiveLaunchUrl(installedPackage) : null;
  const title = pkg.displayTitle || pkg.packageName;
  const actionsDisabled = resourceType === "core";
  const actions = getRegistryPackageMenuActions({
    actionsDisabled,
    context,
    installedPackage,
    launchUrl,
    pkg
  });
  const menu = useContextMenu({
    actions,
    actionsLabel: "Package actions",
    noActionsLabel: actionsDisabled ? "No actions supported for Core packages" : "No actions supported",
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
    <Box onClick={(event) => event.stopPropagation()} sx={{ display: "inline-flex" }}>
      <IconActionButton
        icon="more"
        label={`More actions for ${pkg.displayTitle || pkg.packageName}`}
        onClick={menu.openContextMenu}
      />
      {menu.contextMenu}
    </Box>
  );
}

function getRegistryPackageMenuActions({
  actionsDisabled,
  context,
  installedPackage,
  launchUrl,
  pkg
}: {
  actionsDisabled: boolean;
  context: RegistryPackageTableContext;
  installedPackage: InstalledPackage | null;
  launchUrl: string | null;
  pkg: RegistryPackage;
}): ContextMenuAction[] {
  return [
    ...(!actionsDisabled && launchUrl
      ? [
          {
            icon: "open" as const,
            label: "Open App",
            onSelect: () => context.onOpen(launchUrl)
          }
        ]
      : []),
    ...(!actionsDisabled && context.canManageApps && canInstallPackage(pkg, installedPackage)
      ? [
          {
            icon: packageActionDefinitions.install.icon,
            label: packageActionDefinitions.install.label,
            onSelect: () => context.onInstall(pkg.id)
          }
        ]
      : []),
    ...(!actionsDisabled && context.canManageApps && installedPackage && canUninstallPackage(installedPackage)
      ? [
          {
            icon: packageActionDefinitions.uninstall.icon,
            label: packageActionDefinitions.uninstall.label,
            onSelect: () => context.onUninstall(installedPackage)
          }
        ]
      : []),
    ...(!actionsDisabled && context.canManageRegistry && canUnpublishPackage(pkg)
      ? [
          {
            icon: packageActionDefinitions.unpublish.icon,
            label: packageActionDefinitions.unpublish.label,
            onSelect: () => context.onUnpublish(pkg.id)
          }
        ]
      : [])
  ];
}
