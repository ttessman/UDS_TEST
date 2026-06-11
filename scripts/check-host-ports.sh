#!/usr/bin/env bash
set -euo pipefail

if [ "$#" -eq 0 ]; then
  echo "Usage: $0 <port> [port...]"
  exit 2
fi

conflict="false"
has_project_owned_conflict="false"

for port in "$@"; do
  echo "Checking host port $port..."

  listeners="$(lsof -nP -iTCP:"$port" -sTCP:LISTEN 2>/dev/null || true)"
  docker_publishers=""

  if command -v docker >/dev/null 2>&1 && docker info >/dev/null 2>&1; then
    docker_publishers="$(
      docker ps --format '{{.ID}}\t{{.Names}}\t{{.Ports}}' |
        awk -v port="$port" '$0 ~ ":" port "->" { print }' || true
    )"
  fi

  if [ -n "$listeners" ] || [ -n "$docker_publishers" ]; then
    conflict="true"
    echo "Host port $port is already allocated."

    if [ -n "$listeners" ]; then
      echo
      echo "Listening processes:"
      printf "%s\n" "$listeners"
    fi

    if [ -n "$docker_publishers" ]; then
      echo
      echo "Docker containers publishing this port:"
      printf "%s\n" "$docker_publishers"

      if printf "%s\n" "$docker_publishers" | awk '{ print $2 }' | grep -q '^k3d-uds-'; then
        has_project_owned_conflict="true"
      fi
    fi

    echo "How to fix port $port:"
    if [ -n "$docker_publishers" ]; then
      printf "%s\n" "$docker_publishers" | while IFS=$'\t' read -r container_id container_name _ports; do
        if [[ "$container_name" == k3d-uds-* ]]; then
          echo "  Project-owned k3d leftover: make down-uds"
        else
          echo "  Stop Docker container: docker stop $container_id  # $container_name"
        fi
      done
    fi

    if [ -n "$listeners" ]; then
      printf "%s\n" "$listeners" |
        awk 'NR > 1 { print $1 "\t" $2 }' |
        while IFS=$'\t' read -r command pid; do
          if [ -n "$pid" ]; then
            if [[ "$command" == com.docke* ]] || [[ "$command" == Docker* ]]; then
              echo "  Docker Desktop owns the host port proxy."
              echo "  First try project cleanup: make fix-uds-ports"
              echo "  Then inspect published containers: docker ps --format '{{.ID}} {{.Names}} {{.Ports}}'"
              echo "  If no container owns it after cleanup, restart Docker Desktop to clear stale port forwarding."
            else
              echo "  Stop process if it is safe: kill $pid  # $command"
            fi
          fi
        done
    fi

    if [ "$port" = "80" ] || [ "$port" = "443" ]; then
      echo "  Or use alternate ports with the macOS workaround:"
      echo "    UDS_K3D_HTTP_PORT=8080 UDS_K3D_HTTPS_PORT=8443 make deploy-uds-macos"
    fi

    echo
  fi
done

if [ "$conflict" = "true" ]; then
  cat <<'EOF'
Resolve the port conflict before creating the k3d UDS cluster.

Safe project cleanup:
  make fix-uds-ports

Manual inspection:
  docker ps
  lsof -nP -iTCP:80 -sTCP:LISTEN
  lsof -nP -iTCP:443 -sTCP:LISTEN

If lsof shows com.docker on the port, Docker Desktop is holding the forwarding
socket. Run 'make fix-uds-ports' first. If the port is still held and
'docker ps' shows no container publishing it, restart Docker Desktop.

The official k3d-core-demo path expects the demo ports to be free.
EOF

  if [ "$has_project_owned_conflict" = "true" ]; then
    echo
    echo "This conflict includes project-owned k3d leftovers, so 'make fix-uds-ports' should clear at least part of it."
  fi

  exit 1
fi

echo "Required host ports are available."
