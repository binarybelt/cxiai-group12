import Link from "next/link";

const features = [
  {
    title: "BUILD",
    description:
      "Generate brand-compliant pages from natural language briefs",
    href: "/build",
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
      </svg>
    ),
  },
  {
    title: "SCAN",
    description:
      "Monitor portfolio compliance and detect design drift",
    href: "/scan",
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
      </svg>
    ),
  },
  {
    title: "COMPLY",
    description:
      "Real-time compliance scoring with auto-fix suggestions",
    href: "/build",
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
      </svg>
    ),
  },
] as const;

const steps = [
  { number: "1", title: "Write a brief", description: "Describe the page you need in plain language" },
  { number: "2", title: "AI generates", description: "Compliant components are assembled automatically" },
  { number: "3", title: "Deploy", description: "Review, approve, and publish with confidence" },
] as const;

export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col">
      {/* Hero */}
      <section className="flex flex-col items-center px-6 pb-12 pt-16 text-center">
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-pfizer-blue-500">
          Design Delivery Accelerator
        </p>
        <h1 className="max-w-3xl text-4xl font-bold text-gray-900 sm:text-5xl">
          AI-powered web page generation with built-in compliance
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-gray-500">
          Generate brand-compliant pharma web pages from natural language briefs,
          with real-time compliance scoring and design-system governance.
        </p>
        <div className="mt-8 flex gap-4">
          <Link
            href="/build"
            className="rounded-lg bg-pfizer-blue-700 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-pfizer-blue-500"
          >
            Start building
          </Link>
          <Link
            href="/preview"
            className="rounded-lg border border-gray-200 bg-white px-6 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-100"
          >
            View components
          </Link>
        </div>
      </section>

      {/* Feature cards */}
      <section className="mx-auto grid w-full max-w-5xl gap-6 px-6 pb-16 sm:grid-cols-3">
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
          <div className="grid gap-8 sm:grid-cols-3">
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
    </main>
  );
}
