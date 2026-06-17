#!/usr/bin/env bash
set -euo pipefail

cluster_name="${UDS_K3D_CLUSTER_NAME:-uds}"
http_port="${UDS_K3D_HTTP_PORT:-80}"
https_port="${UDS_K3D_HTTPS_PORT:-443}"

prompt_yes_no() {
  local prompt="$1"
  local response

  if [ ! -r /dev/tty ]; then
    return 1
  fi

  printf "%s [y/N] " "$prompt" >/dev/tty
  read -r response </dev/tty

  case "$response" in
    y|Y|yes|YES)
      return 0
      ;;
    *)
      return 1
      ;;
  esac
}

review_shared_host_ports() {
  local ports=("$@")
  local port
  local found_conflict="false"

  if ! command -v lsof >/dev/null 2>&1; then
    echo "lsof not found; skipping shared host port review."
    return
  fi

  echo
  echo "Reviewing shared UDS host ports: ${ports[*]}"

  for port in "${ports[@]}"; do
    local listeners
    local docker_publishers

    listeners="$(lsof -nP -iTCP:"$port" -sTCP:LISTEN 2>/dev/null || true)"
    docker_publishers=""

    if command -v docker >/dev/null 2>&1 && docker info >/dev/null 2>&1; then
      docker_publishers="$(
        docker ps --format '{{.ID}}\t{{.Names}}\t{{.Ports}}' |
          awk -v port="$port" '$0 ~ ":" port "->" { print }' || true
      )"
    fi

    if [ -z "$listeners" ] && [ -z "$docker_publishers" ]; then
      continue
    fi

    found_conflict="true"
    echo "Host port $port is still allocated after UDS cleanup."

    if [ -n "$docker_publishers" ]; then
      echo
      echo "Docker containers publishing port $port:"
      printf "%s\n" "$docker_publishers"

      while IFS=$'\t' read -r container_id container_name _ports; do
        if [ -z "$container_id" ]; then
          continue
        fi

        if [[ "$container_name" == k3d-"$cluster_name"-* ]]; then
          echo "Skipping project-owned k3d leftover $container_name; down-uds already attempted removal."
          continue
        fi

        if prompt_yes_no "Stop Docker container $container_name ($container_id) to free port $port?"; then
          if docker stop "$container_id" >/dev/null; then
            echo "Stopped Docker container $container_name."
          else
            echo "Failed to stop Docker container $container_name. To retry manually:"
            echo "  docker stop $container_id  # $container_name"
          fi
        else
          echo "Left Docker container running. To stop it manually:"
          echo "  docker stop $container_id  # $container_name"
        fi
      done <<< "$docker_publishers"

      listeners="$(lsof -nP -iTCP:"$port" -sTCP:LISTEN 2>/dev/null || true)"
    fi

    if [ -n "$listeners" ]; then
      echo
      echo "Listening processes on port $port:"
      printf "%s\n" "$listeners"

      printf "%s\n" "$listeners" |
        awk 'NR > 1 { print $1 "\t" $2 }' |
        while IFS=$'\t' read -r command pid; do
          if [ -z "$pid" ]; then
            continue
          fi

          if [[ "$command" == com.docke* ]] || [[ "$command" == Docker* ]]; then
            echo "Docker Desktop is holding the host forwarding socket for port $port."
            echo "If no Docker container still publishes this port, restart Docker Desktop to clear stale forwarding."
            continue
          fi

          if prompt_yes_no "Kill process $command ($pid) to free port $port?"; then
            if kill "$pid"; then
              echo "Killed process $command ($pid)."
            else
              echo "Failed to kill process $command ($pid). To retry manually:"
              echo "  kill $pid  # $command"
            fi
          else
            echo "Left process running. To stop it manually:"
            echo "  kill $pid  # $command"
          fi
        done
    fi

    echo
  done

  if [ "$found_conflict" = "false" ]; then
    echo "Shared UDS host ports are clear."
  else
    echo "Shared host port review complete."
  fi
}

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

  registry_name="${REGISTRY_NAME:-uds-poc-registry}"
  if docker ps -a --format '{{.Names}}' | grep -qx "$registry_name"; then
    docker rm -f "$registry_name" >/dev/null
    echo "Removed registry $registry_name"
  else
    echo "Registry $registry_name is not present"
  fi
else
  echo "Docker is not reachable; skipping Docker cleanup."
fi

review_shared_host_ports "$http_port" "$https_port"

echo "Local UDS cleanup complete."
