/**
 * POST /api/deploy
 *
 * Accepts { html: string, title: string } and deploys a standalone HTML page
 * to Vercel using their Deploy API. Falls back to demo mode when VERCEL_TOKEN
 * is not set.
 */
import { NextRequest, NextResponse } from "next/server";

import { logGeneration } from "@/lib/convex-client";
import type { DeployResult } from "@/types/deploy";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 50);
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { html?: string; title?: string };

    if (!body.html || !body.title) {
      return NextResponse.json(
        { error: "Missing required fields: html, title" },
        { status: 400 },
      );
    }

    const slug = slugify(body.title);
    const vercelToken = process.env.VERCEL_TOKEN;

    let result: DeployResult;

    if (vercelToken) {
      // Real Vercel deployment
      const deployRes = await fetch(
        "https://api.vercel.com/v13/deployments",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${vercelToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: slug || "dda-deploy",
            files: [
              {
                file: "index.html",
                data: Buffer.from(body.html).toString("base64"),
                encoding: "base64",
              },
            ],
            projectSettings: {
              framework: null,
            },
          }),
        },
      );

      if (!deployRes.ok) {
        const errBody = await deployRes.text();
        console.error("[deploy] Vercel API error:", errBody);
        return NextResponse.json(
          { error: `Vercel deploy failed: ${deployRes.status}` },
          { status: 502 },
        );
      }

      const deployData = (await deployRes.json()) as { url?: string };
      const deployUrl = deployData.url
        ? `https://${deployData.url}`
        : `https://${slug}.vercel.app`;

      result = {
        url: deployUrl,
        status: "live",
        deployedAt: new Date().toISOString(),
      };
    } else {
      // Demo mode — simulate deployment
      await new Promise((resolve) => setTimeout(resolve, 2000));
      result = {
        url: `https://demo-${slug}.vercel.app`,
        status: "live",
        deployedAt: new Date().toISOString(),
      };
    }

    // Fire-and-forget audit log
    logGeneration("deploy", `Deployed "${body.title}" → ${result.url}`).catch(
      () => {},
    );

    return NextResponse.json(result);
  } catch (err) {
    console.error("[deploy] Unexpected error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
