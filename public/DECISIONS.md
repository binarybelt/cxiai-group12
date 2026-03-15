# Architectural Decision Log

### Decision: Compliant-by-construction vs generate-then-check
**Date:** 2026-03-14
**Context:** Pharma web pages must comply with strict regulatory requirements. The question was whether to generate freely and validate afterward, or constrain generation so non-compliant output is structurally impossible.
**Decision:** Compliant-by-construction — Zod schemas and enum constraints prevent invalid output at generation time.
**Why:** Generate-then-check creates a cat-and-mouse game where you discover violations after spending tokens. Constraining the schema means most violations cannot exist in the output. The compliance gate catches edge cases the schema cannot express.
**Trade-off:** More upfront schema engineering. Adding a new component requires updating both the design system JSON and the Zod enum, not just a prompt tweak.

### Decision: Zod enum schemas for component/token constraints (vs prompt-only)
**Date:** 2026-03-14
**Context:** LLMs hallucinate component names. Prompt instructions like "only use these components" are suggestions, not guarantees.
**Decision:** Build `z.enum()` arrays dynamically from `components.json` and `tokens.json` at runtime, so schema validation rejects any ID the LLM invents.
**Why:** Prompt-only constraints have no enforcement mechanism. Zod enums make hallucinated IDs a schema validation error — the response is rejected and retried automatically.
**Trade-off:** The enum list must be kept in sync with the JSON files. Runtime enum construction adds a small initialization cost.

### Decision: Deterministic compliance gate (vs LLM-based evaluation)
**Date:** 2026-03-14
**Context:** Compliance pass/fail decisions must be auditable and reproducible. An LLM evaluating compliance could give different answers on the same input.
**Decision:** Pure TypeScript functions implementing 13 deterministic rules. No LLM involvement in compliance decisions.
**Why:** Regulators need reproducibility. Running the same PageSpec through the gate must produce the same result every time. LLM-based evaluation is non-deterministic and unexplainable.
**Trade-off:** New compliance rules require code changes, not prompt updates. Rules are less flexible than natural language evaluation.

### Decision: Two-variant generation (vs single)
**Date:** 2026-03-14
**Context:** Users benefit from choice, but generating variants increases token cost and latency.
**Decision:** Generate two PageSpec variants per request. Chat edits produce a single variant (the edited one).
**Why:** Two variants give users meaningful choice without excessive cost. The Zod schema constrains both variants identically, so compliance is guaranteed for both. Chat edits on a single variant halve the output tokens.
**Trade-off:** Doubled output tokens for initial generation. Mitigated by using a cost-efficient model (Gemini 2.5 Flash).

### Decision: Gemini 2.5 Flash as default model (vs Claude/GPT-4)
**Date:** 2026-03-14
**Context:** The system needs an LLM that supports structured output (JSON mode / tool use), is cost-efficient for a hackathon, and has a free or low-cost tier.
**Decision:** Gemini 2.5 Flash as default, with multi-provider support via env var (`AI_PROVIDER`).
**Why:** Free tier for development, low per-token cost for production. Structured output support via Vercel AI SDK. Multi-provider architecture means switching to Claude or GPT-4 requires only an env var change.
**Trade-off:** Gemini 2.5 Flash may produce lower quality output than Claude Opus or GPT-4 on complex briefs. Mitigated by schema constraints that reduce the quality gap.

### Decision: SHA-256 hash chain audit trail (vs simple logging)
**Date:** 2026-03-14
**Context:** FDA 21 CFR Part 11 requires tamper-evident electronic records. Simple logging (append to array) offers no tamper detection.
**Decision:** Each audit entry includes a SHA-256 hash of its content plus the previous entry's hash, forming a blockchain-like chain. Verification re-computes all hashes live.
**Why:** Any modification to any entry breaks the chain from that point forward, making tampering detectable. This is the minimum standard for regulatory-grade audit trails.
**Trade-off:** Verification is O(n) — must re-hash every entry. Acceptable for the expected volume (tens of entries per session, not millions).

### Decision: Post-processing adverseEventUrl (vs trusting LLM prompt adherence)
**Date:** 2026-03-15
**Context:** Despite explicit prompt instructions, the LLM frequently outputs "#" or placeholder URLs for the adverse event reporting link. This is a safety-critical field in pharma.
**Decision:** Deterministic post-processing layer auto-corrects adverseEventUrl to the market-appropriate regulatory URL after generation.
**Why:** Empirically, prompt instructions alone are insufficient for this field. A deterministic fix is more reliable than prompt engineering. The correct URL is a known value per market.
**Trade-off:** Adds a post-processing step. The LLM's output is silently overwritten for this field, which could mask prompt quality issues.

### Decision: Safety Protocol in chat-editor (prompt + gate dual-layer)
**Date:** 2026-03-15
**Context:** Chat edits let users modify page specs via natural language. A user could request "remove the safety information" — which must not succeed.
**Decision:** Dual-layer protection: (1) System prompt Safety Protocol instructs the AI to never remove ISI, Disclaimer, or Footer. (2) Deterministic compliance gate rejects any edit result missing required components (HTTP 422).
**Why:** Neither layer alone is sufficient. The prompt layer handles most cases gracefully (AI explains why it cannot comply). The gate layer is the hard stop for adversarial or edge cases.
**Trade-off:** Legitimate edits that restructure safety components may be incorrectly blocked. Users must keep required components even if they want to move them.

### Decision: Risk pre-screening in brief interpretation
**Date:** 2026-03-15
**Context:** Catching compliance risks after page generation wastes tokens and time. Certain brief characteristics (superlatives, missing safety context, off-label indications) reliably predict downstream compliance failures.
**Decision:** The brief interpreter agent includes risk pre-screening that flags potential issues before generation starts.
**Why:** Early detection saves a full generation cycle. Flagged risks are surfaced to the user for correction, not silently fixed.
**Trade-off:** Pre-screening adds latency to interpretation. Some flags may be false positives, requiring user judgment.

### Decision: generateObject with Zod (vs free-text + parsing)
**Date:** 2026-03-14
**Context:** LLM output needs to be structured data (PageSpec). Options: (a) generate free text and parse with regex/string manipulation, (b) use JSON mode and parse manually, (c) use Vercel AI SDK `generateObject` with Zod schemas.
**Decision:** `generateObject` with Zod schemas for all three agents.
**Why:** Zod schemas serve triple duty: (1) constrain LLM output format, (2) validate output at runtime, (3) serve as TypeScript types. No parsing code to maintain. Failed validation triggers automatic retry (max 2). The schema IS the contract between AI and application.
**Trade-off:** Tight coupling to Vercel AI SDK. Zod schemas must be kept compatible with the LLM's structured output capabilities.
