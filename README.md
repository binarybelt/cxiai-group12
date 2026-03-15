# Design Delivery Accelerator

**Compliant-by-construction web generation for pharmaceutical enterprises**

> *"I'm more and more involved in the time process, being the go-between between designers and my marketers, back and forth, back and forth."*

Pfizer manages 2,000+ websites across dozens of agencies with no central compliance oversight. Every page risks brand drift, missing safety information, or accessibility failures — and the current workflow catches these problems *after* the page is built. Existing AI tools like Lovable generate freely and check later. We flip that model: compliance is enforced **at generation time**. Pages that violate brand, pharma, or accessibility rules simply cannot render.

---

## Live Demo

[Live Demo](https://design-delivery-accelerator.vercel.app)

---

## Three Engines

### BUILD — Generate compliant pages from a brief

Type a natural language brief. The AI interprets intent, selects **only** from approved design system components, and generates two compliant page variants with live preview. Then chat-to-edit: refine the page conversationally with every change constrained to the approved component and token set.

### COMPLY — Real-time compliance gate (not post-hoc)

Compliance runs as middleware between generation and render. Brand checks enforce approved tokens only. Pharma checks require ISI blocks, disclaimers, adverse event URLs, and market-specific rules (UK ABPI, US FDA). Accessibility checks run axe-core WCAG AA scans on rendered output. A page cannot reach the screen unless it passes every gate.

### SCAN — Portfolio-wide drift detection

Point SCAN at live URLs. It extracts design tokens from rendered pages, compares them against the approved design system, and flags mismatches. Across 2,000+ sites, this turns brand governance from manual auditing into continuous monitoring.

---

## The Demo Flow

1. **Type a natural language brief** — e.g., "Launch page for Paxlovid targeting US HCPs, emphasize efficacy data"
2. **AI interprets the brief** into structured requirements (audience, market, product, claims) — visible in the UI
3. **Two compliant page variants generated** from approved components only — side by side preview
4. **Chat-to-edit** — "make it warmer" applies changes with a visible diff, all within approved constraints
5. **Adversarial edit blocked** — "remove safety info" is rejected by the compliance gate with a plain-language explanation of why
6. **Toggle between Marketer / QA / Developer views** — each role sees what they need
7. **One-click deploy** to a live Vercel URL

---

## Architecture

```
Brief → Interpret Agent → Component Selector → Compliance Gate → Page Renderer → Deploy
                                                     ↓ (fail)
                                              Feedback + Auto-fix
```

**Key technical decisions:**

- **Vercel AI SDK with `generateObject`** — structured LLM output, not free-text parsing
- **Zod schemas as contracts** between every module boundary — brief interpretation, component selection, compliance checks, page spec
- **Constrained schema generation** — component IDs and token IDs are enum-restricted to approved sets. The LLM cannot hallucinate a component that does not exist in the design system
- **Compliance gate is deterministic middleware** — pure functions, no LLM judgment for pass/fail decisions. Rules are data, not code
- **Immutable data patterns throughout** — every transformation returns a new object, never mutates

---

## Trust & Compliance Details

| Layer | What it checks | How |
|---|---|---|
| **Brand** | Every component ID and token ID validated against approved design system | Enum restriction at generation time + post-generation validation |
| **Pharma** | ISI blocks required for HCP pages, adverse event URLs in footers, disclaimers mandatory, market-specific rules (UK ABPI, US FDA) | Deterministic rule engine with 12+ rules across 4 categories |
| **Accessibility** | WCAG AA compliance on rendered output | axe-core scanning |
| **Audit Trail** | Every generation, edit, and deploy logged with timestamps | Convex real-time database |
| **Explainability** | Every component choice includes a `selectionReason` in plain language | Structured output from the generation agent |

The compliance gate makes a critical architectural distinction: **hard gates** (brand tokens, required safety blocks, accessibility) are deterministic pure functions. There is no LLM in the pass/fail decision path. This makes compliance auditable, reproducible, and explainable without prompt sensitivity.

---

## Role-Based Views

| Role | Left Panel | Center | Right Panel |
|---|---|---|---|
| **Marketer** | Brief + Chat Edit | Page Preview + Deploy | Compliance Score |
| **QA** | Gate Violations + Audit Trail | Page Preview | Full Compliance Sidebar |
| **Developer** | Component Specs | Page Preview | PageSpec JSON |

Each role sees the same underlying page through a lens optimized for their workflow. Marketers iterate on messaging, QA verifies compliance, developers inspect the component tree.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14+ (App Router) + TypeScript strict mode |
| AI | Vercel AI SDK (multi-provider: Google Gemini, Claude, OpenRouter) |
| Backend | Convex (real-time audit trail and state) |
| Styling | Tailwind CSS with design token integration |
| Validation | Zod (runtime schema validation at every boundary) |
| Accessibility | axe-core (WCAG AA scanning) |
| Testing | Vitest (118 tests passing across 16 test files) |

---

## Getting Started

```bash
git clone https://github.com/binarybelt/cxiai-group12.git
cd cxiai-group12
npm install
cp .env.example .env.local  # Fill in your API keys
npm run dev
```

**Required environment variables:**

| Variable | Purpose |
|---|---|
| `GOOGLE_GENERATIVE_AI_API_KEY` | AI generation (Gemini) |
| `CONVEX_DEPLOYMENT` | Convex backend |
| `NEXT_PUBLIC_CONVEX_URL` | Convex client URL |
| `VERCEL_TOKEN` | Live deployments |

---

## Project Quality

- **118 tests** across 16 test files
- **TypeScript strict mode** — strict TypeScript throughout
- **Zero lint errors**
- **Modular agent architecture** — each agent is a `prompt.md` + `schema.ts` pair
- **Immutable data patterns** — no mutation anywhere in the pipeline

---

## Team

**Group 12** — Pfizer CXI+AI Challenge 2026

- Vedant Gaikwad
- Harshit Baldota
- Len Little
- Harriet Fletcher
- Joe Ganly
