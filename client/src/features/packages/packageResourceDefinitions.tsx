import type { InstalledPackage, RegistryPackage } from "@uds-poc/shared";
import { Avatar, Chip, Stack, Typography } from "@mui/material";
import { formatBytes, relativeAge, yesNo } from "../../lib/format.js";
import { IconActionButton } from "../../components/button/resourceTypes/IconActionButton.js";
import { ResourceCardVariant, type ResourceCardDefinition } from "../../components/card/resourceTypes/ResourceCard.js";
import type { DefinitionField } from "../../components/list/resourceTypes/DefinitionList.js";
import { MetaList, type MetaListDefinition } from "../../components/list/resourceTypes/MetaList.js";
import { StatusIndicatorButton } from "../../components/button/resourceTypes/StatusIndicatorButton.js";
import type { StatusIndicatorTone } from "../../components/status/status.types.js";

export type RegistryPackageResourceContext = {
  disabled: boolean;
  installed: boolean;
  installedPackage: InstalledPackage | null;
  onInstall: (id: string) => void;
  onOpen: (url: string) => void;
};

export type InstalledPackageResourceContext = {
  onOpen: (url: string) => void;
  registryPackage: RegistryPackage | null;
};

const registryPackageFields = [
  { key: "latestTag", label: "Latest tag", value: (pkg) => valueChips([pkg.latestTag ?? pkg.version ?? pkg.tag]) },
  { key: "ociReference", label: "OCI reference", value: (pkg) => pkg.ociReference },
  { key: "architectures", label: "Architectures", value: (pkg) => valueChips([...pkg.architectures, pkg.architecture]) },
  { key: "flavors", label: "Flavors", value: (pkg) => valueChips([...pkg.flavors, pkg.flavor]) },
  { key: "sizeBytes", label: "Size", value: (pkg) => formatBytes(pkg.sizeBytes) },
  { key: "authRequired", label: "Auth required", value: (pkg) => (pkg.authRequired == null ? null : yesNo(pkg.authRequired)) },
  {
    key: "udsCoreRequired",
    label: "UDS Core required",
    value: (pkg) => (pkg.udsCoreRequired == null ? null : yesNo(pkg.udsCoreRequired))
  }
] satisfies Array<DefinitionField<RegistryPackage>>;

const installedPackageFields = [
  { key: "namespace", label: "Namespace", value: (pkg) => valueChips([pkg.namespace]) },
  { key: "version", label: "Version", value: (pkg) => valueChips([pkg.version]) },
  { key: "lastUpdated", label: "Updated", value: (pkg) => relativeAge(pkg.lastUpdated) },
  { key: "architecture", label: "Architecture", value: (pkg) => valueChips([pkg.architecture]) },
  { key: "generation", label: "Generation", value: (pkg) => pkg.generation },
  { key: "phase", label: "Phase", value: (pkg) => pkg.phase },
  { key: "status", label: "Status", value: (pkg) => pkg.status },
  { key: "endpoints", label: "Endpoints", value: (pkg) => valueChips(pkg.endpoints) }
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
    context.installed ? <StatusIndicatorButton label="installed" state="success" tooltip="Installed" view="chip" /> : null,
  menuStatus: ({ context, item }) =>
    context.installed ? (
      <StatusIndicatorButton
        label={`${item.displayTitle || item.packageName} Installed`}
        state="success"
        tooltip={`${item.displayTitle || item.packageName} Installed`}
        view="text"
      />
    ) : null,
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
    return item.installable && item.installAction && !context.installed ? (
      <IconActionButton
        disabled={context.disabled}
        icon="install"
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
  status: ({ item, presentation }) => <PackageStatus status={item.phase ?? item.status} view={presentation === "media" ? "chip" : "dot"} />,
  statusPlacement: "icon",
  menuStatus: ({ item }) => (
    <StatusIndicatorButton
      label={`${item.name} ${item.phase === "Ready" || item.status === "Ready" ? "Deployed" : item.phase ?? item.status ?? "Reported"}`}
      state={item.phase === "Ready" || item.status === "Ready" ? "success" : "neutral"}
      tooltip={`${item.name} ${item.phase === "Ready" || item.status === "Ready" ? "Deployed" : item.phase ?? item.status ?? "Reported"}`}
      view="text"
    />
  ),
  summary: ({ context, item }) => context.registryPackage?.tagline ?? context.registryPackage?.description ?? `Reported by Package CR in namespace ${item.namespace}.`,
  meta: ({ context, item, presentation }) => <MetaList item={item} context={context} definition={installedPackageMeta} presentation={presentation} />,
  variant: ({ item }) => (getLiveLaunchUrl(item) ? ResourceCardVariant.AppLauncher : ResourceCardVariant.Default),
  menuActions: ({ context, item }) => {
    const launchUrl = getLiveLaunchUrl(item);

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

function getInstalledPackageVersion(item: InstalledPackage, registryPackage: RegistryPackage | null) {
  return item.version ?? registryPackage?.version ?? null;
}

function getInstalledPackageTag(item: InstalledPackage, registryPackage: RegistryPackage | null) {
  const version = getInstalledPackageVersion(item, registryPackage);
  const tag = registryPackage?.latestTag ?? registryPackage?.tag ?? null;

  return tag && tag !== version ? tag : null;
}

function PackageIcon({ icon, title }: { icon: string | null; title: string }) {
  if (icon) {
    return (
      <Avatar
        alt=""
        src={icon}
        variant="rounded"
        sx={{ bgcolor: "transparent", flex: "0 0 auto", height: 48, width: 48 }}
      />
    );
  }

  return (
    <Avatar variant="rounded" sx={{ bgcolor: "var(--app-brand-bg)", flex: "0 0 auto", fontSize: 23, fontWeight: 800, height: 48, width: 48 }}>
      {title.slice(0, 1).toUpperCase()}
    </Avatar>
  );
}

function valueChips(values: Array<string | number | null | undefined>) {
  const uniqueValues = [...new Set(values.filter((value): value is string => Boolean(value)))];

  if (uniqueValues.length === 0) {
    return null;
  }

  return (
    <Stack direction="row" sx={{ alignItems: "center", flexWrap: "wrap", gap: 0.5 }}>
      {uniqueValues.map((value) => (
        <Chip key={value} label={String(value)} size="small" variant="outlined" />
      ))}
    </Stack>
  );
}

function KnownConfigChips({ pkg }: { pkg: RegistryPackage }) {
  return (
    <Stack direction="row" sx={{ alignItems: "center", flexWrap: "wrap", gap: 1 }}>
      <Typography component="strong" sx={{ color: "var(--app-text-primary)", fontWeight: 700 }}>
        Known config
      </Typography>
      {pkg.variables.map((variable) => (
        <Chip key={variable.name} label={variable.name} size="small" variant="outlined" />
      ))}
    </Stack>
  );
}

function PackageStatus({ status, view }: { status: string | null; view: "chip" | "dot" }) {
  const ready = status === "Ready";
  const state: StatusIndicatorTone = ready ? "success" : status ? "warning" : "neutral";

  return (
    <StatusIndicatorButton
      label={status ?? "Reported"}
      showIcon={view !== "chip"}
      state={state}
      tooltip={status ?? "Reported"}
      view={view}
    />
  );
}

function getLiveLaunchUrl(item: InstalledPackage) {
  return item.launchUrl && (item.phase === "Ready" || item.status === "Ready") ? item.launchUrl : null;
}

function packageKindLabel(kind: string | null): string {
  if (kind === "zarf") {
    return "PACKAGE";
  }

  return (kind ?? "package").toUpperCase();
}
