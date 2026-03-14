/**
 * POST /api/generate-page
 *
 * Accepts a BriefInterpretation object and returns a two-variant PageSpec as
 * JSON using Vercel AI SDK generateObject.
 *
 * The constrained schema (buildConstrainedPageSpecSchema) enforces BUILD-03:
 * only approved component IDs and token IDs are accepted.
 *
 * A compliance gate runs after generation. Non-compliant specs return 422 with
 * { error, violations, spec } so the client can display sidebar violations.
 *
 * Each completed generation is logged to the Convex audit trail.
 */
import { readFile } from "fs/promises";
import { join } from "path";

import { generateObject } from "ai";
import { NextRequest } from "next/server";

import type { BriefInterpretation } from "@/agents/brief-interpreter/schema";
import { getLLM } from "@/lib/llm";
import { buildConstrainedPageSpecSchema } from "@/agents/component-selector/schema";
import { PROP_SHAPES } from "@/agents/component-selector/prop-shapes";
import {
  loadComponents,
  loadTokens,
  loadMarkets,
  loadPatterns,
  getMarketConfig,
} from "@/lib/design-system";
import { logGeneration } from "@/lib/convex-client";
import { runComplianceGate } from "@/lib/compliance";
import type { ComplianceViolation } from "@/types/compliance";
import type { PageSpec } from "@/types/page-spec";

export async function POST(request: NextRequest): Promise<Response> {
  try {
    const interpretation = (await request.json()) as BriefInterpretation;

    // Load and inject design system context into the prompt template
    const promptPath = join(
      process.cwd(),
      "src",
      "agents",
      "component-selector",
      "prompt.md",
    );
    const promptTemplate = await readFile(promptPath, "utf-8");

    const marketConfig = getMarketConfig(interpretation.market);
    const allComponents = loadComponents();
    const allTokens = loadTokens();
    const allPatterns = loadPatterns();

    const matchingPattern = allPatterns.find(
      (p) => p.id === interpretation.pageType,
    );

    const requiredComponents = interpretation.mustIncludeComponents;
    const requiredDisclosures = marketConfig?.requiredDisclosures ?? [];

    // Build a rich component listing with their prop shapes
    const allComponentsWithProps = allComponents.map((c) => ({
      id: c.id,
      category: c.category,
      description: c.description,
      props: PROP_SHAPES[c.id]?.props ?? {},
    }));

    const tokenIds = allTokens.map((t) => t.id);

    const systemPrompt = promptTemplate
      .replace("{{MARKET}}", interpretation.market)
      .replace(
        "{{REQUIRED_COMPONENTS}}",
        JSON.stringify(requiredComponents, null, 2),
      )
      .replace(
        "{{REQUIRED_DISCLOSURES}}",
        JSON.stringify(requiredDisclosures, null, 2),
      )
      .replace(
        "{{PATTERN}}",
        JSON.stringify(matchingPattern ?? { id: interpretation.pageType }, null, 2),
      )
      .replace(
        "{{ALL_COMPONENTS_WITH_PROPS}}",
        JSON.stringify(allComponentsWithProps, null, 2),
      )
      .replace(
        "{{PROP_SHAPES}}",
        JSON.stringify(PROP_SHAPES, null, 2),
      );

    const schema = buildConstrainedPageSpecSchema();

    const result = await generateObject({
      model: getLLM(),
      schema,
      system: systemPrompt,
      prompt: JSON.stringify(interpretation),
      maxRetries: 2,
    });

    const spec = result.object;

    // Fire-and-forget audit log
    void logGeneration(
      "generate-page",
      JSON.stringify({
        market: interpretation.market,
        product: interpretation.product,
        pageType: interpretation.pageType,
        variantCount: spec?.variants?.length ?? 0,
        tokenIds: tokenIds.slice(0, 5),
      }),
    );

    // COMPLY-06: Compliance gate — block non-compliant specs.
    // Run gate against each variant; fail if ANY variant has errors.
    const allViolations = (spec.variants ?? []).flatMap((variant: PageSpec) => {
      const gateResult = runComplianceGate(variant);
      return gateResult.violations;
    });
    const hasErrors = allViolations.some(
      (v: ComplianceViolation) => v.severity === "error",
    );

    if (hasErrors) {
      return Response.json(
        {
          error: "Compliance gate blocked rendering",
          violations: allViolations,
          spec, // include spec so client can show violations in sidebar
        },
        { status: 422 },
      );
    }

    // Happy path: return the generated spec as JSON
    return Response.json(spec);
  } catch (err) {
    console.error("[generate-page] route error:", err);
    return Response.json(
      { error: "Page generation failed" },
      { status: 500 },
    );
  }
}
