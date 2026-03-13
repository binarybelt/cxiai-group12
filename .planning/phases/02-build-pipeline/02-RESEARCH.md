# Phase 2: BUILD Pipeline - Research

**Researched:** 2026-03-13
**Domain:** Multi-agent AI pipeline, structured LLM output, React dynamic rendering
**Confidence:** HIGH

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| BUILD-01 | User can type a natural language brief and receive a generated page | Brief → generateObject (brief-interpreter) → streamObject (component-selector) → component registry renderer covers end-to-end flow |
| BUILD-02 | AI interprets brief into structured requirements (component, market, product context) visible in the system | generateObject with BriefInterpretation Zod schema; output serialized to Convex for visibility |
| BUILD-03 | Component selector picks ONLY from approved design system components | Allowlist injection pattern: componentIds enum built from loadComponents() at request time; schema enum enforces constraint |
| BUILD-04 | Generated page renders as live preview using approved components + tokens | Component registry (Record<string, React.ComponentType>) mapped from src/components/index.ts; PageSpec drives recursive render |
</phase_requirements>

---

## Summary

Phase 2 builds the core pipeline from natural language brief to live-rendered page using three agents: brief-interpreter, component-selector, and a page renderer. The entire pipeline flows through structured Zod schemas enforced at LLM call time via the Vercel AI SDK's `generateObject` and `streamObject` functions — this is the primary mechanism that makes constrained generation possible.

The critical insight for BUILD-03 (constrained selection) is that the component-selector's Zod schema must be constructed dynamically at request time, not statically. The `componentId` field in `ComponentRefSchema` must be typed as `z.enum([...componentIds])` where `componentIds` is the live list from `loadComponents()`. This makes it structurally impossible for the LLM to hallucinate a component that does not exist in the approved design system.

The page renderer is a pure React client component (`"use client"`) that holds a `COMPONENT_REGISTRY: Record<string, React.ComponentType>` mapping component IDs from `src/components/index.ts`. It receives a `PageSpec` as a prop and renders each section's component refs by looking them up in the registry. Any `componentId` that is not in the registry is a render-time guard against bad specs.

**Primary recommendation:** Use `generateObject` (not streaming) for the brief-interpreter since the full interpretation must complete before the selector runs. Use `streamObject` + `useObject` for the component-selector → live preview so the page appears section by section as the LLM generates the PageSpec.

---

## Foundation From Phase 1 (Already Available)

These artifacts exist and must be consumed, not rebuilt:

| Artifact | Location | What Phase 2 Uses It For |
|----------|----------|--------------------------|
| `PageSpecSchema` | `src/types/page-spec.ts` | Zod schema for `generateObject` in component-selector |
| `ComponentRefSchema` | `src/types/page-spec.ts` | Inner schema; must be extended with dynamic enum |
| `loadComponents()` | `src/lib/design-system.ts` | Source of truth for allowed `componentId` values |
| `getMarketConfig()` | `src/lib/design-system.ts` | Brief-interpreter uses to inject market rules |
| `loadPatterns()` | `src/lib/design-system.ts` | Brief-interpreter uses to match page type to pattern |
| 12 React components | `src/components/index.ts` | Renderer imports via barrel export for registry |
| `src/design-system/*.json` | All 5 JSON files | Injected into system prompts as allowlists |

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `ai` | 6.0.116 (installed) | Vercel AI SDK core — `generateObject`, `streamObject` | Multi-provider, TypeScript-native, schema-constrained generation |
| `@ai-sdk/anthropic` | 3.0.58 latest | Claude provider | Best reasoning for brief interpretation and constraint following |
| `@ai-sdk/openai` | 3.0.41 latest | GPT-4o provider | Fallback; fast for structured generation |
| `@ai-sdk/react` | bundled with ai@6 | `useObject` hook | Streams partial PageSpec to client for live preview |
| `zod` | ^4.1.12 (installed) | Schema definitions | Already in project; drives `generateObject` constraints |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `convex` | ^1.33.0 (installed) | Audit log + spec storage | Write each generated spec with timestamp for explainability |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `generateObject` for constrained output | Prompt-only JSON mode | `generateObject` enforces schema at SDK level with auto-retry; prompt-only is fragile |
| Dynamic enum in Zod schema | Post-generation allowlist filter | Dynamic enum prevents hallucination at generation time; filter is a second check, not primary |
| `streamObject` + `useObject` for live preview | `generateObject` + setState | Streaming shows the page building in real-time; batch hides latency behind a loader |

