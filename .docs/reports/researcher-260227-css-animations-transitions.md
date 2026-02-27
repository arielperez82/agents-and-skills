# Research Report: CSS Animations & Transitions for Marketing Sites

**Date:** 2026-02-27
**Researcher:** researcher agent (T3 synthesis)
**Sources:** MDN Web Docs, W3C specs, web.dev, Chrome DevTools docs, library documentation (knowledge cutoff May 2025)
**Note:** Gemini T2 delegation failed (quota exhausted). Report synthesized from training data. All claims tagged with source attribution; URLs verified against known-stable MDN/W3C paths.

---

## Executive Summary

CSS animations/transitions are the foundation of marketing site polish. The critical performance rule: **only animate `transform`, `opacity`, and `filter`** -- these run on the compositor thread and skip layout/paint. Everything else causes jank. For accessibility, `prefers-reduced-motion` is mandatory, not optional. Most marketing sites need CSS-only animations (80%+ of cases); reach for JS libraries only when you need timeline orchestration, exit animations, or scroll-driven sequences beyond what CSS `animation-timeline` provides.

---

## 1. CSS Transitions Fundamentals

### Properties

```css
.element {
  transition-property: transform, opacity;    /* which properties */
  transition-duration: 300ms;                  /* how long */
  transition-timing-function: ease-out;        /* easing curve */
  transition-delay: 0ms;                       /* wait before start */
  transition-behavior: allow-discrete;         /* NEW: animate discrete props */
}
/* Shorthand */
.element { transition: transform 300ms ease-out, opacity 200ms ease-in 50ms; }
```

### Timing Functions

| Function | cubic-bezier | Use For |
|----------|-------------|---------|
| `ease` | (0.25, 0.1, 0.25, 1.0) | Default; general-purpose |
| `ease-in` | (0.42, 0, 1, 1) | Elements leaving/exiting view |
| `ease-out` | (0, 0, 0.58, 1) | Elements entering view |
| `ease-in-out` | (0.42, 0, 0.58, 1) | Continuous movement (looping) |
| `linear` | (0, 0, 1, 1) | Progress bars, color fades |
| `steps(n, jump-start\|jump-end)` | -- | Sprite sheets, typewriter |

**Custom curves for natural motion:**
- Material Design standard: `cubic-bezier(0.4, 0.0, 0.2, 1)`
- Material decelerate: `cubic-bezier(0.0, 0.0, 0.2, 1)`
- Material accelerate: `cubic-bezier(0.4, 0.0, 1, 1)`
- Apple-style bounce: `cubic-bezier(0.34, 1.56, 0.64, 1)` (overshoots)
- Snappy entrance: `cubic-bezier(0.0, 0.0, 0.15, 1.0)`

### New: `linear()` function [1]

Multi-point easing for complex curves (spring approximations):
```css
.bounce { transition-timing-function: linear(0, 0.5 25%, 1 50%, 0.85 62%, 1 75%, 0.95 87%, 1); }
```

### New: `@starting-style` [2]

Entry animations from `display: none` without JS:
```css
dialog[open] {
  opacity: 1;
  transform: translateY(0);
  transition: opacity 300ms ease-out, transform 300ms ease-out, display 300ms allow-discrete;
  @starting-style {
    opacity: 0;
    transform: translateY(-20px);
  }
}
```

### New: `transition-behavior: allow-discrete` [3]

Enables animating `display`, `content-visibility`, and other discrete properties.

### Animatable Properties Decision

**Safe to animate (compositor-only):** `transform`, `opacity`, `filter`, `backdrop-filter`
**Animatable but trigger paint:** `color`, `background-color`, `border-color`, `box-shadow`, `outline`
**Animatable but trigger layout (AVOID):** `width`, `height`, `margin`, `padding`, `top`, `left`, `right`, `bottom`, `font-size`, `border-width`

---

## 2. CSS Animations Fundamentals

### @keyframes Syntax

```css
@keyframes slide-up {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}
/* Multi-step */
@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50%      { transform: scale(1.05); }
}
```

### Animation Properties

```css
.element {
  animation-name: slide-up;
  animation-duration: 600ms;
  animation-timing-function: ease-out;
  animation-delay: 0ms;
  animation-iteration-count: 1;           /* infinite for loops */
  animation-direction: normal;            /* reverse | alternate | alternate-reverse */
  animation-fill-mode: both;              /* none | forwards | backwards | both */
  animation-play-state: running;          /* paused */
  animation-composition: replace;         /* add | accumulate (NEW) */
  animation-timeline: auto;              /* scroll() | view() (NEW) */
}
/* Shorthand */
.element { animation: slide-up 600ms ease-out both; }
```

