# Agentic Guidelines: BC Ferries Conditions

This document serves as a reference for AI coding agents (like yourself) operating within this repository. It outlines project-specific commands, conventions, and style choices to ensure consistency and reliability.

## 🛠 Build, Lint, and Test Commands

### Development

- **Start Development Server**: `npm run dev`
  - Runs Next.js in development mode with hot-reloading.
- **Build for Production**: `npm run build`
  - Note: `next.config.mjs` is configured with `typescript: { ignoreBuildErrors: true }`. However, you should aim to fix all type errors proactively.
- **Start Production Server**: `npm run start`
- **Linting**: `npm run lint`
  - Uses `eslint-config-next`. Run this before submitting any PRs.

### Database Management (Drizzle ORM)

The project uses Drizzle ORM with a Postgres backend.

- **Push Schema Changes**: `npm run schema:push`
  - Uses `dotenvx` to load `.env.local` and pushes the schema in `src/schema.ts` to the database.
- **Introspect Database**: `npm run schema:pull`
  - Pulls the current database state into the local schema definition.

### Testing

Currently, there is no formal test suite (e.g., Vitest, Playwright) configured in the `package.json`.

- **Guideline**: If you introduce a test runner, prefer **Vitest** for unit tests.
- **Running a Single Test**: Once configured, use `npx vitest run path/to/test.ts`.

---

