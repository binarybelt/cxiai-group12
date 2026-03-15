# Design Upgrade Plan

**Goal:** Upgrade the Design Delivery Accelerator from "3.5/10 hackathon prototype" to "billion-dollar enterprise pharma" visual quality.

**Constraint:** This plan is self-contained. A future Claude session with zero context can read this file and execute the entire upgrade.

---

## Two-Layer Architecture

1. **App Shell** (dark, premium, "Future Pfizer"): Landing page, BUILD workspace, chat panel, nav, compliance sidebar, deploy panel. Gets the premium treatment. Near-black backgrounds, glass surfaces, electric blue accents, atmospheric glows.
2. **Generated Content** (light, compliant Pfizer): Pages the tool produces stay within Pfizer brand guidelines. Rendered inside a browser-frame mockup within the dark shell. White cards on dark glass IS the two-layer concept.

---

## Prerequisites

### Git Setup
```bash
git worktree add ../design-upgrade-worktree -b design-upgrade
cd ../design-upgrade-worktree
```
Work ONLY in the worktree. Never touch main.

### Install
```bash
npm install motion
```
That is ALL. No shadcn/ui, no Tremor, no other UI libraries.

### Visual Reference
The design prototype is at `.planning/prototype-v2.html` — open it in a browser to see the target visual. Additional references:
- Design rationale: `.planning/DESIGN-DECISIONS.md`
- Pfizer brand intelligence: `.planning/PFIZER-BRAND-INTELLIGENCE.md`
- Motion design system: `.planning/MOTION-DESIGN.md`

---

## Phase 1: Foundation (LOW RISK)

### 1.1 — `src/app/layout.tsx`

Current state: No custom fonts, no `antialiased` class, plain `<body>` tag.

Changes:
- Import Space Grotesk, Plus Jakarta Sans, and Space Mono via `next/font/google`
- Add font CSS variables (`--font-display`, `--font-body`, `--font-mono`) to the `<html>` element
- Add `antialiased` class to `<body>`
- Apply `font-body` as the default body font

```tsx
import { Space_Grotesk, Plus_Jakarta_Sans, Space_Mono } from "next/font/google";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const spaceMono = Space_Mono({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

// On <html>:
<html lang="en" className={`${spaceGrotesk.variable} ${plusJakartaSans.variable} ${spaceMono.variable}`}>
  <body className="antialiased font-body">
```

### 1.2 — `tailwind.config.ts`

Current state: Has `pfizer.blue.100`, `pfizer.blue.500`, `pfizer.blue.700`, plus `coral`, `amber`, `gray`, `success`, `warning`, `error` color tokens.

**CRITICAL SAFETY RULES:**
- Token changes must be ADDITIVE ONLY
- Existing `pfizer-blue-100` (`#E6F4FB`), `pfizer-blue-500` (`#0093D0`), `pfizer-blue-700` (`#006699`) MUST NOT change
- The new dark tokens use DIFFERENT keys (`800`, `900`, `accent`)
- Do NOT rename or remove any existing key

ADD these new color tokens under `colors.pfizer.blue`:
```ts
800: "#000067",   // Dark Pfizer blue
900: "#00003a",   // Deepest Pfizer blue
accent: "#2e29ff", // Electric Pfizer blue for interactive highlights
```

ADD a new top-level color:
```ts
teal: {
  DEFAULT: "#00D4AA", // Pharma teal accent — success, data, progress
},
```

ADD `fontFamily` to `theme.extend`:
```ts
fontFamily: {
  display: ["var(--font-display)", "system-ui", "sans-serif"],
  body: ["var(--font-body)", "system-ui", "sans-serif"],
  mono: ["var(--font-mono)", "ui-monospace", "monospace"],
},
```

ADD `animation` and `keyframes` to `theme.extend`:
```ts
keyframes: {
  shimmer: {
    "0%": { backgroundPosition: "-200% 0" },
    "100%": { backgroundPosition: "200% 0" },
  },
  drift: {
    "0%, 100%": { transform: "translate(0, 0)" },
    "50%": { transform: "translate(30px, -20px)" },
  },
  pulse: {
    "0%, 100%": { opacity: "0.4" },
    "50%": { opacity: "1" },
  },
  gaugeFill: {
    from: { "stroke-dashoffset": "283" },
  },
  barFill: {
    from: { transform: "scaleX(0)" },
    to: { transform: "scaleX(1)" },
  },
},
animation: {
  shimmer: "shimmer 2s ease-in-out infinite",
  drift: "drift 20s ease-in-out infinite",
  pulse: "pulse 2s ease-in-out infinite",
  "gauge-fill": "gaugeFill 2s cubic-bezier(0.4, 0, 0.2, 1) forwards",
  "bar-fill": "barFill 1s cubic-bezier(0.4, 0, 0.2, 1) forwards",
},
```

