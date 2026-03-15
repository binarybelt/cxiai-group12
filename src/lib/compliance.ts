import {
  getMarketConfig,
  getTokensByCategory,
  loadComponents,
  loadTokens,
} from "@/lib/design-system";
import type { ComplianceViolation, ComplianceScore } from "@/types/compliance";
import type { PageSpec } from "@/types/page-spec";

// ---------------------------------------------------------------------------
// runBrandChecks
// Checks that every componentId and tokenOverride tokenId is in the approved set.
// Pure function — no side effects.
// ---------------------------------------------------------------------------

export function runBrandChecks(spec: PageSpec): ComplianceViolation[] {
  const approvedComponents = new Set(loadComponents().map((c) => c.id));
  const approvedTokens = new Set(loadTokens().map((t) => t.id));

  const violations: ComplianceViolation[] = [];

  for (const section of spec.sections) {
    for (const component of section.components) {
      if (!approvedComponents.has(component.componentId)) {
        violations.push({
          ruleId: "brand-component-only",
          category: "brand",
          severity: "error",
          message: `Component "${component.componentId}" is not in the approved design system.`,
          autoFixable: false,
          location: { sectionId: section.id, componentId: component.componentId },
        });
      }

      for (const override of component.tokenOverrides ?? []) {
        if (!approvedTokens.has(override.tokenId)) {
          violations.push({
            ruleId: "brand-approved-colors",
            category: "brand",
            severity: "error",
            message: `Token override "${override.tokenId}" is not an approved design token.`,
            autoFixable: true,
            location: { sectionId: section.id, componentId: component.componentId },
          });
        }
      }
    }
  }

  // --- Approved typography check ---
  const approvedTypographyIds = new Set(
    getTokensByCategory("typography").map((t) => t.id),
  );
  const typographyPattern = /heading|body|font/i;

  for (const section of spec.sections) {
    for (const component of section.components) {
      for (const override of component.tokenOverrides ?? []) {
        if (
          typographyPattern.test(override.tokenId) &&
          !approvedTypographyIds.has(override.tokenId)
        ) {
          violations.push({
            ruleId: "brand-approved-typography",
            category: "brand",
            severity: "warning",
            message: `Typography token "${override.tokenId}" is not in the approved type scale.`,
            autoFixable: true,
            location: { sectionId: section.id, componentId: component.componentId },
          });
        }
      }
    }
  }

  return violations;
}

// ---------------------------------------------------------------------------
// runPharmaChecks
// Checks pharma-specific constraints: ISI, adverse event URL, disclaimer, market.
// Pure function — no side effects.
// ---------------------------------------------------------------------------

