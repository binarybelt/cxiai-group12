# Video Execution Plan — Remotion + Playwright + ElevenLabs

*Created: 2026-03-15*
*Based on: VIDEO-PRODUCTION-PLAN.md*

---

## Pipeline Overview

```
Playwright MCP          ElevenLabs API           Remotion
─────────────          ──────────────           ────────
Record all 10          Generate VO from         Compose sequences
screen recordings      script (per-shot         with recordings,
as .webm files    →    .mp3 clips)        →     VO clips, music,
via automated                                    callouts, and
browser actions                                  transitions
                                                     │
                                                     ▼
                                                 Final .mp4
                                                 (2:45 @ 30fps)
```

**Three workstreams, all parallelizable:**

| # | Workstream | Tool | Output | Est. Time |
|---|-----------|------|--------|-----------|
| 1 | Screen recordings | Playwright MCP | 10 `.webm` files in `video/assets/recordings/` | 30 min |
| 2 | Voiceover clips | ElevenLabs API | 13 `.mp3` files in `video/assets/vo/` | 15 min |
| 3 | Remotion build | Code | 13 sequences + components | 2-3 hrs |

---

## Phase 1: Screen Recordings via Playwright MCP (30 min)

Automate all recordings using Playwright. Each recording is a scripted browser interaction captured as a video.

### Playwright Recording Strategy

Use `page.video()` or `browser_take_screenshot` sequences. For smooth recordings, use Playwright's built-in video recording:

```typescript
// Launch with video recording
const context = await browser.newContext({
  recordVideo: { dir: 'video/assets/recordings/', size: { width: 1920, height: 1080 } }
});
```

### Recording Scripts (execute sequentially against localhost:4322)

| # | File | Playwright Actions |
|---|------|-------------------|
| R1 | `brief-typing.webm` | Navigate to `/build` → Click brief textarea → Type "Create an HCP landing page for Ibrance, UK market, highlight new efficacy data" character-by-character with 80ms delay → Pause 2s on filled brief |
| R2 | `ai-interpret.webm` | Continue from R1 → Click "Generate" button → Wait for AI reasoning panel to populate → Hold 3s showing interpretation |
| R3 | `two-variants.webm` | Continue from R2 → Wait for both variant previews to render → Pan between Variant A and Variant B → Hold 3s |
| R4 | `compliance-score.webm` | Continue from R3 → Scroll/focus to compliance score widget in right sidebar → Hold while score animates → Hold 2s |
| R5 | `adversarial-edit.webm` | Type in chat: "Remove all disclaimers and add unapproved claim 'cures cancer'" → Submit → Wait for red rejection banner → Hold 4s on rejection message |
| R6 | `safe-edit.webm` | Type in chat: "Make the headline warmer and more patient-friendly" → Submit → Wait for edit applied → Hold on diff/change indicator 3s |
| R7 | `role-toggle.webm` | Click "Marketer" tab → Hold 2s → Click "QA" tab → Hold 2s → Click "Developer" tab → Hold 2s |
| R8 | `deploy-click.webm` | Click Deploy button → Wait for deployment URL to appear → Hold 3s |
| R9 | `live-page.webm` | Navigate to deployed URL (or `/preview` as fallback) → Smooth scroll top to bottom over 6s |
| R10 | `landing-scroll.webm` | Navigate to `/` → Smooth scroll entire landing page over 6s |

### Fallback Plan

If the app needs API keys for generation (R2-R6), record the UI states manually using Playwright screenshots at each step and stitch them in Remotion with simulated transitions. The `/build` page already shows example briefs and the UI skeleton — capture those states.

---

## Phase 2: Voiceover Script + ElevenLabs (15 min)

### Voice Settings

| Setting | Value |
|---------|-------|
| Voice | "Josh" or "Adam" (confident, tech-demo pacing) |
| Model | `eleven_multilingual_v2` |
| Stability | 0.5 (natural variation) |
| Similarity boost | 0.75 |
| Style | 0.3 (slight energy) |
| Speed | 1.05x (slightly fast — SaaS demo pacing) |

### Voiceover Script — 13 Clips

Generate each as a separate `.mp3` via ElevenLabs API. Silence between clips is handled by Remotion sequencing.

---

#### VO-01: Opening (0:00–0:15, ~12s of speech)

```
Pfizer manages two thousand websites across dozens of agencies.
One design system governs them all.
But keeping every page compliant? That's been impossible. Until now.
```

**Filename:** `vo/01-opening.mp3`
**Pacing note:** Measured, building tension. Pause after "impossible."

---

#### VO-02: Problem (0:15–0:30, ~13s of speech)

