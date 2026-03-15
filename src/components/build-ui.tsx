"use client";

import { useEffect, useRef, useState } from "react";

import { PageRenderer } from "@/components/page-renderer";
import { ComplianceSidebar } from "@/components/compliance-sidebar";
import { ChatPanel } from "@/components/chat-panel";
import { DeployPanel } from "@/components/deploy-panel";
import { ExplainabilityPanel } from "@/components/explainability-panel";
import { AuditTrail } from "@/components/audit-trail";
import { computeScore, runBrandChecks, runPharmaChecks } from "@/lib/compliance";
import { generateComplianceReport } from "@/lib/compliance-report";
import { createAuditEntry } from "@/lib/audit-chain";
import { addAuditEntry, clearAuditEntries } from "@/lib/audit-chain-store";
import type { BriefInterpretation } from "@/agents/brief-interpreter/schema";
import type { PageSpec } from "@/types/page-spec";
import type { ComplianceViolation } from "@/types/compliance";
import type { DiffResult } from "@/types/diff";
import { GuideCard } from "@/components/guide-card";

// ---------------------------------------------------------------------------
// BuildUI — client component wiring the full brief-to-page pipeline.
// Phase 1: POST /api/interpret-brief → BriefInterpretation JSON
// Phase 2: POST /api/generate-page → JSON { variants: PageSpec[] }
//          (generateObject — not streaming. Returns 422 on compliance gate failure)
// Phase 4: Chat-to-edit + explainability panel + role-based views
// ---------------------------------------------------------------------------

type PipelinePhase =
  | "idle"
  | "interpreting"
  | "generating"
  | "done"
  | "error";

type ActiveRole = "marketer" | "qa" | "developer";

const ROLE_LABELS: { key: ActiveRole; label: string }[] = [
  { key: "marketer", label: "Marketer" },
  { key: "qa", label: "QA" },
  { key: "developer", label: "Developer" },
];

const EXAMPLE_BRIEFS = [
  {
    label: "HCP Landing -- Ibrance UK",
    text: "Create an HCP landing page for Ibrance in the UK market. Include new efficacy data, patient support resources, and a strong call-to-action for HCP registration.",
  },
  {
    label: "Patient Education -- Paxlovid US",
    text: "Create a patient education page for Paxlovid in the US market. Include how the medication works, eligibility criteria, and where to get it. Emphasize accessibility.",
  },
  {
    label: "Safety Update -- Eliquis EU",
    text: "Create a safety update page for Eliquis in the EU market. Include updated bleeding risk data, dosage adjustments for renal impairment, and emergency contact information.",
  },
];

