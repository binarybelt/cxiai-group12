"use client";

import { useState } from "react";

interface GuideCardProps {
  readonly title: string;
  readonly brief: string;
  readonly explanation: string;
  readonly criterion?: string;
}

export function GuideCard({ title, brief, explanation, criterion }: GuideCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className={`rounded-xl border transition-all duration-200 ${
        expanded
          ? "border-blue-200 bg-blue-50/80 px-4 py-3"
          : "border-blue-100 bg-blue-50/50 px-3 py-1.5"
      }`}
    >
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center justify-between gap-2"
      >
        <span className="flex items-center gap-1.5 text-xs font-medium text-blue-600">
          <svg className="h-3.5 w-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
          </svg>
          {expanded ? title : "Why this?"}
        </span>
        <svg
          className={`h-3 w-3 flex-shrink-0 text-blue-400 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
          fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>
      {expanded && (
        <div className="mt-2.5 space-y-2 border-t border-blue-100 pt-2.5">
          <p className="text-[11px] leading-relaxed text-blue-800/70">
            <span className="font-semibold text-blue-800">Brief: </span>
            {brief}
          </p>
          <p className="text-[11px] leading-relaxed text-gray-600">{explanation}</p>
          {criterion && (
            <span className="inline-block rounded-full bg-blue-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-blue-700">
              {criterion}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
