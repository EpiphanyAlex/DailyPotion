#!/usr/bin/env bash
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"
mkdir -p types
TYPE_TMP="$(mktemp)"
trap 'rm -f "$TYPE_TMP"' EXIT
npx supabase gen types typescript --local --schema public > "$TYPE_TMP"
test -s "$TYPE_TMP"
mv "$TYPE_TMP" types/supabase.ts
trap - EXIT
