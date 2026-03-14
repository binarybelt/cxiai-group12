import { describe, it, expect } from "vitest";
import { BriefInterpretationSchema } from "../schema";

const validInterpretation = {
  pageType: "hcp-product-launch",
  market: "us-hcp",
  product: "Cardiovex",
  audience: "hcp" as const,
  contentRequirements: ["efficacy data", "safety profile", "dosing information"],
  toneKeywords: ["clinical", "authoritative", "evidence-based"],
  mustIncludeComponents: ["Hero", "ISIBlock", "Footer"],
  reasoning:
    "HCP launch page requires clinical tone with mandatory ISI block for compliance. Hero leads with efficacy claim.",
};

describe("BriefInterpretationSchema", () => {
  it("accepts a valid interpretation with all required fields", () => {
    const result = BriefInterpretationSchema.safeParse(validInterpretation);
    expect(result.success).toBe(true);
  });

  it("accepts all valid audience enum values", () => {
    const audiences = ["hcp", "patient", "general"] as const;
    for (const audience of audiences) {
      const result = BriefInterpretationSchema.safeParse({
        ...validInterpretation,
        audience,
      });
      expect(result.success).toBe(true);
    }
  });

  it("rejects an object missing required field: market", () => {
    const { market: _market, ...withoutMarket } = validInterpretation;
    const result = BriefInterpretationSchema.safeParse(withoutMarket);
    expect(result.success).toBe(false);
  });

  it("rejects an object missing required field: product", () => {
    const { product: _product, ...withoutProduct } = validInterpretation;
    const result = BriefInterpretationSchema.safeParse(withoutProduct);
    expect(result.success).toBe(false);
  });

  it("rejects an invalid audience value", () => {
    const result = BriefInterpretationSchema.safeParse({
      ...validInterpretation,
      audience: "doctor",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty pageType string", () => {
    const result = BriefInterpretationSchema.safeParse({
      ...validInterpretation,
      pageType: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty reasoning string", () => {
    const result = BriefInterpretationSchema.safeParse({
      ...validInterpretation,
      reasoning: "",
    });
    expect(result.success).toBe(false);
  });

  it("inferred type BriefInterpretation matches the shape at compile time", () => {
    // This test verifies the export exists and type inference works
    const interpretation: import("../schema").BriefInterpretation =
      validInterpretation;
    expect(interpretation.pageType).toBe("hcp-product-launch");
  });
});
