import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { PageRenderer } from "@/components/page-renderer";
import type { PageSpec, Section } from "@/types/page-spec";

// ---------------------------------------------------------------------------
// Helpers — build minimal PageSpec fixtures
// ---------------------------------------------------------------------------

function makeSection(overrides: Partial<Section> & { id: string }): Section {
  return {
    type: "content",
    components: [],
    order: 1,
    ...overrides,
  };
}

function makeSpec(sections: Section[]): PageSpec {
  return {
    id: "test-page",
    title: "Test Page",
    market: "us-hcp",
    product: "Lipitor",
    sections,
    metadata: {
      generatedBy: "test",
      generatedAt: "2026-03-14T00:00:00Z",
      market: "us-hcp",
      product: "Lipitor",
    },
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("PageRenderer", () => {
  it("renders a Hero component when spec contains componentId Hero", () => {
    const spec = makeSpec([
      makeSection({
        id: "s1",
        type: "hero",
        components: [
          {
            componentId: "Hero",
            props: { title: "Test Title", subtitle: "Sub" },
          },
        ],
        order: 1,
      }),
    ]);

    render(<PageRenderer spec={spec} />);

    expect(screen.getByText("Test Title")).toBeInTheDocument();
  });

  it("renders a Card component with props passed through", () => {
    const spec = makeSpec([
      makeSection({
        id: "s1",
        components: [
          {
            componentId: "Card",
            props: {
              title: "Card Heading",
              body: "Card body copy",
            },
          },
        ],
        order: 1,
      }),
    ]);

    render(<PageRenderer spec={spec} />);

    expect(screen.getByText("Card Heading")).toBeInTheDocument();
  });

  it("renders multiple sections in order (sorted by section.order)", () => {
    // Provide sections in reverse order to confirm sorting happens
    const spec = makeSpec([
      makeSection({
        id: "s2",
        components: [
          {
            componentId: "Card",
            props: { title: "Second Section", body: "body" },
          },
        ],
        order: 2,
      }),
      makeSection({
        id: "s1",
        type: "hero",
        components: [
          {
            componentId: "Hero",
            props: { title: "First Section", subtitle: "sub" },
          },
        ],
        order: 1,
      }),
    ]);

    render(<PageRenderer spec={spec} />);

    const allText = document.body.textContent ?? "";
    const firstIdx = allText.indexOf("First Section");
    const secondIdx = allText.indexOf("Second Section");

    expect(firstIdx).toBeGreaterThanOrEqual(0);
    expect(secondIdx).toBeGreaterThan(firstIdx);
  });

  it("skips unknown componentId without crashing (renders nothing for that ref)", () => {
    const spec = makeSpec([
      makeSection({
        id: "s1",
        components: [
          { componentId: "FakeWidget", props: { foo: "bar" } },
          {
            componentId: "Card",
            props: { title: "Real Card", body: "body" },
          },
        ],
        order: 1,
      }),
    ]);

    // Should not throw
    render(<PageRenderer spec={spec} />);

    // The known component still renders
    expect(screen.getByText("Real Card")).toBeInTheDocument();
    // FakeWidget produced nothing — no error boundary triggered
  });

  it("handles empty sections array gracefully", () => {
    const spec = makeSpec([
      makeSection({ id: "s1", components: [], order: 1 }),
    ]);

    // Should render without error even if no components in sections
    expect(() => render(<PageRenderer spec={spec} />)).not.toThrow();
  });

  it("passes props from ComponentRef to the rendered component", () => {
    const spec = makeSpec([
      makeSection({
        id: "s1",
        type: "hero",
        components: [
          {
            componentId: "Hero",
            props: {
              title: "Prop Title",
              subtitle: "Prop Subtitle",
              ctaText: "Click Me",
              ctaHref: "/click",
            },
          },
        ],
        order: 1,
      }),
    ]);

    render(<PageRenderer spec={spec} />);

    expect(screen.getByText("Prop Title")).toBeInTheDocument();
    expect(screen.getByText("Prop Subtitle")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Click Me" })).toHaveAttribute(
      "href",
      "/click",
    );
  });

  it("renders NavBar with links prop (NavLink[] structure passes through to component)", () => {
    const spec = makeSpec([
      makeSection({
        id: "s1",
        type: "navigation",
        components: [
          {
            componentId: "NavBar",
            props: {
              logo: "Test Logo",
              market: "US",
              links: [
                { label: "Home", href: "/" },
                { label: "About", href: "/about" },
              ],
            },
          },
        ],
        order: 1,
      }),
    ]);

    render(<PageRenderer spec={spec} />);

    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("About")).toBeInTheDocument();
  });

  it("renders DataTable with headers and rows props (string[][] structure passes through to component)", () => {
    const spec = makeSpec([
      makeSection({
        id: "s1",
        type: "data",
        components: [
          {
            componentId: "DataTable",
            props: {
              caption: "Efficacy Results",
              headers: ["Name", "Value"],
              rows: [
                ["A", "1"],
                ["B", "2"],
              ],
            },
          },
        ],
        order: 1,
      }),
    ]);

    render(<PageRenderer spec={spec} />);

    expect(screen.getByText("Name")).toBeInTheDocument();
    expect(screen.getByText("A")).toBeInTheDocument();
  });
});