export function runPharmaChecks(spec: PageSpec): ComplianceViolation[] {
  const violations: ComplianceViolation[] = [];

  const allComponents = spec.sections.flatMap((s) => s.components);
  const componentIds = new Set(allComponents.map((c) => c.componentId));
  const sectionTypes = new Set(spec.sections.map((s) => s.type));

  // --- HCP ISI check ---
  if (spec.market.toLowerCase().includes("hcp") && !componentIds.has("ISIBlock")) {
    violations.push({
      ruleId: "pharma-isi-required-hcp",
      category: "pharma",
      severity: "error",
      message: "HCP pages must include an ISIBlock component.",
      autoFixable: false,
      location: { sectionId: "page-level" },
    });
  }

  // --- Adverse event URL check ---
  for (const section of spec.sections) {
    for (const component of section.components) {
      if (component.componentId === "Footer") {
        const url = component.props["adverseEventUrl"];
        if (!url || url === "" || url === "#") {
          violations.push({
            ruleId: "pharma-adverse-event-link",
            category: "pharma",
            severity: "error",
            message: "Footer must have a non-empty adverseEventUrl.",
            autoFixable: false,
            location: { sectionId: section.id, componentId: component.componentId },
          });
        }
      }
    }
  }

  // --- Disclaimer check ---
  const hasDisclaimerComponent = componentIds.has("Disclaimer");
  const hasDisclaimerSection = sectionTypes.has("disclaimer");
  if (!hasDisclaimerComponent && !hasDisclaimerSection) {
    violations.push({
      ruleId: "pharma-disclaimer-promotional",
      category: "pharma",
      severity: "error",
      message: "Page must include a Disclaimer component or a disclaimer section.",
      autoFixable: false,
      location: { sectionId: "page-level" },
    });
  }

  // --- Market required components check ---
  const marketConfig = getMarketConfig(spec.market);
  if (marketConfig) {
    for (const requiredId of marketConfig.requiredComponents) {
      if (!componentIds.has(requiredId)) {
        violations.push({
          ruleId: "pharma-market-required-component",
          category: "pharma",
          severity: "warning",
          message: `Market "${spec.market}" requires component "${requiredId}" but it was not found.`,
          autoFixable: false,
          location: { sectionId: "page-level" },
        });
      }
    }
  }

  // --- Claims referenced check ---
  const claimKeywords = /efficacy|effective|outcome|survival|response/i;

  for (const section of spec.sections) {
    const hasClaimContent = section.components.some((component) => {
      if (component.componentId !== "ContentBlock" && component.componentId !== "Hero") {
        return false;
      }
      return Object.values(component.props).some(
        (val) => typeof val === "string" && claimKeywords.test(val),
      );
    });

    if (hasClaimContent) {
      const hasClaimReference = section.components.some(
        (c) => c.componentId === "ClaimReference",
      );
      if (!hasClaimReference) {
        violations.push({
          ruleId: "pharma-claims-referenced",
          category: "pharma",
          severity: "error",
          message: `Section "${section.id}" contains efficacy claims but no ClaimReference for supporting evidence.`,
          autoFixable: false,
          location: { sectionId: section.id },
        });
      }
    }
  }

  // --- Fair balance check ---
  const fairBalanceKeywords = /efficacy|benefit/i;
  const hasEfficacyContent = spec.sections.some((section) =>
    section.components.some((component) =>
      Object.values(component.props).some(
        (val) => typeof val === "string" && fairBalanceKeywords.test(val),
      ),
    ),
  );

  if (hasEfficacyContent) {
    const hasIsi =
      componentIds.has("ISIBlock") || sectionTypes.has("isi");
    if (!hasIsi) {
      violations.push({
        ruleId: "pharma-fair-balance",
        category: "pharma",
        severity: "warning",
        message: "Page contains benefit/efficacy content but no ISI section for fair balance.",
        autoFixable: false,
        location: { sectionId: "page-level" },
      });
    }
  }

  // --- Market disclosures check ---
  if (marketConfig && marketConfig.requiredDisclosures.length > 0) {
    const footerComponent = allComponents.find(
      (c) => c.componentId === "Footer",
    );

    if (footerComponent) {
      const disclaimers = footerComponent.props["disclaimers"];
      const links = footerComponent.props["links"];
      const hasDisclaimers = Array.isArray(disclaimers) && disclaimers.length > 0;
      const hasLinks = Array.isArray(links) && links.length > 0;

      if (!hasDisclaimers && !hasLinks) {
        for (const disclosure of marketConfig.requiredDisclosures) {
          violations.push({
            ruleId: `pharma-market-${spec.market.toLowerCase()}`,
            category: "pharma",
            severity: "warning",
            message: `Market "${spec.market}" requires disclosure "${disclosure}" but Footer has no disclaimer or link content.`,
            autoFixable: false,
            location: { sectionId: "page-level" },
          });
        }
      }
    }
  }

  return violations;
}

// ---------------------------------------------------------------------------
// runA11yChecks
// Spec-level accessibility checks (NOT axe-core — that runs at DOM level).
// Pure function — no side effects.
// ---------------------------------------------------------------------------

