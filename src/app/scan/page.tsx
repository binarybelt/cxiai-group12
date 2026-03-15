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

      <p className="mb-6 mt-4 text-sm text-white/55">
        Monitor brand compliance across your digital portfolio and scan live
        URLs for design-system drift.
      </p>

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
