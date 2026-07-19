#!/usr/bin/env bash
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"
DB_URL="${SUPABASE_DB_URL:-postgresql://postgres:postgres@127.0.0.1:54322/postgres}"
psql "$DB_URL" -v ON_ERROR_STOP=1 -f supabase/seed.sql
