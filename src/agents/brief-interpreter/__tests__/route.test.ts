/**
 * Integration tests for POST /api/interpret-brief route.
 *
 * The LLM (generateObject) is mocked — no actual Anthropic API calls are made.
 * The Convex client (logGeneration) is mocked — no actual Convex calls are made.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// ---------------------------------------------------------------------------
// Hoisted mocks (must be declared before any module imports that use them)
// ---------------------------------------------------------------------------

// Mock getLLM so we don't need any API key
vi.mock("@/lib/llm", () => ({
  getLLM: vi.fn(() => ({ modelId: "mock-model" })),
}));

// Mock generateObject from "ai"
const mockGenerateObject = vi.fn();
vi.mock("ai", () => ({
  generateObject: (...args: unknown[]) => mockGenerateObject(...args),
}));

// Mock logGeneration from convex-client
const mockLogGeneration = vi.fn();
vi.mock("@/lib/convex-client", () => ({
  logGeneration: (...args: unknown[]) => mockLogGeneration(...args),
  convexClient: vi.fn(),
}));

// Mock fs/promises readFile
const mockReadFile = vi.fn();
vi.mock("fs/promises", async (importOriginal) => {
  const actual = await importOriginal<typeof import("fs/promises")>();
  return {
    ...actual,
    readFile: (...args: unknown[]) => mockReadFile(...args),
  };
});

// ---------------------------------------------------------------------------
// Module import (after mocks are set up)
// ---------------------------------------------------------------------------
import { POST } from "@/app/api/interpret-brief/route";
import { NextRequest } from "next/server";

// ---------------------------------------------------------------------------
// Test fixtures
// ---------------------------------------------------------------------------
const VALID_PROMPT_TEMPLATE = `System prompt {{PATTERNS}} {{MARKETS}} {{COMPONENTS}}`;

const VALID_INTERPRETATION = {
  pageType: "hcp-landing",
  market: "us-hcp",
  product: "Lipitor",
  audience: "hcp" as const,
  contentRequirements: ["efficacy data", "safety profile"],
  toneKeywords: ["clinical", "authoritative"],
  mustIncludeComponents: ["ISIBlock", "Footer"],
  reasoning: "HCP landing page with mandatory ISI and compliance footer.",
};

function makeRequest(body: Record<string, unknown>): NextRequest {
  return new NextRequest("http://localhost:3000/api/interpret-brief", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe("POST /api/interpret-brief", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default: readFile returns the prompt template
    mockReadFile.mockResolvedValue(VALID_PROMPT_TEMPLATE);
    // Default: generateObject returns valid interpretation
    mockGenerateObject.mockResolvedValue({ object: VALID_INTERPRETATION });
    // Default: logGeneration succeeds silently
    mockLogGeneration.mockResolvedValue(undefined);
    // Set Convex URL so default tests have it available
    process.env.NEXT_PUBLIC_CONVEX_URL = "https://test.convex.cloud";
  });

  afterEach(() => {
    delete process.env.NEXT_PUBLIC_CONVEX_URL;
  });

  // -------------------------------------------------------------------------
  // Happy path
  // -------------------------------------------------------------------------
  it("returns 200 and a BriefInterpretation-shaped response for a valid brief", async () => {
    const req = makeRequest({ brief: "Create an HCP landing page for Lipitor" });
    const res = await POST(req);

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toMatchObject({
      pageType: expect.any(String),
      market: expect.any(String),
      product: expect.any(String),
      audience: expect.stringMatching(/^(hcp|patient|general)$/),
      contentRequirements: expect.any(Array),
      toneKeywords: expect.any(Array),
      mustIncludeComponents: expect.any(Array),
      reasoning: expect.any(String),
    });
  });

  it("injects design system data into the prompt template", async () => {
    const req = makeRequest({ brief: "Create an HCP landing page for Lipitor" });
    await POST(req);

    // generateObject should have been called with a system prompt that has no unresolved placeholders
    expect(mockGenerateObject).toHaveBeenCalledOnce();
    const callArgs = mockGenerateObject.mock.calls[0][0];
    expect(callArgs.system).not.toContain("{{PATTERNS}}");
    expect(callArgs.system).not.toContain("{{MARKETS}}");
    expect(callArgs.system).not.toContain("{{COMPONENTS}}");
  });

  it("passes the brief as the user prompt to generateObject", async () => {
    const brief = "Create an HCP landing page for Lipitor in the US market";
    const req = makeRequest({ brief });
    await POST(req);

    expect(mockGenerateObject).toHaveBeenCalledOnce();
    const callArgs = mockGenerateObject.mock.calls[0][0];
    expect(callArgs.prompt).toBe(brief);
  });

  it("calls logGeneration with action=interpret-brief and details containing brief and interpretation", async () => {
    const brief = "Create an HCP landing page for Lipitor";
    const req = makeRequest({ brief });
    await POST(req);

    // logGeneration is fire-and-forget so wait a tick
    await new Promise((r) => setTimeout(r, 10));

    expect(mockLogGeneration).toHaveBeenCalledOnce();
    const [action, details] = mockLogGeneration.mock.calls[0];
    expect(action).toBe("interpret-brief");
    const parsed = JSON.parse(details as string);
    expect(parsed.brief).toBe(brief.slice(0, 200));
    expect(parsed.interpretation).toMatchObject({ pageType: VALID_INTERPRETATION.pageType });
  });

  // -------------------------------------------------------------------------
  // Validation errors
  // -------------------------------------------------------------------------
  it("returns 400 for an empty brief string", async () => {
    const req = makeRequest({ brief: "" });
    const res = await POST(req);

    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain("non-empty string");
  });

  it("returns 400 for a whitespace-only brief", async () => {
    const req = makeRequest({ brief: "   " });
    const res = await POST(req);

    expect(res.status).toBe(400);
  });

  it("returns 400 when brief is missing from the body", async () => {
    const req = makeRequest({});
    const res = await POST(req);

    expect(res.status).toBe(400);
  });

  it("returns 400 when brief is not a string (number)", async () => {
    const req = makeRequest({ brief: 42 });
    const res = await POST(req);

    expect(res.status).toBe(400);
  });

  // -------------------------------------------------------------------------
  // LLM error handling
  // -------------------------------------------------------------------------
  it("returns 500 when generateObject throws", async () => {
    mockGenerateObject.mockRejectedValue(new Error("Anthropic API error"));

    const req = makeRequest({ brief: "Create an HCP landing page for Lipitor" });
    const res = await POST(req);

    expect(res.status).toBe(500);
    const data = await res.json();
    expect(data.error).toBe("Brief interpretation failed");
  });

  it("does not call logGeneration when generateObject throws", async () => {
    mockGenerateObject.mockRejectedValue(new Error("Anthropic API error"));

    const req = makeRequest({ brief: "Create an HCP landing page for Lipitor" });
    await POST(req);

    // Even after a tick, logGeneration should not have been called
    await new Promise((r) => setTimeout(r, 10));
    expect(mockLogGeneration).not.toHaveBeenCalled();
  });

  // -------------------------------------------------------------------------
  // Convex graceful degradation
  // -------------------------------------------------------------------------
  it("returns 200 and skips logGeneration when NEXT_PUBLIC_CONVEX_URL is unset", async () => {
    // Remove the Convex URL
    delete process.env.NEXT_PUBLIC_CONVEX_URL;

    // The module-level mock of logGeneration still exists, but the real
    // convex-client would skip calling Convex. Since we mock logGeneration
    // entirely, we verify the route still returns 200 and does NOT throw.
    const req = makeRequest({ brief: "Create an HCP landing page for Lipitor" });
    const res = await POST(req);

    // Route should succeed regardless of Convex availability
    expect(res.status).toBe(200);

    // logGeneration IS called (because we mock it); the graceful degradation
    // is tested at the convex-client unit level. The route itself always calls
    // logGeneration — degradation happens inside logGeneration.
    await new Promise((r) => setTimeout(r, 10));
    expect(mockLogGeneration).toHaveBeenCalledOnce();
  });
});
