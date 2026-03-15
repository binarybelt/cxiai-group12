"use client";

import { useState } from "react";

interface GuideCardProps {
  readonly title: string;
  readonly brief: string;
  readonly explanation: string;
  readonly criterion?: string;
}

function deriveId(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

function isDismissed(id: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(`guide-dismissed-${id}`) === "1";
  } catch {
    return false;
  }
}

function dismiss(id: string): void {
  try {
    localStorage.setItem(`guide-dismissed-${id}`, "1");
  } catch {
    // localStorage unavailable — silently ignore
  }
}

export function GuideCard({ title, brief, explanation, criterion }: GuideCardProps) {
  const id = deriveId(title);
  const [dismissed, setDismissed] = useState(() => isDismissed(id));
  const [expanded, setExpanded] = useState(false);

  if (dismissed) return null;

  return (
    <div className="rounded-lg border border-blue-100 bg-blue-50 px-3 py-2">
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-800"
        >
          <span className="text-blue-400">i</span>
          {expanded ? "Hide" : "Why this?"}
        </button>
        <button
          type="button"
          onClick={() => { dismiss(id); setDismissed(true); }}
          className="text-[10px] text-blue-300 hover:text-blue-500"
          aria-label="Dismiss guide"
        >
          x
        </button>
      </div>
      {expanded && (
        <div className="mt-2 space-y-1.5">
          <p className="text-xs font-semibold text-gray-700">{title}</p>
          <p className="text-[11px] leading-relaxed text-gray-500">{brief}</p>
          <p className="text-[11px] leading-relaxed text-gray-600">{explanation}</p>
          {criterion && (
            <span className="inline-block rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
              {criterion}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
