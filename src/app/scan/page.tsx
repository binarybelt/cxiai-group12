import { ScanDashboard } from "@/components/scan-dashboard";
import { FigmaImport } from "@/components/figma-import";
import { GuideCard } from "@/components/guide-card";

export const metadata = {
  title: "SCAN — Portfolio Compliance Monitor",
};

export default function ScanPage() {
  return (
    <main className="mx-auto max-w-7xl px-6 py-8">
      <GuideCard
        title="Portfolio Drift Detection"
        brief="Stretch goal: 'Scale & Maintainability — detect design-system drift'"
        explanation="Scan live URLs against the approved design system. The scanner extracts color tokens from HTML and flags any that aren't in the approved palette. The portfolio view shows compliance status across all properties — the 'single pane of glass' Pfizer asked for."
        criterion="Insight & Problem Understanding"
      />

      <div className="mb-6 mt-4">
        <h1 className="text-2xl font-bold text-white/[0.93]">
          Point at any live URL. See exactly where it&apos;s drifted from brand.
        </h1>
        <p className="mt-2 text-sm text-white/55">
          The single pane of glass across 2,000+ properties.
        </p>
        <p className="mt-3 text-sm text-white/55">
          Scan any URL against the approved design system. Flag outdated tokens, missing components, compliance gaps.
        </p>
      </div>

      <ScanDashboard />

      {/* Figma Import — collapsible section */}
      <details className="mt-12 rounded-2xl border border-white/[0.08] bg-white/[0.03]">
        <summary className="cursor-pointer px-6 py-4 text-base font-semibold text-white/93">
          Figma Token Import
        </summary>
        <div className="border-t border-white/[0.06] px-6 py-5">
          <p className="mb-4 text-sm text-white/55">
            Paste a Figma file URL to extract design tokens. If no API key is
            configured, demo tokens will be returned.
          </p>
          <FigmaImport />
        </div>
      </details>
    </main>
  );
}
