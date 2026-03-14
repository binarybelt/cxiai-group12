import { NextRequest } from "next/server";

import { extractTokensFromFigmaUrl } from "@/lib/figma";

export async function POST(request: NextRequest): Promise<Response> {
  try {
    const body = (await request.json()) as { url?: string };
    const url = body.url?.trim();

    if (!url) {
      return Response.json(
        { error: "Missing required field: url" },
        { status: 400 },
      );
    }

    // Quick client-side validation before calling the extraction function
    if (!url.includes("figma.com")) {
      return Response.json(
        { error: "Invalid Figma URL" },
        { status: 400 },
      );
    }

    const tokens = await extractTokensFromFigmaUrl(url);
    return Response.json({ tokens });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Extraction failed";

    if (message.includes("Invalid Figma URL")) {
      return Response.json({ error: "Invalid Figma URL" }, { status: 400 });
    }

    console.error("[figma-extract] route error:", err);
    return Response.json({ error: message }, { status: 500 });
  }
}
