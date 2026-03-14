---
phase: 03-comply-engine
plan: "01"
subsystem: compliance
tags: [typescript, pure-functions, rule-engine, tdd, vitest, pharma, brand]

# Dependency graph
requires:
  - phase: 01-foundation
    provides: PageSpec type, design-system types, Zod schemas
  - phase: 02-build-pipeline
    provides: design-system loader functions (loadComponents, loadTokens, getMarketConfig)
provides:
  - ComplianceViolation, ComplianceScore, ComplianceResult, ViolationLocation types in src/types/compliance.ts
  - runBrandChecks pure function detecting unapproved component and token IDs
  - runPharmaChecks pure function detecting missing ISI, adverse event URL, disclaimer, market requirements
  - runComplianceGate combining brand+pharma violations with pass/fail gate
  - computeScore computing 0-100 scores per category with error/warning deductions
  - applyAutoFix immutably removing unapproved tokenOverrides from PageSpec
affects: [03-comply-engine-02, 03-comply-engine-03, api-routes, sidebar-ui]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Pure function rule engine with no DOM or React dependencies
    - Immutable data transforms using spread operator (applyAutoFix returns new object)
    - Set-based approved ID lookup for O(1) brand checks
    - TDD RED-GREEN cycle with vitest

key-files:
  created:
    - src/types/compliance.ts
    - src/lib/compliance.ts
    - src/lib/__tests__/compliance.test.ts
  modified: []

key-decisions:
  - "Compliance rule engine is purely functional (no side effects, no DOM) — enables use in both API routes and client components"
  - "applyAutoFix returns a new PageSpec via spread, never mutating input — aligns with project immutability requirement"
  - "ruleId strings are stable identifiers (brand-component-only, brand-approved-colors, pharma-isi-required-hcp, etc.) for downstream consumers"
  - "computeScore accepts a11y violations as { length: number }[] to keep it decoupled from a specific a11y tool"

patterns-established:
  - "Set-based lookup pattern: build Set from loadComponents/loadTokens IDs at check start for O(1) lookup"
  - "Page-level location pattern: violations that apply to whole page use sectionId: page-level sentinel"
  - "Gate pattern: runComplianceGate = brand + pharma combined, pass only if zero error-severity violations"

requirements-completed: [COMPLY-02, COMPLY-04, COMPLY-05, COMPLY-06]

# Metrics
duration: 2min
completed: 2026-03-14
---

# Phase 03 Plan 01: Compliance Rule Engine Summary

**Pure TypeScript compliance rule engine with brand/pharma checks, auto-fix, and compliance gate — 13 unit tests, zero type errors**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-14T20:46:08Z
- **Completed:** 2026-03-14T20:48:09Z
- **Tasks:** 2 (TDD: 1 RED + 1 GREEN)
- **Files modified:** 3

## Accomplishments

- Defined 4 compliance types (ViolationLocation, ComplianceViolation, ComplianceScore, ComplianceResult) in src/types/compliance.ts
- Implemented 5 exported pure functions in src/lib/compliance.ts with no DOM or React dependencies
- Wrote 13 unit tests covering all rule engine functions; all pass on GREEN commit
- runBrandChecks detects unapproved componentIds (error, not auto-fixable) and unapproved tokenOverrides (error, auto-fixable)
- runPharmaChecks catches missing ISIBlock on HCP pages, empty adverseEventUrl in Footer, missing Disclaimer, and missing market-required components
- applyAutoFix produces a new PageSpec via immutable spread, never mutating input

## Task Commits

Each task was committed atomically:

1. **Task 1: Define compliance types and write failing tests** - `54bd97d` (test)
2. **Task 2: Implement rule engine to pass all tests (GREEN)** - `9c3cdd5` (feat)

**Plan metadata:** (docs commit — created after this summary)

_Note: TDD tasks have two commits: test (RED) then feat (GREEN)_

## Files Created/Modified

- `src/types/compliance.ts` - ViolationLocation, ComplianceViolation, ComplianceScore, ComplianceResult interfaces
- `src/lib/compliance.ts` - runBrandChecks, runPharmaChecks, runComplianceGate, computeScore, applyAutoFix pure functions
- `src/lib/__tests__/compliance.test.ts` - 13 unit tests with makePageSpec fixture helper

## Decisions Made

- Compliance rule engine is purely functional (no side effects, no DOM) — enables use in both API routes and client components without hydration issues
- applyAutoFix returns a new PageSpec via spread, never mutating input — aligns with project immutability requirement from CLAUDE.md
- ruleId strings are stable identifiers (brand-component-only, brand-approved-colors, pharma-isi-required-hcp, pharma-adverse-event-link, pharma-disclaimer-promotional, pharma-market-required-component) for downstream consumers
- computeScore accepts a11y violations as { length: number }[] to keep it decoupled from a specific a11y tool

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered

- `--testPathPattern` vitest flag was rejected (jest-specific flag) — used positional pattern argument instead. Tests still ran correctly.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- All 5 rule engine functions exported and fully tested — ready for 03-02 (API route) and 03-03 (sidebar UI) consumers
- ComplianceResult type matches what the API route will return
- applyAutoFix is ready to be called from the sidebar fix action handler

## Self-Check: PASSED

- FOUND: src/types/compliance.ts
- FOUND: src/lib/compliance.ts
- FOUND: src/lib/__tests__/compliance.test.ts
- FOUND: commit 54bd97d (RED phase)
- FOUND: commit 9c3cdd5 (GREEN phase)

---
*Phase: 03-comply-engine*
*Completed: 2026-03-14*
