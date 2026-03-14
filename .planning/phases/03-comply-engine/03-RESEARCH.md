# Phase 3: COMPLY Engine - Research

**Researched:** 2026-03-14
**Domain:** Compliance rule engines, axe-core accessibility scanning, React real-time UI, Next.js middleware gating
**Confidence:** HIGH

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| COMPLY-01 | Real-time compliance score displayed in sidebar during build/edit | useMemo + useEffect pattern; compliance engine runs client-side against PageSpec |
| COMPLY-02 | Brand compliance check (all tokens from approved palette) | Pure TypeScript check against tokens.json; tokenId validation against loadTokens() |
| COMPLY-03 | Accessibility check via axe-core (WCAG AA) | axe-core 4.11.1 already installed; run against rendered DOM via ref or container div |
| COMPLY-04 | Pharma compliance check (disclaimers, adverse event links, market rules) | Rule engine reads compliance-rules.json + markets.json already loaded in lib/design-system |
| COMPLY-05 | Auto-fix button resolves issues using approved components | Patch function produces new PageSpec (immutable); trigger re-render |
| COMPLY-06 | Compliance gate blocks rendering until PageSpec passes | API route middleware function validateCompliance() called before streaming begins |
</phase_requirements>

---

## Summary

The COMPLY engine has three distinct layers: (1) a pure-TypeScript rule engine that checks PageSpec JSON against compliance-rules.json and markets.json without touching the DOM; (2) axe-core DOM scanning against the rendered preview element for WCAG AA accessibility violations; (3) a sidebar UI that composes and displays both result sets in real time, with an auto-fix function and a compliance gate that blocks generation.

The critical architectural insight is the split between server-side gating and client-side scoring. The compliance gate (COMPLY-06) must live in the `/api/generate-page` route -- it validates the PageSpec before streaming begins and returns a 422 if errors are present, so the pipeline genuinely stops. The real-time score (COMPLY-01) is separate: it runs client-side in the browser after rendering so axe-core has a live DOM to scan.

axe-core 4.11.1 is already installed in the project as a transitive dependency and works with jsdom in Vitest. For runtime DOM scanning in the browser, call `axe.run()` with a reference to the preview container element, using `runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa'] }` to scope to WCAG AA only. Color-contrast checks do not work in jsdom (a known limitation) but will work correctly in the live browser DOM.

**Primary recommendation:** Implement the rule engine as a pure function module (`src/lib/compliance.ts`) that accepts PageSpec + design system data and returns a typed `ComplianceResult`. Wire the gate in the API route. Wire the sidebar as a client component that calls the rule engine synchronously and axe-core asynchronously after render.

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| axe-core | 4.11.1 (already installed) | WCAG AA DOM accessibility scan | Industry standard, Deque-maintained, rules map directly to WCAG 2.x success criteria |
| zod | ^4.1.12 (already installed) | Schema validation for ComplianceResult type | Already the project's schema library; validate result shape at boundaries |
| React (useEffect, useRef, useMemo) | ^19.2.4 (already installed) | Real-time sidebar wiring | No additional libs needed for debounce or state |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| vitest-axe | latest | Vitest matchers wrapping axe-core for unit tests | Accessibility unit tests in Vitest; avoids jest-axe type conflicts |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| axe-core (direct) | @axe-core/react | @axe-core/react does NOT support React 18+. Never use it here -- React 19 project. Use axe-core directly. |
| axe-core DOM scan | HTML string parsing | axe-core requires a live DOM. renderToStaticMarkup + jsdom injection would work in tests but not in the browser runtime sidebar. Keep the two contexts separate. |
| custom debounce hook | use-debounce npm | No extra dependency needed. A single useEffect with setTimeout + clearTimeout is 6 lines and zero dependency cost. |

**Installation:**
```bash
npm install --save-dev vitest-axe
# axe-core is already installed (4.11.1 confirmed)
```

---

## Architecture Patterns

### Recommended Project Structure

```
src/
├── lib/
│   └── compliance.ts          # Pure rule engine: runBrandChecks, runPharmaChecks, runGate
├── types/
│   └── compliance.ts          # ComplianceResult, ComplianceViolation, ComplianceScore types
├── components/
│   └── compliance-sidebar.tsx # "use client" — real-time score + auto-fix UI
├── app/
│   └── api/
│       └── generate-page/
│           └── route.ts       # Add validateCompliance() call before streamObject (gate)
└── lib/
    └── axe-scanner.ts         # Browser-only: wraps axe.run() with WCAG AA config
```