**Installation (Phase 2 additions, not yet in package.json):**
```bash
npm install ai @ai-sdk/anthropic @ai-sdk/openai @ai-sdk/react
```

Note: `ai` v6 is the current major version (confirmed via npm). The project does not yet have `ai` installed — it must be added in this phase.

---

## Architecture Patterns

### Recommended Project Structure
```
src/
├── app/
│   ├── api/
│   │   ├── interpret-brief/
│   │   │   └── route.ts        # POST: brief string → BriefInterpretation JSON
│   │   └── generate-page/
│   │       └── route.ts        # POST: BriefInterpretation → streamed PageSpec
│   └── build/
│       └── page.tsx            # Main BUILD UI — brief input + preview panel
├── agents/
│   ├── brief-interpreter/
│   │   ├── prompt.md           # System prompt (markdown, injected at runtime)
│   │   └── schema.ts           # BriefInterpretationSchema (Zod)
│   └── component-selector/
│       ├── prompt.md           # System prompt (markdown, injected at runtime)
│       └── schema.ts           # buildPageSpecSchema() factory (dynamic enum)
├── components/
│   ├── page-renderer.tsx       # "use client" — COMPONENT_REGISTRY + recursive render
│   └── build-ui.tsx            # "use client" — brief input, useObject hook
└── lib/
    └── design-system.ts        # Already exists — loadComponents(), getMarketConfig()
```

### Pattern 1: Brief Interpreter Agent (generateObject)

**What:** POST API route calls `generateObject` with `BriefInterpretationSchema`. System prompt is loaded from `agents/brief-interpreter/prompt.md` and injects the available markets, patterns, and component categories as JSON context.

**When to use:** First step in pipeline. Full completion required before selector runs. No streaming needed.

```typescript
// Source: https://ai-sdk.dev/docs/ai-sdk-core/generating-structured-data
// agents/brief-interpreter/schema.ts
import { z } from "zod";

export const BriefInterpretationSchema = z.object({
  pageType: z.string().describe("Pattern ID from patterns.json e.g. hcp-landing-page"),
  market: z.string().describe("Market ID from markets.json e.g. US, UK, EU"),
  product: z.string().describe("Product name extracted from the brief"),
  audience: z.enum(["hcp", "patient", "general"]),
  contentRequirements: z.array(z.string()).describe("Key content needs from the brief"),
  toneKeywords: z.array(z.string()).describe("Tone descriptors from the brief"),
  mustIncludeComponents: z.array(z.string()).describe("Component IDs explicitly requested"),
  reasoning: z.string().describe("Plain language explanation of interpretation decisions"),
});

export type BriefInterpretation = z.infer<typeof BriefInterpretationSchema>;
```

```typescript
// app/api/interpret-brief/route.ts
import { generateObject } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { BriefInterpretationSchema } from "@/agents/brief-interpreter/schema";
import { loadPatterns, loadMarkets, loadComponents } from "@/lib/design-system";
import fs from "fs/promises";
import path from "path";

export async function POST(req: Request) {
  const { brief } = await req.json();

  const systemPromptTemplate = await fs.readFile(
    path.join(process.cwd(), "src/agents/brief-interpreter/prompt.md"),
    "utf-8"
  );

  const systemPrompt = systemPromptTemplate
    .replace("{{PATTERNS}}", JSON.stringify(loadPatterns(), null, 2))
    .replace("{{MARKETS}}", JSON.stringify(loadMarkets(), null, 2))
    .replace("{{COMPONENTS}}", JSON.stringify(loadComponents().map(c => ({ id: c.id, category: c.category, description: c.description })), null, 2));

  const { object } = await generateObject({
    model: anthropic("claude-sonnet-4-5-20250414"),
    schema: BriefInterpretationSchema,
    system: systemPrompt,
    prompt: brief,
    maxRetries: 2,
  });

  return Response.json(object);
}
```

