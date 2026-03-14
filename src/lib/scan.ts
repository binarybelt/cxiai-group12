import type { DesignToken } from "@/types/design-system";
import type { DriftItem, ScanReport } from "@/types/scan";

/**
 * Analyse HTML for colour drift against an approved token palette.
 *
 * Extracts every hex colour literal from the HTML string, compares
 * against the colour tokens in `approvedTokens`, and returns a
 * ScanReport listing every off-brand value found.
 */
export function driftReport(
  url: string,
  html: string,
  approvedTokens: DesignToken[],
): ScanReport {
  // Build a set of approved hex values (lower-cased, 6-char normalised)
  const approvedHexSet = new Set<string>();
  for (const token of approvedTokens) {
    if (token.category === "color") {
      approvedHexSet.add(normaliseHex(token.value));
    }
  }

  // Extract all hex colour values from the HTML
  const hexRegex = /#[0-9a-fA-F]{3,8}/g;
  const matches = html.match(hexRegex) ?? [];

  // Deduplicate
  const unique = [...new Set(matches.map((m) => m.toLowerCase()))];

  const items: DriftItem[] = [];
  for (const hex of unique) {
    const normalised = normaliseHex(hex);
    if (!approvedHexSet.has(normalised)) {
      items.push({
        hex: hex.toUpperCase(),
        message: `Off-brand colour ${hex.toUpperCase()} is not in the approved palette.`,
      });
    }
  }

  return {
    url,
    driftCount: items.length,
    items,
    scannedAt: new Date().toISOString(),
  };
}

/**
 * Normalise a hex string to lowercase 6-character form.
 * e.g. "#ABC" → "#aabbcc", "#0093d0" → "#0093d0"
 */
function normaliseHex(hex: string): string {
  const clean = hex.replace("#", "").toLowerCase();
  if (clean.length === 3) {
    return `#${clean[0]}${clean[0]}${clean[1]}${clean[1]}${clean[2]}${clean[2]}`;
  }
  // For 6 or 8-char hex, use first 6 chars (ignore alpha)
  return `#${clean.slice(0, 6)}`;
}
