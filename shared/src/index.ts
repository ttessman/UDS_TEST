export type CommandState = {
  ok: boolean;
  command: string;
  stdout: string;
  stderr: string;
  exitCode: number | null;
};

export type PrerequisiteStatus = {
  homebrew: ToolStatus;
  uds: ToolStatus;
  kubectl: ToolStatus;
  containerRuntime: ToolStatus;
};

export type ToolStatus = {
  installed: boolean;
  path: string | null;
  version: string | null;
  error: string | null;
};

export type UdsStatus = {
  udsInstalled: boolean;
  udsVersion: string | null;
  zarfVersion: string | null;
  clusterReachable: boolean;
  coreRunning: boolean | null;
  /** Source: backend-derived from UDS Core namespaces and Package CRs observed in the active cluster. */
  coreEvidence: string[];
  coreNamespaces: string[];
  prerequisites: PrerequisiteStatus;
  checks: CommandState[];
};

export type MetadataSource =
  | "zarf-package-definition"
  | "uds-bundle-inspect"
  | "kubernetes-package-crd"
  | "registry-catalog"
  | "registry-seed"
  | "backend-derived";

export type KnownPackageVariable = {
  /** Source: zarf.yaml top-level `variables[]` from `zarf package inspect definition`. */
  name: string;
  description: string | null;
  defaultValue: string | null;
  required: boolean | null;
  source: MetadataSource;
};

export type RegistryPackage = {
  id: string;
  /** Source: registry catalog `title` when available; otherwise backend-derived from packageName. */
  displayTitle: string;
  /** Source: zarf.yaml `metadata.name`; falls back to the OCI ref basename when inspection fails. */
  packageName: string;
  /** Source: registry catalog `kind` when available, e.g. `zarf`; otherwise unknown. */
  kind: string | null;
  /** Source: registry catalog `repo` when available. */
  repoName: string | null;
  /** Source: registry catalog outer `catalog.<org>.org` key when available. */
  orgName: string | null;
  /** Source: registry catalog `icon` data URI/URL when available. */
  icon: string | null;
  /** Source: registry catalog `tagline` when available. */
  tagline: string | null;
  /** Source: zarf.yaml `metadata.version`; falls back to the OCI tag when present. */
  version: string | null;
  tag: string | null;
  /** Source: registry catalog `latest_tag` when available. */
  latestTag: string | null;
  /** Source: configured registry seed OCI ref, later replaced by registry indexing. */
  ociReference: string;
  registry: string | null;
  /** Source: zarf.yaml `metadata.architecture` if emitted by the inspected package. */
  architecture: string | null;
  /** Source: registry catalog `architectures[]` when available. */
  architectures: string[];
  /** Source: zarf.yaml `metadata.flavor` if emitted by the inspected package. */
  flavor: string | null;
  /** Source: registry catalog `flavors[]` when available. */
  flavors: string[];
  /** Source: registry catalog `categories` when available. */
  categories: string[];
  /** Source: registry catalog `tag_count` when available. */
  tagCount: number | null;
  /** Source: registry catalog `size` when available. */
  sizeBytes: number | null;
  /** Source: registry catalog `last_updated` when available. */
  lastUpdated: string | null;
  /** Source: registry catalog `last_build` when available. */
  lastBuild: string | null;
  /** Source: zarf.yaml `metadata.description` if present. */
  description: string | null;
  /** Unknown unless a registry/index API or auth challenge explicitly reports it. */
  authRequired: boolean | null;
  /** Backend-derived only for obvious UDS Core packages; otherwise unknown until package policy is inspected. */
  udsCoreRequired: boolean | null;
  /** Source: zarf.yaml top-level `variables[]` when discoverable. */
  variables: KnownPackageVariable[];
  installable: boolean;
  /** Source: backend-derived command from the package kind and OCI reference. */
  installAction: {
    method: "uds-deploy" | "zarf-package-deploy" | "unknown";
    commandPreview: string;
  } | null;
  /** Source: raw parsed zarf.yaml or bundle metadata preserved for future modeling. */
  rawMetadata: unknown;
  sources: MetadataSource[];
  errors: string[];
};

export type InstalledPackage = {
  id: string;
  /** Source: Kubernetes Package CR `metadata.name` from `uds zarf tools kubectl get package -A -o json`. */
  name: string;
  /** Source: Kubernetes Package CR `metadata.namespace`. */
  namespace: string;
  /** Source: Kubernetes Package CR `spec.version` or `status.version` when present. */
  version: string | null;
  generation: number | null;
  /** Source: Kubernetes Package CR `status.phase` when present. */
  phase: string | null;
  /** Source: Kubernetes Package CR `status.state` or `status.status` when present. */
  status: string | null;
  /** Source: Kubernetes Package CR `spec.architecture` or `status.architecture` when present. */
  architecture: string | null;
  /** Source: UDS Package CR `status.endpoints[]` when present. */
  endpoints: string[];
  /** Backend-derived launch URL from the first UDS Package CR endpoint. */
  launchUrl: string | null;
  /** Source: full Kubernetes Package CR item preserved because Zarf CR fields vary by version. */
  sourcePackageData: unknown;
  sources: MetadataSource[];
};

export type HealthResponse = {
  ok: true;
  service: string;
  time: string;
};

export type PackagesResponse = {
  packages: RegistryPackage[];
  logs: CommandState[];
};

export type InstalledPackagesResponse = {
  installedPackages: InstalledPackage[];
  logs: CommandState[];
};

export type InstallRequestBody = {
  confirm?: boolean;
  variables?: Record<string, string>;
};

export type InstallResponse = {
  accepted: boolean;
  packageId: string;
  command: string;
  result: CommandState | null;
  error: string | null;
};
