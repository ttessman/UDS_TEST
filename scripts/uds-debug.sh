#!/usr/bin/env bash
set -euo pipefail

section() {
  printf "\n== %s ==\n" "$1"
}

run() {
  printf "$ %s\n" "$*"
  "$@" || true
}

section "Cluster nodes"
run kubectl get nodes -o wide

section "Pods"
run kubectl get pods -A -o wide

section "Deployments"
run kubectl get deployments -A

section "Gateway and LoadBalancer services"
kubectl get svc -A | grep -E '(^NAMESPACE|gateway|LoadBalancer|zarf|keycloak|authservice)' || true

section "Installed Zarf Package CRs"
run uds zarf tools kubectl get package -A -o wide

section "Helm releases"
if uds zarf tools helm version --short >/dev/null 2>&1; then
  run uds zarf tools helm list -A
else
  echo "uds zarf tools helm is not available from this UDS/Zarf install."
fi

section "Recent warning events"
kubectl get events -A --sort-by=.lastTimestamp | grep -E 'Warning|Failed|Error|Unhealthy' | tail -50 || true

section "Running UDS deploy processes"
ps -axo pid,etime,command | grep '[u]ds deploy' || true
