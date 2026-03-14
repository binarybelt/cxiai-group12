# Roadmap: Design Delivery Accelerator

## Overview

Starting from zero with a 2-day deadline, this roadmap delivers the full design-to-delivery pipeline in five tight phases. Phase 1 builds the foundation every other phase depends on: the app skeleton, component library, and PageSpec schema that serves as the contract between all modules. Phase 2 implements the core BUILD pipeline end-to-end. Phase 3 adds the COMPLY engine as middleware. Phase 4 layers in the remaining features that make the demo compelling -- chat-to-edit, role views, SCAN, explainability, Figma, and audit trail. Phase 5 wires up real deployment and polishes for demo day.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Foundation** - App skeleton, design system data, component library, and PageSpec schema
- [ ] **Phase 2: BUILD Pipeline** - Natural language brief -> PageSpec -> live rendered page
- [ ] **Phase 3: COMPLY Engine** - Real-time compliance checking, scoring, and auto-fix as middleware
- [ ] **Phase 4: Demo Features** - Chat-to-edit, role views, explainability, SCAN dashboard, Figma import, audit trail
- [ ] **Phase 5: Deploy & Polish** - One-click Vercel deployment and demo-day readiness

## Phase Details

### Phase 1: Foundation
**Goal**: The app runs, design system data is loaded, all pharma-specific components render, and PageSpec schema is the established contract between every module
**Depends on**: Nothing (first phase)
**Requirements**: FNDTN-01, FNDTN-02, FNDTN-03, FNDTN-04, COMP-01, COMP-02
**Success Criteria** (what must be TRUE):
  1. Next.js app runs locally with no errors and all routes resolve
  2. Design system JSON files (tokens, components, patterns, compliance-rules, markets) are loaded and queryable at runtime
  3. PageSpec Zod schema is defined and all modules import from a single source of truth
  4. All 10-15 pharma-specific components (Hero, Card, ISI Block, Disclaimer, CTA, Nav, Footer, Data Table, Claim+Reference) render correctly with Pfizer design tokens applied via Tailwind
  5. Convex database is initialized and accepts audit log writes
**Plans:** 3 plans

Plans:
- [ ] 01-01-PLAN.md -- Scaffold Next.js 14+ app with TypeScript, Tailwind, Convex, and project directory structure
- [ ] 01-02-PLAN.md -- Define PageSpec Zod schema and load design system JSON files into the app
- [ ] 01-03-PLAN.md -- Build 12 pharma-specific React components styled with Pfizer design tokens

### Phase 2: BUILD Pipeline
**Goal**: A user can type a natural language brief and receive a live-rendered, brand-compliant page composed entirely from approved design system components
**Depends on**: Phase 1
**Requirements**: BUILD-01, BUILD-02, BUILD-03, BUILD-04
**Success Criteria** (what must be TRUE):
  1. User types a brief and a page appears in the preview panel using only approved components
  2. AI interprets brief into structured requirements (component, market, product context) that are visible in the system
  3. Component selector provably selects only from the approved design system -- no off-system tokens or components appear in output
  4. Generated page renders as a live preview using the actual component library (not a mock)
**Plans:** 1/3 plans executed

Plans:
- [ ] 02-01-PLAN.md -- Install AI SDK, create agent schemas with dynamic enum constraints, prop shape metadata, and prompts
- [ ] 02-02-PLAN.md -- Build interpret-brief and generate-page API routes with Convex audit logging
- [ ] 02-03-PLAN.md -- Build page renderer, Build UI with streaming preview and variant tabs

### Phase 3: COMPLY Engine
**Goal**: Every page and every edit is continuously scored against brand, accessibility, and pharma compliance rules -- and the page cannot render unless it passes the compliance gate
**Depends on**: Phase 2
**Requirements**: COMPLY-01, COMPLY-02, COMPLY-03, COMPLY-04, COMPLY-05, COMPLY-06
**Success Criteria** (what must be TRUE):
  1. Compliance score (brand, accessibility, pharma) updates in the sidebar in real time as the page changes
  2. Brand check confirms all tokens are from the approved palette; violations are listed by name
  3. axe-core accessibility scan runs against rendered output and WCAG AA violations are surfaced with fix descriptions
  4. Pharma compliance check detects missing disclaimers, adverse event links, and market-specific rule violations
  5. Auto-fix button resolves listed issues using approved components and the page re-renders correctly
  6. A page spec that fails the compliance gate cannot proceed to render -- the pipeline stops and returns feedback to the selector
**Plans**: TBD

Plans:
- [ ] 03-01: Build compliance rule engine (brand + pharma checks against PageSpec)
- [ ] 03-02: Integrate axe-core for accessibility scanning and wire compliance gate as middleware
- [ ] 03-03: Build compliance sidebar UI and auto-fix functionality

### Phase 4: Demo Features
**Goal**: The full demo story is live -- marketers can chat-to-edit, QA sees a full compliance view, developers see generated code, the SCAN dashboard shows portfolio drift, Figma token import works, and every action is in the audit trail
**Depends on**: Phase 3
**Requirements**: BUILD-05, BUILD-06, SCAN-01, SCAN-02, ROLE-01, ROLE-02, ROLE-03, INTEG-01, INTEG-02
**Success Criteria** (what must be TRUE):
  1. User types a chat edit ("make it warmer") and the page updates with a visible diff showing exactly what changed and why
  2. Explainability panel shows the reasoning behind every component and token choice in plain language
  3. Role toggle switches between Marketer, QA, and Developer views with meaningfully different UI content in each
  4. SCAN dashboard displays a pre-loaded portfolio compliance overview and can scan one live URL and return a drift report
  5. User can paste a Figma URL and extracted design tokens appear in the system
  6. Audit trail shows a timestamped log of every change including what the AI decided
**Plans**: TBD

Plans:
- [ ] 04-01: Build chat-to-edit loop with diff display and explainability panel
- [ ] 04-02: Build role-based views (Marketer, QA, Developer) with role toggle
- [ ] 04-03: Build SCAN engine dashboard (pre-scanned data + live URL scan)
- [ ] 04-04: Build Figma token import and wire Convex audit trail

### Phase 5: Deploy & Polish
**Goal**: The demo climax works -- generated page deploys to a live Vercel URL in seconds -- and the full demo flow is smooth and presentation-ready
**Depends on**: Phase 4
**Requirements**: DEPLOY-01, DEPLOY-02
**Success Criteria** (what must be TRUE):
  1. User clicks deploy and receives a live Vercel URL within 30 seconds
  2. Deploy status (pending, deploying, live) and the final URL are visible in the UI
**Plans**: TBD

Plans:
- [ ] 05-01: Integrate Vercel Deploy API (code generator -> POST /v13/deployments -> live URL in UI)
- [ ] 05-02: End-to-end demo flow walkthrough and polish

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3 -> 4 -> 5

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation | 0/3 | Not started | - |
| 2. BUILD Pipeline | 1/3 | In Progress|  |
| 3. COMPLY Engine | 0/3 | Not started | - |
| 4. Demo Features | 0/4 | Not started | - |
| 5. Deploy & Polish | 0/2 | Not started | - |
