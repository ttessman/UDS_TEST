import type { InstalledPackage, RegistryPackage } from "@uds-poc/shared";
import { formatBytes, relativeAge, yesNo } from "@uds-poc/shared-ui/lib/format";
import { IconActionButton } from "@uds-poc/shared-ui/components/button/resourceTypes/IconActionButton";
import { ResourceCardVariant, type ResourceCardDefinition } from "@uds-poc/shared-ui/components/card/resourceTypes/ResourceCard";
import { ResourceTypeChip } from "@uds-poc/shared-ui/components/chip/resourceTypes/ResourceTypeChip";
import type { DefinitionField } from "@uds-poc/shared-ui/components/list/resourceTypes/DefinitionList";
import { MetaList, type MetaListDefinition } from "@uds-poc/shared-ui/components/list/resourceTypes/MetaList";
import { StatusIndicatorButton } from "@uds-poc/shared-ui/components/button/resourceTypes/StatusIndicatorButton";
import { KnownConfigChips } from "../KnownConfigChips.js";
import { PackageIcon } from "../PackageIcon.js";
import { PackageStatus } from "../PackageStatus.js";
import { ValueChips } from "../ValueChips.js";
import {
  canInstallPackage,
  getInstalledPackageResourceType,
  canUninstallPackage,
  getInstalledPackageStateLabel,
  getRegistryPackageResourceType,
  getRegistryPackageStateLabel,
} from "../../utils/packageActions.js";
import { endpointLaunchActions, getLiveLaunchUrl } from "../../utils/packageEndpoints.js";
import {
  getInstalledPackageTag,
  getInstalledPackageVersion,
  packageKindLabel
} from "../../utils/packageMetadata.js";
import { packageActionDefinitions } from "../../types/packageDefinitions.js";
import type {
  InstalledPackageResourceContext,
  RegistryPackageResourceContext
} from "../../types/package.types.js";

const registryPackageFields = [
  { key: "latestTag", label: "Latest tag", value: (pkg) => <ValueChips values={[pkg.latestTag ?? pkg.version ?? pkg.tag]} /> },
  { key: "ociReference", label: "OCI reference", value: (pkg) => pkg.ociReference },
  { key: "architectures", label: "Architectures", value: (pkg) => <ValueChips values={[...pkg.architectures, pkg.architecture]} /> },
  { key: "flavors", label: "Flavors", value: (pkg) => <ValueChips values={[...pkg.flavors, pkg.flavor]} /> },
  { key: "sizeBytes", label: "Size", value: (pkg) => formatBytes(pkg.sizeBytes) },
  { key: "authRequired", label: "Auth required", value: (pkg) => (pkg.authRequired == null ? null : yesNo(pkg.authRequired)) },
  {
    key: "udsCoreRequired",
    label: "UDS Core required",
    value: (pkg) => (pkg.udsCoreRequired == null ? null : yesNo(pkg.udsCoreRequired))
  }
] satisfies Array<DefinitionField<RegistryPackage>>;

const installedPackageFields = [
  { key: "namespace", label: "Namespace", value: (pkg) => <ValueChips values={[pkg.namespace]} /> },
  { key: "version", label: "Version", value: (pkg) => <ValueChips values={[pkg.version]} /> },
  { key: "lastUpdated", label: "Updated", value: (pkg) => relativeAge(pkg.lastUpdated) },
  { key: "architecture", label: "Architecture", value: (pkg) => <ValueChips values={[pkg.architecture]} /> },
  { key: "generation", label: "Generation", value: (pkg) => pkg.generation },
  { key: "phase", label: "Phase", value: (pkg) => pkg.phase },
  { key: "status", label: "Status", value: (pkg) => pkg.status },
  { key: "endpoints", label: "Endpoints", value: (pkg) => <ValueChips values={pkg.endpoints} /> }
] satisfies Array<DefinitionField<InstalledPackage>>;

