import { describe, it, expect } from "vitest";
import { driftReport } from "@/lib/scan";
import type { DesignToken } from "@/types/design-system";

const approvedTokens: DesignToken[] = [
  { id: "brand-500", category: "color", name: "Brand Primary", value: "#8B5CF6" },
  { id: "white", category: "color", name: "White", value: "#FFFFFF" },
  { id: "gray-700", category: "color", name: "Gray 700", value: "#334155" },
  { id: "heading-xl", category: "typography", name: "Heading XL", value: "2.5rem/700" },
];

describe("driftReport", () => {
  it("returns zero drift items when all hex values are approved", () => {
    const html = `
      <div style="color: #8B5CF6; background: #FFFFFF;">
        <p style="color: #334155;">Hello</p>
      </div>
    `;

    const report = driftReport("https://example.com", html, approvedTokens);

    expect(report.url).toBe("https://example.com");
    expect(report.driftCount).toBe(0);
    expect(report.items).toHaveLength(0);
    expect(report.scannedAt).toBeTruthy();
  });

  it("flags off-brand hex values as drift items", () => {
    const html = `
      <div style="color: #FF0000; background: #8B5CF6;">
        <p style="color: #00FF00;">Off brand</p>
      </div>
    `;

    const report = driftReport("https://example.com/page", html, approvedTokens);

    expect(report.driftCount).toBe(2);
    expect(report.items).toHaveLength(2);

    const hexValues = report.items.map((item) => item.hex.toLowerCase());
    expect(hexValues).toContain("#ff0000");
    expect(hexValues).toContain("#00ff00");
  });

  it("includes a descriptive message for each drift item", () => {
    const html = `<div style="color: #BADA55;">text</div>`;

    const report = driftReport("https://example.com", html, approvedTokens);

    expect(report.items[0].message).toContain("#BADA55");
  });

  it("handles case-insensitive hex matching", () => {
    const html = `<div style="color: #8b5cf6;">text</div>`;

    const report = driftReport("https://example.com", html, approvedTokens);

    expect(report.driftCount).toBe(0);
  });

  it("deduplicates repeated hex values", () => {
    const html = `
      <div style="color: #FF0000;">
        <p style="color: #FF0000;">same color twice</p>
      </div>
    `;

    const report = driftReport("https://example.com", html, approvedTokens);

    expect(report.driftCount).toBe(1);
    expect(report.items).toHaveLength(1);
  });

  it("returns valid ISO scannedAt timestamp", () => {
    const report = driftReport("https://example.com", "<div></div>", approvedTokens);

    expect(() => new Date(report.scannedAt)).not.toThrow();
    expect(new Date(report.scannedAt).toISOString()).toBe(report.scannedAt);
  });

  it("ignores non-color tokens when filtering", () => {
    // The typography token value "2.5rem/700" should not interfere
    const html = `<div style="color: #ABCDEF;">text</div>`;

    const report = driftReport("https://example.com", html, approvedTokens);

    expect(report.driftCount).toBe(1);
  });
});
