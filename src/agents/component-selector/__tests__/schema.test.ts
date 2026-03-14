import { describe, it, expect, vi, beforeEach } from "vitest";
import { buildConstrainedPageSpecSchema } from "../schema";

// Valid minimal PageSpec variant for use in tests
const makeVariant = (componentId: string, tokenId: string) => ({
  id: "page-001",
  title: "Test Page",
  market: "us-hcp",
  product: "Cardiovex",
  sections: [
    {
      id: "section-001",
      type: "hero" as const,
      order: 1,
      components: [
        {
          componentId,
          selectionReason: "Required primary narrative component",
          props: { title: "Hello", subtitle: "World" },
          tokenOverrides: tokenId
            ? [{ tokenId, value: "#FFFFFF" }]
            : undefined,
        },
      ],
    },
  ],
  metadata: {
    generatedBy: "test",
    generatedAt: "2025-01-01T00:00:00Z",
    market: "us-hcp",
    product: "Cardiovex",
  },
});

const makeOutput = (componentId: string, tokenId: string) => ({
  variants: [
    makeVariant(componentId, tokenId),
    { ...makeVariant(componentId, tokenId), id: "page-002" },
  ],
});

describe("buildConstrainedPageSpecSchema", () => {
  it("rejects a componentId not in the design system", () => {
    const schema = buildConstrainedPageSpecSchema();
    const result = schema.safeParse(makeOutput("FakeComponent", "primary-blue-500"));
    expect(result.success).toBe(false);
  });

  it("accepts all 12 valid component IDs", () => {
    const validIds = [
      "Hero",
      "Card",
      "ISIBlock",
      "Disclaimer",
      "CTA",
      "NavBar",
      "Footer",
      "DataTable",
      "ClaimReference",
      "SectionHeader",
      "ContentBlock",
      "ImageBlock",
    ];
    const schema = buildConstrainedPageSpecSchema();
    for (const componentId of validIds) {
      const result = schema.safeParse(makeOutput(componentId, "primary-blue-500"));
      expect(result.success, `Expected ${componentId} to be valid`).toBe(true);
    }
  });

  it("rejects a tokenId not in the token set", () => {
    const schema = buildConstrainedPageSpecSchema();
    // Use a component without tokenOverrides to isolate the tokenId test
    const output = {
      variants: [
        {
          ...makeVariant("Hero", "fake-token-999"),
          sections: [
            {
              id: "section-001",
              type: "hero" as const,
              order: 1,
              components: [
                {
                  componentId: "Hero",
                  selectionReason: "Test",
                  props: { title: "Hello", subtitle: "World" },
                  tokenOverrides: [{ tokenId: "fake-token-999", value: "#FFF" }],
                },
              ],
            },
          ],
        },
        {
          ...makeVariant("Hero", "fake-token-999"),
          id: "page-002",
          sections: [
            {
              id: "section-001",
              type: "hero" as const,
              order: 1,
              components: [
                {
                  componentId: "Hero",
                  selectionReason: "Test",
                  props: { title: "Hello", subtitle: "World" },
                  tokenOverrides: [{ tokenId: "fake-token-999", value: "#FFF" }],
                },
              ],
            },
          ],
        },
      ],
    };
    const result = schema.safeParse(output);
    expect(result.success).toBe(false);
  });

  it("accepts valid token IDs from the design system", () => {
    const schema = buildConstrainedPageSpecSchema();
    // Use a known valid token from tokens.json
    const output = {
      variants: [
        {
          ...makeVariant("Hero", "primary-blue-500"),
          sections: [
            {
              id: "section-001",
              type: "hero" as const,
              order: 1,
              components: [
                {
                  componentId: "Hero",
                  selectionReason: "Test",
                  props: { title: "Hello", subtitle: "World" },
                  tokenOverrides: [{ tokenId: "primary-blue-500", value: "#FFF" }],
                },
              ],
            },
          ],
        },
        {
          ...makeVariant("Hero", "primary-blue-500"),
          id: "page-002",
          sections: [
            {
              id: "section-001",
              type: "hero" as const,
              order: 1,
              components: [
                {
                  componentId: "Hero",
                  selectionReason: "Test",
                  props: { title: "Hello", subtitle: "World" },
                  tokenOverrides: [{ tokenId: "primary-blue-500", value: "#FFF" }],
                },
              ],
            },
          ],
        },
      ],
    };
    const result = schema.safeParse(output);
    expect(result.success).toBe(true);
  });

  it("rejects output with only 1 variant (requires exactly 2)", () => {
    const schema = buildConstrainedPageSpecSchema();
    const result = schema.safeParse({
      variants: [makeVariant("Hero", "primary-blue-500")],
    });
    expect(result.success).toBe(false);
  });

  it("rejects output with 3 variants (requires exactly 2)", () => {
    const schema = buildConstrainedPageSpecSchema();
    const result = schema.safeParse({
      variants: [
        makeVariant("Hero", "primary-blue-500"),
        { ...makeVariant("Hero", "primary-blue-500"), id: "page-002" },
        { ...makeVariant("Hero", "primary-blue-500"), id: "page-003" },
      ],
    });
    expect(result.success).toBe(false);
  });

  it("accepts exactly 2 valid variants", () => {
    const schema = buildConstrainedPageSpecSchema();
    const result = schema.safeParse(makeOutput("Hero", "primary-blue-500"));
    expect(result.success).toBe(true);
  });

  it("throws if design system has no components (guard test)", async () => {
    // Mock loadComponents to return an empty array
    const dsModule = await import("@/lib/design-system");
    const spy = vi.spyOn(dsModule, "loadComponents").mockReturnValue([]);

    expect(() => buildConstrainedPageSpecSchema()).toThrow(
      "Design system has no components",
    );

    spy.mockRestore();
  });
});

describe("buildConstrainedPageSpecSchema — selectionReason requirement", () => {
  it("rejects a component ref missing selectionReason", () => {
    const schema = buildConstrainedPageSpecSchema();
    const outputWithoutReason = {
      variants: [
        {
          id: "page-001",
          title: "Test Page",
          market: "us-hcp",
          product: "Cardiovex",
          sections: [
            {
              id: "section-001",
              type: "hero" as const,
              order: 1,
              components: [
                {
                  componentId: "Hero",
                  // selectionReason is intentionally omitted
                  props: { title: "Hello", subtitle: "World" },
                },
              ],
            },
          ],
          metadata: {
            generatedBy: "test",
            generatedAt: "2025-01-01T00:00:00Z",
            market: "us-hcp",
            product: "Cardiovex",
          },
        },
        {
          id: "page-002",
          title: "Test Page 2",
          market: "us-hcp",
          product: "Cardiovex",
          sections: [
            {
              id: "section-001",
              type: "hero" as const,
              order: 1,
              components: [
                {
                  componentId: "Hero",
                  props: { title: "Hello", subtitle: "World" },
                },
              ],
            },
          ],
          metadata: {
            generatedBy: "test",
            generatedAt: "2025-01-01T00:00:00Z",
            market: "us-hcp",
            product: "Cardiovex",
          },
        },
      ],
    };
    const result = schema.safeParse(outputWithoutReason);
    expect(result.success).toBe(false);
  });
});
