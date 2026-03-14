/**
 * POST /api/generate-page
 *
 * Accepts a BriefInterpretation object and streams a two-variant PageSpec
 * response using Vercel AI SDK streamObject.
 *
 * The constrained schema (buildConstrainedPageSpecSchema) enforces BUILD-03:
 * only approved component IDs and token IDs are accepted.
 *
 * Each completed generation is logged to the Convex audit trail via the
 * onFinish callback.
 */
import { readFile } from "fs/promises";
import { join } from "path";

import { anthropic } from "@ai-sdk/anthropic";
import { streamObject } from "ai";
import { NextRequest } from "next/server";

import type { BriefInterpretation } from "@/agents/brief-interpreter/schema";
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

    const result = streamObject({
      model: anthropic("claude-sonnet-4-5-20250414"),
      schema,
      system: systemPrompt,
      prompt: JSON.stringify(interpretation),
      maxRetries: 2,
      onFinish: ({ object }) => {
        // Fire-and-forget audit log after streaming completes
        void logGeneration(
          "generate-page",
          JSON.stringify({
            market: interpretation.market,
            product: interpretation.product,
            pageType: interpretation.pageType,
            variantCount: object?.variants?.length ?? 0,
            tokenIds: tokenIds.slice(0, 5), // log first few for context
          }),
        );
      },
    });

    return result.toTextStreamResponse();
  } catch (err) {
    console.error("[generate-page] route error:", err);
    return Response.json(
      { error: "Page generation failed" },
      { status: 500 },
    );
  }
}
