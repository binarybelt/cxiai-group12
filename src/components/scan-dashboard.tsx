"use client";

import { useState } from "react";

import portfolio from "@/design-system/portfolio.json";
import type { PortfolioEntry } from "@/types/scan";
import type { ScanReport } from "@/types/scan";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function statusBadge(status: PortfolioEntry["status"]) {
  const styles: Record<PortfolioEntry["status"], string> = {
    compliant: "bg-green-500/15 text-green-400",
    warning: "bg-amber-500/15 text-amber-400",
    critical: "bg-red-500/15 text-red-400",
  };
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${styles[status]}`}
    >
      {status}
    </span>
  );
}

function scoreColour(score: number): string {
  if (score >= 80) return "text-green-400";
  if (score >= 60) return "text-amber-400";
  return "text-red-400";
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ScanDashboard() {
  const [scanUrl, setScanUrl] = useState("https://www.example.com");
  const [scanning, setScanning] = useState(false);
  const [report, setReport] = useState<ScanReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleScan(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const url = scanUrl.trim();
    if (!url) return;

    setScanning(true);
    setReport(null);
    setError(null);

    try {
      const res = await fetch("/api/scan-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as {
          error?: string;
        };
        throw new Error(
          body.error ?? `Scan request failed (${res.status})`,
        );
      }

      const data = (await res.json()) as ScanReport;
      setReport(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred",
      );
    } finally {
      setScanning(false);
    }
  }

  return (
    <div className="space-y-10">
      {/* ---------------------------------------------------------------- */}
      {/* Portfolio overview                                                */}
      {/* ---------------------------------------------------------------- */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-white/93">
          Portfolio Overview
        </h2>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(portfolio as PortfolioEntry[]).map((entry) => (
            <div
              key={entry.url}
              className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5 transition hover:bg-white/[0.05]"
            >
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-semibold text-white/93">
                  {entry.product}
                </h3>
                {statusBadge(entry.status)}
              </div>

              <p className="text-sm text-white/55">{entry.market}</p>

              <div className="mt-3 flex items-end justify-between">
                <div>
                  <p className="text-xs text-white/35">Compliance</p>
                  <p
                    className={`text-2xl font-bold ${scoreColour(entry.complianceScore)}`}
                  >
                    {entry.complianceScore}%
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-white/35">Drift items</p>
                  <p className="text-lg font-semibold text-white/70">
                    {entry.driftCount}
                  </p>
                </div>
              </div>

              <p className="mt-3 text-xs text-white/35">
                Last scanned:{" "}
                {new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(entry.lastScanned))}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Live URL scan                                                     */}
      {/* ---------------------------------------------------------------- */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-white/93">
          Live URL Scan
        </h2>

        <form onSubmit={handleScan} className="flex gap-3">
          <input
            aria-label="URL to scan"
            name="scan-url"
            type="url"
            value={scanUrl}
            onChange={(e) => setScanUrl(e.target.value)}
            placeholder="https://example.com"
            required
            className="flex-1 rounded-xl border border-white/[0.08] bg-white/[0.05] px-4 py-2.5 text-sm text-white placeholder:text-white/35 focus:border-pfizer-blue-500 focus:outline-none focus:ring-2 focus:ring-pfizer-blue-500/30"
          />
          <button
            type="submit"
            disabled={scanning}
            className="rounded-full bg-pfizer-blue-700 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-pfizer-blue-800 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pfizer-blue-500 focus-visible:ring-offset-2"
          >
            {scanning ? "Scanning\u2026" : "Scan"}
          </button>
        </form>

        {/* Error state */}
        {error && (
          <div
            role="alert"
            className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400"
          >
            {error}
          </div>
        )}

        {/* Scan results */}
        {report && (
          <div className="mt-4 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-semibold text-white/93">Scan Results</h3>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  report.driftCount === 0
                    ? "bg-green-500/15 text-green-400"
                    : "bg-red-500/15 text-red-400"
                }`}
              >
                {report.driftCount} drift item{report.driftCount !== 1 ? "s" : ""}
              </span>
            </div>

            <p className="mb-1 text-sm text-white/55">
              URL: {report.url}
            </p>
            <p className="mb-4 text-xs text-white/35">
              Scanned: {new Date(report.scannedAt).toLocaleString()}
            </p>

            {report.items.length === 0 ? (
              <p className="text-sm text-green-400">
                No off-brand colours detected. All values match the approved
                palette.
              </p>
            ) : (
              <ul className="space-y-2">
                {report.items.map((item) => (
                  <li
                    key={item.hex}
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-white/70 transition hover:bg-white/[0.03]"
                  >
                    <span
                      aria-hidden="true"
                      className="inline-block h-5 w-5 rounded border border-white/[0.12]"
                      style={{ backgroundColor: item.hex }}
                    />
                    <code className="font-mono text-xs text-white/55">{item.hex}</code>
                    <span className="text-white/55">{item.message}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </section>
    </div>
  );
}

export default ScanDashboard;
