# Self-hosting migration plan

## Table of contents

- [Overview](#overview)
- [Current setup](#current-setup)
- [Target setup](#target-setup)
- [Why self-host](#why-self-host)
- [Hardware](#hardware)
- [Migration steps](#migration-steps)
- [Backup strategy](#backup-strategy)
- [Rollback plan](#rollback-plan)

---

## Overview

Migrate BC Ferries Conditions from Vercel + Neon Postgres to the basement gaming PC, joining the existing self-hosted apps (teamcountdown.com, teamstats.tweeres.com). Saves $15/mo on Neon + any Vercel costs.

## Current setup

- **Web app:** Vercel (Next.js)
- **Database:** Neon Postgres (us-east-2), $15/mo
- **Scraping:** Cron hitting `/api/store_entries` every 15 minutes
- **Data:** ~1 year of historical scraping data (~700k+ rows)

## Target setup

- **Web app:** Docker container on basement PC, behind Nginx Proxy Manager
- **Database:** Docker Postgres on same machine
- **Scraping:** Same cron, pointing at local endpoint
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

## Migration steps

**Note:** Docker setup already exists from local dev, so steps 2 and 5 are mostly done.

1. `pg_dump` from Neon (full backup of the year of historical data)
2. Spin up Postgres in Docker on the gaming PC *(already configured from local dev)*
3. `pg_restore` the data into the new Postgres
4. Verify data integrity (row counts, spot check recent entries)
5. ~~Dockerize the Next.js app~~ *(already done)*
6. Add to Nginx Proxy Manager (same pattern as existing apps)
7. Set up environment variables (PGHOST=localhost, etc.)
8. Test the app end-to-end locally
9. Move the cron job to point at the new local endpoint
10. Update DNS to point at home IP
11. Set up daily `pg_dump` backup cron to Google Drive
12. Monitor for a month with Neon still active as fallback
13. Cancel Neon

## Backup strategy

**Critical:** The historical data is irreplaceable. You can't go back and scrape last year's ferry conditions.

- **Daily `pg_dump`** via cron
- **Upload to Google Drive** (or any offsite storage)
- **Retain at least 30 days** of backups
- **Test restore** periodically to verify backups work

## Rollback plan

If something goes wrong during or after migration:
1. DNS back to Vercel
2. Cron back to Vercel endpoint
3. Neon is still running (keep it active for 1 month post-migration)
