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
