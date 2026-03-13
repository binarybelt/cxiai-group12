import { describe, expect, it } from "vitest";
import components from "../../design-system/components.json";
import tokens from "../../design-system/tokens.json";
import {
  ComponentRefSchema,
  PageSpecSchema,
  SectionSchema,
} from "../page-spec";
import type {
  ComponentDef,
  DesignToken,
  MarketConfig,
  Pattern,
  ComplianceRule,
} from "../design-system";

const validComponent = (components as ComponentDef[])[0];
const validToken = (tokens as DesignToken[])[0];

describe("PageSpec schema", () => {
  it("validates a realistic page spec", () => {
    const pageSpec = {
      id: "hcp-landing-us",
      title: "HCP Landing Page",
      market: "US",
      product: "Apexa",
      sections: [
        {
          id: "hero-1",
          type: "hero",
          order: 1,
          components: [
            {
              componentId: validComponent.id,
              props: {
                title: "Focused efficacy for specialist teams",
                subtitle: "Built from approved components only.",
              },
              tokenOverrides: [
                {
                  tokenId: validToken.id,
                  value: "#007bb1",
                },
              ],
            },
          ],
        },
      ],
      metadata: {
        generatedBy: "brief-interpreter",
        generatedAt: new Date("2026-03-13T20:00:00.000Z").toISOString(),
        complianceScore: 96,
        market: "US",
        product: "Apexa",
      },
    };

    expect(() => PageSpecSchema.parse(pageSpec)).not.toThrow();
  });

  it("rejects a page spec without sections", () => {
    const result = PageSpecSchema.safeParse({
      id: "invalid-page",
      title: "Invalid",
      market: "US",
      product: "Apexa",
      sections: [],
      metadata: {
        generatedBy: "brief-interpreter",
        generatedAt: new Date("2026-03-13T20:00:00.000Z").toISOString(),
        market: "US",
        product: "Apexa",
      },
    });

    expect(result.success).toBe(false);
  });

  it("requires componentId and props on component refs", () => {
    const result = ComponentRefSchema.safeParse({
      props: {},
    });

    expect(result.success).toBe(false);
  });

  it("only allows structural section types", () => {
    const result = SectionSchema.safeParse({
      id: "section-1",
      type: "ClaimReference",
      order: 2,
      components: [],
    });

    expect(result.success).toBe(false);
  });

  it("keeps design system interfaces exportable for runtime consumers", () => {
    const pattern: Pattern = {
      id: "hcp-landing",
      name: "HCP Landing Page",
      description: "Primary prescriber entry point",
      sections: [{ type: "content", requiredComponents: ["ClaimReference"] }],
    };
    const rule: ComplianceRule = {
      id: "brand-color-palette",
      category: "brand",
      severity: "error",
      description: "Colors must be approved",
      check: "Verify token usage",
      autoFixable: true,
    };
    const market: MarketConfig = {
      id: "US",
      name: "United States",
      region: "North America",
      requiredComponents: ["Disclaimer", "ISIBlock"],
      requiredDisclosures: ["FDA adverse event reporting"],
      additionalRules: ["Fair balance required"],
    };

    expect(pattern.sections[0]?.requiredComponents).toContain("ClaimReference");
    expect(rule.category).toBe("brand");
    expect(market.id).toBe("US");
  });
});
