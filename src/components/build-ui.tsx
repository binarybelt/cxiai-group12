"use client";

import { useRef, useState } from "react";

import { PageRenderer } from "@/components/page-renderer";
import { ComplianceSidebar } from "@/components/compliance-sidebar";
import { ChatPanel } from "@/components/chat-panel";
import { ExplainabilityPanel } from "@/components/explainability-panel";
import type { BriefInterpretation } from "@/agents/brief-interpreter/schema";
import type { PageSpec } from "@/types/page-spec";
import type { ComplianceViolation } from "@/types/compliance";
import type { DiffResult } from "@/types/diff";

// ---------------------------------------------------------------------------
// BuildUI — client component wiring the full brief-to-page pipeline.
// Phase 1: POST /api/interpret-brief → BriefInterpretation JSON
// Phase 2: POST /api/generate-page → JSON { variants: PageSpec[] }
//          (generateObject — not streaming. Returns 422 on compliance gate failure)
// Phase 4: Chat-to-edit + explainability panel
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
  const [variants, setVariants] = useState<PageSpec[] | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [gateViolations, setGateViolations] =
    useState<ComplianceViolation[] | null>(null);
  const [overrideSpec, setOverrideSpec] = useState<PageSpec | null>(null);

  // Phase 4 state
  /* eslint-disable @typescript-eslint/no-explicit-any */
  const [rawSpec, setRawSpec] = useState<any>(null);
  const [diffResult, setDiffResult] = useState<DiffResult | null>(null);

  // previewRef connects the ComplianceSidebar's axe scanner to the rendered DOM
  const previewRef = useRef<HTMLDivElement>(null);

  // -------------------------------------------------------------------------
  // Derived state
  // -------------------------------------------------------------------------

  // Auto-fix replaces the selected variant's spec immutably via overrideSpec
  const currentSpec = overrideSpec ?? variants?.[selectedVariant] ?? null;

  // -------------------------------------------------------------------------
  // Auto-fix handler
  // -------------------------------------------------------------------------

  function handleAutoFix(fixedSpec: PageSpec) {
    setOverrideSpec(fixedSpec);
    setGateViolations(null); // clear gate violations once user has applied a fix
  }

  // -------------------------------------------------------------------------
  // Chat edit handler
  // -------------------------------------------------------------------------

  function handleChatEdit(newSpec: PageSpec, diff: DiffResult) {
    // Update variants immutably — replace the selected variant with the edited spec
    if (variants) {
      const updatedVariants = [...variants];
      updatedVariants[selectedVariant] = newSpec;
      setVariants(updatedVariants);
    }
    setOverrideSpec(null);
    setDiffResult(diff);
  }

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
    setVariants(null);
    setOverrideSpec(null);
    setGateViolations(null);
    setRawSpec(null);
    setDiffResult(null);

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
        throw new Error(
          body.error ?? `Interpret request failed (${interpretRes.status})`,
        );
      }

      const interp = (await interpretRes.json()) as BriefInterpretation;
      setInterpretation(interp);
      setPhase("generating");
      setIsGenerating(true);

      // Phase 2: generate page spec as JSON (generateObject, not streaming)
      const genRes = await fetch("/api/generate-page", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(interp),
      });

      if (genRes.status === 422) {
        // Compliance gate blocked — show violations and partial spec in sidebar
        const body = (await genRes.json()) as {
          error: string;
          violations: ComplianceViolation[];
          spec?: { variants: PageSpec[] };
        };
        setGateViolations(body.violations);
        if (body.spec?.variants) {
          setVariants(body.spec.variants);
          setRawSpec(body.spec);
        }
        setPhase("error");
        setErrorMsg(
          "Compliance gate blocked rendering. See violations in the sidebar.",
        );
        setIsGenerating(false);
        return;
      }

      if (!genRes.ok) {
        throw new Error(`Generation failed (${genRes.status})`);
      }

      const specResult = (await genRes.json()) as { variants: PageSpec[] };
      setVariants(specResult.variants);
      setRawSpec(specResult);
      setIsGenerating(false);
      setPhase("done");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "An unexpected error occurred";
      setPhase("error");
      setErrorMsg(message);
      setIsGenerating(false);
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
  // Render — 3-column layout: brief | preview | sidebar
  // -------------------------------------------------------------------------

  return (
    <div className="flex flex-1 overflow-hidden">
      <div className="grid flex-1 gap-8 lg:grid-cols-[1fr_2fr_320px]">
        {/* ------------------------------------------------------------------ */}
        {/* Left column: brief input + interpretation + chat edit               */}
        {/* ------------------------------------------------------------------ */}
        <div className="flex flex-col gap-6 overflow-y-auto p-6">
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

          {/* Generic error state */}
          {phase === "error" && errorMsg && (
            <div
              role="alert"
              className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
            >
              <p className="font-semibold">Error</p>
              <p className="mt-1">{errorMsg}</p>
            </div>
          )}

          {/* Compliance gate banner (only when gate failed) */}
          {phase === "error" && gateViolations && (
            <div
              role="alert"
              className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800"
            >
              <p className="font-semibold">Compliance Gate Failed</p>
              <p className="mt-1">
                The generated page has {gateViolations.length} compliance
                violation(s). Review and fix in the sidebar.
              </p>
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
                  {showInterpretation ? "-- Collapse" : "-- Expand"}
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

          {/* Chat edit panel — shown when a spec exists */}
          {currentSpec && (
            <ChatPanel
              currentSpec={currentSpec}
              onEditComplete={handleChatEdit}
            />
          )}
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* Middle column: variant tabs + page preview + explainability          */}
        {/* ------------------------------------------------------------------ */}
        <div className="flex flex-col gap-4 overflow-y-auto p-6">
          {/* Variant tabs */}
          {(variants && variants.length > 0) || isGenerating ? (
            <div className="flex gap-2">
              {(["A", "B"] as const).map((label, idx) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => {
                    setSelectedVariant(idx as 0 | 1);
                    setOverrideSpec(null); // clear override when switching variants
                  }}
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
          {isGenerating && (
            <p className="text-sm text-gray-500">Generating page...</p>
          )}

          {/* Diff summary banner */}
          {diffResult && (
            <div className="flex items-center justify-between rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-800">
              <span>
                Last edit: {diffResult.summary}
              </span>
              <button
                type="button"
                onClick={() => setDiffResult(null)}
                className="ml-2 text-xs font-semibold text-blue-600 hover:text-blue-800"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Page preview — wrapped in previewRef for axe scanner */}
          {currentSpec && (
            <div className="preview-sandbox flex-1 overflow-auto rounded-2xl border border-gray-200 bg-gray-50 p-4">
              <style>{`.preview-sandbox a { pointer-events: none; cursor: default; }`}</style>
              <div ref={previewRef}>
                <PageRenderer spec={currentSpec} />
              </div>
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

          {/* Explainability panel — collapsible, below preview */}
          <ExplainabilityPanel
            rawVariants={rawSpec?.variants ?? null}
            selectedVariant={selectedVariant}
          />
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* Right column: compliance sidebar                                     */}
        {/* ------------------------------------------------------------------ */}
        <ComplianceSidebar
          spec={currentSpec}
          previewRef={previewRef}
          onAutoFix={handleAutoFix}
        />
      </div>
    </div>
  );
}

export default BuildUI;
