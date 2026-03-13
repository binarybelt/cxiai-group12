# Design Delivery Accelerator

## What This Is

An AI-powered tool that generates brand-compliant web pages from natural language briefs using constrained generation — the AI can only compose from approved design system components. Built for Pfizer's CXI+AI hackathon challenge to demonstrate how AI can revolutionize the web design process end-to-end, from brief interpretation to deployment.

## Core Value

Constrained generation: the AI composes pages exclusively from approved design system tokens and components, making compliance a build-time constraint rather than a post-build report.

## Current Milestone: v1.0 Hackathon MVP

**Goal:** Build a working demo that shows the full design-to-delivery pipeline — brief to compliant page to live deployment — for the March 15 hackathon deadline.

**Target features:**
- Natural language brief → brand-compliant page generation (BUILD engine)
- Real-time compliance checking with auto-fix (COMPLY engine)
- Chat-to-edit loop for iterative refinement
- Role-based views (marketer, QA/compliance, developer)
- One-click deployment to live URL via Vercel API
- Design system drift scanner dashboard (SCAN engine, demo-ready)
- "Show your working" — explainability for every AI decision
- Figma import for design token extraction
- Audit trail logging

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] NL brief interpretation → structured PageSpec
- [ ] Constrained component selection from approved design system
- [ ] Compliance gate (blocks rendering until spec passes)
- [ ] Code generation from validated PageSpec (React + Tailwind + tokens)
- [ ] Live preview with compliance sidebar
- [ ] Chat-to-edit loop with diff display
- [ ] Real-time compliance scoring (brand, accessibility, pharma)
- [ ] Auto-fix compliance issues using approved components
- [ ] Role-based views (marketer, QA, developer)
- [ ] Audit trail (timestamped change log)
- [ ] One-click deploy via Vercel Deploy API
- [ ] Drift scanner dashboard (pre-scanned + one live URL)
- [ ] Figma URL → design token extraction
- [ ] "Show your working" explainability panel

### Out of Scope

- Real MLR approval workflow — show pre-screening concept only
- Design system config UI — pre-loaded JSON, no editor
- Multi-tenant/multi-brand — demo is Pfizer-focused only
- User authentication — unnecessary for demo
- Figma write-back — read only
- Production monitoring — demo-grade observability only

## Context

- **Hackathon:** Pfizer CXI+AI Challenge, deadline March 15, 2026
- **Judging:** 50 points across insight, creative AI use, technical execution, trust/compliance, UX/workflow
- **Competitive landscape:** Lovable (unconstrained generation), bolt.diy (unconstrained OSS), Veeva/EVERSANA (review finished content, not build-time). None do constrained generation.
- **Pfizer pain points:** 2,000+ websites, multiple agencies, brand drift, slow back-and-forth with designers, compliance review bottlenecks
- **Design system:** Pfizer's Helix — 650+ component Figma library, 3 layers (tokens, components, patterns). We manufacture a representative subset for demo.

## Constraints

- **Timeline:** March 15 deadline (~2 days from start)
- **Tech stack:** Next.js 14+ (App Router), Vercel AI SDK, Convex, Tailwind, Zod (confirmed in DECISIONS.md)
- **Component library:** 10-15 custom React components styled with Pfizer design tokens
- **LLM providers:** Multi-provider via Vercel AI SDK (Claude, GPT-4o, Gemini)
- **Deploy target:** Vercel (both the app and generated sites)

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Build fresh, don't fork bolt.diy | Remix vs Next.js, unconstrained arch, refactor cost > build cost | — Pending |
| Multi-agent pipeline with markdown prompts | Modular, testable, explainable to judges | — Pending |
| Compliance as middleware, not afterthought | Core architectural differentiator vs Lovable | — Pending |
| Full custom component library (not shadcn) | Pharma-specific components (ISI, Disclaimer), cleaner demo narrative | — Pending |
| Deploy in scope via Vercel API | "Design to DELIVERY" — demo climax | — Pending |
| Figma integration via REST API in app | MCP is dev-only, REST API is production path | — Pending |
| PageSpec schema first | Contract between all modules, prevents integration hell | — Pending |
| Helix claims unverified | 2019 info may be outdated, only claim what was heard in presentation | — Pending |

---
*Last updated: 2026-03-13 after milestone v1.0 initialization*