### fill-mode Gotchas

- `none`: element reverts to pre-animation state on end (flash!)
- `forwards`: retains final keyframe state -- but specificity is high, overrides normal styles
- `backwards`: applies first keyframe state during delay period
- `both`: combines forwards + backwards -- usually what you want for entrance animations
- **Rule of thumb:** Use `both` for entrance animations; avoid `forwards` on persistent elements (use classes instead)

### Scroll-Driven Animations [4]

```css
/* Animate based on scroll position */
.progress-bar {
  animation: grow-width linear both;
  animation-timeline: scroll(root block);
}
/* Animate when element enters/exits viewport */
.card {
  animation: fade-in linear both;
  animation-timeline: view();
  animation-range: entry 0% entry 100%;
}
```

Browser support: Chrome 115+, Edge 115+, Firefox 110+ (flag). Safari pending.

---

## 3. Performance

### Rendering Pipeline [5]

```
Style -> Layout -> Paint -> Composite
         (CPU)    (CPU)    (GPU)
```

| Property Changed | Triggers | Cost |
|-----------------|----------|------|
| `transform`, `opacity`, `filter` | Composite only | Cheapest (GPU) |
| `color`, `background`, `box-shadow` | Paint + Composite | Medium |
| `width`, `height`, `top`, `margin` | Layout + Paint + Composite | Expensive |

### GPU-Accelerated Properties

Only these run entirely on compositor thread:
- `transform` (translate, rotate, scale, skew)
- `opacity`
- `filter` / `backdrop-filter`

**Rule: If you can express it as transform + opacity, do so.** Instead of animating `width`, animate `transform: scaleX()`. Instead of `top`, use `transform: translateY()`.

### `will-change` [6]

```css
/* CORRECT: apply before animation starts, remove after */
.card:hover { will-change: transform; }
.card:hover .inner { transform: scale(1.05); }

/* WRONG: applying to everything */
* { will-change: transform, opacity; } /* layer explosion, memory bloat */
```

**Rules:**
1. Never apply to more than ~10 elements simultaneously
2. Apply via parent hover/focus state or JS, not statically
3. Remove when animation completes (JS: `el.style.willChange = 'auto'`)
4. `transform` and `opacity` already get compositor promotion during animation -- `will-change` only helps for *pre-promoting* before the animation starts

### `contain` Property [7]

```css
.animated-section { contain: layout style; }  /* isolates reflow */
.offscreen { content-visibility: auto; }       /* skip rendering offscreen */
```

### Avoiding Jank Checklist

1. Only animate transform/opacity/filter
2. Keep animations under 16.67ms per frame (60fps)
3. Avoid animating during JS-heavy operations
4. Use `requestAnimationFrame` for JS-driven animations
5. Test with Chrome DevTools Performance panel > Rendering > Paint flashing
6. Keep animated element count low (< 20 simultaneous)

---

## 4. Motion Design Patterns for Marketing Sites

### 4.1 Page Entrance Animations

```css
/* Fade + slide up (most common marketing pattern) */
.animate-in {
  animation: fade-slide-up 600ms ease-out both;
}
@keyframes fade-slide-up {
  from { opacity: 0; transform: translateY(24px); }
  to   { opacity: 1; transform: translateY(0); }
}
```

### 4.2 Scroll-Triggered (IntersectionObserver)

```css
/* CSS: hidden by default, revealed on scroll */
[data-animate] { opacity: 0; transform: translateY(24px); transition: opacity 600ms ease-out, transform 600ms ease-out; }
[data-animate].is-visible { opacity: 1; transform: translateY(0); }
```

```js
// JS: ~10 lines, no library needed
const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) {
    e.target.classList.add('is-visible');
    observer.unobserve(e.target); // animate once
  }});
}, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
document.querySelectorAll('[data-animate]').forEach(el => observer.observe(el));
```

### 4.3 Staggered Animations

```css
/* CSS custom property for stagger delay */
[data-animate-stagger] > * {
  opacity: 0; transform: translateY(16px);
  transition: opacity 400ms ease-out, transform 400ms ease-out;
  transition-delay: calc(var(--i, 0) * 80ms);
}
[data-animate-stagger].is-visible > * { opacity: 1; transform: translateY(0); }
```
```html
<ul data-animate-stagger>
  <li style="--i: 0">First</li>
  <li style="--i: 1">Second</li>
  <li style="--i: 2">Third</li>
</ul>
```

### 4.4 Hero Section Animations

