/**
 * Tests for ComplianceSidebar component.
 *
 * Mocks @/lib/compliance and @/lib/axe-scanner to allow unit-level control
 * of violations and scores.
 */
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import React, { createRef } from "react";

import type { PageSpec } from "@/types/page-spec";
import type { ComplianceViolation } from "@/types/compliance";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

const mockRunBrandChecks = vi.fn();
const mockRunPharmaChecks = vi.fn();
const mockComputeScore = vi.fn();
const mockApplyAutoFix = vi.fn();

vi.mock("@/lib/compliance", () => ({
  runBrandChecks: (...args: unknown[]) => mockRunBrandChecks(...args),
  runPharmaChecks: (...args: unknown[]) => mockRunPharmaChecks(...args),
  computeScore: (...args: unknown[]) => mockComputeScore(...args),
  applyAutoFix: (...args: unknown[]) => mockApplyAutoFix(...args),
}));

// axe-scanner is dynamically imported in the component — mock the module
vi.mock("@/lib/axe-scanner", () => ({
  scanForA11yViolations: vi.fn().mockResolvedValue([]),
}));

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

function makeSpec(): PageSpec {
  return {
    id: "test-spec",
    title: "Test Page",
    market: "us-hcp",
    product: "Lipitor",
    sections: [
      {
        id: "section-1",
        type: "hero",
        components: [
          {
            componentId: "Hero",
            props: { title: "Title" },
          },
        ],
        order: 1,
      },
    ],
    metadata: {
      generatedBy: "test",
      generatedAt: "2026-03-14T00:00:00Z",
      market: "us-hcp",
      product: "Lipitor",
    },
  };
}

function makeViolation(
  overrides: Partial<ComplianceViolation> = {},
): ComplianceViolation {
  return {
    ruleId: "brand-component-only",
    category: "brand",
    severity: "error",
    message: "Component X is not approved",
    autoFixable: false,
    location: { sectionId: "section-1" },
    ...overrides,
  };
}

function makeScore(overrides = {}) {
  return { overall: 80, brand: 90, accessibility: 70, pharma: 80, ...overrides };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("ComplianceSidebar", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRunBrandChecks.mockReturnValue([]);
    mockRunPharmaChecks.mockReturnValue([]);
    mockComputeScore.mockReturnValue(makeScore());
    mockApplyAutoFix.mockImplementation((spec: PageSpec) => spec);
  });

  it("renders overall score when spec is provided", async () => {
    mockComputeScore.mockReturnValue(makeScore({ overall: 85 }));

    const { ComplianceSidebar } = await import("@/components/compliance-sidebar");
    const ref = createRef<HTMLDivElement>();
    render(
      <ComplianceSidebar spec={makeSpec()} previewRef={ref} onAutoFix={vi.fn()} />,
    );

    expect(screen.getByText("85")).toBeInTheDocument();
  });

  it("renders brand, accessibility, and pharma sub-scores", async () => {
    mockComputeScore.mockReturnValue(makeScore({ brand: 90, accessibility: 70, pharma: 80 }));

    const { ComplianceSidebar } = await import("@/components/compliance-sidebar");
    const ref = createRef<HTMLDivElement>();
    render(
      <ComplianceSidebar spec={makeSpec()} previewRef={ref} onAutoFix={vi.fn()} />,
    );

    expect(screen.getByText("Brand")).toBeInTheDocument();
    expect(screen.getByText("Accessibility")).toBeInTheDocument();
    expect(screen.getByText("Pharma")).toBeInTheDocument();
  });

  it("lists violation messages grouped by category", async () => {
    mockRunBrandChecks.mockReturnValue([
      makeViolation({ category: "brand", message: "Brand violation one" }),
    ]);
    mockRunPharmaChecks.mockReturnValue([
      makeViolation({ category: "pharma", message: "Pharma violation one" }),
    ]);
    mockComputeScore.mockReturnValue(makeScore({ overall: 50 }));

    const { ComplianceSidebar } = await import("@/components/compliance-sidebar");
    const ref = createRef<HTMLDivElement>();
    render(
      <ComplianceSidebar spec={makeSpec()} previewRef={ref} onAutoFix={vi.fn()} />,
    );

    await waitFor(() => {
      expect(screen.getByText("Brand violation one")).toBeInTheDocument();
      expect(screen.getByText("Pharma violation one")).toBeInTheDocument();
    });
  });

  it("renders Fix button for violations with autoFixable:true", async () => {
    mockRunBrandChecks.mockReturnValue([
      makeViolation({ autoFixable: true, message: "Fixable violation" }),
    ]);

    const { ComplianceSidebar } = await import("@/components/compliance-sidebar");
    const ref = createRef<HTMLDivElement>();
    render(
      <ComplianceSidebar spec={makeSpec()} previewRef={ref} onAutoFix={vi.fn()} />,
    );

    await waitFor(() => {
      expect(screen.getByText("Fixable violation")).toBeInTheDocument();
    });
    expect(screen.getByRole("button", { name: /fix/i })).toBeInTheDocument();
  });

  it("calls onAutoFix callback with fixed spec when Fix button is clicked", async () => {
    const spec = makeSpec();
    const fixedSpec = { ...spec, id: "fixed-spec" };
    mockRunBrandChecks.mockReturnValue([
      makeViolation({ autoFixable: true, message: "Fixable violation" }),
    ]);
    mockApplyAutoFix.mockReturnValue(fixedSpec);
    const onAutoFix = vi.fn();

    const { ComplianceSidebar } = await import("@/components/compliance-sidebar");
    const ref = createRef<HTMLDivElement>();
    render(
      <ComplianceSidebar spec={spec} previewRef={ref} onAutoFix={onAutoFix} />,
    );

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /fix/i })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: /fix/i }));
    expect(onAutoFix).toHaveBeenCalledWith(fixedSpec);
  });

  it('renders "All checks passed" when spec has no violations', async () => {
    mockRunBrandChecks.mockReturnValue([]);
    mockRunPharmaChecks.mockReturnValue([]);
    mockComputeScore.mockReturnValue(makeScore({ overall: 100 }));

    const { ComplianceSidebar } = await import("@/components/compliance-sidebar");
    const ref = createRef<HTMLDivElement>();
    render(
      <ComplianceSidebar spec={makeSpec()} previewRef={ref} onAutoFix={vi.fn()} />,
    );

    await waitFor(() => {
      expect(screen.getByText(/all checks passed/i)).toBeInTheDocument();
    });
  });

  it("renders placeholder text when spec is null", async () => {
    const { ComplianceSidebar } = await import("@/components/compliance-sidebar");
    const ref = createRef<HTMLDivElement>();
    render(
      <ComplianceSidebar spec={null} previewRef={ref} onAutoFix={vi.fn()} />,
    );

    expect(
      screen.getByText(/generate a page to see compliance results/i),
    ).toBeInTheDocument();
  });
});
