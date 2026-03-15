"use client";

import { GuideCard } from "@/components/guide-card";

// ---------------------------------------------------------------------------
// Agent data
// ---------------------------------------------------------------------------

interface AgentInfo {
  readonly name: string;
  readonly purpose: string;
  readonly model: string;
  readonly method: string;
  readonly guardrails: readonly string[];
  readonly promptStrategy: string;
}

const AGENTS: readonly AgentInfo[] = [
  {
    name: "Brief Interpreter",
    purpose: "Converts natural language briefs into structured requirements",
    model: "Gemini 2.5 Flash (configurable via env var)",
    method:
      "generateObject with Zod schema validation \u2014 structured output, not free-text parsing",
    guardrails: [
      "Output validated against BriefInterpretationSchema (Zod) \u2014 malformed output is rejected",
      "pageType must match approved pattern IDs from patterns.json",
      "market must match approved market IDs from markets.json",
      "mustIncludeComponents restricted to approved component IDs from components.json",
      "Risk pre-screening scans for superlatives, missing safety context, off-label indications",
    ],
    promptStrategy:
      "Design system context (patterns, markets, components) injected into system prompt \u2014 the AI sees ONLY what\u2019s approved",
  },
  {
    name: "Component Selector",
    purpose: "Generates two PageSpec variants from structured requirements",
    model: "Same configurable LLM",
    method: "generateObject with constrained Zod enum schema",
    guardrails: [
      "componentId is a z.enum() built dynamically from components.json \u2014 the AI CANNOT return an unapproved component ID (schema validation fails)",
      "tokenId in overrides is a z.enum() built from tokens.json \u2014 same constraint",
      "Every component must include a selectionReason explaining WHY it was chosen",
      "Post-generation: deterministic compliance gate runs 13 rules before rendering",
      "Post-processing: adverseEventUrl auto-corrected to market-appropriate regulatory URL",
    ],
    promptStrategy:
      "Full component props shapes, market-specific requirements, and required disclosures injected",
  },
  {
    name: "Chat Editor",
    purpose: "Applies natural language edits to existing page specs",
    model: "Same configurable LLM",
    method: "generateObject with single-variant constrained schema",
    guardrails: [
      "Safety Protocol in system prompt: AI instructed to NEVER remove ISI, Disclaimer, or Footer even if asked",
      "Same Zod enum constraints on output",
      "Post-edit: compliance gate runs \u2014 edits that introduce violations are blocked (HTTP 422)",
      "Post-processing: adverseEventUrl auto-corrected",
    ],
    promptStrategy:
      "Current page spec + edit instruction, with explicit compliance preservation rules",
  },
] as const;

// ---------------------------------------------------------------------------
// Section data
// ---------------------------------------------------------------------------

const ANTI_HALLUCINATION: readonly { readonly label: string; readonly text: string }[] = [
  {
    label: "Structured output only",
    text: "All three agents use Vercel AI SDK generateObject with Zod schemas. The AI returns validated JSON, not free text. If output doesn\u2019t match the schema, the request fails and retries (max 2 retries).",
  },
  {
    label: "Enum-constrained generation",
    text: "Component IDs and token IDs are Zod enums built at runtime from the design system JSON files. The LLM literally cannot hallucinate a component that doesn\u2019t exist \u2014 schema validation rejects it.",
  },
  {
    label: "No LLM in compliance decisions",
    text: "The compliance gate is pure TypeScript functions. Pass/fail is deterministic, not AI judgment. The AI generates; pure functions validate.",
  },
  {
    label: "Post-processing layer",
    text: 'Even after Zod validation, deterministic post-processing fixes known LLM weaknesses (e.g., adverseEventUrl often outputs "#" despite prompt instructions \u2014 auto-corrected per market).',
  },
  {
    label: "Risk pre-screening",
    text: "Brief interpreter flags potential compliance risks BEFORE generation starts, not after.",
  },
  {
    label: "Dual-layer adversarial protection",
    text: "(1) Prompt-level Safety Protocol tells the AI to preserve safety components. (2) Deterministic compliance gate catches anything the prompt misses.",
  },
];

const COST_POINTS: readonly string[] = [
  "Default model: Gemini 2.5 Flash (Google) \u2014 free tier for development, low-cost for production",
  "Multi-provider architecture: Switch between Google, Anthropic, or OpenRouter via env var \u2014 no code changes",
  "Single LLM call per pipeline step: interpret (1 call), generate (1 call), edit (1 call) \u2014 no chains or loops",
  "Structured output eliminates parsing costs: no regex, no retries for format issues",
  "Chat edits use single-variant schema (halved output tokens vs original two-variant approach)",
];

const AI_DOES_NOT: readonly string[] = [
  "AI does NOT decide compliance pass/fail \u2014 pure functions do",
  "AI does NOT have access to the internet during generation \u2014 all context is injected from local JSON files",
  "AI does NOT store or learn from previous generations \u2014 each request is stateless",
  "AI does NOT generate raw HTML \u2014 it generates a PageSpec (JSON), which is rendered by deterministic React components",
  "AI output is NEVER rendered without passing through the compliance gate first",
];

