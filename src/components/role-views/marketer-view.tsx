"use client";

import { ChatPanel } from "@/components/chat-panel";
import type { BriefInterpretation } from "@/agents/brief-interpreter/schema";
import type { PageSpec } from "@/types/page-spec";
import type { DiffResult } from "@/types/diff";

// ---------------------------------------------------------------------------
// MarketerView — brief form + ChatPanel + simplified score badge.
// Provides left and right column CONTENT for BuildUI grid.
// ---------------------------------------------------------------------------

interface MarketerViewProps {
  brief: string;
  setBrief: (value: string) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  canSubmit: boolean;
  buttonLabel: string;
  interpretation: BriefInterpretation | null;
  currentSpec: PageSpec | null;
  onEditComplete: (newSpec: PageSpec, diff: DiffResult) => void;
  score: number;
}

function ScoreBadge({ score }: { score: number }) {
  const color =
    score > 80
      ? "text-green-600"
      : score > 60
        ? "text-yellow-500"
        : "text-red-500";

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 text-center">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
        Compliance Score
      </p>
      <p data-testid="score-badge" className={`mt-2 text-6xl font-bold tabular-nums ${color}`}>
        {score}
      </p>
    </div>
  );
}

export function MarketerView({
  brief,
  setBrief,
  onSubmit,
  canSubmit,
  buttonLabel,
  interpretation,
  currentSpec,
  onEditComplete,
  score,
}: MarketerViewProps) {
  return {
    left: (
      <>
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
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

        {interpretation && (
          <div className="rounded-2xl border border-gray-200 bg-white p-4">
            <p className="text-sm font-semibold text-gray-700">Brief Interpretation</p>
            <dl className="mt-2 space-y-1 text-sm">
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
            </dl>
          </div>
        )}

        {currentSpec && (
          <ChatPanel currentSpec={currentSpec} onEditComplete={onEditComplete} />
        )}
      </>
    ),
    right: <ScoreBadge score={score} />,
  };
}

export default MarketerView;