const registryPackageMeta = {
  omitEmptyValues: true,
  fields: [
    {
      key: "lastUpdated",
      icon: "packageUpdated",
      label: "Last updated",
      tooltip: ({ value }) => `Last updated: ${value}`,
      value: ({ item }) => relativeAge(item.lastUpdated)
    },
    {
      key: "tag",
      icon: "packageTags",
      label: "Tag",
      tooltip: ({ value }) => `Tag: ${value}`,
      value: ({ item }) => item.latestTag ?? item.tag
    },
    {
      key: "version",
      icon: "packageVersion",
      label: "Version",
      tooltip: ({ value }) => `Version: ${value}`,
      value: ({ item }) => {
        const tag = item.latestTag ?? item.tag;
        return item.version && item.version !== tag ? item.version : null;
      }
    },
    {
      key: "categories",
      type: "chip",
      tooltip: ({ item }) => (item.categories.length > 0 ? item.categories.join(", ") : "No categories discovered"),
      value: ({ item }) => item.categories.slice(0, 3)
    }
  ]
} satisfies MetaListDefinition<RegistryPackage, RegistryPackageResourceContext>;

const installedPackageMeta = {
  omitEmptyValues: true,
  fields: [
    {
      key: "version",
      icon: "packageVersion",
      label: "Version",
      tooltip: ({ value }) => `Version: ${value}`,
      value: ({ context, item }) => getInstalledPackageVersion(item, context.registryPackage)
    },
    {
      key: "registryTag",
      icon: "packageTags",
      label: "Tag",
      tooltip: ({ value }) => `Tag: ${value}`,
      value: ({ context, item }) => getInstalledPackageTag(item, context.registryPackage)
    },
    {
      key: "lastUpdated",
      icon: "packageUpdated",
      label: "Last updated",
      tooltip: ({ value }) => `Last updated: ${value}`,
      value: ({ context, item }) => relativeAge(item.lastUpdated ?? context.registryPackage?.lastUpdated)
    }
  ]
} satisfies MetaListDefinition<InstalledPackage, InstalledPackageResourceContext>;

export const registryPackageResource = {
  label: ({ item }) => packageKindLabel(item.kind),
  title: ({ item }) => item.displayTitle || item.packageName,
  icon: ({ item }) => <PackageIcon icon={item.icon} title={item.displayTitle || item.packageName} />,
  status: ({ context }) =>
    context.installed ? (
      <StatusIndicatorButton
        label={getInstalledPackageStateLabel(context.installedPackage)}
        state="success"
        tooltip={getInstalledPackageStateLabel(context.installedPackage)}
        view="dot"
      />
    ) : (
      <StatusIndicatorButton label={getRegistryPackageStateLabel(null)} state="info" tooltip={`${getRegistryPackageStateLabel(null)} to the registry`} view="dot" />
    ),
  type: ({ context, item }) => <ResourceTypeChip type={getRegistryPackageResourceType(item, context.installedPackage)} />,
  menuStatus: ({ context, item }) =>
    <StatusIndicatorButton
      label={`${item.displayTitle || item.packageName} ${context.installed ? getInstalledPackageStateLabel(context.installedPackage) : getRegistryPackageStateLabel(null)}`}
      state={context.installed ? "success" : "info"}
      tooltip={`${item.displayTitle || item.packageName} ${context.installed ? getInstalledPackageStateLabel(context.installedPackage) : getRegistryPackageStateLabel(null)}`}
      view="text"
    />,
  summary: ({ item }) => item.tagline ?? item.description ?? "No registry description discovered.",
  meta: ({ context, item, presentation }) => <MetaList item={item} context={context} definition={registryPackageMeta} presentation={presentation} />,
  fields: registryPackageFields,
  details: ({ item }) => (
    <>
      {item.variables.length > 0 ? <KnownConfigChips pkg={item} /> : null}
    </>
  ),
  codeBlocks: [
    { title: "OCI reference", language: "text", content: ({ item }) => item.ociReference },
    { title: "Inspection errors", language: "json", content: ({ item }) => item.errors.join("\n") || null },
    {
      title: "Raw metadata",
      language: "json",
      content: ({ item }) => (item.rawMetadata == null ? null : JSON.stringify(item.rawMetadata, null, 2))
    }
  ],
  shape: {
    title: "Discovered registry/package object shape",
    value: ({ item }) => item.rawMetadata
  },
  primaryAction: ({ item, context }) => {
    return canInstallPackage(item, context.installedPackage) ? (
      <IconActionButton
        disabled={context.disabled}
        icon={packageActionDefinitions.install.icon}
        label={`Install ${item.displayTitle || item.packageName}`}
        onClick={() => context.onInstall(item.id)}
      />
    ) : null;
  },
  menuActions: ({ context, item }) => {
    const launchUrl = context.installedPackage ? getLiveLaunchUrl(context.installedPackage) : null;

    return launchUrl
      ? [
          {
            icon: "open",
            label: "Open App",
            onSelect: () => context.onOpen(launchUrl)
          }
        ]
      : [];
  },
  onSelect: ({ context }) => {
    const launchUrl = context.installedPackage ? getLiveLaunchUrl(context.installedPackage) : null;

    if (launchUrl) {
      context.onOpen(launchUrl);
    }
  },
  commandPreview: ({ item }) => item.installAction?.commandPreview,
  aspectRatio: "4 / 3",
  minHeight: 245
} satisfies ResourceCardDefinition<RegistryPackage, RegistryPackageResourceContext>;

