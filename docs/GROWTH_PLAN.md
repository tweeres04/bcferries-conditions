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

**Effort:** ~5 hours (plus 4-6 weeks data collection)  
**Impact:** High (3x pSEO footprint)  
**Priority:** High

#### Routes to Add

```
HSB-NAN, NAN-HSB  (Horseshoe Bay ↔ Nanaimo Departure Bay)
HSB-LNG, LNG-HSB  (Horseshoe Bay ↔ Langdale)
TSA-DUK, DUK-TSA  (Tsawwassen ↔ Duke Point)
```

#### Tasks

| Task | Files | Description |
|------|-------|-------------|
| 2.1 Scraping | `src/app/storeEntries.ts` | Add 6 route codes to scraping array |
| 2.2 Config | `src/app/should-i-reserve/routeMapping.ts` | Add route configurations |
| 2.3 Sitemap | `src/app/sitemap.ts` | Verify auto-generation (should work) |
| 2.4 Test | `/api/store_entries` | Verify scraping works for new routes |

#### Route Configuration Template

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

#### New pSEO Pages Generated

| Route Pair | Busiest Times Pages | Other Pages |
|------------|---------------------|-------------|
| HSB ↔ NAN | 14 (7 days × 2 directions) | Route, holiday, sailing pages |
| HSB ↔ LNG | 14 | Route, holiday, sailing pages |
| TSA ↔ DUK | 14 | Route, holiday, sailing pages |

**Total new busiest-ferry-times pages:** 42  
**Total new indexable pages:** ~100+ (including sitemap variations)

#### Data Collection Timeline
- Routes need 4-6 weeks of hourly scraping before "Full %" stats are meaningful
- Pages can show immediately with "Not enough data yet" messaging
- Risk levels show as "Not enough data" when <4 samples

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

### When to Monetize
**Recommended threshold:** 1,000+ monthly visitors

### Ad Placement Strategy (Google AdSense)

| Location | Ad Type | Notes |
|----------|---------|-------|
| After results shown | Display ad (300×250 or responsive) | Don't block the tool |
| Sidebar on blog posts | Display ad (300×600) | Desktop only |
| Between blog paragraphs | In-article ad | Native style |
| Footer | Display ad (728×90) | Site-wide |

**Important:** Never place ads above the fold on the main tool - prioritize UX.

### Ad Platform Progression

| Platform | Minimum Traffic | Est. Revenue (per 1k pageviews) |
|----------|-----------------|----------------------------------|
| Google AdSense | None | $2-5 |
| Ezoic | 10,000/month | $5-10 |
| Mediavine | 50,000/month | $10-25 |

### Alternative Monetization Ideas

| Strategy | Pros | Cons |
|----------|------|------|
| Affiliate links | Non-intrusive, passive | BC Ferries may not have program |
| Freemium features | Recurring revenue | Need compelling premium features |
| Sponsored content | High margin | Requires sales effort |
| Data licensing | High value per deal | Limited market |

**Freemium feature ideas:**
- Email/SMS alerts when sailings start filling up
- Personalized weekly travel reports
- Extended historical data (beyond 12 weeks)
- Multi-route trip planning

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
- Current frequency: Hourly (via cron hitting `/api/store_entries`)
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

---

## Next Steps

When ready to implement:

1. Review this plan
2. Choose starting point (recommend: internal linking first)
3. Create implementation todos
4. Begin execution

**Estimated total time:** 14 hours of development work + 4-6 weeks data collection + ongoing blog content creation.

**Expected outcome:** Well-structured site ready to capture search traffic and scale to monetization.
