import { describe, it, expect } from "vitest";
import { extractTokensFromFigmaUrl, DEMO_FIGMA_TOKENS } from "@/lib/figma";

describe("extractTokensFromFigmaUrl", () => {
  it("parses file key from figma.com/file/ABC URL", async () => {
    // Without FIGMA_API_TOKEN set, falls back to demo tokens
    const tokens = await extractTokensFromFigmaUrl(
      "https://www.figma.com/file/ABCdef123/My-Design-File",
    );

    expect(tokens.length).toBeGreaterThan(0);
    expect(tokens[0]).toHaveProperty("name");
    expect(tokens[0]).toHaveProperty("value");
    expect(tokens[0]).toHaveProperty("category");
    expect(tokens[0].category).toBe("color");
  });

  it("parses file key from figma.com/design/XYZ URL", async () => {
    const tokens = await extractTokensFromFigmaUrl(
      "https://www.figma.com/design/XYZ789abc/Another-File",
    );

    expect(tokens.length).toBeGreaterThan(0);
  });

  it("throws on invalid URL without figma.com pattern", async () => {
    await expect(
      extractTokensFromFigmaUrl("https://example.com/not-figma"),
    ).rejects.toThrow();
  });

  it("throws on empty string", async () => {
    await expect(extractTokensFromFigmaUrl("")).rejects.toThrow();
  });

  it("returns demo fallback tokens when no API token is set", async () => {
    const tokens = await extractTokensFromFigmaUrl(
      "https://www.figma.com/file/TestKey123/Demo",
    );

    // Should match the exported demo tokens
    expect(tokens).toEqual(DEMO_FIGMA_TOKENS);
  });

  it("demo tokens contain 8 colour entries", () => {
    expect(DEMO_FIGMA_TOKENS).toHaveLength(8);
    for (const token of DEMO_FIGMA_TOKENS) {
      expect(token.category).toBe("color");
      expect(token.value).toMatch(/^#[0-9a-fA-F]{6}$/);
    }
  });
});
