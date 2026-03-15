# Storytelling & Animation Upgrade — Design Spec

**Date:** 2026-03-15
**Status:** Approved
**Reference:** HackerRank B2B SaaS Landing Page by Ramotion (Dribbble)

## Overview

Transform the Design Delivery Accelerator from a feature-list presentation into a cinematic, scroll-driven story. Two parallel tracks applied in one pass:

1. **Copy rewrite** — every page's text rewritten for narrative arc and emotional impact
2. **Animation choreography** — scroll-triggered entrance animations on every section using Motion (framer-motion)

The goal: a judge skimming the site in 60 seconds should feel the problem, understand the insight, and want to try the product.

---

## 1. Narrative Arc (Site-Wide)

The site tells one story across pages:

| Stage | Page | Emotion | Headline direction |
|-------|------|---------|-------------------|
| Problem | Landing hero | Tension | "2,000 websites. One design system. Zero compliance gaps." |
| Pain | Landing problem | Empathy | Direct Pfizer quote: "back and forth, back and forth" |
| Insight | Landing features | Clarity | Show the product in action, not features |
| Experience | /build | Agency | "Describe the page you need" |
| Trust | /how-it-works + /audit-trail | Confidence | "How the AI Actually Works" / "Every Decision, Verified" |
| Scale | /scan | Ambition | "Point at any live URL. See where it's drifted." |

---

## 2. Navigation Restructure

### Current → New

| Current | New | Route | Reason |
|---------|-----|-------|--------|
| Home | *(logo click)* | / | Don't waste a nav slot |
| Build | Build | /build | Keep |
| Scan | Scan | /scan | Keep |
| Evidence | Audit Trail | /evidence | Clearer purpose — judges know what they'll find |
| Transparency | How It Works | /transparency | Judges will click this — name should invite them |
| Preview | Components | /preview | Describes what's actually on the page |

5 nav items instead of 6. Logo returns home.

---

## 3. Landing Page Copy Rewrite

### Hero Section

**Overline:**
```
PFIZER CXI+AI CHALLENGE 2026
```
(Drop "Group 12" — judges already know)

