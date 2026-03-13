import Anthropic from "@anthropic-ai/sdk";
import type { StructuredReqs, Block, ComplianceIssue, Audience, Market, BlockType } from "@/types";

const client = new Anthropic();
const MODEL = "claude-opus-4-6";

// ─────────────────────────────────────────────────────────────────
// 1. BRIEF INTERPRETER
//    NL brief → StructuredReqs
//    Intakes promt and parses, returning JSON file
// ─────────────────────────────────────────────────────────────────

const BRIEF_SYSTEM_PROMPT = `You are a pharmaceutical web design brief interpreter for Pfizer's CXI design system.

Your job: parse a natural language design brief and return a structured JSON object.

Return ONLY valid JSON matching this exact schema — no markdown, no explanation:
{
  "audience": "hcp" | "patient" | "caregiver",
  "market": "us" | "uk" | "eu",
  "product": "string (drug/product name, or 'unknown')",
  "intent": "string (1-sentence description of page purpose)",
  "contentPatternId": "hcp-landing" | "patient-info" | "caregiver-guide" | "product-detail" | "campaign",
  "requiredComponents": ["array of: hero_banner, benefit_claim, safety_info, boxed_warning, side_effects, contraindications, isi_block, cta, fair_balance, disclaimer, generic"],
  "claims": ["array of efficacy/benefit claim strings found in the brief"]
}

Rules:
- If audience is "hcp", ALWAYS include "isi_block" in requiredComponents
- If benefit_claim is included, ALWAYS include "fair_balance" in requiredComponents
- Extract literal claim strings from the brief for the "claims" array
- Default market to "us" if not specified`;

export async function parseBrief(rawBrief: string): Promise<StructuredReqs> {
  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 1024,
    system: BRIEF_SYSTEM_PROMPT,
    messages: [{ role: "user", content: rawBrief }],
  });

  const text = response.content
    .filter((b) => b.type === "text")
    .map((b) => (b as { type: "text"; text: string }).text)
    .join("");

  // Strip any accidental markdown fences
  const clean = text.replace(/```json|```/g, "").trim();
  const parsed = JSON.parse(clean);

  return {
    audience: parsed.audience as Audience,
    market: parsed.market as Market,
    product: parsed.product || "unknown",
    intent: parsed.intent || "",
    contentPatternId: parsed.contentPatternId || "product-detail",
    requiredComponents: (parsed.requiredComponents || []) as BlockType[],
    claims: parsed.claims || [],
  };
}

// ─────────────────────────────────────────────────────────────────
// 2. LLM CLAIM EVALUATOR
//    Checks benefit/efficacy claims for pharma compliance issues
//    that deterministic rules can't catch (ambiguous language,
//    superlatives, unsubstantiated claims, etc.)
// ─────────────────────────────────────────────────────────────────

export interface ClaimEvaluation {
  claim: string;
  blockId: string;
  issues: Array<{
    ruleId: string;
    severity: "critical" | "high" | "warning";
    message: string;
    explanation: string;
    suggestion: string;
  }>;
  overallRisk: "high" | "medium" | "low";
}

const CLAIM_EVAL_SYSTEM_PROMPT = `You are a pharmaceutical regulatory compliance expert specialising in FDA and ABPI advertising standards.

Evaluate the provided benefit/efficacy claims from a pharmaceutical web page for compliance issues.

Check for:
1. SUPERLATIVES: "best", "most effective", "fastest", "superior", "only" — require substantiation
2. UNSUBSTANTIATED ABSOLUTE CLAIMS: definitive efficacy claims without "in clinical studies" or data reference
3. MISLEADING COMPARATIVES: comparing to competitors without study data
4. OFF-LABEL IMPLICATION: suggesting uses beyond approved indication
5. RISK MINIMISATION: downplaying side effects or contraindications
6. FAIR BALANCE VIOLATION: one-sided benefit presentation without corresponding risk info

Return ONLY valid JSON array — no markdown:
[
  {
    "claim": "exact claim text",
    "blockId": "block id",
    "issues": [
      {
        "ruleId": "LLM-01" through "LLM-06" matching above categories,
        "severity": "critical" | "high" | "warning",
        "message": "brief issue description",
        "explanation": "specific regulatory reason this is problematic",
        "suggestion": "concrete fix recommendation"
      }
    ],
    "overallRisk": "high" | "medium" | "low"
  }
]

Return an empty array [] if no issues found. Be precise and avoid false positives.`;

export async function evaluateClaims(
  blocks: Block[],
  reqs: StructuredReqs
): Promise<ClaimEvaluation[]> {
  const claimBlocks = blocks.filter(
    (b) => b.type === "benefit_claim" || reqs.claims.some((c) => b.text.includes(c))
  );

  if (claimBlocks.length === 0) return [];

  const claimsPayload = claimBlocks.map((b) => ({
    blockId: b.id,
    claim: b.text,
    audience: reqs.audience,
    market: reqs.market,
  }));

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 2048,
    system: CLAIM_EVAL_SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: `Market: ${reqs.market.toUpperCase()}, Audience: ${reqs.audience.toUpperCase()}\n\nClaims to evaluate:\n${JSON.stringify(claimsPayload, null, 2)}`,
      },
    ],
  });

  const text = response.content
    .filter((b) => b.type === "text")
    .map((b) => (b as { type: "text"; text: string }).text)
    .join("");

  const clean = text.replace(/```json|```/g, "").trim();
  return JSON.parse(clean) as ClaimEvaluation[];
}

// ─────────────────────────────────────────────────────────────────
// 3. AUTO-FIX GENERATOR
//    Given an issue, generate a specific corrected HTML snippet
// ─────────────────────────────────────────────────────────────────

export async function generateAutoFix(
  blockHtml: string,
  issue: ComplianceIssue
): Promise<string> {
  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 512,
    system: `You are a pharmaceutical web compliance engineer. Fix the provided HTML block to resolve a specific compliance issue.
Return ONLY the corrected HTML — no explanation, no markdown fences. Keep all content intact except what must change.`,
    messages: [
      {
        role: "user",
        content: `Issue: ${issue.message}\nRule: ${issue.ruleId}\nSource: ${issue.source}\n\nHTML to fix:\n${blockHtml}`,
      },
    ],
  });

  return response.content
    .filter((b) => b.type === "text")
    .map((b) => (b as { type: "text"; text: string }).text)
    .join("")
    .trim();
}
