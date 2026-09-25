#!/usr/bin/env bash
set -euo pipefail
root="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
if [[ $# -eq 0 ]]; then set -- dev; fi
if [[ -f "$root/.toolchain.sh" ]]; then
  source "$root/.toolchain.sh"
  exec "$AGENT_STARTER_NODE" "$npm_execpath" --prefix "$root" run "$@"
fi
exec npm --prefix "$root" run "$@"
