# Requirements: Design Delivery Accelerator

**Defined:** 2026-03-13
**Core Value:** Constrained generation — AI composes exclusively from approved design system components, making compliance a build-time constraint.

## v1 Requirements

Requirements for hackathon MVP (March 15 deadline). Each maps to roadmap phases.

### Foundation

- [ ] **FNDTN-01**: App scaffolded with Next.js 14+ App Router, Tailwind, TypeScript
- [ ] **FNDTN-02**: Design system database loaded (tokens.json, components.json, patterns.json, compliance-rules.json, markets.json)
- [ ] **FNDTN-03**: PageSpec Zod schema defined as the contract between all modules
- [ ] **FNDTN-04**: Convex database initialized for audit trail storage

### BUILD Engine

- [ ] **BUILD-01**: User can type a natural language brief and receive a generated page
- [ ] **BUILD-02**: AI interprets brief into structured requirements (component, market, product context)
- [ ] **BUILD-03**: Component selector picks ONLY from approved design system components
- [ ] **BUILD-04**: Generated page renders as live preview using approved components + tokens
- [ ] **BUILD-05**: User can chat-to-edit ("make it warmer") and see updated page with diff
- [ ] **BUILD-06**: Explainability panel shows why each component/token was chosen

### COMPLY Engine

- [ ] **COMPLY-01**: Real-time compliance score displayed in sidebar during build/edit
- [ ] **COMPLY-02**: Brand compliance check (all tokens from approved palette)
- [ ] **COMPLY-03**: Accessibility check via axe-core (WCAG AA)
- [ ] **COMPLY-04**: Pharma compliance check (disclaimers, adverse event links, market rules)
- [ ] **COMPLY-05**: Auto-fix button resolves issues using approved components
- [ ] **COMPLY-06**: Compliance gate blocks rendering until PageSpec passes

### SCAN Engine

- [ ] **SCAN-01**: Dashboard shows portfolio compliance overview (pre-scanned data)
- [ ] **SCAN-02**: User can scan one live URL and see drift report against design system

### Roles & Views

- [ ] **ROLE-01**: Marketer view shows visual editor with chat-to-edit and simple compliance indicators
- [ ] **ROLE-02**: QA view shows full compliance report, audit trail, risk scores, auto-fix
- [ ] **ROLE-03**: Developer view shows generated code output and component specs

### Deployment

- [ ] **DEPLOY-01**: User can one-click deploy generated page to live Vercel URL
- [ ] **DEPLOY-02**: Deploy status and live URL shown in UI

### Integration

- [ ] **INTEG-01**: User can paste Figma URL and extract design tokens into the system
- [ ] **INTEG-02**: Audit trail logs every change with timestamp, what changed, AI decisions

### Component Library

- [ ] **COMP-01**: 10-15 pharma-specific React components built (Hero, Card, ISI Block, Disclaimer, CTA, Nav, Footer, Data Table, Claim+Reference, etc.)
- [ ] **COMP-02**: Components styled with design tokens via Tailwind CSS custom properties

## v2 Requirements

Deferred to post-hackathon.

- **MLR-01**: Full MLR approval workflow with reviewer roles
- **CONFIG-01**: Design system configuration UI (add/edit tokens, components)
- **MULTI-01**: Multi-tenant support for multiple brands
- **AUTH-01**: User authentication and role-based access control
- **FIGMA-W-01**: Write back to Figma from generated designs
- **MONITOR-01**: Production monitoring and observability

## Out of Scope

| Feature | Reason |
|---------|--------|
| Real MLR workflow | Show pre-screening concept only — full workflow is enterprise scope |
| Design system editor UI | Pre-loaded JSON sufficient for demo |
| Multi-brand/multi-tenant | Demo is Pfizer-focused only |
| User authentication | Unnecessary for demo — role switching via UI toggle |
| Figma write-back | Read-only Figma integration sufficient |
| Production monitoring | Demo-grade observability only |
| Real-time chat/collaboration | Not part of brief, adds complexity |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| FNDTN-01 | Phase 1 | Pending |
| FNDTN-02 | Phase 1 | Pending |
| FNDTN-03 | Phase 1 | Pending |
| FNDTN-04 | Phase 1 | Pending |
| COMP-01 | Phase 1 | Pending |
| COMP-02 | Phase 1 | Pending |
| BUILD-01 | Phase 2 | Pending |
| BUILD-02 | Phase 2 | Pending |
| BUILD-03 | Phase 2 | Pending |
| BUILD-04 | Phase 2 | Pending |
| COMPLY-01 | Phase 3 | Pending |
| COMPLY-02 | Phase 3 | Pending |
| COMPLY-03 | Phase 3 | Pending |
| COMPLY-04 | Phase 3 | Pending |
| COMPLY-05 | Phase 3 | Pending |
| COMPLY-06 | Phase 3 | Pending |
| BUILD-05 | Phase 4 | Pending |
| BUILD-06 | Phase 4 | Pending |
| SCAN-01 | Phase 4 | Pending |
| SCAN-02 | Phase 4 | Pending |
| ROLE-01 | Phase 4 | Pending |
| ROLE-02 | Phase 4 | Pending |
| ROLE-03 | Phase 4 | Pending |
| INTEG-01 | Phase 4 | Pending |
| INTEG-02 | Phase 4 | Pending |
| DEPLOY-01 | Phase 5 | Pending |
| DEPLOY-02 | Phase 5 | Pending |

**Coverage:**
- v1 requirements: 27 total
- Mapped to phases: 27
- Unmapped: 0

Note: REQUIREMENTS.md originally stated 24 requirements. Actual count from requirement IDs is 27. All 27 are mapped.

---
*Requirements defined: 2026-03-13*
*Last updated: 2026-03-13 — traceability populated after roadmap creation*