export const installedPackageResource = {
  label: () => "INSTALLED PACKAGE",
  title: ({ item }) => item.name,
  icon: ({ context, item }) => (
    <PackageIcon icon={context.registryPackage?.icon ?? null} title={context.registryPackage?.displayTitle || item.name} />
  ),
  status: ({ item }) => <PackageStatus status={item.phase ?? item.status} view="dot" />,
  statusPlacement: "icon",
  type: ({ item }) => <ResourceTypeChip type={getInstalledPackageResourceType(item)} />,
  primaryAction: ({ context, item }) =>
    context.onToggleFavorite ? (
      <IconActionButton
        icon={context.isFavorite ? "favorite" : "favoriteBorder"}
        label={`${context.isFavorite ? "Remove" : "Add"} ${item.name} ${context.isFavorite ? "from" : "to"} favorites`}
        onClick={() => context.onToggleFavorite?.(item)}
        tooltip={context.isFavorite ? "Remove from favorites" : "Add to favorites"}
      />
    ) : null,
  menuStatus: ({ item }) => (
    <StatusIndicatorButton
      label={`${item.name} ${getInstalledPackageStateLabel(item)}`}
      state="success"
      tooltip={`${item.name} ${getInstalledPackageStateLabel(item)}`}
      view="text"
    />
  ),
  summary: ({ context, item }) => context.registryPackage?.tagline ?? context.registryPackage?.description ?? `Reported by Package CR in namespace ${item.namespace}.`,
  meta: ({ context, item, presentation }) => <MetaList item={item} context={context} definition={installedPackageMeta} presentation={presentation} />,
  variant: ResourceCardVariant.AppLauncher,
  menuActions: ({ context, item }) => {
    return [
      ...endpointLaunchActions(item, context.onOpen),
      ...(context.canManageApps !== false && context.onUninstall && canUninstallPackage(item)
        ? [
            {
              icon: packageActionDefinitions.uninstall.icon,
              label: packageActionDefinitions.uninstall.label,
              onSelect: () => context.onUninstall?.(item)
            }
          ]
        : [])
    ];
  },
  onSelect: ({ context, item }) => {
    const launchUrl = getLiveLaunchUrl(item);

    if (launchUrl) {
      context.onOpen(launchUrl);
    }
  },
  fields: installedPackageFields,
  codeBlocks: [
    {
      title: "Package CR",
      language: "json",
      content: ({ item }) => JSON.stringify(item.sourcePackageData, null, 2)
    }
  ],
  aspectRatio: "4 / 3",
  minHeight: 245
} satisfies ResourceCardDefinition<InstalledPackage, InstalledPackageResourceContext>;