### Pattern 1: Pure Rule Engine (Brand + Pharma)

**What:** A function that accepts a PageSpec and returns structured violations. No side effects, no DOM dependency -- testable with plain unit tests.

**When to use:** Server-side gate, client-side real-time check, Vitest unit tests.

**Example:**
```typescript
// src/lib/compliance.ts
// Source: compliance-rules.json structure + types/design-system.ts ComplianceRule

import { loadComponents, loadTokens, loadComplianceRules, getMarketConfig } from "@/lib/design-system";
import type { PageSpec } from "@/types/page-spec";
import type { ComplianceViolation } from "@/types/compliance";

export function runBrandChecks(spec: PageSpec): ComplianceViolation[] {
  const approvedComponentIds = new Set(loadComponents().map(c => c.id));
  const approvedTokenIds = new Set(loadTokens().map(t => t.id));
  const violations: ComplianceViolation[] = [];

  for (const section of spec.sections) {
    for (const ref of section.components) {
      // brand-component-only rule
      if (!approvedComponentIds.has(ref.componentId)) {
        violations.push({
          ruleId: "brand-component-only",
          category: "brand",
          severity: "error",
          message: `Component "${ref.componentId}" is not in the approved design system`,
          autoFixable: false,
          location: { sectionId: section.id, componentId: ref.componentId },
        });
      }
      // brand-approved-colors — check tokenOverrides
      for (const override of ref.tokenOverrides ?? []) {
        if (!approvedTokenIds.has(override.tokenId)) {
          violations.push({
            ruleId: "brand-approved-colors",
            category: "brand",
            severity: "error",
            message: `Token "${override.tokenId}" is not in the approved palette`,
            autoFixable: true,
            location: { sectionId: section.id, componentId: ref.componentId },
          });
        }
      }
    }
  }

  return violations;
}

export function runPharmaChecks(spec: PageSpec): ComplianceViolation[] {
  const violations: ComplianceViolation[] = [];
  const market = getMarketConfig(spec.market);
  const allComponentIds = spec.sections.flatMap(s => s.components.map(c => c.componentId));
  const allSectionTypes = new Set(spec.sections.map(s => s.type));

  // pharma-isi-required-hcp
  if (spec.market.includes("hcp") && !allComponentIds.includes("ISIBlock")) {
    violations.push({
      ruleId: "pharma-isi-required-hcp",
      category: "pharma",
      severity: "error",
      message: "HCP pages require an ISI block",
      autoFixable: false,
      location: { sectionId: "page-level" },
    });
  }

  // pharma-adverse-event-link — check Footer adverseEventUrl
  const footers = spec.sections.flatMap(s =>
    s.components.filter(c => c.componentId === "Footer")
  );
  for (const footer of footers) {
    const url = footer.props["adverseEventUrl"];
    if (!url || url === "" || url === "#") {
      violations.push({
        ruleId: "pharma-adverse-event-link",
        category: "pharma",
        severity: "error",
        message: "Footer adverseEventUrl must be non-empty",
        autoFixable: false,
        location: { sectionId: "footer" },
      });
    }
  }

  // pharma-disclaimer-promotional — require Disclaimer on campaign/product-detail
  const requiresDisclaimer = ["disclaimer", "isi"];
  const hasDisclaimer = allSectionTypes.has("disclaimer") || allComponentIds.includes("Disclaimer");
  if (!hasDisclaimer && footers.length > 0) {
    violations.push({
      ruleId: "pharma-disclaimer-promotional",
      category: "pharma",
      severity: "error",
      message: "Promotional content requires a Disclaimer component",
      autoFixable: false,
      location: { sectionId: "page-level" },
    });
  }

  // Market-specific required components
  for (const required of market?.requiredComponents ?? []) {
    if (!allComponentIds.includes(required)) {
      violations.push({
        ruleId: `pharma-market-${spec.market}`,
        category: "pharma",
        severity: "warning",
        message: `Market ${spec.market} requires component: ${required}`,
        autoFixable: false,
        location: { sectionId: "page-level" },
      });
    }
  }

  return violations;
}

export function runComplianceGate(spec: PageSpec): { passed: boolean; violations: ComplianceViolation[] } {
  const violations = [...runBrandChecks(spec), ...runPharmaChecks(spec)];
  const errors = violations.filter(v => v.severity === "error");
  return { passed: errors.length === 0, violations };
}
```

