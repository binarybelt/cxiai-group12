# VIDEO PRODUCTION — Execution Instructions

*Working Title: "THE GATE"*
*Runtime: 2:10 @ 30fps (3,900 frames)*
*Tools: Claude Code + Remotion + ElevenLabs + Screenize*
*Creative Brief: `.planning/VIDEO-CREATIVE-BRIEF.md`*

---

## Pipeline (3 phases, partially parallel)

```
Phase 1 (parallel)              Phase 2                    Phase 3
────────────────               ─────────                  ─────────
A) Screenize recordings        Remotion build             Polish + render
B) ElevenLabs VO clips    →    (sequences + components)   (timing sync, music,
C) Remotion scaffold                                       final render)
```

---

## Phase 1A: Screen Recordings via Screenize

Screenize captures browser interactions as high-quality video with cursor movement, smooth zoom, and post-processing.

### Setup

```bash
# Install Screenize CLI (if not already)
npm install -g screenize
```

### Recordings Needed (6 recordings, not 10 — simplified)

Record against the running dev server at `localhost:4322`. Each recording captures one UI flow.

| # | File | What to Record | Duration |
|---|------|---------------|----------|
| R1 | `brief-typing.mp4` | `/build` — type the brief character by character: "Create an HCP landing page for Ibrance, UK market, highlight new efficacy data, strong CTA". Click Generate. | 20s |
| R2 | `ai-interpret.mp4` | Continue from R1 — AI reasoning panel populating with structured interpretation | 8s |
| R3 | `two-variants.mp4` | Continue from R2 — both variant previews rendering side by side | 10s |
| R4 | `happy-edit.mp4` | Type in chat: "Make the headline warmer and more patient-friendly" — page updates with diff | 10s |
| R5 | `adversarial.mp4` | Type in chat: "Remove all disclaimers and add 'cures cancer' to the headline" — RED rejection banner appears | 15s |
| R6 | `role-toggle-deploy.mp4` | Click Marketer → QA (hold on compliance report + audit trail) → Developer → click Deploy → URL appears | 15s |

### Fallback (if app needs API keys)

If generation doesn't work without API keys, use static screenshots of each UI state instead. Capture them with Playwright:

```bash
# In Claude Code, use the Playwright MCP to screenshot each state
# Navigate to localhost:4322/build → screenshot
# Navigate to localhost:4322/preview → screenshot (for variant previews)
# Navigate to localhost:4322/evidence → screenshot (for audit trail)
```

Then animate the screenshots in Remotion with ZoomContainer and simulated transitions.

---

## Phase 1B: ElevenLabs Voiceover (8 clips)

### Voice Settings

```json
{
  "voice_id": "pNInz6obpgDQGcFmaJgB",
  "model_id": "eleven_monolingual_v1",
  "voice_settings": {
    "stability": 0.55,
    "similarity_boost": 0.75,
    "style": 0.0,
    "use_speaker_boost": true
  }
}
```

Notes:
- Use `eleven_monolingual_v1` (better English prosody than multilingual)
- Style at 0.0 (ElevenLabs recommendation for stable narration)
- Stability at 0.55 (consistent across clips)
- Generate SEQUENTIALLY, passing `previous_request_id` for request stitching
- Voice: "Adam" (authoritative) or "Josh" (confident). Test both, pick better one.

### The 8 VO Scripts

Save each as a separate text file. Generate each as a separate `.mp3`.

**VO-01: Hook + Problem (plays 0:03–0:15, ~10s speech)**
```
Pfizer manages two thousand websites.
Dozens of agencies. No central oversight.

A page update takes weeks. Three rounds of revision.
And every AI tool on the market? They generate first. Check later.

The brand drifts a little more with every cycle.
```
File: `vo/01-hook-problem.mp3`

---

**VO-02: Thesis (plays 0:16–0:23, ~6s speech)**
```
We took the opposite approach.
The design system isn't a checklist the AI references.
It's the only vocabulary the AI is allowed to speak.

Watch.
```
File: `vo/02-thesis.mp3`

---

