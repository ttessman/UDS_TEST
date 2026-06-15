import type { CommandState, InstalledPackage } from "@uds-poc/shared";
import {
  requestPackageInstall,
  requestPackagePublish,
  requestPackageUndeploy,
  requestPackageUnpublish
} from "../../api/uds.js";

type PackageActionController = {
  refresh: () => Promise<void>;
  setBusy: (busy: boolean) => void;
  setError: (error: string | null) => void;
  setLogs: (update: (existing: CommandState[]) => CommandState[]) => void;
};

export function usePackageActions({ refresh, setBusy, setError, setLogs }: PackageActionController) {
  async function runPackageAction(action: () => Promise<{ error?: string | null; result?: CommandState | null }>, fallbackError: string) {
    setBusy(true);
    setError(null);

    try {
      const response = await action();
      setLogs((existing) => (response.result ? [response.result, ...existing] : existing));

      if (response.error) {
        setError(response.error);
      }

      await refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : fallbackError);
    } finally {
      setBusy(false);
    }
  }

  return {
    installPackage: (packageId: string) =>
      runPackageAction(() => requestPackageInstall(packageId), "Install request failed"),
    publishPackage: () => runPackageAction(() => requestPackagePublish(), "Publish request failed"),
    undeployPackage: (pkg: InstalledPackage) =>
      runPackageAction(() => requestPackageUndeploy(pkg.namespace, pkg.name), "Undeploy request failed"),
    unpublishPackage: (packageId: string) =>
      runPackageAction(() => requestPackageUnpublish(packageId), "Unpublish request failed")
  };
}
