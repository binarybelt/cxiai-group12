/**
 * POST /api/chat-edit
 *
 * Accepts a current PageSpec and an edit instruction, then uses generateObject
 * to produce an updated PageSpec via the chat-editor agent.
 *
 * Returns the first variant (variants[0]) since chat-edit focuses on a single
 * edited result. Runs the compliance gate before returning.
 *
 * Returns 422 with violations if the compliance gate fails.
 */
import { readFile } from "fs/promises";
import { join } from "path";

import { generateObject } from "ai";
import { NextRequest } from "next/server";

import { getLLM } from "@/lib/llm";
import { buildConstrainedPageSpecSchema } from "@/agents/component-selector/schema";
import { logGeneration } from "@/lib/convex-client";
import { runComplianceGate } from "@/lib/compliance";
import type { PageSpec } from "@/types/page-spec";

interface ChatEditRequest {
  spec: PageSpec;
  instruction: string;
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

    // Inject the current spec into the system prompt
    const systemPrompt = promptTemplate.replace(
      "{{CURRENT_SPEC}}",
      JSON.stringify(spec, null, 2),
    );

    const schema = buildConstrainedPageSpecSchema();

    const result = await generateObject({
      model: getLLM(),
      schema,
      system: systemPrompt,
      prompt: instruction,
      maxRetries: 2,
    });

    const editedSpec = result.object;
    const variant = editedSpec.variants[0] as PageSpec;

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
    return Response.json(
      { error: "Chat edit failed" },
      { status: 500 },
    );
  }
}
