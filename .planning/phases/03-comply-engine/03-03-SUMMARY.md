---
phase: 03-comply-engine
plan: "03"
subsystem: ui
tags: [react, typescript, compliance, axe-core, tailwind, tdd, vitest, testing-library]

# Dependency graph
requires:
  - phase: 03-comply-engine-01
    provides: runBrandChecks, runPharmaChecks, computeScore, applyAutoFix, ComplianceViolation, ComplianceScore types
  - phase: 03-comply-engine-02
    provides: axe-core scanner wrapper (scanForA11yViolations, A11yViolation), compliance gate in generate-page route
  - phase: 02-build-pipeline
    provides: BuildUI, PageRenderer, PageSpec types
provides:
  - ComplianceSidebar component with real-time brand/pharma/accessibility scoring and auto-fix buttons
  - BuildUI updated with 3-column layout, fetch-based generation, 422 gate error handling
  - generate-page route switched to generateObject with 422 compliance gate
affects: [04-demo, end-to-end-testing]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Debounced async side effects: useEffect with 600ms setTimeout + clearTimeout on cleanup
    - Dynamic import for browser-only modules: await import("@/lib/axe-scanner") inside useEffect
    - Immutable auto-fix: applyAutoFix returns new PageSpec, stored in overrideSpec state
    - 3-column responsive grid: lg:grid-cols-[1fr_2fr_320px] degrades to stacked on mobile
    - fetch + useState pattern replacing useObject for JSON API responses

key-files:
  created:
    - src/components/compliance-sidebar.tsx
    - src/components/__tests__/compliance-sidebar.test.tsx
  modified:
    - src/components/build-ui.tsx
    - src/app/api/generate-page/route.ts

key-decisions:
  - "axe-scanner dynamically imported inside useEffect to keep axe-core out of server bundle"
  - "overrideSpec state stores auto-fix result separately from variants — preserves original for variant switching"
  - "Variant tab switch clears overrideSpec so sidebar rescores the original spec for that variant"
  - "a11yViolations mapped to { length: number }[] for computeScore to stay decoupled from axe-core types"
  - "422 gate error still sets variants in state so sidebar can render violations before fix"

patterns-established:
  - "Auto-fix flow: click Fix button -> applyAutoFix(spec, violation) -> onAutoFix(newSpec) -> setOverrideSpec -> sidebar rescores"
  - "Gate error flow: 422 -> setGateViolations -> show amber banner + sidebar with violations -> user fixes -> setOverrideSpec"

requirements-completed: [COMPLY-01, COMPLY-05]

# Metrics
duration: 15min
completed: 2026-03-14
---

# Phase 03 Plan 03: Compliance Sidebar UI Summary

**Compliance sidebar with 0-100 scoring, category sub-scores, violation list, and auto-fix buttons wired into a 3-column BuildUI layout with fetch-based generation and 422 gate error handling**

## Performance

- **Duration:** 15 min
- **Started:** 2026-03-14T20:50:00Z
- **Completed:** 2026-03-14T21:05:00Z
- **Tasks:** 3 (2 auto + 1 checkpoint:human-verify, approved)
- **Files modified:** 4

## Accomplishments

- Built ComplianceSidebar with 7 unit tests (TDD RED-GREEN): overall score, sub-scores, violations list, Fix buttons, auto-fix callbacks, empty state, null state
- Updated BuildUI: removed useObject streaming, replaced with fetch + useState; 3-column layout (brief | preview | sidebar); 422 compliance gate error banner; previewRef for axe scanner; overrideSpec for immutable auto-fix
- Updated generate-page API route: streamObject → generateObject; compliance gate runs post-generation; 422 returned on violations
- Build passes and all 85 tests pass

## Task Commits

Each task was committed atomically:

1. **Prerequisite: generate-page compliance gate** - `29680dc` (feat)
2. **Task 1 (TDD GREEN): ComplianceSidebar component** - `9ad9b39` (feat)
3. **Task 2: Wire ComplianceSidebar into BuildUI** - `2ccc16b` (feat)

