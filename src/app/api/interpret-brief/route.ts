/**
 * POST /api/interpret-brief
 *
 * Accepts a natural-language brief string and returns a structured
 * BriefInterpretation JSON object via Vercel AI SDK generateObject.
 *
 * Design system context (patterns, markets, components) is injected into
 * the system prompt template loaded from prompt.md.
 *
 * Each successful generation is logged to the Convex audit trail.
 */
import { readFile } from "fs/promises";
import { join } from "path";

import { anthropic } from "@ai-sdk/anthropic";
import { generateObject } from "ai";
import { NextRequest } from "next/server";

import { BriefInterpretationSchema } from "@/agents/brief-interpreter/schema";
import { loadComponents, loadMarkets, loadPatterns } from "@/lib/design-system";
import { logGeneration } from "@/lib/convex-client";

export async function POST(request: NextRequest): Promise<Response> {
  try {
    const body = await request.json() as { brief?: unknown };
    const { brief } = body;

    if (typeof brief !== "string" || brief.trim().length === 0) {
      return Response.json(
        { error: "brief must be a non-empty string" },
        { status: 400 },
      );
    }

    // Load and inject design system context into the prompt template
    const promptPath = join(
      process.cwd(),
      "src",
      "agents",
      "brief-interpreter",
      "prompt.md",
    );
    const promptTemplate = await readFile(promptPath, "utf-8");

    const patterns = loadPatterns();
    const markets = loadMarkets();
    const components = loadComponents().map((c) => ({
      id: c.id,
      category: c.category,
      description: c.description,
    }));

    const systemPrompt = promptTemplate
      .replace("{{PATTERNS}}", JSON.stringify(patterns, null, 2))
      .replace("{{MARKETS}}", JSON.stringify(markets, null, 2))
      .replace("{{COMPONENTS}}", JSON.stringify(components, null, 2));

    const { object } = await generateObject({
      model: anthropic("claude-sonnet-4-5-20250414"),
      schema: BriefInterpretationSchema,
      system: systemPrompt,
      prompt: brief,
      maxRetries: 2,
    });

    // Fire-and-forget audit log — never block the response on logging
    void logGeneration(
      "interpret-brief",
      JSON.stringify({ brief: brief.slice(0, 200), interpretation: object }),
    );

    return Response.json(object);
  } catch (err) {
    console.error("[interpret-brief] route error:", err);
    return Response.json(
      { error: "Brief interpretation failed" },
      { status: 500 },
    );
  }
}
