#!/usr/bin/env bash
set -euo pipefail

echo "UDS version"
uds version

echo
echo "Zarf version"
zarf version

echo
echo "Kubernetes cluster"
uds zarf tools kubectl cluster-info

echo
echo "UDS Core namespaces"
core_namespaces="$(uds zarf tools kubectl get namespace -o jsonpath='{range .items[*]}{.metadata.name}{"\n"}{end}' | grep -E '^uds-core($|-)' || true)"
if [ -n "$core_namespaces" ]; then
  printf "%s\n" "$core_namespaces"
else
  echo "No literal uds-core namespace found. Slim/workaround deploys may report Core through Package CRs instead."
fi

echo
echo "Installed Zarf Package CRs"
package_json="$(uds zarf tools kubectl get package -A -o json)"
printf "%s\n" "$package_json"

package_count="$(printf "%s\n" "$package_json" | node -e 'let input = ""; process.stdin.on("data", d => input += d); process.stdin.on("end", () => { const parsed = JSON.parse(input || "{\"items\":[]}"); console.log(Array.isArray(parsed.items) ? parsed.items.length : 0); });')"

if [ "$package_count" -eq 0 ]; then
  echo "No installed Zarf Package CRs found."
  exit 1
fi

echo
echo "Installed Zarf Package CR count: $package_count"

echo
echo "UDS Core evidence"
core_evidence="$(printf "%s\n" "$package_json" | node -e '
let input = "";
process.stdin.on("data", (chunk) => input += chunk);
process.stdin.on("end", () => {
  const parsed = JSON.parse(input || "{\"items\":[]}");
  const items = Array.isArray(parsed.items) ? parsed.items : [];
  const evidence = items
    .filter((item) => {
      const metadata = item.metadata || {};
      const labels = metadata.labels || {};
      const name = metadata.name || "";
      const namespace = metadata.namespace || "";
      const zarfPackage = labels["zarf.dev/package"] || "";
      return (
        name === "keycloak" ||
        name === "authservice" ||
        namespace === "keycloak" ||
        namespace === "authservice" ||
        zarfPackage === "core" ||
        zarfPackage.startsWith("core-")
      );
    })
    .filter((item) => {
      const status = item.status || {};
      const conditions = Array.isArray(status.conditions) ? status.conditions : [];
      return status.phase === "Ready" || conditions.some((condition) => condition.type === "Ready" && condition.status === "True");
    })
    .map((item) => {
      const metadata = item.metadata || {};
      const status = item.status || {};
      return `Package CR ${metadata.namespace || "default"}/${metadata.name || "unknown"} ${status.phase || "Ready"}`;
    });

  console.log(evidence.join("\n"));
});
')"

if [ -n "$core_namespaces$core_evidence" ]; then
  if [ -n "$core_evidence" ]; then
    printf "%s\n" "$core_evidence"
  fi
else
  echo "No UDS Core namespace or ready Core Package CR evidence found."
  exit 1
fi
