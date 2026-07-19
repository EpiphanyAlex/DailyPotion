#!/usr/bin/env bash
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"
# macOS 自带 Bash 3.2 不会等待 `source <(...)` 的生产进程，改用命令替换后解析。
eval "$(npx supabase status -o env)"
NEXT_PUBLIC_SUPABASE_URL="$API_URL" \
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY="${PUBLISHABLE_KEY:-$ANON_KEY}" \
SUPABASE_SERVICE_ROLE_KEY="$SERVICE_ROLE_KEY" \
npx tsx scripts/verify-queries.ts
