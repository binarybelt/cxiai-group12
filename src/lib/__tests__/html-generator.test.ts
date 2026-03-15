import { describe, expect, it } from "vitest";

import { generateStandaloneHtml } from "@/lib/html-generator";
import type { PageSpec } from "@/types/page-spec";

function makeSpec(overrides: Partial<PageSpec> = {}): PageSpec {
  return {
    id: "test-1",
    title: "Test Page",
    market: "US",
    product: "TestDrug",
    sections: [],
    metadata: {
      generatedBy: "test",
      generatedAt: "2026-01-01T00:00:00Z",
      market: "US",
      product: "TestDrug",
    },
    ...overrides,
  };
}

describe("generateStandaloneHtml", () => {
  it("produces output containing DOCTYPE", () => {
    const html = generateStandaloneHtml(makeSpec());
    expect(html).toContain("<!DOCTYPE html>");
  });

  it("includes spec title in <title> tag", () => {
    const html = generateStandaloneHtml(makeSpec({ title: "My Pharma Page" }));
    expect(html).toContain("<title>My Pharma Page</title>");
  });

  it("includes Tailwind CDN script", () => {
    const html = generateStandaloneHtml(makeSpec());
    expect(html).toContain("https://cdn.tailwindcss.com");
  });

  it("maps Hero component to an h1 with the heading text", () => {
    const spec = makeSpec({
      sections: [
        {
          id: "hero-section",
          type: "hero",
          order: 0,
          components: [
            {
              componentId: "Hero",
              props: { heading: "Welcome to TestDrug" },
            },
          ],
        },
      ],
    });
    const html = generateStandaloneHtml(spec);
    expect(html).toContain("<h1");
    expect(html).toContain("Welcome to TestDrug");
  });

  it("produces valid HTML with empty sections", () => {
    const html = generateStandaloneHtml(makeSpec({ sections: [] }));
    expect(html).toContain("<!DOCTYPE html>");
    expect(html).toContain("</html>");
    expect(html).toContain("<body");
    expect(html).toContain("</body>");
  });

  it("includes ISIBlock content in output", () => {
    const spec = makeSpec({
      sections: [
        {
          id: "isi-section",
          type: "isi",
          order: 0,
          components: [
            {
              componentId: "ISIBlock",
              props: {
                heading: "Important Safety Information",
                content: "Do not take TestDrug if you are allergic to it.",
              },
            },
          ],
        },
      ],
    });
    const html = generateStandaloneHtml(spec);
    expect(html).toContain("Do not take TestDrug if you are allergic to it.");
    expect(html).toContain("Important Safety Information");
  });
});
