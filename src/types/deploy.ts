export type DeployStatus = "idle" | "generating-html" | "deploying" | "live" | "error";

export interface DeployResult {
  url: string;
  status: DeployStatus;
  deployedAt: string;
}
