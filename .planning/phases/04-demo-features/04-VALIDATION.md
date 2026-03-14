---
phase: 4
slug: demo-features
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-14
---

# Phase 4 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest |
| **Config file** | vitest.config.ts |
| **Quick run command** | `npx vitest run --reporter=dot` |
| **Full suite command** | `npx vitest run` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run --reporter=dot`
- **After every plan wave:** Run `npx vitest run`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 5 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 04-01-01 | 01 | 1 | BUILD-05, BUILD-06 | unit | `npx vitest run src/lib/__tests__/diff.test.ts` | W0 (TDD RED) | pending |
| 04-01-02 | 01 | 1 | BUILD-05, BUILD-06 | type-check | `npx tsc --noEmit && npx vitest run --reporter=dot` | n/a | pending |
| 04-02-01 | 02 | 1 | SCAN-01, SCAN-02 | unit | `npx vitest run src/lib/__tests__/scan.test.ts` | W0 (TDD RED) | pending |
| 04-02-02 | 02 | 1 | INTEG-01 | unit | `npx vitest run src/lib/__tests__/figma.test.ts` | W0 (TDD RED) | pending |
| 04-03-01 | 03 | 2 | ROLE-01, ROLE-02, ROLE-03, INTEG-02 | unit | `npx vitest run src/components/__tests__/role-views.test.tsx` | W0 (TDD RED) | pending |
| 04-03-02 | 03 | 2 | ROLE-01, ROLE-02, ROLE-03 | integration | `npx tsc --noEmit && npx vitest run --reporter=dot && npm run build` | n/a | pending |

*Status: pending / green / red / flaky*

---

## Wave 0 Requirements

- [ ] Test stubs created by each plan's TDD RED phase
- [ ] Existing vitest infrastructure covers framework needs

*Existing infrastructure covers all phase requirements.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Chat edit updates page visually | BUILD-05 | Requires visual/browser check | Type "make it warmer" in chat, verify page preview updates |
| Role views show different content | ROLE-01/02/03 | Layout is visual | Toggle roles, verify each shows distinct panel content |
| SCAN dashboard renders portfolio | SCAN-01 | Visual dashboard | Navigate to /scan, verify compliance cards render |
| Figma URL paste imports tokens | INTEG-01 | Requires Figma API or demo fallback | Paste Figma URL, verify tokens appear via /api/figma-extract |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 5s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