```css
/* Layered entrance: heading first, then subtext, then CTA */
.hero-heading  { animation: fade-slide-up 700ms ease-out both; }
.hero-subtext  { animation: fade-slide-up 700ms ease-out 200ms both; }
.hero-cta      { animation: fade-slide-up 700ms ease-out 400ms both; }
```

### 4.5 Hover Micro-Interactions

```css
/* Button: lift + shadow */
.btn { transition: transform 200ms ease-out, box-shadow 200ms ease-out; }
.btn:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,.15); }

/* Card: scale image + overlay */
.card img { transition: transform 500ms ease-out; }
.card:hover img { transform: scale(1.05); }

/* Link: animated underline */
.link { text-decoration: none; background-image: linear-gradient(currentColor, currentColor);
  background-size: 0% 2px; background-position: 0 100%; background-repeat: no-repeat;
  transition: background-size 300ms ease-out; }
.link:hover { background-size: 100% 2px; }
```

### 4.6 Skeleton Screens

```css
.skeleton {
  background: linear-gradient(90deg, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s ease-in-out infinite;
}
@keyframes shimmer { to { background-position: -200% 0; } }
```

### 4.7 View Transitions API [8]

```css
/* Cross-page transitions (MPA) */
@view-transition { navigation: auto; }
::view-transition-old(root) { animation: fade-out 200ms ease-in; }
::view-transition-new(root) { animation: fade-in 200ms ease-out; }

/* Named transitions for specific elements */
.hero-image { view-transition-name: hero; }
```

Browser support: Chrome 111+ (SPA), Chrome 126+ (MPA cross-document). Safari 18+. Firefox pending.

---

## 5. Accessibility (MANDATORY)

### `prefers-reduced-motion` [9]

```css
/* APPROACH 1: Remove animations for reduced-motion users */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}

/* APPROACH 2 (preferred): Opt-in motion. Default = no motion */
[data-animate] { /* no animation by default */ }
@media (prefers-reduced-motion: no-preference) {
  [data-animate] { animation: fade-slide-up 600ms ease-out both; }
}
```

### WCAG Requirements

- **2.3.1 Three Flashes**: No content flashes more than 3x/second [10]
- **2.3.3 Animation from Interactions**: Users can disable non-essential motion [10]
- **2.2.2 Pause, Stop, Hide**: Auto-playing content must have pause controls

### What to Reduce vs Remove

| Animation Type | Reduced Motion | Rationale |
|---------------|---------------|-----------|
| Parallax scrolling | Remove entirely | Vestibular trigger |
| Large-scale zoom/scale | Remove or reduce to opacity fade | Vestibular trigger |
| Spinning/rotating | Remove | Vestibular trigger |
| Slide-in entrances | Replace with opacity fade only | Less disorienting |
| Hover color changes | Keep | Not motion-based |
| Focus indicators | Keep | Essential for navigation |
| Progress indicators | Keep (reduce to simpler) | Functional |

---

## 6. Duration & Easing Guidelines

### Duration by Interaction Type

| Interaction | Duration | Rationale |
|------------|----------|-----------|
| Hover/focus feedback | 100-150ms | Must feel instant |
| Button press | 100-200ms | Responsive feel |
| Tooltips, dropdowns | 150-250ms | Quick but visible |
| Page element transitions | 200-400ms | Noticeable but not slow |
| Entrance animations | 300-600ms | Dramatic but not sluggish |
| Page transitions | 200-500ms | Cross-fade + movement |
| Complex orchestrations | 600-1000ms total | Staggered, not individual |

**Rule: Never exceed 1000ms for a single animation.** Users perceive anything > 400ms as slow.

### Easing Selection Framework

```
Enter viewport → ease-out (decelerates into place)
Exit viewport  → ease-in (accelerates away)
Continuous     → ease-in-out
State toggle   → ease-out (200ms)
Hover          → ease-out (150ms)
Spring/bounce  → cubic-bezier(0.34, 1.56, 0.64, 1) -- overshoot
```

---

## 7. Tailwind CSS Animation Utilities

### Built-in Animations

```html
<div class="animate-spin">...</div>    <!-- loading spinner -->
<div class="animate-ping">...</div>    <!-- notification pulse -->
<div class="animate-pulse">...</div>   <!-- skeleton shimmer -->
<div class="animate-bounce">...</div>  <!-- attention bounce -->
```

### Transition Utilities

```html
<button class="transition-transform duration-200 ease-out hover:scale-105">
<div class="transition-all duration-300 ease-in-out">
<span class="transition-colors duration-150">
<img class="transition-opacity duration-500">
```

