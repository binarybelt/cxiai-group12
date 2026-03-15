/**
 * Server-side Figma token extraction.
 *
 * Parses a Figma file URL, fetches colour fills via the Figma REST API
 * (when FIGMA_API_TOKEN is set), and returns a flat list of TokenDraft
 * colour entries. Falls back to DEMO_FIGMA_TOKENS when no API key is
 * configured.
 */

export interface TokenDraft {
  name: string;
  value: string;
  category: "color";
}

/** 8 hardcoded pharma-like colours used as demo fallback. */
export const DEMO_FIGMA_TOKENS: TokenDraft[] = [
  { name: "Brand Primary", value: "#A78BFA", category: "color" },
  { name: "Brand Deep", value: "#7C3AED", category: "color" },
  { name: "Brand Tint", value: "#E8E4EE", category: "color" },
  { name: "Dark Navy", value: "#0F172A", category: "color" },
  { name: "Neutral Gray", value: "#64748B", category: "color" },
  { name: "Surface White", value: "#FFFFFF", category: "color" },
  { name: "Success Green", value: "#1F9D68", category: "color" },
  { name: "Alert Coral", value: "#FF7F6E", category: "color" },
];

const FIGMA_URL_REGEX = /figma\.com\/(?:file|design)\/([a-zA-Z0-9]+)/;

/**
 * Extract design tokens from a Figma file URL.
 *
 * @throws {Error} if the URL does not match the expected Figma pattern.
 */
export async function extractTokensFromFigmaUrl(
  url: string,
): Promise<TokenDraft[]> {
  if (!url) {
    throw new Error("Figma URL is required");
  }

  const match = url.match(FIGMA_URL_REGEX);
  if (!match) {
    throw new Error(
      "Invalid Figma URL. Expected format: figma.com/file/<key> or figma.com/design/<key>",
    );
  }

  const fileKey = match[1];
  const apiToken = process.env.FIGMA_API_TOKEN;

  if (!apiToken) {
    // No API token configured — return demo palette
    return DEMO_FIGMA_TOKENS;
  }

  // Fetch real tokens from the Figma API
  const res = await fetch(`https://api.figma.com/v1/files/${fileKey}`, {
    headers: { "X-Figma-Token": apiToken },
  });

  if (!res.ok) {
    throw new Error(`Figma API returned ${res.status}: ${res.statusText}`);
  }

  const data = (await res.json()) as FigmaFileResponse;
  return extractColoursFromDocument(data);
}

// ---------------------------------------------------------------------------
// Figma API response helpers (minimal subset)
// ---------------------------------------------------------------------------

interface FigmaColor {
  r: number;
  g: number;
  b: number;
  a: number;
}

interface FigmaFill {
  type: string;
  color?: FigmaColor;
}

interface FigmaNode {
  name: string;
  type: string;
  fills?: FigmaFill[];
  children?: FigmaNode[];
}

interface FigmaFileResponse {
  document: FigmaNode;
}

function extractColoursFromDocument(data: FigmaFileResponse): TokenDraft[] {
  const colours = new Map<string, string>(); // hex → name

  function walk(node: FigmaNode) {
    if (node.fills) {
      for (const fill of node.fills) {
        if (fill.type === "SOLID" && fill.color) {
          const hex = rgbToHex(fill.color);
          if (!colours.has(hex)) {
            colours.set(hex, node.name);
          }
        }
      }
    }
    if (node.children) {
      for (const child of node.children) {
        walk(child);
      }
    }
  }

  walk(data.document);

  return Array.from(colours.entries()).map(([hex, name]) => ({
    name,
    value: hex,
    category: "color" as const,
  }));
}

function rgbToHex(c: FigmaColor): string {
  const toHex = (v: number) =>
    Math.round(v * 255)
      .toString(16)
      .padStart(2, "0")
      .toUpperCase();
  return `#${toHex(c.r)}${toHex(c.g)}${toHex(c.b)}`;
}