ADD `backdropBlur` utilities to `theme.extend`:
```ts
backdropBlur: {
  xs: "2px",
},
```

### 1.3 — `src/app/globals.css`

Current state: Light color scheme, radial-gradient background, basic body styles.

Changes — ADD the following (do not remove existing `:root` or `body` rules, but the `html` background and `body` font-family will be overridden):

```css
/* ---- Atmosphere background ---- */
html {
  min-height: 100%;
  background: #000014; /* near-black base with blue undertone */
}

body {
  position: relative;
}

/* Three glow orbs with drift animation */
body::before {
  content: "";
  position: fixed;
  inset: 0;
  z-index: -2;
  background:
    radial-gradient(ellipse 600px 400px at 15% 20%, rgba(0, 0, 103, 0.35), transparent),
    radial-gradient(ellipse 500px 500px at 80% 60%, rgba(46, 41, 255, 0.12), transparent),
    radial-gradient(ellipse 400px 300px at 50% 90%, rgba(0, 212, 170, 0.08), transparent);
  animation: drift 20s ease-in-out infinite;
  pointer-events: none;
}

/* Engineering grid */
body::after {
  content: "";
  position: fixed;
  inset: 0;
  z-index: -1;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
  background-size: 60px 60px;
  pointer-events: none;
}

/* Noise overlay */
.noise-overlay {
  position: fixed;
  inset: 0;
  z-index: 0;
  opacity: 0.03;
  mix-blend-mode: overlay;
  background-image: url("data:image/svg+xml,..."); /* inline noise SVG or use CSS grain */
  pointer-events: none;
}

/* Vignette */
.vignette {
  position: fixed;
  inset: 0;
  z-index: 0;
  background: radial-gradient(ellipse at center, transparent 50%, rgba(0, 0, 20, 0.4));
  pointer-events: none;
}

/* ---- Skeleton shimmer ---- */
.skeleton-shimmer {
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.03) 25%,
    rgba(255, 255, 255, 0.08) 50%,
    rgba(255, 255, 255, 0.03) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 2s ease-in-out infinite;
}

/* ---- Selection color ---- */
::selection {
  background: rgba(46, 41, 255, 0.3);
  color: white;
}

/* ---- Smooth scroll ---- */
html {
  scroll-behavior: smooth;
}

/* ---- Scrollbar styling ---- */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
}
::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.2);
}

/* ---- Reduced motion ---- */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
  html {
    scroll-behavior: auto;
  }
}
```

### 1.4 — Create `src/lib/motion-config.ts`

New file. Spring presets and timing constants for the `motion` library:

```ts
export const SPRING = {
  SNAPPY: { type: "spring" as const, stiffness: 500, damping: 30, mass: 1 },
  SMOOTH: { type: "spring" as const, stiffness: 300, damping: 30, mass: 1 },
  GENTLE: { type: "spring" as const, stiffness: 200, damping: 25, mass: 1 },
  BOUNCY: { type: "spring" as const, stiffness: 400, damping: 15, mass: 1 },
} as const;

export const EASE = {
  out: [0.16, 1, 0.3, 1] as const,
  inOut: [0.4, 0, 0.2, 1] as const,
  bounce: [0.34, 1.56, 0.64, 1] as const,
} as const;

export const STAGGER = {
  DEFAULT: 0.08, // 80ms between siblings
  FAST: 0.04,
  SLOW: 0.12,
} as const;

export const DURATION = {
  fast: 0.15,
  normal: 0.3,
  slow: 0.6,
  gauge: 2,
} as const;

/** Standard scroll-reveal animation props */
export const SCROLL_REVEAL = {
  initial: { opacity: 0, y: 32, filter: "blur(4px)" },
  whileInView: { opacity: 1, y: 0, filter: "blur(0px)" },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
} as const;
```

### 1.5 — Create `src/components/motion-provider.tsx`

New file. Wraps the app in motion's `MotionConfig` to respect reduced motion:

```tsx
"use client";

import { MotionConfig } from "motion/react";

export function MotionProvider({ children }: { children: React.ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      {children}
    </MotionConfig>
  );
}
```

Then wrap `{children}` in `src/app/layout.tsx` with `<MotionProvider>` (inside `<Providers>`).

### Phase 1 Verification
```bash
npm test
npm run build
```
ALL tests must pass. Build must succeed. No visual regressions expected since we only added tokens and CSS.

---

## Phase 2: App Chrome (LOW RISK)

### 2.1 — `src/components/app-nav.tsx`

Current state (53 lines): White `bg-white` navbar, `border-b border-gray-200`, plain text logo, simple active state with `bg-pfizer-blue-100`.

Target: Glass navbar with premium dark treatment.

Changes:
- Replace `bg-white` with `bg-[rgba(0,0,20,0.6)] backdrop-blur-xl`
- Replace `border-gray-200` with `border-white/[0.06]`
- Logo text: Use `font-display` (Space Grotesk), add gradient icon mark (SVG shield or molecule icon with `bg-gradient-to-br from-pfizer-blue-accent to-teal`)
- Active indicator: Replace `bg-pfizer-blue-100 text-pfizer-blue-700` with `text-white` + bottom electric blue bar (`after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-pfizer-blue-accent after:shadow-[0_0_8px_rgba(46,41,255,0.5)]`)
- Inactive links: `text-white/55 hover:text-white/90`
- Overall text: white at appropriate opacity levels

### 2.2 — `src/app/page.tsx`

Current state (208 lines): Centered hero, light backgrounds, standard cards.

Target: Premium dark landing page with asymmetric hero, scroll reveals, glass cards.

Changes:
- **Hero section**: Asymmetric layout (headline flush-left, product preview right with 3D perspective via `perspective: 1200px` and `rotateY(-8deg)`). Use `font-display` at tight `tracking-[-0.03em]`. Text: `text-white/93`. Overline: `text-pfizer-blue-accent font-mono uppercase tracking-[0.3em]`. CTA: `bg-[#0000c9]` with hover glow.
- **Feature cards**: Wrap in `motion.div` with staggered scroll reveals (80ms stagger). Glass styling: `bg-white/[0.03] border border-white/[0.06] backdrop-blur-sm`. Top-lit border: `border-t-white/[0.16]`. Icon containers: gradient backgrounds.
- **Problem statement section**: Remove `bg-gray-900` (redundant on dark bg), use subtle glass card instead.
- **How it works**: Step numbers with gradient backgrounds, connecting lines between steps.
- **Differentiators**: Teal checkmarks (`text-teal`), white text.
- **Footer**: `text-white/35`, minimal.
- Remove `GuideCard` from landing page — it's a workspace element, not a marketing element.
- All text colors switch to white at various opacities (93%, 55%, 35%, 18%).

### 2.3 — `src/app/build/page.tsx`

Current state (23 lines): White header with gray border.

Changes:
- Replace `bg-white` with `bg-transparent`
- Replace `border-gray-200` with `border-white/[0.06]`
- Text: `text-white/55`
- Minimal polish — the heavy lifting is in build-ui.tsx

### Phase 2 Verification
```bash
npm test
npm run build
```
Open browser, visually check landing page and /build header. No test regressions expected since these files have no tests.

---

## Phase 3: Build Workspace (HIGH RISK — surgical only)

**Strategy:** 80/20 approach. Touch structural wrappers only. Do NOT refactor state logic or reconcile role-views. The file `build-ui.tsx` is 784 lines with 13+ state variables and NO tests.

### 3.1 — `src/components/build-ui.tsx`

Current state: 784 lines, white backgrounds, `border-gray-200` everywhere, `bg-white` cards. The `previewRef` on line 83 is a `useRef<HTMLDivElement>` that is attached to the inner div wrapping `PageRenderer` (line 644). The `ComplianceSidebar` uses this ref for axe scanning (line 105 of compliance-sidebar.tsx).

Changes (surgical — class string edits only):

1. **Dark container wrapper** — Wrap the entire return (line 294) in a dark container:
   ```tsx
   <div className="flex flex-1 flex-col overflow-hidden bg-[#000014] text-white">
   ```