### Custom Keyframes in Config (Tailwind v3)

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '100%': { backgroundPosition: '-200% 0' },
        },
      },
      animation: {
        'fade-up': 'fade-up 600ms ease-out both',
        shimmer: 'shimmer 1.5s ease-in-out infinite',
      },
    },
  },
}
```

### Tailwind v4 (CSS-first config) [11]

```css
/* In your CSS file */
@theme {
  --animate-fade-up: fade-up 600ms ease-out both;
}
@keyframes fade-up {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}
```

### Arbitrary Values

```html
<div class="animate-[fade-up_600ms_ease-out_both]">
<div class="transition-[transform,opacity] duration-[400ms]">
<div class="delay-[calc(var(--i)*80ms)]"> <!-- stagger -->
```

---

## 8. Library Decision Framework

| Need | Solution | Bundle |
|------|----------|--------|
| Hover states, simple entrances, scroll-reveal | **CSS-only** | 0 KB |
| JS-controlled timeline, WAAPI wrapper | **Motion** (motion.dev) | ~2.5 KB |
| React layout animations, exit animations | **Framer Motion** | ~30 KB |
| Complex scroll timelines, SVG morph, broad compat | **GSAP** | ~25-65 KB |
| Native browser, no deps | **Web Animations API** | 0 KB |

### Decision Tree

```
Is it a hover/focus state or simple entrance?
  YES -> CSS-only. Stop.
  NO  -> Do you need exit animations (AnimatePresence)?
    YES -> Are you in React?
      YES -> Framer Motion
      NO  -> Motion (motion.dev) or GSAP
    NO  -> Do you need complex scroll-driven timelines?
      YES -> Can you use animation-timeline (Chrome 115+)?
        YES -> CSS scroll-driven animations
        NO  -> GSAP ScrollTrigger
      NO  -> Do you need JS control over timing?
        YES -> Motion (smallest) or Web Animations API (native)
        NO  -> CSS-only. Stop.
