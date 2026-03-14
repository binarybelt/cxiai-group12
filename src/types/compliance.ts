import type { ComplianceCategory, ComplianceSeverity } from "@/types/design-system";

export type { ComplianceCategory, ComplianceSeverity };

export interface ViolationLocation {
  sectionId: string;
  componentId?: string;
}

export interface ComplianceViolation {
  ruleId: string;
  category: ComplianceCategory;
  severity: ComplianceSeverity;
  message: string;
  autoFixable: boolean;
  location: ViolationLocation;
}

export interface ComplianceScore {
  overall: number;
  brand: number;
  accessibility: number;
  pharma: number;
}

export interface ComplianceResult {
  score: ComplianceScore;
  violations: ComplianceViolation[];
  passed: boolean;
}