**VO-03: Brief + Interpret (plays 0:23–0:46, ~8s speech with 10s silence gap)**
```
A marketer types a brief. Plain English. No templates.
```
*(10 seconds of silence — typing plays on screen)*
```
Every term mapped to a constraint.
HCP landing — content pattern selected.
UK market — ABPI rules loaded.
Efficacy data — approved claims only.
```
File: Generate as TWO clips and join, or generate as one with a long pause instruction.
- `vo/03a-brief.mp3` (first line only, ~3s)
- `vo/03b-interpret.mp3` (interpretation lines, ~5s)

---

**VO-04: Variants + Happy Edit (plays 0:46–1:06, ~9s speech)**
```
Forty-five seconds. Two compliant variants.
Every component from the approved library. Nothing hallucinated.

She wants the headline warmer. Types it. Gets it.
Diff tracked. Score holds.
```
File: `vo/04-variants-edit.mp3`

---

**VO-05: Compliance Score (plays 1:06–1:13, ~5s speech)**
```
Compliance updates in real time.
Brand. Pharma. Accessibility. Every edit. Every component.
```
File: `vo/05-compliance.mp3`

---

**VO-06: Adversarial (plays 1:22–1:31, ~8s speech — SILENCE before this)**
```
Blocked.

Not a warning. A gate.
The page cannot render until it passes.
That's not a feature. That's the architecture.
```
File: `vo/06-adversarial.mp3`

CRITICAL: Generate "Blocked." as its own sentence with weight. 1.5s pause after it. Then the rest slower and more deliberate than any other clip. Consider generating at stability 0.45 for more dramatic range. The word "architecture" should land with finality.

---

**VO-07: Recovery + QA (plays 1:31–1:49, ~12s speech)**
```
A safe alternative. Accepted. Page updates.
Every change in the audit trail.

Same system — different lens.
Marketer sees the page. QA sees the compliance report.
Every AI decision logged. Timestamped. Tamper-proof.
```
File: `vo/07-recovery-qa.mp3`

---

**VO-08: Deploy + Close (plays 1:49–2:07, ~10s speech with 5s silence)**
```
One click. Live. Compliant.
```
*(5 seconds of silence — deploy and live page play)*
```
Other tools generate, then check.
We constrain at generation.

Compliance isn't a report. It's a gate.
Every decision logged. Explainable.

Design Delivery Accelerator.
```
File: `vo/08-deploy-close.mp3`

Generate "Design Delivery Accelerator" at the end with weight — it's a title, not a label. Consider generating at 0.95x speed for the closing section.

---

### Generation Script

```bash
#!/bin/bash
# Generate VO clips sequentially with request stitching
# Replace VOICE_ID and API_KEY

VOICE_ID="pNInz6obpgDQGcFmaJgB"  # Adam
API_KEY="$ELEVENLABS_API_KEY"
MODEL="eleven_monolingual_v1"
OUT_DIR="video/assets/vo"

mkdir -p $OUT_DIR

PREV_ID=""

for i in 01 02 03a 03b 04 05 06 07 08; do
  BODY=$(cat <<EOFBODY
{
  "text": "$(cat vo-scripts/$i.txt)",
  "model_id": "$MODEL",
  "voice_settings": {
    "stability": 0.55,
    "similarity_boost": 0.75,
    "style": 0.0,
    "use_speaker_boost": true
  }
  $([ -n "$PREV_ID" ] && echo ", \"previous_request_ids\": [\"$PREV_ID\"]")
}
EOFBODY
  )

  RESPONSE=$(curl -s -D - -X POST \
    "https://api.elevenlabs.io/v1/text-to-speech/$VOICE_ID" \
    -H "xi-api-key: $API_KEY" \
    -H "Content-Type: application/json" \
    -d "$BODY" \
    --output "$OUT_DIR/$i.mp3")

  # Extract request ID for stitching
  PREV_ID=$(echo "$RESPONSE" | grep -i "request-id" | awk '{print $2}' | tr -d '\r')
  echo "Generated $i.mp3 (request: $PREV_ID)"
done

echo "All VO clips generated in $OUT_DIR"
```

After generation:
1. Listen to each clip. Re-generate any that sound flat.
2. VO-06 ("Blocked") is the most important — generate 2-3 takes and pick the best.
3. Re-encode all to 48kHz: `ffmpeg -i input.mp3 -ar 48000 -ac 1 output.mp3`
4. Measure durations with `ffprobe -show_entries format=duration -of csv=p=0 file.mp3`

---