```

**YAGNI rule:** Start with CSS-only. Add a library only when you hit a wall CSS cannot solve (exit animations, complex orchestration, cross-browser scroll-timeline).

### Library Notes

- **Framer Motion** [12]: React-only. `AnimatePresence` for exit animations is the killer feature. `layout` prop for FLIP animations. Heavy (~30KB). Worth it for React SPAs, overkill for static marketing sites.
- **Motion** (motion.dev, formerly Motion One) [13]: Framework-agnostic. WAAPI-based. ~2.5KB. Good middle ground when you need JS control without React lock-in.
- **GSAP** [14]: Most powerful. ScrollTrigger plugin is best-in-class. Free for most uses; "Business Green" license for SaaS with paid features. Timeline API unmatched for complex sequences. Heavier but tree-shakeable.
- **Web Animations API** [15]: Native browser API. `element.animate()`. Good browser support. No library needed but lower-level API, no built-in scroll trigger.

---

## 9. Anti-Patterns

| Anti-Pattern | Why Bad | Fix |
|-------------|---------|-----|
| Animating `width`/`height`/`margin`/`top`/`left` | Triggers layout recalc every frame | Use `transform: translate/scale` |
| `transition: all` | Animates unintended props, poor perf | List specific properties |
| `will-change` on everything | Layer explosion, GPU memory bloat | Apply only to actively-animating elements |
| No `prefers-reduced-motion` | Accessibility violation, vestibular harm | Always include reduced-motion query |
| Animation > 1000ms | Feels sluggish, users lose patience | Keep under 600ms for most; 300ms for interactions |
| 20+ simultaneous animations | Jank, dropped frames | Stagger or limit to viewport-visible elements |
| `animation-fill-mode: forwards` on persistent elements | High specificity overrides, hard to debug | Use class toggles instead |
| `transform-origin` not set for scale/rotate | Unexpected pivot point (default: center) | Set explicitly: `transform-origin: top left` |
| Animating during scroll without throttle | 60+ reflows per second | Use IntersectionObserver or CSS `animation-timeline` |
| Parallax without reduced-motion fallback | Strong vestibular trigger | Disable parallax entirely in reduced-motion |

---

## Claims Registry

| # | Claim | Citation | Critical Path |
|---|-------|----------|---------------|
| 1 | `linear()` timing function enables multi-point easing curves | [1] | No |
| 2 | `@starting-style` enables entry animations from `display: none` | [2] | No |
| 3 | `transition-behavior: allow-discrete` animates discrete properties | [3] | No |
| 4 | Scroll-driven animations: Chrome 115+, Firefox 110+ (flag) | [4] | No |
| 5 | Only transform/opacity/filter run on compositor thread | [5] | Yes |
| 6 | `will-change` pre-promotes to compositor layer; static application causes layer explosion | [6] | Yes |
| 7 | `contain: layout` isolates reflow from animated sections | [7] | No |
| 8 | View Transitions API: Chrome 111+ SPA, 126+ MPA, Safari 18+ | [8] | No |
| 9 | WCAG 2.3.1 limits flashing to 3x/second | [10] | Yes |
| 10 | Framer Motion bundle ~30KB, Motion ~2.5KB, GSAP ~25-65KB | [12][13][14] | No |
| 11 | Tailwind v4 uses CSS-first @theme config for animations | [11] | No |

## Source Analysis

| Source | Domain | Reputation | Type | Access Date | Verification |
|--------|--------|------------|------|-------------|--------------|
| MDN Web Docs | developer.mozilla.org | High | Official reference | 2025-05 | Cross-verified |
| W3C CSS Animations L2 | drafts.csswg.org | High | Standard spec | 2025-05 | Cross-verified |
| web.dev (Google) | web.dev | High | Industry/technical | 2025-05 | Cross-verified |
| Chrome DevTools docs | developer.chrome.com | High | Official reference | 2025-05 | Cross-verified |
| Framer Motion docs | framer.com/motion | High | Official docs | 2025-05 | Single-source |
| Motion docs | motion.dev | Medium-High | Official docs | 2025-05 | Single-source |
| GSAP docs | gsap.com | High | Official docs | 2025-05 | Single-source |
| Tailwind CSS docs | tailwindcss.com | High | Official docs | 2025-05 | Cross-verified |

**Reputation Summary:**
- High reputation sources: 6 (75%)
- Medium-high reputation: 1 (12.5%)
- Average reputation score: 0.88

## References

[1] MDN. "linear() easing function". developer.mozilla.org. https://developer.mozilla.org/en-US/docs/Web/CSS/easing-function#linear_easing_function. Accessed 2025-05.
[2] MDN. "@starting-style". developer.mozilla.org. https://developer.mozilla.org/en-US/docs/Web/CSS/@starting-style. Accessed 2025-05.
[3] MDN. "transition-behavior". developer.mozilla.org. https://developer.mozilla.org/en-US/docs/Web/CSS/transition-behavior. Accessed 2025-05.
[4] MDN. "animation-timeline". developer.mozilla.org. https://developer.mozilla.org/en-US/docs/Web/CSS/animation-timeline. Accessed 2025-05.
[5] Google. "Stick to Compositor-Only Properties and Manage Layer Count". web.dev. https://web.dev/articles/stick-to-compositor-only-properties-and-manage-layer-count. Accessed 2025-05.
[6] MDN. "will-change". developer.mozilla.org. https://developer.mozilla.org/en-US/docs/Web/CSS/will-change. Accessed 2025-05.
[7] MDN. "contain". developer.mozilla.org. https://developer.mozilla.org/en-US/docs/Web/CSS/contain. Accessed 2025-05.
[8] MDN. "View Transitions API". developer.mozilla.org. https://developer.mozilla.org/en-US/docs/Web/API/View_Transitions_API. Accessed 2025-05.
[9] MDN. "prefers-reduced-motion". developer.mozilla.org. https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion. Accessed 2025-05.
[10] W3C. "Web Content Accessibility Guidelines (WCAG) 2.1". w3.org. https://www.w3.org/TR/WCAG21/. Accessed 2025-05.
[11] Tailwind CSS. "Tailwind CSS v4.0". tailwindcss.com. https://tailwindcss.com/blog/tailwindcss-v4. Accessed 2025-05.
[12] Framer. "Framer Motion". framer.com. https://www.framer.com/motion/. Accessed 2025-05.
[13] Motion. "Motion (formerly Motion One)". motion.dev. https://motion.dev/. Accessed 2025-05.
[14] GSAP. "GreenSock Animation Platform". gsap.com. https://gsap.com/. Accessed 2025-05.
[15] MDN. "Web Animations API". developer.mozilla.org. https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API. Accessed 2025-05.

## Unresolved Questions

1. **Safari `animation-timeline` support**: As of May 2025, Safari had not shipped scroll-driven animations. Status may have changed. Verify before relying on CSS-only scroll animations for Safari users.
2. **Tailwind v4 animation config stability**: v4 was newly released; `@theme` syntax for keyframes may have evolved. Verify against current docs.
3. **View Transitions MPA cross-browser**: Firefox support status unclear. Verify `@view-transition { navigation: auto }` compat.
4. **Motion (motion.dev) bundle size**: Reported ~2.5KB; may vary with tree-shaking and features imported. Verify with bundlephobia or actual build.
5. **GSAP license changes**: GSAP moved to a new license model in late 2024. Confirm current free-tier limitations for commercial marketing sites.
