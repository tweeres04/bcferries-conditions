# Self-hosting migration plan

## Table of contents

- [Overview](#overview)
- [Current setup](#current-setup)
- [Target setup](#target-setup)
- [Why self-host](#why-self-host)
- [Hardware](#hardware)
- [What was done (code changes)](#what-was-done-code-changes)
- [Migration steps](#migration-steps)
- [Environment variables](#environment-variables)
- [Backup strategy](#backup-strategy)
- [Rollback plan](#rollback-plan)

---

## Overview

Migrate BC Ferries Conditions from Vercel + Neon Postgres to the basement gaming PC, joining the existing self-hosted apps (teamcountdown.com, teamstats.tweeres.com). Saves $15/mo on Neon + any Vercel costs.

## Current setup

- **Web app:** Vercel (Next.js)
- **Database:** Neon Postgres (us-east-2), $15/mo
- **Scraping:** External cron service hitting `/api/store_entries` every 15 minutes
- **Data:** ~1 year of historical scraping data (~700k+ rows)

## Target setup

- **Web app:** Docker container on basement PC, behind Nginx Proxy Manager
- **Database:** Docker Postgres on same machine (named volume for persistence)
- **Scraping:** External cron service re-pointed at new URL with API key header
- **Backups:** Daily `pg_dump` cron uploaded to Google Drive

## Why self-host

- $15/mo savings on Neon alone ($180/year)
- PC is already running 24/7 serving other apps (zero incremental electricity cost)
- Postgres and Next.js on the same machine = sub-millisecond DB queries
- Infrastructure already proven with teamcountdown.com and teamstats.tweeres.com
- Workload is trivially small for an i7 with 24GB RAM

## Hardware

- **CPU:** Intel i7 (Sandy Bridge, 2011)
- **RAM:** 24GB
- **Status:** Already running 24/7, serving multiple apps via Docker + Nginx Proxy Manager

This machine is massive overkill for this workload. Postgres idles at ~50MB RAM. Even at 10k monthly visitors with scraping every 15 minutes, it wouldn't notice.

## What was done (code changes)

These changes are already in the codebase and just need to be committed/deployed:

| File | Change |
|------|--------|
| `next.config.mjs` | Added `output: 'standalone'` for Docker-optimized build |
| `Dockerfile` | Multi-stage build: deps → builder → runner (node:22-alpine) |
| `.dockerignore` | Excludes `.git`, `.env*`, `node_modules`, `.next`, `docs/` |
| `docker-compose.yml` | Added `app` service, named volumes for Postgres data and Next.js cache, removed Adminer |
| `src/app/api/store_entries/route.ts` | Added optional API key auth (`Authorization: Bearer <key>`). If `CRON_API_KEY` env var is not set, the endpoint remains open (backwards compatible). |

## Migration steps

### Phase 1: Ship code changes to Vercel (now)

1. Commit and push the code changes (Dockerfile, docker-compose, API key auth, standalone output)
2. Verify the Vercel build still passes (`output: 'standalone'` is compatible with Vercel)
3. The API key auth is opt-in — Vercel doesn't need `CRON_API_KEY` set yet, endpoint stays open

### Phase 2: Prepare the basement PC

1. `git clone` or `git pull` the repo onto the basement PC
2. Create a `.env` file on the server with production values (see [Environment variables](#environment-variables) below)
3. `docker compose up -d` — this builds the app image and starts Postgres
4. Run `pg_dump` from Neon, `pg_restore` into the new Docker Postgres:

```bash
# Dump from Neon
pg_dump "postgresql://tweeres04:<password>@ep-twilight-hat-a5n5xwlz-pooler.us-east-2.aws.neon.tech/bcferries_status" \
  --no-acl --no-owner -F c -f bcferries_backup.dump

# Restore into Docker Postgres (running on port 5433 locally)
pg_restore -h localhost -p 5433 -U <PGUSER> -d <PGDATABASE> --no-acl --no-owner bcferries_backup.dump
```

5. Verify data integrity:
```bash
# Check row count matches Neon
psql -h localhost -p 5433 -U <PGUSER> -d <PGDATABASE> -c "SELECT COUNT(*) FROM entries;"

# Spot-check most recent entries
psql -h localhost -p 5433 -U <PGUSER> -d <PGDATABASE> -c "SELECT * FROM entries ORDER BY timestamp DESC LIMIT 5;"
```

6. Test the app end-to-end: open `http://localhost:3000`, verify data tables render, history page works

7. Test the cron endpoint with the API key:
```bash
curl -X POST -H "Authorization: Bearer <CRON_API_KEY>" http://localhost:3000/api/store_entries
# Should return 204. Check DB for new rows.
```

### Phase 3: Go live

8. Add to Nginx Proxy Manager:
   - Domain: `bcferries-conditions.tweeres.ca`
   - Forward to: `localhost:3000`
   - Enable Let's Encrypt SSL

9. Update DNS: point `bcferries-conditions.tweeres.ca` at home IP

10. Set `CRON_API_KEY` in Vercel environment variables (to lock the old endpoint too, if leaving Vercel active during parallel run)

11. Re-point the external cron service:
    - New URL: `https://bcferries-conditions.tweeres.ca/api/store_entries`
    - Add header: `Authorization: Bearer <CRON_API_KEY>`
    - Verify a scrape fires and new rows appear in the self-hosted DB

### Phase 4: Parallel run (1 month)

12. Keep Neon active as a fallback
13. Monitor that scrapes are running every 15 minutes and data is accumulating
14. If anything goes wrong: flip DNS back to Vercel, re-point cron to Vercel endpoint

### Phase 5: Decommission

15. Cancel Neon ($15/mo saved)
16. Remove or archive the Vercel deployment
17. Set up daily `pg_dump` backup to Google Drive:

```bash
# Add to host crontab (or add a sidecar container later)
0 2 * * * pg_dump -h localhost -p 5433 -U <PGUSER> <PGDATABASE> -F c | \
  gzip > /backups/bcferries_$(date +\%Y\%m\%d).dump.gz
# Upload to Google Drive with rclone or similar
```

## Environment variables

Create a `.env` file in the project root on the server (never commit this):

```env
# Postgres
PGDATABASE=bcferries_status
PGUSER=bcferries
PGPASSWORD=<strong-password>

# API key for cron endpoint
CRON_API_KEY=<random-string>

# Optional
RESEND_API_KEY=<from-resend-dashboard>
NEXT_PUBLIC_STRIPE_DONATION_URL=<stripe-link>
```

Note: `PGHOST`, `PGPORT`, and `PGSSL` are hardcoded in `docker-compose.yml` (`db`, `5432`, `false`) so they don't need to be in `.env`.

## Backup strategy

**Critical:** The historical data is irreplaceable. You can't go back and scrape last year's ferry conditions.

- **Daily `pg_dump`** via cron
- **Upload to Google Drive** (or any offsite storage)
- **Retain at least 30 days** of backups
- **Test restore** periodically to verify backups work

## Rollback plan

If something goes wrong during or after migration:

1. DNS back to Vercel
2. Cron back to Vercel endpoint (remove API key header or set `CRON_API_KEY` in Vercel env vars)
3. Neon is still running (keep it active for 1 month post-migration as fallback)
