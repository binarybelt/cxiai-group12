# Phase 4: Demo Features - Research

**Researched:** 2026-03-14
**Domain:** Chat-to-edit loop, role-based views, SCAN dashboard, Figma token import, audit trail UI
**Confidence:** HIGH

---

## Summary

Phase 4 layers 9 requirements on top of the working Phase 2+3 foundation. The core BUILD pipeline
(brief → interpret → generate → render → comply) is already complete. Phase 4's job is to make
the demo story legible to a live audience: chat-to-edit, explainability, role switching, SCAN
dashboard, Figma import, and a visible audit trail.

Critically, a layout bug exists on the `/build` page that must be fixed as part of this phase.
The 3-column grid (`grid-cols-[1fr_2fr_320px]`) is rendered inside a `<main>` tag with no
height constraint, so `min-h-screen` on the grid doesn't propagate to a full-viewport height when
the header above it is also in the DOM flow. The fix is straightforward: switch to a flex-column
root layout (`h-screen overflow-hidden flex flex-col`) with the grid taking `flex-1 overflow-hidden`,
and each column getting `overflow-y-auto`.

All 9 requirements are additive — they extend existing state (`PageSpec`, `ComplianceResult`,
audit log) rather than replacing anything. The selectionReason field already exists in
`ConstrainedComponentRefSchema` and flows through generate-page, so explainability data is
already in-transit and just needs a UI surface. Convex `auditLog` table is already seeded with
`logGeneration` calls; INTEG-02 only needs a query + display panel.

**Primary recommendation:** Implement in 4 self-contained plans that map to the 4 planned
sub-tasks: (1) chat-to-edit + explainability, (2) role views + role toggle, (3) SCAN engine +
dashboard, (4) Figma import + audit trail UI + layout fix.

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| BUILD-05 | Chat-to-edit: user sends edit instruction, page updates with visible diff | New `/api/chat-edit` route using `generateObject`; diff computed client-side by comparing old vs new PageSpec sections |
| BUILD-06 | Explainability panel: shows why each component/token was chosen | `selectionReason` already on `ConstrainedComponentRefSchema` — strip logic in renderer must be bypassed or the reason stored separately before stripping |
| SCAN-01 | Dashboard shows portfolio compliance overview (pre-scanned data) | Static pre-seeded JSON + a dedicated `/scan` route; no live scanning needed for portfolio view |
| SCAN-02 | User can scan one live URL and return a drift report | Fetch URL server-side, extract text/tokens via simple heuristics, compare against design system tokens |
| ROLE-01 | Marketer view: visual editor with chat-to-edit and simple compliance indicators | Role state at BuildUI level; Marketer tab shows brief + chat + simplified score badge |
| ROLE-02 | QA view: full compliance report, audit trail, risk scores, auto-fix | QA tab shows full ComplianceSidebar + audit trail panel |
| ROLE-03 | Developer view: generated code output + component specs | Developer tab shows JSON PageSpec and a code-generation panel (rendered as a code block) |
| INTEG-01 | Figma URL paste → extracted design tokens appear in system | Server-side fetch of Figma share URL; extract colour hex values via regex; display as token list |
| INTEG-02 | Audit trail: timestamped log of every change including AI decisions | Convex `getRecentLogs` query already exists; add a React panel that polls/subscribes and renders the log |
</phase_requirements>

---

## Standard Stack

### Core (already installed)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js App Router | ^16.1.6 | Routing + API routes | Project foundation — all routes are App Router |
| Vercel AI SDK (`ai`) | ^6.0.116 | `generateObject` for chat-edit agent | Already used for generate-page; same pattern for chat-edit |
| `@ai-sdk/react` | ^3.0.118 | `useObject` / `useChat` hooks | Already in use for client-side AI interactions |
| Zod | ^4.1.12 | Schema enforcement on chat-edit output | All agent outputs are Zod-validated |
| Convex | ^1.33.0 | Audit trail persistence + real-time queries | Already has `auditLog` table + `logAction` / `getRecentLogs` |
| Tailwind CSS | ^3.4.17 | All UI styling | Project convention |
| Vitest + Testing Library | ^4.1.0 | Unit tests | Existing test infrastructure |

