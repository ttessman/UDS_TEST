#!/usr/bin/env bash
set -euo pipefail

if [ -f server/.env ]; then
  set -a
  # shellcheck disable=SC1091
  source server/.env
  set +a
fi

bundle_ref="${UDS_MACOS_WORKAROUND_BUNDLE_REF:-k3d-core-slim-dev:latest}"
packages_csv="${UDS_MACOS_WORKAROUND_PACKAGES:-init,core-base,core-identity-authorization}"
signature_flag="${UDS_MACOS_WORKAROUND_SIGNATURE_FLAG:---skip-signature-validation}"
api_port="${UDS_K3D_API_PORT:-6550}"
http_port="${UDS_K3D_HTTP_PORT:-80}"
https_port="${UDS_K3D_HTTPS_PORT:-443}"

if ! command -v k3d >/dev/null 2>&1; then
  echo "k3d is required. Run: make setup"
  exit 1
fi

if ! docker info >/dev/null 2>&1; then
  echo "Docker must be running before deploying the macOS UDS workaround."
  exit 1
fi

cat <<EOF
Deploying UDS with the macOS k3d seccomp workaround.

This follows the workaround shape documented in:
  https://github.com/defenseunicorns/uds-core/issues/2237

It deletes/recreates the local k3d cluster named "uds" with kubelet seccomp
default disabled, then deploys selected non-cluster packages from:
  $bundle_ref

Cluster ports:
  Kubernetes API: $api_port
  HTTP: $http_port
  HTTPS: $https_port

Selected packages:
  $packages_csv

Signature mode:
  $signature_flag

EOF

k3d cluster delete uds >/dev/null 2>&1 || true

k3d cluster create uds \
  --api-port "$api_port" \
  --port "$http_port:80@loadbalancer" \
  --port "$https_port:443@loadbalancer" \
  --k3s-arg "--disable=traefik@server:0" \
  --k3s-arg "--flannel-backend=vxlan@server:0" \
  --k3s-arg "--kubelet-arg=seccomp-default=false@server:0"

echo
echo "Waiting for CoreDNS in the workaround cluster..."
if ! kubectl wait pod -n kube-system -l k8s-app=kube-dns --for=condition=Ready --timeout=180s; then
  echo "CoreDNS did not become ready in the workaround cluster."
  kubectl get pods -n kube-system
  kubectl get events -n kube-system --sort-by=.lastTimestamp
  exit 1
fi

signature_args=()
if [ -n "$signature_flag" ]; then
  signature_args+=("$signature_flag")
fi

echo
echo "Deploying selected UDS packages to workaround cluster: $bundle_ref"
echo "Skipping the bundle's uds-k3d-dev package so it does not recreate the cluster without the macOS seccomp flag."
echo "Using --packages $packages_csv"
uds deploy "$bundle_ref" --confirm "${signature_args[@]}" --packages "$packages_csv"

./scripts/verify-uds.sh
