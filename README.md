# Design Delivery Accelerator

### 2,000 websites. One design system. Zero compliance gaps.

> *"I'm the go-between — designers and marketers, back and forth, back and forth. It takes ages."*
> — Pfizer CXI presenter

Pfizer manages 2,000+ websites across dozens of agencies. Every page risks brand drift, missing safety information, or accessibility failures — and current workflows catch these problems *after* the page is built.

**We flip the model.** Compliance is enforced at generation time. The AI can only compose from approved components. Pages that violate brand, pharma, or accessibility rules cannot render. Period.

**[Live Demo →](https://design-delivery-accelerator.vercel.app)**

---

## What It Does

### BUILD — Generate compliant pages from a brief
Type a natural language brief. The AI selects **only** from approved design system components and generates two compliant page variants with live preview. Chat-to-edit: refine conversationally, every change constrained to the approved set.

### COMPLY — Real-time compliance gate
Compliance runs as middleware between generation and render. Brand tokens, pharma regulations (ISI blocks, adverse event URLs, market-specific rules), WCAG accessibility — all enforced deterministically. No LLM in the pass/fail path.

### SCAN — Portfolio-wide drift detection
Point at any live URL. The scanner extracts design tokens, compares against the approved system, and flags mismatches. Continuous monitoring across 2,000+ properties.

### AUDIT TRAIL — Tamper-proof evidence chain
Every AI decision — generation, edit, deploy — is hashed, chained, and verifiable. SHA-256 hash chain. Click any entry to see the full decision context.

---

## The Demo Flow

1. **Brief** → "Launch page for Paxlovid targeting US HCPs, emphasize efficacy data"
2. **AI interprets** into structured requirements (audience, market, product, claims) — visible in UI
3. **Two compliant variants** generated from approved components only
4. **Chat-to-edit** — "make the hero warmer" applies changes within approved constraints
5. **Adversarial edit blocked** — "remove safety info" is rejected with plain-language explanation
6. **Role views** — Marketer / QA / Developer each see what they need
7. **One-click deploy** to a live Vercel URL

---

## Architecture

```
Brief → Interpret Agent → Component Selector → Compliance Gate → Page Renderer → Deploy
                                                     ↓ (fail)
                                              Feedback + Auto-fix
```

**Key decisions:**

- **Constrained generation** — component IDs and token IDs are enum-restricted to approved sets. The LLM cannot hallucinate components that don't exist
- **Deterministic compliance gate** — pure functions, no LLM judgment for pass/fail. Rules are data, not prompts
- **Zod schemas at every boundary** — brief interpretation, component selection, compliance checks, page spec. Type-safe contracts between every module
- **Immutable data patterns** — every transformation returns a new object, never mutates

---

## Compliance Layers

| Layer | What | How |
|---|---|---|
| **Brand** | Every component and token validated against approved design system | Enum restriction at generation + post-validation |
| **Pharma** | ISI blocks, adverse event URLs, disclaimers, market rules (UK ABPI, US FDA, EU EFPIA) | Deterministic rule engine, 16 rules across 4 categories |
| **Accessibility** | WCAG AA on rendered output | axe-core scanning |
| **Audit** | Every generation, edit, deploy logged | SHA-256 hash chain via Convex |
| **Explainability** | Every component choice justified | `selectionReason` in structured output |

The compliance gate makes a critical distinction: **hard gates** (brand tokens, required safety blocks, accessibility) are deterministic pure functions. No LLM in the pass/fail path. Auditable, reproducible, explainable.

---

## Design System — Warm Obsidian

Custom dark-mode visual identity built for reduced eye strain and pharma clarity:

- **Background:** `#0C0A12` warm charcoal — eliminates blue-light fatigue from the old `#000014`
- **UX-split palette:** saturated violet (`#A78BFA`) for interactive elements (buttons, CTAs), muted tones for structural elements (borders, surfaces)
- **Glass-morphism components:** all 12 pharma components render with translucent backgrounds, white text, subtle borders — no jarring white blocks on dark
- **Teal `#00D4AA`** reserved for status indicators (compliant, success) — the only bright accent
- **Amber** preserved for pharma safety blocks (ISI, disclaimers)

12 approved components: Hero, Card, CTA, NavBar, Footer, DataTable, SectionHeader, ContentBlock, ClaimReference, ImageBlock, Disclaimer, ISIBlock.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 App Router, TypeScript strict mode |
| AI | Vercel AI SDK (Gemini, Claude, OpenRouter) |
| Backend | Convex (real-time audit trail) |
| Styling | Tailwind CSS + `brand-*` design tokens |
| Validation | Zod (every module boundary) |
| Accessibility | axe-core (WCAG AA) |
| Animation | Motion (scroll-driven, spring physics) |
| Testing | Vitest + Testing Library |

---

## Quick Start

```bash
git clone https://github.com/binarybelt/cxiai-group12.git
cd cxiai-group12
npm install
cp .env.example .env.local  # Add API keys
npm run dev
```

| Variable | Required | Purpose |
|---|---|---|
| `GOOGLE_GENERATIVE_AI_API_KEY` | Yes | AI generation (Gemini) |
| `CONVEX_DEPLOYMENT` | Yes | Backend deployment |
| `NEXT_PUBLIC_CONVEX_URL` | Yes | Convex client URL |
| `VERCEL_TOKEN` | No | One-click deploy |

---

## Quality

- **109 tests** across 15 test files — all passing
- **TypeScript strict mode** — zero type errors
- **Modular agent architecture** — each agent is a `prompt.md` + `schema.ts` pair
- **Immutable data patterns** — no mutation in the pipeline
- **13 compliance rules** enforced deterministically

---

## Team

**Group 12** — Pfizer CXI+AI Challenge 2026

- Vedant Gaikwad
- Harshit Baldota
- Len Little
- Harriet Fletcher
- Joe Ganly