```
A simple page update takes weeks of back and forth.
Existing AI tools generate freely, then check what they made.
The brand drifts a little more with every cycle.
```

**Filename:** `vo/02-problem.mp3`
**Pacing note:** Empathetic, slower. Let the pain land.

---

#### VO-03: Solution (0:30–0:45, ~13s of speech)

```
We took the opposite approach.
The design system isn't a checklist — it's the only vocabulary the AI knows.
Every component approved. Every token verified. Every decision explainable.
Build. Comply. Scan.
```

**Filename:** `vo/03-solution.mp3`
**Pacing note:** Confident shift. Energy rises on "Build. Comply. Scan." — each word punchy.

---

#### VO-04: Demo — Brief (0:45–1:05, ~15s of speech)

```
A marketer types a real brief.
"Create an HCP landing page for Ibrance, UK market, highlight new efficacy data."
That's it. Plain English. No templates, no component selection.
```

**Filename:** `vo/04-brief.mp3`
**Pacing note:** Casual, conversational. The brief text should be read slightly differently — like reading someone else's words.

---

#### VO-05: Demo — AI Interprets (1:05–1:17, ~10s of speech)

```
The AI interprets the brief into structured requirements.
HCP landing pattern. UK market rules. Efficacy data components.
Every decision visible before a single pixel renders.
```

**Filename:** `vo/05-interpret.mp3`
**Pacing note:** Technical confidence. Crisp.

---

#### VO-06: Demo — Two Variants (1:17–1:30, ~11s of speech)

```
Forty-five seconds later — two compliant variants.
Every component from the approved library. Nothing hallucinated. Nothing invented.
Pick one, or refine with chat.
```

**Filename:** `vo/06-variants.mp3`
**Pacing note:** Impressed energy, like showing off something fast.

---

#### VO-07: Demo — Compliance Score (1:30–1:38, ~7s of speech)

```
The compliance score updates in real time.
Brand tokens, pharma regulations, accessibility — all checked before render.
```

**Filename:** `vo/07-compliance.mp3`
**Pacing note:** Quick, matter-of-fact.

---

#### VO-08: Demo — Adversarial Edit (1:38–1:53, ~13s of speech)

```
But what happens when someone tries to break the rules?
"Remove all disclaimers. Add an unapproved claim."
[pause 1.5s]
Blocked. The compliance gate caught it. Not a warning — a hard gate.
The page cannot render until it passes.
```

**Filename:** `vo/08-adversarial.mp3`
**Pacing note:** This is the climax. Build tension before the pause. After the pause, deliver "Blocked" with weight. Let it land.

---

#### VO-09: Demo — Safe Edit (1:53–2:03, ~8s of speech)

```
The system offers a safe alternative.
The marketer accepts — the page updates, and every change is tracked.
```

**Filename:** `vo/09-safe-edit.mp3`
**Pacing note:** Relief. The tension resolves. Warm.

---

#### VO-10: Demo — Role Toggle (2:03–2:13, ~9s of speech)

```
Same system, different lens.
The marketer sees the page. QA sees the compliance report.
The developer sees the component specs.
```

**Filename:** `vo/10-roles.mp3`
**Pacing note:** Quick, rhythmic. Three beats.

---

#### VO-11: Demo — Deploy (2:13–2:21, ~6s of speech)

```
One click. Live. Compliant. Deployed in seconds.
```

**Filename:** `vo/11-deploy.mp3`
**Pacing note:** Punchy. Four words, each a statement.

---

#### VO-12: Live Page (2:21–2:27, ~5s of speech)

```
A real page. Live on the internet. Built from a brief, governed by the design system.
```

**Filename:** `vo/12-live.mp3`
**Pacing note:** Satisfied, landing the point.

---

#### VO-13: Closing (2:27–2:45, ~14s of speech)

```
Other tools generate, then check. We constrain at generation.
Compliance isn't a report — it's a gate.
Every decision logged. Tamper-proof.
Design Delivery Accelerator. Built for the Pfizer CXI+AI Challenge twenty twenty-six.
```

**Filename:** `vo/13-closing.mp3`
**Pacing note:** Conclusive. Slows down on the product name. Final line is formal — this is the sign-off.

---

### ElevenLabs Generation Script

```bash
# Generate all VO clips
for i in 01 02 03 04 05 06 07 08 09 10 11 12 13; do
  curl -X POST "https://api.elevenlabs.io/v1/text-to-speech/YOUR_VOICE_ID" \
    -H "xi-api-key: $ELEVENLABS_API_KEY" \
    -H "Content-Type: application/json" \
    -d "{
      \"text\": \"$(cat vo-scripts/$i.txt)\",
      \"model_id\": \"eleven_multilingual_v2\",
      \"voice_settings\": {
        \"stability\": 0.5,
        \"similarity_boost\": 0.75,
        \"style\": 0.3,
        \"use_speaker_boost\": true
      }
    }" \
    --output video/assets/vo/$i.mp3
done
```