export function runA11yChecks(spec: PageSpec): ComplianceViolation[] {
  const violations: ComplianceViolation[] = [];

  for (const section of spec.sections) {
    for (const component of section.components) {
      // --- Alt text check ---
      if (component.componentId === "ImageBlock") {
        const alt = component.props["alt"];
        if (typeof alt !== "string" || alt.trim() === "") {
          violations.push({
            ruleId: "a11y-alt-text",
            category: "accessibility",
            severity: "error",
            message: `ImageBlock in section "${section.id}" is missing alt text.`,
            autoFixable: false,
            location: { sectionId: section.id, componentId: component.componentId },
          });
        }
      }

      // --- Table caption check ---
      if (component.componentId === "DataTable") {
        const caption = component.props["caption"];
        if (typeof caption !== "string" || caption.trim() === "") {
          violations.push({
            ruleId: "a11y-table-caption",
            category: "accessibility",
            severity: "warning",
            message: `DataTable in section "${section.id}" is missing a caption.`,
            autoFixable: false,
            location: { sectionId: section.id, componentId: component.componentId },
          });
        }
      }

      // --- Body size check ---
      for (const override of component.tokenOverrides ?? []) {
        if (
          override.tokenId.includes("body-xs") ||
          override.tokenId.includes("body-sm")
        ) {
          violations.push({
            ruleId: "a11y-body-size",
            category: "accessibility",
            severity: "warning",
            message: `Token "${override.tokenId}" may render below 16px minimum body size.`,
            autoFixable: true,
            location: { sectionId: section.id, componentId: component.componentId },
          });
        }
      }
    }
  }

  return violations;
}

// ---------------------------------------------------------------------------
// runComplianceGate
// Combines brand + pharma + a11y violations and determines pass/fail.
// Fails (passed: false) if any violation has severity "error".
// Pure function — no side effects.
// ---------------------------------------------------------------------------

export function runComplianceGate(
  spec: PageSpec,
): { passed: boolean; violations: ComplianceViolation[] } {
  const brandViolations = runBrandChecks(spec);
  const pharmaViolations = runPharmaChecks(spec);
  const a11yViolations = runA11yChecks(spec);
  const violations = [...brandViolations, ...pharmaViolations, ...a11yViolations];
  const passed = !violations.some((v) => v.severity === "error");

  return { passed, violations };
}

// ---------------------------------------------------------------------------
// computeScore
// Calculates a ComplianceScore from violations.
// Deducts 25 per error, 10 per warning. Floor at 0.
// Pure function — no side effects.
// ---------------------------------------------------------------------------

function calcCategoryScore(violations: ComplianceViolation[]): number {
  const deduction = violations.reduce((acc, v) => {
    if (v.severity === "error") return acc + 25;
    if (v.severity === "warning") return acc + 10;
    return acc;
  }, 0);

  return Math.max(0, 100 - deduction);
}

export function computeScore(
  brandViolations: ComplianceViolation[],
  pharmaViolations: ComplianceViolation[],
  a11yViolations: { length: number }[],
): ComplianceScore {
  const brand = calcCategoryScore(brandViolations);
  const pharma = calcCategoryScore(pharmaViolations);
  const accessibility = Math.max(0, 100 - a11yViolations.length * 20);
  const overall = Math.round((brand + accessibility + pharma) / 3);

  return { overall, brand, accessibility, pharma };
}

// ---------------------------------------------------------------------------
// applyAutoFix
// Applies an auto-fixable violation correction to a PageSpec.
// Returns a NEW PageSpec object (immutable — never mutates the input).
// Pure function — no side effects.
// ---------------------------------------------------------------------------

export function applyAutoFix(
  spec: PageSpec,
  violation: ComplianceViolation,
): PageSpec {
  if (!violation.autoFixable) {
    return spec;
  }

  if (violation.ruleId === "brand-approved-colors") {
    const approvedTokens = new Set(loadTokens().map((t) => t.id));

    const newSections = spec.sections.map((section) => {
      const newComponents = section.components.map((component) => {
        if (!component.tokenOverrides) return component;

        const filteredOverrides = component.tokenOverrides.filter((o) =>
          approvedTokens.has(o.tokenId),
        );

        return { ...component, tokenOverrides: filteredOverrides };
      });

      return { ...section, components: newComponents };
    });

    return { ...spec, sections: newSections };
  }

  return spec;
}
