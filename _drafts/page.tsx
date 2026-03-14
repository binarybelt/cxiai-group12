"use client";

import { useState } from "react";
import type { ComplianceResult, StructuredReqs, ComplianceIssue } from "@/types";

// ─── Colour helpers ───────────────────────────────────────────────
const SEVERITY_STYLES: Record<string, { badge: string; border: string; label: string }> = {
  critical: { badge: "bg-red-600 text-white",        border: "border-red-600",  label: "CRITICAL" },
  high:     { badge: "bg-orange-500 text-white",     border: "border-orange-500", label: "HIGH" },
  warning:  { badge: "bg-amber-400 text-zinc-900",   border: "border-amber-400", label: "WARN" },
  info:     { badge: "bg-zinc-500 text-white",       border: "border-zinc-500",  label: "INFO" },
};

const STATUS_STYLES = {
  PASS: "text-emerald-400 border-emerald-400",
  WARN: "text-amber-400 border-amber-400",
  FAIL: "text-red-500 border-red-500",
};

// ─── Demo briefs ─────────────────────────────────────────────────
const DEMO_BRIEFS = [
  {
    label: "HCP Landing (US)",
    text: "Create an HCP-facing landing page for Eliquis (apixaban) in the US market. Include key efficacy data showing it reduces stroke risk by 21% versus warfarin. Add a boxed warning, ISI section, and a CTA to request samples.",
  },
  {
    label: "Patient Info (UK)",
    text: "Build a patient information page for Jardiance in the UK market. Explain the benefits for type 2 diabetes management. Keep it accessible for patients, include side effect information.",
  },
  {
    label: "Campaign Page (EU)",
    text: "Design a campaign page for a new oncology drug Ibrance in the EU. Target is HCP audience. Highlight that it is the best-in-class CDK4/6 inhibitor with superior progression-free survival.",
  },
];

// ─── Sub-components ───────────────────────────────────────────────

function IssueBadge({ severity }: { severity: string }) {
  const s = SEVERITY_STYLES[severity] || SEVERITY_STYLES.info;
  return (
    <span className={`inline-block px-2 py-0.5 text-xs font-mono font-bold rounded-sm ${s.badge}`}>
      {s.label}
    </span>
  );
}

