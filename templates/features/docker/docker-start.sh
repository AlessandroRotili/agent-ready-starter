#!/usr/bin/env bash
set -euo pipefail
shopt -s nocasematch
root="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
port="${APP_PORT:-3000}"
if [[ ! "$port" =~ ^[0-9]{1,5}$ ]]; then
  echo 'APP_PORT must be a port number from 1 to 65535.' >&2
  exit 1
fi
port=$((10#$port))
if (( port < 1 || port > 65535 )); then
  echo 'APP_PORT must be a port number from 1 to 65535.' >&2
  exit 1
fi
last_port=$((port + 999))
if (( last_port > 65535 )); then last_port=65535; fi
compose() { docker compose --project-directory "$root" "$@"; }
show_url() {
  local binding
  binding="$(compose port app 3000)"
  if [[ ! "$binding" =~ ^127\.0\.0\.1:([0-9]+)$ ]]; then
    echo "Cannot determine the app port: $binding" >&2
    exit 1
  fi
  echo "Open http://localhost:${BASH_REMATCH[1]}"
  echo 'Logs: docker compose logs -f app | Stop: docker compose stop app'
}
running="$(compose ps --status running --quiet app)"
if [[ -n "$running" ]]; then show_url; exit 0; fi
compose build app
for (( ; port <= last_port; port++ )); do
  if output="$(APP_PORT="$port" DOCKER_SITE_URL="http://localhost:$port" compose up --no-build -d app 2>&1)"; then
    show_url
    exit 0
  fi
  collision='port is already allocated|address already in use|only one usage of each socket address|socket in a way forbidden by its access permissions'
  if [[ "$output" =~ $collision ]]; then
    echo "Port $port unavailable; trying the next port."
  else
    printf '%s\n' "$output" >&2
    exit 1
  fi
done
echo "No available Docker port in the requested range (ending at $last_port)." >&2
exit 1
