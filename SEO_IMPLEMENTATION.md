# SEO Implementation for BC Ferries Conditions

## Overview

This implementation adds route-specific pages to improve search engine discoverability for common queries like "should i reserve vancouver to victoria ferry" and "tsawwassen swartz bay ferry conditions".

## Implementation Details

### Files Created

1. **`src/app/should-i-reserve/routeMapping.ts`**
   - Maps user-friendly URL slugs to route codes
   - Example: `vancouver-victoria` → `TSA-SWB`
   - Contains metadata for each route (terminals, city names)

2. **`src/app/should-i-reserve/[route]/page.tsx`**
   - Dynamic route handler for `/should-i-reserve/{route-slug}`
   - Server-side rendered with dynamic data fetching
   - Pre-fills the route selector based on URL slug
   - Generates unique SEO metadata per route

### Files Modified

1. **`src/app/sitemap.ts`**
   - Added route-specific URLs to sitemap
   - Set appropriate priorities and change frequencies

2. **`src/app/should-i-reserve/page.tsx`**
   - Added quick links to popular route pages

3. **`README.md`**
   - Documented the new route-specific pages

## Routes Available

| URL Slug | Route Code | Description |
|----------|------------|-------------|
| `vancouver-victoria` | TSA-SWB | Vancouver (Tsawwassen) → Victoria (Swartz Bay) |
| `victoria-vancouver` | SWB-TSA | Victoria (Swartz Bay) → Vancouver (Tsawwassen) |

## SEO Benefits

### Targeted Search Queries

These pages will rank for:
- "should i reserve vancouver to victoria ferry"
- "should i reserve bc ferries vancouver victoria"
- "tsawwassen to swartz bay ferry"
- "victoria to vancouver ferry reservation"
- And many similar variations

### Technical SEO

- **Clean URLs**: `/should-i-reserve/vancouver-victoria` instead of query parameters
- **Unique Titles**: Each route has a specific title tag
- **Unique Descriptions**: Route-specific meta descriptions
- **Sitemap**: All routes included with appropriate priorities
- **Server-Side Rendering**: Full content available to search crawlers

## How It Works

1. User visits `/should-i-reserve/vancouver-victoria`
2. Next.js matches the dynamic `[route]` parameter
3. Page validates the route slug exists
4. Route slug is mapped to route code (TSA-SWB)
5. Route selector is pre-filled with the correct route
6. User continues with date and sailing selection
7. All data is fetched server-side on each request (dynamic)

## Adding New Routes

To add more routes in the future:

1. Add entry to `routeConfig` in `routeMapping.ts`:
```typescript
'horseshoe-bay-nanaimo': {
  code: 'HSB-DPT',
  from: 'Horseshoe Bay',
  to: 'Departure Bay (Nanaimo)',
  fromShort: 'Horseshoe Bay',
  toShort: 'Nanaimo',
}
```

2. The sitemap and pages will automatically update

## Notes

- Pages use server-side rendering (SSR), not static generation (SSG)
- Data is fetched fresh on each request
- `generateStaticParams()` only pre-renders the route paths at build time for better performance
- The actual ferry data remains dynamic
