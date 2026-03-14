/**
 * Tests for role-based view components: AuditTrail, MarketerView, QAView, DeveloperView.
 */
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import React from "react";

import type { PageSpec } from "@/types/page-spec";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

// Mock Convex useQuery — returns undefined by default (no connection)
const mockUseQuery = vi.fn();
vi.mock("convex/react", () => ({
  useQuery: (...args: unknown[]) => mockUseQuery(...args),
}));

// Mock the Convex generated API so imports don't fail.
// The audit-trail component imports from "../../convex/_generated/api" (relative),
// which resolves to the convex/_generated/api module. We mock by resolved path.
vi.mock("../../../convex/_generated/api", () => ({
  api: {
    auditLog: {
      getRecentLogs: "auditLog:getRecentLogs",
    },
  },
}));

// Mock ComplianceSidebar as a simple stub
vi.mock("@/components/compliance-sidebar", () => ({
  ComplianceSidebar: () => <div data-testid="compliance-sidebar">ComplianceSidebar</div>,
  default: () => <div data-testid="compliance-sidebar">ComplianceSidebar</div>,
}));

// Mock ChatPanel as a simple stub
vi.mock("@/components/chat-panel", () => ({
  ChatPanel: () => <div data-testid="chat-panel">ChatPanel</div>,
  default: () => <div data-testid="chat-panel">ChatPanel</div>,
}));

// Mock ExplainabilityPanel
vi.mock("@/components/explainability-panel", () => ({
  ExplainabilityPanel: () => <div data-testid="explainability-panel">ExplainabilityPanel</div>,
  default: () => <div data-testid="explainability-panel">ExplainabilityPanel</div>,
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
        id: "section-hero",
        type: "hero",
        components: [
          { componentId: "Hero", props: { title: "Hello" } },
        ],
        order: 1,
      },
      {
        id: "section-cta",
        type: "cta",
        components: [
          { componentId: "CTABanner", props: { label: "Click" } },
        ],
        order: 2,
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

// ---------------------------------------------------------------------------
// AuditTrail tests
// ---------------------------------------------------------------------------

describe("AuditTrail", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders "No audit events yet" when log entries array is empty', async () => {
    mockUseQuery.mockReturnValue([]);
    const { AuditTrail } = await import("@/components/audit-trail");
    render(<AuditTrail />);
    expect(screen.getByText(/no audit events yet/i)).toBeInTheDocument();
  });

  it("renders timestamped entries when data is provided", async () => {
    mockUseQuery.mockReturnValue([
      {
        _id: "1",
        action: "page.generated",
        details: "Generated page from brief",
        timestamp: 1710400000000,
        actor: "system",
      },
      {
        _id: "2",
        action: "compliance.checked",
        details: "Ran compliance checks",
        timestamp: 1710400001000,
        actor: "system",
      },
    ]);
    const { AuditTrail } = await import("@/components/audit-trail");
    render(<AuditTrail />);
    expect(screen.getByText("page.generated")).toBeInTheDocument();
    expect(screen.getByText("compliance.checked")).toBeInTheDocument();
  });

  it('renders "Loading audit trail..." when query returns undefined', async () => {
    mockUseQuery.mockReturnValue(undefined);
    const { AuditTrail } = await import("@/components/audit-trail");
    render(<AuditTrail />);
    expect(screen.getByText(/loading audit trail/i)).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// MarketerView tests
// ---------------------------------------------------------------------------

describe("MarketerView", () => {
  it("renders score badge with green color for score > 80", async () => {
    const { MarketerView } = await import("@/components/role-views/marketer-view");
    const result = MarketerView({
      brief: "",
      setBrief: vi.fn(),
      onSubmit: vi.fn(),
      canSubmit: false,
      buttonLabel: "Generate",
      interpretation: null,
      currentSpec: null,
      onEditComplete: vi.fn(),
      score: 85,
    });
    render(<>{result.right}</>);
    const badge = screen.getByTestId("score-badge");
    expect(badge).toHaveClass("text-green-600");
  });

  it("renders score badge with amber color for score > 60 and <= 80", async () => {
    const { MarketerView } = await import("@/components/role-views/marketer-view");
    const result = MarketerView({
      brief: "",
      setBrief: vi.fn(),
      onSubmit: vi.fn(),
      canSubmit: false,
      buttonLabel: "Generate",
      interpretation: null,
      currentSpec: null,
      onEditComplete: vi.fn(),
      score: 70,
    });
    render(<>{result.right}</>);
    const badge = screen.getByTestId("score-badge");
    expect(badge).toHaveClass("text-yellow-500");
  });

  it("renders score badge with red color for score <= 60", async () => {
    const { MarketerView } = await import("@/components/role-views/marketer-view");
    const result = MarketerView({
      brief: "",
      setBrief: vi.fn(),
      onSubmit: vi.fn(),
      canSubmit: false,
      buttonLabel: "Generate",
      interpretation: null,
      currentSpec: null,
      onEditComplete: vi.fn(),
      score: 40,
    });
    render(<>{result.right}</>);
    const badge = screen.getByTestId("score-badge");
    expect(badge).toHaveClass("text-red-500");
  });
});

// ---------------------------------------------------------------------------
// QAView tests
// ---------------------------------------------------------------------------

describe("QAView", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseQuery.mockReturnValue([]);
  });

  it("renders AuditTrail component", async () => {
    const { QAView } = await import("@/components/role-views/qa-view");
    const ref = React.createRef<HTMLDivElement>();
    const result = QAView({
      currentSpec: null,
      previewRef: ref,
      onAutoFix: vi.fn(),
      gateViolations: null,
    });
    render(<>{result.left}</>);
    // AuditTrail with empty data should show "No audit events yet"
    expect(screen.getByText(/no audit events yet/i)).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// DeveloperView tests
// ---------------------------------------------------------------------------

describe("DeveloperView", () => {
  it("renders JSON.stringify of spec", async () => {
    const spec = makeSpec();
    const { DeveloperView } = await import("@/components/role-views/developer-view");
    const result = DeveloperView({
      currentSpec: spec,
      rawVariants: null,
      selectedVariant: 0,
    });
    render(<>{result.right}</>);
    // Should contain the spec id in JSON output
    expect(screen.getByText(/"test-spec"/)).toBeInTheDocument();
  });

  it("shows placeholder when spec is null", async () => {
    const { DeveloperView } = await import("@/components/role-views/developer-view");
    const result = DeveloperView({
      currentSpec: null,
      rawVariants: null,
      selectedVariant: 0,
    });
    render(<>{result.right}</>);
    expect(
      screen.getByText(/generate a page to see the code output/i),
    ).toBeInTheDocument();
  });
});