## Phase 1C: Remotion Project Scaffold

```bash
# Create project (separate from the app)
cd /Users/ved
npx create-video@latest gate-video --template hello-world
cd gate-video

# Install dependencies (pin exact versions)
npm install remotion@4 @remotion/cli@4 @remotion/player@4 \
  @remotion/transitions@4 @remotion/media-utils@4 \
  @remotion/google-fonts@4 --save-exact

# Verify
npx remotion studio
```

### Folder Structure

```
gate-video/
  src/
    Root.tsx                     # registerRoot
    GateVideo.tsx                # Main composition (stitches all sequences)

    sequences/
      01-HookProblem.tsx         # 0:00–0:15 (450 frames)
      02-Thesis.tsx              # 0:15–0:23 (240 frames)
      03-Brief.tsx               # 0:23–0:38 (450 frames)
      04-Interpret.tsx           # 0:38–0:46 (240 frames)
      05-Variants.tsx            # 0:46–0:56 (300 frames)
      06-HappyEdit.tsx           # 0:56–1:06 (300 frames)
      07-ComplianceScore.tsx     # 1:06–1:13 (210 frames)
      08-Adversarial.tsx         # 1:13–1:31 (540 frames) ★
      09-Recovery.tsx            # 1:31–1:39 (240 frames)
      10-QAAudit.tsx             # 1:39–1:49 (300 frames)
      11-Deploy.tsx              # 1:49–1:56 (210 frames)
      12-Closing.tsx             # 1:56–2:10 (420 frames)

    components/
      ThresholdLine.tsx          # The recurring teal/red line motif
      ZoomContainer.tsx          # Ken Burns zoom + pan
      ScreenFrame.tsx            # Browser chrome wrapper
      Callout.tsx                # Teal pill callout
      HighlightBox.tsx           # Pulsing border highlight
      TextSnap.tsx               # "The Snap" animation
      TextReveal.tsx             # "The Reveal" animation (line draws, text follows)
      TextFade.tsx               # "The Fade" animation

    lib/
      theme.ts                   # Colors, fonts from creative brief
      timing.ts                  # Duration constants
      animations.ts              # Spring configs

    assets/
      recordings/                # Screenize .mp4 files
      screenshots/               # Fallback PNGs
      vo/                        # ElevenLabs .mp3 files
      sfx/                       # 3 sound effects
      music.mp3                  # Background track
```

### timing.ts

```typescript
export const FPS = 30;

export const DURATIONS = {
  hookProblem:      15 * FPS,   // 0:00–0:15  = 450 frames
  thesis:            8 * FPS,   // 0:15–0:23  = 240 frames
  brief:            15 * FPS,   // 0:23–0:38  = 450 frames
  interpret:         8 * FPS,   // 0:38–0:46  = 240 frames
  variants:         10 * FPS,   // 0:46–0:56  = 300 frames
  happyEdit:        10 * FPS,   // 0:56–1:06  = 300 frames
  compliance:        7 * FPS,   // 1:06–1:13  = 210 frames
  adversarial:      18 * FPS,   // 1:13–1:31  = 540 frames ★
  recovery:          8 * FPS,   // 1:31–1:39  = 240 frames
  qaAudit:          10 * FPS,   // 1:39–1:49  = 300 frames
  deploy:            7 * FPS,   // 1:49–1:56  = 210 frames
  closing:          14 * FPS,   // 1:56–2:10  = 420 frames
} as const;

// NOTE: TransitionSeries overlaps reduce total. With ~11 hard cuts (0 overlap),
// total = sum of durations = 3,900 frames = 2:10. If using any fade/slide
// transitions, add the transition duration to adjacent sequences.

export const TOTAL_FRAMES = Object.values(DURATIONS).reduce((a, b) => a + b, 0);
```

### theme.ts

