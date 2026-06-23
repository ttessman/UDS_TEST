import { StatusIndicatorButton } from "@uds-poc/shared-ui/components/button/resourceTypes/StatusIndicatorButton";
import type { StatusIndicatorTone } from "@uds-poc/shared-ui/components/status/status.types";

export function PackageStatus({ status, view }: { status: string | null; view: "chip" | "dot" }) {
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
