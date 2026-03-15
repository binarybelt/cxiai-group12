import Link from "next/link";

const features = [
  {
    title: "BUILD",
    description:
      "Type a brief. AI interprets your intent, selects only from approved design system components, and generates two compliant variants. Edit via chat. Deploy in one click.",
    href: "/build",
    icon: (
      <svg aria-hidden="true" className="h-8 w-8" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
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
      <svg aria-hidden="true" className="h-8 w-8" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
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
      <svg aria-hidden="true" className="h-8 w-8" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
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
      {/* Hero — asymmetric layout */}
      <section className="relative flex items-center px-6 pb-16 pt-20 lg:px-16">
        <div className="flex w-full flex-col gap-12 lg:flex-row lg:items-center lg:gap-16">
          {/* Left — headline flush-left */}
          <div className="flex-1">
            <p className="mb-4 font-mono text-sm font-semibold uppercase tracking-[0.3em] text-pfizer-blue-accent">
              Pfizer CXI+AI Challenge 2026 — Group 12
            </p>
            <h1 className="max-w-2xl font-display text-4xl font-bold tracking-[-0.03em] text-white/[0.93] sm:text-5xl lg:text-6xl [text-wrap:balance]">
              Compliant by Construction
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-white/55">
              AI-powered web generation where compliance isn&apos;t a checklist —
              it&apos;s the grammar the AI thinks in. Every component approved.
              Every token verified. Every decision explainable.
            </p>
            <div className="mt-8 flex gap-4">
              <Link
                href="/build"
                className="rounded-lg bg-[#0000c9] px-6 py-2.5 text-sm font-semibold text-white transition hover:shadow-[0_0_20px_rgba(0,0,201,0.4)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pfizer-blue-500 focus-visible:ring-offset-2"
              >
                Start Building →
              </Link>
              <Link
                href="/scan"
                className="rounded-lg border border-white/[0.08] bg-white/[0.03] px-6 py-2.5 text-sm font-semibold text-white/55 transition hover:border-white/[0.16] hover:text-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pfizer-blue-500 focus-visible:ring-offset-2"
              >
                View SCAN Dashboard
              </Link>
            </div>
          </div>

          {/* Right — product preview with 3D perspective */}
          <div className="flex-1" style={{ perspective: "1200px" }}>
            <div
              className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-6 backdrop-blur-sm"
              style={{ transform: "rotateY(-8deg)" }}
            >
              <div className="flex items-center gap-2 border-b border-white/[0.06] pb-3">
                <div className="flex gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
                  <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
                  <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
                </div>
                <div className="flex-1 rounded-md bg-white/[0.05] px-3 py-1 font-mono text-xs text-white/35">
                  pfizer.com/your-page
                </div>
              </div>
              <div className="mt-4 space-y-3">
                <div className="h-4 w-3/4 rounded bg-white/[0.06]" />
                <div className="h-3 w-full rounded bg-white/[0.04]" />
                <div className="h-3 w-5/6 rounded bg-white/[0.04]" />
                <div className="mt-4 h-20 w-full rounded-lg bg-white/[0.03]" />
                <div className="flex gap-2">
                  <div className="h-8 w-24 rounded bg-pfizer-blue-accent/20" />
                  <div className="h-8 w-20 rounded bg-white/[0.04]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Statement — subtle glass card */}
      <section className="px-6 py-14">
        <div className="mx-auto max-w-3xl rounded-2xl border border-white/[0.06] bg-white/[0.03] p-10 text-center backdrop-blur-sm">
          <h2 className="mb-4 font-display text-xl font-bold uppercase tracking-wider text-pfizer-blue-accent">
            The Problem
          </h2>
          <p className="text-lg leading-relaxed text-white/55">
            Pfizer manages 2,000+ websites across dozens of agencies. A simple
            page update takes weeks of back-and-forth. Existing AI tools generate
            freely then check — we constrain at generation time.
          </p>
        </div>
      </section>

      {/* Feature cards — glass styling */}
      <section className="mx-auto grid w-full max-w-5xl gap-6 px-6 py-16 sm:grid-cols-3">
        {features.map((f) => (
          <Link
            key={f.title}
            href={f.href}
            className="group rounded-2xl border border-white/[0.06] border-t-white/[0.16] bg-white/[0.03] p-6 backdrop-blur-sm transition hover:border-white/[0.12] hover:bg-white/[0.05]"
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-pfizer-blue-accent/20 to-teal/20 text-pfizer-blue-accent transition group-hover:from-pfizer-blue-accent/30 group-hover:to-teal/30">
              {f.icon}
            </div>
            <h3 className="font-display text-lg font-bold text-white/[0.93]">{f.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-white/55">
              {f.description}
            </p>
          </Link>
        ))}
      </section>

      {/* How it works — step numbers with gradients */}
      <section className="border-t border-white/[0.06] px-6 py-16">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-10 text-center font-display text-2xl font-bold text-white/[0.93]">
            How it works
          </h2>
          <div className="grid gap-8 sm:grid-cols-4">
            {steps.map((s, i) => (
              <div key={s.number} className="relative text-center">
                <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-pfizer-blue-accent to-[#0000c9] font-mono text-sm font-bold text-white">
                  {s.number}
                </div>
                <h3 className="font-display text-base font-semibold text-white/[0.93]">
                  {s.title}
                </h3>
                <p className="mt-1 text-sm text-white/55">{s.description}</p>
                {/* Connecting line between steps */}
                {i < steps.length - 1 && (
                  <div className="absolute top-5 hidden h-px w-8 bg-white/[0.08] sm:block" style={{ right: "-16px" }} />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Differentiators — teal checkmarks */}
      <section className="border-t border-white/[0.06] px-6 py-16">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-8 text-center font-display text-2xl font-bold text-white/[0.93]">
            What makes this different
          </h2>
          <ul className="space-y-4">
            {differentiators.map((d) => (
              <li
                key={d}
                className="flex items-start gap-3 text-white/[0.93]"
              >
                <svg
                  aria-hidden="true"
                  className="mt-1 h-5 w-5 flex-shrink-0 text-teal"
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
      <section className="border-t border-white/[0.06] px-6 py-8">
        <p className="text-center text-sm text-white/35">
          Built for the Pfizer CXI+AI Challenge 2026
        </p>
      </section>
    </main>
  );
}