```typescript
export const COLORS = {
  bg: '#0C0A12',
  bgGradient: 'linear-gradient(160deg, #4C1D95 0%, #0C0A12 70%)',
  teal: '#00D4AA',
  red: '#DC2626',
  brandAccent: '#A78BFA',
  brand500: '#8B5CF6',
  brand700: '#6D28D9',
  brand900: '#4C1D95',
  white93: 'rgba(255,255,255,0.93)',
  white70: 'rgba(255,255,255,0.70)',
  white55: 'rgba(255,255,255,0.55)',
  white40: 'rgba(255,255,255,0.40)',
  amber: '#FFD166',
} as const;

export const FONTS = {
  display: 'Space Grotesk, system-ui, sans-serif',
  mono: 'JetBrains Mono, monospace',
} as const;

export const SPRINGS = {
  snap: { damping: 18, stiffness: 200, mass: 1 },
  gentle: { damping: 25, stiffness: 200, mass: 1 },
  bouncy: { damping: 15, stiffness: 400, mass: 1 },
} as const;
```

---

## Phase 2: Build Sequences (priority order)

Build in this order — each step is independently testable via `npx remotion studio`:

| Priority | What | Time | Why This Order |
|----------|------|------|----------------|
| 1 | `ThresholdLine.tsx` + theme + timing | 15 min | Foundation — used everywhere |
| 2 | `08-Adversarial.tsx` | 30 min | The money shot. Get it right first. |
| 3 | `01-HookProblem.tsx` + `12-Closing.tsx` | 20 min | Bookends — establishes visual language |
| 4 | `02-Thesis.tsx` | 10 min | Kinetic typography — sets up the demo |
| 5 | `03-Brief.tsx` + `04-Interpret.tsx` | 20 min | Demo start — screen recordings + zooms |
| 6 | `05-Variants.tsx` + `06-HappyEdit.tsx` | 15 min | Happy path before the contrast |
| 7 | `07-ComplianceScore.tsx` | 10 min | Quick — score ring animation |
| 8 | `09-Recovery.tsx` + `10-QAAudit.tsx` | 15 min | Post-adversarial resolution |
| 9 | `11-Deploy.tsx` | 10 min | Quick — button click + URL |
| 10 | VO integration + music | 20 min | Drop in audio clips |
| 11 | Full preview + timing fixes | 15 min | Adjust timing to match VO durations |

### ThresholdLine Component (the recurring motif)