### No New Packages Required

All Phase 4 requirements are implementable with the existing dependency set. Specifically:

- **Figma import**: fetch() (built-in) + regex to extract CSS custom property hex values from Figma share page HTML. No official Figma API auth needed for the demo — the export target is a shared Figma file URL, not the API.
- **SCAN drift report**: fetch() server-side + string matching against token values from `tokens.json`.
- **Code view**: `JSON.stringify(pageSpec, null, 2)` displayed in a `<pre>` block — no syntax highlighter needed for hackathon.
- **Diff display**: Pure JavaScript object comparison between old and new PageSpec; no diff library needed.

**Installation:** No new packages needed.

---

## Architecture Patterns

### Recommended File Layout for Phase 4

```
src/
├── app/
│   ├── build/
│   │   └── page.tsx              # LAYOUT FIX: h-screen flex-col wrapper
│   ├── scan/
│   │   └── page.tsx              # New: SCAN dashboard route
│   └── api/
│       ├── chat-edit/
│       │   └── route.ts          # New: POST /api/chat-edit
│       └── scan-url/
│           └── route.ts          # New: POST /api/scan-url
├── components/
│   ├── build-ui.tsx              # Extended: role toggle + chat panel + explainability
│   ├── role-views/
│   │   ├── marketer-view.tsx     # ROLE-01: brief + chat + score badge
│   │   ├── qa-view.tsx           # ROLE-02: full compliance + audit trail
│   │   └── developer-view.tsx    # ROLE-03: code output + component spec list
│   ├── chat-panel.tsx            # BUILD-05: message input + history + diff display
│   ├── explainability-panel.tsx  # BUILD-06: per-component reason list
│   ├── diff-display.tsx          # BUILD-05: visual diff between old/new spec
│   ├── audit-trail.tsx           # INTEG-02: Convex-subscribed log panel
│   ├── scan-dashboard.tsx        # SCAN-01: portfolio overview + live scan form
│   └── figma-import.tsx          # INTEG-01: URL paste + token extraction panel
├── agents/
│   └── chat-editor/
│       ├── prompt.md             # Edit instruction → PageSpec delta prompt
│       └── schema.ts             # Zod schema: same ConstrainedPageSpecSchema
├── lib/
│   ├── diff.ts                   # New: computePageSpecDiff(old, new) → DiffResult
│   ├── scan.ts                   # New: driftReport(url, designSystem) → ScanReport
│   └── figma.ts                  # New: extractTokensFromFigmaUrl(url) → TokenDraft[]
└── types/
    ├── diff.ts                   # New: DiffResult, SectionDiff, ComponentDiff
    └── scan.ts                   # New: ScanReport, PortfolioEntry, DriftItem
```

### Pattern 1: Chat-Edit Loop (BUILD-05)

**What:** User types an edit instruction ("make it warmer"). Client POSTs `{ spec: PageSpec, instruction: string }` to `/api/chat-edit`. Route runs `generateObject` with the current spec + instruction in the system prompt. Returns new spec. Client computes diff, updates state, shows diff panel.

**When to use:** Every chat message in the BUILD phase after initial generation.

**Key decision:** The chat-edit agent REUSES `buildConstrainedPageSpecSchema()` — it generates a complete replacement PageSpec (not a delta). This avoids partial-update complexity and ensures the compliance gate still runs on every edit.

```typescript
// src/app/api/chat-edit/route.ts pattern
// Source: established from generate-page/route.ts
export async function POST(req: NextRequest): Promise<Response> {
  const { spec, instruction } = await req.json();
  const schema = buildConstrainedPageSpecSchema();
  const result = await generateObject({
    model: getLLM(),
    schema,
    system: chatEditPrompt(spec, instruction),
    prompt: instruction,
  });
  void logGeneration("chat-edit", JSON.stringify({ instruction }));
  // Run compliance gate same as generate-page
  const violations = runComplianceGate(result.object.variants[0]);
  // Return new spec (single variant for chat edits is sufficient)
  return Response.json({ spec: result.object.variants[0], violations });
}
```

### Pattern 2: Explainability Panel (BUILD-06)

