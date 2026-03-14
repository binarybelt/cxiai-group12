import { describe, expect, it } from "vitest";
import {
  loadComponents,
  loadTokens,
} from "@/lib/design-system";
import type { PageSpec } from "@/types/page-spec";
import {
  applyAutoFix,
  computeScore,
  runBrandChecks,
  runComplianceGate,
  runPharmaChecks,
} from "@/lib/compliance";

// ---------------------------------------------------------------------------
// Test fixture helpers
// ---------------------------------------------------------------------------

function makePageSpec(overrides: Partial<PageSpec> = {}): PageSpec {
  const base: PageSpec = {
    id: "test-page-001",
    title: "Test Page",
    market: "US",
    product: "TestDrug",
    sections: [
      {
        id: "section-hero",
        type: "hero",
        order: 1,
        components: [
          {
            componentId: "Hero",
            props: { title: "Welcome", subtitle: "Safe and effective" },
          },
        ],
      },
      {
        id: "section-disclaimer",
        type: "disclaimer",
        order: 2,
        components: [
          {
            componentId: "Disclaimer",
            props: { text: "Important safety information.", type: "pharma" },
          },
        ],
      },
      {
        id: "section-footer",
        type: "footer",
        order: 3,
        components: [
          {
            componentId: "Footer",
            props: {
              links: [],
              disclaimers: [],
              copyright: "2026 Pfizer Inc.",
              adverseEventUrl: "https://www.pfizer.com/adverse-events",
            },
          },
        ],
      },
    ],
    metadata: {
      generatedBy: "test",
      generatedAt: "2026-03-14T00:00:00Z",
      market: "US",
      product: "TestDrug",
    },
  };

  return { ...base, ...overrides };
}

// ---------------------------------------------------------------------------
// runBrandChecks
// ---------------------------------------------------------------------------

