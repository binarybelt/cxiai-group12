export interface DriftItem {
  hex: string;
  message: string;
}

export interface ScanReport {
  url: string;
  driftCount: number;
  items: DriftItem[];
  scannedAt: string;
}

export interface PortfolioEntry {
  url: string;
  product: string;
  market: string;
  complianceScore: number;
  lastScanned: string;
  driftCount: number;
  status: "compliant" | "warning" | "critical";
}