2. **Role toggle bar** (line 296) — Glass styling:
   - Replace `border-gray-200 bg-white` with `border-white/[0.06] bg-white/[0.03] backdrop-blur-sm`
   - Active button: Replace `bg-pfizer-blue-700 text-white` with `bg-pfizer-blue-accent text-white shadow-[0_0_12px_rgba(46,41,255,0.3)]`
   - Inactive button: Replace `border border-gray-200 bg-white text-gray-700 hover:border-pfizer-blue-300` with `border border-white/[0.08] bg-white/[0.03] text-white/55 hover:border-white/[0.16] hover:text-white/90`

3. **Three column containers** — Apply glass styling:
   - Left column (line 318): Keep `p-6`, add `bg-white/[0.02]`
   - Middle column (line 567): Keep `p-6`, leave as-is (content is white cards)
   - Right column / aside elements: Replace `bg-gray-50 border-l border-gray-200` with `bg-white/[0.02] border-l border-white/[0.06]`

4. **Browser-frame wrapper around preview** (line 641-648):
   CRITICAL: The `ref={previewRef}` MUST stay on the inner `<div>` wrapping `<PageRenderer>`, NOT on the frame. The `ComplianceSidebar` axe scanner calls `previewRef.current` to get the DOM container.

   Wrap the existing preview container in a browser-frame:
   ```tsx
   {currentSpec && (
     <div className="flex-1 overflow-hidden rounded-xl border border-white/[0.08] bg-[#1a1a2e]">
       {/* Browser frame chrome */}
       <div className="flex items-center gap-2 border-b border-white/[0.06] bg-white/[0.03] px-4 py-2">
         <div className="flex gap-1.5">
           <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
           <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
           <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
         </div>
         <div className="flex-1 rounded-md bg-white/[0.05] px-3 py-1 text-xs text-white/35 font-mono">
           pfizer.com/{currentSpec.product?.toLowerCase() ?? "page"}
         </div>
       </div>
       {/* Actual preview — ref MUST be on this inner div */}
       <div className="preview-sandbox overflow-auto bg-white p-4">
         <style>{`.preview-sandbox a { pointer-events: none; cursor: default; }`}</style>
         <div ref={previewRef}>
           <PageRenderer spec={currentSpec} />
         </div>
       </div>
     </div>
   )}
   ```

5. **Leave interior cards white** — White cards inside the left/right columns stay white. White on dark glass IS the two-layer concept. But update their borders from `border-gray-200` to `border-white/[0.08]` and backgrounds from `bg-white` to `bg-white/95` so they work on the dark background.

6. **Replace raw score number** (line 681) with an animated SVG gauge:
   ```tsx
   <svg className="mx-auto" width="120" height="120" viewBox="0 0 120 120">
     <circle cx="60" cy="60" r="45" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
     <circle
       cx="60" cy="60" r="45" fill="none"
       stroke={overallScore > 80 ? "#00D4AA" : overallScore > 60 ? "#FFD166" : "#DC2626"}
       strokeWidth="8"
       strokeLinecap="round"
       strokeDasharray="283"
       strokeDashoffset={283 - (283 * overallScore) / 100}
       className="animate-gauge-fill"
       transform="rotate(-90 60 60)"
     />
     <text x="60" y="60" textAnchor="middle" dominantBaseline="central"
       className="fill-white font-mono text-2xl font-bold">
       {overallScore}
     </text>
   </svg>
   ```

7. **Skeleton shimmer for generating state** (line 605-622) — Replace `animate-pulse bg-gray-200` with `skeleton-shimmer bg-white/[0.04] rounded-2xl`.

8. **Pipeline steps component** — Add above the loading skeleton when generating:
   ```tsx
   {(phase === "interpreting" || phase === "generating") && (
     <div className="flex items-center gap-3 px-2">
       {["Interpret", "Generate", "Comply", "Render"].map((step, i) => {
         const activeIdx = phase === "interpreting" ? 0 : 1;
         const isActive = i === activeIdx;
         const isDone = i < activeIdx;
         return (
           <div key={step} className="flex items-center gap-2">
             <div className={`h-2.5 w-2.5 rounded-full ${
               isDone ? "bg-teal" : isActive ? "bg-pfizer-blue-accent animate-pulse shadow-[0_0_8px_rgba(46,41,255,0.5)]" : "bg-white/10"
             }`} />
             <span className={`text-xs font-mono ${
               isDone ? "text-teal" : isActive ? "text-white" : "text-white/30"
             }`}>{step}</span>
             {i < 3 && <div className={`h-px w-8 ${isDone ? "bg-teal/50" : "bg-white/10"}`} />}
           </div>
         );
       })}
     </div>
   )}
   ```

