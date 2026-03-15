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
          className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-pfizer-blue-500 focus:outline-none focus:ring-2 focus:ring-pfizer-blue-200"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-full bg-pfizer-blue-700 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-pfizer-blue-800 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pfizer-blue-500 focus-visible:ring-offset-2"
        >
          {loading ? "Importing..." : "Import"}
        </button>
      </form>

      {/* Error state */}
      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      {/* Extracted tokens + approved comparison */}
      {extracted && (
        <div className="grid gap-6 md:grid-cols-2">
          {/* Extracted tokens */}
          <div>
            <h3 className="mb-3 text-sm font-semibold text-gray-700">
              Extracted Tokens ({extracted.length})
            </h3>
            <div className="grid grid-cols-4 gap-2">
              {extracted.map((token) => (
                <div key={token.value} className="text-center">
                  <div
                    className="mx-auto h-10 w-10 rounded-lg border border-gray-200 shadow-sm"
                    style={{ backgroundColor: token.value }}
                  />
                  <p className="mt-1 text-xs font-medium text-gray-700">
                    {token.name}
                  </p>
                  <p className="font-mono text-[10px] text-gray-400">
                    {token.value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Approved palette for comparison */}
          <div>
            <h3 className="mb-3 text-sm font-semibold text-gray-700">
              Approved Palette ({approvedColours.length})
            </h3>
            <div className="grid grid-cols-4 gap-2">
              {approvedColours.map((token) => (
                <div key={token.id} className="text-center">
                  <div
                    className="mx-auto h-10 w-10 rounded-lg border border-gray-200 shadow-sm"
                    style={{ backgroundColor: token.value }}
                  />
                  <p className="mt-1 text-xs font-medium text-gray-700">
                    {token.name}
                  </p>
                  <p className="font-mono text-[10px] text-gray-400">
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
