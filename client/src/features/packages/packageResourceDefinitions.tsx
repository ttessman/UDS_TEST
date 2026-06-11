import type { InstalledPackage, RegistryPackage } from "@uds-poc/shared";
import { Avatar, Box, Chip, Stack, Typography } from "@mui/material";
import { formatBytes, relativeAge, yesNo } from "../../lib/format.js";
import { ActionButton } from "../../components/button/resourceTypes/ActionButton.js";
import type { ResourceCardDefinition } from "../../components/card/resourceTypes/ResourceCard.js";
import type { DefinitionField } from "../../components/list/resourceTypes/DefinitionList.js";
import { MetaList, type MetaListDefinition } from "../../components/list/resourceTypes/MetaList.js";
import { StatusIndicatorButton } from "../../components/button/resourceTypes/StatusIndicatorButton.js";
import type { StatusIndicatorTone } from "../../components/status/status.types.js";

export type RegistryPackageResourceContext = {
  disabled: boolean;
  installed: boolean;
  onInstall: (id: string) => void;
};

export type InstalledPackageResourceContext = {
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
  { key: "architecture", label: "Architecture", value: (pkg) => valueChips([pkg.architecture]) },
  { key: "generation", label: "Generation", value: (pkg) => pkg.generation },
  { key: "phase", label: "Phase", value: (pkg) => pkg.phase },
  { key: "status", label: "Status", value: (pkg) => pkg.status }
] satisfies Array<DefinitionField<InstalledPackage>>;

const registryPackageMeta = {
  omitEmptyValues: true,
  fields: [
    {
      key: "lastUpdated",
      icon: "packageUpdated",
      tooltip: ({ value }) => `Last updated ${value}`,
      value: ({ item }) => relativeAge(item.lastUpdated)
    },
    {
      key: "tagCount",
      icon: "packageTags",
      tooltip: ({ item, value }) =>
        item.tagCount != null
          ? `${item.tagCount} tag${item.tagCount === 1 ? "" : "s"}`
          : item.latestTag
            ? `Latest tag: ${item.latestTag}`
            : `Tag: ${value}`,
      value: ({ item }) => item.tagCount ?? item.latestTag ?? item.version ?? item.tag
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
      key: "generation",
      icon: "packageUpdated",
      tooltip: ({ item }) => `Kubernetes metadata.generation ${item.generation}`,
      value: ({ item }) => (item.generation == null ? null : `gen ${item.generation}`)
    }
  ]
} satisfies MetaListDefinition<InstalledPackage, InstalledPackageResourceContext>;

export const registryPackageResource = {
  label: ({ item }) => packageKindLabel(item.kind),
  title: ({ item }) => item.displayTitle || item.packageName,
  icon: ({ item }) => <PackageIcon icon={item.icon} title={item.displayTitle || item.packageName} />,
  status: ({ context }) => (context.installed ? <Chip color="success" label="installed" size="small" /> : null),
  summary: ({ item }) => item.tagline ?? item.description ?? "No registry description discovered.",
  meta: ({ context, item }) => <MetaList item={item} context={context} definition={registryPackageMeta} />,
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
  actions: ({ item, context }) =>
    item.installable && item.installAction ? (
      <ActionButton disabled={context.disabled} icon="install" label="Install" onClick={() => context.onInstall(item.id)} variant="contained" />
    ) : null,
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
  status: ({ item }) => <PackageStatusDot status={item.phase ?? item.status} />,
  statusPlacement: "icon",
  summary: ({ context, item }) => context.registryPackage?.tagline ?? context.registryPackage?.description ?? `Reported by Package CR in namespace ${item.namespace}.`,
  meta: ({ context, item }) => <MetaList item={item} context={context} definition={installedPackageMeta} />,
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

function PackageStatusDot({ status }: { status: string | null }) {
  const ready = status === "Ready";
  const state: StatusIndicatorTone = ready ? "success" : status ? "warning" : "neutral";

  return (
    <Box
      sx={{
        bgcolor: "background.paper",
        border: "2px solid",
        borderColor: "background.paper",
        borderRadius: "999px",
        display: "flex"
      }}
    >
      <StatusIndicatorButton
        iconOnly
        label={status ?? "Reported"}
        state={state}
        tooltip={status ?? "Reported"}
      />
    </Box>
  );
}

function packageKindLabel(kind: string | null): string {
  if (kind === "zarf") {
    return "PACKAGE";
  }

  return (kind ?? "package").toUpperCase();
}
