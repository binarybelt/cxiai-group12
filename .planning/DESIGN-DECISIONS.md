# Design Decisions — Design Delivery Accelerator

This document explains every design choice, where it came from, and why. It is intended to be defensible to hackathon judges. The CXI+AI Challenge brief asks for compliance and innovation — this document proves both.

---

## 1. Two-Layer Architecture

**Decision:** Dark premium app shell containing light compliant content previews in browser-frame mockups.

**Why:** The visual separation IS the thesis — "our tool is futuristic; what it produces is compliant." Dark shell uses Pfizer's own dark palette tokens (blue-90 through blue-100) from pfizer.com. Light preview matches deployed page appearance (WYSIWYG).

**Source:** Extracted from pfizer.com CSS — they use `--pfizer-blue-90: #000067` and `--pfizer-blue-100: #00003a` for footer/dark sections. We extrapolated: what if the dark palette was the foundation, not the exception?

---

## 2. Color System

**Decision:** Use Pfizer's REAL design tokens extracted from pfizer.com CSS custom properties.

**Why:** We did not invent a brand — we studied Pfizer's actual design system and built on it.

**Source:** CSS extraction from pfizer.com production stylesheets (March 2026). Full details in [PFIZER-BRAND-INTELLIGENCE.md](./PFIZER-BRAND-INTELLIGENCE.md).

**Key tokens used:**

| Token | Hex | Role | Origin |
|-------|-----|------|--------|
| pfizer-blue-70 | `#0000c9` | Primary brand blue | pfizer.com primary — NOT the old `#0070BF` |
| pfizer-blue-60 | `#2e29ff` | Electric accent | pfizer.com hero/banner backgrounds |
| pfizer-blue-90 | `#000067` | Dark base | pfizer.com dark sections |
| pfizer-blue-100 | `#00003a` | Deepest dark | pfizer.com footer gradients |
| Neutrals | `#f0f0f0` to `#0a0a0a` | 10-step neutral scale | Exact pfizer.com values |
| Pharma teal | `#00D4AA` | Data visualization accent | Introduced by us — NOT from Pfizer brand (clearly separated) |

**Compliance note:** App shell uses the dark palette. Generated content uses the light palette (blue-10 through blue-50) and stays within the approved token set defined in `tokens.json`. The compliance gate enforces this separation.

---

## 3. Typography

**Decision:** Space Grotesk (display) + Plus Jakarta Sans (body) + Space Mono (data).

**Why:** Pfizer uses proprietary PfizerDiatype and PfizerTomorrow (by MCKL Type, Los Angeles). These are not publicly available. We chose the closest open-source alternatives:

- **Space Grotesk** — geometric display face born from Space Mono, has the scientific/technical legitimacy that matches PfizerDiatype's character. Its distinctive letterforms (the 'a', 'g') give it a "designed" quality, not a "selected from dropdown" feel.
- **Plus Jakarta Sans** — influenced by Neuzeit Grotesk and Futura, the same geometric lineage as PfizerDiatype. Tall x-height, open counters, geometric precision. Closest proportional match to PfizerDiatype among open-source fonts.
- **Space Mono** — shares DNA with Space Grotesk (same designer), creating cohesive family feel for data/code contexts. Matches PfizerDiatypeMono's role.

**Source:** Font analysis via Google Fonts, MCKL Type foundry website (mckltype.com/custom/pfizer), and comparison with PfizerDiatype specimens extracted from pfizer.com CSS.

---

## 4. Background Atmosphere

**Decision:** Near-black (`#000014`) base with 3 drifting glow orbs, engineering grid, noise texture with overlay blend mode, and vignette.

**Why:** Static dark backgrounds read as "dark mode toggle." The drifting glows (25-35s cycles, barely perceptible) make the background feel alive. The engineering grid (64px at 1.8% white opacity) signals "precision tool." The vignette draws focus to center content. This is what Linear, Vercel, and Stripe do — multiple independent color fields at different z-planes.

**Source:** Analysis of Stripe's WebGL gradient system, Linear's UI redesign (linear.app/now), Vercel's Geist design system. CSS-only implementation (no WebGL) for performance.

---

## 5. Motion Design

**Decision:** Apple-style scroll reveals, choreographed entrance sequences, spring-physics micro-interactions, animated compliance gauge.

**Why:** Motion communicates quality. Specific choices:

- **Scroll reveals** (opacity + translateY + blur): elements emerge from blur as you scroll, staggered 80ms between siblings. Apple's product pages use this technique.
- **Hero entrance choreography**: 5-layer cascade (badge 0ms, title 150ms, subtitle 400ms, CTAs 550ms, preview 600ms with 3D perspective). Each element has intentional delay.
- **Spring physics** for buttons (scale 0.96 on press, snappy spring) instead of CSS ease timing. Springs feel natural because real objects don't have fixed durations.
- **Compliance gauge animation**: SVG ring fills on scroll-into-view, score bars scale from 0. Makes the compliance check feel dynamic and alive.
- **All motion respects `prefers-reduced-motion`** via MotionConfig wrapper — animations disable for users with accessibility settings.

