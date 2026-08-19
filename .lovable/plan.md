# Project Performance Optimization Plan

## PHASE 1 — PERFORMANCE PROFILING MAP
Identify all potential bottlenecks:
- **Supabase Queries**: Many queries use `.select("*")`. Needs explicit column selection.
- **Component Re-renders**: Components like `ProductCard`, `CartView`, and `StoreHeader` are central and should be memoized.
- **Data Fetching**: Independent queries in `Store.tsx` and `Admin.tsx` can be run in parallel (already mostly handled by React Query, but `Promise.all` can be used for custom logic).
- **Bundle Optimization**: Ensure tree-shaking for `lucide-react` and other libraries.
- **Images**: Use `loading="lazy"` and proper sizes for product images.

## PHASE 2 — REACT RENDERING OPTIMIZATION
- [ HIGH IMPACT ] `src/components/store/ProductCard.tsx` — Re-render without cause — Already memoized, but ensure props are stable.
- [ MEDIUM IMPACT ] `src/pages/Store.tsx` — Derived state recalculation — Wrap filters and categories in `useMemo`.
- [ MEDIUM IMPACT ] `src/components/store/StoreHeader.tsx` — Heavy re-renders — Memoize and split context usage.
- [ LOW IMPACT ] `src/App.tsx` — Route lazy loading — Ensure all route-level components are lazy-loaded.

## PHASE 3 — DATA FETCHING & CACHING
- [ HIGH IMPACT ] `src/hooks/*.ts` — Over-fetching — Replace `.select("*")` with explicit column lists.
- [ MEDIUM IMPACT ] `src/hooks/useOrders.ts` — Unbounded list fetching — Apply `.limit()` or pagination.
- [ MEDIUM IMPACT ] `src/hooks/products.ts` — Duplicate queries — Consolidate `useProducts` and `useAdminProducts`.
- [ HIGH IMPACT ] `src/components/store/CheckoutView.tsx` — Perceived latency — Implement optimistic updates or better loading states.

## PHASE 4 — BUNDLE & ASSET OPTIMIZATION
- [ HIGH IMPACT ] `src/components/store/ProductCard.tsx` — Image layout shift — Add explicit width/height or aspect-ratio wrapper.
- [ MEDIUM IMPACT ] `src/components/store/HeroCarousel.tsx` — Large images blocking load — Use `fetchPriority="high"` for first image and `loading="lazy"` for others.

## PHASE 5 — ALGORITHMIC COMPLEXITY
- [ LOW IMPACT ] `src/pages/Store.tsx` — O(n) lookups in large lists — Use `Map` for cart items or favorites if list grows large.

## PHASE 6 — NETWORK & REQUEST EFFICIENCY
- [ MEDIUM IMPACT ] `src/hooks/common/useOrderRealtimeNotifications.ts` — Redundant fetches — Ensure subscriptions don't trigger unnecessary re-renders.

## PHASE 7 — PERCEIVED PERFORMANCE
- [ HIGH IMPACT ] `src/pages/Store.tsx` — Loading states — Improve skeleton screens to match final layout exactly.
- [ MEDIUM IMPACT ] `src/components/store/ProductDetail.tsx` — Pre-fetching — Prefetch product details on hover.
