import { NextRequest } from "next/server";

import { driftReport } from "@/lib/scan";
import { loadTokens } from "@/lib/design-system";

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

    // Basic URL validation
    try {
      new URL(url);
    } catch {
      return Response.json(
        { error: "Invalid URL format" },
        { status: 400 },
      );
    }

    // Fetch HTML from the target URL server-side
    let html: string;
    try {
      const res = await fetch(url, {
        headers: { "User-Agent": "DDA-Scanner/1.0" },
        signal: AbortSignal.timeout(10_000),
      });
      html = await res.text();
    } catch {
      return Response.json(
        { error: "Could not fetch URL. Ensure it is publicly accessible." },
        { status: 422 },
      );
    }

    const report = driftReport(url, html, loadTokens());
    return Response.json(report);
  } catch (err) {
    console.error("[scan-url] route error:", err);
    return Response.json(
      { error: "Scan failed" },
      { status: 500 },
    );
  }
}
