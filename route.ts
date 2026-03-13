import { NextRequest, NextResponse } from "next/server";
import { parseBrief } from "@/lib/claude";
import { runComplianceCheck, buildBlocksFromReqs } from "@/lib/engine";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { brief } = body as { brief?: string };

    if (!brief || typeof brief !== "string" || brief.trim().length < 10) {
      return NextResponse.json(
        { error: "A design brief of at least 10 characters is required." },
        { status: 400 }
      );
    }

    // Step 1: Parse the NL brief into structured requirements
    const reqs = await parseBrief(brief.trim());

    // Step 2: Build blocks from requirements
    const blocks = buildBlocksFromReqs(reqs, brief.trim());

    // Step 3: Run hybrid compliance check (deterministic + LLM)
    const result = await runComplianceCheck(blocks, reqs);

    return NextResponse.json({ reqs, result });
  } catch (err: unknown) {
    console.error("Compliance check error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: `Compliance check failed: ${message}` }, { status: 500 });
  }
}