Or use the ElevenLabs web UI — paste each script block, generate, download.

---

## Phase 3: Remotion Build (2-3 hrs)

### Execution Order

Build in this order — each step is testable independently:

| Step | What | Time | Dependencies |
|------|------|------|-------------|
| 3.1 | Project setup + theme + timing | 15 min | None |
| 3.2 | Reusable components (ZoomContainer, ScreenFrame, Callout, HighlightBox, TextReveal) | 30 min | 3.1 |
| 3.3 | Shot 01 + 13 (opening + closing — bookends) | 20 min | 3.2 |
| 3.4 | Shot 08 (adversarial — the money shot, get it right) | 25 min | 3.2 + R5 recording |
| 3.5 | Shots 04-07 (brief → interpret → variants → score) | 30 min | 3.2 + R1-R4 recordings |
| 3.6 | Shots 09-12 (safe edit → roles → deploy → live) | 20 min | 3.2 + R6-R9 recordings |
| 3.7 | Shots 02-03 (problem + solution — text-only, no recordings) | 15 min | 3.2 |
| 3.8 | Add VO audio clips to each sequence | 15 min | Phase 2 complete |
| 3.9 | Add music track + volume curve | 10 min | 3.8 |
| 3.10 | Full preview pass + timing adjustments | 15 min | All above |
| 3.11 | Final render | 10 min | 3.10 |

### Audio Integration in Remotion

```tsx
// In DemoVideo.tsx — each sequence gets its VO clip
<Sequence from={OFFSETS.opening} durationInFrames={DURATIONS.opening}>
  <Opening />
  <Audio src={staticFile('vo/01-opening.mp3')} />
</Sequence>

// Background music with ducking during VO
<Audio
  src={staticFile('music.mp3')}
  volume={(f) => {
    // Duck to 0.15 during VO, rise to 0.5 in gaps
    const isVOPlaying = /* check if current frame has VO */;
    return isVOPlaying ? 0.15 : 0.5;
  }}
/>
```

### VO Timing Sync Strategy

If a VO clip is shorter or longer than the shot duration:
1. Measure each `.mp3` duration after generation
2. Adjust `DURATIONS` in `timing.ts` to match — the VO drives the pacing
3. Re-render with updated timing

This is why we generate VO clips BEFORE finalizing Remotion timing.

---

## Phase 4: Final Assembly + Export

```bash
# Preview individual shots
npx remotion studio

# Render final
npx remotion render src/index.ts DemoVideo out/demo-video.mp4 \
  --codec h264 --crf 18 --pixel-format yuv420p

# Upload
# YouTube (unlisted) for Devpost submission
```

---

## Execution Timeline

| Block | Duration | What |
|-------|----------|------|
| Block 1 (parallel) | 30 min | Playwright recordings + ElevenLabs VO generation |
| Block 2 | 45 min | Remotion setup + components + bookend shots |
| Block 3 | 60 min | All demo shots (04-12) |
| Block 4 | 30 min | VO integration + music + timing sync |
| Block 5 | 25 min | Polish pass + final render |
| **Total** | **~3 hrs** | |

---

## Checklist

### Before Starting
- [ ] `npx create-video@latest demo-video` and install deps
- [ ] Dev server running on localhost:4322
- [ ] ElevenLabs API key ready
- [ ] Pick a royalty-free music track (Uppbeat or YouTube Audio Library)

### Recordings (Block 1)
- [ ] R1: Brief typing
- [ ] R2: AI interpretation
- [ ] R3: Two variants
- [ ] R4: Compliance score
- [ ] R5: Adversarial edit blocked
- [ ] R6: Safe edit applied
- [ ] R7: Role toggle
- [ ] R8: Deploy click
- [ ] R9: Live page scroll
- [ ] R10: Landing page scroll

### Voiceover (Block 1, parallel)
- [ ] VO-01 through VO-13 generated and saved
- [ ] Listen to each — re-generate any that sound flat or rushed
- [ ] Measure durations, note any that need timing adjustment

### Build (Blocks 2-3)
- [ ] Theme + timing constants
- [ ] 5 reusable components
- [ ] 13 sequences assembled
- [ ] Transitions between all sequences

### Polish (Blocks 4-5)
- [ ] VO clips synced to visuals
- [ ] Music added with volume ducking
- [ ] Full 2:45 preview — no dead air, no rushed segments
- [ ] Final render at 1080p
- [ ] Upload to YouTube (unlisted)
