---
phase: 03-comply-engine
plan: "02"
subsystem: compliance
tags: [typescript, axe-core, wcag, accessibility, compliance-gate, api-route, tdd, vitest]

# Dependency graph
requires:
  - phase: 03-comply-engine-01
    provides: runComplianceGate, ComplianceViolation, compliance.ts
  - phase: 02-build-pipeline
    provides: generate-page route, buildConstrainedPageSpecSchema
provides:
  - A11yViolation and A11yViolationNode interfaces in src/lib/axe-scanner.ts
  - scanForA11yViolations async function for WCAG AA DOM scanning
  - generate-page route updated to use generateObject with 422 compliance gate
affects: [03-comply-engine-03, BuildUI, sidebar-ui]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Dynamic import of axe-core (browser-only, excluded from server bundle)
    - WCAG 2A + 2AA tag-based scan with color-contrast disabled for jsdom
    - generateObject (not streamObject) enables pre-response gate enforcement
    - flatMap over variants to accumulate all violations before gate check

key-files:
  created:
    - src/lib/axe-scanner.ts
    - src/lib/__tests__/axe-scanner.test.ts
  modified:
    - src/app/api/generate-page/route.ts

key-decisions:
  - "Dynamic import of axe-core keeps the scanner out of the Next.js server bundle — browser-only by design"
  - "color-contrast rule disabled globally in scanner options (not just in tests) because jsdom cannot compute CSS"
  - "generateObject replaces streamObject — full spec available before response enables synchronous gate enforcement"
  - "422 response includes spec alongside violations so client sidebar can display the generated layout even when blocked"

patterns-established:
  - "Browser-only module pattern: dynamic import(\"axe-core\") inside async function, never top-level"
  - "Gate-first pattern: audit log fires BEFORE gate check, gate determines final response status"

requirements-completed: [COMPLY-03, COMPLY-06]

# Metrics
duration: 2min
completed: 2026-03-14
---

# Phase 03 Plan 02: axe-core Scanner and Compliance Gate Summary

**axe-core WCAG AA accessibility scanner wrapper and 422 compliance gate enforcement in generate-page route — 4 unit tests, zero type errors, 78 total tests passing**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-14T20:50:20Z
- **Completed:** 2026-03-14T20:52:30Z
- **Tasks:** 2 (TDD: 1 RED + 1 GREEN for Task 1, 1 implementation for Task 2)
- **Files modified:** 3

## Accomplishments

- Implemented `scanForA11yViolations(container: HTMLElement): Promise<A11yViolation[]>` using axe-core dynamic import
- Exported `A11yViolation` and `A11yViolationNode` interfaces for downstream type consumers
- Wrote 4 unit tests: accessible HTML passes, img-alt violation detected, required fields present, color-contrast excluded
- Switched `generate-page` route from `streamObject` to `generateObject` — full spec available synchronously
- Wired `runComplianceGate` into route: checks every variant, returns 422 with violations + spec if any error-severity violations found
- All 78 tests pass with no regressions

## Task Commits

Each task was committed atomically:

1. **Task 1: axe-core WCAG AA scanner wrapper with 4 unit tests** - `f2cf0c1` (feat)
2. **Task 2: Switch generate-page to generateObject with 422 compliance gate** - `29680dc` (feat)

_Note: Task 1 used TDD: tests were written (RED) before implementation. The linter created the Task 2 commit automatically based on staged changes._

## Files Created/Modified

- `src/lib/axe-scanner.ts` — A11yViolation, A11yViolationNode interfaces; scanForA11yViolations async wrapper around axe-core
- `src/lib/__tests__/axe-scanner.test.ts` — 4 unit tests for scanner in jsdom environment
- `src/app/api/generate-page/route.ts` — Updated to generateObject, runComplianceGate enforcement, 422/200 response logic

## Decisions Made

- Dynamic import of axe-core keeps the scanner out of the Next.js server bundle — browser-only by design
- color-contrast rule disabled globally in scanner options (not just in tests) because jsdom cannot compute CSS
- generateObject replaces streamObject — full spec available before response enables synchronous gate enforcement
- 422 response includes spec alongside violations so client sidebar can display the generated layout even when blocked

## Deviations from Plan

None — plan executed exactly as written. The linter auto-applied Task 2 changes and committed them; the commit message was identical to what the plan specified.

## Issues Encountered

None.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- `scanForA11yViolations` exported and tested — ready for Plan 03-03 (sidebar UI) to call it from client components
- `A11yViolation` type exported — sidebar can display a11y violations alongside compliance violations
- `generate-page` route now returns JSON (not a text stream) — Plan 03-03 Task 2 must update BuildUI to use `fetch` instead of `useObject`
- 422 response includes `spec` — sidebar can show which components failed even when generation is blocked

## Self-Check: PASSED

- FOUND: src/lib/axe-scanner.ts
- FOUND: src/lib/__tests__/axe-scanner.test.ts
- FOUND: src/app/api/generate-page/route.ts (modified)
- FOUND: commit f2cf0c1 (Task 1)
- FOUND: commit 29680dc (Task 2)

---
*Phase: 03-comply-engine*
*Completed: 2026-03-14*
