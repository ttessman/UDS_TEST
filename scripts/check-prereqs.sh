#!/usr/bin/env bash
set -euo pipefail

status() {
  local name="$1"
  local command_name="$2"
  if command -v "$command_name" >/dev/null 2>&1; then
    printf "yes  %-18s %s\n" "$name" "$(command -v "$command_name")"
  else
    printf "no   %-18s missing\n" "$name"
  fi
}

printf "Prerequisites\n"
status "Homebrew" "brew"
status "UDS CLI" "uds"
status "Zarf CLI" "zarf"
status "k3d" "k3d"
status "kubectl" "kubectl"

if command -v docker >/dev/null 2>&1 && docker version >/dev/null 2>&1; then
  printf "yes  %-18s Docker reachable\n" "container runtime"
elif command -v limactl >/dev/null 2>&1; then
  printf "yes  %-18s limactl installed\n" "container runtime"
else
  printf "no   %-18s Docker Desktop or Lima-compatible runtime missing/not reachable\n" "container runtime"
fi

if command -v kubectl >/dev/null 2>&1 && kubectl cluster-info >/dev/null 2>&1; then
  printf "yes  %-18s reachable\n" "Kubernetes"
else
  printf "no   %-18s not reachable from current kubeconfig\n" "Kubernetes"
fi
