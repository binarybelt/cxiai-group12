---
phase: 2
slug: build-pipeline
status: draft
nyquist_compliant: true
wave_0_complete: false
created: 2026-03-13
---

# Phase 2 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.1.0 |
| **Config file** | `vitest.config.ts` |
| **Quick run command** | `npm test` |
| **Full suite command** | `npm run test:coverage` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm test`
- **After every plan wave:** Run `npm run test:coverage`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 02-01-01 | 01 | 1 | BUILD-02, BUILD-03 | unit | `npm test -- src/agents/brief-interpreter` | ❌ W0 | ⬜ pending |
| 02-01-02 | 01 | 1 | BUILD-03 | unit | `npm test -- src/agents/component-selector` | ❌ W0 | ⬜ pending |
| 02-02-01 | 02 | 2 | BUILD-01, BUILD-02 | integration | `npm test -- src/app/api` | ❌ W0 | ⬜ pending |
| 02-02-02 | 02 | 2 | BUILD-01, BUILD-02 | integration | `npm test -- src/app/api` | ❌ W0 | ⬜ pending |
| 02-03-01 | 03 | 3 | BUILD-04 | unit (RTL) | `npm test -- src/components/page-renderer` | ❌ W0 | ⬜ pending |
| 02-03-02 | 03 | 3 | BUILD-01, BUILD-04 | unit | `npm test -- src/components/build-ui` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/agents/brief-interpreter/__tests__/schema.test.ts` — validates BriefInterpretationSchema shapes (BUILD-02)
- [ ] `src/agents/component-selector/__tests__/schema.test.ts` — validates constrained enum rejects hallucinated component IDs AND token IDs (BUILD-03)
- [ ] `src/components/__tests__/page-renderer.test.tsx` — RTL render tests for registry lookup including node-type props (BUILD-04)
- [ ] `src/app/api/__tests__/interpret-brief.test.ts` — mocked generateObject integration test (BUILD-01)
- [ ] `src/app/api/__tests__/generate-page.test.ts` — mocked streamObject + Convex logging test (BUILD-01, BUILD-02)

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Live streaming preview renders progressively | BUILD-04 | Requires visual confirmation of streaming UX | 1. Type a brief 2. Click Generate 3. Observe sections appearing incrementally |
| Two variant tabs display distinct layouts | Decision 13 | Visual comparison of variant quality | 1. Generate a page 2. Switch between Variant A/B tabs 3. Verify different component arrangements |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 15s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
