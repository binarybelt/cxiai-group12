import { describe, expect, it } from "vitest";
import { computePageSpecDiff } from "@/lib/diff";
import type { PageSpec } from "@/types/page-spec";

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
        id: "section-footer",
        type: "footer",
        order: 2,
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
// Tests
// ---------------------------------------------------------------------------

describe("computePageSpecDiff", () => {
  it("returns 'No visible changes' when specs are identical", () => {
    const spec = makePageSpec();
    const diff = computePageSpecDiff(spec, spec);

    expect(diff.summary).toBe("No visible changes");
    expect(diff.addedSections).toHaveLength(0);
    expect(diff.removedSections).toHaveLength(0);
    expect(diff.modifiedComponents).toHaveLength(0);
  });

  it("detects an added section", () => {
    const oldSpec = makePageSpec();
    const newSpec = makePageSpec({
      sections: [
        ...oldSpec.sections,
        {
          id: "section-cta",
          type: "cta",
          order: 3,
          components: [
            { componentId: "CTABanner", props: { text: "Learn more" } },
          ],
        },
      ],
    });

    const diff = computePageSpecDiff(oldSpec, newSpec);

    expect(diff.addedSections).toContain("section-cta");
    expect(diff.removedSections).toHaveLength(0);
    expect(diff.summary).toContain("1 added");
  });

  it("detects a removed section", () => {
    const oldSpec = makePageSpec();
    const newSpec = makePageSpec({
      sections: [oldSpec.sections[0]!],
    });

    const diff = computePageSpecDiff(oldSpec, newSpec);

    expect(diff.removedSections).toContain("section-footer");
    expect(diff.addedSections).toHaveLength(0);
    expect(diff.summary).toContain("1 removed");
  });

  it("detects modified component props in a shared section", () => {
    const oldSpec = makePageSpec();
    const newSpec = makePageSpec({
      sections: [
        {
          id: "section-hero",
          type: "hero",
          order: 1,
          components: [
            {
              componentId: "Hero",
              props: { title: "Updated Title", subtitle: "New subtitle" },
            },
          ],
        },
        oldSpec.sections[1]!,
      ],
    });

    const diff = computePageSpecDiff(oldSpec, newSpec);

    expect(diff.modifiedComponents).toHaveLength(1);
    expect(diff.modifiedComponents[0]).toEqual({
      sectionId: "section-hero",
      componentId: "Hero",
      what: "props changed",
    });
    expect(diff.summary).toContain("1 modified");
  });

  it("detects multiple changes at once", () => {
    const oldSpec = makePageSpec();
    const newSpec = makePageSpec({
      sections: [
        {
          id: "section-hero",
          type: "hero",
          order: 1,
          components: [
            {
              componentId: "Hero",
              props: { title: "Changed", subtitle: "Also changed" },
            },
          ],
        },
        // section-footer removed
        // new section added
        {
          id: "section-cta",
          type: "cta",
          order: 2,
          components: [
            { componentId: "CTABanner", props: { text: "Click here" } },
          ],
        },
      ],
    });

    const diff = computePageSpecDiff(oldSpec, newSpec);

    expect(diff.addedSections).toContain("section-cta");
    expect(diff.removedSections).toContain("section-footer");
    expect(diff.modifiedComponents.length).toBeGreaterThanOrEqual(1);
    expect(diff.summary).toContain("added");
    expect(diff.summary).toContain("removed");
    expect(diff.summary).toContain("modified");
  });
});
