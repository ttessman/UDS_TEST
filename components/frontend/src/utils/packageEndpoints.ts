import type { InstalledPackage } from "@uds-poc/shared";

export function getLiveLaunchUrl(item: InstalledPackage) {
  return item.launchUrl && isInstalledPackageReady(item) ? item.launchUrl : null;
}

export function endpointLaunchActions(item: InstalledPackage, onOpen: (url: string) => void) {
  if (!isInstalledPackageReady(item)) {
    return [];
  }

  return getLaunchEndpoints(item).map((endpoint) => {
    const url = endpointUrl(endpoint);
    return {
      icon: "open" as const,
      label: `Open ${endpointLabel(endpoint)}`,
      onSelect: () => onOpen(url)
    };
  });
}

export function getLaunchEndpoints(item: InstalledPackage) {
  const launchEndpoints = "launchEndpoints" in item && Array.isArray(item.launchEndpoints) ? item.launchEndpoints : [];

  return launchEndpoints.length > 0 ? launchEndpoints : item.launchUrl ? [item.launchUrl] : [];
}

export function endpointUrl(endpoint: string) {
  return /^https?:\/\//.test(endpoint) ? endpoint : `https://${endpoint}`;
}

export function endpointLabel(endpoint: string) {
  const host = endpoint.replace(/^https?:\/\//, "").replace(/\/$/, "");

  if (host.startsWith("app.")) {
    return "Frontend";
  }

  if (host.startsWith("api.")) {
    return "API";
  }

  if (host.startsWith("docs.")) {
    return "Docs";
  }

  return host;
}

export function isInstalledPackageReady(item: InstalledPackage) {
  return item.phase === "Ready" || item.status === "Ready";
}
