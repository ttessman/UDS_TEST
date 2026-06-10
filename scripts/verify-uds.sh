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
uds zarf tools kubectl get namespace -o jsonpath='{range .items[*]}{.metadata.name}{"\n"}{end}' | grep -E '^uds-core($|-)' || true

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