### Pattern 2: axe-core DOM Scanner (Browser Client-Side)

**What:** Runs axe.run() against the live preview container after React has rendered the page spec.

**When to use:** Only in the browser (client component). Never on the server. The preview `<div>` ref is passed in.

**Example:**
```typescript
// src/lib/axe-scanner.ts
// Source: axe-core 4.11.1 API — axe.run() with runOnly tag filter

import type { AxeResults, Result } from "axe-core";

export interface A11yViolation {
  id: string;
  impact: string;
  description: string;
  help: string;
  helpUrl: string;
  nodes: { html: string; failureSummary: string }[];
}

export async function scanForA11yViolations(container: HTMLElement): Promise<A11yViolation[]> {
  // Dynamic import — axe-core is browser-only
  const axe = (await import("axe-core")).default;

  const results: AxeResults = await axe.run(container, {
    runOnly: {
      type: "tag",
      values: ["wcag2a", "wcag2aa"],
    },
  });

  return results.violations.map((v: Result) => ({
    id: v.id,
    impact: v.impact ?? "unknown",
    description: v.description,
    help: v.help,
    helpUrl: v.helpUrl,
    nodes: v.nodes.map(n => ({
      html: n.html,
      failureSummary: n.failureSummary ?? "",
    })),
  }));
}
```

### Pattern 3: Compliance Gate in API Route (COMPLY-06)

**What:** Validates the PageSpec JSON before streaming begins. Returns 422 with violation details if errors found. This is pure-TS rule engine only (no DOM, no axe).

**When to use:** In `/api/generate-page/route.ts` before the `streamObject` call.

**Example:**
```typescript
// Inside POST handler in /api/generate-page/route.ts (addition)
// Source: existing route pattern

import { runComplianceGate } from "@/lib/compliance";

// After parsing interpretation, before streamObject:
// Note: This gates the spec the LLM will generate FROM, not the output.
// For output gating, validate in onFinish and return error feedback.
// For the hackathon demo, add a gate check on incoming interpretation:
const gateResult = runComplianceGate(partialSpec);  // on final generated spec
if (!gateResult.passed) {
  return Response.json(
    {
      error: "Compliance gate blocked rendering",
      violations: gateResult.violations,
    },
    { status: 422 },
  );
}
```

**IMPORTANT NOTE on gating approach:** The compliance gate must operate on the *completed* PageSpec, not the streaming object. The correct place is the `onFinish` callback. However, since `onFinish` fires after streaming is already done, for a true hard gate the architecture should be:

