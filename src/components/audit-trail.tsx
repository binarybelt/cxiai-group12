"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

// ---------------------------------------------------------------------------
// AuditTrail — subscribes to Convex audit log and renders timestamped entries.
// Handles: loading state, empty state, and missing Convex connection gracefully.
// ---------------------------------------------------------------------------

interface AuditLogEntry {
  _id: string;
  action: string;
  details: string;
  timestamp: number;
  actor: string;
}

export function AuditTrail() {
  let logs: AuditLogEntry[] | undefined;

  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    logs = useQuery(api.auditLog.getRecentLogs) as AuditLogEntry[] | undefined;
  } catch {
    // Convex provider not available — treat as loading/unavailable
    logs = undefined;
  }

  // Loading state (undefined means query hasn't resolved or no Convex connection)
  if (logs === undefined) {
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
  if (logs.length === 0) {
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
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
        Audit Trail
      </p>
      <ul className="mt-2 flex max-h-64 flex-col gap-2 overflow-y-auto">
        {logs.map((entry) => (
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

export default AuditTrail;
