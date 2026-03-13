import type {
  Block, StructuredReqs, ComplianceResult, ComplianceIssue, BlockType
} from "@/types";
import { RULES, setPageContext } from "./rules";
import { evaluateClaims } from "./claude";

// ─────────────────────────────────────────────────────────────────
// BLOCK FACTORY
// Converts StructuredReqs into Block objects for checking.
// In production these come from the page builder / CMS.
// ─────────────────────────────────────────────────────────────────

let _blockCounter = 0;

export function createBlock(
  type: BlockType,
  text: string,
  metadata: Record<string, unknown> = {}
): Block {
  _blockCounter++;
  const id = `block-${_blockCounter}`;
  return {
    id,
    type,
    text,
    metadata,
    html: generateBlockHtml(id, type, text),
  };
}

function generateBlockHtml(id: string, type: BlockType, text: string): string {
  const classMap: Record<string, string> = {
    hero_banner: "hero-banner",
    benefit_claim: "benefit-claim",
    safety_info: "safety-info",
    boxed_warning: "boxed-warning",
    side_effects: "side-effects",
    contraindications: "contraindications",
    isi_block: "isi-block",
    cta: "cta-block",
    fair_balance: "fair-balance",
    disclaimer: "disclaimer",
    generic: "generic-block",
  };
  return `<div id="${id}" class="${classMap[type] || "block"}">${text || ""}</div>`;
}

// ─────────────────────────────────────────────────────────────────
// SCORE CALCULATOR
// ─────────────────────────────────────────────────────────────────

function calculateScore(issues: ComplianceIssue[]): number {
  let score = 100;
  for (const issue of issues) {
    if (issue.severity === "critical") score -= 40;
    else if (issue.severity === "high") score -= 15;
    else if (issue.severity === "warning") score -= 5;
    else if (issue.severity === "info") score -= 1;
  }
  return Math.max(0, score);
}

function getStatus(score: number, issues: ComplianceIssue[]): "PASS" | "FAIL" | "WARN" {
  const hasCritical = issues.some((i) => i.severity === "critical");
  if (hasCritical || score < 50) return "FAIL";
  if (score < 80) return "WARN";
  return "PASS";
}

// ─────────────────────────────────────────────────────────────────
// MAIN ENGINE
// ─────────────────────────────────────────────────────────────────

export async function runComplianceCheck(
  blocks: Block[],
  reqs: StructuredReqs,
  pageId: string = `page-${Date.now()}`
): Promise<ComplianceResult> {
  _blockCounter = 0;

  // Set page-level context so rules can inspect sibling blocks
  setPageContext(blocks);

  const allIssues: ComplianceIssue[] = [];

  // ── 1. Deterministic rules ──────────────────────────────────
  for (const block of blocks) {
    for (const rule of RULES) {
      try {
        const triggered = rule.condition(block, reqs);
        if (triggered) {
          allIssues.push({
            ruleId: rule.id,
            blockId: block.id,
            severity: rule.severity,
            message: rule.message,
            source: rule.source,
            autoFix: rule.autoFix ? rule.autoFix(block) : undefined,
            llmEvaluated: false,
          });
        }
      } catch {
        // Rule evaluation errors should not crash the engine
        console.error(`Rule ${rule.id} threw an error on block ${block.id}`);
      }
    }
  }

  // ── 2. LLM claim evaluation (hybrid layer) ──────────────────
  let llmIssues: ComplianceIssue[] = [];
  try {
    const claimEvaluations = await evaluateClaims(blocks, reqs);
    llmIssues = claimEvaluations.flatMap((eval_) =>
      eval_.issues.map((issue) => ({
        ruleId: issue.ruleId,
        blockId: eval_.blockId,
        severity: issue.severity,
        message: issue.message,
        source: "Claude LLM Evaluation — FDA/ABPI Claim Standards",
        llmEvaluated: true,
        explanation: issue.explanation,
        autoFix: {
          description: issue.suggestion,
          action: { type: "replace_text" as const, original: eval_.claim, replacement: issue.suggestion },
          previewHtml: `<p class="claim-revised">${issue.suggestion}</p>`,
        },
      }))
    );
  } catch (err) {
    console.error("LLM evaluation failed, continuing with deterministic results only:", err);
  }

  const combinedIssues = [...allIssues, ...llmIssues];

  // ── 3. Build per-block result ────────────────────────────────
  const blocksWithIssues = blocks.map((block) => {
    const blockIssues = combinedIssues.filter((i) => i.blockId === block.id);
    const afterHtml = blockIssues[0]?.autoFix?.previewHtml ?? block.html;
    return { ...block, issues: blockIssues, afterHtml };
  });

  const score = calculateScore(combinedIssues);

  return {
    pageId,
    audience: reqs.audience,
    market: reqs.market,
    product: reqs.product,
    status: getStatus(score, combinedIssues),
    score,
    issues: combinedIssues,
    blocks: blocksWithIssues,
    checkedAt: new Date().toISOString(),
    modelUsed: "claude-opus-4-6",
  };
}

// ─────────────────────────────────────────────────────────────────
// BRIEF → BLOCKS MAPPER
// Maps StructuredReqs components to actual Block objects.
// In a real system, the page builder provides these.
// This simulates them for demo purposes.
// ─────────────────────────────────────────────────────────────────

export function buildBlocksFromReqs(reqs: StructuredReqs, rawBrief: string): Block[] {
  const blocks: Block[] = [];

  // Extract inline content hints from brief
  const hasBenefitText = reqs.claims.length > 0;

  for (const componentType of reqs.requiredComponents) {
    switch (componentType) {
      case "hero_banner":
        blocks.push(createBlock("hero_banner", `${reqs.product} — ${reqs.intent}`));
        break;
      case "benefit_claim":
        blocks.push(
          createBlock(
            "benefit_claim",
            hasBenefitText ? reqs.claims[0] : `${reqs.product} provides effective treatment`
          )
        );
        if (reqs.claims.length > 1) {
          for (let i = 1; i < reqs.claims.length; i++) {
            blocks.push(createBlock("benefit_claim", reqs.claims[i]));
          }
        }
        break;
      case "boxed_warning":
        blocks.push(
          createBlock("boxed_warning", "INSERT BOXED WARNING TEXT", { isPresent: true })
        );
        break;
      case "side_effects":
        blocks.push(
          createBlock("side_effects", "Common side effects include nausea.", {
            commonSideEffects: ["nausea"],
          })
        );
        break;
      case "contraindications":
        blocks.push(createBlock("contraindications", "")); // intentionally empty to trigger P-05
        break;
      case "isi_block":
        blocks.push(
          createBlock(
            "isi_block",
            "IMPORTANT SAFETY INFORMATION: Please see full Prescribing Information including Boxed Warning."
          )
        );
        break;
      case "fair_balance":
        blocks.push(
          createBlock(
            "fair_balance",
            "Please see Important Safety Information and full Prescribing Information."
          )
        );
        break;
      case "cta":
        blocks.push(createBlock("cta", "Learn More", {}));
        break;
      case "disclaimer":
        blocks.push(
          createBlock(
            "disclaimer",
            reqs.market === "uk"
              ? "For prescribing information see [link]. ABPI Code of Practice."
              : "Please report adverse events to 1-800-FDA-1088."
          )
        );
        break;
      default:
        if (rawBrief.length > 0) {
          blocks.push(createBlock("generic", componentType));
        }
    }
  }

  return blocks;
}