### Pattern 2: Component Selector with Dynamic Enum Constraint (THE CRITICAL PATTERN)

**What:** The `componentId` field in `ComponentRefSchema` must be a `z.enum()` built from the live component IDs. This makes the LLM's output structurally impossible to contain hallucinated component names.

**When to use:** Component-selector agent. This is the architectural enforcement of BUILD-03.

```typescript
// agents/component-selector/schema.ts
import { z } from "zod";
import { loadComponents } from "@/lib/design-system";

// Returns a PageSpec schema where componentId is constrained
// to only the IDs that exist in the design system.
// Called at request time, not at module load time.
export function buildConstrainedPageSpecSchema() {
  const componentIds = loadComponents().map((c) => c.id) as [string, ...string[]];

  const ConstrainedComponentRefSchema = z.object({
    componentId: z.enum(componentIds).describe(
      "Must be one of the approved component IDs. No custom components allowed."
    ),
    props: z.record(z.string(), z.unknown()),
    tokenOverrides: z.array(z.object({
      tokenId: z.string(),
      value: z.string(),
    })).optional(),
    selectionReason: z.string().describe(
      "Plain language explanation of why this component was chosen"
    ),
  });

  return z.object({
    id: z.string(),
    title: z.string(),
    market: z.string(),
    product: z.string(),
    sections: z.array(z.object({
      id: z.string(),
      type: z.enum(["hero", "content", "cta", "footer", "navigation", "data", "disclaimer", "isi"]),
      components: z.array(ConstrainedComponentRefSchema),
      order: z.number(),
    })).min(1),
    metadata: z.object({
      generatedBy: z.string(),
      generatedAt: z.string(),
      market: z.string(),
      product: z.string(),
    }),
  });
}
```

```typescript
// app/api/generate-page/route.ts
import { streamObject } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { buildConstrainedPageSpecSchema } from "@/agents/component-selector/schema";
import { loadComponents, loadPatterns, getMarketConfig } from "@/lib/design-system";
import type { BriefInterpretation } from "@/agents/brief-interpreter/schema";

export async function POST(req: Request) {
  const interpretation: BriefInterpretation = await req.json();

  const pattern = loadPatterns().find(p => p.id === interpretation.pageType);
  const marketConfig = getMarketConfig(interpretation.market);
  const allComponents = loadComponents();

  const systemPrompt = buildSelectorPrompt({ pattern, marketConfig, allComponents, interpretation });
  const schema = buildConstrainedPageSpecSchema();

  const result = streamObject({
    model: anthropic("claude-sonnet-4-5-20250414"),
    schema,
    system: systemPrompt,
    prompt: JSON.stringify(interpretation),
    maxRetries: 2,
  });

  return result.toTextStreamResponse();
}
```

### Pattern 3: Component Registry Renderer (Client Component)

**What:** A `"use client"` component that holds a static `COMPONENT_REGISTRY` map from component ID string to React component. Receives a `PageSpec` as prop and renders each section's component refs by registry lookup. Unknown IDs are silently skipped with a warning — they should never occur due to schema constraint.

**When to use:** Page renderer step. Pure composition, no LLM calls.

```typescript
// src/components/page-renderer.tsx
"use client";
import type { PageSpec, ComponentRef } from "@/types/page-spec";
import {
  Hero, Card, ISIBlock, Disclaimer, CTA, NavBar, Footer,
  DataTable, ClaimReference, SectionHeader, ContentBlock, ImageBlock,
} from "@/components/index";

// The registry: maps approved componentId strings to React components.
// Adding a component to the design system requires updating both
// components.json AND this registry.
const COMPONENT_REGISTRY: Record<string, React.ComponentType<Record<string, unknown>>> = {
  Hero,
  Card,
  ISIBlock,
  Disclaimer,
  CTA,
  NavBar,
  Footer,
  DataTable,
  ClaimReference,
  SectionHeader,
  ContentBlock,
  ImageBlock,
};

function renderComponentRef(ref: ComponentRef & { selectionReason?: string }, idx: number) {
  const Component = COMPONENT_REGISTRY[ref.componentId];
  if (!Component) {
    console.warn(`[PageRenderer] Unknown componentId: ${ref.componentId} — skipped`);
    return null;
  }
  return <Component key={`${ref.componentId}-${idx}`} {...(ref.props as Record<string, unknown>)} />;
}

interface PageRendererProps {
  spec: PageSpec;
}

export function PageRenderer({ spec }: PageRendererProps) {
  const sortedSections = [...spec.sections].sort((a, b) => a.order - b.order);
  return (
    <div className="page-renderer">
      {sortedSections.map((section) => (
        <section key={section.id} data-section-type={section.type}>
          {section.components.map((ref, idx) => renderComponentRef(ref, idx))}
        </section>
      ))}
    </div>
  );
}
```

