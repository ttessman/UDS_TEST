#!/usr/bin/env bash
set -euo pipefail

cluster_name="${UDS_K3D_CLUSTER_NAME:-uds}"

echo "Cleaning local UDS k3d cluster: $cluster_name"

if command -v k3d >/dev/null 2>&1; then
  k3d cluster delete "$cluster_name" || true
else
  echo "k3d not found; skipping k3d cluster delete."
fi

if command -v docker >/dev/null 2>&1 && docker info >/dev/null 2>&1; then
  echo "Removing k3d leftovers for cluster: $cluster_name"
  docker rm -f \
    "k3d-${cluster_name}-server-0" \
    "k3d-${cluster_name}-serverlb" \
    "k3d-${cluster_name}-tools" >/dev/null 2>&1 || true

  docker network rm "k3d-${cluster_name}" >/dev/null 2>&1 || true
  docker volume rm "k3d-${cluster_name}-images" >/dev/null 2>&1 || true
else
  echo "Docker is not reachable; skipping Docker cleanup."
fi

echo "Local UDS cleanup complete."
