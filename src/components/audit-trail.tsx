"use client";

import { useEffect, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

// ---------------------------------------------------------------------------
// AuditTrail — subscribes to Convex audit log and renders timestamped entries.
// Falls back to demo data after a timeout if Convex is unavailable.
// ---------------------------------------------------------------------------

interface AuditLogEntry {
  _id: string;
  action: string;
  details: string;
  timestamp: number;
  actor: string;
}

const DEMO_AUDIT_ENTRIES: AuditLogEntry[] = [
  {
    _id: "demo-1",
    action: "interpret-brief",
    details: "Parsed brief: HCP landing page for Ibrance UK with efficacy data",
    timestamp: Date.now() - 45_000,
    actor: "brief-interpreter",
  },
  {
    _id: "demo-2",
    action: "generate-page",
    details: "Generated 2 variants — market: UK, product: Ibrance, pageType: hcp-landing",
    timestamp: Date.now() - 38_000,
    actor: "component-selector",
  },
  {
    _id: "demo-3",
    action: "compliance-gate",
    details: "All variants passed compliance gate (score: 92/100)",
    timestamp: Date.now() - 37_000,
    actor: "compliance-engine",
  },
  {
    _id: "demo-4",
    action: "chat-edit",
    details: "Applied edit: 'make the hero section warmer' — mapped to amber token palette",
    timestamp: Date.now() - 20_000,
    actor: "chat-editor",
  },
  {
    _id: "demo-5",
    action: "deploy",
    details: "Deployed 'Ibrance HCP Landing' → https://ibrance-hcp-landing.vercel.app",
    timestamp: Date.now() - 5_000,
    actor: "deploy-agent",
  },
];

const CONVEX_TIMEOUT_MS = 5_000;

function AuditTrailInner() {
  const [timedOut, setTimedOut] = useState(false);

  let logs: AuditLogEntry[] | undefined;
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    logs = useQuery(api.auditLog.getRecentLogs) as AuditLogEntry[] | undefined;
  } catch {
    // Convex provider not available — will fall through to demo data
    logs = undefined;
  }

  // Start a timeout; if Convex hasn't resolved in time, show demo data
  useEffect(() => {
    const timer = setTimeout(() => {
      setTimedOut(true);
    }, CONVEX_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, []);

  // Reset timeout flag when logs arrive
  useEffect(() => {
    if (logs !== undefined) {
      setTimedOut(false);
    }
  }, [logs]);

  const useDemoData = logs === undefined && timedOut;
  const displayLogs = useDemoData ? DEMO_AUDIT_ENTRIES : logs;

  // Still loading (not yet timed out)
  if (displayLogs === undefined) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
          Audit Trail
        </p>
        <p className="mt-2 text-sm text-gray-400">Loading audit trail...</p>
      </div>
    );
  }

  // Empty state
  if (displayLogs.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
          Audit Trail
        </p>
        <p className="mt-2 text-sm text-gray-400">
          No audit events yet. Generate a page to see AI decisions logged here.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
          Audit Trail
        </p>
        {useDemoData && (
          <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-600">
            Demo data
          </span>
        )}
      </div>
      <ul className="mt-2 flex max-h-64 flex-col gap-2 overflow-y-auto">
        {displayLogs.map((entry) => (
          <li
            key={entry._id}
            className="flex flex-col gap-0.5 rounded-lg bg-gray-50 px-3 py-2"
          >
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">
                {new Date(entry.timestamp).toLocaleTimeString()}
              </span>
              <span className="text-xs font-semibold text-gray-800">
                {entry.action}
              </span>
            </div>
            <p className="truncate text-xs text-gray-500">{entry.details}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function AuditTrail() {
  return <AuditTrailInner />;
}

export default AuditTrail;
