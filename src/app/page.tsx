import Link from "next/link";

import { GuideCard } from "@/components/guide-card";

const features = [
  {
    title: "BUILD",
    description:
      "Type a brief. AI interprets your intent, selects only from approved design system components, and generates two compliant variants. Edit via chat. Deploy in one click.",
    href: "/build",
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
      </svg>
    ),
  },
  {
    title: "COMPLY",
    description:
      "Real-time compliance gate — not a post-hoc report. Brand tokens, pharma regulations, WCAG accessibility. Pages cannot render unless they pass.",
    href: "/build",
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
      </svg>
    ),
  },
  {
    title: "SCAN",
    description:
      "Portfolio-wide drift detection. Scan live URLs against your design system. Flag outdated tokens, missing components, compliance gaps.",
    href: "/scan",
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
      </svg>
    ),
  },
] as const;

const steps = [
  {
    number: "1",
    title: "Write a brief",
    description: "Describe your page in natural language",
  },
  {
    number: "2",
    title: "AI interprets & constrains",
    description: "Intent mapped to approved components and tokens",
  },
  {
    number: "3",
    title: "Compliance gate",
    description: "Brand, pharma, and accessibility checks before render",
  },
  {
    number: "4",
    title: "Review & deploy",
    description: "Chat-to-edit, role-based views, one-click deploy",
  },
] as const;

const differentiators = [
  "Constrained generation — AI can only compose from approved components",
  "Deterministic compliance gate — no LLM judgment for pass/fail",
  "Full audit trail — every decision logged with timestamp and reasoning",
  "Role-based views — Marketer, QA, and Developer see what they need",
] as const;

export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col">
      {/* Hero */}
      <section className="flex flex-col items-center px-6 pb-12 pt-16 text-center">
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-pfizer-blue-500">
          Pfizer CXI+AI Challenge 2026 — Group 12
        </p>
        <h1 className="max-w-3xl text-4xl font-bold text-gray-900 sm:text-5xl">
          Compliant by Construction
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-gray-500">
          AI-powered web generation where compliance isn&apos;t a checklist —
          it&apos;s the grammar the AI thinks in. Every component approved.
          Every token verified. Every decision explainable.
        </p>
        <div className="mt-8 flex gap-4">
          <Link
            href="/build"
            className="rounded-lg bg-pfizer-blue-700 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-pfizer-blue-500"
          >
            Start Building →
          </Link>
          <Link
            href="/scan"
            className="rounded-lg border border-gray-200 bg-white px-6 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-100"
          >
            View SCAN Dashboard
          </Link>
        </div>
      </section>

      {/* Guide card — why compliant-by-construction */}
      <div className="mx-auto max-w-2xl px-6">
        <GuideCard
          title="Why Compliant-by-Construction?"
          brief="Brief requirement: 'AI-assisted interpreting a brief and selecting design-system components'"
          explanation="Unlike tools that generate freely then check, our AI can ONLY compose from approved components. The design system is the grammar — not a post-hoc checklist. This is architecturally different from Lovable."
          criterion="Insight & Problem Understanding"
        />
      </div>

      {/* Problem Statement */}
      <section className="bg-gray-900 px-6 py-14 text-white">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="mb-4 text-xl font-bold uppercase tracking-wider text-pfizer-blue-300">
            The Problem
          </h2>
          <p className="text-lg leading-relaxed text-gray-300">
            Pfizer manages 2,000+ websites across dozens of agencies. A simple
            page update takes weeks of back-and-forth. Existing AI tools generate
            freely then check — we constrain at generation time.
          </p>
        </div>
      </section>

      {/* Feature cards */}
      <section className="mx-auto grid w-full max-w-5xl gap-6 px-6 py-16 sm:grid-cols-3">
        {features.map((f) => (
          <Link
            key={f.title}
            href={f.href}
            className="group rounded-2xl border border-gray-200 bg-white/80 p-6 shadow-token-sm backdrop-blur transition hover:border-pfizer-blue-500 hover:shadow-token-md"
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-pfizer-blue-100 text-pfizer-blue-700 transition group-hover:bg-pfizer-blue-700 group-hover:text-white">
              {f.icon}
            </div>
            <h3 className="text-lg font-bold text-gray-900">{f.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-gray-500">
              {f.description}
            </p>
          </Link>
        ))}
      </section>

      {/* How it works */}
      <section className="border-t border-gray-200 bg-white/60 px-6 py-16">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-10 text-center text-2xl font-bold text-gray-900">
            How it works
          </h2>
          <div className="grid gap-8 sm:grid-cols-4">
            {steps.map((s) => (
              <div key={s.number} className="text-center">
                <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-pfizer-blue-700 text-sm font-bold text-white">
                  {s.number}
                </div>
                <h3 className="text-base font-semibold text-gray-900">
                  {s.title}
                </h3>
                <p className="mt-1 text-sm text-gray-500">{s.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Differentiators */}
      <section className="border-t border-gray-200 px-6 py-16">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-8 text-center text-2xl font-bold text-gray-900">
            What makes this different
          </h2>
          <ul className="space-y-4">
            {differentiators.map((d) => (
              <li
                key={d}
                className="flex items-start gap-3 text-gray-700"
              >
                <svg
                  className="mt-1 h-5 w-5 flex-shrink-0 text-pfizer-blue-700"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m4.5 12.75 6 6 9-13.5"
                  />
                </svg>
                <span className="text-base leading-relaxed">{d}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Footer note */}
      <section className="border-t border-gray-200 px-6 py-8">
        <p className="text-center text-sm text-gray-400">
          Built for the Pfizer CXI+AI Challenge 2026
        </p>
      </section>
    </main>
  );
}