**What:** `selectionReason` is already on every component ref in the `ConstrainedComponentRefSchema`. The generate-page route calls `buildConstrainedPageSpecSchema()` which includes it. However, the PageSpec passed to the renderer strips it (renderer uses `ComponentRef` from `page-spec.ts`, not the constrained type). The solution: store the raw constrained output separately in BuildUI state alongside the rendered spec. Pass it to an `ExplainabilityPanel` that maps component refs to their selectionReason.

**Key insight:** Don't modify the renderer or the base PageSpec type. Add `rawSpec: ConstrainedPageSpecOutput | null` as a second state slot in BuildUI.

```typescript
// BuildUI state addition
const [rawSpec, setRawSpec] = useState<ConstrainedPageSpecOutput | null>(null);
// In generate-page route response, also return the raw constrained variant
// ExplainabilityPanel iterates rawSpec.variants[selectedVariant].sections
// and renders a list of component + selectionReason pairs
```

### Pattern 3: Role Views (ROLE-01, ROLE-02, ROLE-03)

**What:** A 3-tab toggle at the top of BuildUI. Tab state is local to BuildUI (`useState<'marketer' | 'qa' | 'developer'>`). Each tab renders a different view of the same shared state (same spec, same violations, same audit log). The 3-column grid layout morphs per tab:

- **Marketer**: Left=brief+chat, Center=preview, Right=simplified score badge only
- **QA**: Left=violations list, Center=preview, Right=full ComplianceSidebar + audit trail
- **Developer**: Left=component spec list, Center=preview, Right=code output panel

No routing changes needed — all within `/build` as tab state.

### Pattern 4: SCAN Dashboard (SCAN-01, SCAN-02)

**What:** New `/scan` route. SCAN-01 loads a static pre-seeded `portfolio.json` (fabricated demo data: 5-8 Pfizer URLs with pre-computed compliance scores + drift items). SCAN-02 accepts a URL POST to `/api/scan-url`: server fetches the HTML, uses regex to extract hex color values and CSS custom properties, compares against the design system token values, returns a drift report listing which tokens are off-brand and by how much.

```typescript
// src/lib/scan.ts — server-side URL scan
export async function driftReport(url: string, tokens: DesignToken[]): Promise<ScanReport> {
  const html = await fetch(url).then(r => r.text());
  // Extract hex values found in inline styles / style tags
  const hexValues = [...html.matchAll(/#[0-9a-fA-F]{3,6}/g)].map(m => m[0]);
  const approvedHex = new Set(tokens.filter(t => t.category === "color").map(t => t.value));
  const driftItems = hexValues
    .filter(hex => !approvedHex.has(hex))
    .map(hex => ({ hex, message: `Color ${hex} not in approved design system palette` }));
  return { url, driftCount: driftItems.length, items: driftItems, scannedAt: new Date().toISOString() };
}
```

**SCAN-01 pre-seeded portfolio data structure:**
```typescript
interface PortfolioEntry {
  url: string;
  product: string;
  market: string;
  complianceScore: number;
  lastScanned: string;
  driftCount: number;
  status: "compliant" | "warning" | "critical";
}
```

### Pattern 5: Figma Import (INTEG-01)

**What:** User pastes a Figma share URL (e.g. `https://www.figma.com/file/...`). Client POSTs to `/api/figma-extract` or calls a server action. Server fetches the Figma share page HTML (no API key — public share page). Regex-extracts CSS hex values, rgba values, and any CSS custom property names. Displays extracted colours as a token preview list side-by-side with the approved palette.

**Key constraint:** Figma's share pages are React-rendered (client-side) — a raw server-side `fetch()` will get an essentially empty HTML shell. The practical demo approach is:

1. Accept the Figma URL, acknowledge the import was "initiated"
2. Return a hard-coded set of sample extracted tokens that match what a real Figma file would contain (this is demo-grade acceptable per project scope)
3. OR: use the Figma API if a `FIGMA_API_TOKEN` env var is present (file read endpoint: `GET /v1/files/:file_key` returns styles including colors)

**Recommendation:** Implement with Figma REST API (file key parsed from URL + `FIGMA_API_TOKEN` env var). If token not set, fall back to fabricated demo tokens. The Figma file colors endpoint is simple and well-documented.