describe("runBrandChecks", () => {
  it("returns a violation when a componentId is not in the approved set", () => {
    const spec = makePageSpec({
      sections: [
        {
          id: "section-1",
          type: "hero",
          order: 1,
          components: [
            { componentId: "FakeComponent", props: {} },
          ],
        },
      ],
    });

    const violations = runBrandChecks(spec);

    expect(violations.length).toBeGreaterThanOrEqual(1);
    expect(
      violations.some((v) => v.ruleId === "brand-component-only"),
    ).toBe(true);
    expect(violations[0]?.severity).toBe("error");
    expect(violations[0]?.autoFixable).toBe(false);
  });

  it("returns a violation when a tokenId in tokenOverrides is not in the approved set", () => {
    const spec = makePageSpec({
      sections: [
        {
          id: "section-1",
          type: "hero",
          order: 1,
          components: [
            {
              componentId: "Hero",
              props: { title: "Test", subtitle: "Test" },
              tokenOverrides: [{ tokenId: "fake-token-id", value: "#ff0000" }],
            },
          ],
        },
      ],
    });

    const violations = runBrandChecks(spec);

    expect(violations.length).toBeGreaterThanOrEqual(1);
    expect(
      violations.some((v) => v.ruleId === "brand-approved-colors"),
    ).toBe(true);
    expect(
      violations.find((v) => v.ruleId === "brand-approved-colors")?.autoFixable,
    ).toBe(true);
  });

  it("returns empty array for a fully approved PageSpec", () => {
    const components = loadComponents();
    const tokens = loadTokens();

    const validComponentId = components[0]!.id;
    const validTokenId = tokens[0]!.id;

    const spec = makePageSpec({
      sections: [
        {
          id: "section-1",
          type: "hero",
          order: 1,
          components: [
            {
              componentId: validComponentId,
              props: {},
              tokenOverrides: [{ tokenId: validTokenId, value: "#1234ab" }],
            },
          ],
        },
      ],
    });

    const violations = runBrandChecks(spec);

    expect(violations).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// runPharmaChecks
// ---------------------------------------------------------------------------

describe("runPharmaChecks", () => {
  it("returns a violation for HCP market page missing ISIBlock", () => {
    const spec = makePageSpec({
      market: "US-HCP",
      sections: [
        {
          id: "section-1",
          type: "hero",
          order: 1,
          components: [{ componentId: "Hero", props: { title: "T", subtitle: "S" } }],
        },
      ],
    });

    const violations = runPharmaChecks(spec);

    expect(
      violations.some((v) => v.ruleId === "pharma-isi-required-hcp"),
    ).toBe(true);
    expect(
      violations.find((v) => v.ruleId === "pharma-isi-required-hcp")?.severity,
    ).toBe("error");
  });

  it("returns a violation for Footer with empty adverseEventUrl", () => {
    const spec = makePageSpec({
      sections: [
        {
          id: "section-footer",
          type: "footer",
          order: 1,
          components: [
            {
              componentId: "Footer",
              props: {
                links: [],
                disclaimers: [],
                copyright: "2026",
                adverseEventUrl: "",
              },
            },
          ],
        },
      ],
    });

    const violations = runPharmaChecks(spec);

    expect(
      violations.some((v) => v.ruleId === "pharma-adverse-event-link"),
    ).toBe(true);
    expect(
      violations.find((v) => v.ruleId === "pharma-adverse-event-link")?.severity,
    ).toBe("error");
  });

  it("returns a violation for page missing Disclaimer component", () => {
    const spec = makePageSpec({
      sections: [
        {
          id: "section-1",
          type: "hero",
          order: 1,
          components: [{ componentId: "Hero", props: { title: "T", subtitle: "S" } }],
        },
        {
          id: "section-footer",
          type: "footer",
          order: 2,
          components: [
            {
              componentId: "Footer",
              props: {
                links: [],
                disclaimers: [],
                copyright: "2026",
                adverseEventUrl: "https://example.com",
              },
            },
          ],
        },
      ],
    });

    const violations = runPharmaChecks(spec);

    expect(
      violations.some((v) => v.ruleId === "pharma-disclaimer-promotional"),
    ).toBe(true);
    expect(
      violations.find((v) => v.ruleId === "pharma-disclaimer-promotional")?.severity,
    ).toBe("error");
  });

  it("returns a violation for missing market-required component", () => {
    // US market requires Disclaimer, ISIBlock, Footer — spec has none
    const spec = makePageSpec({
      market: "US",
      sections: [
        {
          id: "section-1",
          type: "hero",
          order: 1,
          components: [{ componentId: "Hero", props: { title: "T", subtitle: "S" } }],
        },
      ],
    });

    const violations = runPharmaChecks(spec);

    // At least one market-required-component violation should appear
    expect(
      violations.some((v) => v.ruleId === "pharma-market-required-component"),
    ).toBe(true);
    expect(
      violations.find((v) => v.ruleId === "pharma-market-required-component")?.severity,
    ).toBe("warning");
  });
});

// ---------------------------------------------------------------------------
// runComplianceGate
// ---------------------------------------------------------------------------

describe("runComplianceGate", () => {
  it("returns passed:false when error-severity violations exist", () => {
    const spec = makePageSpec({
      sections: [
        {
          id: "section-1",
          type: "hero",
          order: 1,
          components: [{ componentId: "FakeComponent", props: {} }],
        },
      ],
    });

    const result = runComplianceGate(spec);

    expect(result.passed).toBe(false);
    expect(result.violations.some((v) => v.severity === "error")).toBe(true);
  });

  it("returns passed:true when only warnings exist", () => {
    // Use a market with required components but provide minimal spec without those
    // US market requires ISIBlock as a "warning" through market required components
    // Provide Disclaimer to avoid that error, use HCP market but not HCP name
    const spec: PageSpec = {
      id: "warn-only-page",
      title: "Warning Only Page",
      market: "UNKNOWN_MARKET", // no market config = no requiredComponents warnings
      product: "TestDrug",
      sections: [
        {
          id: "section-hero",
          type: "hero",
          order: 1,
          components: [
            { componentId: "Hero", props: { title: "T", subtitle: "S" } },
          ],
        },
        {
          id: "section-disclaimer",
          type: "disclaimer",
          order: 2,
          components: [
            {
              componentId: "Disclaimer",
              props: { text: "Disclaimer text", type: "pharma" },
            },
          ],
        },
        {
          id: "section-footer",
          type: "footer",
          order: 3,
          components: [
            {
              componentId: "Footer",
              props: {
                links: [],
                disclaimers: [],
                copyright: "2026",
                adverseEventUrl: "https://example.com",
              },
            },
          ],
        },
      ],
      metadata: {
        generatedBy: "test",
        generatedAt: "2026-03-14T00:00:00Z",
        market: "UNKNOWN_MARKET",
        product: "TestDrug",
      },
    };

    const result = runComplianceGate(spec);

    expect(result.passed).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// applyAutoFix
// ---------------------------------------------------------------------------

describe("applyAutoFix", () => {
  it("removes unapproved tokenOverrides and returns a NEW object (not same reference)", () => {
    const tokens = loadTokens();
    const validTokenId = tokens[0]!.id;

    const spec = makePageSpec({
      sections: [
        {
          id: "section-1",
          type: "hero",
          order: 1,
          components: [
            {
              componentId: "Hero",
              props: { title: "T", subtitle: "S" },
              tokenOverrides: [
                { tokenId: validTokenId, value: "#aabbcc" },
                { tokenId: "fake-token-id", value: "#ff0000" },
              ],
            },
          ],
        },
      ],
    });

    const violation = runBrandChecks(spec).find(
      (v) => v.ruleId === "brand-approved-colors",
    )!;

    const fixed = applyAutoFix(spec, violation);

    // Must be a different reference (immutable)
    expect(fixed).not.toBe(spec);

    // The unapproved token should be removed
    const fixedOverrides =
      fixed.sections[0]?.components[0]?.tokenOverrides ?? [];
    expect(fixedOverrides.some((o) => o.tokenId === "fake-token-id")).toBe(
      false,
    );
    // The valid token should remain
    expect(fixedOverrides.some((o) => o.tokenId === validTokenId)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// computeScore
// ---------------------------------------------------------------------------

describe("computeScore", () => {
  it("returns 100/100/100 for zero violations", () => {
    const score = computeScore([], [], []);

    expect(score.brand).toBe(100);
    expect(score.pharma).toBe(100);
    expect(score.accessibility).toBe(100);
    expect(score.overall).toBe(100);
  });

  it("deducts 25 per error violation", () => {
    const errorViolation = {
      ruleId: "brand-component-only",
      category: "brand" as const,
      severity: "error" as const,
      message: "Unapproved component",
      autoFixable: false,
      location: { sectionId: "s1" },
    };

    const score = computeScore([errorViolation, errorViolation], [], []);

    // 100 - (2 * 25) = 50
    expect(score.brand).toBe(50);
  });

  it("deducts 10 per warning violation", () => {
    const warningViolation = {
      ruleId: "pharma-market-required-component",
      category: "pharma" as const,
      severity: "warning" as const,
      message: "Missing required component",
      autoFixable: false,
      location: { sectionId: "s1" },
    };

    const score = computeScore([], [warningViolation, warningViolation], []);

    // 100 - (2 * 10) = 80
    expect(score.pharma).toBe(80);
  });
});
