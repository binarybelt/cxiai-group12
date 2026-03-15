import { z } from "zod";

export const BriefInterpretationSchema = z.object({
  pageType: z
    .string()
    .min(1)
    .describe("Pattern ID from the approved design system pattern library"),
  market: z.string().min(1).describe("Market ID (e.g., us-hcp, us-patient)"),
  product: z.string().min(1).describe("Product name or identifier"),
  audience: z
    .enum(["hcp", "patient", "general"])
    .describe("Primary target audience for this page"),
  contentRequirements: z
    .array(z.string())
    .describe(
      "List of required content elements based on the brief (e.g., 'efficacy data', 'safety profile')",
    ),
  toneKeywords: z
    .array(z.string())
    .describe(
      "Keywords describing the desired tone (e.g., 'clinical', 'empathetic', 'authoritative')",
    ),
  mustIncludeComponents: z
    .array(z.string())
    .describe(
      "Component IDs that must appear on this page based on compliance or brief requirements",
    ),
  reasoning: z
    .string()
    .min(1)
    .describe(
      "Plain-language explanation of why these choices were made based on the brief",
    ),
  riskFlags: z
    .array(
      z.object({
        flag: z
          .string()
          .describe(
            "Risk flag identifier (e.g., 'superlative-claim', 'missing-safety-context', 'off-label-indication')",
          ),
        detail: z.string().describe("Plain-language explanation of the risk"),
        severity: z
          .enum(["low", "medium", "high"])
          .describe("Severity level of the risk"),
      }),
    )
    .default([])
    .describe(
      "Compliance risk flags detected during brief pre-screening",
    ),
});

export type BriefInterpretation = z.infer<typeof BriefInterpretationSchema>;
