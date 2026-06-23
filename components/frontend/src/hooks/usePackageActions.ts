import type { CommandState, InstalledPackage } from "@uds-poc/shared";
import {
  requestPackageInstall,
  requestPackagePublish,
  requestPackageUninstall,
  requestPackageUnpublish
} from "../api/uds.js";
import {
  packageActionDefinitions,
  type PackageActionId
} from "../types/packageDefinitions.js";

type PackageActionController = {
  refresh: () => Promise<void>;
  setBusy: (busy: boolean) => void;
  setError: (error: string | null) => void;
  setLogs: (update: (existing: CommandState[]) => CommandState[]) => void;
};

type PackageActionResponse = {
  error?: string | null;
  result?: CommandState | null;
};

export function usePackageActions({ refresh, setBusy, setError, setLogs }: PackageActionController) {
  async function submitPackageAction(action: PackageActionId, request: () => Promise<PackageActionResponse>) {
    setBusy(true);
    setError(null);

    try {
      const response = await request();
      setLogs((existing) => (response.result ? [response.result, ...existing] : existing));

      if (response.error) {
        setError(response.error);
      }

      await refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : packageActionDefinitions[action].failureMessage);
    } finally {
      setBusy(false);
    }
  }

  return {
    install: (packageId: string) =>
      submitPackageAction("install", () => requestPackageInstall(packageId)),
    publish: () =>
      submitPackageAction("publish", () => requestPackagePublish()),
    uninstall: (pkg: InstalledPackage) =>
      submitPackageAction("uninstall", () => requestPackageUninstall(pkg.namespace, pkg.name)),
    unpublish: (packageId: string) =>
      submitPackageAction("unpublish", () => requestPackageUnpublish(packageId))
  };
}