9. **Text color updates** — Throughout the file, update class references:
   - `text-gray-700` on labels → `text-white/70`
   - `text-gray-500` on descriptions → `text-white/55`
   - `text-gray-400` on placeholders → keep (they work on dark)
   - `text-gray-900` on headings → `text-white`
   - `bg-white` on form elements → `bg-white/[0.05]` with `text-white` and `border-white/[0.08]`

**DO NOT:**
- Refactor state logic
- Reconcile role-views
- Change the `previewRef` attachment point
- Add or remove state variables
- Modify the `handleSubmit`, `handleAutoFix`, or `handleChatEdit` functions

### 3.2 — `src/components/chat-panel.tsx`

Current state (199 lines): White container, basic message bubbles, text input.

Changes:
- Container: Replace `border-gray-200 bg-white` with `border-white/[0.08] bg-white/[0.03] backdrop-blur-sm`
- Header text: `text-white/90` and `text-white/40`
- Message avatars: Add a small colored dot before each message:
  - AI messages: `before:content-[''] before:h-5 before:w-5 before:rounded-full before:bg-gradient-to-br before:from-pfizer-blue-accent before:to-teal before:flex-shrink-0`
  - User messages: neutral gray dot
- User bubbles: Replace `bg-pfizer-blue-50 text-pfizer-blue-800` with `bg-pfizer-blue-accent/20 text-white/90`
- AI bubbles: Replace `bg-gray-100 text-gray-700` with `bg-white/[0.05] text-white/80`
- Typing indicator: When `isEditing`, show 3 animated dots:
  ```tsx
  {isEditing && (
    <div className="flex gap-1 self-start px-3 py-2">
      {[0, 1, 2].map((i) => (
        <span key={i} className="h-1.5 w-1.5 rounded-full bg-white/40 animate-pulse" style={{ animationDelay: `${i * 200}ms` }} />
      ))}
    </div>
  )}
  ```
- Input: Replace `border-gray-200` with `border-white/[0.08] bg-white/[0.05] text-white`
- Submit button: `bg-pfizer-blue-accent` with hover glow
- Preserve Enter-to-submit behavior (currently uses form submit)
- Challenge prompt pills: Replace `border-red-200 bg-red-50 text-red-600` with `border-red-500/30 bg-red-500/10 text-red-400`

### 3.3 — `src/components/compliance-sidebar.tsx`

Current state (261 lines): White cards, basic score bars, simple severity dots.

**MUST preserve all 7 existing tests** in `src/components/__tests__/compliance-sidebar.test.tsx`.

Changes:
- Container `<aside>`: Replace `border-l border-gray-200 bg-gray-50` with `border-l border-white/[0.06] bg-white/[0.02]`
- Score cards: Replace `border-gray-200 bg-white` with `border-white/[0.08] bg-white/[0.04]`
- Score text colors: Keep the same semantic colors (green/yellow/red) but ensure they're visible on dark
- **ScoreBar** sub-component: Add CSS animation on the bar width:
  - Replace `transition-all duration-300` with `animate-bar-fill` and `transform-origin: left`
  - Bar track: `bg-white/[0.06]` instead of `bg-gray-200`
  - Label text: `text-white/60` instead of `text-gray-600`
- **Gauge component** for overall score: Same SVG gauge as in build-ui.tsx marketer view
- Pass/fail gate indicator: Add a glow dot next to "Compliance Score":
  ```tsx
  <span className={`inline-block h-2 w-2 rounded-full ${
    score.overall >= 80 ? "bg-teal shadow-[0_0_6px_rgba(0,212,170,0.5)]" : "bg-red-500 shadow-[0_0_6px_rgba(220,38,38,0.5)]"
  }`} />
  ```
- Violation text: `text-white/70` instead of `text-gray-700`
- "All checks passed" text: `text-teal` instead of `text-green-600`
- Auto-fix button: `bg-pfizer-blue-accent/20 text-pfizer-blue-accent hover:bg-pfizer-blue-accent/30`

**Test safety:** The tests mock `runBrandChecks`, `runPharmaChecks`, `computeScore`, `applyAutoFix`. They check for text content and rendered elements, NOT class names. The styling changes will not break tests. Verify by running:
```bash
npm test -- src/components/__tests__/compliance-sidebar.test.tsx
```

### 3.4 — `src/components/deploy-panel.tsx`

Current state (136 lines): White card, simple button, basic status indicators.

