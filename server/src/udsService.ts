import { parse as parseYaml } from "yaml";
import { spawn, type ChildProcessWithoutNullStreams } from "node:child_process";
import { readFile } from "node:fs/promises";
import { createServer } from "node:net";
import type {
  CommandState,
  InstalledPackage,
  KnownPackageVariable,
  PackagesResponse,
  PrerequisiteStatus,
  RegistryPackage,
  ToolStatus,
  UdsStatus
} from "@uds-poc/shared";
import { commandExists, runCommand } from "./commands.js";

const DEFAULT_PACKAGE_REFS = [
  "oci://ghcr.io/defenseunicorns/packages/uds/core:latest",
  "oci://ghcr.io/defenseunicorns/packages/uds/podinfo:latest"
];

const portForwards = new Map<string, Promise<PortForwardTarget>>();

export function getPackageRefs(): string[] {
  return (process.env.UDS_REGISTRY_PACKAGE_REFS ?? DEFAULT_PACKAGE_REFS.join(","))
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function packageIdFromRef(ociReference: string): string {
  return Buffer.from(ociReference).toString("base64url");
}

export function packageRefFromId(id: string): string | null {
  try {
    return Buffer.from(id, "base64url").toString("utf8");
  } catch {
    return null;
  }
}

async function toolStatus(command: string, versionArgs: string[] = ["version"]): Promise<ToolStatus> {
  const path = await commandExists(command);
  if (!path) {
    return {
      installed: false,
      path: null,
      version: null,
      error: `${command} was not found on PATH`
    };
  }

  const version = await runCommand(command, versionArgs, { timeoutMs: 10_000 });
  return {
    installed: true,
    path,
    version: version.ok ? firstLine(version.stdout || version.stderr) : null,
    error: version.ok ? null : version.stderr || version.stdout || null
  };
}

function firstLine(value: string): string | null {
  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .find(Boolean) ?? null;
}

export async function getPrerequisites(): Promise<PrerequisiteStatus> {
  const [homebrew, uds, kubectl, docker, limactl] = await Promise.all([
    toolStatus("brew", ["--version"]),
    toolStatus("uds", ["version"]),
    toolStatus("kubectl", ["version", "--client=true"]),
    toolStatus("docker", ["version", "--format", "{{.Server.Version}}"]),
    toolStatus("limactl", ["--version"])
  ]);

  return {
    homebrew,
    uds,
    kubectl,
    containerRuntime: docker.installed && !docker.error ? docker : limactl
  };
}

export async function getUdsStatus(): Promise<UdsStatus> {
  const prerequisites = await getPrerequisites();
  const checks: CommandState[] = [];

  const zarfVersion = await runCommand("zarf", ["version"], { timeoutMs: 10_000 });
  checks.push(zarfVersion);

  const cluster = await runCommand("kubectl", ["cluster-info"], { timeoutMs: 10_000 });
  checks.push(cluster);

  const namespaces = await runCommand("kubectl", ["get", "namespace", "-o", "json"], {
    timeoutMs: 10_000
  });
  checks.push(namespaces);

  const packageCrs = await runCommand("uds", ["zarf", "tools", "kubectl", "get", "package", "-A", "-o", "json"], {
    timeoutMs: 30_000
  });
  checks.push(packageCrs);

  let coreNamespaces: string[] = [];
  if (namespaces.ok) {
    coreNamespaces = extractCoreNamespaces(namespaces.stdout);
  }

  const coreEvidence = [
    ...coreNamespaces.map((namespace) => `Namespace ${namespace}`),
    ...(packageCrs.ok ? extractCorePackageEvidence(packageCrs.stdout) : [])
  ];

  return {
    udsInstalled: prerequisites.uds.installed,
    udsVersion: prerequisites.uds.version,
    zarfVersion: zarfVersion.ok ? firstLine(zarfVersion.stdout || zarfVersion.stderr) : null,
    clusterReachable: cluster.ok,
    coreRunning: cluster.ok ? coreEvidence.length > 0 : null,
    coreEvidence,
    coreNamespaces,
    prerequisites,
    checks
  };
}

function extractCoreNamespaces(json: string): string[] {
  try {
    const parsed = JSON.parse(json) as { items?: Array<{ metadata?: { name?: string } }> };
    return (parsed.items ?? [])
      .map((item) => item.metadata?.name)
      .filter((name): name is string => Boolean(name))
      .filter((name) => name === "uds-core" || name.startsWith("uds-core-"));
  } catch {
    return [];
  }
}

function extractCorePackageEvidence(json: string): string[] {
  try {
    const parsed = JSON.parse(json) as {
      items?: Array<{
        metadata?: {
          labels?: Record<string, string | undefined>;
          name?: string;
          namespace?: string;
        };
        status?: {
          phase?: string;
          conditions?: Array<{ status?: string; type?: string }>;
        };
      }>;
    };

    return (parsed.items ?? [])
      .filter((item) => isCorePackageCr(item))
      .filter((item) => isPackageReady(item))
      .map((item) => {
        const namespace = item.metadata?.namespace ?? "default";
        const name = item.metadata?.name ?? "unknown";
        const phase = item.status?.phase ?? "Ready";
        return `Package CR ${namespace}/${name} ${phase}`;
      });
  } catch {
    return [];
  }
}

function isCorePackageCr(item: {
  metadata?: { labels?: Record<string, string | undefined>; name?: string; namespace?: string };
}): boolean {
  const name = item.metadata?.name ?? "";
  const namespace = item.metadata?.namespace ?? "";
  const zarfPackage = item.metadata?.labels?.["zarf.dev/package"] ?? "";

  return (
    name === "keycloak" ||
    name === "authservice" ||
    namespace === "keycloak" ||
    namespace === "authservice" ||
    zarfPackage === "core" ||
    zarfPackage.startsWith("core-")
  );
}

function isPackageReady(item: {
  status?: { phase?: string; conditions?: Array<{ status?: string; type?: string }> };
}): boolean {
  if (item.status?.phase === "Ready") {
    return true;
  }

  return (item.status?.conditions ?? []).some((condition) => condition.type === "Ready" && condition.status === "True");
}

export async function getRegistryPackages(): Promise<PackagesResponse> {
  const catalogUrl = process.env.UDS_REGISTRY_CATALOG_URL?.trim();
  if (catalogUrl) {
    return getRegistryCatalogPackagesFromUrl(catalogUrl);
  }

  const catalogPath = process.env.UDS_REGISTRY_CATALOG_PATH?.trim();
  if (catalogPath) {
    return getRegistryCatalogPackages(catalogPath);
  }

  const logs: CommandState[] = [];
  const packages = await Promise.all(
    getPackageRefs().map(async (ref) => {
      const inspected = await inspectPackageDefinition(ref);
      logs.push(inspected.command);
      return inspected.package;
    })
  );

  return { packages, logs };
}

async function getRegistryCatalogPackagesFromUrl(catalogUrl: string): Promise<PackagesResponse> {
  const command = `fetch registry catalog ${catalogUrl}`;
  try {
    const response = await fetch(catalogUrl, {
      headers: {
        accept: "application/json"
      }
    });

    if (!response.ok) {
      throw new Error(`${response.status} ${response.statusText}: ${await response.text()}`);
    }

    const parsed = (await response.json()) as RegistryCatalogPayload;
    const repos = registryCatalogRepos(parsed);
    return {
      packages: repos.map(packageFromRegistryCatalogRepo),
      logs: [{ ok: true, command, stdout: `Loaded ${repos.length} registry catalog repos`, stderr: "", exitCode: 0 }]
    };
  } catch (error) {
    return {
      packages: [],
      logs: [{ ok: false, command, stdout: "", stderr: (error as Error).message, exitCode: null }]
    };
  }
}

async function getRegistryCatalogPackages(catalogPath: string): Promise<PackagesResponse> {
  const readCommand = `read registry catalog ${catalogPath}`;
  try {
    const content = await readFile(catalogPath, "utf8");
    const parsed = JSON.parse(content) as RegistryCatalogPayload;
    const repos = registryCatalogRepos(parsed);

    return {
      packages: repos.map(packageFromRegistryCatalogRepo),
      logs: [
        {
          ok: true,
          command: readCommand,
          stdout: `Loaded ${repos.length} registry catalog repos`,
          stderr: "",
          exitCode: 0
        }
      ]
    };
  } catch (error) {
    return {
      packages: [],
      logs: [
        {
          ok: false,
          command: readCommand,
          stdout: "",
          stderr: (error as Error).message,
          exitCode: null
        }
      ]
    };
  }
}

async function getCatalogPackageRefs(): Promise<Set<string>> {
  const catalogUrl = process.env.UDS_REGISTRY_CATALOG_URL?.trim();
  const catalogPath = process.env.UDS_REGISTRY_CATALOG_PATH?.trim();

  if (!catalogUrl && !catalogPath) {
    return new Set();
  }

  if (catalogUrl) {
    const response = await getRegistryCatalogPackagesFromUrl(catalogUrl);
    return new Set(response.packages.map((pkg) => pkg.ociReference));
  }

  if (catalogPath) {
    const response = await getRegistryCatalogPackages(catalogPath);
    return new Set(response.packages.map((pkg) => pkg.ociReference));
  }

  return new Set();
}

function registryCatalogRepos(parsed: RegistryCatalogPayload): RegistryCatalogRepoWithOrg[] {
  if (Array.isArray(parsed)) {
    return parsed;
  }

  if (Array.isArray(parsed.repos)) {
    return parsed.repos;
  }

  return Object.entries(parsed.catalog ?? {}).flatMap(([orgKey, org]) =>
    (org.repos ?? []).map((repo) => ({
      ...repo,
      org: org.org ?? orgKey,
      orgCustomName: org.org_custom_name ?? null
    }))
  );
}

async function inspectPackageDefinition(ociReference: string): Promise<{
  command: CommandState;
  package: RegistryPackage;
}> {
  const command = await runCommand(
    "zarf",
    ["package", "inspect", "definition", ociReference, "--log-format", "json", ...localOciFlags(ociReference)],
    {
      timeoutMs: 60_000,
      env: registryEnv()
    }
  );

  const fallback = packageFromRefOnly(ociReference, command.ok ? [] : [command.stderr || command.stdout]);

  if (!command.ok) {
    return { command, package: fallback };
  }

  const definitionText = extractYamlFromCliOutput(command.stdout);
  if (!definitionText) {
    return {
      command,
      package: {
        ...fallback,
        errors: ["zarf package inspect definition succeeded, but no zarf.yaml document was detected"]
      }
    };
  }

  try {
    const definition = parseYaml(definitionText) as ZarfPackageDefinition;
    return { command, package: packageFromZarfDefinition(ociReference, definition) };
  } catch (error) {
    return {
      command,
      package: {
        ...fallback,
        errors: [`Could not parse zarf.yaml from CLI output: ${(error as Error).message}`]
      }
    };
  }
}

function registryEnv(): NodeJS.ProcessEnv {
  return {
    ...process.env,
    UDS_REGISTRY_USERNAME: process.env.UDS_REGISTRY_USERNAME ?? "",
    UDS_REGISTRY_PASSWORD: process.env.UDS_REGISTRY_PASSWORD ?? ""
  };
}

function extractYamlFromCliOutput(stdout: string): string | null {
  const lines = stripAnsi(stdout).split(/\r?\n/);
  const start = lines.findIndex((line) => /^kind:\s*ZarfPackageConfig\s*$/.test(line.trim()));
  if (start >= 0) {
    return lines.slice(start).join("\n");
  }

  const jsonLines = lines
    .map((line) => {
      try {
        return JSON.parse(line) as { msg?: string };
      } catch {
        return null;
      }
    })
    .filter((line): line is { msg?: string } => Boolean(line?.msg));

  const message = jsonLines.map((line) => line.msg).find((msg) => msg?.includes("kind: ZarfPackageConfig"));
  return message ? stripAnsi(message) : null;
}

function stripAnsi(value: string): string {
  return value.replace(/\u001b\[[0-9;]*m/g, "");
}

type ZarfPackageDefinition = {
  metadata?: {
    name?: string;
    version?: string;
    description?: string;
    architecture?: string;
    flavor?: string;
  };
  variables?: Array<{
    name?: string;
    description?: string;
    default?: string;
    required?: boolean;
  }>;
  components?: Array<{
    name?: string;
    description?: string;
    required?: boolean;
  }>;
};

type RegistryCatalogPayload =
  | RegistryCatalogRepo[]
  | {
      repos?: RegistryCatalogRepo[];
      catalog?: Record<
        string,
        {
          org?: string;
          org_custom_name?: string;
          repos?: RegistryCatalogRepo[];
        }
      >;
    };

type RegistryCatalogRepo = {
  org?: string;
  architectures?: string[];
  categories?: string;
  description?: string;
  flavors?: string[];
  icon?: string;
  kind?: string;
  latest_tag?: string;
  repo?: string;
  size?: number;
  tag_count?: number;
  tagline?: string;
  title?: string;
  last_build?: string;
  last_updated?: string;
};

type RegistryCatalogRepoWithOrg = RegistryCatalogRepo & {
  orgCustomName?: string | null;
};

function packageFromRegistryCatalogRepo(repo: RegistryCatalogRepoWithOrg): RegistryPackage {
  const packageName = repo.repo ?? repo.title ?? "unknown";
  const tag = repo.latest_tag ?? null;
  const org = repo.org ?? "airgap-store";
  const ociReference = tag
    ? `oci://registry.defenseunicorns.com/${org}/${packageName}:${tag}`
    : `oci://registry.defenseunicorns.com/${org}/${packageName}`;

  // Source: registry.defenseunicorns.com catalog payload, specifically
  // `catalog.<org>.repos[]`: title/tagline/icon/kind/repo/latest_tag/tag_count/
  // architectures/flavors/categories/last_updated/last_build/size.
  return {
    id: packageIdFromRef(ociReference),
    displayTitle: repo.title ?? packageName,
    packageName,
    kind: repo.kind ?? null,
    repoName: repo.repo ?? null,
    orgName: org,
    icon: repo.icon ?? null,
    tagline: repo.tagline ?? null,
    version: tag,
    tag,
    latestTag: tag,
    ociReference,
    registry: "registry.defenseunicorns.com",
    architecture: null,
    architectures: repo.architectures ?? [],
    flavor: null,
    flavors: repo.flavors ?? [],
    categories: splitCategories(repo.categories),
    tagCount: repo.tag_count ?? null,
    sizeBytes: repo.size ?? null,
    lastUpdated: repo.last_updated ?? null,
    lastBuild: repo.last_build ?? null,
    description: repo.description ?? null,
    authRequired: null,
    udsCoreRequired: inferCoreRequirement(packageName),
    variables: [],
    installable: Boolean(tag),
    installAction: tag
      ? {
          method: "zarf-package-deploy",
          commandPreview: zarfDeployPreview(ociReference)
        }
      : null,
    rawMetadata: repo,
    sources: ["registry-catalog", "backend-derived"],
    errors: []
  };
}

function packageFromZarfDefinition(ociReference: string, definition: ZarfPackageDefinition): RegistryPackage {
  const metadata = definition.metadata ?? {};
  const inferred = parseOciReference(ociReference);

  // Source: `zarf package inspect definition <oci ref>` returns the package `zarf.yaml`.
  // Zarf's `metadata` object is the source of packageName/version/description/architecture/flavor.
  // Zarf's top-level `variables` array is the source of known install-time configuration.
  return {
    id: packageIdFromRef(ociReference),
    displayTitle: metadata.name ?? inferred.name,
    packageName: metadata.name ?? inferred.name,
    kind: "zarf",
    repoName: inferred.name,
    orgName: null,
    icon: null,
    tagline: null,
    version: metadata.version ?? inferred.tag,
    tag: inferred.tag,
    latestTag: inferred.tag,
    ociReference,
    registry: inferred.registry,
    architecture: metadata.architecture ?? null,
    architectures: metadata.architecture ? [metadata.architecture] : [],
    flavor: metadata.flavor ?? null,
    flavors: metadata.flavor ? [metadata.flavor] : [],
    categories: [],
    tagCount: null,
    sizeBytes: null,
    lastUpdated: null,
    lastBuild: null,
    description: metadata.description ?? null,
    authRequired: null,
    udsCoreRequired: inferCoreRequirement(metadata.name ?? inferred.name),
    variables: (definition.variables ?? []).map<KnownPackageVariable>((variable) => ({
      name: variable.name ?? "unknown",
      description: variable.description ?? null,
      defaultValue: variable.default ?? null,
      required: variable.required ?? null,
      source: "zarf-package-definition"
    })),
    installable: true,
    installAction: {
      method: "zarf-package-deploy",
      commandPreview: zarfDeployPreview(ociReference)
    },
    rawMetadata: definition,
    sources: ["registry-seed", "zarf-package-definition", "backend-derived"],
    errors: []
  };
}

function packageFromRefOnly(ociReference: string, errors: string[] = []): RegistryPackage {
  const inferred = parseOciReference(ociReference);
  return {
    id: packageIdFromRef(ociReference),
    displayTitle: inferred.name,
    packageName: inferred.name,
    kind: null,
    repoName: inferred.name,
    orgName: null,
    icon: null,
    tagline: null,
    version: inferred.tag,
    tag: inferred.tag,
    latestTag: inferred.tag,
    ociReference,
    registry: inferred.registry,
    architecture: null,
    architectures: [],
    flavor: null,
    flavors: [],
    categories: [],
    tagCount: null,
    sizeBytes: null,
    lastUpdated: null,
    lastBuild: null,
    description: null,
    authRequired: null,
    udsCoreRequired: inferCoreRequirement(inferred.name),
    variables: [],
    installable: errors.length === 0,
    installAction:
      errors.length === 0
        ? {
            method: "zarf-package-deploy",
            commandPreview: zarfDeployPreview(ociReference)
          }
        : null,
    rawMetadata: null,
    sources: ["registry-seed", "backend-derived"],
    errors
  };
}

function parseOciReference(ociReference: string): { registry: string | null; name: string; tag: string | null } {
  const withoutScheme = ociReference.replace(/^oci:\/\//, "");
  const slashIndex = withoutScheme.lastIndexOf("/");
  const tagIndex = withoutScheme.lastIndexOf(":");
  const hasTag = tagIndex > slashIndex;
  const path = hasTag ? withoutScheme.slice(0, tagIndex) : withoutScheme;
  const tag = hasTag ? withoutScheme.slice(tagIndex + 1) : null;
  const parts = path.split("/");
  const registry = parts.length > 1 ? parts[0] : null;
  return {
    registry,
    name: parts.at(-1) ?? ociReference,
    tag
  };
}

function splitCategories(categories: string | undefined): string[] {
  return (categories ?? "")
    .split(",")
    .map((category) => category.trim())
    .filter(Boolean);
}

function inferCoreRequirement(name: string): boolean | null {
  if (name === "core" || name === "uds-core") {
    return false;
  }

  return null;
}

export async function getInstalledPackages(): Promise<{
  installedPackages: InstalledPackage[];
  logs: CommandState[];
}> {
  const command = await runCommand(
    "uds",
    ["zarf", "tools", "kubectl", "get", "package", "-A", "-o", "json"],
    { timeoutMs: 30_000 }
  );

  if (!command.ok) {
    return { installedPackages: [], logs: [command] };
  }

  try {
    const parsed = JSON.parse(command.stdout) as {
      items?: Array<{
        metadata?: { name?: string; namespace?: string; generation?: number };
        spec?: Record<string, unknown>;
        status?: Record<string, unknown>;
      }>;
    };

    // Source: `uds zarf tools kubectl get package -A -o json` returns Zarf Package CRs.
    // Kubernetes metadata supplies identity/namespace/generation; Package `spec` and `status`
    // are preserved as raw source data because fields can vary by Zarf version.
    const installedPackages = (parsed.items ?? []).map<InstalledPackage>((item) => {
      const endpoints = stringArray(item.status?.endpoints);

      return {
        id: `${item.metadata?.namespace ?? "default"}/${item.metadata?.name ?? "unknown"}`,
        name: item.metadata?.name ?? "unknown",
        namespace: item.metadata?.namespace ?? "default",
        version: stringOrNull(item.spec?.version) ?? stringOrNull(item.status?.version),
        generation: item.metadata?.generation ?? null,
        phase: stringOrNull(item.status?.phase),
        status: stringOrNull(item.status?.state) ?? stringOrNull(item.status?.status),
        architecture: stringOrNull(item.spec?.architecture) ?? stringOrNull(item.status?.architecture),
        endpoints,
        launchUrl: launchUrlFromPackage(item) ?? launchUrlFromEndpoint(endpoints[0]),
        sourcePackageData: item,
        sources: ["kubernetes-package-crd"]
      };
    });

    return { installedPackages, logs: [command] };
  } catch (error) {
    return {
      installedPackages: [],
      logs: [
        command,
        {
          ok: false,
          command: "JSON.parse(package CRD output)",
          stdout: "",
          stderr: (error as Error).message,
          exitCode: null
        }
      ]
    };
  }
}

function stringOrNull(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

function stringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === "string" && item.length > 0);
}

function launchUrlFromEndpoint(endpoint: string | undefined): string | null {
  if (!endpoint) {
    return null;
  }

  if (/^https?:\/\//.test(endpoint)) {
    return endpoint;
  }

  return `${process.env.UDS_APP_URL_SCHEME ?? "https"}://${endpoint}`;
}

function launchUrlFromPackage(item: {
  metadata?: { name?: string; namespace?: string };
  spec?: Record<string, unknown>;
}): string | null {
  const namespace = item.metadata?.namespace;
  const name = item.metadata?.name;
  const expose = firstExposeEntry(item.spec);

  if (!namespace || !name || !expose) {
    return null;
  }

  return `/api/uds/apps/${encodeURIComponent(namespace)}/${encodeURIComponent(name)}/proxy/`;
}

type UdsPackageExposeEntry = {
  port: number;
  service: string;
};

function firstExposeEntry(spec: Record<string, unknown> | undefined): UdsPackageExposeEntry | null {
  const network = spec?.network;
  if (!isRecord(network)) {
    return null;
  }

  const expose = network.expose;
  if (!Array.isArray(expose)) {
    return null;
  }

  const entry = expose.find((item): item is UdsPackageExposeEntry =>
    isRecord(item) && typeof item.service === "string" && typeof item.port === "number"
  );
  if (!entry) {
    return null;
  }

  return {
    port: entry.port,
    service: entry.service
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export async function getInstalledPackageProxyTarget(namespace: string, name: string): Promise<PortForwardTarget> {
  const packageCr = await getInstalledPackageCr(namespace, name);
  const expose = firstExposeEntry(packageCr.spec);

  if (!expose) {
    throw new Error(`Package ${namespace}/${name} does not expose a service`);
  }

  const key = `${namespace}/${expose.service}/${expose.port}`;
  const existing = portForwards.get(key);
  if (existing) {
    return existing;
  }

  const created = startPortForward(namespace, expose.service, expose.port);
  portForwards.set(key, created);

  try {
    return await created;
  } catch (error) {
    portForwards.delete(key);
    throw error;
  }
}

type InstalledPackageCr = {
  spec?: Record<string, unknown>;
};

async function getInstalledPackageCr(namespace: string, name: string): Promise<InstalledPackageCr> {
  const command = await runCommand("kubectl", ["-n", namespace, "get", "package", name, "-o", "json"], { timeoutMs: 30_000 });

  if (!command.ok) {
    throw new Error(command.stderr || command.stdout || `Could not read Package ${namespace}/${name}`);
  }

  return JSON.parse(command.stdout) as InstalledPackageCr;
}

type PortForwardTarget = {
  localPort: number;
  process: ChildProcessWithoutNullStreams;
};

async function startPortForward(namespace: string, service: string, remotePort: number): Promise<PortForwardTarget> {
  const localPort = await getAvailablePort();
  const child = spawn("kubectl", ["-n", namespace, "port-forward", `svc/${service}`, `${localPort}:${remotePort}`], {
    env: process.env
  });
  const target: PortForwardTarget = { localPort, process: child };

  child.once("exit", () => {
    for (const [key, value] of portForwards.entries()) {
      void value.then((current) => {
        if (current.process === child) {
          portForwards.delete(key);
        }
      });
    }
  });

  return new Promise((resolve, reject) => {
    let output = "";
    const timeout = setTimeout(() => {
      child.kill();
      reject(new Error(`Timed out starting port-forward for ${namespace}/${service}:${remotePort}`));
    }, 10_000);

    const onData = (data: Buffer) => {
      output += data.toString();
      if (output.includes("Forwarding from")) {
        clearTimeout(timeout);
        resolve(target);
      }
    };

    child.stdout.on("data", onData);
    child.stderr.on("data", onData);
    child.once("error", (error) => {
      clearTimeout(timeout);
      reject(error);
    });
    child.once("exit", (code) => {
      if (!output.includes("Forwarding from")) {
        clearTimeout(timeout);
        reject(new Error(`Port-forward for ${namespace}/${service}:${remotePort} exited with code ${code}: ${output}`));
      }
    });
  });
}

async function getAvailablePort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const server = createServer();
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      server.close(() => {
        if (typeof address === "object" && address?.port) {
          resolve(address.port);
        } else {
          reject(new Error("Could not allocate local proxy port"));
        }
      });
    });
    server.once("error", reject);
  });
}

