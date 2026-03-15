"use client";

import { useEffect, useState } from "react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ExplainabilityPanelProps {
  rawVariants: unknown[] | null;
  selectedVariant: number;
}

// ---------------------------------------------------------------------------
// ExplainabilityPanel — shows selectionReason for each component in the spec.
//
// Accepts `unknown[]` because the raw constrained output includes selectionReason
// which is not in the base PageSpec type — we use runtime narrowing.
// ---------------------------------------------------------------------------

export function ExplainabilityPanel({
  rawVariants,
  selectedVariant,
}: ExplainabilityPanelProps) {
  const hasData = rawVariants !== null && rawVariants.length > 0;
  const [isExpanded, setIsExpanded] = useState(false);
  const [hasAutoExpanded, setHasAutoExpanded] = useState(false);

  // Auto-expand once when data first becomes available
  useEffect(() => {
    if (hasData && !hasAutoExpanded) {
      setIsExpanded(true);
      setHasAutoExpanded(true);
    }
  }, [hasData, hasAutoExpanded]);

  if (!rawVariants) {
    return (
      <div className="rounded-2xl border border-dashed border-white/[0.12] bg-white/[0.02] p-4">
        <p className="text-sm text-white/35">
          Generate a page to see AI reasoning
        </p>
      </div>
    );
  }

  const rawVariant = rawVariants[selectedVariant];
  const variant = rawVariant as Record<string, unknown> | undefined;
  if (!variant || !variant.sections) {
    return (
      <div className="rounded-2xl border border-dashed border-white/[0.12] bg-white/[0.02] p-4">
        <p className="text-sm text-white/35">No variant data available</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03]">
      <button
        type="button"
        onClick={() => setIsExpanded((v) => !v)}
        className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-semibold text-white/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent/30 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0C0A12] rounded-xl"
      >
        <span>AI Reasoning</span>
        <span className="text-white/35">
          {isExpanded ? "-- Collapse" : "-- Expand"}
        </span>
      </button>

      {isExpanded && (
        <div className="border-t border-white/[0.06] px-4 pb-4 pt-3">
          <ul className="flex flex-col gap-3">
            {(variant.sections as { id: string; components: { componentId: string; selectionReason?: string; tokenOverrides?: { tokenId: string; value: string }[] }[] }[]).map(
              (section) => (
                <li key={section.id}>
                  <p className="text-xs font-semibold uppercase tracking-wide text-white/55">
                    {section.id}
                  </p>
                  <ul className="mt-1 flex flex-col gap-1">
                    {section.components.map(
                      (comp, idx) => (
                        <li
                          key={`${comp.componentId}-${idx}`}
                          className="rounded-lg bg-white/[0.04] px-3 py-2"
                        >
                          <p className="text-xs font-medium text-white/80">
                            {comp.componentId}
                          </p>
                          {comp.selectionReason ? (
                            <p className="mt-0.5 text-xs text-white/55">
                              <span className="font-medium text-white/70">Reason:</span>{" "}
                              {comp.selectionReason}
                            </p>
                          ) : (
                            <p className="mt-0.5 text-xs italic text-white/35">
                              No selection reason provided
                            </p>
                          )}
                          {comp.tokenOverrides && comp.tokenOverrides.length > 0 && (
                            <div className="mt-1">
                              <p className="text-xs font-medium text-white/70">
                                Token Overrides:
                              </p>
                              <ul className="mt-0.5 flex flex-wrap gap-1">
                                {comp.tokenOverrides.map((tok) => (
                                  <li
                                    key={tok.tokenId}
                                    className="rounded bg-brand-accent/15 px-2 py-0.5 text-xs text-brand-100"
                                  >
                                    {tok.tokenId}: {tok.value}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </li>
                      ),
                    )}
                  </ul>
                </li>
              ),
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

export default ExplainabilityPanel;