Changes:
- Container: Replace `border-gray-200 bg-white` with `border-white/[0.08] bg-white/[0.04]`
- Label: `text-white/50` instead of `text-gray-500`
- Deploy button: `bg-[#0000c9]` (Pfizer blue-70 CTA) with `hover:shadow-[0_0_20px_rgba(0,0,201,0.4)]`
- **Step progress visualization**: Replace spinner with step indicators:
  ```tsx
  {(status === "generating-html" || status === "deploying") && (
    <div className="flex items-center gap-3">
      {["HTML", "Deploy", "Live"].map((step, i) => {
        const activeIdx = status === "generating-html" ? 0 : 1;
        return (
          <div key={step} className="flex items-center gap-2">
            <div className={`h-2 w-2 rounded-full ${
              i < activeIdx ? "bg-teal" : i === activeIdx ? "bg-pfizer-blue-accent animate-pulse" : "bg-white/10"
            }`} />
            <span className={`text-xs font-mono ${
              i <= activeIdx ? "text-white/80" : "text-white/30"
            }`}>{step}</span>
          </div>
        );
      })}
    </div>
  )}
  ```
- **Success glow animation**: On `status === "live"`:
  ```tsx
  <div className="rounded-xl border border-teal/30 bg-teal/10 p-3 shadow-[0_0_20px_rgba(0,212,170,0.15)]">
  ```
- Error state: `border-red-500/30 bg-red-500/10` with `text-red-400`

### Phase 3 Verification
```bash
npm test
npm run build
```
ALL tests must pass. Specifically verify:
- `src/components/__tests__/compliance-sidebar.test.tsx` — 7 tests
- `src/components/__tests__/page-renderer.test.tsx` — 7 tests
- `src/components/__tests__/components.test.tsx`

Open browser, test the full flow: type a brief, generate, see the browser-frame preview, chat-edit, deploy.

---

## Phase 4: Secondary Surfaces (LOW RISK, optional)

Only do this if Phases 1-3 are solid and time permits.

### 4.1 — `src/components/scan-dashboard.tsx`

Changes:
- Cards: Glass styling `bg-white/[0.03] border border-white/[0.08]`
- Status badges: Keep semantic colors but adjust for dark background
- Score colors: Ensure contrast on dark
- Table rows: `hover:bg-white/[0.03]`

### 4.2 — `src/app/scan/page.tsx`

Changes:
- Replace native `<details>` with a styled collapsible using `motion`:
  ```tsx
  import { motion, AnimatePresence } from "motion/react";
  // Replace <details> with button + AnimatePresence
  ```
- Dark background treatment consistent with build page
- Text colors: white opacity scale

### 4.3 — `src/components/explainability-panel.tsx`

Changes:
- Expand/collapse with `motion` animation (height auto-animate)
- Glass card styling
- White text on dark

### 4.4 — `src/components/audit-trail.tsx`

Changes:
- Timeline: Left border with dots, connecting line
- Entries: Glass card styling
- Timestamps: `font-mono text-white/35`
- Actor labels: Teal for agents, white for system

### Phase 4 Verification
```bash
npm test
npm run build
```

---

## Phase 5: Generated Content Polish (MINIMAL, compliance-safe)

### 5.1 — `src/design-system/tokens.json`

ADD new tokens only. Never rename or remove existing tokens. The current file has `primary-blue-100`, `primary-blue-500`, `primary-blue-700`, `white`, and more.

Add expanded color stops:
```json
{
  "id": "primary-blue-300",
  "category": "color",
  "name": "Pfizer Blue Light",
  "value": "#66C2E8",
  "description": "Light interactive blue for hover states."
},
{
  "id": "teal-500",
  "category": "color",
  "name": "Pharma Teal",
  "value": "#00D4AA",
  "description": "Success and data accent color."
}
```

### 5.2 — `src/components/page-renderer.tsx`

Current state: Renders sections by mapping over `spec.sections` and rendering components from `COMPONENT_REGISTRY`.

**CRITICAL: 7 tests must pass** in `src/components/__tests__/page-renderer.test.tsx`. The `previewRef` attachment point must not change.

Changes:
- Add subtle entrance transitions between sections using CSS (not motion library, to avoid test complexity):
  ```css
  /* In globals.css */
  .preview-sandbox section {
    animation: sectionFadeIn 0.4s ease-out both;
  }
  .preview-sandbox section:nth-child(2) { animation-delay: 0.08s; }
  .preview-sandbox section:nth-child(3) { animation-delay: 0.16s; }
  /* etc. */
  ```
  This approach avoids touching the component code at all.

