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
      ? "text-teal"
      : overallScore > 60
        ? "text-yellow-400"
        : "text-red-400";

  // -------------------------------------------------------------------------
  // Render — role toggle + 3-column layout: left | preview | right
  // -------------------------------------------------------------------------

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-[#0C0A12] text-white">
      {/* Role toggle bar */}
      <div className="flex items-center gap-2 border-b border-white/[0.06] bg-white/[0.03] backdrop-blur-sm px-6 py-2">
        {ROLE_LABELS.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => setActiveRole(key)}
            className={`rounded-full px-4 py-1.5 text-sm font-display font-semibold transition ${
              activeRole === key
                ? "bg-brand-accent text-white shadow-[0_0_12px_rgba(167,139,250,0.3)]"
                : "border border-white/[0.08] bg-white/[0.03] text-white/55 hover:border-white/[0.16] hover:text-white/90"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* 3-column grid — structure constant across all roles */}
      <div className="grid flex-1 gap-4 overflow-hidden md:grid-cols-[1fr_2fr] lg:grid-cols-[1fr_2fr_320px]">
        {/* ------------------------------------------------------------------ */}
        {/* Left column — content changes by role                               */}
        {/* ------------------------------------------------------------------ */}
        <div className="flex flex-col gap-6 overflow-y-auto bg-white/[0.02] p-6">
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
                  className="text-sm font-display font-semibold text-white/70"
                >
                  Brief
                </label>
                <textarea
                  id="brief-input"
                  value={brief}
                  onChange={(e) => setBrief(e.target.value)}
                  placeholder="Describe the page you need. For example: Create an HCP landing page for Lipitor in the US market with efficacy data and safety information."
                  rows={8}
                  className="w-full resize-y rounded-2xl border border-white/[0.08] bg-white/[0.05] p-4 text-sm text-white placeholder:text-white/35 focus:border-brand-accent focus:outline-none focus:ring-2 focus:ring-brand-accent/30"
                />
                <button
                  type="submit"
                  disabled={!canSubmit}
                  className="self-start rounded-full bg-brand-700 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent focus-visible:ring-offset-2 focus-visible:ring-offset-[#0C0A12] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {buttonLabel}
                </button>

                {/* Example brief buttons */}
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs text-white/55">Examples:</span>
                  {EXAMPLE_BRIEFS.map((example) => (
                    <button
                      key={example.label}
                      type="button"
                      onClick={() => setBrief(example.text)}
                      className="rounded-full border border-white/[0.08] px-3 py-1 text-xs text-white/55 transition hover:border-white/[0.16] hover:text-white/90"
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
                  className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400"
                >
                  <p className="font-semibold">Error</p>
                  <p className="mt-1">{errorMsg}</p>
                </div>
              )}

              {/* Compliance gate banner (only when gate failed) */}
              {phase === "error" && gateViolations && (
                <div
                  role="alert"
                  className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-400"
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
                <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04]">
                  <button
                    type="button"
                    onClick={() => setShowInterpretation((v) => !v)}
                    className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-semibold text-white/70"
                  >
                    <span>Brief Interpretation</span>
                    <span className="text-white/55">
                      {showInterpretation ? "-- Collapse" : "-- Expand"}
                    </span>
                  </button>

                  {showInterpretation && (
                    <div className="border-t border-white/[0.08] px-4 pb-4 pt-3">
                      <dl className="space-y-2 text-sm">
                        <div>
                          <dt className="font-medium text-white/55">Page type</dt>
                          <dd className="text-white">{interpretation.pageType}</dd>
                        </div>
                        <div>
                          <dt className="font-medium text-white/55">Market</dt>
                          <dd className="text-white">{interpretation.market}</dd>
                        </div>
                        <div>
                          <dt className="font-medium text-white/55">Product</dt>
                          <dd className="text-white">{interpretation.product}</dd>
                        </div>
                        <div>
                          <dt className="font-medium text-white/55">Audience</dt>
                          <dd className="capitalize text-white">
                            {interpretation.audience}
                          </dd>
                        </div>
                        <div>
                          <dt className="font-medium text-white/55">
                            Content requirements
                          </dt>
                          <dd>
                            <ul className="list-inside list-disc text-white">
                              {interpretation.contentRequirements.map((req) => (
                                <li key={req}>{req}</li>
                              ))}
                            </ul>
                          </dd>
                        </div>
                        <div>
                          <dt className="font-medium text-white/55">Reasoning</dt>
                          <dd className="italic text-white/70">
                            {interpretation.reasoning}
                          </dd>
                        </div>
                        {interpretation.riskFlags && interpretation.riskFlags.length > 0 && (
                          <div>
                            <dt className="font-medium text-white/55">Risk Flags</dt>
                            <dd>
                              <ul className="mt-1 flex flex-col gap-1">
                                {interpretation.riskFlags.map((rf, idx) => (
                                  <li
                                    key={idx}
                                    className={`rounded-lg px-2 py-1 text-xs ${
                                      rf.severity === "high"
                                        ? "bg-red-500/10 text-red-400"
                                        : rf.severity === "medium"
                                          ? "bg-amber-500/10 text-amber-400"
                                          : "bg-yellow-500/10 text-yellow-400"
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
                <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-amber-400">
                    Gate Violations ({gateViolations.length})
                  </p>
                  <ul className="mt-2 flex flex-col gap-1">
                    {gateViolations.map((v, idx) => (
                      <li key={`${v.ruleId}-${idx}`} className="text-xs text-amber-400">
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
                className="w-full rounded-full border border-brand-accent/30 bg-brand-accent/10 px-4 py-2 text-sm font-semibold text-brand-accent transition hover:bg-brand-accent/20"
              >
                Export Compliance Report
              </button>
            </>
          )}

          {/* ---- Developer left: component spec list ----------------------- */}
          {activeRole === "developer" && (
            <>
              {currentSpec ? (
                <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-white/55">
                    Component Specs
                  </p>
                  <ul className="mt-2 flex flex-col gap-2">
                    {currentSpec.sections.flatMap((section) =>
                      section.components.map((comp, idx) => (
                        <li
                          key={`${section.id}-${comp.componentId}-${idx}`}
                          className="rounded-lg bg-white/[0.03] px-3 py-2"
                        >
                          <p className="text-xs font-semibold text-white">
                            {comp.componentId}
                          </p>
                          <p className="text-xs text-white/55">
                            Props: {Object.keys(comp.props).join(", ") || "none"}
                          </p>
                        </li>
                      )),
                    )}
                  </ul>
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-white/[0.08] bg-white/[0.02] p-4">
                  <p className="text-sm text-white/55">
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
                  className={`rounded-full px-4 py-1.5 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0C0A12] ${
                    selectedVariant === idx
                      ? "bg-brand-accent text-white shadow-[0_0_12px_rgba(167,139,250,0.3)]"
                      : "border border-white/[0.08] bg-white/[0.03] text-white/55 hover:border-white/[0.16] hover:text-white/90"
                  } disabled:opacity-40`}
                >
                  Variant {label}
                </button>
              ))}
              {generationDuration !== null && (
                <span className="ml-auto rounded-full bg-teal/10 px-3 py-1 text-xs font-semibold text-teal">
                  Brief to compliant page: {generationDuration.toFixed(1)}s
                </span>
              )}
            </div>
          ) : null}

          {/* Pipeline steps indicator */}
          {(phase === "interpreting" || phase === "generating") && (
            <div className="flex items-center gap-3 px-2">
              {["Interpret", "Generate", "Comply", "Render"].map((step, i) => {
                const activeIdx = phase === "interpreting" ? 0 : 1;
                const isActive = i === activeIdx;
                const isDone = i < activeIdx;
                return (
                  <div key={step} className="flex items-center gap-2">
                    <div className={`h-2.5 w-2.5 rounded-full ${
                      isDone ? "bg-teal" : isActive ? "bg-brand-accent animate-pulse shadow-[0_0_8px_rgba(167,139,250,0.5)]" : "bg-white/10"
                    }`} />
                    <span className={`text-xs font-mono ${
                      isDone ? "text-teal" : isActive ? "text-white" : "text-white/30"
                    }`}>{step}</span>
                    {i < 3 && <div className={`h-px w-8 ${isDone ? "bg-teal/50" : "bg-white/10"}`} />}
                  </div>
                );
              })}
            </div>
          )}

          {/* Loading skeleton for generating phase */}
          {isGenerating && (
            <div className="flex flex-col gap-4">
              <div className="h-48 skeleton-shimmer bg-white/[0.04] rounded-2xl" />
              <div className="grid grid-cols-2 gap-4">
                <div className="h-24 skeleton-shimmer bg-white/[0.04] rounded-xl" />
                <div className="h-24 skeleton-shimmer bg-white/[0.04] rounded-xl" />
              </div>
              <div className="flex flex-col gap-2">
                <div className="h-4 w-3/4 skeleton-shimmer bg-white/[0.04] rounded" />
                <div className="h-4 w-1/2 skeleton-shimmer bg-white/[0.04] rounded" />
                <div className="h-4 w-2/3 skeleton-shimmer bg-white/[0.04] rounded" />
              </div>
              <div className="h-16 skeleton-shimmer bg-white/[0.04] rounded-xl" />
              <p className="text-center text-sm text-white/55">
                {phase === "interpreting" ? "Interpreting brief..." : "Generating compliant page..."}
              </p>
            </div>
          )}

          {/* Diff summary banner */}
          {diffResult && (
            <div className="flex items-center justify-between rounded-xl border border-brand-accent/30 bg-brand-accent/10 px-4 py-2 text-sm text-brand-accent">
              <span>
                Last edit: {diffResult.summary}
              </span>
              <button
                type="button"
                onClick={() => setDiffResult(null)}
                className="ml-2 text-xs font-semibold text-brand-accent hover:text-white"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Page preview — browser-frame wrapper with previewRef on inner div */}
          {currentSpec && (
            <div className="flex-1 overflow-hidden rounded-xl border border-white/[0.08] bg-[#161420]">
              {/* Browser frame chrome */}
              <div className="flex items-center gap-2 border-b border-white/[0.06] bg-white/[0.03] px-4 py-2">
                <div className="flex gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
                  <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
                  <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
                </div>
                <div className="flex-1 rounded-md bg-white/[0.05] px-3 py-1 text-xs text-white/35 font-mono">
                  pfizer.com/{currentSpec.product?.toLowerCase() ?? "page"}
                </div>
              </div>
              {/* Actual preview — ref MUST be on this inner div */}
              <div className="preview-sandbox overflow-auto bg-white p-4">
                <style>{`.preview-sandbox a { pointer-events: none; cursor: default; }`}</style>
                <div ref={previewRef}>
                  <PageRenderer spec={currentSpec} />
                </div>
              </div>
            </div>
          )}

          {/* Idle state placeholder */}
          {phase === "idle" && (
            <div className="flex flex-1 items-center justify-center rounded-2xl border border-dashed border-white/[0.08] bg-white/[0.02]">
              <p className="text-sm text-white/55">
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
          <aside className="flex flex-col gap-4 overflow-y-auto bg-white/[0.02] border-l border-white/[0.06] p-4">
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-6 text-center">
              <p className="text-xs font-display font-semibold uppercase tracking-wide text-white/55">
                Compliance Score
              </p>
              <div data-testid="score-badge" className="mt-2">
                <svg className="mx-auto" width="120" height="120" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="45" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
                  <circle
                    cx="60" cy="60" r="45" fill="none"
                    stroke={overallScore > 80 ? "#00D4AA" : overallScore > 60 ? "#FFD166" : "#DC2626"}
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray="283"
                    strokeDashoffset={283 - (283 * overallScore) / 100}
                    className="animate-gauge-fill"
                    transform="rotate(-90 60 60)"
                  />
                  <text x="60" y="60" textAnchor="middle" dominantBaseline="central"
                    className="fill-white font-mono text-2xl font-bold">
                    {overallScore}
                  </text>
                </svg>
              </div>
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
                  <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-4">
                    <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-white/55">Breakdown</p>
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-white/55">Brand</span>
                        <span className={`font-semibold ${brandScore === 100 ? "text-teal" : "text-amber-400"}`}>{brandScore}</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-white/[0.06]">
                        <div className="h-1.5 rounded-full bg-teal" style={{ width: `${brandScore}%` }} />
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-white/55">Pharma</span>
                        <span className={`font-semibold ${pharmaScore === 100 ? "text-teal" : "text-amber-400"}`}>{pharmaScore}</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-white/[0.06]">
                        <div className="h-1.5 rounded-full bg-teal" style={{ width: `${pharmaScore}%` }} />
                      </div>
                    </div>
                  </div>
                  {errors.length > 0 && (
                    <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4">
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-red-400">
                        Top Issues ({errors.length})
                      </p>
                      <ul className="flex flex-col gap-1">
                        {errors.slice(0, 3).map((v, i) => (
                          <li key={i} className="text-xs text-red-400">{"\u2022"} {v.message}</li>
                        ))}
                      </ul>
                      <button
                        type="button"
                        onClick={() => setActiveRole("qa")}
                        className="mt-2 text-xs font-semibold text-red-400 hover:text-red-300"
                      >
                        Switch to QA view &rarr;
                      </button>
                    </div>
                  )}
                  {errors.length === 0 && allViolations.length === 0 && (
                    <div className="rounded-2xl border border-teal/30 bg-teal/10 p-4 text-center">
                      <p className="text-sm font-semibold text-teal">All checks passed</p>
                    </div>
                  )}
                </>
              );
            })()}
            {!currentSpec && (
              <div className="rounded-2xl border border-dashed border-white/[0.08] bg-white/[0.02] p-4">
                <p className="text-sm text-white/55 text-center">Generate a page to see compliance details</p>
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
          <aside className="flex flex-col gap-4 overflow-y-auto bg-white/[0.02] border-l border-white/[0.06] p-4">
            {currentSpec ? (
              <div className="flex flex-col gap-2 overflow-y-auto rounded-2xl border border-white/[0.08] bg-white/[0.04] p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-white/55">
                  PageSpec JSON
                </p>
                <pre className="overflow-x-auto text-xs text-teal">
                  <code>{JSON.stringify(currentSpec, null, 2)}</code>
                </pre>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-white/[0.08] bg-white/[0.02] p-4">
                <p className="text-sm text-white/55">
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
