// ─────────────────────────────────────────────
// Core domain types for the Compliance Engine
// ─────────────────────────────────────────────

export type Audience = "hcp" | "patient" | "caregiver";
export type Market = "us" | "uk" | "eu";
export type Severity = "critical" | "high" | "warning" | "info";

export type BlockType =
  | "hero_banner"
  | "benefit_claim"
  | "safety_info"
  | "boxed_warning"
  | "side_effects"
  | "contraindications"
  | "isi_block"
  | "cta"
  | "fair_balance"
  | "disclaimer"
  | "generic";

// ─── Brief (AI input) ───────────────────────
export interface DesignBrief {
  rawText: string; // natural language input from user
}

// ─── Structured requirements (AI output) ────
export interface StructuredReqs {
  audience: Audience;
  market: Market;
  product: string;
  intent: string;
  contentPatternId: string;
  requiredComponents: BlockType[];
  claims: string[]; // benefit/efficacy claims to validate
}

// ─── Page block ─────────────────────────────
export interface Block {
  id: string;
  type: BlockType;
  text: string;
  metadata: Record<string, unknown>;
  html: string;
}

// ─── Compliance issue ────────────────────────
export interface ComplianceIssue {
  ruleId: string;
  blockId: string;
  severity: Severity;
  message: string;
  source: string;
  autoFix?: AutoFix;
  llmEvaluated?: boolean; // was this flagged by LLM, not deterministic rule?
  explanation?: string;   // LLM reasoning if applicable
}

// ─── Auto-fix ───────────────────────────────
export type AutoFixAction =
  | { type: "append_block"; blockType: BlockType; content: string }
  | { type: "replace_text"; original: string; replacement: string }
  | { type: "add_attribute"; attribute: string; value: string }
  | { type: "remove_element"; selector: string };

export interface AutoFix {
  description: string;
  action: AutoFixAction;
  previewHtml: string;
}

// ─── Compliance result ───────────────────────
export interface ComplianceResult {
  pageId: string;
  audience: Audience;
  market: Market;
  product: string;
  status: "PASS" | "FAIL" | "WARN";
  score: number; // 0–100
  issues: ComplianceIssue[];
  blocks: (Block & { issues: ComplianceIssue[]; afterHtml: string })[];
  checkedAt: string;
  modelUsed?: string;
}

// ─── Rule definition ────────────────────────
export interface ComplianceRule {
  id: string;
  category: "brand" | "a11y" | "pharma" | "market" | "content";
  description: string;
  severity: Severity;
  condition: (block: Block, reqs: StructuredReqs) => boolean; // true = issue found
  message: string;
  source: string;
  autoFix?: (block: Block) => AutoFix;
}
