"use client";

import { useEffect, useRef, useState } from "react";

import {
  runBrandChecks,
  runPharmaChecks,
  computeScore,
  applyAutoFix,
} from "@/lib/compliance";
import type { A11yViolation } from "@/lib/axe-scanner";
import type { ComplianceViolation, ComplianceScore } from "@/types/compliance";
import type { PageSpec } from "@/types/page-spec";
import { GuideCard } from "@/components/guide-card";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ComplianceSidebarProps {
  spec: PageSpec | null;
  previewRef: React.RefObject<HTMLDivElement | null>;
  onAutoFix: (fixedSpec: PageSpec) => void;
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function ScoreBar({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  const color =
    value >= 80 ? "bg-teal" : value >= 50 ? "bg-amber-400" : "bg-red-500";

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between text-xs font-medium text-white/60">
        <span>{label}</span>
        <span>{value}</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
        <div
          className={`h-full rounded-full ${color} animate-bar-fill origin-left`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

function SeverityDot({ severity }: { severity: "error" | "warning" | "info" }) {
  const color =
    severity === "error"
      ? "bg-red-500"
      : severity === "warning"
        ? "bg-amber-400"
        : "bg-brand-accent/60";
  return (
    <span className={`mt-1 inline-block h-2 w-2 flex-shrink-0 rounded-full ${color}`} />
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function ComplianceSidebar({
  spec,
  previewRef,
  onAutoFix,
}: ComplianceSidebarProps) {
  const [brandViolations, setBrandViolations] = useState<ComplianceViolation[]>([]);
  const [pharmaViolations, setPharmaViolations] = useState<ComplianceViolation[]>([]);
  const [a11yViolations, setA11yViolations] = useState<A11yViolation[]>([]);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Run synchronous brand + pharma checks whenever spec changes
  useEffect(() => {
    if (!spec) {
      setBrandViolations([]);
      setPharmaViolations([]);
      return;
    }
    setBrandViolations(runBrandChecks(spec));
    setPharmaViolations(runPharmaChecks(spec));
  }, [spec]);

  // Run async axe scan (browser-only, debounced) when spec or previewRef changes
  useEffect(() => {
    if (!spec) {
      setA11yViolations([]);
      return;
    }

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(async () => {
      const container = previewRef.current;
      if (!container) return;

      try {
        // Dynamic import keeps axe-core out of the server bundle
        const { scanForA11yViolations } = await import("@/lib/axe-scanner");
        const violations = await scanForA11yViolations(container);
        setA11yViolations(violations);
      } catch {
        // axe scan failure is non-fatal — leave previous violations in place
      }
    }, 600);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [spec, previewRef]);

  // Null spec state
  if (!spec) {
    return (
      <aside className="flex flex-col gap-4 border-l border-white/[0.06] bg-white/[0.02] p-4">
        <p className="text-sm text-white/40">
          Generate a page to see compliance results
        </p>
      </aside>
    );
  }

  // computeScore accepts a11y violations as { length: number }[] to stay decoupled
  // from the specific a11y tool — we map each A11yViolation to satisfy the contract.
  const a11yForScore = a11yViolations.map((v) => ({ length: v.nodes.length }));
  const score: ComplianceScore = computeScore(
    brandViolations,
    pharmaViolations,
    a11yForScore,
  );

  const overallColor =
    score.overall >= 80
      ? "text-teal"
      : score.overall >= 50
        ? "text-amber-400"
        : "text-red-500";

  const allViolations = [
    ...brandViolations.map((v) => ({ ...v, _source: "brand" as const })),
    ...pharmaViolations.map((v) => ({ ...v, _source: "pharma" as const })),
  ];

  const a11yAsViolations = a11yViolations.map((v) => ({
    ruleId: v.id,
    category: "accessibility" as const,
    severity: (v.impact === "critical" || v.impact === "serious"
      ? "error"
      : "warning") as "error" | "warning",
    message: v.help,
    autoFixable: false,
    location: { sectionId: "page-level" },
    _source: "accessibility" as const,
  }));

  const groupedViolations: Record<string, typeof allViolations> = {};
  for (const v of [...allViolations, ...a11yAsViolations]) {
    const group = v._source;
    if (!groupedViolations[group]) groupedViolations[group] = [];
    groupedViolations[group].push(v as (typeof allViolations)[number]);
  }

  const totalViolations = allViolations.length + a11yAsViolations.length;
  const categoryLabels: Record<string, string> = {
    brand: "Brand",
    pharma: "Pharma",
    accessibility: "Accessibility",
  };

  return (
    <aside className="flex flex-col gap-4 overflow-y-auto border-l border-white/[0.06] bg-white/[0.02] p-4">
      <GuideCard
        title="Real-Time Compliance Engine"
        brief="Stretch goal: 'Automated Quality & Compliance — audit mode with fix-focused feedback'"
        explanation="13 rules enforced across brand (approved tokens, typography), pharma (ISI, disclaimers, fair balance, market disclosures), and accessibility (alt text, table captions, body size). Auto-fix available for token violations. Export a full compliance report for audit."
        criterion="Trust, Compliance & Explainability"
      />

      {/* Overall score */}
      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-4">
        <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-white/50">
          Compliance Score
          <span className={`inline-block h-2 w-2 rounded-full ${
            score.overall >= 80 ? "bg-teal shadow-[0_0_6px_rgba(0,212,170,0.5)]" : "bg-red-500 shadow-[0_0_6px_rgba(220,38,38,0.5)]"
          }`} />
        </p>
        <svg className="mx-auto mt-2" width="120" height="120" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="45" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
          <circle
            cx="60" cy="60" r="45" fill="none"
            stroke={score.overall >= 80 ? "#00D4AA" : score.overall >= 50 ? "#FFD166" : "#DC2626"}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray="283"
            strokeDashoffset={283 - (283 * score.overall) / 100}
            className="animate-gauge-fill"
            transform="rotate(-90 60 60)"
          />
          <text x="60" y="60" textAnchor="middle" dominantBaseline="central"
            className="fill-white font-mono text-2xl font-bold">
            {score.overall}
          </text>
        </svg>
      </div>

      {/* Sub-scores */}
      <div className="flex flex-col gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.04] p-4">
        <ScoreBar label="Brand" value={score.brand} />
        <ScoreBar label="Accessibility" value={score.accessibility} />
        <ScoreBar label="Pharma" value={score.pharma} />
      </div>

      {/* Violations */}
      <div className="flex flex-col gap-2 rounded-2xl border border-white/[0.08] bg-white/[0.04] p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-white/50">
          Violations ({totalViolations})
        </p>

        {totalViolations === 0 ? (
          <p className="mt-2 text-sm font-medium text-teal">
            All checks passed
          </p>
        ) : (
          Object.entries(groupedViolations).map(([group, violations]) => (
            <div key={group} className="mt-2">
              <p className="mb-1 text-xs font-semibold text-white/60">
                {categoryLabels[group] ?? group}
              </p>
              <ul className="flex flex-col gap-2">
                {violations.map((v, idx) => (
                  <li key={`${v.ruleId}-${idx}`} className="flex items-start gap-2">
                    <SeverityDot severity={v.severity as "error" | "warning" | "info"} />
                    <span className="flex-1 text-xs text-white/70">{v.message}</span>
                    {v.autoFixable && (
                      <button
                        type="button"
                        onClick={() => {
                          const originalViolation: ComplianceViolation = {
                            ruleId: v.ruleId,
                            category: v.category,
                            severity: v.severity as "error" | "warning",
                            message: v.message,
                            autoFixable: v.autoFixable,
                            location: v.location,
                          };
                          const fixed = applyAutoFix(spec, originalViolation);
                          onAutoFix(fixed);
                        }}
                        className="flex-shrink-0 rounded-full bg-brand-accent/20 px-2 py-0.5 text-xs font-semibold text-brand-accent hover:bg-brand-accent/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent/40"
                      >
                        Fix
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))
        )}
      </div>
    </aside>
  );
}

export default ComplianceSidebar;