## 🏗 Project Architecture & Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router).
- **Language**: [TypeScript](https://www.typescriptlang.org/).
- **Database**: [Postgres](https://www.postgresql.org/) via [Drizzle ORM](https://orm.drizzle.team/).
- **Scraping**: [scrape-it](https://github.com/IonicaBizau/scrape-it) for fetching BC Ferries conditions.
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) with `@tailwindcss/forms` and `@tailwindcss/typography`.
- **Dates**: `date-fns` and `@date-fns/tz` for timezone-aware calculations (specifically `America/Vancouver`).

### Branding

**Site Name**: "BC Ferries Conditions Analytics"

- Use "BC Ferries Conditions Analytics" (not "BC Ferries Conditions") in all page titles, meta tags, and schema markup
- This distinguishes the site from official BC Ferries resources
- Example: `title: 'Peak Travel Times - BC Ferries Conditions Analytics'`
- Check all new pages to ensure consistent use of "Analytics" suffix

---

## 🎨 Code Style & Conventions

### Formatting

Enforced via `.prettierrc` and verified during linting:

- **Indentation**: Use **Tabs** (tab width: 2).
- **Quotes**: **Single quotes** for strings.
- **Semicolons**: **Disabled**.
- **Trailing Commas**: Default Prettier behavior (es5).

### TypeScript & Typing

- **Type Definitions**: Prefer `type` over `interface` for consistency with existing code (e.g., `Props` in pages, `Entry` in schema).
- **Database Types**: Always use Drizzle's inference tools:
  ```typescript
  export type Entry = typeof entries.$inferSelect
  export type NewEntry = typeof entries.$inferInsert
  ```
- **Strictness**: Maintain `strict: true` in `tsconfig.json`. Avoid `any` at all costs.

### Import Organization

Imports should be grouped and sorted for readability:

1.  **Frameworks**: `next/*`, `react`.
2.  **External Libraries**: `drizzle-orm`, `date-fns`, `lodash`.
3.  **Local Schema**: `@/schema`.
4.  **Local Utilities**: `@/app/getDb`, `@/app/formatTime`.
5.  **Components**: `./Chart`, `./SelectDate`.

Example:

```typescript
import { Metadata } from 'next'
import { and, eq } from 'drizzle-orm'
import { entries } from '@/schema'
import { getDb } from './getDb'
import Chart from './Chart'
```

### Naming Conventions

- **Components**: **PascalCase** (e.g., `SelectSailing.tsx`, `Chart.tsx`).
- **Utility Functions**: **camelCase** (e.g., `formatTime.ts`, `getEntriesForDow.ts`).
- **Directories**: **kebab-case** (Next.js App Router convention).
- **Database Columns**: **camelCase** in TypeScript schema, mapping to `snake_case` in Postgres if necessary (though current schema uses camelCase names like `overallPercent`).

### Component Structure

- Use **Server Components** by default.
- Add `'use client'` only when necessary for interactivity or browser APIs.
- Prefer **Functional Components** with explicit `Props` types.
- Destructure props in the function signature.

### Error Handling

- **Server Side**: Use `try...catch` in API routes and Server Actions. Return meaningful error messages/statuses via `NextResponse`.
- **Client Side**: Ensure graceful degradation if data fetching fails.

### Data Fetching & Scraping

- **Source**: Current conditions are scraped from the BC Ferries website.
- **Tool**: `scrape-it` is used for parsing HTML.
- **Location**: Logic is primarily in `src/app/storeEntries.ts`.
- **Scheduled Tasks**: The endpoint `/api/store_entries` is designed to be called by a cron job or external trigger to persist data.
- **Routes Covered**: Currently scraping 'SWB-TSA' (Swartz Bay to Tsawwassen) and 'TSA-SWB' (Tsawwassen to Swartz Bay).

### Database Schema Details

The `entries` table (`src/schema.ts`) includes:

- `route`: String (e.g., 'SWB-TSA').
- `date`: ISO date string (YYYY-MM-DD).
- `time`: Scheduled sailing time.
- `vessel`: Name of the ferry.
- `overallPercent`: Percentage of total capacity available.
- `vehiclePercent`: Percentage of vehicle deck space available.
- `full`: Boolean indicating if the sailing is sold out.
- `timestamp`: Record creation time.

### Historical Analysis

- Data is stored hourly to build a historical profile of each sailing.
- The `should-i-reserve` tool uses this historical data to calculate the probability of a sailing being full on a given day of the week.
- When adding new features, ensure they leverage the `entries` table for longitudinal analysis.

---

## 🔐 Environment & Secrets

This project uses `.env.local` for local development. Variables are loaded using `dotenvx`.

Required variables:

- `PGHOST`: Postgres host.
- `PGDATABASE`: Database name.
- `PGUSER`: Database user.
- `PGPASSWORD`: Database password.
- `PGPORT`: Database port (defaults to 5432).
- `PGSSL`: Set to `false` to disable SSL (defaults to `true`).

---

## 🤖 Instructions for Agents

1.  **Context Awareness**: Always check `src/schema.ts` before modifying database queries.
2.  **Timezone Sensitivity**: All ferry-related times are in `America/Vancouver`. Use `TZDate.tz('America/Vancouver')` for calculations.
3.  **No Semicolons**: Ensure you do not add semicolons to the end of lines.
4.  **Tab Indentation**: Do not use spaces for indentation.
5.  **Proactive Improvements**: If you see an opportunity to add a unit test or improve type safety, do so.
6.  **Environment Variables**: Use `process.env.PGHOST`, `PGDATABASE`, etc. for DB connections. In local dev, these are often loaded via `.env.local` or `dotenvx`.

---

## 📊 Analytics Tracking — Mixpanel

This project uses **Mixpanel** for product analytics, alongside the existing GA4 and Simple Analytics scripts (which stay for pageview-level data). Don't add other product-analytics SDKs without explicit instruction.

⛔ **Read this section before adding or changing any tracking.**

### Tech stack

| Detail | Value |
|---|---|
| Platform | Next.js 14 (App Router), client-side |
| Mixpanel SDK | `mixpanel-browser` |
| Tracking method | Client-side |
| CDP | None |
| Identity | **None** — this is an anonymous public site with no user accounts. Do not add `identify()`/`reset()`; rely on Mixpanel's auto-generated device ID. |
| Consent gating | Not required (audience is overwhelmingly BC/Canada, no EU/CA gating) |
| Token location | `.env.local` → `NEXT_PUBLIC_MIXPANEL_TOKEN` (also wired as a build arg in `Dockerfile` + `docker-compose.yml` for production) |

### Initialization

Mixpanel is initialized **once** in `src/lib/mixpanel.ts` (`initMixpanel()`), called from the client component `src/components/MixpanelProvider.tsx`, which is mounted in `src/app/layout.tsx`. Do not init Mixpanel anywhere else or create extra instances. Always track through the `trackEvent(name, properties)` helper in `src/lib/mixpanel.ts` — don't import `mixpanel-browser` directly in feature files. (`mixpanel-browser` ships its own TypeScript types, so there's no `@types/mixpanel-browser` dependency.)

Init config of note (all in `src/lib/mixpanel.ts`):
- **Pageviews:** `track_pageview: 'url-with-path'` — path-only. The should-i-reserve form encodes its steps in the query string, so this avoids a pageview per step. Autocapture's own pageview is disabled to prevent double-counting.
- **Heatmaps:** powered by `autocapture` (click/input/scroll/submit enabled).
- **Session Replay:** `record_sessions_percent: 100` (records all sessions — dial down as traffic grows).
- **Recording privacy:** text and inputs are **unmasked** (`record_mask_all_text/inputs: false`) so recordings are readable, **except** `input[type="email"]` (the feedback email field) which stays masked to avoid storing PII. Add a selector to `record_mask_input_selector` if you introduce other sensitive fields.

### Naming conventions

- Event names: `snake_case`, past tense (e.g. `daily_summary_viewed`).
- Property names: `snake_case`, full words, no abbreviations. Boolean props use an `is_`/`has_` prefix.
- Send numbers unquoted. Omit properties that don't apply — never send `null` or `''`.

### Current events

| Event | Trigger | Key properties | File |
|---|---|---|---|
| `daily_summary_viewed` | Route + date/day selected and the 12-week "typical sailings" table renders (value moment) | `route`, `day_of_week`, `sailing_count`, `is_holiday`, `has_specific_date` | `src/app/should-i-reserve/ShouldIReserveForm.tsx` → `src/components/TrackReserveView.tsx` |
| `sailing_forecast_viewed` | A specific sailing is selected and its historical fill data renders | `route`, `sailing_time`, `day_of_week`, `is_holiday`, `history_weeks` | `src/app/should-i-reserve/ShouldIReserveForm.tsx` → `src/components/TrackReserveView.tsx` |
| `donation_link_clicked` | Visitor clicks the "Support the project" outbound Stripe link | `location` (`home` / `footer` / `busiest_times`) | `src/components/DonateLink.tsx` |

These two states are mutually exclusive in the UI. Because route/date/sailing selection is a server-action soft navigation, the events fire from a `useEffect` in `TrackReserveView` keyed on a signature of the event + properties, so they re-fire on each re-render rather than only on full page load.

### Adding a new event

1. Check the table above — reuse an existing event/property rather than duplicating.
2. Name it `snake_case`, past tense; define only properties available at fire time.
3. Track it via `trackEvent()` after the action/state it represents is real (e.g. the result actually rendered), not on raw button click.
4. No PII in properties (no emails, names, IPs).
5. Add a row to the table above.
6. Verify in Mixpanel Live View (events log to the console in dev — `debug` is on outside production).
