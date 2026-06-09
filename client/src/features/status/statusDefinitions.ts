import type { UdsStatus } from "@uds-poc/shared";
import type { MetricTileListDefinition } from "../../components/list/resourceTypes/MetricTileList.js";
import { yesNo } from "../../lib/format.js";

export const udsStatusMetrics = {
  metrics: [
    { label: "UDS installed", value: (status) => yesNo(status?.udsInstalled) },
    { label: "Cluster reachable", value: (status) => yesNo(status?.clusterReachable) },
    {
      label: "UDS Core running",
      value: (status) => (status?.coreRunning == null ? "unknown" : yesNo(status.coreRunning))
    },
    { label: "UDS version", value: (status) => status?.udsVersion ?? "unknown" }
  ]
} satisfies MetricTileListDefinition<UdsStatus | null>;
