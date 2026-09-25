#!/usr/bin/env bash
set -euo pipefail
root="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
if [[ $# -eq 0 ]]; then set -- dev; fi
if [[ "$1" == dev && -f "$root/docker-start.sh" ]]; then
  if [[ $# -ne 1 ]]; then echo 'For Docker dev, set APP_PORT for a preferred starting port; extra dev arguments are not supported.' >&2; exit 1; fi
  exec bash "$root/docker-start.sh"
fi
if [[ -f "$root/.toolchain.sh" ]]; then
  source "$root/.toolchain.sh"
  exec "$AGENT_STARTER_NODE" "$npm_execpath" --prefix "$root" run "$@"
fi
exec npm --prefix "$root" run "$@"
