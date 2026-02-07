# BC Ferries Conditions: Growth & Monetization Plan

**Date:** January 30, 2026  
**Goal:** Grow traffic via pSEO, improve UX, and prepare for monetization

---

## Executive Summary

This document outlines a three-phase plan to grow the BC Ferries Conditions site from zero traffic to a monetizable asset through:

1. **Internal linking improvements** - Better SEO and user experience (quick wins)
2. **Route expansion** - 3x the pSEO footprint by adding high-demand routes
3. **Blog setup** - Capture informational search queries

**Expected outcome:** 47+ new indexable pages, improved site structure, foundation for ad monetization.

---

## Current State Analysis

### Traffic & Routes
- **Current traffic:** Zero (site is new)
- **Routes tracked:** 2 (SWB-TSA, TSA-SWB - Victoria ↔ Vancouver via Swartz Bay)
- **pSEO pages:** 14 (busiest-ferry-times pages: 2 routes × 7 days)
- **Total indexable pages:** ~115 (including query param variations in sitemap)

### Internal Linking Gaps
- History page has zero outgoing internal links (isolated)
- Busiest times detail pages don't cross-link to each other
- Footer has no internal links (missed site-wide opportunity)
- DailySummaryTable on busiest times pages doesn't link to main tool

### SEO Foundation
- ✅ Dynamic metadata with OpenGraph
- ✅ JSON-LD structured data (BreadcrumbList, FAQPage)
- ✅ Comprehensive sitemap
- ✅ Holiday tracking and pages
- ❌ No blog/content hub
- ❌ Limited internal linking

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

### Phase 1: Internal Linking Improvements

**Effort:** ~3 hours  
**Impact:** Medium (better crawlability, UX)  
**Priority:** High (quick wins)

#### Tasks

| Task | Files | Description |
|------|-------|-------------|
| 1.1 Footer links | `src/components/Footer.tsx` | Add "Quick Links" and "Popular" sections |
| 1.2 History CTAs | `src/app/history/page.tsx` | Link to main tool and busiest times |
| 1.3 Day navigation | `src/app/busiest-ferry-times/[route]/[day]/page.tsx` | Add Mon-Sun nav + opposite direction link |
| 1.4 Clickable rows | `src/app/busiest-ferry-times/[route]/[day]/page.tsx` | Pass `baseUrl` to DailySummaryTable |
| 1.5 Holiday links | `src/app/page.tsx` | Cross-link holidays when viewing holiday pages |

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

**Expected result:** +40-60 internal links across the site

---

### Phase 2: Route Expansion

**Effort:** ~1 hour implementation + 4-6 weeks data collection  
**Impact:** High (3x pSEO footprint)  
**Priority:** High

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

### Phase 3: MDX Blog Setup

**Effort:** ~6 hours (infrastructure + 5 initial posts)  
**Impact:** Medium-High (captures informational queries)  
**Priority:** Medium

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
| Mobile-first redesign | High | Medium |
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

## Implementation Order

1. **Internal linking** (Week 1)
	- Quick wins, improves crawlability immediately
	- Foundation for future growth

2. **Route expansion** (Week 1)
	- Start data collection ASAP
	- Pages can go live with "collecting data" messaging
	- 4-6 weeks until meaningful stats

3. **Blog setup** (Week 2-3)
	- Can be done in parallel with data collection
	- Posts can reference new routes
	- Evergreen content that compounds over time

---

## Technical Notes

### Scraping Infrastructure
- Current frequency: Every 15 minutes (via cron hitting `/api/store_entries`)
- Data stored in Postgres via Drizzle ORM
- Scraping uses `scrape-it` library
- BC Ferries URL pattern: `https://www.bcferries.com/current-conditions/{ROUTE-CODE}`

### Route Codes Reference

| Code | Route | Scraping URL |
|------|-------|--------------|
| SWB-TSA | Swartz Bay → Tsawwassen | `/current-conditions/SWB-TSA` |
| TSA-SWB | Tsawwassen → Swartz Bay | `/current-conditions/TSA-SWB` |
| HSB-NAN | Horseshoe Bay → Departure Bay | `/current-conditions/HSB-NAN` |
| NAN-HSB | Departure Bay → Horseshoe Bay | `/current-conditions/NAN-HSB` |
| HSB-LNG | Horseshoe Bay → Langdale | `/current-conditions/HSB-LNG` |
| LNG-HSB | Langdale → Horseshoe Bay | `/current-conditions/LNG-HSB` |
| TSA-DUK | Tsawwassen → Duke Point | `/current-conditions/TSA-DUK` |
| DUK-TSA | Duke Point → Tsawwassen | `/current-conditions/DUK-TSA` |

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

## Next Steps

When ready to implement:

1. Review this plan
2. Choose starting point (recommend: internal linking first)
3. Create implementation todos
4. Begin execution

**Estimated total time:** 14 hours of development work + 4-6 weeks data collection + ongoing blog content creation.

**Expected outcome:** Well-structured site ready to capture search traffic and scale to monetization.
