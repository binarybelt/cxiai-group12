import { z } from "zod";

import {
  ComponentRefSchema,
  PageSpecSchema,
  SectionSchema,
  TokenOverrideSchema,
} from "@/types/page-spec";
import { loadComponents, loadTokens } from "@/lib/design-system";

/**
 * Builds a constrained PageSpec schema at request time.
 *
 * Both componentId and tokenId are constrained via dynamic z.enum() derived
 * from the actual design system data — this is the BUILD-03 enforcement point.
 *
 * Uses .extend() on existing page-spec.ts schemas so all base fields are
 * inherited automatically and stay in sync with the source of truth.
 */
export function buildConstrainedPageSpecSchema() {
  const componentIds = loadComponents().map((c) => c.id) as [
    string,
    ...string[],
  ];
  const tokenIds = loadTokens().map((t) => t.id) as [string, ...string[]];

  if (componentIds.length === 0) {
    throw new Error("Design system has no components — cannot build schema");
  }
  if (tokenIds.length === 0) {
    throw new Error("Design system has no tokens — cannot build schema");
  }

  // Constrain tokenId to approved token set (BUILD-03 token enforcement)
  const ConstrainedTokenOverrideSchema = TokenOverrideSchema.extend({
    tokenId: z
      .enum(tokenIds)
      .describe("Must be a valid token ID from the approved design system"),
  });

  // Constrain componentId to approved component set (BUILD-03 component enforcement)
  // Also add selectionReason for LLM explainability — stripped before handing off to renderer
  const ConstrainedComponentRefSchema = ComponentRefSchema.extend({
    componentId: z
      .enum(componentIds)
      .describe("Must be a valid component ID from the approved design system"),
    selectionReason: z
      .string()
      .min(1)
      .describe("Why this component was chosen for this position"),
    tokenOverrides: z.array(ConstrainedTokenOverrideSchema).optional(),
  });

  // Extend section to require constrained component refs
  const ConstrainedSectionSchema = SectionSchema.extend({
    components: z.array(ConstrainedComponentRefSchema),
  });

  // Extend PageSpec to require constrained sections
  const ConstrainedPageSpecSchema = PageSpecSchema.extend({
    sections: z.array(ConstrainedSectionSchema).min(1),
  });

  // Decision 13: two-variant wrapper — the LLM always generates two alternatives
  return z.object({
    variants: z
      .array(ConstrainedPageSpecSchema)
      .length(2)
      .describe("Exactly two complete PageSpec variants for review"),
  });
}

export type ConstrainedPageSpecOutput = ReturnType<
  typeof buildConstrainedPageSpecSchema
>["_output"];