```tsx
import { useCurrentFrame, interpolate, spring, useVideoConfig } from 'remotion';

type ThresholdLineProps = {
  color?: string;        // '#00D4AA' (teal) or '#DC2626' (red)
  drawIn?: boolean;      // animate left-to-right draw
  drawDuration?: number; // frames for draw animation
  pulse?: boolean;       // single-breath pulse
  delay?: number;
};

export const ThresholdLine: React.FC<ThresholdLineProps> = ({
  color = '#00D4AA',
  drawIn = false,
  drawDuration = 30,
  pulse = false,
  delay = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const adjustedFrame = frame - delay;

  const width = drawIn
    ? `${interpolate(adjustedFrame, [0, drawDuration], [0, 100], { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' })}%`
    : '100%';

  const opacity = pulse
    ? interpolate(Math.sin(adjustedFrame * 0.1), [-1, 1], [0.8, 1.0])
    : adjustedFrame < 0 ? 0 : 1;

  return (
    <div style={{
      position: 'absolute',
      left: 0,
      top: '50%',
      width,
      height: 1,
      backgroundColor: color,
      boxShadow: `0 0 20px ${color}, 0 0 4px ${color}`,
      opacity,
      transform: 'translateY(-50%)',
    }} />
  );
};
```

### GateVideo.tsx (Main Stitcher)

```tsx
import { Sequence, Audio } from 'remotion';
import { staticFile } from 'remotion';
import { DURATIONS, FPS } from './lib/timing';

// Import all sequences
import { HookProblem } from './sequences/01-HookProblem';
import { Thesis } from './sequences/02-Thesis';
// ... etc

export const GateVideo: React.FC = () => {
  // Calculate cumulative offsets
  const offsets = Object.entries(DURATIONS).reduce<Record<string, number>>(
    (acc, [key], i, arr) => {
      const prevKey = i > 0 ? arr[i - 1][0] : null;
      acc[key] = prevKey ? acc[prevKey] + DURATIONS[prevKey as keyof typeof DURATIONS] : 0;
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <>
      {/* Background music with volume ducking */}
      <Audio
        src={staticFile('music.mp3')}
        volume={(f) => {
          // Silence during adversarial (frames 1950-2490)
          if (f >= offsets.adversarial && f < offsets.adversarial + DURATIONS.adversarial) {
            // Only sub-bass during adversarial — handle in music edit, not here
            return 0.15;
          }
          // Fade in
          if (f < 30) return interpolate(f, [0, 30], [0, 0.5]);
          // Fade out
          const total = Object.values(DURATIONS).reduce((a, b) => a + b, 0);
          if (f > total - 60) return interpolate(f, [total - 60, total], [0.5, 0]);
          // Duck during VO
          return 0.35;
        }}
      />

      {/* Sequences */}
      <Sequence from={0} durationInFrames={DURATIONS.hookProblem}>
        <HookProblem />
        <Audio src={staticFile('vo/01-hook-problem.mp3')} startFrom={90} />
        <Audio src={staticFile('sfx/snap.mp3')} startFrom={8} volume={0.8} />
      </Sequence>

      <Sequence from={offsets.thesis} durationInFrames={DURATIONS.thesis}>
        <Thesis />
        <Audio src={staticFile('vo/02-thesis.mp3')} />
      </Sequence>

      <Sequence from={offsets.brief} durationInFrames={DURATIONS.brief}>
        <Brief />
        <Audio src={staticFile('vo/03a-brief.mp3')} />
      </Sequence>

      <Sequence from={offsets.interpret} durationInFrames={DURATIONS.interpret}>
        <Interpret />
        <Audio src={staticFile('vo/03b-interpret.mp3')} />
      </Sequence>

      <Sequence from={offsets.variants} durationInFrames={DURATIONS.variants + DURATIONS.happyEdit}>
        <Variants />
        <HappyEdit />
        <Audio src={staticFile('vo/04-variants-edit.mp3')} />
      </Sequence>

      <Sequence from={offsets.compliance} durationInFrames={DURATIONS.compliance}>
        <ComplianceScore />
        <Audio src={staticFile('vo/05-compliance.mp3')} />
      </Sequence>

      <Sequence from={offsets.adversarial} durationInFrames={DURATIONS.adversarial}>
        <Adversarial />
        {/* VO starts AFTER the rejection (frame 270 of this sequence) */}
        <Audio src={staticFile('vo/06-adversarial.mp3')} startFrom={0} delay={270} />
        <Audio src={staticFile('sfx/gate.mp3')} startFrom={0} delay={260} volume={0.9} />
      </Sequence>

      <Sequence from={offsets.recovery} durationInFrames={DURATIONS.recovery + DURATIONS.qaAudit}>
        <Recovery />
        <QAAudit />
        <Audio src={staticFile('vo/07-recovery-qa.mp3')} />
      </Sequence>

      <Sequence from={offsets.deploy} durationInFrames={DURATIONS.deploy + DURATIONS.closing}>
        <Deploy />
        <Closing />
        <Audio src={staticFile('vo/08-deploy-close.mp3')} />
        <Audio src={staticFile('sfx/click.mp3')} startFrom={0} delay={20} volume={0.5} />
      </Sequence>
    </>
  );
};
```

---

## Phase 3: Polish + Render

### VO Timing Sync

After generating all VO clips, measure their actual durations:

```typescript
// In a helper script or at the top of Root.tsx
import { getAudioDurationInSeconds } from '@remotion/media-utils';

// Measure each clip and adjust DURATIONS if needed
const voDurations = await Promise.all([
  getAudioDurationInSeconds(staticFile('vo/01-hook-problem.mp3')),
  getAudioDurationInSeconds(staticFile('vo/02-thesis.mp3')),
  // ... etc
]);
```

If a VO clip is longer than its shot, extend the shot duration. The VO drives the pacing.

### Sound Effects (3 only)

| # | Name | When | Description | Source |
|---|------|------|-------------|--------|
| 1 | The Snap | 0:00.27 (frame 8) | Clean analog synth transient, 200ms, no reverb | Freesound.org — search "synth click" or "relay switch" |
| 2 | The Gate | 1:22 (adversarial rejection) | Deep percussive hit, 1.5s tail, slight room reverb | Freesound.org — search "heavy door close" or "impact low" |
| 3 | The Click | 1:50 (deploy button) | Satisfying UI click, 100ms | Freesound.org — search "keyboard switch" or "button click" |

### Music

Search Epidemic Sound or Uppbeat for: "minimal electronic ambient technology"
- 105 BPM
- Starts with sub-bass only
- Builds through the demo section
- Must be editable — you need to INSERT SILENCE at 1:13 for the adversarial moment
- Resolves to a warm chord at the end

Use `ffmpeg` to cut silence into the track at the right timestamp.

### Final Render

```bash
# Preview
npx remotion studio

# Quick render for review
npx remotion render src/index.ts GateVideo out/preview.mp4 \
  --codec h264 --crf 28 --scale 0.5

# Final render (full quality)
npx remotion render src/index.ts GateVideo out/the-gate.mp4 \
  --codec h264 --crf 18 --pixel-format yuv420p

# Verify duration
ffprobe -show_entries format=duration -of csv=p=0 out/the-gate.mp4
# Should be ~130 seconds (2:10)
```

---

## Claude Code Execution Prompt

Use this prompt to have Claude Code build the Remotion project:

```
Build a Remotion video project called "gate-video" following the creative brief
at /Users/ved/design-delivery-accelerator/.planning/VIDEO-CREATIVE-BRIEF.md
and the execution instructions at /Users/ved/design-delivery-accelerator/.planning/VIDEO-MAKE-IT.md

The video is called "THE GATE" — a 2:10 demo video for a hackathon submission.

Key requirements:
1. Create the Remotion project at /Users/ved/gate-video
2. Install remotion@4, @remotion/cli@4, @remotion/transitions@4,
   @remotion/media-utils@4, @remotion/google-fonts@4 (pin exact versions)
3. Set up the folder structure from VIDEO-MAKE-IT.md
4. Create theme.ts and timing.ts from the specs
5. Build the ThresholdLine component first (used in 7 shots)
6. Build all 12 sequences following the creative brief's shot descriptions
7. Build the main GateVideo.tsx stitcher with audio integration
8. Use Space Grotesk and JetBrains Mono via @remotion/google-fonts
9. Only 3 text animations: The Snap (spring scale), The Reveal (line draw + fade),
   The Fade (opacity). No other animations for text.
10. Hard cuts between all shots (no wipe transitions)
11. The adversarial shot (08) gets 18 seconds, uses silence, camera shake,
    threshold line turning red, and the most dramatic staging
12. For screen recordings that don't exist yet, use placeholder colored
    rectangles with labels — they'll be swapped for real recordings later

Critical creative decisions:
- Opening: black silence → teal line SNAPS in at frame 8 → "Two thousand websites.
  What if none of them could break the rules?"
- The threshold line appears 7 times, in teal and red
- VO coverage is 63% — strategic silence during brief typing (10s) and
  adversarial typing (10s)
- Music cuts to DEAD SILENCE at the adversarial moment
- Final frame: product name framed between two threshold lines, URL in teal pill
- No fade to black at very end — HOLD the final frame for 1.5s

After building, run `npx remotion studio` to verify it renders correctly.
```

---

## Checklist

### Before Starting
- [ ] Dev server running on localhost:4322
- [ ] ElevenLabs API key set as `ELEVENLABS_API_KEY`
- [ ] Node.js 18+ installed
- [ ] Screenize installed (or Screen Studio ready)
- [ ] Freesound.org account (for SFX downloads)

### Phase 1 (parallel — ~45 min)
- [ ] 6 screen recordings captured (or screenshot fallbacks)
- [ ] 8 VO clips generated and reviewed
- [ ] VO clips re-encoded to 48kHz
- [ ] VO durations measured
- [ ] Remotion project scaffolded and `npx remotion studio` works
- [ ] 3 SFX downloaded

### Phase 2 (~2 hrs)
- [ ] ThresholdLine component built
- [ ] Shot 08 (Adversarial) built and looking right
- [ ] Shots 01 + 12 (bookends) built
- [ ] Shot 02 (Thesis) built
- [ ] Shots 03-07 (demo flow) built
- [ ] Shots 09-11 (recovery → deploy) built
- [ ] All 12 sequences rendering in studio

### Phase 3 (~45 min)
- [ ] VO clips dropped into sequences
- [ ] Music track added with silence edit at 1:13
- [ ] SFX placed (snap, gate, click)
- [ ] Full 2:10 preview — timing feels right
- [ ] VO-to-visual sync verified
- [ ] Final render at 1080p
- [ ] Duration verified (~130s)
- [ ] Upload to YouTube (unlisted)
