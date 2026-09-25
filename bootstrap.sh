#!/usr/bin/env bash
set -euo pipefail
# No sudo and no global installation. Downloads come only from nodejs.org/npm.
root="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
runtime="$root/.runtime"
case "$(uname -s)" in Darwin) platform=darwin ;; Linux) platform=linux ;; *) echo 'Use bootstrap.ps1 on Windows.' >&2; exit 1 ;; esac
case "$(uname -m)" in x86_64) arch=x64 ;; arm64|aarch64) arch=arm64 ;; *) echo 'Unsupported CPU architecture.' >&2; exit 1 ;; esac
command -v curl >/dev/null || { echo 'curl is required.' >&2; exit 1; }
endpoint=latest
mkdir -p "$runtime"
checksums="$(curl --fail --silent --show-error --location "https://nodejs.org/dist/$endpoint/SHASUMS256.txt")"
line="$(printf '%s\n' "$checksums" | grep -E " node-v[0-9]+\.[0-9]+\.[0-9]+-$platform-$arch.tar.gz$" | head -1)"
archive="$(printf '%s' "$line" | awk '{print $2}')"
expected="$(printf '%s' "$line" | awk '{print $1}')"
[[ -n "$archive" && -n "$expected" ]] || { echo 'Release checksum missing.' >&2; exit 1; }
node_root="$runtime/${archive%.tar.gz}"
if [[ ! -x "$node_root/bin/node" ]]; then
  curl --fail --show-error --location "https://nodejs.org/dist/$endpoint/$archive" -o "$runtime/$archive"
  if command -v sha256sum >/dev/null; then actual="$(sha256sum "$runtime/$archive" | awk '{print $1}')"; else actual="$(shasum -a 256 "$runtime/$archive" | awk '{print $1}')"; fi
  [[ "$actual" == "$expected" ]] || { echo 'Node checksum mismatch.' >&2; exit 1; }
  tar -xzf "$runtime/$archive" -C "$runtime"
fi
export PATH="$node_root/bin:$PATH"
npm_version="$(node -e "fetch('https://registry.npmjs.org/npm/latest').then(r=>r.json()).then(p=>console.log(p.version))")"
[[ "$npm_version" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]] || exit 1
npm_root="$runtime/npm-$npm_version"
if [[ ! -f "$npm_root/lib/node_modules/npm/bin/npm-cli.js" ]]; then npm install --global --prefix "$npm_root" "npm@$npm_version" --no-fund --no-audit; fi
export npm_execpath="$npm_root/lib/node_modules/npm/bin/npm-cli.js"
export PATH="$npm_root/bin:$PATH"
node -e "require('fs').writeFileSync(process.argv[1],JSON.stringify({node:process.execPath,npm:process.env.npm_execpath}))" "$runtime/toolchain.json"
exec node "$root/bin/create.mjs" "$@"
