import type {
  InstallResponse,
  InstalledPackagesResponse,
  PackagesResponse,
  PublishResponse,
  UndeployResponse as UninstallResponse,
  UnpublishResponse,
  UdsStatus
} from "@uds-poc/shared";

async function getJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, init);
  const payload: unknown = await response.json();

  if (!response.ok) {
    const message =
      typeof payload === "object" && payload !== null && "error" in payload
        ? String((payload as { error: unknown }).error)
        : `Request failed: ${response.status}`;
    throw new Error(message);
  }

  return payload as T;
}

export function getUdsStatus(): Promise<UdsStatus> {
  return getJson<UdsStatus>("/api/uds/status");
}

export function getRegistryPackages(): Promise<PackagesResponse> {
  return getJson<PackagesResponse>("/api/uds/packages");
}

export function getInstalledPackages(): Promise<InstalledPackagesResponse> {
  return getJson<InstalledPackagesResponse>("/api/uds/installed-packages");
}

export function requestPackageInstall(id: string): Promise<InstallResponse> {
  return getJson<InstallResponse>(`/api/uds/packages/${encodeURIComponent(id)}/install`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ confirm: true })
  });
}

export function requestPackagePublish(): Promise<PublishResponse> {
  return getJson<PublishResponse>("/api/uds/packages/publish", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ packageName: "catalog-poc" })
  });
}

export function requestPackageUnpublish(id: string): Promise<UnpublishResponse> {
  return getJson<UnpublishResponse>(`/api/uds/packages/${encodeURIComponent(id)}/unpublish`, {
    method: "POST"
  });
}

export function requestPackageUninstall(namespace: string, name: string): Promise<UninstallResponse> {
  return getJson<UninstallResponse>(
    `/api/uds/installed-packages/${encodeURIComponent(namespace)}/${encodeURIComponent(name)}/undeploy`,
    { method: "POST" }
  );
}
