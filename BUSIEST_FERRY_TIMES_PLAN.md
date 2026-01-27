# Busiest Ferry Times Pages - Implementation Plan

## Overview

Create standalone "busiest ferry times" guide pages targeting searches like:

- "busiest ferry times on Fridays"
- "best time to take BC Ferries"
- "when do BC Ferries fill up"

## URL Structure

```
/busiest-ferry-times → Hub page with links to all route/day combinations
/busiest-ferry-times/[route]/[day] → Individual pages with data

Examples:
- /busiest-ferry-times/tsawwassen-to-swartz-bay/friday
- /busiest-ferry-times/swartz-bay-to-tsawwassen/sunday
```

## Files to Create/Modify

### 1. Create Hub Page

**File:** `src/app/busiest-ferry-times/page.tsx`

- Simple landing page with intro text
- Grid/list of links to all route+day combinations
- Metadata for "busiest ferry times" head term

### 2. Create Dynamic Route Pages

**File:** `src/app/busiest-ferry-times/[route]/[day]/page.tsx`

- Dynamic page for each route+day combination
- Reuse `getDailySummary()` to fetch data
- Display sailing times, Full %, Risk (similar to existing DailySummaryTable)
- Minimal intro copy explaining the data
- Link to interactive tool (`/should-i-reserve`)
- Generate metadata (title, description, canonical, OG)
- Add structured data (BreadcrumbList, FAQ)

### 3. Route Slug Mapping

**File:** `src/app/busiest-ferry-times/routeMapping.ts` (or add to existing)

- Map URL slugs to route codes:
  - `tsawwassen-to-swartz-bay` → `TSA-SWB`
  - `swartz-bay-to-tsawwassen` → `SWB-TSA`
- Map route codes to display names

### 4. Update Sitemap

**File:** `src/app/sitemap.ts`

- Add all route+day combinations (2 routes × 7 days = 14 pages)
- Add hub page (`/busiest-ferry-times`)

## Scope

- **Routes:** 2 (TSA-SWB, SWB-TSA)
- **Days:** All 7 (Monday through Sunday)
- **Total new pages:** 15 (14 route/day + 1 hub)

## Content Strategy

Keep it minimal for first iteration:

- Brief intro explaining data source (12 weeks historical)
- Sailing table (reuse existing component logic)
- Link to interactive tool for more details

Can enhance later with:

- Tips section (e.g., "Consider early morning sailings")
- Seasonal patterns
- Long weekend advisories

## Implementation Order

1. Create route slug mapping helper
2. Create dynamic route page (`[route]/[day]/page.tsx`)
3. Create hub page (`/busiest-ferry-times/page.tsx`)
4. Update sitemap
5. Test a few URLs manually
6. Build and verify
7. Commit and push
