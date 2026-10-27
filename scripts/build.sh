#!/bin/bash
# Packages extension/ into dist/chat-time-stamp-v<version>.zip for upload to
# the Chrome Web Store. The version is read from extension/manifest.json.

set -euo pipefail

root="$(cd "$(dirname "$0")/.." && pwd)"
version="$(python3 -c \
  "import json,sys; print(json.load(open(sys.argv[1]))['version'])" \
  "$root/extension/manifest.json")"
out="$root/dist/chat-time-stamp-v${version}.zip"

mkdir -p "$root/dist"
rm -f "$out"
(cd "$root/extension" && zip -qr "$out" . -x '*.DS_Store')

echo "Built $out"
unzip -l "$out"