**Plan metadata:** (docs commit — created after this summary)

_Note: TDD task 1 used the RED test file already committed in f2cf0c1 from 03-02 work_

## Files Created/Modified

- `src/components/compliance-sidebar.tsx` - Real-time compliance sidebar with score display and auto-fix
- `src/components/__tests__/compliance-sidebar.test.tsx` - 7 unit tests (TDD) for sidebar behavior
- `src/components/build-ui.tsx` - 3-column layout, fetch-based generation, gate error handling
- `src/app/api/generate-page/route.ts` - generateObject + 422 compliance gate

## Decisions Made

- Dynamic import of axe-scanner inside useEffect keeps axe-core out of the Next.js server bundle — critical for avoiding SSR errors
- overrideSpec state for auto-fix is separate from variants array — preserves original variants, cleared on tab switch for fresh scoring
- Variant tab switch clears overrideSpec so switching to Variant B doesn't retain Variant A's fix
- a11y violations mapped to `{ length: number }[]` to satisfy computeScore's type contract without coupling sidebar to axe-core internals

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Updated generate-page route before sidebar (Plan 02 prerequisite)**
- **Found during:** Pre-execution context check
- **Issue:** Plan 03 depends on generateObject + 422 gate from Plan 02, which had not been fully executed (axe-scanner.ts was committed but route was not updated)
- **Fix:** Executed Plan 02 Task 2 (generate-page route) as a prerequisite
- **Files modified:** src/app/api/generate-page/route.ts
- **Verification:** TypeScript compiles cleanly, all tests pass
- **Committed in:** 29680dc

**2. [Rule 1 - Bug] Fixed TypeScript type mismatch in computeScore call**
- **Found during:** Task 1 (ComplianceSidebar implementation)
- **Issue:** `A11yViolation[]` not assignable to `{ length: number }[]` — A11yViolation has no `length` property
- **Fix:** Map a11yViolations to `{ length: v.nodes.length }[]` before passing to computeScore
- **Files modified:** src/components/compliance-sidebar.tsx
- **Verification:** `npm run build` passes cleanly
- **Committed in:** 2ccc16b (Task 2 commit includes the fix in sidebar)

---

**Total deviations:** 2 auto-fixed (1 blocking prerequisite, 1 type bug)
**Impact on plan:** Both necessary for correctness. No scope creep.

## Issues Encountered

- Plan 02 SUMMARY.md was missing and route was not updated — identified via git log and file inspection, fixed as Rule 3 deviation
- `computeScore` signature `a11y: { length: number }[]` is ambiguous — fixed by mapping A11yViolation to the expected shape

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- ComplianceSidebar is wired to /build, scores update when variants change, auto-fix flow works end-to-end
- Task 3 (checkpoint:human-verify) APPROVED: full browser verification passed
  - /build page loads with 3-column layout
  - Generation pipeline works end-to-end (interpret -> generate -> compliance gate)
  - Compliance sidebar displays scores correctly (Brand 100, Accessibility 80, Pharma 75, Overall 85)
  - 2 violations detected: pharma adverseEventUrl and a11y links without text
  - 422 gate fires correctly with amber banner
  - Variant A/B switching works, sidebar rescores
  - axe-core live DOM scan detected real accessibility issues
  - All 85 tests pass, build clean
- Ready for Phase 04 (demo polish)

## Self-Check: PASSED

- FOUND: src/components/compliance-sidebar.tsx
- FOUND: src/components/__tests__/compliance-sidebar.test.tsx
- FOUND: src/components/build-ui.tsx (contains ComplianceSidebar, overrideSpec, gateViolations)
- FOUND: src/app/api/generate-page/route.ts (contains generateObject, runComplianceGate, 422)
- FOUND: commit 9ad9b39 (ComplianceSidebar feat)
- FOUND: commit 2ccc16b (BuildUI feat)
- FOUND: commit 29680dc (generate-page gate feat)

---
*Phase: 03-comply-engine*
*Completed: 2026-03-14*
