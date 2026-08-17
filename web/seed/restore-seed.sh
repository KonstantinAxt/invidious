#!/usr/bin/env bash
# Restore the sanitized dev seed (seed/invidious-seed.sql) into the local
# compose database (docker compose -p invidious -f /tmp/invidious-compose-3000.yml).
#
# DESTRUCTIVE: drops and rebuilds all tables in the dev DB. Only run against
# the local dev compose, never against a real instance.
set -euo pipefail
cd "$(dirname "$0")"

DB_CONTAINER="invidious-invidious-db-1"
APP_CONTAINER="invidious-invidious-1"

echo "Stopping app container..."
docker stop "$APP_CONTAINER" >/dev/null 2>&1 || true

echo "Restoring seed into $DB_CONTAINER..."
docker exec -i "$DB_CONTAINER" psql -U kemal -d invidious -v ON_ERROR_STOP=1 \
  < invidious-seed.sql

echo "Starting app container..."
docker start "$APP_CONTAINER" >/dev/null

echo "Done. Seeded login: dev@invidious.local / invidious"