export function BuildUI() {
  const [brief, setBrief] = useState("");
  const [phase, setPhase] = useState<PipelinePhase>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [interpretation, setInterpretation] =
    useState<BriefInterpretation | null>(null);
  const [showInterpretation, setShowInterpretation] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState<0 | 1>(0);
  const [variants, setVariants] = useState<PageSpec[] | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [gateViolations, setGateViolations] =
    useState<ComplianceViolation[] | null>(null);
  const [overrideSpec, setOverrideSpec] = useState<PageSpec | null>(null);

  // Phase 4 state
  const [rawSpec, setRawSpec] = useState<Record<string, unknown> | null>(null);
  const [diffResult, setDiffResult] = useState<DiffResult | null>(null);
  const [activeRole, setActiveRole] = useState<ActiveRole>("marketer");

  // Generation timer state
  const [generationStartTime, setGenerationStartTime] = useState<number | null>(null);
  const [generationDuration, setGenerationDuration] = useState<number | null>(null);

  // previewRef connects the ComplianceSidebar's axe scanner to the rendered DOM
  const previewRef = useRef<HTMLDivElement>(null);

  // Record generation duration when phase transitions to "done"
  useEffect(() => {
    if (phase === "done" && generationStartTime !== null) {
      const elapsed = (Date.now() - generationStartTime) / 1000;
      setGenerationDuration(elapsed);
      setGenerationStartTime(null);
    }
  }, [phase, generationStartTime]);

  // -------------------------------------------------------------------------
  // Derived state
  // -------------------------------------------------------------------------

  // Auto-fix replaces the selected variant's spec immutably via overrideSpec
  const currentSpec = overrideSpec ?? variants?.[selectedVariant] ?? null;

  // Compute a simplified overall score for the marketer badge
  const overallScore = currentSpec
    ? computeScore(runBrandChecks(currentSpec), runPharmaChecks(currentSpec), []).overall
    : 0;

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
    setGenerationStartTime(Date.now());
    setGenerationDuration(null);

    clearAuditEntries();
    let previousHash = "0000000000000000000000000000000000000000000000000000000000000000"; // genesis

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

      const interpretEntry = await createAuditEntry(
        1, "interpret-brief", "brief-interpreter-agent",
        trimmedBrief, JSON.stringify(interp).slice(0, 500), previousHash,
      );
      addAuditEntry(interpretEntry);
      previousHash = interpretEntry.entryHash;

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
          setRawSpec(body.spec as unknown as Record<string, unknown>);
        }

        const failGenEntry = await createAuditEntry(
          2, "generate-page", "component-selector-agent",
          JSON.stringify(interp).slice(0, 500),
          JSON.stringify(body.spec ?? {}).slice(0, 500),
          previousHash,
        );
        addAuditEntry(failGenEntry);
        previousHash = failGenEntry.entryHash;

        const failGateEntry = await createAuditEntry(
          3, "compliance-gate", "deterministic-engine",
          JSON.stringify(body.spec ?? {}).slice(0, 500),
          `FAILED -- ${body.violations.length} violation(s): ${body.violations.map((v) => v.message).join("; ").slice(0, 400)}`,
          previousHash,
        );
        addAuditEntry(failGateEntry);

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
      setRawSpec(specResult as unknown as Record<string, unknown>);

      const generateEntry = await createAuditEntry(
        2, "generate-page", "component-selector-agent",
        JSON.stringify(interp).slice(0, 500),
        JSON.stringify(specResult).slice(0, 500),
        previousHash,
      );
      addAuditEntry(generateEntry);
      previousHash = generateEntry.entryHash;

      const gateEntry = await createAuditEntry(
        3, "compliance-gate", "deterministic-engine",
        JSON.stringify(specResult).slice(0, 500),
        "PASSED -- all variants compliant",
        previousHash,
      );
      addAuditEntry(gateEntry);

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
  // Score badge color helper
  // -------------------------------------------------------------------------

  const scoreBadgeColor =
    overallScore > 80
      ? "text-green-600"
      : overallScore > 60
        ? "text-yellow-500"
        : "text-red-500";

  // -------------------------------------------------------------------------
  // Render — role toggle + 3-column layout: left | preview | right
  // -------------------------------------------------------------------------

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Role toggle bar */}
      <div className="flex items-center gap-2 border-b border-gray-200 bg-white px-6 py-2">
        {ROLE_LABELS.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => setActiveRole(key)}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
              activeRole === key
                ? "bg-pfizer-blue-700 text-white"
                : "border border-gray-200 bg-white text-gray-700 hover:border-pfizer-blue-300"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* 3-column grid — structure constant across all roles */}
      <div className="grid flex-1 gap-8 overflow-hidden lg:grid-cols-[1fr_2fr_320px]">
        {/* ------------------------------------------------------------------ */}
        {/* Left column — content changes by role                               */}
        {/* ------------------------------------------------------------------ */}
        <div className="flex flex-col gap-6 overflow-y-auto p-6">
          {/* ---- Marketer left: brief form + interpretation + chat ---------- */}
          {activeRole === "marketer" && (
            <>
              <GuideCard
                title="Brief Interpretation with Risk Pre-screening"
                brief="Brief: 'Interpreting a brief and selecting design-system components'"
                explanation="The AI interprets your natural language brief into structured requirements, flags compliance risks before generation starts, and maps to approved components only. Every component selection includes a reason."
                criterion="Creative Use of AI"
              />
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

                {/* Example brief buttons */}
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs text-gray-400">Examples:</span>
                  {EXAMPLE_BRIEFS.map((example) => (
                    <button
                      key={example.label}
                      type="button"
                      onClick={() => setBrief(example.text)}
                      className="rounded-full border border-gray-200 px-3 py-1 text-xs text-gray-600 transition hover:border-pfizer-blue-300 hover:text-pfizer-blue-700"
                    >
                      {example.label}
                    </button>
                  ))}
                </div>
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
                        {interpretation.riskFlags && interpretation.riskFlags.length > 0 && (
                          <div>
                            <dt className="font-medium text-gray-500">Risk Flags</dt>
                            <dd>
                              <ul className="mt-1 flex flex-col gap-1">
                                {interpretation.riskFlags.map((rf, idx) => (
                                  <li
                                    key={idx}
                                    className={`rounded-lg px-2 py-1 text-xs ${
                                      rf.severity === "high"
                                        ? "bg-red-50 text-red-700"
                                        : rf.severity === "medium"
                                          ? "bg-amber-50 text-amber-700"
                                          : "bg-yellow-50 text-yellow-700"
                                    }`}
                                  >
                                    <span className="font-semibold">{rf.severity.toUpperCase()}</span>: {rf.detail}
                                  </li>
                                ))}
                              </ul>
                            </dd>
                          </div>
                        )}
                      </dl>
                    </div>
                  )}
                </div>
              )}

              {/* Chat edit panel — shown when a spec exists */}
              {currentSpec && (
                <GuideCard
                  title="Chat-to-Edit with Safety Protocol"
                  brief="Brief: 'Enabling natural language content updates'"
                  explanation="Edit the page via natural language. The AI has a Safety Protocol: it will never remove ISI blocks, disclaimers, or adverse event links, even if instructed to. Try the challenge prompts below to test it."
                  criterion="Trust, Compliance & Explainability"
                />
              )}
              {currentSpec && (
                <ChatPanel
                  currentSpec={currentSpec}
                  onEditComplete={handleChatEdit}
                />
              )}
            </>
          )}

          {/* ---- QA left: gate violations + audit trail -------------------- */}
          {activeRole === "qa" && (
            <>
              {gateViolations && gateViolations.length > 0 && (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
                    Gate Violations ({gateViolations.length})
                  </p>
                  <ul className="mt-2 flex flex-col gap-1">
                    {gateViolations.map((v, idx) => (
                      <li key={`${v.ruleId}-${idx}`} className="text-xs text-amber-800">
                        {v.message}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <AuditTrail />
              <button
                type="button"
                onClick={() => {
                  if (!currentSpec) return;
                  const html = generateComplianceReport(currentSpec);
                  const blob = new Blob([html], { type: "text/html" });
                  const url = URL.createObjectURL(blob);
                  window.open(url, "_blank");
                }}
                className="w-full rounded-full border border-pfizer-blue-200 bg-pfizer-blue-50 px-4 py-2 text-sm font-semibold text-pfizer-blue-700 transition hover:bg-pfizer-blue-100"
              >
                Export Compliance Report
              </button>
            </>
          )}

          {/* ---- Developer left: component spec list ----------------------- */}
          {activeRole === "developer" && (
            <>
              {currentSpec ? (
                <div className="rounded-2xl border border-gray-200 bg-white p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Component Specs
                  </p>
                  <ul className="mt-2 flex flex-col gap-2">
                    {currentSpec.sections.flatMap((section) =>
                      section.components.map((comp, idx) => (
                        <li
                          key={`${section.id}-${comp.componentId}-${idx}`}
                          className="rounded-lg bg-gray-50 px-3 py-2"
                        >
                          <p className="text-xs font-semibold text-gray-800">
                            {comp.componentId}
                          </p>
                          <p className="text-xs text-gray-500">
                            Props: {Object.keys(comp.props).join(", ") || "none"}
                          </p>
                        </li>
                      )),
                    )}
                  </ul>
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-4">
                  <p className="text-sm text-gray-400">
                    Generate a page to see the code output
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* Middle column: variant tabs + page preview + explainability         */}
        {/* Always the same regardless of role                                  */}
        {/* ------------------------------------------------------------------ */}
        <div className="flex flex-col gap-4 overflow-y-auto p-6">
          <GuideCard
            title="Constrained Generation + Compliance Gate"
            brief="Brief: 'Running automated quality checks'"
            explanation="Two layers of protection: (1) Zod enum schemas physically restrict the AI to approved component IDs and token IDs at generation time. (2) A deterministic compliance gate runs 13 rules (brand, pharma, accessibility) before rendering. No LLM judgment in pass/fail — pure functions only."
            criterion="Trust, Compliance & Explainability"
          />

          {/* Variant tabs + generation timer */}
          {(variants && variants.length > 0) || isGenerating ? (
            <div className="flex items-center gap-2">
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
              {generationDuration !== null && (
                <span className="ml-auto rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                  Brief to compliant page: {generationDuration.toFixed(1)}s
                </span>
              )}
            </div>
          ) : null}

          {/* Loading skeleton for generating phase */}
          {isGenerating && (
            <div className="flex flex-col gap-4">
              <div className="h-48 animate-pulse rounded-2xl bg-gray-200" />
              <div className="grid grid-cols-2 gap-4">
                <div className="h-24 animate-pulse rounded-xl bg-gray-200" />
                <div className="h-24 animate-pulse rounded-xl bg-gray-200" />
              </div>
              <div className="flex flex-col gap-2">
                <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200" />
                <div className="h-4 w-1/2 animate-pulse rounded bg-gray-200" />
                <div className="h-4 w-2/3 animate-pulse rounded bg-gray-200" />
              </div>
              <div className="h-16 animate-pulse rounded-xl bg-gray-200" />
              <p className="text-center text-sm text-gray-500">
                {phase === "interpreting" ? "Interpreting brief..." : "Generating compliant page..."}
              </p>
            </div>
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

          {/* Deploy panel — shown when a spec exists */}
          {currentSpec && <DeployPanel currentSpec={currentSpec} />}

          {/* Explainability panel — collapsible, below preview (prominent in marketer view) */}
          <ExplainabilityPanel
            rawVariants={(rawSpec as Record<string, unknown> | null)?.variants as unknown[] | null ?? null}
            selectedVariant={selectedVariant}
          />
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* Right column — content changes by role                              */}
        {/* ------------------------------------------------------------------ */}

        {/* Marketer right: score badge + breakdown + top issues */}
        {activeRole === "marketer" && (
          <aside className="flex flex-col gap-4 overflow-y-auto border-l border-gray-200 bg-gray-50 p-4">
            <div className="rounded-2xl border border-gray-200 bg-white p-6 text-center">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Compliance Score
              </p>
              <p data-testid="score-badge" className={`mt-2 text-5xl font-bold tabular-nums ${scoreBadgeColor}`}>
                {overallScore}
              </p>
            </div>
            {currentSpec && (() => {
              const brandV = runBrandChecks(currentSpec);
              const pharmaV = runPharmaChecks(currentSpec);
              const brandScore = computeScore(brandV, [], []).brand;
              const pharmaScore = computeScore([], pharmaV, []).pharma;
              const allViolations = [...brandV, ...pharmaV];
              const errors = allViolations.filter(v => v.severity === "error");
              return (
                <>
                  <div className="rounded-2xl border border-gray-200 bg-white p-4">
                    <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">Breakdown</p>
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Brand</span>
                        <span className={`font-semibold ${brandScore === 100 ? "text-green-600" : "text-amber-600"}`}>{brandScore}</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-gray-100">
                        <div className="h-1.5 rounded-full bg-green-500" style={{ width: `${brandScore}%` }} />
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Pharma</span>
                        <span className={`font-semibold ${pharmaScore === 100 ? "text-green-600" : "text-amber-600"}`}>{pharmaScore}</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-gray-100">
                        <div className="h-1.5 rounded-full bg-green-500" style={{ width: `${pharmaScore}%` }} />
                      </div>
                    </div>
                  </div>
                  {errors.length > 0 && (
                    <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-red-600">
                        Top Issues ({errors.length})
                      </p>
                      <ul className="flex flex-col gap-1">
                        {errors.slice(0, 3).map((v, i) => (
                          <li key={i} className="text-xs text-red-700">• {v.message}</li>
                        ))}
                      </ul>
                      <button
                        type="button"
                        onClick={() => setActiveRole("qa")}
                        className="mt-2 text-xs font-semibold text-red-600 hover:text-red-800"
                      >
                        Switch to QA view →
                      </button>
                    </div>
                  )}
                  {errors.length === 0 && allViolations.length === 0 && (
                    <div className="rounded-2xl border border-green-200 bg-green-50 p-4 text-center">
                      <p className="text-sm font-semibold text-green-700">All checks passed</p>
                    </div>
                  )}
                </>
              );
            })()}
            {!currentSpec && (
              <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-4">
                <p className="text-sm text-gray-400 text-center">Generate a page to see compliance details</p>
              </div>
            )}
          </aside>
        )}

        {/* QA right: full compliance sidebar */}
        {activeRole === "qa" && (
          <ComplianceSidebar
            spec={currentSpec}
            previewRef={previewRef}
            onAutoFix={handleAutoFix}
          />
        )}

        {/* Developer right: JSON code block */}
        {activeRole === "developer" && (
          <aside className="flex flex-col gap-4 overflow-y-auto border-l border-gray-200 bg-gray-50 p-4">
            {currentSpec ? (
              <div className="flex flex-col gap-2 overflow-y-auto rounded-2xl border border-gray-200 bg-gray-900 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  PageSpec JSON
                </p>
                <pre className="overflow-x-auto text-xs text-green-400">
                  <code>{JSON.stringify(currentSpec, null, 2)}</code>
                </pre>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-4">
                <p className="text-sm text-gray-400">
                  Generate a page to see the code output
                </p>
              </div>
            )}
          </aside>
        )}
      </div>
    </div>
  );
}

export default BuildUI;
