"use client";

import { useCallback, useEffect, useState } from "react";

import type { AuditEntry } from "@/lib/audit-chain";
import { verifyChain } from "@/lib/audit-chain";
import { getAuditEntries } from "@/lib/audit-chain-store";
import { GuideCard } from "@/components/guide-card";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const GENESIS_HASH =
  "0000000000000000000000000000000000000000000000000000000000000000";

function truncateHash(hash: string, len = 16): string {
  if (hash === GENESIS_HASH) return "0".repeat(len) + "...";
  return hash.slice(0, len) + "...";
}

const ACTION_COLORS: Record<string, string> = {
  "interpret-brief": "border-l-blue-500",
  "generate-page": "border-l-green-500",
  "compliance-gate": "border-l-amber-500",
};

const ACTION_DOT_COLORS: Record<string, string> = {
  "interpret-brief": "bg-blue-500",
  "generate-page": "bg-green-500",
  "compliance-gate": "bg-amber-500",
};

// ---------------------------------------------------------------------------
// Entry card
// ---------------------------------------------------------------------------

function EntryCard({
  entry,
  verified,
}: {
  readonly entry: AuditEntry;
  readonly verified: boolean | null;
}) {
  const borderColor = ACTION_COLORS[entry.action] ?? "border-l-white/[0.2]";
  const dotColor = ACTION_DOT_COLORS[entry.action] ?? "bg-white/[0.35]";

  return (
    <div className="relative pl-8">
      {/* Timeline connector */}
      <div className="absolute left-3 top-0 h-full w-px bg-white/[0.08]" />
      <div
        className={`absolute left-1.5 top-6 h-3 w-3 rounded-full ${dotColor} ring-2 ring-[#000014]`}
      />

      <div
        className={`rounded-xl border border-white/[0.08] border-l-4 ${borderColor} bg-white/[0.03] p-4`}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/[0.06] text-xs font-bold text-white/[0.7]">
              {entry.sequenceNum}
            </span>
            <span className="text-sm font-semibold text-white/[0.93]">
              {entry.action}
            </span>
            {verified === true && (
              <span className="inline-flex items-center rounded-full bg-green-500/[0.15] px-2 py-0.5 text-xs font-semibold text-green-400">
                Verified
              </span>
            )}
            {verified === false && (
              <span className="inline-flex items-center rounded-full bg-red-500/[0.15] px-2 py-0.5 text-xs font-semibold text-red-400">
                TAMPERED
              </span>
            )}
          </div>
          <span className="text-xs text-white/[0.35]">{entry.timestamp}</span>
        </div>

        {/* Actor */}
        <p className="mt-1 text-xs text-white/[0.55]">Actor: {entry.actor}</p>

        {/* Input / Output summaries */}
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div>
            <p className="text-xs font-medium text-white/[0.55]">Input</p>
            <p className="mt-0.5 line-clamp-2 text-xs text-white/[0.7]">
              {entry.input}
            </p>
            <p
              className="mt-1 font-mono text-[10px] text-white/[0.35]"
              title={entry.inputHash}
            >
              {truncateHash(entry.inputHash)}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-white/[0.55]">Output</p>
            <p className="mt-0.5 line-clamp-2 text-xs text-white/[0.7]">
              {entry.output}
            </p>
            <p
              className="mt-1 font-mono text-[10px] text-white/[0.35]"
              title={entry.outputHash}
            >
              {truncateHash(entry.outputHash)}
            </p>
          </div>
        </div>

        {/* Hashes */}
        <div className="mt-3 flex flex-col gap-1 rounded-lg bg-white/[0.03] p-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-medium text-white/[0.55]">
              Entry Hash
            </span>
            <span
              className={`font-mono text-[10px] ${
                verified === true
                  ? "text-green-400"
                  : verified === false
                    ? "text-red-400"
                    : "text-white/[0.55]"
              }`}
              title={entry.entryHash}
            >
              {truncateHash(entry.entryHash)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-medium text-white/[0.55]">
              Prev Hash
            </span>
            <span
              className="font-mono text-[10px] text-white/[0.35]"
              title={entry.previousHash}
            >
              {truncateHash(entry.previousHash)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Evidence page
// ---------------------------------------------------------------------------

export default function EvidencePage() {
  const [entries, setEntries] = useState<ReadonlyArray<AuditEntry>>([]);
  const [verificationResult, setVerificationResult] = useState<{
    readonly valid: boolean;
    readonly brokenAt?: number;
    readonly details: string[];
  } | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifiedIndex, setVerifiedIndex] = useState(-1);

  // Load entries from the in-memory store on mount
  const loadEntries = useCallback(() => {
    setEntries(getAuditEntries());
    setVerificationResult(null);
    setVerifiedIndex(-1);
  }, []);

  // Load on first render
  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  // Animated verification
  async function handleVerify() {
    if (entries.length === 0) return;
    setIsVerifying(true);
    setVerificationResult(null);
    setVerifiedIndex(-1);

    // Animate entry-by-entry
    for (let i = 0; i < entries.length; i++) {
      setVerifiedIndex(i);
      await new Promise((resolve) => setTimeout(resolve, 400));
    }

    const result = await verifyChain(entries);
    setVerificationResult(result);
    setIsVerifying(false);
  }

  const hasEntries = entries.length > 0;

  return (
    <div className="mx-auto max-w-3xl px-6 py-8">
      <GuideCard
        title="FDA 21 CFR Part 11 Audit Trail"
        brief="Stretch goal: 'Trust + Explainability — show your working'"
        explanation="Every pipeline step (interpret, generate, comply, edit, deploy) is logged with SHA-256 hash chains. Each entry's hash includes the previous entry's hash — if any record is tampered with, the chain breaks. Click 'Verify Chain Integrity' to prove the trail is clean."
        criterion="Trust, Compliance & Explainability"
      />

      {/* Header */}
      <div className="mb-8 mt-4">
        <h1 className="text-2xl font-bold text-white/[0.93]">
          Every Decision, Verified
        </h1>
        <p className="mt-1 text-sm text-white/[0.55]">
          Tamper-proof audit trail — every AI decision hashed, chained, and verifiable. Click to prove it.
        </p>
      </div>

      {/* Actions bar */}
      {hasEntries && (
        <div className="mb-6 flex items-center gap-3">
          <button
            type="button"
            onClick={handleVerify}
            disabled={isVerifying}
            className="rounded-full bg-pfizer-blue-700 px-5 py-2 text-sm font-semibold text-white transition hover:bg-pfizer-blue-800 disabled:opacity-50"
          >
            {isVerifying ? "Verifying..." : "Verify Chain Integrity"}
          </button>
          <button
            type="button"
            onClick={loadEntries}
            className="rounded-full border border-white/[0.08] px-4 py-2 text-sm font-medium text-white/[0.7] transition hover:bg-white/[0.06]"
          >
            Refresh
          </button>

          {/* Verification result badge */}
          {verificationResult && (
            <span
              className={`ml-auto rounded-full px-4 py-1.5 text-xs font-semibold ${
                verificationResult.valid
                  ? "bg-green-500/[0.15] text-green-400"
                  : "bg-red-500/[0.15] text-red-400"
              }`}
            >
              {verificationResult.valid
                ? `Chain verified -- ${entries.length} entries, no tampering detected`
                : `Chain broken at entry ${verificationResult.brokenAt}`}
            </span>
          )}
        </div>
      )}

      {/* Entry list */}
      {hasEntries ? (
        <div className="flex flex-col gap-4">
          {entries.map((entry, idx) => {
            let verified: boolean | null = null;
            if (verificationResult) {
              if (verificationResult.valid) {
                verified = true;
              } else {
                verified =
                  verificationResult.brokenAt !== undefined &&
                  idx < verificationResult.brokenAt
                    ? true
                    : idx === verificationResult.brokenAt
                      ? false
                      : null;
              }
            } else if (isVerifying && idx <= verifiedIndex) {
              verified = true; // optimistic during animation
            }

            return (
              <EntryCard key={entry.id} entry={entry} verified={verified} />
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/[0.08] bg-white/[0.03] px-6 py-16">
          <p className="text-sm text-white/[0.35]">
            Generate a page in the Build view to see the compliance evidence
            chain.
          </p>
        </div>
      )}
    </div>
  );
}
