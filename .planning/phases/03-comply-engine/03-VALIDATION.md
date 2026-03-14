---
phase: 3
slug: comply-engine
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-14
---

# Phase 3 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.1.0 |
| **Config file** | `vitest.config.ts` |
| **Quick run command** | `npm test` |
| **Full suite command** | `npm run test:coverage` |
| **Estimated runtime** | ~8 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm test`
- **After every plan wave:** Run `npm run test:coverage`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 10 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 03-01-01 | 01 | 1 | COMPLY-02 | unit | `npm test -- --testPathPattern=compliance` | ❌ W0 | ⬜ pending |
| 03-01-02 | 01 | 1 | COMPLY-04 | unit | `npm test -- --testPathPattern=compliance` | ❌ W0 | ⬜ pending |
| 03-01-03 | 01 | 1 | COMPLY-06 | unit | `npm test -- --testPathPattern=compliance` | ❌ W0 | ⬜ pending |
| 03-02-01 | 02 | 1 | COMPLY-03 | unit | `npm test -- --testPathPattern=axe-scanner` | ❌ W0 | ⬜ pending |
| 03-02-02 | 02 | 1 | COMPLY-06 | unit | `npm test -- --testPathPattern=compliance` | ❌ W0 | ⬜ pending |
| 03-03-01 | 03 | 2 | COMPLY-01 | unit | `npm test -- --testPathPattern=compliance-sidebar` | ❌ W0 | ⬜ pending |
| 03-03-02 | 03 | 2 | COMPLY-05 | unit | `npm test -- --testPathPattern=compliance` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/types/compliance.ts` — ComplianceViolation, ComplianceResult, ComplianceScore types
- [ ] `src/lib/__tests__/compliance.test.ts` — unit tests for runBrandChecks, runPharmaChecks, runComplianceGate, applyAutoFix
- [ ] `src/lib/__tests__/axe-scanner.test.ts` — axe scan with jsdom; disable color-contrast rule
- [ ] `src/components/__tests__/compliance-sidebar.test.tsx` — renders score, lists violations, auto-fix button
- [ ] `vitest-axe` — install as dev dependency

*Existing infrastructure covers framework setup.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Color-contrast violations surfaced correctly | COMPLY-03 | jsdom cannot compute CSS for color-contrast; requires live browser DOM | Open /build, render a page with low-contrast text, verify axe flags it in sidebar |
| Compliance sidebar updates in real time | COMPLY-01 | Visual timing/UX behavior not automatable in unit tests | Edit a PageSpec in the build UI, observe score updates within 300ms |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 10s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
