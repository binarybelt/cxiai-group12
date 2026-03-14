---
phase: 04-demo-features
plan: "02"
status: complete
completed_at: "2026-03-14"
---

# Phase 04-02 Summary: SCAN Dashboard + Figma Token Import

## What was built

### Task 1: SCAN types, drift report logic, and portfolio data

- **src/types/scan.ts** — `DriftItem`, `ScanReport`, and `PortfolioEntry` interfaces
- **src/lib/scan.ts** — `driftReport()` function that extracts hex colours from HTML via regex, compares against approved colour tokens (case-insensitive, deduplicated, 3-to-6-char normalisation), and returns a `ScanReport`
- **src/lib/__tests__/scan.test.ts** — 7 tests covering approved pass-through, off-brand flagging, deduplication, case-insensitivity, message content, timestamp format, and non-colour token filtering
- **src/design-system/portfolio.json** — 6 fabricated Pfizer portfolio entries (Lipitor, Eliquis, Prevnar, Ibrance, Xeljanz, Comirnaty) with varied compliance scores and statuses
- **src/app/api/scan-url/route.ts** — POST endpoint that validates URL, fetches HTML server-side, calls `driftReport` with `loadTokens()`, returns `ScanReport` (422 on fetch failure)

### Task 2: SCAN dashboard UI, Figma import

- **src/lib/figma.ts** — `extractTokensFromFigmaUrl()` with Figma URL regex parsing, Figma REST API integration (when `FIGMA_API_TOKEN` set), and `DEMO_FIGMA_TOKENS` fallback (8 pharma-like colours)
- **src/lib/__tests__/figma.test.ts** — 6 tests covering file/design URL parsing, invalid URL rejection, empty string rejection, demo fallback, and token structure validation
- **src/app/api/figma-extract/route.ts** — POST endpoint wrapping `extractTokensFromFigmaUrl` (400 for invalid URL, 500 for extraction failure)
- **src/components/scan-dashboard.tsx** — Client component with portfolio cards (colour-coded compliance scores, status badges, drift counts) and live URL scan form with results display
- **src/components/figma-import.tsx** — Client component with Figma URL input, token extraction via `/api/figma-extract`, side-by-side swatch comparison (extracted vs approved palette)
- **src/app/scan/page.tsx** — Server component rendering ScanDashboard with collapsible FigmaImport section

## Verification

- All 98 tests pass (13 new scan + figma tests included)
- `npm run build` succeeds — `/scan` route renders as static page, API routes are dynamic
- No TypeScript errors in any new files
- Client components correctly route through API endpoints (no direct server-function calls)
