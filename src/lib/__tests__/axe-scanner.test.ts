/**
 * Unit tests for axe-core scanner wrapper.
 *
 * Runs in jsdom environment. Color-contrast rule is disabled because jsdom
 * does not compute CSS, making that rule unreliable in this environment.
 */
import { describe, it, expect, afterEach } from "vitest";
import { scanForA11yViolations } from "@/lib/axe-scanner";

// ---- Helpers ----------------------------------------------------------------

function createContainer(): HTMLElement {
  const div = document.createElement("div");
  document.body.appendChild(div);
  return div;
}

function cleanup(container: HTMLElement): void {
  document.body.removeChild(container);
}

// ---- Tests ------------------------------------------------------------------

describe("scanForA11yViolations", () => {
  let container: HTMLElement;

  afterEach(() => {
    if (container && document.body.contains(container)) {
      cleanup(container);
    }
  });

  it("returns an empty array for accessible HTML (div with text content)", async () => {
    container = createContainer();
    container.innerHTML = `
      <main>
        <h1>Page Title</h1>
        <p>Accessible paragraph content.</p>
      </main>
    `;

    const violations = await scanForA11yViolations(container);

    expect(violations).toBeInstanceOf(Array);
    expect(violations.length).toBe(0);
  });

  it("returns a violation for img element without alt attribute", async () => {
    container = createContainer();
    container.innerHTML = `<img src="test.png" />`;

    const violations = await scanForA11yViolations(container);

    const imageAltViolation = violations.find((v) => v.id === "image-alt");
    expect(imageAltViolation).toBeDefined();
  });

  it("returns violation objects with required fields (id, impact, description, help, helpUrl, nodes)", async () => {
    container = createContainer();
    container.innerHTML = `<img src="banner.png" />`;

    const violations = await scanForA11yViolations(container);

    expect(violations.length).toBeGreaterThan(0);

    const violation = violations[0];
    expect(violation).toHaveProperty("id");
    expect(violation).toHaveProperty("impact");
    expect(violation).toHaveProperty("description");
    expect(violation).toHaveProperty("help");
    expect(violation).toHaveProperty("helpUrl");
    expect(violation).toHaveProperty("nodes");
    expect(Array.isArray(violation.nodes)).toBe(true);

    if (violation.nodes.length > 0) {
      expect(violation.nodes[0]).toHaveProperty("html");
      expect(violation.nodes[0]).toHaveProperty("failureSummary");
    }
  });

  it("does not return color-contrast violations (disabled for jsdom environment)", async () => {
    container = createContainer();
    // Render text that would normally fail color-contrast in a real browser
    container.innerHTML = `
      <p style="color: #aaa; background-color: #bbb;">Low contrast text</p>
    `;

    const violations = await scanForA11yViolations(container);

    const colorContrastViolation = violations.find(
      (v) => v.id === "color-contrast",
    );
    expect(colorContrastViolation).toBeUndefined();
  });
});