### 5.3 — `src/components/isi-block.tsx`

Changes:
- Smooth expand/collapse: Add `transition-[max-height] duration-300 overflow-hidden` to the content container
- PRESERVE all ARIA attributes (`aria-labelledby`, `role="region"`, `aria-expanded`, `aria-controls`)
- Do not change the `useId()` calls or the accessibility structure

### Phase 5 Verification
```bash
npm test
npm run build
```

---

## Font Stack Summary

| Usage | Font | Tailwind Class | Where Used |
|-------|------|---------------|------------|
| Display | Space Grotesk | `font-display` | Headlines, overlines, section labels, gauge labels, logo |
| Body | Plus Jakarta Sans | `font-body` | Body text, UI labels, buttons, nav links |
| Mono | Space Mono | `font-mono` | Data, code, scores, token values, URL bars |

---

## Color System (App Shell Only)

| Token | Value | Usage |
|-------|-------|-------|
| Base | `#000014` | Near-black with blue undertone, page background |
| Surface low | `rgba(255,255,255, 0.03)` | Cards, panels |
| Surface mid | `rgba(255,255,255, 0.05)` | Inputs, hover states |
| Surface high | `rgba(255,255,255, 0.07)` | Active states |
| Border low | `rgba(255,255,255, 0.06)` | Dividers, panel borders |
| Border mid | `rgba(255,255,255, 0.08)` | Card borders |
| Border high / top-lit | `rgba(255,255,255, 0.16)` | Top edge of cards (top-lit effect) |
| Text primary | `white` at 93% opacity | Headlines, active labels |
| Text secondary | `white` at 55% opacity | Descriptions, secondary labels |
| Text tertiary | `white` at 35% opacity | Captions, timestamps |
| Text muted | `white` at 18% opacity | Decorative, disabled |
| Primary CTA | `#0000c9` (Pfizer blue-70) | Buttons, primary actions |
| Electric accent | `#2e29ff` (Pfizer blue-60) | Interactive highlights, glows, active indicators |
| Second accent | `#00D4AA` (pharma teal) | Success, data, progress, completion |
| Glow primary | `rgba(0,0,201, 0.3-0.5)` | Button hover glow, CTA emphasis |
| Glow accent | `rgba(46,41,255, 0.3-0.5)` | Active nav indicator, interactive glow |
| Glow teal | `rgba(0,212,170, 0.3-0.5)` | Success glow, completion indicator |

---

## Motion System Summary

| Animation | Technique | Duration | Where Used |
|-----------|-----------|----------|------------|
| Scroll reveal | opacity 0→1, translateY 32→0, blur 4→0px | 0.6s ease-out | Feature cards, sections on landing page |
| Sibling stagger | 80ms delay between items | - | Card grids, list items |
| Gauge fill | `stroke-dashoffset` on SVG circle | 2s cubic-bezier | Compliance score gauge |
| Score bars | `scaleX(0)` → `scaleX(1)` via CSS animation | 1s cubic-bezier | Brand/pharma/a11y bars |
| Button hover | `translateY(-1px)`, glow shadow intensifies | 0.15s | CTAs, primary buttons |
| Button press | `scale(0.96)` | 0.1s | CTAs, primary buttons |
| Hero entrance | 5-layer cascade with staggered delays | 0.6s + 80ms stagger | Landing hero elements |
| Pipeline dots | Pulsing `box-shadow` on active step | 2s infinite | Generation pipeline indicator |
| Typing indicator | 3 dots with staggered `animation-delay` | 2s infinite | Chat panel |
| Atmospheric drift | Glow orbs translate slowly | 20s infinite | Background glows |
| Skeleton shimmer | Background gradient position shift | 2s infinite | Loading states |
| Section entrances | `opacity` + `animation-delay` per nth-child | 0.4s + 80ms stagger | Generated page preview |
| ISI expand | `max-height` transition | 0.3s | ISI block expand/collapse |

All motion respects `prefers-reduced-motion` via the `<MotionConfig reducedMotion="user">` wrapper and the CSS media query.

---

## Files Modified (Complete List)