const AUDIT_POINTS: readonly string[] = [
  "Every pipeline step logged with SHA-256 hash chain",
  "Each entry includes: timestamp, action, actor, input hash, output hash, chain hash",
  "Chain integrity verifiable at /evidence \u2014 re-computes all hashes live",
  "Follows FDA 21 CFR Part 11 principles for electronic records",
];

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function SectionHeading({ children }: { readonly children: React.ReactNode }) {
  return (
    <h2 className="mb-4 text-xl font-bold text-gray-900">{children}</h2>
  );
}

function AgentCard({ agent }: { readonly agent: AgentInfo }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <h3 className="text-base font-bold text-pfizer-blue-700">
        {agent.name}
      </h3>
      <p className="mt-1 text-sm text-gray-600">{agent.purpose}</p>

      <div className="mt-3 space-y-1">
        <Detail label="Model" value={agent.model} />
        <Detail label="Method" value={agent.method} />
        <Detail label="Prompt strategy" value={agent.promptStrategy} />
      </div>

      <div className="mt-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
          Guardrails
        </p>
        <ul className="mt-1 list-disc space-y-1 pl-4">
          {agent.guardrails.map((g) => (
            <li key={g} className="text-sm text-gray-700">
              {renderInlineCode(g)}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function Detail({
  label,
  value,
}: {
  readonly label: string;
  readonly value: string;
}) {
  return (
    <p className="text-sm text-gray-700">
      <span className="font-medium text-gray-500">{label}:</span>{" "}
      {renderInlineCode(value)}
    </p>
  );
}

/** Wraps backtick-delimited tokens in <code> tags. */
function renderInlineCode(text: string): React.ReactNode {
  const parts = text.split(/(`[^`]+`)/g);
  return parts.map((part, i) =>
    part.startsWith("`") && part.endsWith("`") ? (
      <code
        key={i}
        className="rounded bg-gray-100 px-1 py-0.5 font-mono text-xs text-pfizer-blue-700"
      >
        {part.slice(1, -1)}
      </code>
    ) : (
      <span key={i}>{part}</span>
    ),
  );
}

function CodeSpan({ children }: { readonly children: string }) {
  return (
    <code className="rounded bg-gray-100 px-1 py-0.5 font-mono text-xs text-pfizer-blue-700">
      {children}
    </code>
  );
}

function BulletList({
  items,
  renderItem,
}: {
  readonly items: readonly string[];
  readonly renderItem?: (item: string) => React.ReactNode;
}) {
  return (
    <ul className="list-disc space-y-2 pl-5">
      {items.map((item) => (
        <li key={item} className="text-sm text-gray-700">
          {renderItem ? renderItem(item) : item}
        </li>
      ))}
    </ul>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function TransparencyPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-8">
      <GuideCard
        title="Full AI Transparency"
        brief="Judging criterion: Creative Use of AI in Web Design Lifecycle"
        explanation="This page documents every AI decision, guardrail, and cost optimization in the system."
        criterion="Creative Use of AI"
      />

      {/* Header */}
      <div className="mb-10 mt-4">
        <h1 className="text-2xl font-bold text-gray-900">
          AI Transparency Report
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          How we use AI, how we prevent hallucination, and how we ensure
          trustworthy output
        </p>
      </div>

      {/* Section 1: Three AI Agents */}
      <section className="mb-10">
        <SectionHeading>Three AI Agents</SectionHeading>
        <div className="flex flex-col gap-4">
          {AGENTS.map((agent) => (
            <AgentCard key={agent.name} agent={agent} />
          ))}
        </div>
      </section>

      {/* Section 2: Anti-Hallucination Strategy */}
      <section className="mb-10">
        <SectionHeading>Anti-Hallucination Strategy</SectionHeading>
        <ul className="list-disc space-y-3 pl-5">
          {ANTI_HALLUCINATION.map((item) => (
            <li key={item.label} className="text-sm text-gray-700">
              <span className="font-semibold">{item.label}:</span> {item.text}
            </li>
          ))}
        </ul>
      </section>

      {/* Section 3: Cost Efficiency */}
      <section className="mb-10">
        <SectionHeading>Cost Efficiency</SectionHeading>
        <BulletList items={COST_POINTS} />
      </section>

      {/* Section 4: What AI Does NOT Do */}
      <section className="mb-10">
        <SectionHeading>What AI Does NOT Do</SectionHeading>
        <p className="mb-3 text-sm font-medium text-gray-500">
          This is critical for trust:
        </p>
        <BulletList items={AI_DOES_NOT} />
      </section>

      {/* Section 5: Audit Trail */}
      <section className="mb-10">
        <SectionHeading>Audit Trail</SectionHeading>
        <BulletList items={AUDIT_POINTS} />
        <p className="mt-3 text-sm text-gray-500">
          See the live audit chain at{" "}
          <a
            href="/evidence"
            className="font-medium text-pfizer-blue-700 underline"
          >
            /evidence
          </a>
          .
        </p>
      </section>
    </div>
  );
}