1. Generate the PageSpec (streaming is fine here -- it's the composition step)
2. Validate the completed PageSpec with `runComplianceGate()`
3. If it fails: surface violations; do NOT render the page
4. The client-side `BuildUI` receives a 422 and shows the compliance error instead of rendering

This means the gate is enforced at the **render decision**, not at stream start. The `BuildUI` component checks the response status before passing the spec to `PageRenderer`.

### Pattern 4: Compliance Sidebar (Real-Time, Client Component)

**What:** A sidebar panel that runs brand/pharma checks synchronously and axe checks asynchronously, debounced after the spec stabilizes.

**When to use:** Mounted alongside `PageRenderer` in `BuildUI`.

**Example:**
```typescript
// src/components/compliance-sidebar.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import type { PageSpec } from "@/types/page-spec";
import { runBrandChecks, runPharmaChecks } from "@/lib/compliance";
import type { A11yViolation } from "@/lib/axe-scanner";
import type { ComplianceViolation } from "@/types/compliance";

interface ComplianceSidebarProps {
  spec: PageSpec | null;
  previewRef: React.RefObject<HTMLDivElement>;
}

export function ComplianceSidebar({ spec, previewRef }: ComplianceSidebarProps) {
  const [brandViolations, setBrandViolations] = useState<ComplianceViolation[]>([]);
  const [pharmaViolations, setPharmaViolations] = useState<ComplianceViolation[]>([]);
  const [a11yViolations, setA11yViolations] = useState<A11yViolation[]>([]);

  // Synchronous: brand + pharma checks on every spec change
  useEffect(() => {
    if (!spec) return;
    setBrandViolations(runBrandChecks(spec));
    setPharmaViolations(runPharmaChecks(spec));
  }, [spec]);

  // Async: axe scan with 600ms debounce to let DOM settle
  useEffect(() => {
    if (!spec || !previewRef.current) return;
    const timer = setTimeout(async () => {
      if (!previewRef.current) return;
      const { scanForA11yViolations } = await import("@/lib/axe-scanner");
      const violations = await scanForA11yViolations(previewRef.current);
      setA11yViolations(violations);
    }, 600);
    return () => clearTimeout(timer);
  }, [spec, previewRef]);

  const score = computeScore(brandViolations, pharmaViolations, a11yViolations);
  // ... render score + violation lists
}
```

### Pattern 5: ComplianceResult Types

**What:** Typed return values for the rule engine. Defined in `src/types/compliance.ts`.

```typescript
// src/types/compliance.ts

import type { ComplianceCategory, ComplianceSeverity } from "./design-system";

export interface ViolationLocation {
  sectionId: string;
  componentId?: string;
}

export interface ComplianceViolation {
  ruleId: string;
  category: ComplianceCategory;  // "brand" | "accessibility" | "pharma"
  severity: ComplianceSeverity;  // "error" | "warning" | "info"
  message: string;
  autoFixable: boolean;
  location: ViolationLocation;
}

export interface ComplianceScore {
  overall: number;      // 0-100
  brand: number;        // 0-100
  accessibility: number; // 0-100
  pharma: number;       // 0-100
}

export interface ComplianceResult {
  score: ComplianceScore;
  violations: ComplianceViolation[];
  passed: boolean;      // true if no "error" severity violations
}
```

### Pattern 6: Score Calculation

Scoring approach: start at 100, deduct points per violation by severity. Errors deduct more than warnings. Separate subscores per category.

```typescript
function computeScore(
  brand: ComplianceViolation[],
  pharma: ComplianceViolation[],
  a11y: A11yViolation[],
): ComplianceScore {
  const penalize = (violations: ComplianceViolation[]) => {
    let score = 100;
    for (const v of violations) {
      score -= v.severity === "error" ? 25 : 10;
    }
    return Math.max(0, score);
  };

  const a11yScore = Math.max(0, 100 - a11y.length * 20);

  return {
    brand: penalize(brand),
    accessibility: a11yScore,
    pharma: penalize(pharma),
    overall: Math.round((penalize(brand) + a11yScore + penalize(pharma)) / 3),
  };
}
```

### Pattern 7: Auto-Fix (COMPLY-05)

**What:** For `autoFixable: true` violations, produce a new PageSpec that resolves the issue. Always returns a new object (immutable update).

**When to use:** Called from the sidebar's "Auto-Fix" button. Produces a new PageSpec passed back up to `BuildUI` state.

```typescript
// In src/lib/compliance.ts

export function applyAutoFix(spec: PageSpec, violation: ComplianceViolation): PageSpec {
  if (violation.ruleId === "brand-approved-colors") {
    // Replace unapproved tokenIds with empty overrides (removes bad override)
    const approvedTokenIds = new Set(loadTokens().map(t => t.id));
    return {
      ...spec,
      sections: spec.sections.map(section => ({
        ...section,
        components: section.components.map(ref => ({
          ...ref,
          tokenOverrides: (ref.tokenOverrides ?? []).filter(
            o => approvedTokenIds.has(o.tokenId)
          ),
        })),
      })),
    };
  }
  // Return unchanged spec for non-auto-fixable violations
  return spec;
}
```

### Anti-Patterns to Avoid

- **Running axe-core on the server:** axe requires a real browser DOM. Dynamic import it only in client components; never import it in API routes or server-side lib files.
- **Mutating PageSpec in auto-fix:** Always use `{ ...spec, sections: [...] }` spread patterns. Never mutate in place (project coding style; also enables React state diffing).
- **Calling axe on every keystroke:** Debounce at minimum 500ms. axe.run() takes 50-200ms per scan. Running it continuously will freeze the sidebar.
- **Gating in Next.js middleware.ts:** The built-in Next.js middleware.ts operates on requests before they hit route handlers but cannot access PageSpec content (it would require reading request bodies, which is fragile). Gate in the route handler instead.
- **Gating during streaming:** Streaming cannot be cancelled mid-flight cleanly. Gate on the *completed* spec; block the render decision client-side if 422 is returned.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| WCAG accessibility checks | Custom alt-text / contrast checkers | axe-core `run()` | 100+ rules, actively maintained, covers WCAG 2.2, handles aria, focus order, color contrast in real DOM |
| Rule severity/category metadata | Custom rule registry object | compliance-rules.json (already exists) | Already defines id, category, severity, autoFixable per rule -- use it as the source of truth |
| Token validation | Custom set comparison | loadTokens() from lib/design-system.ts | Already returns all approved tokens; use `new Set(loadTokens().map(t => t.id))` |

**Key insight:** The compliance-rules.json already defines the complete rule catalog with autoFixable flags. The rule engine doesn't need to define rules -- it reads them and maps ruleId to check logic.

---

## Common Pitfalls

### Pitfall 1: axe-core Color Contrast Does Not Work in jsdom

**What goes wrong:** `axe.run()` in a Vitest jsdom environment reports no color-contrast violations even when real contrast failures exist. The test passes but misses real issues.

**Why it happens:** jsdom does not implement CSS computed styles (getComputedStyle is mostly stubbed). axe-core's color-contrast rule requires actual style computation.

**How to avoid:** In Vitest tests, disable the color-contrast rule explicitly:
```typescript
await axe.run(container, {
  rules: { "color-contrast": { enabled: false } },
  runOnly: { type: "tag", values: ["wcag2a", "wcag2aa"] },
});
```
The color-contrast rule will run correctly in the actual browser sidebar where CSS is computed.

**Warning signs:** All color-contrast tests pass with no violations in jsdom.

### Pitfall 2: axe.run() Called Before DOM Is Settled

**What goes wrong:** axe returns fewer violations than exist because it scanned a partially-rendered React component.

**Why it happens:** React renders asynchronously in streaming scenarios. If axe runs immediately on spec change, the DOM may still reflect the old spec.

**How to avoid:** Debounce the axe call to 600ms after spec changes. Also use `await` on axe.run() (it returns a Promise).

**Warning signs:** Violation counts fluctuate on the same spec.

### Pitfall 3: @axe-core/react Is Not Compatible with React 19

**What goes wrong:** Import `@axe-core/react` and the app crashes with React 19 compatibility errors.

**Why it happens:** @axe-core/react explicitly does not support React 18+. The project uses React 19.

**How to avoid:** Use `axe-core` directly with dynamic import. Never install `@axe-core/react` in this project.

**Warning signs:** `npm install @axe-core/react` installs but the module fails at runtime.

### Pitfall 4: Blocking StreamObject Initialization

**What goes wrong:** Attempting to gate before streamObject starts means the stream never begins, but the UI hangs waiting.

**Why it happens:** If validation is expensive or slow, calling it synchronously before `streamObject` will delay the response start time.

**How to avoid:** Validation in the gate is synchronous and fast (it's pure JSON traversal). Keep it under 5ms by avoiding async operations. The gate runs in the `onFinish` callback to validate the completed output, or can run synchronously on the interpretation input (not the stream output).

**Warning signs:** The browser shows a pending request with no response for several seconds.

### Pitfall 5: ComplianceViolation Location Is Insufficient for Auto-Fix

**What goes wrong:** The auto-fix function cannot find the component to fix because the location only records `sectionId`.

**Why it happens:** Multiple components of the same type can appear in one section.

**How to avoid:** Record both `sectionId` and `componentId` in the violation location. For precise targeting, also record the array index or a unique key.

---

## Code Examples

### axe-core Run with WCAG AA Only (Browser)
```typescript
// Source: axe-core 4.11.1 API (https://www.deque.com/axe/core-documentation/api-documentation/)
import axe from "axe-core";

const results = await axe.run(containerElement, {
  runOnly: {
    type: "tag",
    values: ["wcag2a", "wcag2aa"],
  },
});

// results.violations is an array of:
// { id, impact, description, help, helpUrl, tags, nodes[] }
// Each node: { html, failureSummary, target, any[], all[], none[] }
```

### axe-core in Vitest (jsdom environment)
```typescript
// Source: vitest-axe usage pattern (https://github.com/chaance/vitest-axe)
import { render } from "@testing-library/react";
import axe from "axe-core";

it("has no WCAG AA violations", async () => {
  const { container } = render(<ISIBlock content="Safety info" />);
  const results = await axe.run(container, {
    rules: { "color-contrast": { enabled: false } }, // jsdom limitation
    runOnly: { type: "tag", values: ["wcag2a", "wcag2aa"] },
  });
  expect(results.violations).toHaveLength(0);
});
```

### Immutable PageSpec Update (auto-fix pattern)
```typescript
// Source: project coding-style.md (immutability requirement)
// Always return a new object — never mutate spec in place

const fixedSpec: PageSpec = {
  ...spec,
  sections: spec.sections.map(section => ({
    ...section,
    components: section.components.map(ref =>
      ref.componentId === targetId
        ? { ...ref, tokenOverrides: cleanedOverrides }
        : ref
    ),
  })),
};
```

### Real-Time Compliance Wiring in BuildUI
```typescript
// Pattern: pass previewRef from BuildUI down to both PageRenderer wrapper and ComplianceSidebar
const previewRef = useRef<HTMLDivElement>(null);

// In JSX:
<div ref={previewRef}>
  <PageRenderer spec={variants[selectedVariant]} />
</div>
<ComplianceSidebar
  spec={variants[selectedVariant] ?? null}
  previewRef={previewRef}
/>
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| react-axe (dev overlay) | axe-core direct + dynamic import | 2022 (react-axe deprecated) | No React 18+ support in old package; direct API is more flexible |
| @axe-core/react | axe-core direct | Ongoing | @axe-core/react still does not support React 18+; use direct API |
| Compliance as post-build report | Compliance as middleware gate | This project design | Gate blocks render; violations are actionable not informational |

**Deprecated/outdated:**
- `react-axe`: Fully deprecated. Replaced by `@axe-core/react` which itself does not support React 18/19.
- `@axe-core/react`: Does not support React 18+. Do not use in this project.

---

## Open Questions

1. **Auto-fix depth: can all COMPLY-05 cases be handled with pure PageSpec mutation?**
   - What we know: brand-approved-colors (remove bad token overrides) and brand-approved-typography are fixable by patching tokenOverrides. Pharma violations (missing ISI, missing Disclaimer) require *inserting* a new section/component.
   - What's unclear: Inserting a section requires knowing where in the order to place it. The auto-fix for pharma issues may need to append a new section at the end.
   - Recommendation: Support both "replace tokenOverride" and "append section" auto-fix modes. Mark pharma violations as `autoFixable: true` only if the fix is unambiguous (appending ISIBlock to a new "isi" section).

2. **Gate on interpretation input vs. generated output?**
   - What we know: The interpretation step (interpret-brief) produces market, pageType, mustIncludeComponents. The gate should ultimately check the final PageSpec.
   - What's unclear: Can we gate at interpretation time to fail fast before the expensive generation step?
   - Recommendation: Add a lightweight pre-check at interpretation time (does the market require components the generation is unlikely to include?). Full gate on the completed generated spec in onFinish.

3. **axe-core color-contrast accuracy in browser vs. jsdom**
   - What we know: Color-contrast works in real browsers, not jsdom. The sidebar scan will catch real contrast issues.
   - What's unclear: Tailwind CSS custom properties (CSS variables) used by the components -- will axe resolve them at runtime?
   - Recommendation: Test the sidebar scan manually in the browser on Phase 3 completion. If CSS variables are unresolved, consider inline-style fallbacks for the preview sandbox.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.0 |
| Config file | `/Users/ved/design-delivery-accelerator/vitest.config.ts` |
| Quick run command | `npm test` (vitest run) |
| Full suite command | `npm run test:coverage` |

### Phase Requirements to Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| COMPLY-01 | Score updates when spec changes | unit | `npm test -- --testPathPattern=compliance-sidebar` | ❌ Wave 0 |
| COMPLY-02 | Brand check catches unapproved token IDs | unit | `npm test -- --testPathPattern=compliance` | ❌ Wave 0 |
| COMPLY-02 | Brand check catches unapproved component IDs | unit | `npm test -- --testPathPattern=compliance` | ❌ Wave 0 |
| COMPLY-03 | axe violations returned for missing alt text | unit | `npm test -- --testPathPattern=axe-scanner` | ❌ Wave 0 |
| COMPLY-04 | Pharma check catches missing ISIBlock on HCP page | unit | `npm test -- --testPathPattern=compliance` | ❌ Wave 0 |
| COMPLY-04 | Pharma check catches missing adverseEventUrl | unit | `npm test -- --testPathPattern=compliance` | ❌ Wave 0 |
| COMPLY-05 | Auto-fix removes unapproved tokenOverride (returns new spec) | unit | `npm test -- --testPathPattern=compliance` | ❌ Wave 0 |
| COMPLY-06 | Gate returns passed:false when errors exist | unit | `npm test -- --testPathPattern=compliance` | ❌ Wave 0 |

### Sampling Rate
- **Per task commit:** `npm test`
- **Per wave merge:** `npm run test:coverage`
- **Phase gate:** Full suite green (100% statement/line/function coverage per vitest.config.ts thresholds)

### Wave 0 Gaps

- [ ] `src/types/compliance.ts` -- ComplianceViolation, ComplianceResult, ComplianceScore types
- [ ] `src/lib/__tests__/compliance.test.ts` -- unit tests for runBrandChecks, runPharmaChecks, runComplianceGate, applyAutoFix
- [ ] `src/lib/__tests__/axe-scanner.test.ts` -- axe scan with jsdom; disable color-contrast rule; confirm violations[] returned correctly
- [ ] `src/lib/compliance.ts` -- rule engine implementation
- [ ] `src/lib/axe-scanner.ts` -- browser axe wrapper
- [ ] `src/components/__tests__/compliance-sidebar.test.tsx` -- renders score, lists violations, auto-fix button calls callback
- [ ] vitest-axe install: `npm install --save-dev vitest-axe`

---

## Sources

### Primary (HIGH confidence)

- axe-core 4.11.1 npm package -- verified installed in `/Users/ved/design-delivery-accelerator/node_modules/axe-core/package.json`
- Deque axe-core API documentation (https://www.deque.com/axe/core-documentation/api-documentation/) -- run() API, violation object structure, runOnly tag syntax
- axe-core GitHub raw API.md (https://raw.githubusercontent.com/dequelabs/axe-core/develop/doc/API.md) -- violation fields: id, description, help, helpUrl, impact, tags, nodes
- Project codebase: `src/types/design-system.ts` -- ComplianceCategory, ComplianceSeverity, ComplianceRule types already defined
- Project codebase: `src/design-system/compliance-rules.json` -- 17 rules with id, category, severity, autoFixable
- Project codebase: `src/design-system/markets.json` -- US/UK/EU requiredComponents and requiredDisclosures
- Project codebase: `src/lib/design-system.ts` -- loadTokens(), loadComponents(), loadComplianceRules(), getMarketConfig()
- Project codebase: `vitest.config.ts` -- jsdom environment, 100% line/statement/function coverage thresholds

### Secondary (MEDIUM confidence)

- @axe-core/react npm page (https://www.npmjs.com/package/@axe-core/react) -- confirms React 18+ not supported; verified against dequelabs/axe-core-npm GitHub issue #500
- vitest-axe GitHub (https://github.com/chaance/vitest-axe) -- Vitest-compatible axe matchers; forked from jest-axe
- Deque blog (https://www.deque.com/blog/building-accessible-apps-with-next-js-and-axe-devtools/) -- Next.js + axe integration patterns

### Tertiary (LOW confidence)

- Community articles on debounce with useEffect (no single authoritative source; pattern is standard React idiom)

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- axe-core version verified by npm module inspection; @axe-core/react incompatibility verified against official issue tracker
- Architecture: HIGH -- all types and utility functions build directly on existing project types (ComplianceCategory, ComplianceSeverity in design-system.ts); all design system loaders already exist
- Pitfalls: HIGH -- jsdom/color-contrast limitation is documented by Deque; React 19 incompatibility verified
- Auto-fix patterns: MEDIUM -- immutable update pattern is clear; pharma auto-fix (inserting sections) needs planner to specify exact section order logic

**Research date:** 2026-03-14
**Valid until:** 2026-03-21 (stable ecosystem; axe-core API is stable across minor versions)
