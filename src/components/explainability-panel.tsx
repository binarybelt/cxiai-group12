"use client";

import { useState } from "react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ExplainabilityPanelProps {
  rawVariants: any[] | null;
  selectedVariant: number;
}

// ---------------------------------------------------------------------------
// ExplainabilityPanel — shows selectionReason for each component in the spec.
//
// Accepts `any[]` because the raw constrained output includes selectionReason
// which is not in the base PageSpec type — we use runtime access.
// ---------------------------------------------------------------------------

export function ExplainabilityPanel({
  rawVariants,
  selectedVariant,
}: ExplainabilityPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!rawVariants) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-4">
        <p className="text-sm text-gray-400">
          Generate a page to see AI reasoning
        </p>
      </div>
    );
  }

  const variant = rawVariants[selectedVariant];
  if (!variant || !variant.sections) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-4">
        <p className="text-sm text-gray-400">No variant data available</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white">
      <button
        type="button"
        onClick={() => setIsExpanded((v) => !v)}
        className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-semibold text-gray-700"
      >
        <span>AI Reasoning</span>
        <span className="text-gray-400">
          {isExpanded ? "-- Collapse" : "-- Expand"}
        </span>
      </button>

      {isExpanded && (
        <div className="border-t border-gray-100 px-4 pb-4 pt-3">
          <ul className="flex flex-col gap-3">
            {variant.sections.map(
              (section: { id: string; components: { componentId: string; selectionReason?: string }[] }) => (
                <li key={section.id}>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    {section.id}
                  </p>
                  <ul className="mt-1 flex flex-col gap-1">
                    {section.components.map(
                      (
                        comp: { componentId: string; selectionReason?: string },
                        idx: number,
                      ) => (
                        <li
                          key={`${comp.componentId}-${idx}`}
                          className="rounded-lg bg-gray-50 px-3 py-2"
                        >
                          <p className="text-xs font-medium text-gray-800">
                            {comp.componentId}
                          </p>
                          {comp.selectionReason && (
                            <p className="mt-0.5 text-xs text-gray-500">
                              {comp.selectionReason}
                            </p>
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
