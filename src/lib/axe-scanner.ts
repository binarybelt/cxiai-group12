/**
 * axe-scanner.ts
 *
 * Browser-only wrapper around axe-core for WCAG AA accessibility scanning.
 *
 * IMPORTANT: This module uses a dynamic import of axe-core and must only be
 * called from browser-side code (client components, test environments with
 * jsdom). Never import this file in Next.js API routes or server components.
 *
 * Usage:
 *   const violations = await scanForA11yViolations(containerElement);
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface A11yViolationNode {
  html: string;
  failureSummary: string | undefined;
}

export interface A11yViolation {
  id: string;
  impact: string | null | undefined;
  description: string;
  help: string;
  helpUrl: string;
  nodes: A11yViolationNode[];
}

// ---------------------------------------------------------------------------
// scanForA11yViolations
// ---------------------------------------------------------------------------

/**
 * Scans the given HTML element for WCAG 2A and 2AA accessibility violations.
 *
 * Color-contrast is disabled by default because jsdom does not compute CSS
 * styles, making that rule unreliable in non-browser environments.
 *
 * @param container - The HTMLElement to scan. Must be attached to the DOM.
 * @returns Promise resolving to an array of A11yViolation objects (empty = no issues).
 */
export async function scanForA11yViolations(
  container: HTMLElement,
): Promise<A11yViolation[]> {
  // Dynamic import keeps this module out of the server bundle.
  const axe = (await import("axe-core")).default;

  const results = await axe.run(container, {
    runOnly: { type: "tag", values: ["wcag2a", "wcag2aa"] },
    rules: {
      // Disabled because jsdom does not compute CSS, causing false positives.
      "color-contrast": { enabled: false },
    },
  });

  return results.violations.map((violation) => ({
    id: violation.id,
    impact: violation.impact,
    description: violation.description,
    help: violation.help,
    helpUrl: violation.helpUrl,
    nodes: violation.nodes.map((node) => ({
      html: node.html,
      failureSummary: node.failureSummary,
    })),
  }));
}
