#!/usr/bin/env bash
# One-shot local setup: installs deps, starts infra, migrates + seeds the DB.
set -euo pipefail

echo "==> Installing dependencies"
npm install

echo "==> Starting local infrastructure (Postgres, Redis, MinIO)"
docker compose up -d postgres redis minio

echo "==> Waiting for Postgres to be healthy"
until docker compose exec -T postgres pg_isready -U tasork >/dev/null 2>&1; do
  sleep 1
done

echo "==> Copying environment files (skips if already present)"
[ -f apps/api/.env ] || cp apps/api/.env.example apps/api/.env
[ -f apps/web/.env.local ] || cp apps/web/.env.example apps/web/.env.local

echo "==> Running database migrations"
npm run db:migrate --workspace=apps/api

echo "==> Seeding the database"
npm run db:seed --workspace=apps/api

echo "==> Done. Run 'npm run dev' to start the app."
