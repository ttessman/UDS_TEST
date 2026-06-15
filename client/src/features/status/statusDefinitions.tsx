import type { UdsStatus } from "@uds-poc/shared";
import { Box, Stack, Typography } from "@mui/material";
import type {
  StatusIndicatorListDefinition,
  StatusIndicatorTone
} from "../../components/list/resourceTypes/StatusIndicatorList.js";
import { yesNo } from "../../lib/format.js";

export const udsStatusIndicators = {
  modalTitle: "UDS Environment Status",
  items: [
    {
      key: "udsInstalled",
      label: "UDS CLI",
      state: ({ item }) => booleanState(item?.udsInstalled),
      value: () => null,
      tooltip: ({ item }) => toolTooltip("UDS CLI", item?.udsInstalled, item?.udsVersion),
      details: ({ item }) => (
        <StatusDetail
          lines={[
            ["Installed", yesNo(item?.udsInstalled)],
            ["Version", item?.udsVersion ?? "Not discovered"],
            ["Path", item?.prerequisites.uds.path ?? "Not discovered"]
          ]}
        />
      )
    },
    {
      key: "clusterReachable",
      label: "Cluster",
      state: ({ item }) => booleanState(item?.clusterReachable),
      value: () => null,
      tooltip: ({ item }) => (item?.clusterReachable ? "Current kubeconfig can reach Kubernetes." : "Kubernetes is not reachable."),
      details: ({ item }) => (
        <StatusDetail
          lines={[
            ["Context", item?.clusterName ?? "Not discovered"],
            ["Reachable", yesNo(item?.clusterReachable)],
            ["kubectl", item?.prerequisites.kubectl.path ?? "Not discovered"],
            ["kubectl version", item?.prerequisites.kubectl.version ?? "Not discovered"]
          ]}
        />
      )
    },
    {
      key: "coreRunning",
      label: "UDS Core",
      state: ({ item }) => nullableBooleanState(item?.coreRunning),
      value: ({ item }) => (item?.coreRunning == null ? "unknown" : null),
      tooltip: ({ item }) => {
        if (item?.coreRunning) {
          return "UDS Core evidence was found in the active cluster.";
        }

        if (item?.coreRunning === false) {
          return "UDS Core evidence was not found in the active cluster.";
        }

        return "UDS Core status has not been checked yet.";
      },
      details: ({ item }) => (
        <StatusDetail
          lines={[
            ["Running", item?.coreRunning == null ? "Unknown" : yesNo(item.coreRunning)],
            ["Evidence", item?.coreEvidence.join(", ") || "No evidence discovered"],
            ["Namespaces", item?.coreNamespaces.join(", ") || "No namespaces discovered"]
          ]}
        />
      )
    },
    {
      key: "registry",
      label: "Registry",
      state: ({ item }) => (item?.registry.packageRefCount || item?.registry.catalogPath || item?.registry.catalogUrl ? "success" : "warning"),
      value: ({ item }) => registrySourceLabel(item?.registry.source),
      tooltip: ({ item }) => {
        if (!item?.registry) {
          return "Registry source has not been checked yet.";
        }

        return `Package source: ${registrySourceLabel(item.registry.source)}`;
      },
      details: ({ item }) => (
        <StatusDetail
          lines={[
            ["Source", registrySourceLabel(item?.registry.source)],
            ["Catalog URL", item?.registry.catalogUrl ?? "Not configured"],
            ["Catalog path", item?.registry.catalogPath ?? "Not configured"],
            ["Package refs", String(item?.registry.packageRefCount ?? 0)],
            ["Plain HTTP", yesNo(item?.registry.plainHttp)],
            ["Auth configured", yesNo(item?.registry.authConfigured)]
          ]}
        />
      )
    },
    {
      key: "evidence",
      label: "Core signals",
      state: ({ item }) => (item?.coreEvidence.length ? "success" : "warning"),
      value: ({ item }) => String(item?.coreEvidence.length ?? 0),
      tooltip: ({ item }) => `${item?.coreEvidence.length ?? 0} Core evidence item(s) discovered.`,
      details: ({ item }) => <StatusTextList items={item?.coreEvidence ?? []} empty="No Core evidence discovered." />
    },
    {
      key: "zarf",
      label: "Zarf",
      state: ({ item }) => booleanState(item?.zarfVersion != null),
      value: ({ item }) => item?.zarfVersion ?? "missing",
      tooltip: ({ item }) => toolTooltip("Zarf CLI", item?.zarfVersion != null, item?.zarfVersion),
      details: ({ item }) => (
        <StatusDetail
          lines={[
            ["Installed", yesNo(item?.zarfVersion != null)],
            ["Version", item?.zarfVersion ?? "Not discovered"]
          ]}
        />
      )
    }
  ]
} satisfies StatusIndicatorListDefinition<UdsStatus | null>;

function booleanState(value: boolean | null | undefined): StatusIndicatorTone {
  return value ? "success" : "error";
}

function nullableBooleanState(value: boolean | null | undefined): StatusIndicatorTone {
  if (value == null) {
    return "neutral";
  }

  return value ? "success" : "error";
}

function toolTooltip(name: string, installed: boolean | null | undefined, version: string | null | undefined) {
  if (!installed) {
    return `${name} was not discovered.`;
  }

  return version ? `${name} discovered: ${version}` : `${name} discovered.`;
}

function registrySourceLabel(source: UdsStatus["registry"]["source"] | null | undefined) {
  if (source === "catalog-url") {
    return "catalog URL";
  }

  if (source === "catalog-path") {
    return "catalog file";
  }

  return "package refs";
}

function StatusDetail({ lines }: { lines: Array<[string, string]> }) {
  return (
    <Box component="dl" sx={{ display: "grid", gap: 0.75, m: 0 }}>
      {lines.map(([label, value]) => (
        <Box key={label} sx={{ display: "grid", gap: 0.75, gridTemplateColumns: "120px minmax(0, 1fr)" }}>
          <Typography color="text.secondary" component="dt" sx={{ fontSize: 13 }}>
            {label}
          </Typography>
          <Typography component="dd" sx={{ fontSize: 13, m: 0, overflowWrap: "anywhere" }}>
            {value}
          </Typography>
        </Box>
      ))}
    </Box>
  );
}

function StatusTextList({ empty, items }: { empty: string; items: string[] }) {
  if (items.length === 0) {
    return (
      <Typography color="text.secondary" sx={{ fontSize: 13 }}>
        {empty}
      </Typography>
    );
  }

  return (
    <Stack component="ul" sx={{ gap: 0.5, m: 0, pl: 2 }}>
      {items.map((item) => (
        <Typography component="li" key={item} sx={{ fontSize: 13, overflowWrap: "anywhere" }}>
          {item}
        </Typography>
      ))}
    </Stack>
  );
}