function IssueCard({ issue }: { issue: ComplianceIssue }) {
  const [expanded, setExpanded] = useState(false);
  const s = SEVERITY_STYLES[issue.severity] || SEVERITY_STYLES.info;

  return (
    <div className={`border-l-2 ${s.border} pl-3 py-2 mb-3`}>
      <div className="flex items-start gap-2">
        <IssueBadge severity={issue.severity} />
        {issue.llmEvaluated && (
          <span className="inline-block px-2 py-0.5 text-xs font-mono bg-violet-800 text-violet-200 rounded-sm">
            AI EVAL
          </span>
        )}
        <span className="text-xs font-mono text-zinc-400">{issue.ruleId}</span>
      </div>
      <p className="mt-1 text-sm text-zinc-200">{issue.message}</p>
      <p className="text-xs text-zinc-500 mt-0.5">Source: {issue.source}</p>

      {issue.explanation && (
        <p className="text-xs text-violet-300 mt-1 italic">{issue.explanation}</p>
      )}

      {issue.autoFix && (
        <div className="mt-2">
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-xs text-emerald-400 hover:text-emerald-300 font-mono underline underline-offset-2"
          >
            {expanded ? "▾ Hide auto-fix" : "▸ View auto-fix"}
          </button>
          {expanded && (
            <div className="mt-2 p-2 bg-zinc-900 border border-zinc-700 rounded">
              <p className="text-xs text-emerald-300 mb-1 font-mono">{`// ${issue.autoFix.description}`}</p>
              <pre className="text-xs text-zinc-300 overflow-x-auto whitespace-pre-wrap">
                {issue.autoFix.previewHtml}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function BlockCard({ block }: { block: ComplianceResult["blocks"][0] }) {
  const hasIssues = block.issues.length > 0;
  return (
    <div className={`border rounded p-3 mb-3 ${hasIssues ? "border-zinc-600 bg-zinc-900/60" : "border-zinc-700 bg-zinc-900/30"}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-zinc-500">{block.id}</span>
          <span className="text-xs font-mono px-1.5 py-0.5 bg-zinc-800 text-zinc-300 rounded">
            {block.type}
          </span>
        </div>
        {hasIssues ? (
          <span className="text-xs text-red-400 font-mono">{block.issues.length} issue{block.issues.length > 1 ? "s" : ""}</span>
        ) : (
          <span className="text-xs text-emerald-400 font-mono">✓ PASS</span>
        )}
      </div>

      {block.text && (
        <p className="text-sm text-zinc-300 mb-2 italic">&ldquo;{block.text}&rdquo;</p>
      )}

      {hasIssues && block.issues.map((issue) => (
        <IssueCard key={`${issue.ruleId}-${issue.blockId}`} issue={issue} />
      ))}
    </div>
  );
}

function ScoreGauge({ score, status }: { score: number; status: string }) {
  const colour = status === "PASS" ? "#34d399" : status === "WARN" ? "#fbbf24" : "#f87171";
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <svg width="110" height="110" className="-rotate-90">
        <circle cx="55" cy="55" r={radius} fill="none" stroke="#27272a" strokeWidth="10" />
        <circle
          cx="55" cy="55" r={radius} fill="none"
          stroke={colour} strokeWidth="10"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.8s ease" }}
        />
      </svg>
      <div className="-mt-16 flex flex-col items-center">
        <span className="text-3xl font-bold font-mono" style={{ color: colour }}>{score}</span>
        <span className="text-xs text-zinc-500 font-mono">/ 100</span>
      </div>
    </div>
  );
}

function ReqsPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-1.5 bg-zinc-800 border border-zinc-700 rounded px-2 py-1">
      <span className="text-xs text-zinc-500 font-mono uppercase">{label}</span>
      <span className="text-xs text-zinc-200 font-mono font-bold">{value}</span>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────

export default function ComplianceDashboard() {
  const [brief, setBrief] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [reqs, setReqs] = useState<StructuredReqs | null>(null);
  const [result, setResult] = useState<ComplianceResult | null>(null);

  const runCheck = async () => {
    if (!brief.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);
    setReqs(null);

    try {
      const res = await fetch("/api/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brief }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Request failed");
      setReqs(data.reqs);
      setResult(data.result);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const criticalCount = result?.issues.filter((i) => i.severity === "critical").length ?? 0;
  const highCount = result?.issues.filter((i) => i.severity === "high").length ?? 0;
  const warnCount = result?.issues.filter((i) => i.severity === "warning").length ?? 0;
  const llmCount = result?.issues.filter((i) => i.llmEvaluated).length ?? 0;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100"
      style={{ fontFamily: "'DM Mono', 'Courier New', monospace" }}>

      {/* Header */}
      <header className="border-b border-zinc-800 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-2 h-8 bg-red-600" />
            <div>
              <h1 className="text-lg font-bold tracking-tight text-white" style={{ fontFamily: "'DM Mono', monospace" }}>
                COMPLIANCE ENGINE
              </h1>
              <p className="text-xs text-zinc-500">Design-to-Delivery Accelerator — Pharma Regulatory Check</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-zinc-600 font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            HYBRID MODE — DETERMINISTIC + AI
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-5 gap-8">

        {/* Left: Input panel */}
        <div className="lg:col-span-2 space-y-4">
          <div>
            <label className="block text-xs font-mono text-zinc-400 mb-2 uppercase tracking-widest">
              Design Brief
            </label>
            <textarea
              value={brief}
              onChange={(e) => setBrief(e.target.value)}
              placeholder="Describe the page: target audience, market, product, key claims, required sections..."
              rows={10}
              className="w-full bg-zinc-900 border border-zinc-700 rounded p-3 text-sm text-zinc-200
                         placeholder-zinc-600 focus:outline-none focus:border-zinc-500 resize-none
                         font-mono leading-relaxed"
            />
          </div>

          {/* Demo briefs */}
          <div>
            <p className="text-xs text-zinc-500 mb-2 font-mono">QUICK LOAD:</p>
            <div className="flex flex-col gap-1.5">
              {DEMO_BRIEFS.map((d) => (
                <button
                  key={d.label}
                  onClick={() => setBrief(d.text)}
                  className="text-left text-xs px-3 py-2 bg-zinc-900 border border-zinc-700 rounded
                             hover:border-zinc-500 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200
                             transition-colors font-mono"
                >
                  ▸ {d.label}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={runCheck}
            disabled={loading || !brief.trim()}
            className="w-full py-3 bg-red-700 hover:bg-red-600 disabled:bg-zinc-800
                       disabled:text-zinc-600 text-white font-bold text-sm rounded
                       transition-colors font-mono tracking-widest"
          >
            {loading ? "RUNNING CHECKS..." : "RUN COMPLIANCE CHECK"}
          </button>

          {error && (
            <div className="p-3 bg-red-950 border border-red-800 rounded text-xs text-red-300 font-mono">
              ERROR: {error}
            </div>
          )}

          {/* Rule legend */}
          <div className="border border-zinc-800 rounded p-3">
            <p className="text-xs text-zinc-500 font-mono mb-2 uppercase tracking-widest">Rule Categories</p>
            {[
              { code: "P-xx", label: "Pharma (FDA/ABPI)", colour: "text-red-400" },
              { code: "A-xx", label: "Accessibility (WCAG 2.1 AA)", colour: "text-amber-400" },
              { code: "B-xx", label: "Brand (Design System)", colour: "text-blue-400" },
              { code: "M-xx", label: "Market (UK/US/EU)", colour: "text-violet-400" },
              { code: "LLM-xx", label: "AI Claim Evaluation", colour: "text-emerald-400" },
            ].map((r) => (
              <div key={r.code} className="flex items-center gap-2 mb-1">
                <span className={`text-xs font-mono font-bold w-16 ${r.colour}`}>{r.code}</span>
                <span className="text-xs text-zinc-400">{r.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Results panel */}
        <div className="lg:col-span-3 space-y-5">
          {!result && !loading && (
            <div className="border border-zinc-800 rounded p-8 text-center">
              <p className="text-zinc-600 font-mono text-sm">Enter a brief and run check to see results.</p>
            </div>
          )}

          {loading && (
            <div className="border border-zinc-700 rounded p-8 text-center space-y-3">
              <div className="flex justify-center gap-1">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-2 h-2 bg-red-600 rounded-full animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
              <p className="text-zinc-400 font-mono text-xs">
                Parsing brief → building blocks → running deterministic checks → AI claim evaluation...
              </p>
            </div>
          )}

          {reqs && (
            <div className="border border-zinc-800 rounded p-4">
              <p className="text-xs text-zinc-500 font-mono mb-3 uppercase tracking-widest">
                Parsed Requirements
              </p>
              <div className="flex flex-wrap gap-2">
                <ReqsPill label="Audience" value={reqs.audience.toUpperCase()} />
                <ReqsPill label="Market" value={reqs.market.toUpperCase()} />
                <ReqsPill label="Product" value={reqs.product} />
                <ReqsPill label="Pattern" value={reqs.contentPatternId} />
              </div>
              {reqs.claims.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs text-zinc-500 font-mono mb-1">Extracted Claims:</p>
                  {reqs.claims.map((c, i) => (
                    <p key={i} className="text-xs text-violet-300 italic">• {c}</p>
                  ))}
                </div>
              )}
            </div>
          )}

          {result && (
            <>
              {/* Score + summary */}
              <div className={`border rounded p-5 flex items-center gap-6 ${STATUS_STYLES[result.status].includes("red") ? "border-red-800 bg-red-950/20" : result.status === "WARN" ? "border-amber-800 bg-amber-950/20" : "border-emerald-800 bg-emerald-950/20"}`}>
                <ScoreGauge score={result.score} status={result.status} />
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`text-2xl font-bold font-mono border px-3 py-0.5 rounded ${STATUS_STYLES[result.status]}`}>
                      {result.status}
                    </span>
                    <span className="text-xs text-zinc-500 font-mono">{result.pageId}</span>
                  </div>
                  <div className="flex gap-4 mt-3">
                    <div className="text-center">
                      <p className="text-xl font-mono font-bold text-red-400">{criticalCount}</p>
                      <p className="text-xs text-zinc-500 font-mono">CRITICAL</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xl font-mono font-bold text-orange-400">{highCount}</p>
                      <p className="text-xs text-zinc-500 font-mono">HIGH</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xl font-mono font-bold text-amber-400">{warnCount}</p>
                      <p className="text-xs text-zinc-500 font-mono">WARN</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xl font-mono font-bold text-violet-400">{llmCount}</p>
                      <p className="text-xs text-zinc-500 font-mono">AI FLAGGED</p>
                    </div>
                  </div>
                  <p className="text-xs text-zinc-600 font-mono mt-3">
                    Checked {new Date(result.checkedAt).toLocaleTimeString()} · {result.modelUsed}
                  </p>
                </div>
              </div>

              {/* Blocks */}
              <div>
                <p className="text-xs text-zinc-500 font-mono mb-3 uppercase tracking-widest">
                  Block Analysis — {result.blocks.length} blocks
                </p>
                {result.blocks.map((block) => (
                  <BlockCard key={block.id} block={block} />
                ))}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
