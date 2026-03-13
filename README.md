# Compliance Engine — Design Delivery Accelerator

Pharma regulatory compliance checker built in Next.js 14. Upgraded from the Python/Flask prototype to a production-ready TypeScript system with **real AI brief parsing** and **hybrid compliance checking**.

---

## What changed vs. the Python prototype

| Python prototype | This version |
|---|---|
| Hardcoded JSON brief input | **NL brief → Claude API → StructuredReqs** |
| Simple rule checks | **Deterministic rules + LLM claim evaluation** |
| Basic HTML dashboard | **Next.js App Router + Tailwind UI** |
| 5 rules | **12 rules across 4 categories** |
| No auto-fix preview | **Auto-fix with HTML preview per issue** |
| No market awareness | **US / UK / EU rule variants** |

---

## Architecture

```
NL Brief (user input)
        │
        ▼
┌─────────────────────┐
│  Brief Interpreter  │  Claude API → StructuredReqs JSON
│  (src/lib/claude.ts)│  (audience, market, product, claims)
└────────┬────────────┘
         │ StructuredReqs
         ▼
┌─────────────────────┐
│   Block Factory     │  Maps components to Block objects
│  (src/lib/engine.ts)│
└────────┬────────────┘
         │ Block[]
         ▼
┌──────────────────────────────────────────┐
│         Compliance Engine                │
│                                          │
│  1. Deterministic Rules (src/lib/rules.ts)│
│     P-01…P-05  Pharma (FDA/ABPI)        │
│     A-01…A-03  WCAG 2.1 AA              │
│     B-01…B-02  Brand / Design System     │
│     M-01…M-02  Market (UK/US/EU)        │
│                                          │
│  2. LLM Claim Evaluation                 │
│     Claude evaluates benefit/efficacy    │
│     claims for superlatives, misleading  │
│     comparatives, off-label implication  │
└────────┬─────────────────────────────────┘
         │ ComplianceResult
         ▼
  Dashboard UI  (/src/app/page.tsx)
  Score gauge · Issue cards · Auto-fix previews
```

---

## Compliance Rules

### Pharma (P-xx) — FDA / ABPI
| Rule | Description | Severity |
|------|-------------|----------|
| P-01 | ISI block required on HCP pages | CRITICAL |
| P-02 | Boxed warning must not contain placeholders | CRITICAL |
| P-03 | Minimum 3 side effects required | HIGH |
| P-04 | Fair balance required with benefit claims | CRITICAL |
| P-05 | Contraindications block must not be empty | CRITICAL |

### Accessibility (A-xx) — WCAG 2.1 AA
| Rule | Description | Severity |
|------|-------------|----------|
| A-01 | Images require alt text (SC 1.1.1) | HIGH |
| A-02 | Buttons require accessible names (SC 4.1.2) | HIGH |
| A-03 | Colour contrast must meet 4.5:1 (SC 1.4.3) | WARN |

### Brand (B-xx) — Design System
| Rule | Description | Severity |
|------|-------------|----------|
| B-01 | Only approved colour tokens allowed | HIGH |
| B-02 | Only approved typography tokens allowed | WARN |

### Market (M-xx)
| Rule | Description | Severity |
|------|-------------|----------|
| M-01 | UK pages require ABPI compliance statement | HIGH |
| M-02 | US pages require adverse event reporting link | HIGH |

### AI Claim Evaluation (LLM-xx)
Claude evaluates benefit/efficacy claims for:
- `LLM-01` Superlatives without substantiation
- `LLM-02` Unsubstantiated absolute efficacy claims
- `LLM-03` Misleading comparatives
- `LLM-04` Off-label implication
- `LLM-05` Risk minimisation
- `LLM-06` Fair balance violation

---

## Setup

```bash
cd compliance-engine
npm install

# Add your Anthropic API key
echo "ANTHROPIC_API_KEY=sk-ant-..." > .env.local

npm run dev
# Open http://localhost:3000
```

---

## Extending rules

Rules are **data, not code**. To add a new deterministic rule, add an entry to `src/lib/rules.ts`:

```typescript
{
  id: "P-06",
  category: "pharma",
  description: "Prescribing information link required",
  severity: "high",
  condition: (block, reqs) => { /* return true if issue */ },
  message: "Human-readable issue description",
  source: "Regulatory reference",
  autoFix: (block) => ({ ... })  // optional
}
```

No other changes needed. The engine picks it up automatically.

---

## Next steps (per architecture plan)

- [ ] Connect to real page builder (replace `buildBlocksFromReqs` stub)
- [ ] Add Convex DB for audit trail / version history
- [ ] Integrate with Vercel Deploy API for one-click live preview
- [ ] Port deterministic rules to Zod schemas for typed validation
- [ ] Add role-based views (Marketer / Developer / QA)
