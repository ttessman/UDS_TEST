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
agents="${UDS_K3D_AGENTS:-1}"
gateway_patch_interval_seconds="${UDS_GATEWAY_PATCH_INTERVAL_SECONDS:-2}"
gateway_status_ip="${UDS_GATEWAY_STATUS_IP:-127.0.0.1}"
deploy_progress_interval_seconds="${UDS_DEPLOY_PROGRESS_INTERVAL_SECONDS:-60}"

phase() {
  echo
  echo "==> $1"
}

elapsed_seconds() {
  local started_at="$1"
  local now

  now="$(date +%s)"
  echo "$((now - started_at))"
}

if ! command -v k3d >/dev/null 2>&1; then
  echo "k3d is required. Run: make setup"
  exit 1
fi

if ! docker info >/dev/null 2>&1; then
  echo "Docker must be running before deploying the macOS UDS workaround."
  exit 1
fi

patch_gateway_loadbalancer_status() {
  # ServiceLB is disabled in this workaround to avoid local svclb host-port
  # conflicts across UDS gateway LoadBalancer services. Patch status only so
  # UDS/Core waits see an external IP without changing the service type.
  local services=(
    "istio-admin-gateway/admin-ingressgateway"
    "istio-tenant-gateway/tenant-ingressgateway"
    "istio-passthrough-gateway/passthrough-ingressgateway"
  )

  while true; do
    for service_ref in "${services[@]}"; do
      local namespace="${service_ref%%/*}"
      local service_name="${service_ref##*/}"
      local service_type

      service_type="$(
        kubectl get svc "$service_name" \
          -n "$namespace" \
          -o jsonpath='{.spec.type}' 2>/dev/null || true
      )"

      if [ "$service_type" = "LoadBalancer" ]; then
        if kubectl patch svc "$service_name" \
          -n "$namespace" \
          --subresource=status \
          --type merge \
          -p "{\"status\":{\"loadBalancer\":{\"ingress\":[{\"ip\":\"$gateway_status_ip\"}]}}}" >/dev/null; then
          local patched_key="${namespace}_${service_name}"
          patched_key="${patched_key//-/_}"
          local patched_var="patched_${patched_key}"

          if [ -z "${!patched_var:-}" ]; then
            printf -v "$patched_var" "true"
            echo "macOS workaround: set LoadBalancer status for $namespace/$service_name to $gateway_status_ip"
          fi
        fi
      fi
    done

    sleep "$gateway_patch_interval_seconds"
  done
}

report_deploy_progress() {
  local started_at="$1"

  while true; do
    sleep "$deploy_progress_interval_seconds"
    echo "Still deploying UDS packages after $(elapsed_seconds "$started_at")s. For another terminal: make uds-debug"
  done
}

cat <<EOF
Deploying UDS with the macOS k3d seccomp workaround.

This follows the workaround shape documented in:
  https://github.com/defenseunicorns/uds-core/issues/2237

It deletes/recreates the local k3d cluster named "uds" with kubelet seccomp
default disabled and k3s ServiceLB disabled, then deploys selected non-cluster
packages from:
  $bundle_ref

Cluster ports:
  Kubernetes API: $api_port
  HTTP: $http_port
  HTTPS: $https_port

k3d agents:
  $agents

Selected packages:
  $packages_csv

Signature mode:
  $signature_flag

Gateway service workaround:
  Patch UDS Core gateway LoadBalancer status while deploying.
  Status IP: $gateway_status_ip
  Patch interval: ${gateway_patch_interval_seconds}s

Progress output:
  Phase banners plus a deploy heartbeat every ${deploy_progress_interval_seconds}s.

EOF

phase "Phase 1/6: delete existing local uds k3d cluster if present"
k3d cluster delete uds >/dev/null 2>&1 || true

phase "Phase 2/6: create macOS-compatible uds k3d cluster"
# The official k3d-core-demo path creates its own cluster and does not inherit
# this kubelet flag. Keep cluster creation here unless UDS adds a supported
# flag passthrough or existing-cluster deploy path for the seccomp issue.
k3d cluster create uds \
  --agents "$agents" \
  --api-port "$api_port" \
  --port "$http_port:80@loadbalancer" \
  --port "$https_port:443@loadbalancer" \
  --k3s-arg "--disable=traefik,servicelb@server:0" \
  --k3s-arg "--flannel-backend=vxlan@server:0" \
  --k3s-arg "--kubelet-arg=seccomp-default=false@server:0"

phase "Phase 3/6: wait for CoreDNS"
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

phase "Phase 4/6: prepare selected UDS package deploy"
echo "Bundle: $bundle_ref"
echo "Skipping the bundle's uds-k3d-dev package so it does not recreate the cluster without the macOS seccomp flag."
echo "Using --packages $packages_csv"

phase "Phase 5/6: run UDS deploy with progress heartbeat"
echo "Starting gateway LoadBalancer status watcher and deploy heartbeat."
patch_gateway_loadbalancer_status &
gateway_patch_pid="$!"

deploy_started_at="$(date +%s)"
report_deploy_progress "$deploy_started_at" &
deploy_progress_pid="$!"

cleanup_background_processes() {
  local cleaned_up="false"

  if [ -n "${gateway_patch_pid:-}" ]; then
    kill "$gateway_patch_pid" >/dev/null 2>&1 || true
    wait "$gateway_patch_pid" >/dev/null 2>&1 || true
    gateway_patch_pid=""
    cleaned_up="true"
  fi

  if [ -n "${deploy_progress_pid:-}" ]; then
    kill "$deploy_progress_pid" >/dev/null 2>&1 || true
    wait "$deploy_progress_pid" >/dev/null 2>&1 || true
    deploy_progress_pid=""
    cleaned_up="true"
  fi

  if [ "$cleaned_up" = "true" ]; then
    echo "Cleanup: stopped macOS workaround background processes."
  fi
}

handle_interrupt() {
  echo
  echo "Interrupted. Cleaning up macOS workaround background processes."
  cleanup_background_processes
  exit 130
}
trap cleanup_background_processes EXIT
trap handle_interrupt INT TERM

set +e
uds deploy "$bundle_ref" --confirm "${signature_args[@]}" --packages "$packages_csv"
deploy_status="$?"
set -e

cleanup_background_processes
trap - EXIT INT TERM

if [ "$deploy_status" -ne 0 ]; then
  echo "UDS package deploy failed after $(elapsed_seconds "$deploy_started_at")s."
  echo "Run 'make uds-debug' for cluster status and recent warning events."
  exit "$deploy_status"
fi

echo "UDS package deploy finished after $(elapsed_seconds "$deploy_started_at")s."

phase "Phase 6/6: verify UDS cluster and installed packages"
./scripts/verify-uds.sh