### Phase 1
| File | Action | Risk |
|------|--------|------|
| `src/app/layout.tsx` | Modify — add fonts, antialiased, MotionProvider | LOW |
| `tailwind.config.ts` | Modify — ADD tokens (never rename/remove) | LOW |
| `src/app/globals.css` | Modify — add atmosphere, shimmer, scrollbar, selection | LOW |
| `src/lib/motion-config.ts` | CREATE | LOW |
| `src/components/motion-provider.tsx` | CREATE | LOW |

### Phase 2
| File | Action | Risk |
|------|--------|------|
| `src/components/app-nav.tsx` | Modify — glass navbar, dark treatment | LOW |
| `src/app/page.tsx` | Modify — asymmetric hero, glass cards, scroll reveals | LOW |
| `src/app/build/page.tsx` | Modify — minimal header polish | LOW |

### Phase 3
| File | Action | Risk |
|------|--------|------|
| `src/components/build-ui.tsx` | Modify — dark container, glass columns, browser-frame, gauge, pipeline | HIGH |
| `src/components/chat-panel.tsx` | Modify — dark treatment, avatars, typing indicator | MEDIUM |
| `src/components/compliance-sidebar.tsx` | Modify — dark treatment, animated bars, gauge | MEDIUM |
| `src/components/deploy-panel.tsx` | Modify — dark treatment, step progress, success glow | LOW |

### Phase 4 (optional)
| File | Action | Risk |
|------|--------|------|
| `src/components/scan-dashboard.tsx` | Modify — glass cards | LOW |
| `src/app/scan/page.tsx` | Modify — styled collapsible | LOW |
| `src/components/explainability-panel.tsx` | Modify — motion expand/collapse | LOW |
| `src/components/audit-trail.tsx` | Modify — timeline styling | LOW |

### Phase 5
| File | Action | Risk |
|------|--------|------|
| `src/design-system/tokens.json` | Modify — ADD tokens only | LOW |
| `src/components/page-renderer.tsx` | Modify — CSS entrance animations only | MEDIUM |
| `src/components/isi-block.tsx` | Modify — smooth expand/collapse | LOW |
| `src/app/globals.css` | Modify — add section entrance keyframes | LOW |

---

## Test Files (must all pass after each phase)

- `src/components/__tests__/compliance-sidebar.test.tsx` — 7 tests (mocked compliance, auto-fix button)
- `src/components/__tests__/page-renderer.test.tsx` — 7 tests (component rendering, unknown component handling)
- `src/components/__tests__/components.test.tsx` — design system component unit tests

---

## Critical Safety Invariants

1. **Token immutability**: `pfizer-blue-100` (#E6F4FB), `pfizer-blue-500` (#0093D0), `pfizer-blue-700` (#006699) must NEVER change. New tokens use different keys (800, 900, accent).
2. **previewRef**: Must remain on the inner `<div>` wrapping `<PageRenderer>`, not on any browser-frame wrapper. `ComplianceSidebar` uses this ref for axe scanning via `previewRef.current`.
3. **ARIA attributes**: All ARIA attributes in `isi-block.tsx` must be preserved (`role="region"`, `aria-labelledby`, `aria-expanded`, `aria-controls`).
4. **Test pass gate**: `npm test` and `npm run build` must succeed after EVERY phase. Never proceed to the next phase with failing tests.
5. **No new dependencies**: Only `motion` is installed. No shadcn/ui, no Tremor, no other packages.
6. **Generated content stays light**: The browser-frame mockup renders white/light content inside. The dark shell surrounds it. White on dark glass IS the two-layer architecture.
7. **Design system tokens.json**: ADD only. Never rename or remove. The compliance engine validates against these IDs.
8. **Compliance system**: 17 rules, ~6 enforced programmatically, trust score = avg(brand + pharma + a11y). Do not change the scoring logic.

---

## Verification Checklist (run after ALL phases)

```bash
# In the worktree
cd ../design-upgrade-worktree

# Tests
npm test

# Build
npm run build

# Dev server
npm run dev
# Then manually verify:
# 1. Landing page: dark background, atmospheric glows, glass cards, scroll reveals
# 2. /build: dark workspace, browser-frame preview, gauge scores, pipeline steps
# 3. Chat panel: dark bubbles, typing indicator, challenge prompts work
# 4. Compliance sidebar: animated bars, gauge, glow dots
# 5. Deploy: step progress, success glow
# 6. Generated content inside preview: stays light/white (Pfizer brand)
# 7. Reduced motion: disable animations in OS settings, verify graceful degradation
```