```typescript
// Figma API: GET https://api.figma.com/v1/files/{file_key}/styles
// Headers: X-Figma-Token: {FIGMA_API_TOKEN}
// Response includes style metadata; color values need a second call per style node
// For demo: GET /v1/files/{file_key} → document.styles → color fills
```

### Pattern 6: Audit Trail Display (INTEG-02)

**What:** The Convex `getRecentLogs` query is already defined. Add a React component that uses `useQuery(api.auditLog.getRecentLogs)` (Convex real-time subscription). Render as a timestamped list. The QA view tab includes this panel. Also wire chat-edit events to `logGeneration` so every edit appears in the trail.

```typescript
// src/components/audit-trail.tsx
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export function AuditTrail() {
  const logs = useQuery(api.auditLog.getRecentLogs);
  // logs auto-updates via Convex real-time subscription
}
```

### Layout Fix Pattern (Build Page Bug)

**What goes wrong:** `<main>` has no height constraint. The grid's `min-h-screen` doesn't account for the header above it (which is also in `<main>`). The right sidebar and middle column overflow off-screen.

**Fix:**

```tsx
// build/page.tsx — server component
export default function BuildPage() {
  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <header className="flex-shrink-0 border-b border-gray-200 bg-white px-6 py-4">
        {/* header content */}
      </header>
      <BuildUI />
    </div>
  );
}

// build-ui.tsx — grid becomes flex-1
<div className="flex flex-1 overflow-hidden gap-0 lg:grid lg:grid-cols-[1fr_2fr_320px]">
  <div className="flex flex-col overflow-y-auto p-6">{/* left */}</div>
  <div className="flex flex-col overflow-y-auto p-6">{/* center */}</div>
  <div className="flex flex-col overflow-y-auto border-l border-gray-200 bg-gray-50 p-4">{/* sidebar */}</div>
</div>
```

### Anti-Patterns to Avoid

- **Don't stream the chat-edit response**: `generateObject` (non-streaming) keeps the diff computation simple — diff runs once when the full new spec arrives. Streaming a diff is much harder.
- **Don't create a new PageSpec type for roles**: Role views are UI concerns. The same spec drives all three views; only the chrome differs.
- **Don't try to make Figma extraction perfect**: The demo audience cares that tokens appear, not that the extraction is production-grade. Graceful fallback to fabricated tokens is acceptable.
- **Don't add new Convex tables for Phase 4**: The existing `auditLog` table is sufficient. Richer `details` JSON strings cover all audit events.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Page spec diff | Custom AST differ | Simple section/component ID comparison | PageSpec is flat enough; deep diff is overkill |
| Real-time audit log | Polling with setInterval | Convex `useQuery` | Convex subscriptions push updates automatically |
| Role access control | Auth middleware | Local `useState` role toggle | Per requirements: no auth needed for demo |
| Code syntax highlighting | Custom highlighter | `<pre><code>` with whitespace | Demo-grade; full highlighter adds a dependency |
| Figma design token extraction | Custom parser | Figma REST API v1 `/files/:key` | Official API returns structured color data |

---

## Common Pitfalls

### Pitfall 1: selectionReason Gets Stripped Before Explainability Can Use It

**What goes wrong:** The generate-page route currently receives the constrained schema output and returns `spec` (the raw result with `selectionReason` on each component ref). The renderer accepts `PageSpec` (base type, no selectionReason). If the client only stores the variants as `PageSpec[]`, the selectionReason is lost at the type boundary.

**Why it happens:** TypeScript's structural typing means the extra field is present at runtime but invisible at the type level. It survives until something explicitly strips it — but the developer treating it as `PageSpec[]` might not pass it to the explainability panel.

**How to avoid:** Store the raw constrained output (`ConstrainedPageSpecOutput`) in a separate state slot in BuildUI. Pass to ExplainabilityPanel. Never rely on the renderer's spec for explainability data.

**Warning signs:** Explainability panel shows empty reasons or undefined for all components.

### Pitfall 2: Chat-Edit Returns Violation-Blocked Spec but Client Shows Stale State

