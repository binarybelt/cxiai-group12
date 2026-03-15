"use client";

import { useState } from "react";

import type { TokenDraft } from "@/lib/figma";
import tokens from "@/design-system/tokens.json";
import type { DesignToken } from "@/types/design-system";

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function FigmaImport() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [extracted, setExtracted] = useState<TokenDraft[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Approved colour tokens for side-by-side comparison
  const approvedColours = (tokens as DesignToken[]).filter(
    (t) => t.category === "color",
  );

  async function handleImport(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmed = url.trim();
    if (!trimmed) return;

    setLoading(true);
    setExtracted(null);
    setError(null);

    try {
      const res = await fetch("/api/figma-extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: trimmed }),
      });

      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as {
          error?: string;
        };
        throw new Error(
          body.error ?? `Figma extraction failed (${res.status})`,
        );
      }

      const data = (await res.json()) as { tokens: TokenDraft[] };
      setExtracted(data.tokens);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleImport} className="flex gap-3">
        <input
          aria-label="Figma file URL"
          name="figma-url"
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://www.figma.com/file/ABC123/My-Design"
          required
          className="flex-1 rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-sm text-white placeholder:text-white/35 focus:border-pfizer-blue-accent focus:outline-none focus:ring-2 focus:ring-pfizer-blue-accent/30 focus:ring-offset-2 focus:ring-offset-[#000014]"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-full bg-[#0000c9] px-6 py-2.5 text-sm font-semibold text-white transition hover:shadow-[0_0_16px_rgba(0,0,201,0.4)] disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pfizer-blue-accent focus-visible:ring-offset-2 focus-visible:ring-offset-[#000014]"
        >
          {loading ? "Importing..." : "Import"}
        </button>
      </form>

      {/* Error state */}
      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-500/30 bg-red-500/15 p-4 text-sm text-red-400"
        >
          {error}
        </div>
      )}

      {/* Extracted tokens + approved comparison */}
      {extracted && (
        <div className="grid gap-6 md:grid-cols-2">
          {/* Extracted tokens */}
          <div>
            <h3 className="mb-3 text-sm font-semibold text-white/70">
              Extracted Tokens ({extracted.length})
            </h3>
            <div className="grid grid-cols-4 gap-2">
              {extracted.map((token) => (
                <div key={token.value} className="text-center">
                  <div
                    className="mx-auto h-10 w-10 rounded-lg border border-white/[0.08]"
                    style={{ backgroundColor: token.value }}
                  />
                  <p className="mt-1 text-xs font-medium text-white/70">
                    {token.name}
                  </p>
                  <p className="font-mono text-[10px] text-white/35">
                    {token.value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Approved palette for comparison */}
          <div>
            <h3 className="mb-3 text-sm font-semibold text-white/70">
              Approved Palette ({approvedColours.length})
            </h3>
            <div className="grid grid-cols-4 gap-2">
              {approvedColours.map((token) => (
                <div key={token.id} className="text-center">
                  <div
                    className="mx-auto h-10 w-10 rounded-lg border border-white/[0.08]"
                    style={{ backgroundColor: token.value }}
                  />
                  <p className="mt-1 text-xs font-medium text-white/70">
                    {token.name}
                  </p>
                  <p className="font-mono text-[10px] text-white/35">
                    {token.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default FigmaImport;
