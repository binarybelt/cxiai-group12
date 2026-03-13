import type { ComplianceRule, Block, StructuredReqs, AutoFix } from "@/types";

// ─────────────────────────────────────────────────────────────────
// DETERMINISTIC COMPLIANCE RULES
// These run without an LLM — fast, predictable, auditable.
// New rules = new entries here. No code changes elsewhere needed.
// ─────────────────────────────────────────────────────────────────

const APPROVED_COLOR_TOKENS = [
  "primary-blue-500", "primary-blue-700",
  "coral-400", "coral-600",
  "amber-300", "amber-500",
  "neutral-900", "neutral-100", "white",
];

const APPROVED_FONT_TOKENS = ["heading-lg", "heading-md", "body-md", "body-sm", "caption"];

function hasBlockType(blocks: Block[], type: string): boolean {
  return blocks.some((b) => b.type === type);
}

// Helper used within rule closures that need sibling context
// We attach page-level context before running rules
export let _pageBlocks: Block[] = [];
export function setPageContext(blocks: Block[]) {
  _pageBlocks = blocks;
}

// ─── Pharma Rules ────────────────────────────────────────────────

export const RULES: ComplianceRule[] = [
  // P-01: HCP pages must have ISI block
  {
    id: "P-01",
    category: "pharma",
    description: "ISI block required on HCP pages",
    severity: "critical",
    condition: (_block: Block, reqs: StructuredReqs) => {
      if (reqs.audience !== "hcp") return false;
      return !hasBlockType(_pageBlocks, "isi_block");
    },
    message: "HCP-facing pages require an Important Safety Information (ISI) block. Missing from this page.",
    source: "FDA 21 CFR Part 202 — Prescription Drug Advertising",
    autoFix: (_block: Block): AutoFix => ({
      description: "Append ISI block at the bottom of the page",
      action: {
        type: "append_block",
        blockType: "isi_block",
        content: "[IMPORTANT SAFETY INFORMATION]\nPlease see full Prescribing Information including Boxed Warning.",
      },
      previewHtml: `<section class="isi-block" aria-label="Important Safety Information">
  <h2>IMPORTANT SAFETY INFORMATION</h2>
  <p>Please see full Prescribing Information including Boxed Warning.</p>
</section>`,
    }),
  },

  // P-02: Boxed warning must not contain placeholder text
  {
    id: "P-02",
    category: "pharma",
    description: "Boxed warning placeholder text not allowed",
    severity: "critical",
    condition: (block: Block) => {
      if (block.type !== "boxed_warning") return false;
      const placeholders = ["INSERT", "TODO", "PLACEHOLDER", "TBD", "[WARNING]"];
      return placeholders.some((p) => block.text.toUpperCase().includes(p));
    },
    message: "Boxed warning contains placeholder text. Must be replaced with FDA-approved warning language before publish.",
    source: "FDA 21 CFR Part 201.57(c)(1) — Boxed Warning requirements",
    autoFix: (block: Block): AutoFix => ({
      description: "Replace placeholder with FDA-approved warning template",
      action: {
        type: "replace_text",
        original: block.text,
        replacement: "WARNING: [DRUG NAME] CAN CAUSE [SERIOUS RISK]. See full prescribing information for complete boxed warning.",
      },
      previewHtml: `<div class="boxed-warning" role="alert">
  <strong>WARNING:</strong> [DRUG NAME] CAN CAUSE [SERIOUS RISK].
  <p>See full prescribing information for complete boxed warning.</p>
</div>`,
    }),
  },

  // P-03: Side effects — minimum 3 common side effects required
  {
    id: "P-03",
    category: "pharma",
    description: "Minimum side effects disclosure",
    severity: "high",
    condition: (block: Block) => {
      if (block.type !== "side_effects") return false;
      const effects = (block.metadata.commonSideEffects as string[]) || [];
      return effects.length < 3;
    },
    message: "Side effects section lists fewer than 3 common side effects. FDA guidelines require disclosure of the most common adverse reactions.",
    source: "FDA 21 CFR Part 201.57(c)(6) — Adverse Reactions",
    autoFix: (block: Block): AutoFix => {
      const existing = (block.metadata.commonSideEffects as string[]) || [];
      const needed = 3 - existing.length;
      return {
        description: `Add ${needed} more common side effect(s) to meet minimum disclosure`,
        action: {
          type: "replace_text",
          original: block.text,
          replacement: block.text + " [ADD: include all common adverse reactions from prescribing information]",
        },
        previewHtml: `<ul class="side-effects-list">
  ${existing.map((e) => `<li>${e}</li>`).join("\n  ")}
  ${Array(needed).fill("<li>[Common adverse reaction — add from PI]</li>").join("\n  ")}
</ul>`,
      };
    },
  },

  // P-04: Fair balance required alongside benefit claims
  {
    id: "P-04",
    category: "pharma",
    description: "Fair balance required with benefit claims",
    severity: "critical",
    condition: (block: Block) => {
      if (block.type !== "benefit_claim") return false;
      return !hasBlockType(_pageBlocks, "fair_balance") && !hasBlockType(_pageBlocks, "isi_block");
    },
    message: "Benefit claims require fair balance information (risks/side effects) to appear with equal prominence.",
    source: "FDA 21 CFR Part 202.1(e)(5)(ii) — Fair Balance",
    autoFix: (_block: Block): AutoFix => ({
      description: "Append fair balance section after benefit claims",
      action: { type: "append_block", blockType: "fair_balance", content: "Please see Important Safety Information and full Prescribing Information." },
      previewHtml: `<div class="fair-balance">
  <p><strong>Please see Important Safety Information</strong> and full Prescribing Information.</p>
</div>`,
    }),
  },

  // P-05: Contraindications must not be empty on patient pages
  {
    id: "P-05",
    category: "pharma",
    description: "Contraindications required when block present",
    severity: "critical",
    condition: (block: Block) => {
      if (block.type !== "contraindications") return false;
      return !block.text.trim();
    },
    message: "Contraindications block is present but empty. This is a critical disclosure omission.",
    source: "FDA 21 CFR Part 201.57(c)(5) — Contraindications",
    autoFix: (_block: Block): AutoFix => ({
      description: "Insert contraindications template from prescribing information",
      action: {
        type: "replace_text",
        original: "",
        replacement: "[CONTRAINDICATIONS: List all contraindications from the approved Prescribing Information]",
      },
      previewHtml: `<section class="contraindications">
  <h3>CONTRAINDICATIONS</h3>
  <p>[Insert contraindications from approved Prescribing Information]</p>
</section>`,
    }),
  },

  // ─── Accessibility Rules (WCAG 2.1 AA) ──────────────────────

  // A-01: Missing alt text on benefit claim images
  {
    id: "A-01",
    category: "a11y",
    description: "Images require alt text (WCAG 2.1 SC 1.1.1)",
    severity: "high",
    condition: (block: Block) => {
      return block.html.includes("<img") && !block.html.includes("alt=");
    },
    message: "Image element missing alt attribute. Fails WCAG 2.1 Success Criterion 1.1.1 (Non-text Content).",
    source: "WCAG 2.1 SC 1.1.1 — Level A",
    autoFix: (block: Block): AutoFix => ({
      description: "Add descriptive alt attribute to image",
      action: { type: "add_attribute", attribute: "alt", value: "[Describe image content]" },
      previewHtml: block.html.replace("<img", `<img alt="[Describe image content]"`),
    }),
  },

  // A-02: CTA buttons need accessible labels
  {
    id: "A-02",
    category: "a11y",
    description: "Interactive elements require accessible names",
    severity: "high",
    condition: (block: Block) => {
      if (block.type !== "cta") return false;
      return block.html.includes("<button") && !block.html.includes("aria-label") && !block.text.trim();
    },
    message: "CTA button has no visible label or aria-label. Screen reader users cannot determine button purpose. Fails WCAG 2.1 SC 4.1.2.",
    source: "WCAG 2.1 SC 4.1.2 — Name, Role, Value",
    autoFix: (block: Block): AutoFix => ({
      description: "Add aria-label to button",
      action: { type: "add_attribute", attribute: "aria-label", value: "[Describe action]" },
      previewHtml: block.html.replace("<button", `<button aria-label="[Describe action]"`),
    }),
  },

  // A-03: Colour contrast — flag suspicious inline styles
  {
    id: "A-03",
    category: "a11y",
    description: "Colour contrast must meet WCAG AA (4.5:1)",
    severity: "warning",
    condition: (block: Block) => {
      // Flag light-on-light or common low-contrast patterns in inline styles
      const lowContrastPatterns = [
        /color:\s*#[89a-fA-F]{6}/,  // very light text
        /color:\s*lightgr[ae]y/i,
        /color:\s*#ccc/i,
        /color:\s*silver/i,
      ];
      return lowContrastPatterns.some((p) => p.test(block.html));
    },
    message: "Possible colour contrast issue detected in inline styles. Verify ratio meets WCAG 2.1 AA minimum of 4.5:1 for normal text.",
    source: "WCAG 2.1 SC 1.4.3 — Contrast (Minimum)",
  },

  // ─── Brand Rules ─────────────────────────────────────────────

  // B-01: Non-approved colour tokens
  {
    id: "B-01",
    category: "brand",
    description: "Only approved design system colour tokens allowed",
    severity: "high",
    condition: (block: Block) => {
      const tokenRegex = /var\(--color-([a-z0-9-]+)\)/g;
      const used = [...block.html.matchAll(tokenRegex)].map((m) => m[1]);
      return used.some((t) => !APPROVED_COLOR_TOKENS.includes(t));
    },
    message: "Block references colour tokens not in the approved design system palette. Use only approved tokens.",
    source: "Pfizer CXI Design System — Brand Guidelines v2.4",
    autoFix: (block: Block): AutoFix => ({
      description: "Map non-approved tokens to nearest brand-approved equivalent",
      action: { type: "replace_text", original: block.html, replacement: block.html },
      previewHtml: `<!-- Replace non-approved tokens with nearest DS equivalent:\n${APPROVED_COLOR_TOKENS.map((t) => `  --color-${t}`).join("\n")}\n-->`,
    }),
  },

  // B-02: Non-approved typography tokens
  {
    id: "B-02",
    category: "brand",
    description: "Only approved typography tokens allowed",
    severity: "warning",
    condition: (block: Block) => {
      const tokenRegex = /var\(--font-([a-z0-9-]+)\)/g;
      const used = [...block.html.matchAll(tokenRegex)].map((m) => m[1]);
      return used.length > 0 && used.some((t) => !APPROVED_FONT_TOKENS.includes(t));
    },
    message: "Block uses typography tokens outside the approved design system set.",
    source: "Pfizer CXI Design System — Typography Guidelines",
  },

  // ─── Market Rules ─────────────────────────────────────────────

  // M-01: UK market — ABPI code compliance note
  {
    id: "M-01",
    category: "market",
    description: "UK market requires ABPI compliance statement",
    severity: "high",
    condition: (_block: Block, reqs: StructuredReqs) => {
      if (reqs.market !== "uk") return false;
      const hasAbpi = _pageBlocks.some((b) =>
        b.text.toLowerCase().includes("abpi") ||
        b.text.toLowerCase().includes("prescribing information")
      );
      return !hasAbpi;
    },
    message: "UK market pages must reference the ABPI Code of Practice and link to Prescribing Information.",
    source: "ABPI Code of Practice for the Pharmaceutical Industry 2021 — Clause 4.1",
    autoFix: (_block: Block): AutoFix => ({
      description: "Append ABPI compliance footer",
      action: {
        type: "append_block",
        blockType: "disclaimer",
        content: "This medicinal product is subject to additional monitoring. For full prescribing information see [link]. UK/[PRODUCT]/[DATE]. ABPI Code of Practice.",
      },
      previewHtml: `<footer class="abpi-footer">
  <small>This medicinal product is subject to additional monitoring. 
  For full prescribing information see [link]. ABPI Code of Practice.</small>
</footer>`,
    }),
  },

  // M-02: US market — adverse event reporting required
  {
    id: "M-02",
    category: "market",
    description: "US market requires adverse event reporting link",
    severity: "high",
    condition: (_block: Block, reqs: StructuredReqs) => {
      if (reqs.market !== "us") return false;
      const hasAE = _pageBlocks.some((b) =>
        b.text.toLowerCase().includes("adverse") ||
        b.text.toLowerCase().includes("1-800-fda-1088") ||
        b.text.toLowerCase().includes("medwatch")
      );
      return !hasAE;
    },
    message: "US market pages must include an adverse event reporting statement (FDA MedWatch 1-800-FDA-1088).",
    source: "FDA 21 CFR Part 314.81 — Post-marketing reporting",
  },
];