**Headline:**
```
2,000 websites.
One design system.
Zero compliance gaps.
```
- "Zero compliance gaps" in teal (#00D4AA) with text-shadow glow
- Line-by-line stagger animation (spring, 80ms per line)

**Subheadline:**
```
Every page your AI builds is compliant before it renders — not after.
The design system isn't a checklist. It's the only vocabulary the AI knows.
```

**CTAs:**
- Primary: "Start Building →" (keep)
- Secondary: "See How It Works" (link to /transparency instead of /scan)

### Problem Section

**Title:** THE PROBLEM (keep)

**Body — add Pfizer quote:**
```
"I'm the go-between — designers and marketers, back and forth, back and forth. It takes ages."
— Pfizer CXI presenter

A simple page update takes weeks. Dozens of agencies, no central oversight.
Existing AI tools generate freely then check.
The brand drifts a little more with every cycle.
```

### Feature Cards

**BUILD:**
```
Title: BUILD
Lead: "Create an HCP page for Ibrance, UK market, highlight new efficacy data."
Body: That's the brief. 45 seconds later, two compliant variants.
Every component from the approved library. Edit with chat. Deploy in one click.
```

**COMPLY:**
```
Title: COMPLY
Lead: "Can this page go live?"
Body: The compliance gate answers before the page renders — not after.
Brand tokens, pharma regulations, WCAG accessibility.
If it doesn't pass, it doesn't render.
```

**SCAN:**
```
Title: SCAN
Lead: "Which of our 2,000 sites have drifted?"
Body: Point at any live URL. The scanner extracts every token and flags
what's changed. One dashboard. Every property. Every drift detected.
```

### How It Works Steps

```
1. Describe what you need (plain English)
2. AI assembles from approved parts (not generates from scratch)
3. Compliance validates before render (gate, not report)
4. Chat to refine, deploy in seconds
```

### Differentiators Section

**Title:** "Why this is different" (not "What makes this different")

Rewrite each item to lead with the contrast:

```
- Other tools generate, then check. We constrain at generation — the AI can only compose from approved components.
- Compliance isn't a report you read after. It's a gate — pages cannot render until they pass.
- Every decision is logged — who, what, when, why. SHA-256 hash chain. Tamper-proof.
- Marketer, QA, Developer — each sees exactly what they need. Same system, different lens.
```

### Footer

```
Built for the Pfizer CXI+AI Challenge 2026 · Group 12
```

---

## 4. Inner Page Copy Rewrites

### /build

Header subtitle:
```
Current: "Type a brief to generate a compliant page from approved pharma components."
New: "Describe the page you need. The AI builds it from Pfizer's approved component library."
```

### /evidence (now "Audit Trail" in nav)

```
H1: "Every Decision, Verified"
Subtitle: "Tamper-proof audit trail — every AI decision hashed, chained, and verifiable. Click to prove it."
```

GuideCard title: keep "FDA 21 CFR Part 11 Audit Trail"

### /scan

```
H1: (add above ScanDashboard)
"Point at any live URL. See exactly where it's drifted from brand."
Subtitle: "The single pane of glass across 2,000+ properties."
```

Page subtitle:
```
Current: "Monitor brand compliance across your digital portfolio..."
New: "Scan any URL against the approved design system. Flag outdated tokens, missing components, compliance gaps."
```

### /transparency (now "How It Works" in nav)

```
H1: "How the AI Actually Works"
Subtitle: "Three agents. Six guardrails. Zero hallucination surface."
```

Section headings restructured as narrative:
```
1. "The Constraint Philosophy" (new section — body below)
2. "Three AI Agents" (keep)
3. "Six Anti-Hallucination Guardrails" (was: "Anti-Hallucination Strategy")
4. "What the AI Cannot Do" (was: "What AI Does NOT Do")
5. "Cost Efficiency" (keep)
6. "The Proof: Audit Trail" (was: "Audit Trail" — adds link to /evidence)
```

**"The Constraint Philosophy" section body:**
```
Most AI tools generate freely, then check what they made.
We took the opposite approach.

The design system — tokens, components, patterns — is loaded into the AI's
schema before generation starts. The AI cannot reference a color that isn't
in the approved palette. It cannot use a component that isn't in the library.
It cannot skip a required section like ISI or disclaimers.

This isn't prompt engineering. It's schema engineering. The Zod types that
define the AI's output literally cannot represent an unapproved component.
Compliance is structural, not aspirational.
```

### /preview (now "Components" in nav)

```
Overline: COMPONENT LIBRARY
H1: "The approved building blocks"
Subtitle: "Every component the AI can use. Nothing else exists."
```

---

## 5. Animation Choreography

All animations use the existing `motion-config.ts` presets. `page.tsx` becomes a client component (`"use client"`).

**Note on `"use client"`:** The current `page.tsx` is a pure Server Component with no async data fetching or server-only imports. Adding `"use client"` is safe — the page only renders static data arrays (`features`, `steps`, `differentiators`) which move cleanly to the client.

### Dependencies

- `motion` (already installed v12.36.0)
- `motion-config.ts` (SCROLL_REVEAL, SPRING, STAGGER, EASE already defined)

### Animation Strategy: Variants vs. whileInView

Two patterns are used — never mixed on the same element tree:

1. **Variant-driven stagger** (feature cards, steps, differentiators): Parent `motion.div` with `whileInView="visible"` + `staggerChildren`. Children use `variants` only — no `whileInView` on children. Parent triggers all children via the variant cascade.

2. **Standalone `SCROLL_REVEAL`** (problem card, headings, footer): Spread directly on a `motion.div`. Used only for isolated elements that are NOT children of a stagger parent.

**Rule:** If an element has a stagger parent, it uses `variants: { hidden, visible }`. If it's standalone, it uses `{...SCROLL_REVEAL}`.

### Global Pattern

Every section uses `whileInView` with `viewport: { once: true, margin: "-80px" }`. Reduced motion users get instant opacity transition only (no transforms).

### Hero Section

```typescript
// Entrance sequence (on page load, not scroll)
const heroVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.15 }
  }
}

// Overline: fade up
overline: { opacity: [0,1], y: [20,0] } // delay: 0

// Headline: each LINE staggers (not each word — 3 lines)
// These are children of heroVariants, so they use variants, not whileInView
headlineLine: { hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0 } }
// Parent staggerChildren: 0.15 controls timing between lines

// "Zero compliance gaps" — teal color + text-shadow
// CSS: text-shadow: 0 0 30px rgba(0,212,170,0.3)

// Subheadline: fade up
subheadline: { opacity: [0,1], y: [20,0] } // delay: 0.4

// CTAs: fade up
ctas: { opacity: [0,1], y: [20,0] } // delay: 0.6

// Device mockup: slide in from right with scale
mockup: { opacity: [0,1], x: [60,0], scale: [0.95,1] } // delay: 0.3, spring: GENTLE
```

### Device Mockup Upgrade

Replace flat browser chrome with tablet frame:

```tsx
// Outer: rounded container with gradient background
<div className="rounded-[2.5rem] bg-gradient-to-br from-pfizer-blue-900/60 via-pfizer-blue-800/40 to-teal/10 p-8 shadow-2xl">
  {/* Inner: existing browser mockup content */}
  <div className="rounded-xl border border-white/[0.08] bg-[#000014] p-6">
    {/* ... browser chrome + skeleton */}
  </div>
</div>
```

Two-wrapper structure to avoid transform conflicts:

```tsx
{/* Outer: perspective container (static, no animation) */}
<div style={{ perspective: "1200px" }}>
  {/* Middle: motion.div handles entry + idle float */}
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1, y: [0, -8, 0] }}
    transition={{
      opacity: { ...SPRING.GENTLE },
      scale: { ...SPRING.GENTLE },
      y: { duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }
    }}
  >
    {/* Inner: the tablet frame (gradient bg + browser mockup) */}
    <div className="rounded-[2.5rem] bg-gradient-to-br ...">
      ...
    </div>
  </motion.div>
</div>
```

Note: Remove the old `style={{ transform: "rotateY(-8deg)" }}` — the tablet frame design replaces the 3D tilt effect.

### Problem Section

```typescript
// Scroll-triggered
card: SCROLL_REVEAL // existing preset: { opacity: 0→1, y: 32→0, blur: 4→0 }

// Border glow pulse on entry
borderGlow: {
  boxShadow: [
    "0 0 0 rgba(46,41,255,0)",
    "0 0 20px rgba(46,41,255,0.15)",
    "0 0 0 rgba(46,41,255,0)"
  ]
} // duration: 2s, delay: 0.6
```

### Feature Cards (BUILD / COMPLY / SCAN)

Uses **variant-driven stagger** — parent `motion.section` triggers children.

```typescript
// Parent container (motion.section with whileInView)
const cardContainerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } }
}

// Each card (uses variants, NOT whileInView)
const cardVariants = {
  hidden: { opacity: 0, y: 48, scale: 0.96 },
  visible: {
    opacity: 1, y: 0, scale: 1,
    transition: { duration: 0.6, ease: EASE.out }
  }
}

// Icon inside card (uses variants, NOT whileInView)
const iconVariants = {
  hidden: { rotate: -10, scale: 0.8 },
  visible: {
    rotate: 0, scale: 1,
    transition: { delay: 0.3, ...SPRING.BOUNCY } // spread spring props
  }
}

// Hover: use Tailwind classes on the <Link>, not motion
// Add: hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(0,0,0,0.3)]
// The <Link> is wrapped in <motion.div variants={cardVariants}>
```

### How It Works Steps

Heading uses standalone `SCROLL_REVEAL`. Steps use **variant-driven stagger**.

```typescript
// Heading — standalone, not in stagger tree
<motion.h2 {...SCROLL_REVEAL}>How it works</motion.h2>

// Steps container (motion.div with whileInView)
const stepsContainerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } }
}

// Step number circle (variant, NOT whileInView)
const numberVariants = {
  hidden: { scale: 0 },
  visible: {
    scale: 1,
    transition: { ...SPRING.BOUNCY } // spread spring props directly
  }
}

// Step text (variant)
const stepTextVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 }
}

// Connector lines between steps (variant)
const connectorVariants = {
  hidden: { scaleX: 0 },
  visible: {
    scaleX: 1,
    transition: { duration: 0.4, ease: EASE.out }
  }
}
// Apply style={{ transformOrigin: "left" }} on the motion.div
```

### Differentiators (Checkmark Cascade)

Uses **variant-driven stagger**. Checkmark SVG `<path>` becomes `<motion.path>`.

```typescript
// Container
const diffContainerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } }
}

// Each item (variant)
const diffItemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 }
}

// Checkmark SVG — change <path> to <motion.path>
// motion auto-measures path length when animating pathLength
const checkmarkVariants = {
  hidden: { pathLength: 0 },
  visible: {
    pathLength: 1,
    transition: { duration: 0.4, ease: EASE.out }
  }
}
```

### Footer

```typescript
footer: SCROLL_REVEAL // simple fade
```

---

## 6. Performance & Accessibility

### Performance
- `will-change: transform, opacity` added only during animation via motion's automatic management
- All animations use `transform` and `opacity` only (compositor-friendly, no layout thrash)
- No animation on elements below the fold until they enter viewport (`once: true` prevents re-triggering)
- Device mockup idle float uses motion's `animate` with `repeat: Infinity` — transforms only, GPU-accelerated

### Accessibility
- `prefers-reduced-motion: reduce` → all animations collapse to instant opacity fade (no transforms)
- Existing `MotionConfig reducedMotion="user"` wraps the app
- No content hidden behind animation — everything is in the DOM from render
- No autoplay video or flashing elements

### Bundle Impact
- `motion` already in bundle (v12.36.0)
- No new dependencies
- Estimated addition: ~2KB gzipped (motion variants + wrapper components)

---

## 7. Files Changed

| File | Change |
|------|--------|
| `src/app/page.tsx` | Full rewrite: copy + animations + device mockup upgrade. Add `"use client"`, import motion. |
| `src/components/app-nav.tsx` | Rename labels: Evidence→"Audit Trail", Transparency→"How It Works", Preview→"Components". Remove "Home" entry. |
| `src/app/build/page.tsx` | Update subtitle copy |
| `src/app/evidence/page.tsx` | Update H1 and subtitle copy |
| `src/app/scan/page.tsx` | Add H1 + subtitle above ScanDashboard, update description copy |
| `src/app/transparency/page.tsx` | Update H1, subtitle, section headings |
| `src/app/preview/page.tsx` | Update overline, H1, subtitle copy |

**No new files. No new dependencies. No route changes** (URLs stay the same — only nav labels change).

**Additional fix:** COMPLY card `href` changes from `/build` to `/transparency` (links to the compliance explanation, not the build workspace). Also remove dead code: the `href === "/"` special case in `app-nav.tsx` active-link detection after removing the Home entry.

---

## 8. Implementation Order

Single pass, top to bottom:

1. Navigation rename (app-nav.tsx) — 2 min
2. Landing page full rewrite (page.tsx) — the big one
3. Inner page copy updates (4 files) — 5 min each
4. Visual verification in browser
5. Reduced motion check

Total: one implementation session, one commit.
