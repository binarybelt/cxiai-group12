/**
 * Server-side Convex HTTP client for API route audit logging.
 *
 * Uses ConvexHttpClient (not the React client) so it works in Next.js
 * API routes without WebSocket requirements.
 *
 * Graceful degradation: if NEXT_PUBLIC_CONVEX_URL is not set, logGeneration
 * logs a warning and returns early — the pipeline never crashes for missing Convex.
 */
import { ConvexHttpClient } from "convex/browser";

import { api } from "../../convex/_generated/api";

let _client: ConvexHttpClient | null = null;

function getClient(): ConvexHttpClient | null {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url) {
    return null;
  }
  if (!_client) {
    _client = new ConvexHttpClient(url);
  }
  return _client;
}

/**
 * Logs a generation event to the Convex audit trail.
 *
 * Silently skips (with a console warning) when NEXT_PUBLIC_CONVEX_URL is unset.
 * Actor is always "build-pipeline" for server-side logging.
 */
export async function logGeneration(
  action: string,
  details: string,
): Promise<void> {
  const client = getClient();
  if (!client) {
    console.warn(
      `[convex-client] NEXT_PUBLIC_CONVEX_URL not set — skipping logGeneration for action: ${action}`,
    );
    return;
  }

  try {
    await client.mutation(api.auditLog.logAction, {
      action,
      details,
      actor: "build-pipeline",
    });
  } catch (err) {
    // Log but never crash the pipeline for audit logging failures
    console.error(`[convex-client] logGeneration failed for action: ${action}`, err);
  }
}

export { getClient as convexClient };
