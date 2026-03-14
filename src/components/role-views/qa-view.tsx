"use client";

import { ComplianceSidebar } from "@/components/compliance-sidebar";
import { AuditTrail } from "@/components/audit-trail";
import type { PageSpec } from "@/types/page-spec";
import type { ComplianceViolation } from "@/types/compliance";

// ---------------------------------------------------------------------------
// QAView — full compliance sidebar + audit trail.
// Provides left and right column CONTENT for BuildUI grid.
// ---------------------------------------------------------------------------

interface QAViewProps {
  currentSpec: PageSpec | null;
  previewRef: React.RefObject<HTMLDivElement | null>;
  onAutoFix: (fixedSpec: PageSpec) => void;
  gateViolations: ComplianceViolation[] | null;
}

export function QAView({
  currentSpec,
  previewRef,
  onAutoFix,
  gateViolations,
}: QAViewProps) {
  return {
    left: (
      <>
        {/* Gate violations summary */}
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

        {/* Audit Trail */}
        <AuditTrail />
      </>
    ),
    right: (
      <ComplianceSidebar
        spec={currentSpec}
        previewRef={previewRef}
        onAutoFix={onAutoFix}
      />
    ),
  };
}

export default QAView;
