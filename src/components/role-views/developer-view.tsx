"use client";

import type { PageSpec } from "@/types/page-spec";

// ---------------------------------------------------------------------------
// DeveloperView — component spec list + JSON code output.
// Provides left and right column CONTENT for BuildUI grid.
// ---------------------------------------------------------------------------

interface DeveloperViewProps {
  currentSpec: PageSpec | null;
  rawVariants: unknown[] | null;
  selectedVariant: number;
}

export function DeveloperView({
  currentSpec,
}: DeveloperViewProps) {
  if (!currentSpec) {
    return {
      left: (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-4">
          <p className="text-sm text-gray-400">
            Generate a page to see the code output
          </p>
        </div>
      ),
      right: (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-4">
          <p className="text-sm text-gray-400">
            Generate a page to see the code output
          </p>
        </div>
      ),
    };
  }

  return {
    left: (
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
    ),
    right: (
      <div className="flex flex-col gap-2 overflow-y-auto rounded-2xl border border-gray-200 bg-gray-900 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
          PageSpec JSON
        </p>
        <pre className="overflow-x-auto text-xs text-green-400">
          <code>{JSON.stringify(currentSpec, null, 2)}</code>
        </pre>
      </div>
    ),
  };
}

export default DeveloperView;