**What goes wrong:** Chat-edit triggers a compliance gate on the new spec. If the new spec fails (422), the client must decide whether to show the old spec or the blocked new spec. If it silently ignores the 422, the page appears unchanged with no user feedback.

**How to avoid:** Same pattern as generate-page: on 422, set gateViolations state and show the blocked spec in the sidebar. The chat panel should show an inline error: "Edit blocked — compliance violations found."

### Pitfall 3: SCAN URL Fetch Fails Due to CORS / Bot Protection

**What goes wrong:** Many real pharmaceutical URLs block server-side fetches (bot detection, Cloudflare, etc.). The demo scan will fail for most real URLs.

**How to avoid:** For SCAN-02, the demo approach should be to scan a URL you control (e.g. the app's own `/preview` route, or a simple static page). Document this in the UI: "Scan works best with publicly accessible pages." Provide a pre-filled example URL that works.

**Warning signs:** fetch() returns 403, 429, or empty body.

### Pitfall 4: Convex `useQuery` Used in a Server Component

**What goes wrong:** Convex React hooks (`useQuery`) only work in client components. The audit trail panel must be `"use client"`.

**How to avoid:** Always add `"use client"` to any component that uses `useQuery`. The Convex client is initialized in `providers.tsx` wrapping the app — this is already wired.

### Pitfall 5: Role Views Cause Layout Reflow on Tab Switch

**What goes wrong:** Switching role tabs causes the 3-column grid to re-render with different children, potentially causing scroll positions to reset and layout jank.

**How to avoid:** Keep the grid structure constant. Use conditional rendering inside each column slot rather than swapping the grid layout entirely. Hide/show column content with `hidden` class based on role.

### Pitfall 6: Build Page Layout Bug Not Fixed Before Other Phase 4 Work

**What goes wrong:** The layout bug makes the build page look broken in the demo. All Phase 4 UI built on top of the broken layout inherits the bug and is harder to review during development.

**How to avoid:** Fix the layout bug in the first plan (04-01) before building chat-to-edit UI on top of it.

---

## Code Examples

### Chat-Edit State in BuildUI

```typescript
// Source: extends existing build-ui.tsx state pattern
type ChatMessage = { role: "user" | "assistant"; content: string };
const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
const [diffResult, setDiffResult] = useState<DiffResult | null>(null);

async function handleChatEdit(instruction: string) {
  if (!currentSpec) return;
  const res = await fetch("/api/chat-edit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ spec: currentSpec, instruction }),
  });
  if (!res.ok) return; // handle error
  const { spec: newSpec } = await res.json();
  const diff = computePageSpecDiff(currentSpec, newSpec);
  setDiffResult(diff);
  setVariants([newSpec, variants?.[1] ?? newSpec]);
  setOverrideSpec(null);
  setChatHistory(h => [...h, { role: "user", content: instruction }, { role: "assistant", content: `Updated: ${diff.summary}` }]);
}
```

### PageSpec Diff Computation

```typescript
// src/lib/diff.ts
export interface DiffResult {
  summary: string;
  addedSections: string[];
  removedSections: string[];
  modifiedComponents: Array<{ sectionId: string; componentId: string; what: string }>;
}

export function computePageSpecDiff(oldSpec: PageSpec, newSpec: PageSpec): DiffResult {
  const oldSectionIds = new Set(oldSpec.sections.map(s => s.id));
  const newSectionIds = new Set(newSpec.sections.map(s => s.id));
  const addedSections = [...newSectionIds].filter(id => !oldSectionIds.has(id));
  const removedSections = [...oldSectionIds].filter(id => !newSectionIds.has(id));
  const modifiedComponents: DiffResult["modifiedComponents"] = [];

  for (const newSection of newSpec.sections) {
    const oldSection = oldSpec.sections.find(s => s.id === newSection.id);
    if (!oldSection) continue;
    for (const newComp of newSection.components) {
      const oldComp = oldSection.components.find(c => c.componentId === newComp.componentId);
      if (!oldComp || JSON.stringify(oldComp.props) !== JSON.stringify(newComp.props)) {
        modifiedComponents.push({ sectionId: newSection.id, componentId: newComp.componentId, what: "props changed" });
      }
    }
  }
  const summary = [
    addedSections.length > 0 && `${addedSections.length} section(s) added`,
    removedSections.length > 0 && `${removedSections.length} section(s) removed`,
    modifiedComponents.length > 0 && `${modifiedComponents.length} component(s) modified`,
  ].filter(Boolean).join(", ") || "No visible changes";

  return { summary, addedSections, removedSections, modifiedComponents };
}
```

### Figma API Token Extraction

```typescript
// src/lib/figma.ts
export interface TokenDraft { name: string; value: string; category: "color" }

export async function extractTokensFromFigmaUrl(url: string): Promise<TokenDraft[]> {
  const match = url.match(/figma\.com\/(?:file|design)\/([a-zA-Z0-9]+)/);
  if (!match) throw new Error("Invalid Figma URL");
  const fileKey = match[1];
  const token = process.env.FIGMA_API_TOKEN;
  if (!token) {
    // Demo fallback: return fabricated tokens
    return DEMO_FIGMA_TOKENS;
  }
  const res = await fetch(`https://api.figma.com/v1/files/${fileKey}`, {
    headers: { "X-Figma-Token": token },
  });
  if (!res.ok) throw new Error(`Figma API error: ${res.status}`);
  const data = await res.json();
  // Extract fills from document canvas nodes (simplified)
  return extractColorsFromDocument(data.document);
}
```

### Convex Audit Trail Component

```typescript
// src/components/audit-trail.tsx
"use client";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export function AuditTrail() {
  const logs = useQuery(api.auditLog.getRecentLogs);
  if (!logs) return <p className="text-sm text-gray-400">Loading audit trail...</p>;
  return (
    <ol className="flex flex-col gap-2">
      {logs.map(log => (
        <li key={log._id} className="rounded-lg border border-gray-100 bg-white p-3 text-xs">
          <time className="text-gray-400">{new Date(log.timestamp).toLocaleTimeString()}</time>
          <p className="font-semibold text-gray-700">{log.action}</p>
          <p className="mt-0.5 text-gray-500 line-clamp-2">{log.details}</p>
        </li>
      ))}
    </ol>
  );
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `streamObject` for generation | `generateObject` | Phase 3 | Full spec available before response; enables sync gate |
| Streaming component defaults | Same (retained) | Phase 2 | Still needed for any future streaming additions |
| Manual Convex polling | `useQuery` reactive | Convex 1.0+ | Real-time push without polling code |
| Figma REST scraping | Figma REST API v1 | 2021 | Official structured data, no HTML parsing |

**Deprecated/outdated:**
- `toTextStreamResponse()` + `useObject`: still valid for streaming, but Phase 4 chat-edit should use non-streaming `generateObject` for diff simplicity.

---

## Open Questions

1. **Can the demo Figma URL be a real public file?**
   - What we know: Figma share pages are client-rendered; server-side fetch gets empty shell without `FIGMA_API_TOKEN`.
   - What's unclear: Whether the hackathon demo environment will have a `FIGMA_API_TOKEN` set.
   - Recommendation: Implement with API token support; fall back to fabricated demo tokens if not set. Both paths should be tested.

2. **What URL should SCAN-02 scan in the demo?**
   - What we know: Real pharma URLs will likely block server-side fetches. The scan needs to work during the live demo.
   - What's unclear: Whether the demo will use a controlled URL.
   - Recommendation: Default the scan URL input to a known-working public URL (e.g. `https://pfizer.com` which is publicly accessible). Alternatively, scan the app's own rendered output.

3. **Does the Convex deployment exist?**
   - What we know: `NEXT_PUBLIC_CONVEX_URL` graceful degradation is in place; audit log writes skip if not set.
   - What's unclear: Whether Convex is deployed and seeded for demo day.
   - Recommendation: Phase 4 plan should include a task to verify Convex is deployed and `getRecentLogs` returns data. The AuditTrail component should show a meaningful empty state if no logs exist yet.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.0 + Testing Library 16.3.2 |
| Config file | `vitest.config.ts` |
| Quick run command | `npx vitest run --reporter=verbose` |
| Full suite command | `npx vitest run --coverage` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| BUILD-05 | `computePageSpecDiff` returns correct diff | unit | `npx vitest run src/lib/__tests__/diff.test.ts` | Wave 0 |
| BUILD-05 | Chat-edit POST route returns new spec | unit | `npx vitest run src/app/api/__tests__/chat-edit.test.ts` | Wave 0 |
| BUILD-06 | ExplainabilityPanel renders selectionReason for each component | unit | `npx vitest run src/components/__tests__/explainability-panel.test.tsx` | Wave 0 |
| SCAN-01 | ScanDashboard renders portfolio data | unit | `npx vitest run src/components/__tests__/scan-dashboard.test.tsx` | Wave 0 |
| SCAN-02 | `driftReport` identifies off-brand hex values | unit | `npx vitest run src/lib/__tests__/scan.test.ts` | Wave 0 |
| ROLE-01 | Role toggle switches to Marketer view | unit | `npx vitest run src/components/__tests__/build-ui.test.tsx` | Wave 0 |
| ROLE-02 | QA view renders compliance sidebar + audit trail | unit | `npx vitest run src/components/__tests__/build-ui.test.tsx` | Wave 0 |
| ROLE-03 | Developer view renders code output panel | unit | `npx vitest run src/components/__tests__/build-ui.test.tsx` | Wave 0 |
| INTEG-01 | `extractTokensFromFigmaUrl` parses file key from URL | unit | `npx vitest run src/lib/__tests__/figma.test.ts` | Wave 0 |
| INTEG-02 | AuditTrail renders log entries | unit | `npx vitest run src/components/__tests__/audit-trail.test.tsx` | Wave 0 |

### Sampling Rate

- **Per task commit:** `npx vitest run --reporter=verbose`
- **Per wave merge:** `npx vitest run --coverage`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps

All test files are new (Phase 4 introduces all new modules):

- [ ] `src/lib/__tests__/diff.test.ts` — covers BUILD-05 diff logic
- [ ] `src/lib/__tests__/scan.test.ts` — covers SCAN-02 drift report
- [ ] `src/lib/__tests__/figma.test.ts` — covers INTEG-01 URL parsing + fallback
- [ ] `src/app/api/__tests__/chat-edit.test.ts` — covers BUILD-05 API route
- [ ] `src/components/__tests__/explainability-panel.test.tsx` — covers BUILD-06
- [ ] `src/components/__tests__/scan-dashboard.test.tsx` — covers SCAN-01
- [ ] `src/components/__tests__/audit-trail.test.tsx` — covers INTEG-02
- [ ] `src/components/__tests__/build-ui.test.tsx` — extends existing; covers ROLE-01/02/03
  - Note: `src/components/__tests__/` exists — check if `build-ui.test.tsx` exists before creating

---

## Sources

### Primary (HIGH confidence)

- Codebase direct inspection — `build-ui.tsx`, `generate-page/route.ts`, `compliance.ts`, `convex/auditLog.ts`, `agents/component-selector/schema.ts` — all Phase 4 patterns extend established patterns from these files
- Convex docs pattern — `useQuery` for real-time subscriptions is the documented standard approach for reactive queries in Convex
- Vercel AI SDK — `generateObject` already in use; same pattern extends to chat-edit agent

### Secondary (MEDIUM confidence)

- Figma REST API v1 — `GET /v1/files/{file_key}` endpoint is the standard documented API for reading file content; color fills are in `document.children[*].fills`
- Layout fix — diagnosed from `build-ui.tsx` grid structure + `build/page.tsx` wrapper inspection; the `min-h-screen` + header combination is a known Tailwind layout trap

### Tertiary (LOW confidence)

- SCAN URL fetch success rate — assumption that simple public pages are fetchable server-side; specific URL behavior not verified
- Figma share page rendering — assumption that share pages are client-rendered (common for React apps); not verified against current Figma share URL behavior

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all packages already installed, versions verified from package.json
- Architecture: HIGH — patterns are direct extensions of Phase 2/3 established patterns, inspected from source
- Pitfalls: HIGH — diagnosed from direct codebase inspection; layout bug confirmed from code
- Figma API: MEDIUM — endpoint is documented but file structure traversal requires verification during implementation

**Research date:** 2026-03-14
**Valid until:** 2026-03-15 (hackathon deadline — immediacy trumps staleness concern)
