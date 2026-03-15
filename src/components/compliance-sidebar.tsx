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
    value >= 80 ? "bg-green-500" : value >= 50 ? "bg-yellow-400" : "bg-red-500";

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between text-xs font-medium text-gray-600">
        <span>{label}</span>
        <span>{value}</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
        <div
          className={`h-full rounded-full ${color} transition-all duration-300`}
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
        ? "bg-yellow-400"
        : "bg-blue-400";
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
      <aside className="flex flex-col gap-4 border-l border-gray-200 bg-gray-50 p-4">
        <p className="text-sm text-gray-400">
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
      ? "text-green-600"
      : score.overall >= 50
        ? "text-yellow-500"
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
    <aside className="flex flex-col gap-4 overflow-y-auto border-l border-gray-200 bg-gray-50 p-4">
      <GuideCard
        title="Real-Time Compliance Engine"
        brief="Stretch goal: 'Automated Quality & Compliance — audit mode with fix-focused feedback'"
        explanation="13 rules enforced across brand (approved tokens, typography), pharma (ISI, disclaimers, fair balance, market disclosures), and accessibility (alt text, table captions, body size). Auto-fix available for token violations. Export a full compliance report for audit."
        criterion="Trust, Compliance & Explainability"
      />

      {/* Overall score */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
          Compliance Score
        </p>
        <p className={`mt-1 text-5xl font-bold tabular-nums ${overallColor}`}>
          {score.overall}
        </p>
      </div>

      {/* Sub-scores */}
      <div className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-4">
        <ScoreBar label="Brand" value={score.brand} />
        <ScoreBar label="Accessibility" value={score.accessibility} />
        <ScoreBar label="Pharma" value={score.pharma} />
      </div>

      {/* Violations */}
      <div className="flex flex-col gap-2 rounded-2xl border border-gray-200 bg-white p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
          Violations ({totalViolations})
        </p>

        {totalViolations === 0 ? (
          <p className="mt-2 text-sm font-medium text-green-600">
            All checks passed
          </p>
        ) : (
          Object.entries(groupedViolations).map(([group, violations]) => (
            <div key={group} className="mt-2">
              <p className="mb-1 text-xs font-semibold text-gray-600">
                {categoryLabels[group] ?? group}
              </p>
              <ul className="flex flex-col gap-2">
                {violations.map((v, idx) => (
                  <li key={`${v.ruleId}-${idx}`} className="flex items-start gap-2">
                    <SeverityDot severity={v.severity as "error" | "warning" | "info"} />
                    <span className="flex-1 text-xs text-gray-700">{v.message}</span>
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
                        className="flex-shrink-0 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700 hover:bg-blue-200"
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