**Source:** Motion library (framer-motion successor) documentation, Apple HIG motion guidelines, analysis of 10 premium enterprise products. Full motion system documented in [MOTION-DESIGN.md](./MOTION-DESIGN.md).

---

## 6. Glass Morphism Implementation

**Decision:** Subtle glass with top-lit borders, inset edge highlights, and multi-layer shadows.

**Why:** Generic glassmorphism (`backdrop-blur` + `rgba` background) has become a cliche. Our implementation adds:

- **Top-lit borders:** `border-top-color` slightly brighter than sides, simulating directional light.
- **Inset edge highlight:** `inset 0 1px 0 rgba(255,255,255,0.04)` — simulates light catching the glass surface edge.
- **Multi-layer shadows:** tight definition shadow + deep ambient shadow.
- **Hover state:** teal border tint + increased inset brightness + `translateY(-3px)`.

**Source:** Analysis of Apple visionOS glass materials, Linear's frosted panel implementation, and CSS-Tricks glassmorphism deep-dive.

---

## 7. Opacity-Based Color System

**Decision:** Use `rgba(255,255,255, opacity)` for ALL text and borders on dark backgrounds instead of named gray values.

**Why:** Named grays (Tailwind's `gray-300`, `gray-500`) are absolute colors that don't respond to the atmospheric background. White-at-opacity inherits the glow colors beneath — when a Pfizer blue glow is behind a card, the surface picks up a faint blue tint. This creates a cohesive, living color system automatically.

**Source:** Analysis of Linear's theme system (LCH color space), Vercel's Geist dark mode, and professional dark-mode implementation patterns.

**Specific values:**

| Category | Opacity levels |
|----------|---------------|
| Text | 93% (primary) / 55% (secondary) / 35% (tertiary) / 18% (muted) |
| Surfaces | 3% (card) / 5% (elevated) / 7% (hover) |
| Borders | 6% (subtle) / 10% (medium) / 16% (strong) |

---

## 8. Compliance Preservation

**Decision:** Never rename or remove existing design tokens. Only add new ones.

**Why:** The compliance system loads `tokens.json` at request time and builds Zod enum schemas dynamically. Renaming token IDs breaks schema validation, compliance checks, auto-fix, and the drift scanner. Adding new tokens safely expands the approved set.

**Implementation:** New dark-range tokens use different keys (`pfizer-blue-800`, `900`, `accent`) so existing `pfizer-blue-100`/`500`/`700` references continue working unchanged.

---

## 9. Browser Frame Wrapper

**Decision:** Generated content is displayed inside a browser-frame mockup (traffic light dots, URL bar, white content area).

**Why:** Creates clear visual boundary between app shell and generated content. Helps judges immediately understand the two-layer concept. The deployed URL in the address bar reinforces that this is a real, deployable page.

**Critical implementation detail:** The `previewRef` used by ComplianceSidebar for axe accessibility scanning must remain on the inner div wrapping PageRenderer, NOT the decorative browser frame. Wrong DOM subtree = silent compliance checking failure.

---

## 10. Pfizer Brand Evolution Story

**Key finding:** Pfizer's brand has evolved significantly beyond what public brand guides document:

- Primary blue shifted from `#0070BF` (2021 rebrand) to `#0000c9` (current pfizer.com).
- Custom type family PfizerDiatype replaced Noto Sans (Noto remains as fallback).
- PfizerTomorrow display face added for headlines.
- Electric blue `#2e29ff` introduced as high-energy accent (not in original rebrand).
- Full design token system with 10-step color scales.

Our tool uses these real, current tokens — not the outdated 2021 values. This demonstrates that we did the research and built something that belongs to TODAY'S Pfizer, not yesterday's.

---

## Sources

| Source | Location |
|--------|----------|
| Pfizer brand intelligence | [PFIZER-BRAND-INTELLIGENCE.md](./PFIZER-BRAND-INTELLIGENCE.md) |
| Motion design system | [MOTION-DESIGN.md](./MOTION-DESIGN.md) |
| Visual prototype v2 | [prototype-v2.html](./prototype-v2.html) |
| Visual prototype v1 (for comparison) | [prototype.html](./prototype.html) |
| pfizer.com CSS extraction | March 2026 |
| MCKL Type foundry | mckltype.com/custom/pfizer |
| Linear UI redesign | linear.app/now |
| Vercel Geist design system | vercel.com/geist |
| Motion library | motion.dev/docs/react |
