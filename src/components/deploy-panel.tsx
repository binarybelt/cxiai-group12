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
    <div className="rounded-2xl border border-gray-200 bg-white p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-3">
        Deploy
      </p>

      {status === "idle" && (
        <button
          type="button"
          disabled={!currentSpec}
          onClick={handleDeploy}
          className="w-full rounded-full bg-pfizer-blue-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-pfizer-blue-800 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Deploy to Vercel
        </button>
      )}

      {status === "generating-html" && (
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-pfizer-blue-700" />
          Generating HTML...
        </div>
      )}

      {status === "deploying" && (
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-pfizer-blue-700" />
          Deploying to Vercel...
        </div>
      )}

      {status === "live" && result && (
        <div className="rounded-xl bg-green-50 border border-green-200 p-3">
          <p className="text-xs font-semibold text-green-700 mb-1">
            Deployed successfully
          </p>
          <a
            href={result.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-green-800 underline break-all"
          >
            {result.url}
          </a>
          <p className="text-xs text-green-600 mt-1">
            {new Date(result.deployedAt).toLocaleString()}
          </p>
          <button
            type="button"
            onClick={() => {
              setStatus("idle");
              setResult(null);
            }}
            className="mt-2 text-xs font-semibold text-green-700 hover:text-green-900"
          >
            Deploy again
          </button>
        </div>
      )}

      {status === "error" && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-3">
          <p className="text-xs font-semibold text-red-700 mb-1">
            Deployment failed
          </p>
          <p className="text-sm text-red-600">{error}</p>
          <button
            type="button"
            onClick={() => {
              setStatus("idle");
              setError(null);
            }}
            className="mt-2 text-xs font-semibold text-red-700 hover:text-red-900"
          >
            Try again
          </button>
        </div>
      )}
    </div>
  );
}

export default DeployPanel;