### Pattern 4: Live Preview with useObject Hook

**What:** Client component uses `useObject` from `@ai-sdk/react` to stream the PageSpec from the `/api/generate-page` route. Renders the partial `PageRenderer` as sections arrive.

**When to use:** Build UI page — the main user-facing interaction surface.

```typescript
// src/components/build-ui.tsx
"use client";
import { experimental_useObject as useObject } from "@ai-sdk/react";
import { buildConstrainedPageSpecSchema } from "@/agents/component-selector/schema";
import { PageRenderer } from "@/components/page-renderer";
import { useState } from "react";

// NOTE: schema must be identical on client and server.
// Import the factory and call it here too.
const pageSpecSchema = buildConstrainedPageSpecSchema();

export function BuildUI() {
  const [brief, setBrief] = useState("");

  const { object: partialSpec, submit, isLoading, error } = useObject({
    api: "/api/generate-page-stream",
    schema: pageSpecSchema,
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Step 1: interpret brief
    const res = await fetch("/api/interpret-brief", {
      method: "POST",
      body: JSON.stringify({ brief }),
      headers: { "Content-Type": "application/json" },
    });
    const interpretation = await res.json();
    // Step 2: stream page spec generation
    submit(interpretation);
  }

  return (
    <div className="build-ui grid grid-cols-2 gap-4">
      <div className="brief-panel">
        <form onSubmit={handleSubmit}>
          <textarea
            value={brief}
            onChange={(e) => setBrief(e.target.value)}
            placeholder="Describe the page you want to build..."
            className="w-full h-32 p-3 border rounded"
          />
          <button type="submit" disabled={isLoading} className="mt-2 btn-primary">
            {isLoading ? "Generating..." : "Generate Page"}
          </button>
        </form>
        {error && <p className="text-red-600 mt-2">Generation failed. Please try again.</p>}
      </div>
      <div className="preview-panel border rounded overflow-auto">
        {partialSpec ? (
          <PageRenderer spec={partialSpec as PageSpec} />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            Preview will appear here
          </div>
        )}
      </div>
    </div>
  );
}
```

### Anti-Patterns to Avoid

- **Static `z.string()` for componentId:** Using `z.string()` instead of `z.enum([...ids])` allows hallucinated component names. Always build the enum from `loadComponents()` at request time.
- **Streaming the brief-interpreter:** The component-selector needs the complete interpretation as input. Streaming the first step adds complexity with no user-visible benefit — the brief-interpreter completes in <2 seconds.
- **Passing ReactNode in PageSpec props:** `ComponentRefSchema.props` is `Record<string, unknown>` — it must be serializable (strings, numbers, booleans). Never put JSX or functions in props; component implementations handle node rendering internally.
- **Client-side LLM calls:** All `generateObject`/`streamObject` calls must be in Next.js API route handlers (server-side). Environment variables are server-only.
- **One huge API route for the whole pipeline:** Keep brief-interpreter and component-selector as separate routes. This preserves modularity, allows independent retry, and makes the two-step visible in the UI.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Constrained JSON output from LLM | Custom JSON validator + retry loop | `generateObject` with Zod schema | SDK handles schema-to-provider translation, auto-retry, repair, and error surfacing |
| Streaming partial object to client | Custom SSE protocol | `streamObject` + `useObject` hook | Built-in, type-safe, handles partial objects natively |
| Provider abstraction | Direct API calls per provider | `@ai-sdk/anthropic` / `@ai-sdk/openai` adapters | Swap providers by changing one line; same `generateObject` interface |
| Component ID validation | Post-generation filter pass | Zod `z.enum()` in schema | Prevents hallucination at generation time, not after |
| LLM retry on schema failure | Manual retry loop | `maxRetries: 2` on `generateObject` | SDK retries automatically with the failed output for repair |

