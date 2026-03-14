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
});

export type BriefInterpretation = z.infer<typeof BriefInterpretationSchema>;
