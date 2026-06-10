#!/usr/bin/env bash
set -euo pipefail

if [ -f server/.env ]; then
  set -a
  # shellcheck disable=SC1091
  source server/.env
  set +a
fi

bundle_ref="${UDS_CORE_BUNDLE_REF:-k3d-core-demo:latest}"
seccomp_issue_url="https://github.com/defenseunicorns/uds-core/issues/2237"

diagnose_deploy_failure() {
  echo
  echo "UDS deploy failed. Running quick diagnostics..."

  if ! command -v kubectl >/dev/null 2>&1; then
    echo "kubectl is unavailable, skipping Kubernetes diagnostics."
    return
  fi

  if ! kubectl cluster-info >/dev/null 2>&1; then
    echo "Kubernetes is not reachable, so no pod diagnostics are available."
    return
  fi

  local events
  events="$(kubectl get events -n kube-system --sort-by=.lastTimestamp 2>/dev/null || true)"

  if printf "%s\n" "$events" | grep -qi 'seccomp is not supported'; then
    cat <<EOF

Detected the known macOS/k3d seccomp failure:

  CoreDNS stays in ContainerCreating because kubelet cannot create the pod
  sandbox: seccomp is not supported.

Known UDS Core issue:
  $seccomp_issue_url

This is a container runtime / k3d / kubelet compatibility issue, not a frontend
or Express backend problem. The official k3d-core-demo deploy creates its own
k3d cluster, so custom flags from a separately-created cluster are not inherited.
EOF
  else
    echo "No seccomp failure found in recent kube-system events."
    echo "Inspect cluster state with:"
    echo "  kubectl get pods -A"
    echo "  kubectl get events -A --sort-by=.lastTimestamp"
  fi
}

if ! command -v k3d >/dev/null 2>&1; then
  echo "k3d is required for the official local demo. Run: make setup-macos"
  exit 1
fi

if ! docker info >/dev/null 2>&1; then
  echo "Docker must be running for the official k3d local demo."
  exit 1
fi

if ! docker info --format '{{json .SecurityOptions}}' 2>/dev/null | grep -qi 'seccomp'; then
  cat <<'EOF'
Docker is reachable, but its active runtime does not report seccomp support.

The UDS k3d demo requires seccomp support. Without it, kubelet can create the
cluster but CoreDNS stays in ContainerCreating with:

  failed to generate seccomp spec opts: seccomp is not supported

Use Docker Desktop as the active Docker context, then rerun:
  make deploy-uds

Useful checks:
  docker context ls
  docker info --format '{{json .SecurityOptions}}'
EOF
  exit 1
fi

echo "Deploying UDS Core local demo bundle: $bundle_ref"
echo "Official demo docs: https://docs.defenseunicorns.com/core/getting-started/local-demo/overview/"
if ! uds deploy "$bundle_ref" --confirm; then
  diagnose_deploy_failure
  exit 1
fi
./scripts/verify-uds.sh
