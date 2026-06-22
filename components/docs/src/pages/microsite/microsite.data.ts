import type {
  ArchitectureNode,
  NavItem,
  PlatformNode,
  ProblemCard,
  ProofCard,
  SolutionStep
} from "./microsite.types";
import type { InstalledPackage } from "@uds-poc/shared";

export const learnNav: NavItem[] = [
  { href: "/learn/quickstart", label: "Quickstart" },
  { href: "/learn/product-model", label: "Product Model" },
  { href: "/learn/user-journeys", label: "User Journeys" },
  { href: "/learn/architecture", label: "Architecture" },
  { href: "/learn/components", label: "Components" },
  { href: "/learn/kubernetes-runbook", label: "Kubernetes Runbook" },
  { href: "/learn/commands", label: "Commands" }
];

export const referenceNav: NavItem[] = [
  { href: "/learn/uds-notes", label: "macOS UDS Workaround" },
  { href: "/learn/frontend-architecture", label: "Frontend Architecture" },
  { href: "/learn/project-requirements", label: "Project Requirements" },
  { href: "/learn/history-notes", label: "History & Notes" }
];

// Static microsite proof data. The live frontend uses backend/cluster state for installed resources.
export const installedResources: InstalledPackage[] = [
  {
    architecture: "arm64",
    endpoints: ["https://app.uds.dev", "https://api.uds.dev"],
    generation: 1,
    id: "uds-poc/uds-poc",
    lastUpdated: "2026-06-18T12:46:00.000Z",
    launchEndpoints: ["https://app.uds.dev"],
    launchUrl: "https://app.uds.dev",
    name: "uds-poc",
    namespace: "uds-poc",
    phase: "Ready",
    sourcePackageData: { metadata: { name: "uds-poc", namespace: "uds-poc" } },
    sources: ["kubernetes-package-crd", "backend-derived"],
    status: "Installed",
    version: "0.1.0"
  },
  {
    architecture: "arm64",
    endpoints: ["https://docs.uds.dev"],
    generation: 1,
    id: "docs/docs",
    lastUpdated: "2026-06-18T12:45:00.000Z",
    launchEndpoints: ["https://docs.uds.dev"],
    launchUrl: "https://docs.uds.dev",
    name: "docs",
    namespace: "docs",
    phase: "Ready",
    sourcePackageData: { metadata: { name: "docs", namespace: "docs" } },
    sources: ["kubernetes-package-crd", "backend-derived"],
    status: "Installed",
    version: "0.1.0"
  },
  {
    architecture: "arm64",
    endpoints: ["https://catalog-poc.uds.dev"],
    generation: 1,
    id: "catalog-poc/catalog-poc",
    lastUpdated: "2026-06-18T12:48:00.000Z",
    launchEndpoints: ["https://catalog-poc.uds.dev"],
    launchUrl: "https://catalog-poc.uds.dev",
    name: "catalog-poc",
    namespace: "catalog-poc",
    phase: "Ready",
    sourcePackageData: { metadata: { name: "catalog-poc", namespace: "catalog-poc" } },
    sources: ["kubernetes-package-crd", "backend-derived"],
    status: "Installed",
    version: "0.1.0"
  },
  {
    architecture: "arm64",
    endpoints: ["https://sso.uds.dev", "https://keycloak.admin.uds.dev"],
    generation: 1,
    id: "keycloak/keycloak",
    lastUpdated: "2026-06-18T12:42:00.000Z",
    launchEndpoints: ["https://sso.uds.dev"],
    launchUrl: "https://sso.uds.dev",
    name: "keycloak",
    namespace: "keycloak",
    phase: "Ready",
    sourcePackageData: { metadata: { name: "keycloak", namespace: "keycloak" } },
    sources: ["kubernetes-package-crd"],
    status: "Installed",
    version: "v24.0.4"
  }
];

export const valueProps: SolutionStep[] = [
  { title: "Live package data", text: "from UDS / Zarf", icon: "package" },
  { title: "Secure by design", text: "backend owns UDS", icon: "shield" },
  { title: "Built for scale", text: "Kubernetes-native", icon: "kube" }
];

export const problemCards: ProblemCard[] = [
  {
    title: "Static lists don't scale",
    text: "Hardcoded apps drift from reality as packages, versions, and endpoints change.",
    visual: "list"
  },
  {
    title: "State is missing or wrong",
    text: "Install status, launch URLs, and versions are often stale or unavailable.",
    visual: "state"
  },
  {
    title: "Disconnected experiences",
    text: "Admins manage packages in one place. Users launch apps in another.",
    visual: "users"
  }
];

export const solutionSteps: SolutionStep[] = [
  { title: "Discover", text: "Read package metadata from UDS, Zarf, and Kubernetes in real time.", icon: "package" },
  { title: "Install & Manage", text: "Admins install, upgrade, or remove packages with confidence.", icon: "check" },
  { title: "Launch", text: "Users launch installed apps with live endpoints and status.", icon: "launch" },
  { title: "Secure by Design", text: "Backend mediates all UDS access. No direct client credentials.", icon: "shield" }
];

export const proofCards: ProofCard[] = [
  { title: "Store / Package Catalog", text: "Browse packages and inspect rich metadata.", kind: "store" },
  { title: "Installed Resources", text: "See live install status and versions.", kind: "installed" },
  { title: "Launch Endpoints", text: "One-click access to running applications.", kind: "launch" },
  { title: "Install / Undeploy Flow", text: "Simple actions with clear feedback.", kind: "flow" },
  { title: "Rich Metadata", text: "Versions, descriptions, maintainers, and more.", kind: "metadata" }
];

export const platformNodes: PlatformNode[] = [
  { title: "Normal User", color: "blue", items: ["Discover available apps", "View status and endpoints", "Launch applications"] },
  { title: "Admin User", color: "green", items: ["Browse packages", "Install, upgrade, remove", "View cluster state", "Manage access policies"] },
  { title: "Backend (Express)", color: "purple", items: ["Owns UDS access", "Executes actions safely", "Exposes APIs to UI", "Audits and logging"] },
  { title: "Cluster / Source of Truth", color: "navy", items: ["Kubernetes", "UDS Registry", "Zarf Packages"] }
];

export const architectureNodes: ArchitectureNode[] = [
  { title: "UDS Registry / Zarf Packages", text: "Package metadata and content", icon: "cube" },
  { title: "Express Backend", text: "Read metadata, manage state, execute actions", icon: "server" },
  { title: "Kubernetes Cluster", text: "Namespaces, resources, services, ingress", icon: "kube" },
  { title: "React Catalog UI", text: "Browse, install, manage, launch", icon: "react" }
];
