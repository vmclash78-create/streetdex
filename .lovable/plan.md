# Plan: Streetwear Experience & Performance Boost

Elevating Street Dex with premium micro-interactions, refined streetwear aesthetics, and performance optimizations.

## User Review Required

> [!IMPORTANT]
> I will be implementing smooth animations using Framer Motion. This might slightly increase the initial load size, but will significantly improve the "premium" feel.

## Proposed Changes

### 1. Visual Aesthetics & Micro-interactions
- **Product Card Overhaul**: Add smooth scale-up and shadow glow on hover.
- **Page Transitions**: Implement "fade-in-up" animations when categories or views change.
- **Neon Accents**: Refine buttons and badges with subtle pulsating neon effects.
- **Cart Interactions**: Animate item entry/exit and total updates.

### 2. "Streetwear Premium" Layout
- **Theme Consistency**: Ensure all backgrounds are true #0A0A0A (Deep Black) for high contrast with neon.
- **Typography**: Apply `Bebas Neue` more aggressively to price tags and section headers.
- **Skeleton States**: Improve loading animations with custom "glitch" or "neon" pulse.

### 3. Feature Enhancements
- **Upsell in Cart**: Add a "Customers also liked" slider at the bottom of the cart to increase AOV.
- **Quick Add**: Allow selecting sizes directly from the product card hover state (if space permits).

### 4. Technical Optimizations
- **Asset Loading**: Implement `fetchPriority="high"` for the LCP image (first banner).
- **Memoization**: Wrap `CartView` and `CheckoutView` sub-components in `React.memo` to prevent unnecessary re-renders during state updates.

## Technical Details
- Using `framer-motion` for all UI animations.
- Custom Tailwind utilities for streetwear-specific shadows and text effects.
- Extending `useStore` hook to handle upsell recommendations based on current cart categories.

## Performance Impact
- **Lighthouse**: Targeting 90+ score in Performance and Accessibility.
- **CLS**: Zero layout shift by pre-defining aspect ratios for all media.
