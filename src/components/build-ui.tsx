"use client";

import { experimental_useObject as useObject } from "@ai-sdk/react";
import { useState } from "react";
import { z } from "zod";

import { PageRenderer } from "@/components/page-renderer";
import { PageSpecSchema } from "@/types/page-spec";
import type { BriefInterpretation } from "@/agents/brief-interpreter/schema";
import type { PageSpec } from "@/types/page-spec";

// ---------------------------------------------------------------------------
// Schema — wraps two PageSpec variants, matching the server-side output shape.
// We use the base PageSpecSchema here (not constrained) because selectionReason
// is stripped on the server before the stream reaches the client.
// ---------------------------------------------------------------------------

const variantsSchema = z.object({
  variants: z.array(PageSpecSchema),
});

// ---------------------------------------------------------------------------
// BuildUI — client component wiring the full brief-to-page pipeline.
// Phase 1: POST /api/interpret-brief → BriefInterpretation JSON
// Phase 2: useObject POST /api/generate-page → streaming two-variant PageSpec
// ---------------------------------------------------------------------------

type PipelinePhase =
  | "idle"
  | "interpreting"
  | "generating"
  | "done"
  | "error";

export function BuildUI() {
  const [brief, setBrief] = useState("");
  const [phase, setPhase] = useState<PipelinePhase>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [interpretation, setInterpretation] =
    useState<BriefInterpretation | null>(null);
  const [showInterpretation, setShowInterpretation] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<0 | 1>(0);

  // useObject connects to /api/generate-page and streams the two-variant output
  const { object, submit, isLoading: isGenerating } = useObject({
    api: "/api/generate-page",
    schema: variantsSchema,
    onFinish: () => {
      setPhase("done");
    },
    onError: (err: Error) => {
      setPhase("error");
      setErrorMsg(err.message ?? "Generation failed");
    },
  });

  const variants = object?.variants as PageSpec[] | undefined;

  // -------------------------------------------------------------------------
  // Submit handler — two-phase pipeline
  // -------------------------------------------------------------------------

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const trimmedBrief = brief.trim();
    if (!trimmedBrief) return;

    setPhase("interpreting");
    setErrorMsg(null);
    setInterpretation(null);

    try {
      // Phase 1: interpret brief
      const interpretRes = await fetch("/api/interpret-brief", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brief: trimmedBrief }),
      });

      if (!interpretRes.ok) {
        const body = (await interpretRes.json().catch(() => ({}))) as {
          error?: string;
        };
        throw new Error(body.error ?? `Interpret request failed (${interpretRes.status})`);
      }

      const interp = (await interpretRes.json()) as BriefInterpretation;
      setInterpretation(interp);
      setPhase("generating");

      // Phase 2: stream page generation via useObject
      submit(interp);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "An unexpected error occurred";
      setPhase("error");
      setErrorMsg(message);
    }
  }

  // -------------------------------------------------------------------------
  // Derived UI state
  // -------------------------------------------------------------------------

  const isInterpreting = phase === "interpreting";
  const canSubmit = brief.trim().length > 0 && !isInterpreting && !isGenerating;

  const buttonLabel = isInterpreting
    ? "Interpreting..."
    : isGenerating
      ? "Generating..."
      : "Generate";

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  return (
    <div className="grid min-h-screen gap-8 lg:grid-cols-2">
      {/* ------------------------------------------------------------------ */}
      {/* Left column: brief input + interpretation                            */}
      {/* ------------------------------------------------------------------ */}
      <div className="flex flex-col gap-6 p-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label
            htmlFor="brief-input"
            className="text-sm font-semibold text-gray-700"
          >
            Brief
          </label>
          <textarea
            id="brief-input"
            value={brief}
            onChange={(e) => setBrief(e.target.value)}
            placeholder="Describe the page you need. For example: Create an HCP landing page for Lipitor in the US market with efficacy data and safety information."
            rows={8}
            className="w-full resize-y rounded-2xl border border-gray-200 bg-white p-4 text-sm text-gray-800 placeholder:text-gray-400 focus:border-pfizer-blue-500 focus:outline-none focus:ring-2 focus:ring-pfizer-blue-200"
          />
          <button
            type="submit"
            disabled={!canSubmit}
            className="self-start rounded-full bg-pfizer-blue-700 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-pfizer-blue-800 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {buttonLabel}
          </button>
        </form>

        {/* Error state */}
        {phase === "error" && errorMsg && (
          <div
            role="alert"
            className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            <p className="font-semibold">Error</p>
            <p className="mt-1">{errorMsg}</p>
          </div>
        )}

        {/* Interpretation panel */}
        {interpretation && (
          <div className="rounded-2xl border border-gray-200 bg-white">
            <button
              type="button"
              onClick={() => setShowInterpretation((v) => !v)}
              className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-semibold text-gray-700"
            >
              <span>Brief Interpretation</span>
              <span className="text-gray-400">
                {showInterpretation ? "▲ Collapse" : "▼ Expand"}
              </span>
            </button>

            {showInterpretation && (
              <div className="border-t border-gray-100 px-4 pb-4 pt-3">
                <dl className="space-y-2 text-sm">
                  <div>
                    <dt className="font-medium text-gray-500">Page type</dt>
                    <dd className="text-gray-900">{interpretation.pageType}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-gray-500">Market</dt>
                    <dd className="text-gray-900">{interpretation.market}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-gray-500">Product</dt>
                    <dd className="text-gray-900">{interpretation.product}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-gray-500">Audience</dt>
                    <dd className="capitalize text-gray-900">
                      {interpretation.audience}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-medium text-gray-500">
                      Content requirements
                    </dt>
                    <dd>
                      <ul className="list-inside list-disc text-gray-900">
                        {interpretation.contentRequirements.map((req) => (
                          <li key={req}>{req}</li>
                        ))}
                      </ul>
                    </dd>
                  </div>
                  <div>
                    <dt className="font-medium text-gray-500">Reasoning</dt>
                    <dd className="italic text-gray-700">
                      {interpretation.reasoning}
                    </dd>
                  </div>
                </dl>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Right column: variant tabs + page preview                           */}
      {/* ------------------------------------------------------------------ */}
      <div className="flex flex-col gap-4 overflow-auto p-6">
        {/* Variant tabs */}
        {(variants && variants.length > 0) || isGenerating ? (
          <div className="flex gap-2">
            {(["A", "B"] as const).map((label, idx) => (
              <button
                key={label}
                type="button"
                onClick={() => setSelectedVariant(idx as 0 | 1)}
                disabled={isGenerating && !variants?.[idx]}
                className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
                  selectedVariant === idx
                    ? "bg-pfizer-blue-700 text-white"
                    : "border border-gray-200 bg-white text-gray-700 hover:border-pfizer-blue-300"
                } disabled:opacity-40`}
              >
                Variant {label}
              </button>
            ))}
          </div>
        ) : null}

        {/* Loading indicator for generating phase */}
        {isGenerating && !variants?.[selectedVariant] && (
          <p className="text-sm text-gray-500">Generating page...</p>
        )}

        {/* Page preview */}
        {variants?.[selectedVariant] && (
          <div className="flex-1 overflow-auto rounded-2xl border border-gray-200 bg-gray-50 p-4">
            <PageRenderer spec={variants[selectedVariant]} />
          </div>
        )}

        {/* Idle state placeholder */}
        {phase === "idle" && (
          <div className="flex flex-1 items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-gray-50">
            <p className="text-sm text-gray-400">
              Enter a brief on the left and click Generate to see a live page
              preview here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default BuildUI;