**Key insight:** The Vercel AI SDK's schema-constrained generation via `generateObject` is the entire foundation of BUILD-03's proof. Do not replicate this mechanism; configure it correctly.

---

## Common Pitfalls

### Pitfall 1: Schema Not Shared Between Client and Server
**What goes wrong:** `useObject` on the client and `streamObject` on the server use different schema instances. Partial object type safety breaks; TypeScript errors or runtime mismatches.
**Why it happens:** Defining the schema inline in each file instead of importing from a shared location.
**How to avoid:** Export `buildConstrainedPageSpecSchema()` from `agents/component-selector/schema.ts` and import it on both sides.
**Warning signs:** TypeScript type errors on `partialSpec` properties; `onFinish` receives `error` instead of `object`.

### Pitfall 2: z.enum() Requires at Least One Element
**What goes wrong:** `z.enum([])` throws a Zod error at schema construction time if `loadComponents()` returns an empty array.
**Why it happens:** Race condition during startup or test environment with no design system data.
**How to avoid:** Assert `componentIds.length > 0` before constructing the schema. Throw a descriptive error if the design system fails to load.
**Warning signs:** `ZodError: At least one value required` at server startup.

### Pitfall 3: node Props in ComponentRef Break Serialization
**What goes wrong:** Components with `type: "node"` props (NavBar.links, Footer.links, DataTable.headers/rows) cannot be passed as literal values in PageSpec JSON.
**Why it happens:** The PageSpec is a serializable intermediate representation; React nodes are not serializable.
**How to avoid:** For node-typed props, pass string arrays or structured data. The component implementations must convert these to JSX internally. For the demo, use placeholder strings (e.g., `"links": ["About", "Products", "Contact"]`).
**Warning signs:** JSON serialization errors; React rendering errors with unexpected object types.

### Pitfall 4: useObject Partial Objects Require Defensive Null Checks
**What goes wrong:** Rendering a partial `PageSpec` mid-stream causes TypeScript errors and runtime crashes because `sections` may be undefined or incomplete.
**Why it happens:** `useObject` streams incremental JSON; early parts of the object are `undefined`.
**How to avoid:** Use optional chaining everywhere in the renderer when consuming from `useObject`. The `PageRenderer` component should handle `spec.sections?.map(...)` defensively when called from the streaming context.
**Warning signs:** `Cannot read properties of undefined (reading 'map')`.

### Pitfall 5: LLM Selects Pattern-Violating Component Combinations
**What goes wrong:** The LLM generates a valid-schema PageSpec where market-required components (e.g., ISIBlock for US) are missing, or section order is wrong.
**Why it happens:** Zod schema enforces structure, not semantic pharma rules. Those rules live in `compliance-rules.json`.
**How to avoid:** The system prompt for the component-selector must inject the market's `requiredComponents` and `requiredDisclosures` explicitly. State them as hard requirements, not suggestions. Phase 3 (COMPLY engine) will add the automated gate; for Phase 2 the prompt is the primary defense.
**Warning signs:** US pages without ISIBlock; pages missing Footer with adverseEventUrl.

### Pitfall 6: api package not installed
**What goes wrong:** `ai`, `@ai-sdk/anthropic`, `@ai-sdk/react` are not in `package.json` — the project does not have them yet.
**Why it happens:** Phase 1 did not require LLM calls. Phase 2 is the first phase to use the AI SDK.
**How to avoid:** First task in Phase 2 must be installing these packages.
**Warning signs:** `Module not found: @ai-sdk/anthropic`.

---

## Code Examples

