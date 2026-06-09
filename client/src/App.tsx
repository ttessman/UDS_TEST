import { useEffect, useMemo, useState } from "react";
import { Alert, Box, Button, Container, Divider, Stack, TextField, Typography } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import type { CommandState, InstalledPackage, RegistryPackage, UdsStatus } from "@uds-poc/shared";
import {
  getInstalledPackages,
  getRegistryPackages,
  getUdsStatus,
  requestPackageInstall
} from "./api/uds.js";
import { MetricTileList } from "./components/list/resourceTypes/MetricTileList.js";
import { ResourceSection } from "./components/section/resourceTypes/ResourceSection.js";
import { ListSection } from "./components/section/resourceTypes/ListSection.js";
import { commandLogsSection } from "./features/logs/logDefinitions.js";
import { installedPackagesSection, registryPackagesSection } from "./features/packages/packageResourceDefinitions.js";
import { udsStatusMetrics } from "./features/status/statusDefinitions.js";

export function App() {
  const [status, setStatus] = useState<UdsStatus | null>(null);
  const [packages, setPackages] = useState<RegistryPackage[]>([]);
  const [installedPackages, setInstalledPackages] = useState<InstalledPackage[]>([]);
  const [logs, setLogs] = useState<CommandState[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [packageQuery, setPackageQuery] = useState("");

  async function refresh() {
    setBusy(true);
    setError(null);

    try {
      const [nextStatus, registry, installed] = await Promise.all([
        getUdsStatus(),
        getRegistryPackages(),
        getInstalledPackages()
      ]);

      setStatus(nextStatus);
      setPackages(registry.packages);
      setInstalledPackages(installed.installedPackages);
      setLogs([...nextStatus.checks, ...registry.logs, ...installed.logs]);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unknown frontend error");
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  const installedNames = useMemo(
    () => new Set(installedPackages.map((item) => item.name.toLowerCase())),
    [installedPackages]
  );

  const filteredPackages = useMemo(() => {
    const query = packageQuery.trim().toLowerCase();
    if (!query) {
      return packages;
    }

    return packages.filter((pkg) =>
      [
        pkg.displayTitle,
        pkg.packageName,
        pkg.repoName,
        pkg.kind,
        pkg.tagline,
        pkg.description,
        pkg.latestTag,
        ...pkg.categories,
        ...pkg.architectures,
        ...pkg.flavors
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query))
    );
  }, [packageQuery, packages]);

  async function installPackage(packageId: string) {
    setBusy(true);
    setError(null);

    try {
      const response = await requestPackageInstall(packageId);
      setLogs((existing) => (response.result ? [response.result, ...existing] : existing));

      if (response.error) {
        setError(response.error);
      }

      await refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Install request failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Container component="main" maxWidth="xl" sx={{ py: 5 }}>
      <Box
        sx={{
          alignItems: { xs: "stretch", md: "center" },
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          gap: 2.5,
          justifyContent: "space-between",
          mb: 3
        }}
      >
        <Box>
          <Typography component="h1" sx={{ fontSize: 42, fontWeight: 900, letterSpacing: 0, lineHeight: 1.1 }}>
            App Catalog
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 0.5 }}>
            UDS Registry package metadata, local cluster state, and install readiness.
          </Typography>
        </Box>
        <Stack direction={{ xs: "column", sm: "row" }} sx={{ gap: 1.5, minWidth: { md: 520 } }}>
          <TextField
            aria-label="Search packages"
            onChange={(event) => setPackageQuery(event.target.value)}
            placeholder="Search"
            size="small"
            slotProps={{
              input: {
                startAdornment: <SearchIcon sx={{ color: "text.secondary", mr: 1 }} />
              }
            }}
            value={packageQuery}
          />
          <Button onClick={() => void refresh()} disabled={busy} variant="outlined">
            {busy ? "Refreshing" : "Refresh"}
          </Button>
        </Stack>
      </Box>
      <Divider sx={{ borderColor: "#334155", mb: 3 }} />

      <Stack sx={{ gap: 3.25 }}>
        {error ? <Alert severity="error">{error}</Alert> : null}

        <MetricTileList item={status} definition={udsStatusMetrics} />
        <ResourceSection
          items={filteredPackages}
          definition={registryPackagesSection(packages.length)}
          context={(pkg) => ({
            disabled: busy,
            installed: installedNames.has(pkg.packageName.toLowerCase()),
            onInstall: (id: string) => void installPackage(id)
          })}
          state={busy && filteredPackages.length === 0 ? "loading" : "ready"}
        />
        <ResourceSection
          items={installedPackages}
          definition={installedPackagesSection}
          context={() => undefined}
          state={busy && installedPackages.length === 0 ? "loading" : "ready"}
        />
        <ListSection
          items={logs}
          definition={commandLogsSection}
          context={undefined}
          state={busy && logs.length === 0 ? "loading" : "ready"}
        />
      </Stack>
    </Container>
  );
}
