import { computeScore, runBrandChecks, runPharmaChecks } from "@/lib/compliance";
import type { PageSpec } from "@/types/page-spec";
import type { ComplianceViolation } from "@/types/compliance";

// ---------------------------------------------------------------------------
// generateComplianceReport
// Builds a self-contained HTML compliance report for a given PageSpec.
// Opens cleanly in a new tab and is printer-friendly.
// Pure function — no side effects.
// ---------------------------------------------------------------------------

function severityColor(severity: string): string {
  switch (severity) {
    case "error":
      return "#dc2626";
    case "warning":
      return "#d97706";
    case "info":
      return "#2563eb";
    default:
      return "#6b7280";
  }
}

function severityBg(severity: string): string {
  switch (severity) {
    case "error":
      return "#fef2f2";
    case "warning":
      return "#fffbeb";
    case "info":
      return "#eff6ff";
    default:
      return "#f9fafb";
  }
}

function scoreColor(score: number): string {
  if (score > 80) return "#16a34a";
  if (score > 60) return "#ca8a04";
  return "#dc2626";
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildViolationsTable(violations: ReadonlyArray<ComplianceViolation>): string {
  if (violations.length === 0) {
    return `<p style="color:#16a34a;font-weight:600;margin:16px 0;">No violations found.</p>`;
  }

  const rows = violations
    .map(
      (v) => `
      <tr>
        <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;">
          <span style="display:inline-block;padding:2px 8px;border-radius:9999px;font-size:11px;font-weight:700;text-transform:uppercase;color:#fff;background:${severityColor(v.severity)};">
            ${escapeHtml(v.severity)}
          </span>
        </td>
        <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;font-family:monospace;font-size:13px;color:#374151;">
          ${escapeHtml(v.ruleId)}
        </td>
        <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;font-size:13px;color:#374151;">
          ${escapeHtml(v.category)}
        </td>
        <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;font-size:13px;color:#374151;">
          ${escapeHtml(v.message)}
        </td>
        <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;text-align:center;font-size:13px;color:${v.autoFixable ? "#16a34a" : "#9ca3af"};">
          ${v.autoFixable ? "Yes" : "No"}
        </td>
      </tr>`,
    )
    .join("");

  return `
    <table style="width:100%;border-collapse:collapse;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;">
      <thead>
        <tr style="background:#f9fafb;">
          <th style="padding:10px 12px;text-align:left;font-size:12px;font-weight:600;color:#6b7280;text-transform:uppercase;border-bottom:2px solid #e5e7eb;">Severity</th>
          <th style="padding:10px 12px;text-align:left;font-size:12px;font-weight:600;color:#6b7280;text-transform:uppercase;border-bottom:2px solid #e5e7eb;">Rule ID</th>
          <th style="padding:10px 12px;text-align:left;font-size:12px;font-weight:600;color:#6b7280;text-transform:uppercase;border-bottom:2px solid #e5e7eb;">Category</th>
          <th style="padding:10px 12px;text-align:left;font-size:12px;font-weight:600;color:#6b7280;text-transform:uppercase;border-bottom:2px solid #e5e7eb;">Message</th>
          <th style="padding:10px 12px;text-align:center;font-size:12px;font-weight:600;color:#6b7280;text-transform:uppercase;border-bottom:2px solid #e5e7eb;">Auto-Fix</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>`;
}

function buildScoreCell(label: string, score: number): string {
  return `
    <td style="padding:16px 24px;text-align:center;border:1px solid #e5e7eb;">
      <div style="font-size:12px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.05em;">${escapeHtml(label)}</div>
      <div style="font-size:36px;font-weight:700;color:${scoreColor(score)};margin-top:4px;">${score}</div>
    </td>`;
}

export function generateComplianceReport(spec: PageSpec): string {
  const brandViolations = runBrandChecks(spec);
  const pharmaViolations = runPharmaChecks(spec);
  const allViolations: ComplianceViolation[] = [
    ...brandViolations,
    ...pharmaViolations,
  ];
  const score = computeScore(brandViolations, pharmaViolations, []);
  const timestamp = new Date().toISOString();
  const displayTime = new Date().toLocaleString("en-US", {
    dateStyle: "full",
    timeStyle: "medium",
  });

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Compliance Report — ${escapeHtml(spec.title)}</title>
  <style>
    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .no-print { display: none; }
    }
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      color: #1f2937;
      background: #f9fafb;
    }
    .container {
      max-width: 960px;
      margin: 0 auto;
      padding: 40px 24px;
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div style="border-bottom:3px solid #7C3AED;padding-bottom:20px;margin-bottom:32px;">
      <h1 style="margin:0;font-size:24px;color:#7C3AED;">Compliance Report</h1>
      <p style="margin:4px 0 0;font-size:14px;color:#6b7280;">Design Delivery Accelerator</p>
    </div>

    <!-- Page Info -->
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;margin-bottom:32px;">
      <div style="background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:16px;">
        <div style="font-size:11px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.05em;">Page Title</div>
        <div style="font-size:16px;font-weight:600;color:#1f2937;margin-top:4px;">${escapeHtml(spec.title)}</div>
      </div>
      <div style="background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:16px;">
        <div style="font-size:11px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.05em;">Market</div>
        <div style="font-size:16px;font-weight:600;color:#1f2937;margin-top:4px;">${escapeHtml(spec.market)}</div>
      </div>
      <div style="background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:16px;">
        <div style="font-size:11px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.05em;">Product</div>
        <div style="font-size:16px;font-weight:600;color:#1f2937;margin-top:4px;">${escapeHtml(spec.product)}</div>
      </div>
    </div>

    <!-- Score Summary -->
    <h2 style="font-size:18px;color:#1f2937;margin-bottom:12px;">Compliance Scores</h2>
    <table style="width:100%;border-collapse:collapse;background:#fff;border-radius:8px;overflow:hidden;margin-bottom:32px;">
      <tr>
        ${buildScoreCell("Brand", score.brand)}
        ${buildScoreCell("Pharma", score.pharma)}
        ${buildScoreCell("Accessibility", score.accessibility)}
        ${buildScoreCell("Overall", score.overall)}
      </tr>
    </table>

    <!-- Violations -->
    <h2 style="font-size:18px;color:#1f2937;margin-bottom:12px;">
      Violations
      <span style="font-size:14px;font-weight:400;color:#6b7280;margin-left:8px;">(${allViolations.length} total)</span>
    </h2>
    ${buildViolationsTable(allViolations)}

    <!-- Footer / Attestation -->
    <div style="margin-top:48px;padding-top:24px;border-top:1px solid #e5e7eb;">
      <p style="font-size:12px;color:#6b7280;line-height:1.6;">
        <strong>Audit-Readiness Attestation:</strong> This report was generated by the Design Delivery Accelerator compliance engine.
        All component selections were constrained to the approved design system.
        All compliance checks are deterministic (no LLM judgment in pass/fail decisions).
      </p>
      <p style="font-size:11px;color:#9ca3af;margin-top:12px;">
        Generated: ${escapeHtml(displayTime)} (${escapeHtml(timestamp)})
      </p>
    </div>
  </div>
</body>
</html>`;
}