### Brief Interpreter System Prompt (agents/brief-interpreter/prompt.md template)
```markdown
You are a brief-interpreter agent for a pharma web design system.

Your job: read a natural language brief and extract structured requirements.

## Available Page Patterns
{{PATTERNS}}

## Available Markets
{{MARKETS}}

## Available Component Categories
{{COMPONENTS}}

## Rules
- pageType MUST be one of the pattern IDs above
- market MUST be one of the market IDs above
- mustIncludeComponents must only contain valid component IDs
- reasoning must explain your choices in plain language for the explainability panel
```

### Component Selector System Prompt (agents/component-selector/prompt.md template)
```markdown
You are a component-selector agent for a pharma web design system.

You will receive a structured brief interpretation and produce a PageSpec.

## CRITICAL CONSTRAINTS
- componentId MUST be one of the approved IDs. Any other value is INVALID.
- For market {{MARKET}}, the following components are REQUIRED: {{REQUIRED_COMPONENTS}}
- For market {{MARKET}}, the following disclosures are REQUIRED: {{REQUIRED_DISCLOSURES}}
- Follow the section structure defined in the pattern exactly.

## Pattern to Follow
{{PATTERN}}

## All Approved Components with Props
{{ALL_COMPONENTS_WITH_PROPS}}

## Rules
- Every HCP page requires ISIBlock
- Every page requires Footer with adverseEventUrl
- selectionReason must explain the choice in plain English for the explainability panel
- Generate TWO variants as an array of PageSpec objects (Decision 13 requirement)
```

### API Route for streaming (with correct response type)
```typescript
// Source: https://ai-sdk.dev/docs/ai-sdk-ui/object-generation
const result = streamObject({ model, schema, system, prompt });
return result.toTextStreamResponse();
// NOT result.toDataStreamResponse() — useObject expects text stream format
```

