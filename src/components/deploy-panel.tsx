"use client";

import { useState } from "react";

import { generateStandaloneHtml } from "@/lib/html-generator";
import type { DeployResult, DeployStatus } from "@/types/deploy";
import type { PageSpec } from "@/types/page-spec";

interface DeployPanelProps {
  currentSpec: PageSpec | null;
}

export function DeployPanel({ currentSpec }: DeployPanelProps) {
  const [status, setStatus] = useState<DeployStatus>("idle");
  const [result, setResult] = useState<DeployResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleDeploy() {
    if (!currentSpec) return;

    setError(null);
    setResult(null);

    try {
      // Step 1: Generate HTML
      setStatus("generating-html");
      const html = generateStandaloneHtml(currentSpec);

      // Step 2: Deploy
      setStatus("deploying");
      const res = await fetch("/api/deploy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ html, title: currentSpec.title }),
      });

      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as {
          error?: string;
        };
        throw new Error(body.error ?? `Deploy failed (${res.status})`);
      }

      const deployResult = (await res.json()) as DeployResult;
      setResult(deployResult);
      setStatus("live");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Deployment failed");
      setStatus("error");
    }
  }

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-white/50 mb-3">
        Deploy
      </p>

      {status === "idle" && (
        <button
          type="button"
          disabled={!currentSpec}
          onClick={handleDeploy}
          className="w-full rounded-full bg-[#0000c9] px-4 py-2 text-sm font-semibold text-white transition hover:shadow-[0_0_20px_rgba(0,0,201,0.4)] disabled:cursor-not-allowed disabled:opacity-40"
        >
          Deploy to Vercel
        </button>
      )}

      {(status === "generating-html" || status === "deploying") && (
        <div aria-live="polite" className="space-y-3">
          <div className="flex items-center gap-3">
            {["HTML", "Deploy", "Live"].map((step, i) => {
              const activeIdx = status === "generating-html" ? 0 : 1;
              return (
                <div key={step} className="flex items-center gap-2">
                  <div className={`h-2 w-2 rounded-full ${
                    i < activeIdx ? "bg-teal" : i === activeIdx ? "bg-pfizer-blue-accent animate-pulse" : "bg-white/10"
                  }`} />
                  <span className={`text-xs font-mono ${
                    i <= activeIdx ? "text-white/80" : "text-white/30"
                  }`}>{step}</span>
                </div>
              );
            })}
          </div>
          <p className="text-sm text-white/60">
            {status === "generating-html" ? "Generating HTML\u2026" : "Deploying to Vercel\u2026"}
          </p>
        </div>
      )}

      {status === "live" && result && (
        <div className="rounded-xl border border-teal/30 bg-teal/10 p-3 shadow-[0_0_20px_rgba(0,212,170,0.15)]">
          <p className="text-xs font-semibold text-teal mb-1">
            Deployed successfully
          </p>
          <a
            href={result.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-teal underline break-all"
          >
            {result.url}
          </a>
          <p className="text-xs text-white/50 mt-1">
            {new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(result.deployedAt))}
          </p>
          <button
            type="button"
            onClick={() => {
              setStatus("idle");
              setResult(null);
            }}
            className="mt-2 text-xs font-semibold text-teal hover:text-white/90"
          >
            Deploy again
          </button>
        </div>
      )}

      {status === "error" && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3">
          <p className="text-xs font-semibold text-red-400 mb-1">
            Deployment failed
          </p>
          <p className="text-sm text-red-400">{error}</p>
          <button
            type="button"
            onClick={() => {
              setStatus("idle");
              setError(null);
            }}
            className="mt-2 text-xs font-semibold text-red-400 hover:text-red-300"
          >
            Try again
          </button>
        </div>
      )}
    </div>
  );
}

export default DeployPanel;