export async function installPackage(id: string): Promise<{ command: string; result: CommandState | null; error: string | null }> {
  const ref = packageRefFromId(id);
  const catalogRefs = ref ? await getCatalogPackageRefs() : new Set<string>();
  const known = ref ? getPackageRefs().includes(ref) || catalogRefs.has(ref) : false;
  if (!ref || !known) {
    return { command: "", result: null, error: "Unknown package id" };
  }

  const args = ["package", "deploy", ref, "--confirm", ...localOciFlags(ref)];
  const command = ["zarf", ...args].join(" ");

  if (process.env.UDS_POC_ENABLE_INSTALL !== "true") {
    return {
      command,
      result: null,
      error: "Install execution is disabled. Set UDS_POC_ENABLE_INSTALL=true on the server to run this command."
    };
  }

  return {
    command,
    result: await runCommand("zarf", args, { timeoutMs: 10 * 60_000, env: registryEnv() }),
    error: null
  };
}

function zarfDeployPreview(ociReference: string): string {
  return ["zarf", "package", "deploy", ociReference, "--confirm", ...localOciFlags(ociReference)].join(" ");
}

function localOciFlags(ociReference: string): string[] {
  if (process.env.UDS_REGISTRY_PLAIN_HTTP === "false") {
    return [];
  }

  return /^oci:\/\/(localhost|127\.0\.0\.1):/.test(ociReference) ? ["--plain-http"] : [];
}
