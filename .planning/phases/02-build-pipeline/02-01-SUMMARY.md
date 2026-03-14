---
phase: 02-build-pipeline
plan: "01"
subsystem: agent-contracts
tags: [ai-sdk, zod, schema, tdd, build-03, agent-prompts]
dependency_graph:
  requires:
    - "01-foundation (page-spec.ts, design-system.ts)"
  provides:
    - "BriefInterpretationSchema — agent output contract for brief interpreter"
    - "buildConstrainedPageSpecSchema — dynamic enum constraint factory for BUILD-03 enforcement"
    - "PROP_SHAPES — JSON-serializable prop metadata for LLM prompt injection"
    - "brief-interpreter/prompt.md — system prompt template with PATTERNS/MARKETS/COMPONENTS placeholders"
    - "component-selector/prompt.md — system prompt template with ALL_COMPONENTS_WITH_PROPS/PROP_SHAPES placeholders and CRITICAL CONSTRAINTS section"
  affects:
    - "02-02 (API routes will call buildConstrainedPageSpecSchema and inject PROP_SHAPES into prompts)"
    - "02-03 (renderer consumes base PageSpec after selectionReason is stripped)"
tech_stack:
  added:
    - "ai@^4.x — Vercel AI SDK core (generateObject, streamText)"
    - "@ai-sdk/anthropic — Anthropic Claude provider"
    - "@ai-sdk/openai — OpenAI GPT-4o provider"
    - "@ai-sdk/react — React hooks (useChat, useCompletion)"
  patterns:
    - "Schema extension via Zod .extend() — constrained schemas derive from base schemas, never rebuild them"
    - "Dynamic enum constraint — z.enum(dynamicIds) built at request time from live design system data"
    - "Two-variant wrapper — LLM always generates 2 PageSpec alternatives for review (Decision 13)"
    - "Prop shape adapter — node-type React props translated to JSON-serializable shapes for LLM consumption"
key_files:
  created:
    - "src/agents/brief-interpreter/schema.ts — BriefInterpretationSchema and BriefInterpretation type"
    - "src/agents/brief-interpreter/prompt.md — system prompt with {{PATTERNS}}, {{MARKETS}}, {{COMPONENTS}} placeholders"
    - "src/agents/brief-interpreter/__tests__/schema.test.ts — 8 schema validation tests"
    - "src/agents/component-selector/schema.ts — buildConstrainedPageSpecSchema() factory (BUILD-03 enforcement)"
    - "src/agents/component-selector/prop-shapes.ts — PROP_SHAPES record and getPropShape() for all 12 components"
    - "src/agents/component-selector/prompt.md — system prompt with {{ALL_COMPONENTS_WITH_PROPS}}, {{PROP_SHAPES}}, {{MARKET}} placeholders"
    - "src/agents/component-selector/__tests__/schema.test.ts — 9 constraint enforcement tests"
  modified:
    - "package.json — added ai, @ai-sdk/anthropic, @ai-sdk/openai, @ai-sdk/react dependencies"
decisions:
  - "Used .extend() on existing page-spec.ts schemas rather than rewriting — ensures constrained schema stays in sync with base types automatically"
  - "Dynamic z.enum() for both componentId and tokenId — BUILD-03 enforced at schema construction time, not post-validation"
  - "selectionReason field on ConstrainedComponentRefSchema only — added to generation schema for LLM explainability; must be stripped before handing off to renderer which uses base PageSpecSchema"
  - "PROP_SHAPES covers all 12 components including node-type adapters — prevents LLM from generating JSX in props"
metrics:
  duration: "~30 minutes"
  completed: "2026-03-14T00:27:40Z"
  tasks_completed: 2
  files_created: 7
  files_modified: 1
  tests_added: 17
  tests_passing: 17
---

# Phase 02 Plan 01: AI SDK Installation and Agent Contract Layer Summary

**One-liner:** Dynamic Zod constraint factory deriving from page-spec.ts via .extend() enforces BUILD-03 (no off-system components or tokens) at schema-construction time, with JSON-serializable prop shapes resolving the node-type prop problem for LLM generation.

## What Was Built

### AI SDK Installation

Installed the Vercel AI SDK family (`ai`, `@ai-sdk/anthropic`, `@ai-sdk/openai`, `@ai-sdk/react`) providing multi-provider LLM access for the subsequent API route plans.

### Brief Interpreter Agent (`src/agents/brief-interpreter/`)

**schema.ts** — `BriefInterpretationSchema` captures the structured output of the brief interpretation step: page type (pattern ID), market, product, audience (hcp/patient/general), content requirements, tone keywords, must-include component IDs, and reasoning for explainability.

**prompt.md** — System prompt template with `{{PATTERNS}}`, `{{MARKETS}}`, `{{COMPONENTS}}` placeholders. Rules section enforces that HCP pages always require ISIBlock and all pages require Footer, with market defaulting to `us-hcp` on ambiguity.

### Component Selector Agent (`src/agents/component-selector/`)

**schema.ts** — `buildConstrainedPageSpecSchema()` factory builds the generation schema at request time using live design system data:
- `componentId` constrained to `z.enum(loadComponents().map(c => c.id))` — BUILD-03 component enforcement
- `tokenId` constrained to `z.enum(loadTokens().map(t => t.id))` — BUILD-03 token enforcement
- `selectionReason` added to each component ref for LLM explainability
- Two-variant wrapper (`z.array(...).length(2)`) enforces Decision 13
- All base fields inherited via `.extend()` — zero duplication with page-spec.ts

**prop-shapes.ts** — `PROP_SHAPES` record maps all 12 component IDs to their JSON-serializable prop contracts. Node-type props (ISIBlock.content, ContentBlock.body) documented as plain strings; structural props (NavBar.links, Footer.links, Footer.disclaimers, DataTable.headers, DataTable.rows) documented as typed JSON arrays. `getPropShape()` helper for prompt builder access.

**prompt.md** — System prompt with `{{ALL_COMPONENTS_WITH_PROPS}}`, `{{PROP_SHAPES}}`, `{{MARKET}}`, `{{REQUIRED_COMPONENTS}}`, `{{REQUIRED_DISCLOSURES}}`, `{{PATTERN}}` placeholders. CRITICAL CONSTRAINTS section lists 10 numbered rules covering approved-only component/token IDs, HCP ISIBlock requirement, Footer requirement, two-variant mandate, node-type prop format, and selectionReason requirement.

## Test Coverage

17 tests across 2 test files:

**brief-interpreter/schema.test.ts (8 tests):**
- Valid interpretation accepted
- All audience enum values (hcp/patient/general) accepted
- Missing market rejected
- Missing product rejected
- Invalid audience value rejected
- Empty pageType rejected
- Empty reasoning rejected
- BriefInterpretation type inference verified

**component-selector/schema.test.ts (9 tests):**
- FakeComponent rejected
- All 12 valid component IDs accepted
- fake-token-999 rejected
- primary-blue-500 accepted
- 1 variant rejected (needs 2)
- 3 variants rejected (needs exactly 2)
- 2 variants accepted
- Empty design system throws (guard test with spy)
- Missing selectionReason rejected

## Verification Results

- `npm test -- --run src/agents/`: 17/17 passing
- `npx tsc --noEmit` (agent files): no errors
- `npm run build`: builds cleanly, all routes static

## Deviations from Plan

None — plan executed exactly as written.

## Self-Check: PASSED

All created files verified on disk. Both task commits (c5aad9b, 4be0826) verified in git log. 17/17 tests passing. Build clean.
