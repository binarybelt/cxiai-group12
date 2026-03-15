import { ScanDashboard } from "@/components/scan-dashboard";
import { FigmaImport } from "@/components/figma-import";

export const metadata = {
  title: "SCAN — Portfolio Compliance Monitor",
};

export default function ScanPage() {
  return (
    <main className="mx-auto max-w-7xl px-6 py-8">
      <p className="mb-6 text-sm text-gray-500">
        Monitor brand compliance across your digital portfolio and scan live
        URLs for design-system drift.
      </p>

      <ScanDashboard />

      {/* Figma Import — collapsible section */}
      <details className="mt-12 rounded-2xl border border-gray-200 bg-white">
        <summary className="cursor-pointer px-6 py-4 text-base font-semibold text-gray-900">
          Figma Token Import
        </summary>
        <div className="border-t border-gray-100 px-6 py-5">
          <p className="mb-4 text-sm text-gray-500">
            Paste a Figma file URL to extract design tokens. If no API key is
            configured, demo tokens will be returned.
          </p>
          <FigmaImport />
        </div>
      </details>
    </main>
  );
}
