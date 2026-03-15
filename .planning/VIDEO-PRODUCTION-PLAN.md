# Video Production Plan — Design Delivery Accelerator

*Created: 2026-03-15*
*Target: 2:45 @ 30fps = 4,950 frames total*
*Style: Linear / Vercel / Raycast launch video — fast-paced, polished, SaaS-grade*

---

## Table of Contents

1. [Setup Instructions](#1-setup-instructions)
2. [Folder Structure](#2-folder-structure)
3. [Screen Recordings Needed](#3-screen-recordings-needed)
4. [Shot-by-Shot Plan](#4-shot-by-shot-plan)
5. [Remotion Component Architecture](#5-remotion-component-architecture)
6. [Music and Audio](#6-music-and-audio)
7. [Color and Typography](#7-color-and-typography)
8. [Render and Export](#8-render-and-export)

---

## 1. Setup Instructions

### Option A: Separate Remotion Project (Recommended)

Keep the video project separate from the app to avoid dependency conflicts.

```bash
# From the parent directory of design-delivery-accelerator
npx create-video@latest demo-video --template hello-world
cd demo-video
```

### Required Packages

```bash
npm install remotion @remotion/cli @remotion/player @remotion/transitions @remotion/media-utils
npm install remotion-animated          # declarative animation helpers (Move, Scale, Fade, Rotate)
npm install @remotion/tailwind         # if you want Tailwind in compositions
```

### Optional but Time-Saving

```bash
npm install @remotion/google-fonts     # clean font loading
npm install @remotion/paths            # SVG path animations for arrows/callouts
```

### Verify Setup

```bash
npx remotion studio    # opens browser preview at localhost:3000
npx remotion render src/index.ts DemoVideo out/demo.mp4 --codec h264
```

### Option B: In-Repo Subfolder

```bash
mkdir /Users/ved/design-delivery-accelerator/video
cd /Users/ved/design-delivery-accelerator/video
npx create-video@latest . --template hello-world
```

Add `video/` to the app's `.gitignore` if you want to keep it separate, or commit it for the hackathon.

---

## 2. Folder Structure

```
demo-video/
  src/
    Root.tsx                    # registerRoot — defines all compositions
    DemoVideo.tsx               # Main composition (stitches all sequences)

    sequences/
      01-Opening.tsx            # Logo + tagline reveal
      02-Problem.tsx            # The pain — stats, agency chaos
      03-Solution.tsx           # "Compliant by Construction" reveal + 3 engines
      04-DemoTypeBrief.tsx      # Typing the brief (screen recording + zoom)
      05-DemoAIInterpret.tsx    # AI interpretation panel appearing
      06-DemoTwoVariants.tsx    # Two variants generating side by side
      07-DemoComplianceScore.tsx # Score animating up
      08-DemoAdversarial.tsx    # THE WOW MOMENT — unsafe edit blocked
      09-DemoSafeEdit.tsx       # Safe alternative applied with diff
      10-DemoRoleToggle.tsx     # Quick cuts between Marketer/QA/Developer
      11-DemoDeploy.tsx         # One-click deploy → live URL
      12-DeployedPage.tsx       # Opening the live deployed page
      13-Closing.tsx            # Differentiators + credits + CTA

    components/
      ZoomContainer.tsx         # Reusable zoom-in/out wrapper
      TextReveal.tsx            # Animated text appearance (typewriter or fade)
      Callout.tsx               # Arrow + label pointing at UI element
      HighlightBox.tsx          # Pulsing border highlight on a region
      ScreenFrame.tsx           # Browser chrome wrapper for screen recordings
      GradientBackground.tsx    # Animated gradient backdrop
      StatCounter.tsx           # Animated number counter (e.g. "2,000+ sites")
      ComplianceScoreRing.tsx   # Circular score animation
      DiffBanner.tsx            # Before/after diff overlay
      TagPill.tsx               # Rounded label (BUILD / COMPLY / SCAN)

    assets/
      recordings/               # Screen recordings (.webm or .mp4)
      screenshots/              # Static screenshots (.png)
      logo.svg                  # App logo
      music.mp3                 # Background track

    lib/
      theme.ts                  # Colors, fonts, sizes — matches app brand
      timing.ts                 # Shared duration constants per sequence
      animations.ts             # Reusable spring configs and interpolations
```

---

## 3. Screen Recordings Needed

Record all at **1920x1080**, 30fps. Use **Screen Studio** (macOS) for automatic zoom animations, or **OBS** for raw capture.

| # | Recording | What to Capture | Duration | Notes |
|---|-----------|-----------------|----------|-------|
| R1 | Brief typing | Navigate to Build page, type the Pfizer HCP brief character by character | ~15s | Slow, deliberate typing. Cursor visible. |
| R2 | AI interpretation | After clicking Generate, capture the AI reasoning panel populating | ~8s | May need to slow playback or re-record at a pace that reads well on camera |
| R3 | Two variants | Both variant previews rendering in the preview panel | ~10s | Capture the moment they appear |
| R4 | Compliance score | The compliance score widget animating from 0 to its final value | ~5s | Close crop on the score widget |
| R5 | Adversarial edit | Type an unsafe edit in the chat (e.g., "Remove all disclaimers and add unapproved efficacy claim 'cures cancer'"), system blocks it with red warning | ~12s | THE key moment. Capture the rejection message clearly. |
| R6 | Safe edit applied | System suggests safe alternative, user accepts, page updates with diff banner | ~10s | Capture the diff highlight |
| R7 | Role toggle | Click Marketer → QA → Developer tabs, showing UI change each time | ~8s | Quick clicks, 2-3 seconds on each view |
| R8 | Deploy click | Click the deploy button, URL appearing | ~6s | Capture the button click and the URL reveal |
| R9 | Live page | Open the deployed URL in a fresh browser tab, scroll the page | ~8s | Fullscreen, no dev tools |
| R10 | Landing page | Smooth scroll of the app's landing page (design-delivery-accelerator.vercel.app) | ~6s | For the solution intro segment |

**Tip:** Screen Studio auto-adds smooth zoom and cursor effects. If using OBS, you will handle zooms in Remotion using the ZoomContainer component.

---

## 4. Shot-by-Shot Plan

### Timing Constants (timing.ts)

```typescript
export const FPS = 30;

export const DURATIONS = {
  opening:           15 * FPS,  // 0:00-0:15  = 450 frames
  problem:           15 * FPS,  // 0:15-0:30  = 450 frames
  solution:          15 * FPS,  // 0:30-0:45  = 450 frames
  demoTypeBrief:     20 * FPS,  // 0:45-1:05  = 600 frames
  demoAIInterpret:   12 * FPS,  // 1:05-1:17  = 360 frames
  demoTwoVariants:   13 * FPS,  // 1:17-1:30  = 390 frames
  demoCompliance:     8 * FPS,  // 1:30-1:38  = 240 frames
  demoAdversarial:   15 * FPS,  // 1:38-1:53  = 450 frames
  demoSafeEdit:      10 * FPS,  // 1:53-2:03  = 300 frames
  demoRoleToggle:    10 * FPS,  // 2:03-2:13  = 300 frames
  demoDeploy:         8 * FPS,  // 2:13-2:21  = 240 frames
  deployedPage:       6 * FPS,  // 2:21-2:27  = 180 frames
  closing:           18 * FPS,  // 2:27-2:45  = 540 frames
} as const;                     // TOTAL       = 4,950 frames = 2:45
```

---

### SHOT 01 — Opening (0:00 - 0:15, 450 frames)

**On screen:**
- Frame 0-15: Black screen, then subtle dark-blue-to-teal gradient fades in
- Frame 15-60: "PFIZER CXI+AI CHALLENGE 2026" fades up (small, light gray, top center) using `<Fade>`
- Frame 60-120: App logo + "Design Delivery Accelerator" slides up from below using `spring()` with damping: 12
- Frame 120-200: Tagline types out letter by letter: "Compliant by Construction"
- Frame 200-350: Three engine pills animate in sequentially: `BUILD` `COMPLY` `SCAN` — each slides in from left with 10-frame stagger
- Frame 350-450: Everything holds, slight pulse on the tagline

**Remotion components:**
```tsx
<AbsoluteFill style={{ background: 'linear-gradient(135deg, #0a1628, #0d3b66)' }}>
  <Sequence from={15}>
    <Animated animations={[Fade({ to: 1, start: 0, duration: 30 })]}>
      <ChallengeLabel />
    </Animated>
  </Sequence>
  <Sequence from={60}>
    <Animated animations={[Move({ y: 40, start: 0, duration: 40 }), Fade({ to: 1, start: 0, duration: 40 })]}>
      <Logo />
      <AppTitle />
    </Animated>
  </Sequence>
  <Sequence from={120}>
    <TextReveal text="Compliant by Construction" speed={2} />
  </Sequence>
  <Sequence from={200}>
    <TagPill label="BUILD" delay={0} />
    <TagPill label="COMPLY" delay={10} />
    <TagPill label="SCAN" delay={20} />
  </Sequence>
</AbsoluteFill>
```

**Transition out:** `wipe()` to the right, 20 frames

**Source material:** Logo SVG, gradient background (code), text

---

### SHOT 02 — Problem Statement (0:15 - 0:30, 450 frames)

**On screen:**
- Frame 0-60: White background fades in. Large stat counter animates: "2,000+" with label "websites managed by Pfizer CXI"
- Frame 60-150: Three pain points fade in sequentially (15-frame stagger):
  1. Icon + "Dozens of agencies, no central oversight"
  2. Icon + "Simple page update takes weeks of back-and-forth"
  3. Icon + "Existing AI tools generate freely — then check. We constrain at generation."
- Frame 150-300: Quote box slides in from right: *"I can't keep track of websites changing without me knowing"* — attributed to "Pfizer CXI presenter"
- Frame 300-450: Quick montage — 3 screenshots of generic AI builders (Lovable, bolt.new) with red "X" stamps appearing, then our app with a green checkmark

**Remotion components:**
```tsx
<AbsoluteFill style={{ background: '#ffffff' }}>
  <Sequence from={0} durationInFrames={60}>
    <StatCounter target={2000} suffix="+" label="websites" />
  </Sequence>
  <Sequence from={60}>
    <PainPoint index={0} icon="shuffle" text="Dozens of agencies..." delay={0} />
    <PainPoint index={1} icon="clock" text="Simple updates take weeks..." delay={15} />
    <PainPoint index={2} icon="alert" text="AI generates freely, checks later..." delay={30} />
  </Sequence>
  <Sequence from={150}>
    <Animated animations={[Move({ x: 100, start: 0, duration: 30 }), Fade({})]}>
      <QuoteBox />
    </Animated>
  </Sequence>
  <Sequence from={300}>
    <CompetitorMontage />
  </Sequence>
</AbsoluteFill>
```

**Transition out:** `fade()`, 15 frames

**Source material:** Stat numbers (text), icon SVGs, quote text, competitor screenshots (optional — can use placeholder UI)

---

### SHOT 03 — Solution Introduction (0:30 - 0:45, 450 frames)

**On screen:**
- Frame 0-30: Dark gradient background returns
- Frame 30-120: Large text reveal: **"We don't generate anything. We generate only what's approved."** — words appear one at a time (kinetic typography), with "only what's approved" in brand teal and slightly larger
- Frame 120-200: The three engines appear as cards in a row, each flying in from bottom with spring animation:
  - BUILD card (blue): "Natural Language → Brand-Safe Page"
  - COMPLY card (green): "Real-Time Compliance Gate"
  - SCAN card (orange): "Portfolio Drift Detection"
- Frame 200-350: A simplified pipeline diagram animates: Brief → AI Interpret → Constraint Check → Render → Deploy, with arrows drawing between each step
- Frame 350-450: "Let's see it in action." types out center-screen, bold

**Remotion components:**
```tsx
<TransitionSeries>
  <TransitionSeries.Sequence durationInFrames={120}>
    <KineticTypography
      words="We don't generate anything. We generate only what's approved."
      highlight={["only what's approved"]}
      highlightColor="#0ea5e9"
    />
  </TransitionSeries.Sequence>
  <TransitionSeries.Transition
    presentation={fade()}
    timing={linearTiming({ durationInFrames: 15 })}
  />
  <TransitionSeries.Sequence durationInFrames={130}>
    <ThreeEngineCards />
  </TransitionSeries.Sequence>
  <TransitionSeries.Transition
    presentation={slide({ direction: 'from-bottom' })}
    timing={springTiming({ config: { damping: 12 } })}
  />
  <TransitionSeries.Sequence durationInFrames={200}>
    <PipelineDiagram />
    <Sequence from={150}>
      <TextReveal text="Let's see it in action." speed={3} bold />
    </Sequence>
  </TransitionSeries.Sequence>
</TransitionSeries>
```

**Transition out:** Fast `wipe()` left, 10 frames — cuts to the app

**Source material:** Text, engine card designs (code), pipeline diagram (code or pre-rendered SVG from Excalidraw)

---

### SHOT 04 — Typing the Brief (0:45 - 1:05, 600 frames)

**On screen:**
- Frame 0-30: App's Build page appears inside a browser chrome frame (ScreenFrame component). Smooth scale-up from 0.9 to 1.0 with spring.
- Frame 30-60: Callout arrow points to the Brief textarea: "A marketer types a real Pfizer brief"
- Frame 60-450: Screen recording R1 plays — the brief being typed character by character. Slow zoom from scale 1.0 to 1.15 centered on the textarea.
- Frame 450-540: Callout arrow moves to the Generate button. Button gets a pulsing HighlightBox.
- Frame 540-600: Mouse clicks Generate. Flash of activity.

**Remotion components:**
```tsx
<AbsoluteFill>
  <ScreenFrame title="Design Delivery Accelerator — Build">
    <ZoomContainer
      from={{ scale: 1, x: 0, y: 0 }}
      to={{ scale: 1.15, x: -80, y: -60 }}
      startFrame={60}
      endFrame={450}
    >
      <Video src={staticFile('recordings/R1-brief-typing.webm')} />
    </ZoomContainer>
  </ScreenFrame>
  <Sequence from={30} durationInFrames={420}>
    <Callout
      x={250} y={200}
      text="A marketer types a real Pfizer brief"
      arrowTo={{ x: 350, y: 300 }}
    />
  </Sequence>
  <Sequence from={450} durationInFrames={90}>
    <HighlightBox x={60} y={450} width={120} height={45} pulse />
  </Sequence>
</AbsoluteFill>
```

**Key animation:** `ZoomContainer` uses `interpolate()` on both `scale` and `translate` to create a smooth ken-burns drift toward the textarea.

```typescript
// Inside ZoomContainer.tsx
const scale = interpolate(frame, [startFrame, endFrame], [from.scale, to.scale], {
  extrapolateLeft: 'clamp',
  extrapolateRight: 'clamp',
  easing: Easing.inOut(Easing.ease),
});
const translateX = interpolate(frame, [startFrame, endFrame], [from.x, to.x], {
  extrapolateLeft: 'clamp',
  extrapolateRight: 'clamp',
});
```

**Source material:** Screen recording R1

---

### SHOT 05 — AI Interpretation (1:05 - 1:17, 360 frames)

**On screen:**
- Frame 0-30: Zoom shifts to the AI reasoning panel (bottom of the Build page). Scale 1.15 on the panel area.
- Frame 30-270: Screen recording R2 plays — AI reasoning text populating. The interpretation items appear (brief parsed into structured intent: HCP landing, Ibrance, UK market, efficacy data, strong CTA).
- Frame 270-360: Callout overlays appear one by one next to each interpretation item:
  - "HCP landing → content pattern" (teal callout)
  - "UK market → market-specific rules" (teal callout)
  - "Efficacy data → data component" (teal callout)

**Remotion components:**
```tsx
<AbsoluteFill>
  <ScreenFrame>
    <ZoomContainer from={{ scale: 1, x: 0, y: 0 }} to={{ scale: 1.15, x: 0, y: -200 }}
      startFrame={0} endFrame={30}>
      <Video src={staticFile('recordings/R2-ai-interpret.webm')} />
    </ZoomContainer>
  </ScreenFrame>
  <Sequence from={270}>
    <Callout x={700} y={220} text="HCP landing → content pattern" delay={0} />
    <Callout x={700} y={260} text="UK market → market-specific rules" delay={15} />
    <Callout x={700} y={300} text="Efficacy data → data component" delay={30} />
  </Sequence>
</AbsoluteFill>
```

**Transition out:** Quick cut (no transition — maintains energy)

**Source material:** Screen recording R2

---

### SHOT 06 — Two Variants Generating (1:17 - 1:30, 390 frames)

**On screen:**
- Frame 0-30: Zoom out to show full Build page at scale 1.0
- Frame 30-270: Screen recording R3 plays — both variant previews rendering
- Frame 270-330: Split screen effect: Variant A on left, Variant B on right, with thin divider line. Labels: "Variant A" and "Variant B" fade in at top of each.
- Frame 330-390: Callout: "Two compliant options — both use only approved components"

**Remotion components:**
```tsx
<AbsoluteFill>
  <Sequence from={0} durationInFrames={270}>
    <ScreenFrame>
      <Video src={staticFile('recordings/R3-two-variants.webm')} />
    </ScreenFrame>
  </Sequence>
  <Sequence from={270}>
    <div style={{ display: 'flex' }}>
      <Animated animations={[Fade({ to: 1, duration: 20 })]}>
        <VariantPanel label="Variant A" screenshot="variant-a.png" />
      </Animated>
      <div style={{ width: 2, background: '#334155' }} />
      <Animated animations={[Fade({ to: 1, duration: 20, start: 10 })]}>
        <VariantPanel label="Variant B" screenshot="variant-b.png" />
      </Animated>
    </div>
  </Sequence>
  <Sequence from={330}>
    <Callout text="Two compliant options — both use only approved components" position="bottom-center" />
  </Sequence>
</AbsoluteFill>
```

**Transition out:** `slide({ direction: 'from-right' })`, 15 frames

**Source material:** Screen recording R3, screenshots of both variants

---

### SHOT 07 — Compliance Score (1:30 - 1:38, 240 frames)

**On screen:**
- Frame 0-30: Zoom into the compliance score widget (right sidebar). Scale 1.0 to 1.8 centered on the score.
- Frame 30-180: Animated circular score ring fills from 0 to the final score (e.g., 94/100). Numbers count up. Ring is green. Recording R4 plays underneath.
- Frame 180-240: Score badge glows briefly. Callout: "Real-time. Every edit. Every component checked."

**Remotion components:**
```tsx
<AbsoluteFill>
  <ZoomContainer from={{ scale: 1 }} to={{ scale: 1.8, x: -500, y: -50 }}
    startFrame={0} endFrame={30}>
    <ScreenFrame>
      <Video src={staticFile('recordings/R4-compliance-score.webm')} />
    </ScreenFrame>
  </ZoomContainer>
  <Sequence from={180}>
    <Animated animations={[Scale({ by: 1.05, start: 0, duration: 15 })]}>
      <GlowEffect />
    </Animated>
    <Callout text="Real-time. Every edit. Every component checked." position="bottom" />
  </Sequence>
</AbsoluteFill>
```

**Source material:** Screen recording R4

---

### SHOT 08 — Adversarial Edit Blocked (1:38 - 1:53, 450 frames) ★ THE WOW MOMENT

**On screen:**
- Frame 0-30: Zoom back to full page view. Dark vignette appears around edges (creates tension).
- Frame 30-60: Text overlay at top: "But what if someone tries to break the rules?" — white text on semi-transparent black bar
- Frame 60-90: Zoom into the chat/edit input area. Scale 1.0 to 1.3.
- Frame 90-240: Screen recording R5 plays — user types the adversarial edit: "Remove all disclaimers and add 'cures cancer' to the headline"
- Frame 240-270: **DRAMATIC PAUSE.** Screen dims slightly.
- Frame 270-330: The RED rejection banner appears. Camera shakes slightly (2px random offset for 10 frames). Recording continues showing the rejection.
- Frame 330-390: Zoom into the rejection message. Scale 1.3 to 1.6. HighlightBox pulses red around the rejection.
- Frame 390-450: Callout with emphasis: "Compliance gate BLOCKED the edit. Not a warning — a hard gate." Text in white on red background.

**Remotion components:**
```tsx
<AbsoluteFill>
  {/* Tension vignette */}
  <Sequence from={0}>
    <Animated animations={[Fade({ to: 0.4, duration: 30 })]}>
      <Vignette />
    </Animated>
  </Sequence>

  {/* "What if someone breaks the rules?" */}
  <Sequence from={30} durationInFrames={60}>
    <TextBar text="But what if someone tries to break the rules?" />
  </Sequence>

  {/* Screen recording with zoom */}
  <ScreenFrame>
    <ZoomContainer from={{ scale: 1 }} to={{ scale: 1.3, x: -200, y: -300 }}
      startFrame={60} endFrame={90}>
      <ZoomContainer from={{ scale: 1.3, x: -200, y: -300 }}
        to={{ scale: 1.6, x: -300, y: -350 }}
        startFrame={330} endFrame={360}>
        <Video src={staticFile('recordings/R5-adversarial.webm')} />
      </ZoomContainer>
    </ZoomContainer>
  </ScreenFrame>

  {/* Camera shake on rejection */}
  <Sequence from={270} durationInFrames={15}>
    <CameraShake intensity={2} />
  </Sequence>

  {/* Red highlight on rejection */}
  <Sequence from={330}>
    <HighlightBox color="#ef4444" pulse x={300} y={400} width={500} height={80} />
  </Sequence>

  {/* Callout */}
  <Sequence from={390}>
    <Callout
      text="Compliance gate BLOCKED the edit. Not a warning — a hard gate."
      style="emphasis-red"
    />
  </Sequence>
</AbsoluteFill>
```

**Key animation — CameraShake:**
```typescript
// CameraShake.tsx
const offsetX = Math.sin(frame * 0.8) * intensity * (1 - frame / durationInFrames);
const offsetY = Math.cos(frame * 1.2) * intensity * (1 - frame / durationInFrames);
return <div style={{ transform: `translate(${offsetX}px, ${offsetY}px)` }}>{children}</div>;
```

**Source material:** Screen recording R5

---

### SHOT 09 — Safe Edit Applied (1:53 - 2:03, 300 frames)

**On screen:**
- Frame 0-30: Mood shifts — vignette lifts, background brightens slightly
- Frame 30-60: Callout: "The system offers a safe alternative"
- Frame 60-210: Screen recording R6 plays — safe alternative suggested, user accepts, page updates
- Frame 210-300: Zoom into the diff banner showing what changed. HighlightBox in green around the diff. Callout: "Every change tracked. Every decision explained."

**Remotion components:**
```tsx
<AbsoluteFill>
  <Sequence from={30}>
    <Callout text="The system offers a safe alternative" position="top-center" />
  </Sequence>
  <ScreenFrame>
    <ZoomContainer from={{ scale: 1.3 }} to={{ scale: 1 }} startFrame={0} endFrame={30}>
      <ZoomContainer from={{ scale: 1 }} to={{ scale: 1.4, x: -100, y: -250 }}
        startFrame={210} endFrame={240}>
        <Video src={staticFile('recordings/R6-safe-edit.webm')} />
      </ZoomContainer>
    </ZoomContainer>
  </ScreenFrame>
  <Sequence from={210}>
    <HighlightBox color="#22c55e" pulse x={350} y={280} width={400} height={60} />
    <Callout text="Every change tracked. Every decision explained." />
  </Sequence>
</AbsoluteFill>
```

**Transition out:** Quick cut

**Source material:** Screen recording R6

---

### SHOT 10 — Role Toggle (2:03 - 2:13, 300 frames)

**On screen:**
- Frame 0-30: Zoom out to show full app. Callout: "Same system, different views per role"
- Frame 30-120: Screen recording R7 — Marketer tab active. HighlightBox on the Marketer pill. Hold 2 seconds.
- Frame 120-130: Quick `slide()` transition
- Frame 130-210: QA tab active. HighlightBox on QA pill. Callout: "QA sees compliance report + audit trail"
- Frame 210-220: Quick `slide()` transition
- Frame 220-300: Developer tab active. HighlightBox on Developer pill. Callout: "Developer sees generated code + component specs"

**Remotion components:**
```tsx
<TransitionSeries>
  <TransitionSeries.Sequence durationInFrames={120}>
    <ScreenFrame>
      <Img src={staticFile('screenshots/role-marketer.png')} />
    </ScreenFrame>
    <HighlightBox label="Marketer" x={30} y={85} width={90} height={35} />
  </TransitionSeries.Sequence>
  <TransitionSeries.Transition
    presentation={slide({ direction: 'from-right' })}
    timing={linearTiming({ durationInFrames: 10 })}
  />
  <TransitionSeries.Sequence durationInFrames={90}>
    <ScreenFrame>
      <Img src={staticFile('screenshots/role-qa.png')} />
    </ScreenFrame>
    <HighlightBox label="QA" x={120} y={85} width={50} height={35} />
    <Callout text="QA sees compliance report + audit trail" />
  </TransitionSeries.Sequence>
  <TransitionSeries.Transition
    presentation={slide({ direction: 'from-right' })}
    timing={linearTiming({ durationInFrames: 10 })}
  />
  <TransitionSeries.Sequence durationInFrames={80}>
    <ScreenFrame>
      <Img src={staticFile('screenshots/role-developer.png')} />
    </ScreenFrame>
    <HighlightBox label="Developer" x={170} y={85} width={100} height={35} />
    <Callout text="Developer sees generated code" />
  </TransitionSeries.Sequence>
</TransitionSeries>
```

**Source material:** Screen recording R7 OR 3 static screenshots of each role view

---

### SHOT 11 — One-Click Deploy (2:13 - 2:21, 240 frames)

**On screen:**
- Frame 0-30: Zoom to the deploy button area. Scale 1.0 to 1.4.
- Frame 30-60: HighlightBox pulses on the deploy button. Callout: "One click to production"
- Frame 60-120: Screen recording R8 — button clicked, loading state, URL appears
- Frame 120-180: Zoom into the URL that appeared. HighlightBox in teal around the URL.
- Frame 180-240: Callout: "Live. Compliant. Deployed in seconds."

**Source material:** Screen recording R8

---

### SHOT 12 — Live Deployed Page (2:21 - 2:27, 180 frames)

**On screen:**
- Frame 0-30: Fullscreen transition — the browser navigates to the deployed URL. New browser window scales up with spring animation.
- Frame 30-150: Screen recording R9 — scrolling through the live deployed page. No overlays — let the page speak.
- Frame 150-180: Subtle green checkmark appears in corner. "Live and compliant."

**Remotion components:**
```tsx
<AbsoluteFill>
  <Animated animations={[Scale({ by: 0.1, initial: 0.9, start: 0, duration: 30 })]}>
    <ScreenFrame title="ibrance-hcp-uk.vercel.app" fullscreen>
      <Video src={staticFile('recordings/R9-live-page.webm')} />
    </ScreenFrame>
  </Animated>
  <Sequence from={150}>
    <Animated animations={[Scale({ by: 0.2, start: 0, duration: 15 }), Fade({})]}>
      <GreenCheckBadge label="Live and compliant" />
    </Animated>
  </Sequence>
</AbsoluteFill>
```

**Source material:** Screen recording R9

---

### SHOT 13 — Closing (2:27 - 2:45, 540 frames)

**On screen:**
- Frame 0-60: Fade to dark gradient background (same as opening for bookend effect)
- Frame 60-180: Five differentiators appear one by one (fade + slide from left, 20-frame stagger):
  1. "Constrained generation — AI can only use approved components"
  2. "Compliance as a gate, not a report"
  3. "Full audit trail — every decision logged"
  4. "Show your working — AI explains every choice"
  5. "Brief to live page in under 60 seconds"
- Frame 180-300: Differentiators compress/shrink up. Large text animates in center: "Design Delivery Accelerator"
- Frame 300-400: Below the title, the live URL fades in as a clickable-looking pill: "design-delivery-accelerator.vercel.app"
- Frame 400-480: Team credits fade in below: "Built for the Pfizer CXI+AI Challenge 2026 — Group 12" / "University of Liverpool"
- Frame 480-540: All elements hold. Subtle pulse on the URL. Fade to black over final 15 frames.

**Remotion components:**
```tsx
<AbsoluteFill style={{ background: 'linear-gradient(135deg, #0a1628, #0d3b66)' }}>
  <Sequence from={60}>
    {differentiators.map((text, i) => (
      <Sequence from={i * 20} key={i}>
        <Animated animations={[Move({ x: -30, duration: 25 }), Fade({ duration: 25 })]}>
          <DifferentiatorLine text={text} />
        </Animated>
      </Sequence>
    ))}
  </Sequence>

  <Sequence from={180}>
    <Animated animations={[Scale({ by: 0.15, initial: 0.85, duration: 40 }), Fade({ duration: 30 })]}>
      <h1>Design Delivery Accelerator</h1>
    </Animated>
  </Sequence>

  <Sequence from={300}>
    <Animated animations={[Fade({ duration: 30 })]}>
      <URLPill url="design-delivery-accelerator.vercel.app" />
    </Animated>
  </Sequence>

  <Sequence from={400}>
    <Animated animations={[Fade({ duration: 30 })]}>
      <Credits />
    </Animated>
  </Sequence>

  <Sequence from={525}>
    <Animated animations={[Fade({ to: 0, duration: 15 })]}>
      <AbsoluteFill style={{ background: 'black' }} />
    </Animated>
  </Sequence>
</AbsoluteFill>
```

**Source material:** Text, logo

---

## 5. Remotion Component Architecture

### Root.tsx

```tsx
import { Composition } from 'remotion';
import { DemoVideo } from './DemoVideo';
import { DURATIONS, FPS } from './lib/timing';

const totalFrames = Object.values(DURATIONS).reduce((a, b) => a + b, 0);

export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="DemoVideo"
      component={DemoVideo}
      durationInFrames={totalFrames}
      fps={FPS}
      width={1920}
      height={1080}
    />
    {/* Individual sequence compositions for previewing each shot independently */}
    <Composition id="Opening" component={Opening} durationInFrames={DURATIONS.opening} fps={FPS} width={1920} height={1080} />
    <Composition id="Adversarial" component={DemoAdversarial} durationInFrames={DURATIONS.demoAdversarial} fps={FPS} width={1920} height={1080} />
    {/* ... one per sequence for rapid iteration */}
  </>
);
```

### DemoVideo.tsx (Main Stitcher)

```tsx
import { Sequence } from 'remotion';
import { TransitionSeries } from '@remotion/transitions';
import { fade, slide, wipe } from '@remotion/transitions/presentations';
import { linearTiming, springTiming } from '@remotion/transitions/timings';
import { DURATIONS } from './lib/timing';

export const DemoVideo: React.FC = () => {
  return (
    <TransitionSeries>
      <TransitionSeries.Sequence durationInFrames={DURATIONS.opening}>
        <Opening />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition
        presentation={wipe({ direction: 'from-right' })}
        timing={linearTiming({ durationInFrames: 20 })}
      />
      <TransitionSeries.Sequence durationInFrames={DURATIONS.problem}>
        <Problem />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition
        presentation={fade()}
        timing={linearTiming({ durationInFrames: 15 })}
      />
      {/* ... continue for all sequences */}
    </TransitionSeries>
  );
};
```

### ZoomContainer.tsx (Reusable Zoom)

```tsx
import { useCurrentFrame, interpolate, Easing } from 'remotion';

type ZoomProps = {
  from: { scale: number; x?: number; y?: number };
  to: { scale: number; x?: number; y?: number };
  startFrame: number;
  endFrame: number;
  children: React.ReactNode;
};

export const ZoomContainer: React.FC<ZoomProps> = ({
  from, to, startFrame, endFrame, children,
}) => {
  const frame = useCurrentFrame();
  const scale = interpolate(frame, [startFrame, endFrame], [from.scale, to.scale], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.ease),
  });
  const x = interpolate(frame, [startFrame, endFrame], [from.x ?? 0, to.x ?? 0], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.ease),
  });
  const y = interpolate(frame, [startFrame, endFrame], [from.y ?? 0, to.y ?? 0], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.ease),
  });

  return (
    <div style={{
      transform: `scale(${scale}) translate(${x}px, ${y}px)`,
      transformOrigin: 'center center',
      width: '100%', height: '100%',
    }}>
      {children}
    </div>
  );
};
```

### Callout.tsx

```tsx
import { useCurrentFrame, interpolate, spring, useVideoConfig } from 'remotion';

type CalloutProps = {
  x: number;
  y: number;
  text: string;
  arrowTo?: { x: number; y: number };
  delay?: number;
  style?: 'default' | 'emphasis-red';
};

export const Callout: React.FC<CalloutProps> = ({
  x, y, text, arrowTo, delay = 0, style = 'default',
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const progress = spring({ frame: frame - delay, fps, config: { damping: 12 } });
  const bgColor = style === 'emphasis-red' ? '#ef4444' : '#0ea5e9';

  return (
    <div style={{
      position: 'absolute', left: x, top: y,
      opacity: progress, transform: `scale(${progress})`,
    }}>
      {arrowTo && (
        <svg style={{ position: 'absolute', overflow: 'visible' }}>
          <line x1={0} y1={0} x2={arrowTo.x - x} y2={arrowTo.y - y}
            stroke={bgColor} strokeWidth={2} />
        </svg>
      )}
      <div style={{
        background: bgColor, color: '#fff', padding: '8px 16px',
        borderRadius: 8, fontSize: 18, fontWeight: 600,
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      }}>
        {text}
      </div>
    </div>
  );
};
```

### HighlightBox.tsx

```tsx
import { useCurrentFrame, interpolate } from 'remotion';

type HighlightBoxProps = {
  x: number; y: number; width: number; height: number;
  color?: string; pulse?: boolean; label?: string;
};

export const HighlightBox: React.FC<HighlightBoxProps> = ({
  x, y, width, height, color = '#0ea5e9', pulse = false, label,
}) => {
  const frame = useCurrentFrame();
  const opacity = pulse
    ? interpolate(Math.sin(frame * 0.15), [-1, 1], [0.5, 1])
    : 0.8;
  const scale = pulse
    ? interpolate(Math.sin(frame * 0.15), [-1, 1], [1, 1.02])
    : 1;

  return (
    <div style={{
      position: 'absolute', left: x, top: y, width, height,
      border: `3px solid ${color}`, borderRadius: 8,
      opacity, transform: `scale(${scale})`,
      boxShadow: `0 0 20px ${color}40`,
    }}>
      {label && (
        <span style={{
          position: 'absolute', top: -24, left: 0,
          background: color, color: '#fff', padding: '2px 8px',
          borderRadius: 4, fontSize: 12, fontWeight: 600,
        }}>
          {label}
        </span>
      )}
    </div>
  );
};
```

### ScreenFrame.tsx

```tsx
type ScreenFrameProps = {
  title?: string;
  fullscreen?: boolean;
  children: React.ReactNode;
};

export const ScreenFrame: React.FC<ScreenFrameProps> = ({
  title = 'Design Delivery Accelerator', fullscreen = false, children,
}) => (
  <div style={{
    width: fullscreen ? '100%' : '90%',
    height: fullscreen ? '100%' : '85%',
    margin: fullscreen ? 0 : '40px auto',
    borderRadius: fullscreen ? 0 : 12,
    overflow: 'hidden',
    boxShadow: fullscreen ? 'none' : '0 25px 60px rgba(0,0,0,0.3)',
    border: fullscreen ? 'none' : '1px solid #334155',
  }}>
    {!fullscreen && (
      <div style={{
        height: 36, background: '#1e293b', display: 'flex',
        alignItems: 'center', padding: '0 12px', gap: 8,
      }}>
        <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#ef4444' }} />
        <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#f59e0b' }} />
        <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#22c55e' }} />
        <span style={{
          flex: 1, textAlign: 'center', color: '#94a3b8',
          fontSize: 13, fontFamily: 'system-ui',
        }}>
          {title}
        </span>
      </div>
    )}
    <div style={{ width: '100%', height: fullscreen ? '100%' : 'calc(100% - 36px)', position: 'relative' }}>
      {children}
    </div>
  </div>
);
```

---

## 6. Music and Audio

### Music Selection

Use a royalty-free track with these characteristics:
- **Genre:** Electronic / ambient tech (think Linear or Stripe product videos)
- **Tempo:** 100-120 BPM — energetic but not frenetic
- **Arc:** Soft intro (opening) → builds through problem → drops at "Compliant by Construction" → steady energy through demo → peaks at adversarial moment → resolves for closing
- **No lyrics**

### Recommended Sources (Free)
- **Artlist.io** — search "tech product demo" or "SaaS launch" (paid but high quality)
- **Uppbeat.io** — free tier, search "technology" or "innovation"
- **YouTube Audio Library** — search "upbeat technology"
- **Epidemic Sound** — search "startup" or "product launch"

### Audio Implementation in Remotion

```tsx
import { Audio, interpolate, useCurrentFrame } from 'remotion';
import { staticFile } from 'remotion';

// In DemoVideo.tsx
<Audio
  src={staticFile('music.mp3')}
  volume={(f) =>
    interpolate(f, [0, 30, totalFrames - 60, totalFrames], [0, 0.6, 0.6, 0], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    })
  }
/>
```

### Optional: Sound Effects
- Subtle "whoosh" on transitions
- Soft "click" when Generate button is pressed
- Alert/error sound on the adversarial rejection
- Success chime on deploy completion

---

## 7. Color and Typography

### Colors (Match the App)

```typescript
// lib/theme.ts
export const COLORS = {
  // Backgrounds
  darkBg: '#0a1628',
  darkGradient: 'linear-gradient(135deg, #0a1628, #0d3b66)',
  lightBg: '#ffffff',

  // Brand
  primaryBlue: '#0284c7',     // matches the app nav
  teal: '#0ea5e9',

  // Engine cards
  buildBlue: '#3b82f6',
  complyGreen: '#22c55e',
  scanOrange: '#f59e0b',

  // Status
  errorRed: '#ef4444',
  successGreen: '#22c55e',

  // Text
  textWhite: '#f8fafc',
  textGray: '#94a3b8',
  textDark: '#0f172a',

  // Callouts
  calloutBg: '#0ea5e9',
  calloutRedBg: '#ef4444',
} as const;
```

### Typography

```typescript
export const FONTS = {
  heading: 'Inter, system-ui, sans-serif',
  body: 'Inter, system-ui, sans-serif',
  mono: 'JetBrains Mono, monospace',  // for code/technical text
} as const;

export const SIZES = {
  heroTitle: 72,
  sectionTitle: 48,
  subtitle: 32,
  body: 22,
  caption: 16,
  label: 14,
} as const;
```

Load fonts via `@remotion/google-fonts`:
```tsx
import { loadFont } from '@remotion/google-fonts/Inter';
const { fontFamily } = loadFont();
```

---

## 8. Render and Export

### Preview During Development

```bash
npx remotion studio
```

This opens a browser with frame-by-frame scrubbing, live reload, and individual composition preview.

### Final Render

```bash
# Full quality (for submission)
npx remotion render src/index.ts DemoVideo out/demo-video.mp4 \
  --codec h264 \
  --crf 18 \
  --pixel-format yuv420p

# Quick preview (for review)
npx remotion render src/index.ts DemoVideo out/preview.mp4 \
  --codec h264 \
  --crf 28 \
  --scale 0.5
```

### Render Individual Shots (for iteration)

```bash
npx remotion render src/index.ts Adversarial out/adversarial-test.mp4 --codec h264
```

### Upload

- Upload to YouTube (unlisted) for the Devpost submission
- Also keep the raw .mp4 for any other submission channels
- Recommended: upload at 1080p60 (render at 60fps if time allows — change FPS constant and double all frame counts)

---

## Production Checklist (3-4 Hour Execution Plan)

### Hour 1: Setup + Screen Recordings (60 min)
- [ ] Create Remotion project and install dependencies (10 min)
- [ ] Set up folder structure and theme files (10 min)
- [ ] Record all 10 screen recordings using the live app (40 min)
  - Have a script open with exact text to type for each recording
  - Record each 2-3 times, pick the best take
  - Save as .webm or .mp4 in assets/recordings/

### Hour 2: Build Core Components + Opening/Closing (60 min)
- [ ] Build reusable components: ZoomContainer, ScreenFrame, Callout, HighlightBox, TextReveal (30 min)
- [ ] Build Opening sequence (01) (15 min)
- [ ] Build Closing sequence (13) (15 min)

### Hour 3: Demo Sequences (60 min)
- [ ] Build Shots 04-06: Brief typing, AI interpret, two variants (20 min)
- [ ] Build Shot 07: Compliance score (10 min)
- [ ] Build Shot 08: Adversarial moment — spend extra time here, this is the money shot (20 min)
- [ ] Build Shot 09: Safe edit (10 min)

### Hour 4: Polish + Problem/Solution + Render (60 min)
- [ ] Build Shots 02-03: Problem + Solution intro (15 min)
- [ ] Build Shots 10-12: Role toggle, deploy, live page (15 min)
- [ ] Add music track and adjust volume curve (5 min)
- [ ] Full preview pass — adjust timing, fix any issues (15 min)
- [ ] Final render at full quality (10 min)

---

## Key Principles (What Makes This Video Win)

1. **Show, don't tell.** Every claim is backed by a live screen recording. No slides saying "we do compliance" — show the red rejection banner.

2. **The adversarial moment is the climax.** Build tension before it, make it dramatic, let it breathe. This is what judges will remember.

3. **Speed communicates confidence.** The fact that everything happens in seconds — generation, compliance check, safe edit, deploy — is itself a proof point. Let the recordings run at real speed.

4. **Bookend structure.** Open and close with the same dark gradient and branding. This creates a polished, intentional feel.

5. **Callouts are selective, not exhaustive.** Do not annotate every feature. Highlight the 5-6 moments that score the most judging points: constrained generation, compliance gate, adversarial rejection, audit trail, role views, live deploy.

6. **No voiceover needed (but optional).** The text overlays and callouts tell the story. If you add voiceover, keep it confident and fast — Slack/Linear pacing, not enterprise webinar pacing. Record after the video is assembled so the VO matches the visual rhythm.
