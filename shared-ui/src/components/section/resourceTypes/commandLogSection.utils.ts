import type { CommandState } from "@uds-poc/shared";
import { trimOutput } from "../../../lib/format.js";

export type CommandSummary = {
  description: string;
  fields: Array<[string, string]>;
  message: string | null;
  tone: "success" | "error" | "warning" | "info" | "neutral";
  title: string;
};

export function summarizeCommand(log: CommandState): CommandSummary {
  if (log.command === "zarf version") {
    return {
      description: "Checks the bundled Zarf CLI version used by UDS.",
      fields: [["Version", trimOutput(log.stdout) || "Not reported"]],
      message: log.ok ? null : firstErrorMessage(log),
      tone: log.ok ? "success" : "error",
      title: "Zarf version"
    };
  }

  if (log.command === "kubectl cluster-info") {
    const lines = trimOutput(log.stdout).split("\n").filter(Boolean);
    return {
      description: "Verifies the current kubeconfig can reach the local Kubernetes cluster.",
      fields: [
        ["Control plane", findLineValue(lines, "Kubernetes control plane is running at") ?? "Not reported"],
        ["CoreDNS", findLineValue(lines, "CoreDNS is running at") ?? "Not reported"],
        ["Metrics", findLineValue(lines, "Metrics-server is running at") ?? "Not reported"]
      ],
      message: log.ok ? null : firstErrorMessage(log),
      tone: log.ok ? "success" : "error",
      title: "Cluster reachability"
    };
  }

  if (log.command === "kubectl config current-context") {
    return {
      description: "Reads the active kubeconfig context used by kubectl.",
      fields: [["Context", trimOutput(log.stdout) || "Not reported"]],
      message: log.ok ? null : firstErrorMessage(log),
      tone: log.ok ? "success" : "error",
      title: "Cluster context"
    };
  }

  if (log.command === "kubectl get namespace -o json") {
    const count = readJsonItemCount(log.stdout);
    return {
      description: "Reads namespaces to look for UDS Core namespace evidence.",
      fields: [["Namespaces", count == null ? "Not parsed" : String(count)]],
      message: log.ok ? null : firstErrorMessage(log),
      tone: log.ok ? "success" : "error",
      title: "Namespace inventory"
    };
  }

  if (log.command === "uds zarf tools kubectl get package -A -o json") {
    const count = readJsonItemCount(log.stdout);
    return {
      description: "Reads installed UDS Package custom resources from the active cluster.",
      fields: [["Installed packages", count == null ? "Not parsed" : String(count)]],
      message: log.ok ? null : firstErrorMessage(log),
      tone: log.ok ? "success" : "error",
      title: "Installed package inventory"
    };
  }

  if (log.command.startsWith("zarf package inspect definition")) {
    const registryRef = log.command.replace("zarf package inspect definition ", "").replace(" --log-format json", "");
    return {
      description: log.ok
        ? "Read package metadata from the registry for catalog modeling."
        : "Registry metadata could not be read. The catalog card falls back to the OCI ref only.",
      fields: [["Registry ref", registryRef]],
      message: firstErrorMessage(log),
      tone: log.ok ? "success" : "error",
      title: "Registry package inspection"
    };
  }

  return {
    description: "Backend command executed by the local Express API.",
    fields: [["Command", log.command]],
    message: log.ok ? null : firstErrorMessage(log),
    tone: log.ok ? "success" : "error",
    title: log.command
  };
}

function readJsonItemCount(value: string): number | null {
  try {
    const parsed = JSON.parse(value || "{}") as { items?: unknown[] };
    return Array.isArray(parsed.items) ? parsed.items.length : null;
  } catch {
    return null;
  }
}

function findLineValue(lines: string[], prefix: string): string | null {
  const line = lines.find((item) => item.startsWith(prefix));

  return line?.slice(prefix.length).trim() ?? null;
}

function firstErrorMessage(log: CommandState): string | null {
  const raw = trimOutput(log.stderr) || trimOutput(log.stdout);

  if (!raw) {
    return log.ok ? null : "Command failed without output.";
  }

  try {
    const parsed = JSON.parse(raw) as { msg?: string };
    return parsed.msg ?? raw;
  } catch {
    return raw.split("\n")[0] ?? raw;
  }
}
