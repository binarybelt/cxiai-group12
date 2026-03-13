export type TokenCategory =
  | "color"
  | "typography"
  | "spacing"
  | "radius"
  | "shadow";

export type ComponentPropType = "string" | "boolean" | "enum" | "node";
export type ComplianceCategory = "brand" | "accessibility" | "pharma";
export type ComplianceSeverity = "error" | "warning" | "info";

export interface DesignToken {
  id: string;
  category: TokenCategory;
  name: string;
  value: string;
  description?: string;
}

export interface PropDef {
  name: string;
  type: ComponentPropType;
  required: boolean;
  default?: string | boolean;
  options?: string[];
}

export interface ComponentDef {
  id: string;
  name: string;
  category: string;
  description: string;
  props: PropDef[];
  variants: string[];
  constraints: string[];
  requiredTokens: string[];
}

export interface PatternSection {
  type: string;
  requiredComponents: string[];
}

export interface Pattern {
  id: string;
  name: string;
  description: string;
  sections: PatternSection[];
}

export interface ComplianceRule {
  id: string;
  category: ComplianceCategory;
  severity: ComplianceSeverity;
  description: string;
  check: string;
  autoFixable: boolean;
}

export interface MarketConfig {
  id: string;
  name: string;
  region: string;
  requiredComponents: string[];
  requiredDisclosures: string[];
  additionalRules: string[];
}

export interface DesignSystem {
  tokens: DesignToken[];
  components: ComponentDef[];
  patterns: Pattern[];
  complianceRules: ComplianceRule[];
  markets: MarketConfig[];
}