### Convex audit log mutation (build pipeline integration)
```typescript
// In the generate-page route, after successful generation:
// Log the PageSpec to Convex for audit trail (BUILD-02 visibility requirement)
// convex mutation: logGeneratedSpec({ specId, spec, briefInterpretation, generatedAt, model })
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Prompt-based JSON extraction (unreliable) | `generateObject` with Zod schema validation | AI SDK v3+ (2024) | Structural guarantee; SDK handles provider differences |
| API routes for all AI calls | Server Actions or API routes (both supported in AI SDK v6) | AI SDK v6 (2025) | Server Actions reduce boilerplate; API routes still valid for this use case |
| Single monolithic generation prompt | Multi-agent pipeline with typed handoff | 2024-2025 | Better error isolation, explainability, and model specialization |
| `experimental_useObject` | `useObject` (now stable in @ai-sdk/react) | AI SDK v4.x | Safe to use without experimental caveats |

**Deprecated/outdated:**
- `experimental_useObject`: The import name may still work but the stable import is `useObject` from `@ai-sdk/react` in v6. Verify import during implementation.
- `result.toDataStreamResponse()`: Used for `useChat`. For `useObject`, use `result.toTextStreamResponse()`.

---

## Open Questions

1. **Two variants (Decision 13)**
   - What we know: The DECISIONS.md requires the component-selector to produce two compliant variants with rationale.
   - What's unclear: `streamObject` with a single PageSpec schema only produces one. Either: (a) the schema wraps an array of two specs, or (b) two sequential API calls.
   - Recommendation: Wrap in `z.object({ variants: z.array(pageSpecSchema).length(2) })`. The renderer shows variant tabs. This is simpler than two calls.

2. **Convex mutation from API route**
   - What we know: Convex is initialized (Phase 1). Audit logging is a requirement (INTEG-02 in Phase 4, but BUILD-02 requires visibility now).
   - What's unclear: Whether Phase 2 needs a full Convex mutation or just in-memory state.
   - Recommendation: For Phase 2, serialize the `BriefInterpretation` and `PageSpec` to the API response and display in a collapsible panel. Full Convex mutation deferred to Phase 4 (INTEG-02 scope).

3. **Component prop validation at render time**
   - What we know: Components are typed. The LLM generates `props: Record<string, unknown>`.
   - What's unclear: Whether the renderer should validate required props before calling the component.
   - Recommendation: For the demo, do not add a prop validator. Components use TypeScript defaults/fallbacks. Malformed props produce a degraded render, not a crash — acceptable for hackathon scope.

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.0 |
| Config file | `vitest.config.ts` (or root-level package.json scripts) |
| Quick run command | `npm test` |
| Full suite command | `npm run test:coverage` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| BUILD-01 | Brief string enters system and PageSpec emerges | Integration (mock generateObject) | `npm test -- src/agents/brief-interpreter` | ❌ Wave 0 |
| BUILD-02 | BriefInterpretation schema validates correct and incorrect shapes | Unit | `npm test -- src/agents/brief-interpreter/schema` | ❌ Wave 0 |
| BUILD-03 | buildConstrainedPageSpecSchema rejects componentId not in design system | Unit | `npm test -- src/agents/component-selector/schema` | ❌ Wave 0 |
| BUILD-03 | buildConstrainedPageSpecSchema accepts all valid component IDs | Unit | `npm test -- src/agents/component-selector/schema` | ❌ Wave 0 |
| BUILD-04 | PageRenderer renders known componentId from registry | Unit (RTL) | `npm test -- src/components/page-renderer` | ❌ Wave 0 |
| BUILD-04 | PageRenderer skips unknown componentId without crashing | Unit (RTL) | `npm test -- src/components/page-renderer` | ❌ Wave 0 |

### Sampling Rate
- **Per task commit:** `npm test`
- **Per wave merge:** `npm run test:coverage`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `src/agents/brief-interpreter/__tests__/schema.test.ts` — validates BriefInterpretationSchema shapes (REQ BUILD-02)
- [ ] `src/agents/component-selector/__tests__/schema.test.ts` — validates constrained enum rejects hallucinated IDs (REQ BUILD-03)
- [ ] `src/components/__tests__/page-renderer.test.tsx` — RTL render tests for registry lookup (REQ BUILD-04)
- [ ] `src/agents/brief-interpreter/__tests__/route.test.ts` — mocked `generateObject` integration test (REQ BUILD-01)

---

## Sources

### Primary (HIGH confidence)
- [ai-sdk.dev — Generating Structured Data](https://ai-sdk.dev/docs/ai-sdk-core/generating-structured-data) — `generateObject`, `streamObject`, Output API patterns
- [ai-sdk.dev — Object Generation (useObject)](https://ai-sdk.dev/docs/ai-sdk-ui/object-generation) — `useObject` hook client + server pattern
- [ai-sdk.dev — Next.js App Router Getting Started](https://ai-sdk.dev/docs/getting-started/nextjs-app-router) — API route + useChat architecture
- [ai-sdk.dev — generateObject reference](https://ai-sdk.dev/docs/reference/ai-sdk-core/generate-object) — `maxRetries`, `experimental_repairText`, error types
- npm registry — `ai@6.0.116`, `@ai-sdk/anthropic@3.0.58`, `@ai-sdk/openai@3.0.41` (confirmed live)
- Phase 1 Summary files — Confirmed what is already built and available

### Secondary (MEDIUM confidence)
- [LogRocket — Real-time AI in Next.js with Vercel AI SDK](https://blog.logrocket.com/nextjs-vercel-ai-sdk-streaming/) — streaming pattern verification
- [Vercel AI SDK 6 blog post](https://vercel.com/blog/ai-sdk-6) — v6 changes including Server Actions, `useObject` stable status
- [Pluralsight — Dynamic component rendering from JSON config](https://www.pluralsight.com/guides/how-to-render-a-component-dynamically-based-on-a-json-config) — COMPONENT_REGISTRY pattern

### Tertiary (LOW confidence — verify during implementation)
- WebSearch findings on `experimental_repairText` — confirmed it exists but specific API signature not fully verified
- `useObject` stable vs experimental import name in ai@6 — verify correct import during package installation

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — npm registry confirmed current versions; ai-sdk.dev official docs consulted
- Architecture: HIGH — patterns derived from official AI SDK docs and Phase 1 actual artifacts
- Pitfalls: HIGH — derived from schema constraints (Zod behavior is deterministic), Phase 1 decisions, and official SDK error reference
- Validation: HIGH — Vitest already in project; test gap list derived from requirements

**Research date:** 2026-03-13
**Valid until:** 2026-04-13 (AI SDK v6 is current major; breaking changes unlikely in 30 days)
