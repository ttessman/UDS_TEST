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
uds zarf tools kubectl get namespace -o jsonpath='{range .items[*]}{.metadata.name}{"\n"}{end}' | grep -E '^uds-core($|-)' || {
  echo "No uds-core namespace found."
  exit 1
}

echo
echo "Installed Zarf Package CRs"
uds zarf tools kubectl get package -A -o json
