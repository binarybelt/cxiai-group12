/**
 * POST /api/chat-edit
 *
 * Accepts a current PageSpec (single variant) and an edit instruction, then
 * uses generateObject to produce an updated PageSpec via the chat-editor agent.
 *
 * Optimised for token budget: only the selected variant is injected into the
 * system prompt, and the schema expects a single variant (not two).
 *
 * Runs the compliance gate before returning. Returns 422 with violations if
 * the compliance gate fails.
 */
import { readFile } from "fs/promises";
import { join } from "path";

import { generateObject } from "ai";
import { NextRequest } from "next/server";
import { z } from "zod";

import { getLLM } from "@/lib/llm";
import { buildConstrainedPageSpecSchema } from "@/agents/component-selector/schema";
import { logGeneration } from "@/lib/convex-client";
import { runComplianceGate } from "@/lib/compliance";
import type { PageSpec } from "@/types/page-spec";

// Vercel serverless: allow up to 60 s for LLM round-trip
export const maxDuration = 60;

interface ChatEditRequest {
  spec: PageSpec;
  instruction: string;
}

/**
 * Build a single-variant wrapper schema by extracting the inner PageSpec
 * schema from the two-variant wrapper used by generate-page.
 */
function buildSingleVariantSchema() {
  const twoVariantSchema = buildConstrainedPageSpecSchema();
  // The inner element schema is the constrained PageSpec
  const innerPageSpec = twoVariantSchema.shape.variants.element;
  return z.object({
    variant: innerPageSpec.describe("The edited PageSpec variant"),
  });
}

export async function POST(request: NextRequest): Promise<Response> {
  try {
    const body = (await request.json()) as ChatEditRequest;
    const { spec, instruction } = body;

    if (!spec || !instruction) {
      return Response.json(
        { error: "Both 'spec' and 'instruction' are required" },
        { status: 400 },
      );
    }

    // Load the chat-editor system prompt
    const promptPath = join(
      process.cwd(),
      "src",
      "agents",
      "chat-editor",
      "prompt.md",
    );
    const promptTemplate = await readFile(promptPath, "utf-8");

    // Inject only the selected variant (compact JSON to save tokens)
    const compactSpec = JSON.stringify(spec);
    const systemPrompt = promptTemplate.replace(
      "{{CURRENT_SPEC}}",
      compactSpec,
    );

    console.log(
      `[chat-edit] system prompt length: ${systemPrompt.length} chars, spec: ${compactSpec.length} chars`,
    );

    const schema = buildSingleVariantSchema();

    let result;
    try {
      result = await generateObject({
        model: getLLM(),
        schema,
        system: systemPrompt,
        prompt: instruction,
        maxRetries: 2,
      });
    } catch (llmErr) {
      console.error("[chat-edit] LLM generateObject error:", llmErr);
      const llmMessage =
        llmErr instanceof Error ? llmErr.message : String(llmErr);
      return Response.json(
        {
          error: `LLM generation failed: ${llmMessage.slice(0, 300)}`,
        },
        { status: 502 },
      );
    }

    const variant = result.object.variant as PageSpec;

    // Post-process: fix adverseEventUrl placeholders
    const ADVERSE_EVENT_URLS: Record<string, string> = {
      UK: "https://yellowcard.mhra.gov.uk",
      US: "https://www.fda.gov/medwatch",
      EU: "https://www.ema.europa.eu/en/human-regulatory/post-authorisation/pharmacovigilance",
    };
    const fallbackUrl = ADVERSE_EVENT_URLS[variant.market] ?? ADVERSE_EVENT_URLS.US;
    for (const section of variant.sections ?? []) {
      for (const comp of section.components ?? []) {
        if (comp.componentId === "Footer" && (!comp.props["adverseEventUrl"] || comp.props["adverseEventUrl"] === "#")) {
          comp.props["adverseEventUrl"] = fallbackUrl;
        }
      }
    }

    // Fire-and-forget audit log
    void logGeneration(
      "chat-edit",
      JSON.stringify({
        market: variant.market,
        product: variant.product,
        instruction,
      }),
    );

    // Run compliance gate on the edited variant
    const gateResult = runComplianceGate(variant);
    const hasErrors = gateResult.violations.some(
      (v) => v.severity === "error",
    );

    if (hasErrors) {
      return Response.json(
        {
          error: "Compliance gate blocked edit",
          violations: gateResult.violations,
          spec: variant,
        },
        { status: 422 },
      );
    }

    return Response.json({
      spec: variant,
      violations: gateResult.violations,
    });
  } catch (err) {
    console.error("[chat-edit] route error:", err);
    const message = err instanceof Error ? err.message : String(err);
    return Response.json(
      { error: `Chat edit failed: ${message.slice(0, 300)}` },
      { status: 500 },
    );
  }
}
