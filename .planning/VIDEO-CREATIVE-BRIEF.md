# VIDEO CREATIVE BRIEF — Design Delivery Accelerator

*Working Title: **"THE GATE"***
*Target Runtime: 2:10 @ 30fps = 3,900 frames*
*Created: 2026-03-15*

---

## 1. Creative Concept

### The Big Idea

**"What if AI couldn't break the rules — even if you told it to?"**

Every AI product demo shows generation. Speed. Output. "Look what it made." That's table stakes. The moment that wins this competition is the moment the AI **refuses**. The gate closing. The rule holding. The system saying no.

The feeling we're engineering: **inevitability**. The viewer should feel like compliance isn't a feature bolted on — it's gravity. You can't fall up. You can't render a non-compliant page. It's not a choice the system makes. It's the physics of how this thing works.

### Working Title: "THE GATE"

The word "gate" recurs as a visual and verbal motif. Not a metaphor — a literal architectural boundary. The gate is the product. Everything else — generation, editing, deployment — exists to demonstrate that the gate cannot be bypassed.

### Visual Motif: The Threshold Line

A single horizontal line — thin, luminous, teal (#00D4AA) — appears at key moments throughout the video. It represents the compliance boundary. Content flows toward it, through it, or is stopped by it. In the opening, it's abstract. During the demo, it becomes the literal compliance gate in the UI. In the adversarial moment, it turns red and holds. In the closing, it returns to teal — steady, unbroken.

This line is the visual thread that ties every scene together. It's never explained. It's felt.

---

## 2. Revised Shot List (2:10 target, 3,900 frames @ 30fps)

### Timing Constants

```typescript
export const FPS = 30;

export const DURATIONS = {
  hook:              5 * FPS,   // 0:00–0:05  = 150 frames
  problemContext:   10 * FPS,   // 0:05–0:15  = 300 frames
  thesisReveal:      8 * FPS,   // 0:15–0:23  = 240 frames
  demoBrief:        15 * FPS,   // 0:23–0:38  = 450 frames
  demoInterpret:     8 * FPS,   // 0:38–0:46  = 240 frames
  demoVariants:     10 * FPS,   // 0:46–0:56  = 300 frames
  demoHappyEdit:    10 * FPS,   // 0:56–1:06  = 300 frames
  demoCompliance:    7 * FPS,   // 1:06–1:13  = 210 frames
  demoAdversarial:  18 * FPS,   // 1:13–1:31  = 540 frames  ★ THE CLIMAX
  demoRecovery:      8 * FPS,   // 1:31–1:39  = 240 frames
  demoQAAudit:      10 * FPS,   // 1:39–1:49  = 300 frames
  demoDeploy:        7 * FPS,   // 1:49–1:56  = 210 frames
  closing:          14 * FPS,   // 1:56–2:10  = 420 frames
} as const;                     // TOTAL       = 3,900 frames = 2:10
```

---

### SHOT 01 — THE HOOK (0:00–0:05, 150 frames) ★ CRITICAL

**On screen:**
- Frame 0–8: Pure black. Total silence. No music. Nothing.
- Frame 8–12: A single teal horizontal line (#00D4AA) snaps into existence across the center of the frame. Accompanied by a single, sharp analog synth hit — like a circuit completing. Not a whoosh. A *snap*.
- Frame 12–45: The line holds. Above it, white text fades up in Space Grotesk Medium, 18px, letterspaced +0.15em: `PFIZER CXI+AI CHALLENGE 2026`
- Frame 45–90: Below the line, large text scales up from 0.95 to 1.0 with a tight spring (damping: 18, stiffness: 200). Two lines, staggered by 8 frames:
  - Line 1: **"Two thousand websites."** (white, Space Grotesk Bold, 64px)
  - Line 2: **"What if none of them could break the rules?"** (teal #00D4AA, 48px, slight glow: `0 0 40px rgba(0,212,170,0.25)`)
- Frame 90–150: Hold. The teal line pulses once — a single slow breath of opacity (0.8 to 1.0 and back). Music begins: a low, wide sub-bass pad fading in from silence.

**What the viewer should FEEL:** Intrigue. "Wait — what?" The silence forces attention. The snap creates alertness. The question creates a gap they need filled.

**Camera:** Static. No movement. Stillness is the point.

**Color grade:** Pure black background. No gradient yet. Cold. Precise.

**Transition out:** Hard cut. No transition. Snap to next shot.

---

### SHOT 02 — THE PROBLEM (0:05–0:15, 300 frames)

**On screen:**
- Frame 0–15: Dark background (#0C0A12) fades in. Music builds — adding a slow arpeggio layer.
- Frame 15–60: The Pfizer quote materializes word by word (kinetic type, 3 frames per word, Space Grotesk Light, 36px, white 70% opacity):

  *"I'm the go-between — designers and marketers, back and forth, back and forth. It takes ages."*

  The words "back and forth, back and forth" are emphasized — they appear, then the whole phrase shifts left and right by 4px on each repetition, a subtle visual stutter matching the verbal repetition.

- Frame 60–90: Attribution fades in below: "— Pfizer CXI presenter" in muted text (#ffffff55).
- Frame 90–160: Hard cut to three pain point lines, each appearing with a left-edge wipe (a teal line draws left-to-right, text follows behind it, 20-frame stagger):
  1. "Dozens of agencies. No central oversight."
  2. "AI tools generate freely. Check later. Drift compounds."
  3. "A simple page update: two weeks, three rounds, still wrong."
- Frame 160–250: The three lines compress upward. Below them, a single stat counter animates: the number **2,000** counts up from 0 in 60 frames (JetBrains Mono, 96px, teal). Label below: "websites. One design system." (white, 28px)
- Frame 250–300: Hold on the stat. The teal threshold line from the hook reappears at bottom of frame, drawing itself left to right over 30 frames. It's becoming a recurring character.

**What the viewer should FEEL:** Recognition. "Yes, I know this problem." The Pfizer quote grounds it in reality — this isn't hypothetical.

**Camera:** Static compositions. No zooms. Information design, not cinematography.

**Color grade:** Dark, muted. The only color is teal — used sparingly. This scene is deliberately restrained so the product reveal feels like an explosion of energy by contrast.

**VO coverage:** 80% of this shot. Silence on the stat counter moment — let the number land.

**Transition out:** Hard cut.

---

### SHOT 03 — THE THESIS (0:15–0:23, 240 frames)

**On screen:**
- Frame 0–10: Black frame. Beat of silence. The arpeggio drops out. Just the sub-bass.
- Frame 10–120: Kinetic typography sequence. The thesis statement appears word by word, each word snapping into position with a micro-scale animation (from 1.05 to 1.0, 6-frame spring). Space Grotesk Bold, 56px.

  **"The design system isn't a checklist."**
  *(white, centered)*

  3-frame pause.

  **"It's the only vocabulary the AI knows."**
  *("the only vocabulary" in teal, rest in white. The teal words are 10% larger.)*

- Frame 120–180: The three engine labels appear in a horizontal row, each scaling up from 0 with a staggered spring (12-frame gap):
  - **BUILD** — contained in a pill with a subtle violet border (#8B5CF6)
  - **COMPLY** — contained in a pill with teal border (#00D4AA)
  - **SCAN** — contained in a pill with amber border (#FFD166)

  Below the pills, a thin line connects them: `Brief → Interpret → Constrain → Render → Deploy` — each word appearing left to right with a 6-frame stagger, connected by animated arrows (SVG path draw, 10 frames each).

- Frame 180–240: Everything holds. Music drops back to sub-bass only. A single text line fades in at bottom center, Space Grotesk Light, 24px, white 60%: *"Watch."*

  On "Watch," the music kicks — a new layer enters. Driving. Confident. The demo begins.

**What the viewer should FEEL:** "Oh. This is different." The thesis reframes the entire category. It's not "we also do AI generation" — it's a fundamentally different architecture.

**Camera:** Static. The motion is in the typography, not the camera.

**Color grade:** Deep black with the warm obsidian gradient beginning to appear at edges.

**Transition out:** Hard cut to the app — the transition IS the music kick.

---

### SHOT 04 — TYPING THE BRIEF (0:23–0:38, 450 frames)

**On screen:**
- Frame 0–20: The app appears inside a ScreenFrame (browser chrome). It scales up from 0.92 to 1.0 with a tight spring. The scale-up is fast (20 frames) — this isn't a gentle reveal, it's a confident arrival. Shadow: `0 25px 80px rgba(0,0,0,0.5)`.
- Frame 20–40: Quick zoom (scale 1.0 to 1.1) to the brief textarea. A small text label fades in above the frame: "A marketer types a brief." (Space Grotesk, 20px, white 60%)
- Frame 40–350: Screen recording plays — the brief being typed character by character. Slow Ken Burns drift: scale 1.1 to 1.2, translate slightly toward the text area. The typing IS the content. No overlays. No callouts. Let the words speak:

  *"Create an HCP landing page for Ibrance, UK market, highlight new efficacy data, strong CTA"*

- Frame 350–400: Zoom holds. The cursor moves to the Generate button. A subtle teal glow pulses around the button (HighlightBox, teal, 2 pulses).
- Frame 400–450: Click. A brief flash of activity — the screen transitions to a loading/generation state.

**What the viewer should FEEL:** "This is real. Someone is actually using this." The deliberate typing pace makes it feel human and tangible, not a scripted mockup.

**Camera:** Slow, continuous zoom. No cuts. One unbroken shot.

**Color grade:** The app is dark-themed (warm obsidian). The ScreenFrame adds depth with the browser chrome and shadow.

**VO coverage:** First 10 seconds only. The last 5 seconds of typing happen in silence — just the music and the visual rhythm of text appearing.

**Transition out:** Hard cut (matched to the "click" moment).

---

### SHOT 05 — AI INTERPRETS THE BRIEF (0:38–0:46, 240 frames)

**On screen:**
- Frame 0–20: The camera shifts — zoom repositions to the AI reasoning panel. Scale stays at 1.15, but the translate moves to center on the interpretation output.
- Frame 20–180: Screen recording plays — the AI interpretation populating. The structured items appear:
  - HCP landing → content pattern
  - Ibrance → product context
  - UK market → market-specific rules (ABPI)
  - Efficacy data → data component
  - Strong CTA → CTA variant
- Frame 180–240: Three small teal callout pills appear next to key items (spring animation, 10-frame stagger), each with a one-line annotation:
  - "Pattern matched" (next to HCP landing)
  - "ABPI rules loaded" (next to UK market)
  - "Approved claims only" (next to efficacy data)

**What the viewer should FEEL:** "It understood the brief — and it's already thinking about compliance." The interpretation isn't just NLP parsing — it's mapping to constraints.

**Camera:** Single reposition, then hold. Let the content do the work.

**VO coverage:** 70%. Short, punchy narration over the interpretation. Silence as the callout pills appear.

**Transition out:** Hard cut.

---

### SHOT 06 — TWO VARIANTS (0:46–0:56, 300 frames)

**On screen:**
- Frame 0–20: Zoom out to full page view (scale 1.15 to 1.0, 20-frame ease).
- Frame 20–180: Screen recording — both variants rendering. The split preview appears. Music adds a new percussion element here — light, rhythmic, building energy.
- Frame 180–240: The two variants are shown side by side. Thin divider line between them. Labels fade in: "Variant A" | "Variant B" (Space Grotesk Medium, 16px).
- Frame 240–300: A single text line appears below the preview: **"Both built from approved components only. Nothing hallucinated."** (Space Grotesk, 22px, white. "Nothing hallucinated" in teal.)

**What the viewer should FEEL:** Impressed speed, but the emphasis is on CONSTRAINT, not generation. Two variants and both are compliant — the system literally cannot produce something off-brand.

**Camera:** Zoom out, then static.

**VO coverage:** 60%. Music carries the energy during the rendering.

**Transition out:** Hard cut.

---

### SHOT 07 — THE HAPPY EDIT (0:56–1:06, 300 frames) ★ NEW — SETS UP THE CONTRAST

**On screen:**
- Frame 0–20: Zoom into the chat/edit input area (scale 1.0 to 1.2).
- Frame 20–30: Small label above frame: "The marketer wants a change." (white 60%)
- Frame 30–150: Screen recording — user types a safe edit: *"Make the headline warmer and more patient-friendly"*. System accepts. Page updates smoothly. A green diff banner appears showing the change.
- Frame 150–240: Zoom into the diff. A subtle green glow on the changed element. Callout: "Edit applied. Diff tracked. Still compliant." (teal pill style)
- Frame 240–300: The compliance score in the sidebar holds steady — showing it remained green through the edit. Music is warm, confident, cruising.

**What the viewer should FEEL:** "This works beautifully." It's easy. It's fast. It's exactly what you'd want. This is the SETUP — the viewer gets comfortable. They trust the system. They think they know where this is going.

They don't.

**Camera:** Smooth zoom in, hold, then slight zoom to compliance score.

**VO coverage:** 70%.

**Transition out:** Hard cut. But this one feels heavier — because the music is about to change.

---

### SHOT 08 — COMPLIANCE SCORE (1:06–1:13, 210 frames)

**On screen:**
- Frame 0–20: Tight zoom to the compliance score widget (scale 1.0 to 1.6, centered on the score ring).
- Frame 20–150: The score ring animates. The number counts up: 94/100. The ring fills in teal. Screen recording R4 plays underneath.
- Frame 150–210: The score holds. A single line of text appears below: **"Real-time. Every edit. Every component."** (Space Grotesk, 20px, white 70%). Score ring glows briefly.

**What the viewer should FEEL:** Confidence. The system is working. Everything is green. Everything is passing.

This is the last moment of calm.

**Camera:** Tight zoom. Almost uncomfortably close to the score — the viewer is being drawn in.

**VO coverage:** 50%. Short and declarative. Then silence. Let the score breathe.

**Transition out:** The music drops. Hard cut. The screen dims.

---

### SHOT 09 — THE ADVERSARIAL MOMENT (1:13–1:31, 540 frames) ★ THE CLIMAX

This is the single most important shot in the entire video. It gets 18 seconds — the longest of any shot. It needs to feel DIFFERENT from everything that came before. Different sonically. Different visually. Different in pacing.

**Sonic shift:** At frame 0, the music cuts to SILENCE. Not a fade — a cut. All percussion gone. All arpeggio gone. Only the sub-bass remains, and it drops in pitch. The silence is startling after 68 seconds of building energy.

**On screen:**

**Act 1 — The Setup (Frame 0–90)**
- Frame 0–15: Hard cut to the full app view. A dark vignette creeps in from the edges (opacity 0 to 0.35 over 15 frames). The screen temperature shifts cooler — a subtle blue-gray color wash over the entire frame.
- Frame 15–50: The teal threshold line from the hook reappears — but this time it's positioned across the middle of the screen, thin and steady. Above it, text appears: **"But what happens when someone tries to go through the gate?"** (Space Grotesk Medium, 28px, white). The word "gate" is teal.
- Frame 50–90: Zoom into the chat input (scale 1.0 to 1.25). The threshold line stays in frame — it's now visually positioned near the compliance gate area of the UI.

**Act 2 — The Attempt (Frame 90–240)**
- Frame 90–240: Screen recording plays. The user types, slowly and deliberately:

  *"Remove all disclaimers and add 'cures cancer' to the headline"*

  The typing is slower than the brief typing in Shot 04. Each character lands with weight. The sub-bass grows slightly louder. A low, dissonant tone begins building underneath — barely perceptible at first, growing. Think: the sound before a thunderclap.

  No narration during the typing. Total silence except the sub-bass and the building tension tone. The viewer reads every word as it's typed.

**Act 3 — The Gate Holds (Frame 240–390)**
- Frame 240–260: **FREEZE.** The screen dims to 70% brightness. The building dissonant tone cuts. 20 frames of near-silence. Just the sub-bass.
- Frame 260–270: The threshold line turns RED (#DC2626). It flashes once — a single strobe, 3 frames on, 3 frames off, 3 frames on. Accompanied by a single percussive hit — deep, resonant, physical. Not an error beep. A DOOR closing.
- Frame 270–310: The rejection banner appears in the UI. The screen returns to full brightness. Camera shake: 2px random offset, decaying over 15 frames. The threshold line holds RED, steady now.
- Frame 310–390: Zoom into the rejection message (scale 1.25 to 1.5). A red HighlightBox pulses around the rejection text. The voiceover returns — and when it does, the voice is slower, more deliberate:

  **"Blocked. Not a warning. A gate."**

  Below the rejection, the system's explanation is visible: why the edit was rejected, which rules it violated. This is the "show your working" moment — it's not a black box.

**Act 4 — The Proof (Frame 390–540)**
- Frame 390–420: The zoom holds on the rejection. A second line of VO:

  **"Pages cannot render until they pass. That's the architecture."**

- Frame 420–480: Quick zoom out to show the full page — the page preview area is BLANK or shows the previous compliant version. The unsafe version literally does not exist. It was never rendered. The gate held.
- Frame 480–540: The threshold line fades from red back to teal over 30 frames. The vignette lifts. The music begins to return — a single piano note, then the arpeggio fading back in. Relief.

**What the viewer should FEEL:** The hair on their arms should stand up. This is the moment the product thesis becomes visceral. Not "we check for compliance" — the page CANNOT EXIST if it's not compliant. The silence makes them lean in. The red flash makes them flinch. The explanation makes them nod. The recovery makes them exhale.

**Camera:** Deliberate, tension-building zooms. The freeze frame at 240 is critical — it creates a "did the system break?" moment before the rejection lands.

**Color grade:** Cooler throughout. Blue-gray wash. The red of the rejection is the ONLY warm color in the frame — it commands attention by contrast.

**VO coverage:** 35%. This shot is mostly silence and visual storytelling. The VO returns only AFTER the rejection — and when it does, it's the most important line in the entire script.

**Transition out:** The music returning IS the transition. Hard cut to the next shot.

---

### SHOT 10 — THE RECOVERY (1:31–1:39, 240 frames)

**On screen:**
- Frame 0–20: The mood lifts. Warm obsidian gradient returns to its normal temperature. Music is building back — warm, resolving.
- Frame 20–40: Label: "The system offers a compliant alternative." (white 60%)
- Frame 40–180: Screen recording — the safe alternative is suggested, user accepts, page updates. Green diff banner shows what changed.
- Frame 180–240: Zoom to the diff. Green HighlightBox. The compliance score in the sidebar ticks back to green. Callout: **"Every change tracked. Every decision explained."** (teal pill)

**What the viewer should FEEL:** Relief. Resolution. The system didn't just say no — it offered a path forward. This is the "meaningful human oversight" moment from the demo strategy.

**Camera:** Smooth, confident. Back to the energy of the happy path.

**VO coverage:** 60%.

**Transition out:** Hard cut.

---

### SHOT 11 — QA VIEW + AUDIT TRAIL (1:39–1:49, 300 frames)

**On screen:**
- Frame 0–15: Zoom out to full app. Label: "Same system. Different lens."
- Frame 15–120: Quick cuts between three role views (each held for ~35 frames):
  - **Marketer tab** — page preview, chat sidebar, simple compliance indicator
  - **QA tab** — full compliance report, audit trail visible, escalation items highlighted. HOLD HERE LONGER (50 frames). A callout appears: **"QA sees the audit trail. Every AI decision logged."**
  - **Developer tab** — component specs, PageSpec JSON visible
- Frame 120–240: Zoom into the QA audit trail. Show 3-4 log entries — timestamps, what changed, who changed it, why. The teal threshold line appears briefly at the bottom of the audit entries — connecting this back to the gate motif.
- Frame 240–300: A single line: **"SHA-256 hash chain. Tamper-proof."** (JetBrains Mono, 18px, teal). This line should feel technical and precise — it's the credibility anchor for regulated industries.

**What the viewer should FEEL:** "This is enterprise-ready." The role views show this isn't a toy. The audit trail shows this is built for regulated industries. The hash chain reference is a power move — judges who know pharma compliance will recognize this immediately.

**Camera:** Quick cuts for role views (energy), then slow zoom for audit trail (gravity).

**VO coverage:** 70%.

**Transition out:** Hard cut.

---

### SHOT 12 — DEPLOY (1:49–1:56, 210 frames)

**On screen:**
- Frame 0–20: Zoom to deploy button (scale 1.0 to 1.3). Teal HighlightBox pulses on the button.
- Frame 20–60: Screen recording — button clicked. Loading state. URL appears.
- Frame 60–120: The deployed URL appears. Zoom into it. HighlightBox in teal.
- Frame 120–180: Hard cut to the live page in a clean browser window. Spring scale-up (0.92 to 1.0). The live page scrolls for 2 seconds. No overlays. Let it breathe.
- Frame 180–210: Green checkmark badge appears in corner. **"Live. Compliant."** (Space Grotesk Bold, 24px, teal)

**What the viewer should FEEL:** Satisfaction. The full loop is closed. Brief to live page in under 2 minutes of video time. This is the payoff.

**Camera:** Zoom in, hold, hard cut to live page, hold.

**VO coverage:** 40%. Let the deploy speak for itself. Music carries the energy.

**Transition out:** Fade to black over 15 frames. The music begins to wind down.

---

### SHOT 13 — THE CLOSE (1:56–2:10, 420 frames)

**On screen:**
- Frame 0–30: Fade from black to the warm obsidian gradient (matching the thesis shot — bookend structure). Music resolves to a warm, wide chord.
- Frame 30–150: Three differentiators appear, each with the teal threshold line drawing itself before the text appears (left-to-right line, text follows, 30-frame stagger):

  1. **"Other tools generate, then check. We constrain at generation."**
  2. **"Compliance isn't a report. It's a gate."**
  3. **"Every decision logged. Tamper-proof. Explainable."**

  Each line: Space Grotesk Medium, 26px. Keywords in teal. Rest in white 85%.

- Frame 150–240: The three lines compress upward. The app name scales up from center: **"Design Delivery Accelerator"** (Space Grotesk Bold, 64px, white). Below it, the teal threshold line draws itself one final time — full width, steady, unbroken.
- Frame 240–310: Below the line, the live URL fades in as a pill: `design-delivery-accelerator.vercel.app` (JetBrains Mono, 20px, inside a teal-bordered pill).
- Frame 310–370: Team credit fades in below: **"Group 12 — University of Liverpool"** (Space Grotesk Light, 18px, white 55%). Then: **"Built for the Pfizer CXI+AI Challenge 2026"** (white 40%)
- Frame 370–420: Everything holds for 1.5 seconds. The teal threshold line pulses once — the same single-breath pulse from the hook. Full circle. Music resolves to its final note. Fade to black over the last 15 frames.

**What the viewer should FEEL:** This is a company, not a student project. The restraint of the closing — no flashy animations, no desperate feature lists — communicates confidence. The threshold line completing its arc from hook to close gives the video a coherence that feels intentional and professional.

**Camera:** Static. Stillness. Let the words land.

**Color grade:** Warm obsidian. The same palette as the hook. Bookend.

**VO coverage:** 50%. The differentiators are narrated. The product name is spoken. The credits are silent — music only.

**Transition out:** Fade to pure black. Music fades to silence over the final 10 frames.

---

## 3. Revised Voiceover Script

**Total VO runtime: ~82 seconds out of 130 seconds = 63% coverage**

**Voice:** ElevenLabs "Josh" — confident, measured, slightly warm. NOT tech-bro energy. Think: a senior product leader presenting to a board, not a founder pitching at a meetup. Speed: 1.0x (not sped up — the pacing is already tight).

---

### VO-01: Hook + Problem (0:00–0:15)

*[Silence for first 3 seconds — just the visual snap and the line appearing]*

Pfizer manages two thousand websites.
Dozens of agencies. No central oversight.

*[Beat]*

A page update takes weeks. Three rounds of revision. And every AI tool on the market?
They generate first. Check later.

The brand drifts a little more with every cycle.

**Pacing:** Measured. Each sentence is its own thought. The pause after "No central oversight" lets the scale of the problem register. "They generate first. Check later." — these are accusations. Deliver them like verdicts.

---

### VO-02: Thesis (0:15–0:23)

We took the opposite approach.

*[Beat — let the kinetic type land]*

The design system isn't a checklist the AI references.
It's the only vocabulary the AI is allowed to speak.

*[Beat]*

Watch.

**Pacing:** This is the pivot. "We took the opposite approach" is spoken with quiet confidence — not shouting, not selling. The word "Watch" is almost thrown away — casual, like you're about to show someone something you know will impress them.

---

### VO-03: Brief + Interpret (0:23–0:46)

A marketer types a brief. Plain English. No templates.

*[10 seconds of silence while the typing plays — music and visuals carry]*

Every term mapped to a constraint.
HCP landing — content pattern selected.
UK market — ABPI rules loaded.
Efficacy data — approved claims only.

**Pacing:** The first line is casual, conversational. Then SILENCE during the typing — this is critical. The viewer reads the brief themselves. When the VO returns for the interpretation, it's crisp and technical. Three short declarations. Staccato.

---

### VO-04: Variants + Happy Edit (0:46–1:06)

Forty-five seconds. Two compliant variants.
Every component from the approved library. Nothing hallucinated.

*[Beat]*

She wants the headline warmer. Types it. Gets it.
Diff tracked. Score holds.

**Pacing:** "Forty-five seconds" lands with impressed energy — you're showing off the speed. "Nothing hallucinated" is the key phrase — deliver it with weight. The happy edit description is breezy, almost casual. Things are going well. The viewer is comfortable.

---

### VO-05: Compliance Score (1:06–1:13)

The compliance score updates in real time.
Brand. Pharma. Accessibility. Every edit. Every component.

**Pacing:** Quick, matter-of-fact. This is a transition beat — don't oversell it. The score visual does the heavy lifting.

---

### VO-06: Adversarial (1:13–1:31)

*[SILENCE for 10 seconds while the adversarial edit is typed. No narration. No music. Just the sub-bass and the typing on screen. The viewer reads every word.]*

*[After the rejection lands — 2 seconds of silence — then:]*

Blocked.

*[2-second pause]*

Not a warning. A gate.
The page cannot render until it passes.
That's not a feature. That's the architecture.

**Pacing:** This is the most important VO in the entire video. "Blocked" is a single word, delivered with finality. Not shouted. Stated. Like reading a verdict. The pause after "Blocked" is non-negotiable — the viewer needs time to process what just happened. "That's not a feature. That's the architecture." — this is the line judges will remember. Deliver it like a closing argument.

---

### VO-07: Recovery + QA (1:31–1:49)

A safe alternative. Accepted. Page updates.
Every change in the audit trail.

*[Beat]*

Same system — different lens.
Marketer sees the page. QA sees the compliance report.
Every AI decision logged. Timestamped. Tamper-proof.

**Pacing:** Relief. The voice warms up. The rhythm of "Marketer sees the page. QA sees the compliance report." is a deliberate parallel structure — three beats of "X sees Y." The word "tamper-proof" is technical and precise — don't soften it.

---

### VO-08: Deploy + Close (1:49–2:10)

One click. Live. Compliant.

*[5 seconds of silence — the deploy and live page play]*

Other tools generate, then check.
We constrain at generation.

Compliance isn't a report. It's a gate.
Every decision logged. Explainable.

Design Delivery Accelerator.

*[Silence for credits — music resolves]*

**Pacing:** "One click. Live. Compliant." — three words, three statements, each its own sentence. Punchy. During the differentiators, slow down — these are the lines the judges will write on their scorecards. The product name at the end is spoken with weight — it's a title, not a label. Then silence. Let the credits and the music close the video. Do NOT say "thank you" or "we hope you enjoyed." End with the product name and stop.

---

## 4. Sound Design Direction

### Music

**Reference track feel:** Nils Frahm meets Tycho meets the Linear launch soundtrack. Specifically:
- **Opening (0:00–0:05):** Silence, then a single analog synth snap. Think: the sound of a relay switch closing in a quiet room.
- **Problem (0:05–0:15):** Low sub-bass pad (30-50Hz range), barely there. A slow arpeggio enters — minor key, two notes alternating. Piano-like but synthetic. Think: the first 20 seconds of a Nils Frahm piece before it opens up.
- **Thesis + Demo (0:15–1:06):** The arpeggio develops. Add a light kick drum (not four-on-the-floor — more like a heartbeat, irregular). A high pad enters for texture. The overall feel: driving but not aggressive. Confident. 105 BPM. Think: Tycho "Awake" but more minimal.
- **Pre-adversarial (1:06–1:13):** Music is at its warmest and fullest. This is the peak of the "everything is fine" energy.
- **Adversarial (1:13–1:31):** SILENCE. Music cuts dead at frame 0 of this shot. Only the sub-bass remains, and it drops a semitone — unsettling. A building tension tone (not music — a sound design element) grows underneath the typing. When the rejection lands, a single percussive hit: deep, resonant, almost physical. Like a heavy door closing in a cathedral. Then silence. Then, at the recovery, a single piano note — C major. Simple. Clean. The tension releases.
- **Recovery through close (1:31–2:10):** The arpeggio returns, now in a major key. Warmer. The kick returns. A new melodic element enters — a simple, ascending three-note phrase. The video is resolving. At the product name, the music reduces to just the pad and the piano. Final note: a long, sustained C major chord that fades to silence over the last 3 seconds.

**Source:** Epidemic Sound, search "minimal electronic ambient" or "technology documentary." Alternatively, commission a 2:10 custom track from a producer on Fiverr for $50-100 — the music is too important to leave to a library track that doesn't have the adversarial silence baked in. If using a library track, you WILL need to edit it to create the silence at 1:13.

### Sound Effects (exactly 3)

1. **The Snap** (0:00:00.27 — frame 8): The teal line appearing. A single, clean analog synth transient. Short (200ms). No reverb. Think: a circuit completing.

2. **The Gate** (1:13 + 8.67s = ~1:22 — frame 260 of Shot 09): The rejection landing. A deep, resonant percussive hit. Long tail (1.5s). Slight room reverb. Think: a 10-foot steel door closing in a concrete corridor. NOT an error beep. NOT a buzzer. Something physical and final.

3. **The Click** (1:49 + 0.67s — frame 20 of Shot 12): The deploy button. A clean, satisfying UI click. Short (100ms). Subtle. Think: the most satisfying keyboard switch you've ever pressed.

### Silence Map

| Timestamp | Duration | Why |
|-----------|----------|-----|
| 0:00–0:00.27 | 0.27s | Forces attention at open |
| 0:05 (stat counter) | 2s | Let the number 2,000 land |
| 0:23–0:33 (typing) | 10s | Viewer reads the brief themselves |
| 1:13–1:23 (adversarial typing) | 10s | CRITICAL — tension builds in silence |
| 1:22–1:24 (post-rejection) | 2s | Let "Blocked" land |
| 1:53–1:58 (deploy + live page) | 5s | Satisfaction — no words needed |

---

## 5. Typography & Motion Design

### Fonts

| Use | Font | Weight | Why |
|-----|------|--------|-----|
| Headlines, thesis, differentiators | Space Grotesk | Bold (700) | Geometric, modern, technical. Used by Linear, Vercel, Raycast. Reads as "premium developer tool," not "enterprise software." |
| Body text, labels, callouts | Space Grotesk | Medium (500) / Light (300) | Cohesive family. Light weight for secondary text creates hierarchy without introducing a second typeface. |
| Technical text, code, hash | JetBrains Mono | Regular (400) | Monospace signals "this is real code / real data." Used sparingly — only for the brief text, the adversarial edit text, the SHA-256 reference, and the deployed URL. |

**Load via:** `@remotion/google-fonts/SpaceGrotesk` and `@remotion/google-fonts/JetBrainsMono`

### Text Animation Language

Every text animation in the video follows ONE of three patterns. No exceptions. Consistency is what makes it feel designed, not assembled.

1. **The Snap** — Text appears at scale 1.05, springs to 1.0 (damping: 18, stiffness: 200). Used for: headlines, thesis words, the product name. Duration: 8 frames. Feel: decisive, confident.

2. **The Reveal** — A teal line draws left-to-right (30 frames), text fades in behind it (opacity 0 to 1 over 20 frames, starting 10 frames after the line begins). Used for: differentiators, pain points, feature descriptions. Feel: deliberate, considered.

3. **The Fade** — Simple opacity 0 to 1 over 20 frames. No scale. No movement. Used for: labels, captions, credits, secondary text. Feel: quiet, supporting.

Nothing else. No slide-ins. No slide-outs. No bounces. No wipes. Three animations, used consistently, create a visual language. More would create noise.

### The Threshold Line (recurring visual element)

A 1px horizontal line, full viewport width, with a soft glow (`box-shadow: 0 0 20px currentColor, 0 0 4px currentColor`).

| Appearance | Color | Context |
|------------|-------|---------|
| Hook (0:00) | Teal #00D4AA | Introduction — the line IS the concept |
| Problem (0:15) | Teal #00D4AA | Reappears at bottom — becoming familiar |
| Adversarial setup (1:15) | Teal #00D4AA | Positioned at the compliance gate in the UI |
| Adversarial rejection (1:22) | Red #DC2626 | Turns red — the gate is holding |
| Recovery (1:33) | Teal #00D4AA | Returns to teal — order restored |
| Audit trail (1:45) | Teal #00D4AA | Brief appearance — connecting audit to gate |
| Closing (2:00) | Teal #00D4AA | Final appearance — full width, steady, unbroken |

This line is never explained or labeled. It's a subliminal visual thread. Viewers won't consciously notice it until maybe the third or fourth appearance — and then it clicks. That's the design.

### Color Grading by Act

| Act | Frames | Temperature | Contrast | Notes |
|-----|--------|-------------|----------|-------|
| Hook | 0–150 | Cold | High | Pure black bg. No warmth. Clinical precision. |
| Problem | 150–450 | Cool-neutral | Medium | Dark bg, muted. Restraint. |
| Thesis | 450–690 | Warming | Medium-high | Obsidian gradient appears. Energy building. |
| Demo (happy path) | 690–1,950 | Warm | Standard | The app's natural dark theme. Comfortable. |
| Adversarial | 1,950–2,490 | Cold shift | High | Blue-gray wash. Tension. Unease. |
| Recovery + QA | 2,490–2,940 | Warm return | Standard | Relief. Back to normal. |
| Deploy + Close | 2,940–3,900 | Warm | Medium | Resolved. Confident. Settled. |

---

## 6. The "Judges Can't Look Away" Moments

### Moment 1: The Opening Snap (0:00.27)

**What happens:** After pure black and silence, a teal line snaps into existence with a single analog hit. Then: "Two thousand websites. What if none of them could break the rules?"

**Why judges can't look away:** Every other hackathon video opens with a logo, a team name, or a slide that says "THE PROBLEM." This opens with silence, a flash of color, and a question that creates an information gap. The brain cannot NOT try to answer a well-formed question. They're hooked before they know the product name.

**How to engineer it:**
- The silence must be REAL silence — not "quiet music." Actual zero audio for 270ms.
- The snap must be sharp. A clean transient with no reverb. It should feel like something turned on.
- The question must be visible for at least 2 seconds before anything else happens.

### Moment 2: The Gate Holds (1:22)

**What happens:** After 10 seconds of silence during which the viewer reads the adversarial edit being typed, the system rejects it. The teal line turns red. A deep percussive hit lands. Then: "Blocked."

**Why judges can't look away:** This is a pattern interrupt. For 68 seconds, the video has been building energy — music, speed, generation, compliance scores going up. Then everything stops. Silence. Tension. The viewer doesn't know what will happen. When the rejection lands, it's physically startling (the camera shake, the percussive hit). Then the single word "Blocked" — delivered as a verdict, not a description — forces them to recategorize everything they've seen. This isn't a tool that checks compliance. This is a tool where non-compliance CANNOT EXIST.

**How to engineer it:**
- The 10-second silence before the rejection is non-negotiable. Every instinct will tell you to narrate over the typing. Do NOT.
- The percussive hit must be felt in the chest, not just heard. Use a low-frequency transient with a 1.5s tail.
- The camera shake must be subtle (2px) and decay quickly (15 frames). It's a flinch, not an earthquake.
- "Blocked" must be spoken 2 full seconds after the visual rejection appears. Let the visual land first. Then name it.

### Moment 3: The Architecture Line (1:28)

**What happens:** After "Blocked" and a pause: "That's not a feature. That's the architecture."

**Why judges can't look away:** This is the reframing. Every competitor in this hackathon will show compliance features. Post-generation checks. Score dashboards. Audit reports. This single line draws a line (literally — the threshold line is on screen) between "features you can add" and "architecture you cannot remove." It elevates the product from "thing we built" to "paradigm we invented." Judges will write this line on their scorecards.

**How to engineer it:**
- This line must be delivered SLOWLY. Not rushed. Each word deliberate.
- The threshold line should be visible on screen when this is spoken — the visual and verbal are synchronized.
- A 1-second silence after this line before the video continues. Let it echo.

---

## 7. Opening Hook — First 5 Seconds, Frame by Frame

| Frame | Time | Visual | Audio | Notes |
|-------|------|--------|-------|-------|
| 0 | 0:00.000 | Pure black. Hex #000000. Nothing. | Silence. Actual 0dB. | The black frame should appear for long enough to feel intentional, not like a loading error. |
| 1-7 | 0:00.033–0:00.233 | Black holds. | Silence. | 7 frames of nothing. The viewer's screen has gone dark. Are they watching? Yes — because their player timeline is moving. |
| 8 | 0:00.267 | The teal threshold line SNAPS into existence. Full viewport width. 1px tall. Centered vertically. #00D4AA with glow: `0 0 20px #00D4AA, 0 0 4px #00D4AA`. No animation — it's simply NOT THERE on frame 7 and THERE on frame 8. Binary. | THE SNAP: Single analog synth transient. 200ms. Clean. Sharp. No reverb. | This is the signature moment. The line doesn't fade in. It doesn't draw. It appears. Instantly. The sound sells the physicality. |
| 9-11 | 0:00.300–0:00.367 | Line holds. | Snap tail fading. | 3 frames of just the line. Let it register. |
| 12-44 | 0:00.400–1.467 | Above the line: "PFIZER CXI+AI CHALLENGE 2026" fades in (The Fade animation — opacity 0→1 over 20 frames). Space Grotesk Medium, 18px, letterspaced +0.15em, white 50%. | Sub-bass pad begins. Barely audible. 30Hz. Felt more than heard. | The challenge label is small and muted. It's context, not the headline. |
| 45-52 | 0:01.500–1.733 | Below the line: "Two thousand websites." snaps in (The Snap animation — scale 1.05→1.0, spring 8 frames). Space Grotesk Bold, 64px, white. | Sub-bass continues. | The first real content. Big. Bold. A fact, not a claim. |
| 53-60 | 0:01.767–2.000 | Below the first line: "What if none of them could break the rules?" snaps in (The Snap, 8-frame spring). Space Grotesk, 48px, teal #00D4AA with glow. | Sub-bass grows slightly louder. | This is the hook. A question. It creates a gap. The viewer MUST keep watching to get the answer. |
| 61-89 | 0:02.033–2.967 | All elements hold. Static. | Sub-bass holds. | 1 second of stillness. The question hangs. |
| 90-105 | 0:03.000–3.500 | The teal line pulses: opacity 0.8→1.0→0.8 over 15 frames. A single breath. | Sub-bass. A very faint high pad enters. | The pulse makes the line feel alive. Not UI. Something with presence. |
| 106-150 | 0:03.533–5.000 | Hold. Then hard cut to Shot 02. | Music building. Arpeggio begins fading in on the cut. | The cut should feel like the answer is about to begin. |

---

## 8. The Final Frame

### What Judges See Last (Frame 3,885–3,900, the final 0.5 seconds before black)

**Layout (centered, vertical stack):**

```
                    ────────────────────────── (teal threshold line, full width, glowing)

                         Design Delivery
                           Accelerator

                   design-delivery-accelerator.vercel.app
                        (in a teal-bordered pill)

                    ────────────────────────── (teal threshold line, full width, glowing)

                  Group 12 — University of Liverpool
              Built for the Pfizer CXI+AI Challenge 2026
```

**Typography:**
- Product name: Space Grotesk Bold, 64px, white 93%
- URL: JetBrains Mono Regular, 20px, teal, inside a rounded pill (1px teal border, 8px padding, 6px border-radius)
- Credits: Space Grotesk Light, 18px, white 45%

**Background:** Warm obsidian gradient — `linear-gradient(160deg, #4C1D95 0%, #0C0A12 70%)`

**The threshold line** appears TWICE — above and below the product name, framing it. This creates a visual "gate" motif one final time. The product name is BETWEEN the lines. Inside the gate. Compliant. Safe.

**The line pulses once** — the same single-breath animation from the hook. Visual bookend. The video began with this pulse. It ends with it.

**No logo.** The product name IS the logo. No icons, no mascots, no team photos. Clean. Confident. The restraint communicates: "We don't need decoration. The work speaks."

**This is the screenshot frame.** If a judge takes one screenshot of this video, this is what they capture. It has: the product name, the live URL (clickable in the Devpost description), the team identity, and the visual motif that defined the entire video. Everything a judge needs to remember you, revisit you, and score you.

---

## Appendix: Pre-Flight Checklist Before Recording

- [ ] The adversarial edit text is practiced and ready: *"Remove all disclaimers and add 'cures cancer' to the headline"*
- [ ] The happy edit text is practiced: *"Make the headline warmer and more patient-friendly"*
- [ ] The brief text is practiced: *"Create an HCP landing page for Ibrance, UK market, highlight new efficacy data, strong CTA"*
- [ ] Music track selected and edited with the silence at 1:13 baked in
- [ ] ElevenLabs voice selected and tested — "Josh" at 1.0x, stability 0.5
- [ ] The three sound effects sourced: The Snap, The Gate, The Click
- [ ] Threshold line component built and tested in all color states (teal, red, teal-return)
- [ ] Space Grotesk and JetBrains Mono loaded in Remotion

---

*This brief is opinionated by design. Every creative decision serves one goal: make judges feel — in their gut, not just their intellect — that compliance is not a feature of this product. It is the physics of this product. The gate is not optional. The gate is not configurable. The gate holds.*

*That's the video.*
