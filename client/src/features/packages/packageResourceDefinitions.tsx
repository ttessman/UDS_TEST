import type { InstalledPackage, RegistryPackage } from "@uds-poc/shared";
import type { ReactNode } from "react";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";
import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";
import { Avatar, Button, Chip, Stack, Tooltip, Typography } from "@mui/material";
import { formatBytes, relativeAge, yesNo } from "../../lib/format.js";
import type { ResourceCardDefinition } from "../../components/card/resourceTypes/ResourceCard.js";
import type { DefinitionField } from "../../components/list/resourceTypes/DefinitionList.js";
import type { ResourceSectionDefinition } from "../../components/section/resourceTypes/ResourceSection.js";

export type RegistryPackageResourceContext = {
  disabled: boolean;
  installed: boolean;
  onInstall: (id: string) => void;
};

const registryPackageFields = [
  { key: "latestTag", label: "Latest tag", value: (pkg) => pkg.latestTag ?? pkg.version ?? pkg.tag },
  { key: "ociReference", label: "OCI reference", value: (pkg) => pkg.ociReference },
  { key: "architectures", label: "Architectures", value: (pkg) => pkg.architectures.join(", ") || pkg.architecture },
  { key: "flavors", label: "Flavors", value: (pkg) => pkg.flavors.join(", ") || pkg.flavor },
  { key: "sizeBytes", label: "Size", value: (pkg) => formatBytes(pkg.sizeBytes) },
  { key: "authRequired", label: "Auth required", value: (pkg) => (pkg.authRequired == null ? "unknown" : yesNo(pkg.authRequired)) },
  {
    key: "udsCoreRequired",
    label: "UDS Core required",
    value: (pkg) => (pkg.udsCoreRequired == null ? "unknown" : yesNo(pkg.udsCoreRequired))
  }
] satisfies Array<DefinitionField<RegistryPackage>>;

const installedPackageFields = [
  { key: "version", label: "Version", value: (pkg) => pkg.version },
  { key: "architecture", label: "Architecture", value: (pkg) => pkg.architecture },
  { key: "generation", label: "Generation", value: (pkg) => pkg.generation },
  { key: "phase", label: "Phase", value: (pkg) => pkg.phase },
  { key: "status", label: "Status", value: (pkg) => pkg.status }
] satisfies Array<DefinitionField<InstalledPackage>>;

const registryPackageResource = {
  label: ({ item }) => packageKindLabel(item.kind),
  title: ({ item }) => item.displayTitle || item.packageName,
  icon: ({ item }) => <PackageIcon icon={item.icon} title={item.displayTitle || item.packageName} />,
  status: ({ context }) => (context.installed ? <Chip color="success" label="installed" size="small" /> : null),
  summary: ({ item }) => item.tagline ?? item.description ?? "No registry description discovered.",
  meta: ({ item }) => {
    const updatedAge = relativeAge(item.lastUpdated);

    return (
      <>
        {updatedAge ? <CatalogMetric icon={<AccessTimeIcon fontSize="small" />} label={updatedAge} /> : null}
        {item.tagCount != null ? <CatalogMetric icon={<LocalOfferOutlinedIcon fontSize="small" />} label={String(item.tagCount)} /> : null}
        {item.categories.slice(0, 3).map((category) => (
          <Chip key={category} label={category} size="small" variant="outlined" />
        ))}
      </>
    );
  },
  fields: registryPackageFields,
  details: ({ item }) => (
    <>
      {item.variables.length > 0 ? <KnownConfigChips pkg={item} /> : null}
      {item.errors.length > 0 ? <pre className="stderr">{item.errors.join("\n")}</pre> : null}
    </>
  ),
  shape: {
    title: "Discovered registry/package object shape",
    value: ({ item }) => item.rawMetadata
  },
  actions: ({ item, context }) =>
    item.installable && item.installAction ? (
      <Button onClick={() => context.onInstall(item.id)} disabled={context.disabled} startIcon={<RocketLaunchIcon />} variant="contained">
        Install
      </Button>
    ) : null,
  commandPreview: ({ item }) => item.installAction?.commandPreview,
  minHeight: 270
} satisfies ResourceCardDefinition<RegistryPackage, RegistryPackageResourceContext>;

const installedPackageResource = {
  label: () => "INSTALLED PACKAGE",
  title: ({ item }) => item.name,
  status: ({ item }) => <Chip color="success" label={item.phase ?? item.status ?? "reported"} size="small" />,
  summary: ({ item }) => item.namespace,
  fields: installedPackageFields,
  shape: {
    title: "Package CR shape",
    value: ({ item }) => item.sourcePackageData
  }
} satisfies ResourceCardDefinition<InstalledPackage, undefined>;

export function registryPackagesSection(totalPackages: number) {
  return {
    title: "Airgap Store",
    resource: registryPackageResource,
    emptyMessage: "No registry packages were returned by the backend.",
    getKey: (pkg) => pkg.id,
    layout: { gridTemplateColumns: { xs: "1fr", lg: "repeat(2, minmax(0, 1fr))" } },
    loadingMessage: "Loading registry packages...",
    subtitle: (items) => (totalPackages === items.length ? undefined : `${totalPackages} total`)
  } satisfies ResourceSectionDefinition<RegistryPackage, RegistryPackageResourceContext>;
}

export const installedPackagesSection = {
  title: "Installed Packages",
  resource: installedPackageResource,
  emptyMessage: "No installed Package CRs were returned by the cluster.",
  getKey: (pkg) => pkg.id,
  loadingMessage: "Loading installed packages..."
} satisfies ResourceSectionDefinition<InstalledPackage, undefined>;

function PackageIcon({ icon, title }: { icon: string | null; title: string }) {
  if (icon) {
    return (
      <Avatar
        alt=""
        src={icon}
        variant="rounded"
        sx={{ bgcolor: "transparent", flex: "0 0 auto", height: 42, width: 42 }}
      />
    );
  }

  return (
    <Avatar variant="rounded" sx={{ bgcolor: "#1d4ed8", flex: "0 0 auto", fontWeight: 800, height: 42, width: 42 }}>
      {title.slice(0, 1).toUpperCase()}
    </Avatar>
  );
}

function CatalogMetric({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <Tooltip title={label}>
      <Stack direction="row" sx={{ alignItems: "center", color: "#cbd5e1", gap: 0.75 }}>
        {icon}
        <Typography sx={{ fontSize: 16, fontWeight: 700 }}>{label}</Typography>
      </Stack>
    </Tooltip>
  );
}

function KnownConfigChips({ pkg }: { pkg: RegistryPackage }) {
  return (
    <Stack direction="row" sx={{ alignItems: "center", flexWrap: "wrap", gap: 1 }}>
      <Typography component="strong" sx={{ color: "#e5e7eb", fontWeight: 700 }}>
        Known config
      </Typography>
      {pkg.variables.map((variable) => (
        <Chip key={variable.name} label={variable.name} size="small" variant="outlined" />
      ))}
    </Stack>
  );
}

function packageKindLabel(kind: string | null): string {
  if (kind === "zarf") {
    return "PACKAGE";
  }

  return (kind ?? "package").toUpperCase();
}
