# BC Ferries Conditions: Growth & Monetization Plan

**Date:** January 30, 2026 (last updated Feb 27, 2026)
**Goal:** Grow traffic via pSEO, improve UX, and prepare for monetization

---

## Table of contents

- [Executive summary](#executive-summary)
- [Current state analysis](#current-state-analysis)
- [Research: which routes to add?](#research-which-routes-to-add)
- [Implementation plan](#implementation-plan)
  - [Phase 1: Internal linking improvements](#phase-1-internal-linking-improvements--complete)
  - [Phase 2: Route expansion](#phase-2-route-expansion--complete)
  - [Phase 3: MDX blog setup](#phase-3-mdx-blog-setup--complete)
- [Monetization strategy](#monetization-strategy)
- [UX improvements](#ux-improvements-future-considerations)
- [Success metrics](#success-metrics)
- [Implementation status](#implementation-status)
- [Technical notes](#technical-notes)
- [Appendix: internal linking analysis](#appendix-internal-linking-analysis)
- [Questions & decisions log](#questions--decisions-log)
- [Phase 4: SEO strengthening](#phase-4-seo-strengthening--complete)
- [Phase 5: Reddit backlink campaign](#phase-5-reddit-backlink-campaign)
- [Next steps](#next-steps)

---

## Executive Summary

This document outlines a plan to grow the BC Ferries Conditions site from zero traffic to a monetizable asset through:

1. **Internal linking improvements** ✅ Complete - Better SEO and user experience
2. **Route expansion** ✅ Complete - 3x the pSEO footprint by adding high-demand routes
3. **Blog setup** ✅ Complete - 5 articles live targeting informational queries
4. **SEO strengthening** ✅ Complete - Canonical fixes, structured data, outbound links, article CTAs
5. **Reddit backlink campaign** - Pending timing (next long weekend / start of summer)

**Current status (Feb 27, 2026):** Phases 1-4 complete. ~2,800 Search Console impressions/month, 2 clicks. `/articles/should-you-reserve` at position 23 with 170 impressions — within striking distance of page 1. Reddit campaign ready to execute.

---

## Current State Analysis

### Traffic & Routes
- **Current traffic:** ~2,800 impressions/month in Search Console (Feb 2026), 2 clicks — impressions growing fast, CTR the bottleneck
- **Routes tracked:** 7 (SWB-TSA, TSA-SWB, NAN-HSB, HSB-LNG, LNG-HSB, TSA-DUK, DUK-TSA)
- **pSEO pages:** 49 (busiest-ferry-times pages across all routes and days)
- **Total indexable pages:** ~200+ (including sitemap variations, holiday pages, route combinations)

### SEO Foundation
- ✅ Dynamic metadata with OpenGraph
- ✅ JSON-LD structured data (BreadcrumbList, FAQPage, Article)
- ✅ Comprehensive sitemap (with manual `&amp;` escaping workaround for Next.js bug)
- ✅ Holiday tracking and pages
- ✅ Internal linking (footer, day navigation, opposite direction links, history CTAs, clickable rows)
- ✅ Blog/content hub — 5 articles live at `/articles`
- ✅ Canonical tags fixed (Next.js bug workaround for query params)
- ✅ `/should-i-reserve` 301 redirect fixed (was returning 200 due to static pre-rendering)
- ✅ Past dates canonicalize to day-of-week (`?date=2026-01-01` → `?day=wednesday`)
- ✅ Outbound links to bcferries.com reservations page (articles + busiest-ferry-times pages)
- ✅ `dateModified` in Article schema and OpenGraph for updated articles
- ✅ IndexNow key for faster indexing

---

## Research: Which Routes to Add?

Based on analysis of BC Ferries traffic patterns and news reports:

| Route | Traffic Level | Notes |
|-------|---------------|-------|
| **Horseshoe Bay ↔ Departure Bay** (Nanaimo) | Very High | Now reservation-only, frequently sells out |
| **Horseshoe Bay ↔ Langdale** (Sunshine Coast) | High | BC Ferries has notice about regular sellouts |
| **Tsawwassen ↔ Duke Point** (Nanaimo) | Medium-High | Alternative route, gets overflow traffic |

**Source data:**
- BC Ferries reported record traffic in FY 2024-2025: 22.7M passengers, 9.7M vehicles
- HSB-NAN route went reservation-only in 2025 due to demand
- Multiple news articles cite these routes as busiest during peak times

---

## Implementation Plan

### Phase 1: Internal Linking Improvements ✅ Complete

**Effort:** ~3 hours  
**Impact:** Medium (better crawlability, UX)  
**Status:** All 5 tasks complete

#### Tasks (All Complete)

| Task | Files | Status |
|------|-------|--------|
| 1.1 Footer links | `src/components/Footer.tsx` | ✅ Quick Links and Popular sections added |
| 1.2 History CTAs | `src/app/history/page.tsx` | ✅ Links to main tool and busiest times |
| 1.3 Day navigation | `src/app/busiest-ferry-times/[route]/[day]/page.tsx` | ✅ Mon-Sun nav + opposite direction link |
| 1.4 Clickable rows | `src/app/busiest-ferry-times/[route]/[day]/page.tsx` | ✅ `baseUrl` passed to DailySummaryTable |
| 1.5 Holiday links | `src/app/page.tsx` | ✅ Holiday cross-linking implemented |

#### Footer Example Structure
```
Quick Links: Should I Reserve? | Busiest Ferry Times | History
Popular: Friday Sailings | Sunday Sailings | Long Weekend Traffic
```

#### Day Navigation Example
```
Monday | Tuesday | Wednesday | [Thursday] | Friday | Saturday | Sunday

Planning a return trip? Check Tsawwassen to Swartz Bay on Thursday →
```

**Result:** ~60+ internal links added across the site. Significantly improved crawlability and user navigation.

---

### Phase 2: Route Expansion ✅ Complete

**Effort:** ~1 hour implementation + 4-6 weeks data collection  
**Impact:** High (3x pSEO footprint)  
**Status:** Deployed Feb 2026, data collection in progress

#### Routes to Add

| Code | Config Key | From | To | From (Short) | To (Short) | Slug |
|------|-----------|------|-----|--------------|------------|------|
| `NAN-HSB` | `nanaimo-horseshoe-bay` | Nanaimo (Departure Bay) | Vancouver (Horseshoe Bay) | Departure Bay | Horseshoe Bay | `departure-bay-to-horseshoe-bay` |
| `HSB-LNG` | `horseshoe-bay-langdale` | Vancouver (Horseshoe Bay) | Sunshine Coast (Langdale) | Horseshoe Bay | Langdale | `horseshoe-bay-to-langdale` |
| `LNG-HSB` | `langdale-horseshoe-bay` | Sunshine Coast (Langdale) | Vancouver (Horseshoe Bay) | Langdale | Horseshoe Bay | `langdale-to-horseshoe-bay` |
| `TSA-DUK` | `tsawwassen-duke-point` | Vancouver (Tsawwassen) | Nanaimo (Duke Point) | Tsawwassen | Duke Point | `tsawwassen-to-duke-point` |
| `DUK-TSA` | `duke-point-tsawwassen` | Nanaimo (Duke Point) | Vancouver (Tsawwassen) | Duke Point | Tsawwassen | `duke-point-to-tsawwassen` |

**Note:** HSB-NAN (Horseshoe Bay to Departure Bay) excluded because BC Ferries doesn't publish capacity data for this direction.

#### Implementation Tasks

##### 1. Test Scraper Compatibility (~20 min) ✅ Complete

**Result:** Existing CSS selectors work on all new routes. No changes needed.

- All routes use `.cc-vessel-percent-full` for capacity percentages
- Time, vessel, departure, ETA all extract correctly
- HSB-NAN excluded because BC Ferries doesn't publish capacity data for that direction (only shows "Upcoming" status)

##### 2. Update Route Configuration Files (~15 min) ✅ Complete

Three files need manual updates:

| File | Changes |
|------|---------|
| `src/app/storeEntries.ts:42` | Add 5 route codes to `routes` array |
| `src/app/should-i-reserve/routeMapping.ts` | Add 5 entries to `routeConfig` object + 4 pairs to `oppositeMap` (NAN-HSB has no opposite since HSB-NAN excluded) |
| `src/app/routeLabels.ts` | Add 5 display labels for dropdown (format: `'CODE': 'From (Terminal) to To (Terminal)'`) |

**Template for `routeMapping.ts` entries:**

```typescript
'horseshoe-bay-nanaimo': {
	code: 'HSB-NAN',
	from: 'Vancouver (Horseshoe Bay)',
	to: 'Nanaimo (Departure Bay)',
	fromShort: 'Horseshoe Bay',
	toShort: 'Departure Bay',
	slug: 'horseshoe-bay-to-departure-bay',
}
```

**Template for `oppositeMap` additions:**

```typescript
'horseshoe-bay-to-departure-bay': 'departure-bay-to-horseshoe-bay',
'departure-bay-to-horseshoe-bay': 'horseshoe-bay-to-departure-bay',
// ... (3 pairs total)
```

##### 3. Verify Auto-Expanding Components (~5 min)

These files/components automatically expand when `routeMapping.ts` is updated. Run `npm run build` to verify:

| Component | How it Expands |
|-----------|----------------|
| `src/app/sitemap.ts` | Reads `getAllRouteCodes()` and `getAllRouteSlugs()` |
| `src/app/busiest-ferry-times/page.tsx` | Iterates `getAllRouteSlugs()` |
| `src/app/busiest-ferry-times/[route]/[day]/page.tsx` | Looks up `getRouteBySlug(route)` |
| `src/app/SelectRoute.tsx` | Gets routes from DB, labels from `routeLabels.ts` |
| `src/app/getRoutes.ts` | Queries DB for distinct routes dynamically |
| `src/app/history/page.tsx` | Uses `getRouteByCode()` (default stays `SWB-TSA`) |
| All query files (`getEntriesForDow`, `getDailySummary`, etc.) | Accept `route` as parameter |

No changes needed in these files.

##### 4. Build and Lint (~5 min)

```bash
npm run build
npm run lint
```

Fix any type errors or issues before deployment.

#### New pSEO Pages Generated

| Route | Busiest Times Pages |
|-------|---------------------|
| NAN-HSB (Departure Bay → Horseshoe Bay) | 7 (one direction only) |
| HSB ↔ LNG (Horseshoe Bay ↔ Langdale) | 14 (7 days × 2 directions) |
| TSA ↔ DUK (Tsawwassen ↔ Duke Point) | 14 |

**Total new busiest-ferry-times pages:** 35  
**Total new indexable pages:** ~90+ (including sitemap variations for holidays, days, sailing times)

#### Data Collection Timeline

- Routes need 4-6 weeks of scraping (every 15 minutes) before "Full %" stats are meaningful
- Pages go live immediately; tables show "Not enough data" until 4+ samples collected (per `getDailySummary.ts` logic)
- No custom "collecting data" message needed; existing UX handles data sparsity gracefully

---

### Phase 3: MDX Blog Setup ✅ Complete

**Effort:** ~6 hours (infrastructure + 5 initial posts)  
**Impact:** Medium-High (captures informational queries)  
**Status:** Live as of Feb 2026

#### Technology Stack
- **`@next/mdx`** - MDX support for Next.js
- **`@mdx-js/loader`** - Webpack loader for MDX
- Frontmatter for metadata (title, date, description, keywords)

#### Tasks

| Task | Files | Description |
|------|-------|-------------|
| 3.1 Install deps | `package.json` | Add MDX packages |
| 3.2 Config | `next.config.mjs` | Enable MDX page support |
| 3.3 Blog index | `src/app/blog/page.tsx` | List all posts |
| 3.4 Post template | `src/app/blog/[slug]/page.tsx` | Dynamic post rendering |
| 3.5 Content dir | `src/content/blog/` | Create markdown files |
| 3.6 Write posts | `*.mdx` | 5 initial blog posts |
| 3.7 Sitemap | `src/app/sitemap.ts` | Add blog URLs |
| 3.8 Navigation | `src/components/Navigation.tsx` | Add "Blog" link |

#### Blog Structure

```
/src/app/blog/
├── page.tsx                    # Blog index (list of posts)
└── [slug]/
    └── page.tsx                # Individual post renderer

/src/content/blog/
├── peak-travel-times.mdx
├── should-you-reserve.mdx
├── tsawwassen-swartz-bay-guide.mdx
├── horseshoe-bay-nanaimo-tips.mdx
└── long-weekend-survival-guide.mdx
```

#### Initial Blog Posts

| Post Title | Target Keywords | Internal Links |
|------------|-----------------|----------------|
| "BC Ferries peak travel times: when to avoid the crowds" | bc ferries busiest times, when is bc ferries busy | `/busiest-ferry-times` |
| "Should you reserve BC Ferries? Here's how to decide" | bc ferries reservation worth it | `/` |
| "Complete guide to the Tsawwassen-Swartz Bay ferry" | tsawwassen to victoria ferry tips | `/?route=TSA-SWB` |
| "Horseshoe Bay to Nanaimo ferry: tips for a smooth trip" | horseshoe bay nanaimo ferry | `/?route=HSB-NAN` |
| "BC Ferries long weekend survival guide" | bc ferries long weekend tips | Holiday pages |

#### SEO for Blog
- Add Article JSON-LD schema
- Use `generateMetadata()` for dynamic metadata
- Canonical URLs for each post
- Internal linking from posts → tool pages
- Internal linking from tool pages → relevant posts (e.g., holiday warning → long weekend guide)

#### Frontmatter Example

```yaml
---
title: "BC Ferries peak travel times: when to avoid the crowds"
description: "Learn when BC Ferries is busiest and how to plan your trip to avoid long waits and sold-out sailings."
date: "2026-02-15"
keywords: ["bc ferries busiest times", "when is bc ferries busy", "best time bc ferries"]
---
```

---

## Monetization Strategy

**See [MONETIZATION.md](./MONETIZATION.md) for the complete monetization strategy.**

The monetization approach is phased by traffic milestones:

- **Phase 1 (<500/mo):** Donation CTA via Stripe ✅ **Complete (Feb 2026)**
- **Phase 2 (500-5k/mo):** Affiliate links for accommodations + email capture
- **Phase 3 (5k+/mo):** Direct sales to local businesses (billboard advertisers)
- **Phase 4 (10k+/mo):** AdSense as supplemental income

Key insight: At scale, direct sales to local businesses (hotels, restaurants, attractions along Highway 17) will outperform generic ad networks. The site offers hyper-targeted reach to ferry travelers at the moment they're planning their trip.

---

## UX Improvements (Future Considerations)

Not part of immediate plan, but worth considering later:

| Improvement | Impact | Effort |
|-------------|--------|--------|
| Push notifications | High | High |
| Email alerts (free tier) | Medium | Medium |
| "Best time to leave" recommendation | High | Medium |
| Real-time capacity indicator | Medium | Low |
| Save preferences (localStorage) | Low | Low |
| Holiday aggregation on busiest-ferry-times pages | Medium | Medium |

### Holiday Aggregation Details
- **Goal:** Show how sailings perform during "any holiday weekend" vs regular weekends
- **Approach:** Aggregate data across all holidays (not per-holiday) to solve data sparsity
- **Example:** "Over the last 6 long weekends, the 9:00 AM filled 80% of the time (vs. 40% on regular Fridays)"
- **Blocker:** Needs sufficient historical data across multiple holidays (~6+ months)
- **Implementation:** Use existing `getHolidayForDate()` logic to tag historical entries, then query aggregated holiday patterns

---

## Success Metrics

### Traffic Goals

| Timeframe | Goal | Strategy |
|-----------|------|----------|
| Month 1-2 | Get indexed | Submit sitemap, internal linking |
| Month 3-4 | 100+ visitors/month | pSEO pages start ranking |
| Month 6 | 1,000+ visitors/month | Blog posts, seasonal traffic |
| Month 12 | 5,000+ visitors/month | Established rankings, summer traffic |

### Page Performance Targets

| Page Type | Target Ranking | Timeline |
|-----------|----------------|----------|
| Holiday pages | Top 10 | 2-3 months before holiday |
| Busiest times pages | Top 20 | 3-6 months |
| Route-specific queries | Top 10 | 6-12 months |
| Blog posts | Top 20 | 6-12 months |

---

## Implementation Status

1. **Internal linking** ✅ Complete
	- All 5 tasks complete
	- ~60+ internal links added site-wide
	- Improved crawlability and UX

2. **Route expansion** ✅ Complete (data collection in progress)
	- Deployed Feb 2026
	- 5 new routes, 35 new busiest-ferry-times pages
	- Data collecting every 15 minutes, stats available after 4-6 weeks

3. **Blog setup** - Next priority
	- Can begin now while route data accumulates
	- 5 initial posts targeting informational keywords
	- Infrastructure: MDX, blog index, dynamic routing

---

## Technical Notes

### Scraping Infrastructure
- Current frequency: Every 15 minutes (via cron hitting `/api/store_entries`)
- Data stored in Postgres via Drizzle ORM
- Scraping uses `scrape-it` library
- BC Ferries URL pattern: `https://www.bcferries.com/current-conditions/{ROUTE-CODE}`

### Route Codes Reference

| Code | Route | Scraping URL | Status |
|------|-------|--------------|--------|
| SWB-TSA | Swartz Bay → Tsawwassen | `/current-conditions/SWB-TSA` | ✅ Active |
| TSA-SWB | Tsawwassen → Swartz Bay | `/current-conditions/TSA-SWB` | ✅ Active |
| NAN-HSB | Departure Bay → Horseshoe Bay | `/current-conditions/NAN-HSB` | ✅ Active |
| HSB-LNG | Horseshoe Bay → Langdale | `/current-conditions/HSB-LNG` | ✅ Active |
| LNG-HSB | Langdale → Horseshoe Bay | `/current-conditions/LNG-HSB` | ✅ Active |
| TSA-DUK | Tsawwassen → Duke Point | `/current-conditions/TSA-DUK` | ✅ Active |
| DUK-TSA | Duke Point → Tsawwassen | `/current-conditions/DUK-TSA` | ✅ Active |
| HSB-NAN | Horseshoe Bay → Departure Bay | `/current-conditions/HSB-NAN` | ❌ Excluded (no capacity data published by BC Ferries) |

### Data Requirements for Stats
From `getDailySummary.ts`:
- Minimum 4 samples required to show risk level
- Otherwise shows "Not enough data"
- Looks back 12 weeks by default
- Uses `COUNT(CASE WHEN full = true THEN 1 END)` for Full %

---

## Appendix: Internal Linking Analysis

### Current Link Count

| Page | Outgoing Internal | Incoming Internal (excl. nav) |
|------|-------------------|-------------------------------|
| `/` (Home) | 2-8 (variable) | 4 |
| `/busiest-ferry-times` | 16 | 2 |
| `/busiest-ferry-times/[route]/[day]` (×14) | 3 each | 1 each |
| `/history` | 0 | 1 |

### Proposed Link Count After Phase 1

| Page | Outgoing Internal | Incoming Internal (excl. nav) |
|------|-------------------|-------------------------------|
| `/` (Home) | 10-15 | 8+ |
| `/busiest-ferry-times` | 20+ | 5+ |
| `/busiest-ferry-times/[route]/[day]` (×14) | 12 each | 5+ each |
| `/history` | 5+ | 3+ |
| Footer (all pages) | 8-10 | N/A |

**Net increase:** ~60+ internal links

---

## Questions & Decisions Log

### Q: Which routes to prioritize?
**A:** All 3 pairs at once (HSB-NAN, HSB-LNG, TSA-DUK) - maximize pSEO footprint quickly.

### Q: Include Duke Point even though lower traffic?
**A:** Yes - more pages for SEO, and it's still a major route. Data will show lower risk.

### Q: Blog approach - MDX or plain pages?
**A:** MDX - more flexible for content creation, easier for non-developers to contribute later.

### Q: When to add ads?
**A:** Wait until 1,000+ monthly visitors. Start with AdSense for simplicity.

### Q: Show "collecting data" message on new route pages?
**A:** No - existing "Not enough data" logic in `getDailySummary.ts` handles this gracefully. Pages go live immediately.

### Q: Change history page default from SWB-TSA?
**A:** No - SWB-TSA is the most popular route, keep it as default.

### Q: BC Ferries page layout compatibility?
**A:** HSB-LNG and TSA-DUK use a newer page layout with different CSS classes. Must test scraper selectors before deploying route expansion.

---

## Phase 4: SEO Strengthening ✅ Complete

**Effort:** ~1 session  
**Impact:** Medium (improved CTR, structured data, link equity signals)  
**Status:** Complete as of Feb 27, 2026

### What was done

| Task | Details |
|------|---------|
| Rewrote `should-you-reserve` article | Answer-first structure, better keyword targeting ("reservation" not just "reserve"), 6 FAQs targeting long-tail queries, no AI-sounding copy |
| `ReservationStats` component | Async server component fetching live Friday fill rates from DB, filtered to Moderate+ risk sailings, cached daily via `unstable_cache`, with Suspense skeleton |
| `ArticleCta` component | Reusable CTA card added to all 5 articles at natural stopping points |
| `dateModified` support | New frontmatter field emitted in Article schema and OpenGraph; `should-you-reserve` uses it |
| Outbound links to bcferries.com | Links to `/routes-fares/reservations` added in `should-you-reserve.mdx`, `/busiest-ferry-times/page.tsx`, and `/busiest-ferry-times/[route]/[day]/page.tsx`. Cite Sources = +40% GEO visibility per Princeton research. |
| Mobile nav fix | `whitespace-nowrap` + `mobileLabel` prop; "Should I Reserve?" → "Reserve?" on small screens |

### Next.js bugs discovered and worked around

1. **`alternates.canonical` strips query params when pathname is "/"** — Workaround: render `<link rel="canonical">` manually in JSX
2. **Next.js does NOT XML-escape sitemap URLs** — Manual `.replace(/&/g, '&amp;')` in `sitemap.ts`. Do NOT remove.
3. **`redirect()` in statically pre-rendered pages returns 200, not 301** — Fixed by replacing `page.tsx` with `route.ts` handler for `/should-i-reserve`

---

## Phase 5: Reddit Backlink Campaign

**Effort:** ~30 minutes to post, ongoing for comments  
**Impact:** Medium (referral traffic, brand awareness, indirect SEO signal)  
**Status:** Ready to execute — pick timing around a long weekend or start of summer

### Background

Reddit links are `nofollow` so they don't pass direct link equity. The value is:
- Referral traffic that generates real usage signals (time on site, return visits)
- Brand searches after people see the site name on Reddit
- Google indexes Reddit posts, so the site name appears in more search contexts
- More web mentions = more likely to be cited by AI search engines

### Comparable tools that got good reception

| Tool | Subreddit | Score | Reception |
|------|-----------|-------|-----------|
| nextsailing.ca (SMS alerts for sold-out sailings) | r/VictoriaBC | 232 (96% upvoted) | "You're a hero" |
| Ferry Alert app (push notifications for sold-out sailings) | r/VancouverIsland | 118 (98% upvoted) | "The heroes we need" |

Both tools solve a different problem (grabbing cancellations on sold-out sailings). Our tool is complementary — it helps you decide whether to reserve in the first place.

### Target subreddits

| Subreddit | Subscribers | Priority |
|-----------|-------------|----------|
| r/VictoriaBC | 165K | First — most ferry activity, nextsailing post hit 232 upvotes here |
| r/VancouverIsland | 58K | Second — smaller, good fallback if VictoriaBC doesn't land |
| r/vancouver | 615K | Third — bigger, harder to break through |

### Post copy

**Title:** I've been tracking BC Ferries capacity every 15 minutes for months. Here's which sailings actually fill up.

**Image:** Screenshot of `/busiest-ferry-times/tsawwassen-to-swartz-bay/friday` showing the fill rate table with red/yellow percentages. Friday TSA-SWB has the most dramatic data and is the most relatable route. Upload as an image post so it shows as a thumbnail in the feed.

**Body:**

> Last year I didn't bother reserving a 7am ferry on a Thursday because I figured it'd be fine. Ended up waiting two sailings. That was annoying enough that I started collecting capacity data from BC Ferries every 15 minutes to see which sailings actually fill up and which ones don't.
>
> It shows how often each sailing fills up based on the last 12 weeks of real data, broken down by route and day of the week. So instead of guessing, you can just look at whether Friday's 5pm sailing fills up 80% of the time (reserve) or 5% of the time (save the $20).
>
> It covers Tsawwassen-Swartz Bay and Horseshoe Bay-Nanaimo in both directions.
>
> https://bcferries-conditions.tweeres.ca
>
> Completely free, no signup, no ads. Just the data.
>
> Happy to hear feedback or suggestions for what else would be useful.

### Why this framing works

- **Origin story up front.** The Thursday 7am anecdote is relatable and explains why the tool exists without sounding like a pitch.
- **Leads with data, not the tool.** "Which sailings actually fill up" is interesting on its own.
- **Concrete example.** "Friday's 5pm sailing fills up 80% of the time" makes the value obvious in one sentence.
- **No marketing language.** No "analytics platform", no "data-driven decisions", no CTAs beyond the bare URL.
- **Invites feedback.** Turns promotion into a conversation.

### In-comment play

Keep Ferry Alert and NextSailing in your back pocket. If someone asks in the comments "is there anything for grabbing sold-out sailings?", mention them naturally there. Don't include them in the post itself — it reads as trying too hard.

### Timing

Post before a busy travel period when ferry anxiety is top of mind:
- Week before a long weekend (Victoria Day, Canada Day, Labour Day)
- Early June (start of summer travel season)
- Spring break

---

## Next Steps

**Immediate priority: Phase 5 (Reddit campaign)**

- Take a screenshot of `/busiest-ferry-times/tsawwassen-to-swartz-bay/friday` showing the fill rate table
- Post to r/VancouverIsland first (see Phase 5 for full copy)
- Time it before a long weekend or early June (start of summer)
- Post to r/VictoriaBC a few weeks later if the first post does well

**Watch and measure:**
- Check Search Console in 2-3 weeks for position/CTR changes on "bc ferries reservation" cluster
- `/articles/should-you-reserve` at position 23 with 170 impressions — next goal is page 1

**Lower priority / future:**
- Add `dateModified` to remaining 4 articles (infrastructure is built, just needs frontmatter)
- Link "Check current capacity" (line 63 of `should-you-reserve.mdx`) to homepage
- Consider a "current conditions" page (hard to compete with bcferries.com directly)
- Monitor new route data (HSB-LNG, TSA-DUK, etc.) as it accumulates — will unlock more `ReservationStats` content
- Scale monetization as traffic grows (see MONETIZATION.md)
- Optional: Self-hosting migration to save $15/mo (see SELF_HOSTING_MIGRATION.md)
