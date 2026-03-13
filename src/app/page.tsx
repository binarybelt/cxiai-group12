export default function HomePage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-16">
      <section className="w-full max-w-3xl rounded-3xl border border-white/60 bg-white/80 p-10 shadow-xl shadow-slate-200/70 backdrop-blur">
        <p className="mb-4 text-sm font-semibold uppercase tracking-[0.3em] text-pfizer-blue-700">
          Foundation
        </p>
        <h1 className="text-4xl font-bold text-slate-900">
          Design Delivery Accelerator
        </h1>
        <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-700">
          The workspace is scaffolded and ready for the constrained generation
          pipeline, design system contracts, and compliance middleware.
        </p>
      </section>
    </main>
  );
}
