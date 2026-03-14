import { BuildUI } from "@/components/build-ui";

export const metadata = {
  title: "BUILD -- Design Delivery Accelerator",
};

/**
 * /build route — server component wrapper.
 * BuildUI is a "use client" component that owns all interactive state.
 */
export default function BuildPage() {
  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <header className="flex-shrink-0 border-b border-gray-200 bg-white px-6 py-4">
        <h1 className="text-lg font-semibold text-pfizer-blue-700">
          BUILD -- Design Delivery Accelerator
        </h1>
        <p className="text-sm text-gray-500">
          Type a brief to generate a compliant page from approved pharma
          components.
        </p>
      </header>
      <BuildUI />
    </div>
  );
}
