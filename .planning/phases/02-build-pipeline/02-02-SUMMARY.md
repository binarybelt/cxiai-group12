---
phase: 02-build-pipeline
plan: "02"
subsystem: api-routes
tags: [api-routes, ai-sdk, convex, streaming, generateObject, streamObject, tdd, audit-logging]
dependency_graph:
  requires:
    - "02-01 (BriefInterpretationSchema, buildConstrainedPageSpecSchema, PROP_SHAPES, prompt.md files)"
    - "01-foundation (design-system.ts, convex/auditLog.ts)"
  provides:
    - "POST /api/interpret-brief — NL brief to BriefInterpretation JSON via generateObject"
    - "POST /api/generate-page — BriefInterpretation to streaming two-variant PageSpec via streamObject"
    - "src/lib/convex-client.ts — logGeneration() helper with graceful degradation"
  affects:
    - "02-03 (renderer consumes PageSpec from generate-page stream; useObject hook connects to /api/generate-page)"
    - "Frontend UI (streams two-variant PageSpec for live preview)"
tech_stack:
  added: []
  patterns:
    - "generateObject with BriefInterpretationSchema — structured JSON extraction, maxRetries:2"
    - "streamObject + toTextStreamResponse() — text stream format required by AI SDK useObject hook"
    - "onFinish callback for post-stream audit logging — fire-and-forget, never blocks response"
    - "ConvexHttpClient (not React client) — works in server-side Next.js API routes"
    - "Graceful degradation guard — null check on NEXT_PUBLIC_CONVEX_URL, logs warning, returns early"
    - "Prompt template injection — {{PLACEHOLDER}} replacement with live design system JSON"
key_files:
  created:
    - "src/lib/convex-client.ts — ConvexHttpClient wrapper, logGeneration() with graceful degradation"
    - "src/app/api/interpret-brief/route.ts — POST generateObject route with prompt injection and audit logging"
    - "src/app/api/generate-page/route.ts — POST streamObject route with constrained schema and onFinish logging"
    - "src/agents/brief-interpreter/__tests__/route.test.ts — 11 integration tests with mocked LLM"
  modified: []
decisions:
  - "Used toTextStreamResponse() not toDataStreamResponse() — AI SDK useObject hook expects text stream format per research"
  - "Fire-and-forget logGeneration via void — audit logging never blocks the response pipeline"
  - "onFinish callback for generate-page logging — fires after stream completes, logs variant count and market context"
  - "ConvexHttpClient singleton via module-level _client — reused across requests, initialized lazily on first call"
  - "readFile from fs/promises with process.cwd() join — works in both dev and production Next.js"
metrics:
  duration: "~15 minutes"
  completed: "2026-03-14T00:32:42Z"
  tasks_completed: 2
  files_created: 4
  files_modified: 0
  tests_added: 11
  tests_passing: 28
---

# Phase 02 Plan 02: API Routes and Convex Audit Logging Summary

**One-liner:** Two Next.js API routes wiring generateObject and streamObject to agent contract schemas, with ConvexHttpClient audit logging that gracefully degrades when Convex is unavailable.

## What Was Built

### ConvexHttpClient Helper (`src/lib/convex-client.ts`)

Server-side Convex integration for Next.js API routes. Uses `ConvexHttpClient` (not the React WebSocket client) so it works without a browser context. `logGeneration(action, details)` calls the `auditLog.logAction` mutation with `actor: "build-pipeline"`.

**Graceful degradation:** If `NEXT_PUBLIC_CONVEX_URL` is unset, logs a console warning and returns `undefined` without throwing. The pipeline never crashes for missing Convex configuration.

### interpret-brief Route (`src/app/api/interpret-brief/route.ts`)

POST handler that:
1. Validates `brief` is a non-empty string (400 on failure)
2. Loads `src/agents/brief-interpreter/prompt.md` via `fs.readFile`
3. Injects `{{PATTERNS}}`, `{{MARKETS}}`, `{{COMPONENTS}}` placeholders with live design system data
4. Calls `generateObject` with `BriefInterpretationSchema` and `maxRetries: 2`
5. Fire-and-forgets `logGeneration("interpret-brief", ...)` with brief truncated to 200 chars
6. Returns `Response.json(object)` — structured BriefInterpretation JSON

### generate-page Route (`src/app/api/generate-page/route.ts`)

POST handler that:
1. Accepts a `BriefInterpretation` object from request body
2. Loads `src/agents/component-selector/prompt.md` via `fs.readFile`
3. Injects market config, required components, pattern, component+prop shapes, and token IDs
4. Calls `buildConstrainedPageSpecSchema()` for BUILD-03 enforcement at request time
5. Calls `streamObject` with the constrained schema and `maxRetries: 2`
6. Returns `result.toTextStreamResponse()` — text stream format for AI SDK `useObject` hook
7. Logs to Convex in `onFinish` callback after streaming completes

### Integration Tests (`src/agents/brief-interpreter/__tests__/route.test.ts`)

11 tests covering the interpret-brief route with fully mocked LLM and Convex:

| Test | Coverage |
|------|----------|
| Valid brief → 200 + BriefInterpretation shape | Happy path |
| Design system injected into prompt | Placeholder replacement |
| Brief passed as user prompt | generateObject args |
| logGeneration called with correct action + details | Audit logging contract |
| Empty brief → 400 | Validation: empty string |
| Whitespace brief → 400 | Validation: trim |
| Missing brief → 400 | Validation: undefined |
| Number brief → 400 | Validation: type check |
| generateObject throws → 500 | Error handling |
| No logGeneration on error | Audit logging gate |
| No CONVEX_URL → still 200 | Graceful degradation |

## Verification Results

- `npm test -- --run src/agents/`: 28/28 passing (17 schema + 11 route)
- `npx tsc --noEmit` (new files): no errors
- `npm run build`: builds cleanly; `/api/generate-page` and `/api/interpret-brief` appear as dynamic (ƒ) routes

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed fs/promises mock in Vitest**
- **Found during:** Task 2 RED phase
- **Issue:** `vi.mock("fs/promises", () => ({ readFile: ... }))` fails in Vitest because the module requires a default export and named exports spread. Vitest reported "No 'default' export defined on the mock."
- **Fix:** Changed to `vi.mock("fs/promises", async (importOriginal) => { const actual = await importOriginal(); return { ...actual, readFile: mockFn }; })` — spreads the real module and overrides just `readFile`.
- **Files modified:** `src/agents/brief-interpreter/__tests__/route.test.ts`
- **Commit:** Included in `a9013ba`

## Self-Check: PASSED

All 4 created files verified on disk. Both task commits (331dbf5, a9013ba) verified in git log. 28/28 tests passing. Build clean with both API routes rendered as dynamic server routes.
