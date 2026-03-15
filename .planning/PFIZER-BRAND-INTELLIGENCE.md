# Pfizer Brand Intelligence Report

> Extracted 2026-03-15 from live pfizer.com CSS, SVG assets, and public brand documentation.
> This is actionable design data for building a "Future Pfizer" design system.

---

## 1. Color System (from CSS Custom Properties)

### Primary: Pfizer Blue (10-step scale)

| Token | Hex | Usage |
|-------|-----|-------|
| `--pfizer-blue-10` | `#e8f2ff` | Lightest tint, backgrounds |
| `--pfizer-blue-20` | `#cfdfff` | Light tint |
| `--pfizer-blue-30` | `#9cc0ff` | Light accent |
| `--pfizer-blue-40` | `#6397ff` | Medium light |
| `--pfizer-blue-50` | `#3578ff` | Medium blue |
| `--pfizer-blue-60` | `#2e29ff` | **Vivid blue / Electric** (buttons on dark) |
| `--pfizer-blue-70` | `#0000c9` | **PRIMARY BRAND BLUE** (logo fill, links, primary actions) |
| `--pfizer-blue-80` | `#00009d` | Dark blue |
| `--pfizer-blue-90` | `#000067` | Very dark blue (`--theme-dark`) |
| `--pfizer-blue-100` | `#00003a` | Deepest navy |

> **Key insight:** The primary brand blue is `#0000c9` (pure blue, no cyan), NOT the old `#0093d0` / `#0070BF` from the 2021 rebrand. Pfizer has evolved their palette again. The `--pfizer-blue-60` at `#2e29ff` is a striking electric violet-blue used for interactive elements.

### Secondary: Pfizer Cyan (10-step scale)

| Token | Hex | Usage |
|-------|-----|-------|
| `--pfizer-cyan-10` | `#e0f5ff` | Lightest cyan tint, section backgrounds |
| `--pfizer-cyan-20` | `#aee4ff` | Light cyan |
| `--pfizer-cyan-30` | `#68d1ff` | Medium light |
| `--pfizer-cyan-40` | `#35b6ff` | Bright cyan |
| `--pfizer-cyan-50` | `#0095ff` | **Bright blue** (section backgrounds) |
| `--pfizer-cyan-60` | `#006eb2` | Medium dark |
| `--pfizer-cyan-70` | `#005589` | Dark cyan |
| `--pfizer-cyan-80` | `#003e65` | Very dark |
| `--pfizer-cyan-90` | `#002942` | Near-black cyan |
| `--pfizer-cyan-100` | `#001928` | Deepest dark |

### Neutrals (10-step scale)

| Token | Hex |
|-------|-----|
| `--neutral-white` | `#ffffff` |
| `--neutral-10` | `#f0f0f0` |
| `--neutral-20` | `#e0e0e0` |
| `--neutral-30` | `#c9c9c9` |
| `--neutral-40` | `#b3b3b3` |
| `--neutral-50` | `#999999` |
| `--neutral-60` | `#666666` |
| `--neutral-70` | `#525252` |
| `--neutral-80` | `#3d3d3d` |
| `--neutral-90` | `#292929` |
| `--neutral-100` | `#171717` |
| `--neutral-black` | `#0a0a0a` |

### Accent Colors (from CSS usage)

| Color | Hex | Context |
|-------|-----|---------|
| Teal/Cyan | `#0dbdba` | Accent highlight |
| Bright Blue | `#0095ff` | Section backgrounds (`--bg-section-color`) |
| Electric Blue | `#2e29ff` | Hero/banner backgrounds |
| Deep Navy | `#010144` | Footer/dark gradient base |
| Crimson | `#c00727` | Error/alert states |
| Rose/Pink | `#dd315a` | Secondary alert |
| Ice Blue | `#E0F5FF` | Light section backgrounds |
| Frost | `#F2F9FC` | Lightest section backgrounds |

### Theme Tokens

| Token | Value |
|-------|-------|
| `--theme-dark` | `var(--pfizer-blue-90)` = `#000067` |
| `--theme-light` | `var(--pfizer-blue-10)` = `#e8f2ff` |
| `--theme-brightblue` | `var(--pfizer-blue-70)` = `#0000c9` |

### Gradients

```css
/* Primary dark gradient (footer/hero) */
linear-gradient(0deg, #010144 0, #010144 100%),
linear-gradient(180deg, rgba(23, 23, 23, 0.8) 0, #242525 100%)

/* Overlay gradient */
linear-gradient(45deg, var(--overlay-color))
```

---

## 2. Typography

### Font Families (from live CSS)

Pfizer has **moved beyond Noto Sans** to a comprehensive custom type system:

#### Primary: PfizerDiatype (by MCKL Type, Los Angeles)

Custom typeface commissioned from [MCKL Type](https://www.mckltype.com/custom/pfizer). Full weight range:

| Weight | Font Name | Italic |
|--------|-----------|--------|
| Thin | `PfizerDiatype-Thin` | `PfizerDiatype-ThinItalic` |
| Light | `PfizerDiatype-Light` | `PfizerDiatype-LightItalic` |
| Regular | `PfizerDiatype-Regular` | `PfizerDiatype-RegularItalic` |
| Medium | `PfizerDiatype-Medium` | `PfizerDiatype-MediumItalic` |
| Bold | `PfizerDiatype-Bold` | `PfizerDiatype-BoldItalic` |
| Heavy | `PfizerDiatype-Heavy` | `PfizerDiatype-HeavyItalic` |
| Black | `PfizerDiatype-Black` | `PfizerDiatype-BlackItalic` |
| Ultra | `PfizerDiatype-Ultra` | `PfizerDiatype-UltraItalic` |

Also available as a variable font: `PfizerDiatype-PlusVariable`

**Fallback stack:** `"PfizerDiatype-Regular", "Noto Sans", Arial, sans-serif`

#### Secondary: PfizerTomorrow (Display/Headlines)

| Weight | Font Name | Italic |
|--------|-----------|--------|
| Regular | `PfizerTomorrow-Regular` | `PfizerTomorrow-RegularItalic` |
| Bold | `PfizerTomorrow-Bold` | `PfizerTomorrow-BoldItalic` |
| Black | `PfizerTomorrow-Black` | `PfizerTomorrow-BlackItalic` |

**Fallback stack:** `"PfizerTomorrow-Bold", Arial, sans-serif`

#### Monospace: PfizerDiatypeMono

Full mono family in Regular, Medium, Light, Bold, Thin -- plus **Compressed** and **Condensed** variants for data-dense layouts.

| Variant | Weights |
|---------|---------|
| PfizerDiatypeMono | Thin, Light, Regular, Medium, Bold |
| PfizerDiatypeMonoCondensed | Thin, Light, Regular, Medium, Bold |
| PfizerDiatypeMonoCompressed | Thin, Light, Regular, Medium, Bold |

All with italic variants.

### Font Sizes (from CSS)

| Size | Rem/Px | Likely Usage |
|------|--------|-------------|
| `0.625rem` | 10px | Fine print, labels |
| `0.75rem` | 12px | Captions, metadata |
| `0.875rem` | 14px | Small body text |
| `1rem` | 16px | Base body text |
| `1.125rem` | 18px | Large body / intro text |
| `1.25rem` | 20px | H6 / small heading |
| `1.375rem` | 22px | H5 |
| `1.5rem` | 24px | H4 |
| `1.75rem` | 28px | H3 |
| `2rem` | 32px | H2 |
| `2.1875rem` | 35px | Large H2 |
| `2.625rem` | 42px | H1 |

### Font Weights Used

- `300` (Light)
- `400` (Regular / Normal)
- `500` (Medium)
- `bold` / `900` (Bold / Black)

---

## 3. Logo

### Current Logo (SVG extracted from pfizer.com)

- **File:** `logo-blue.svg` at `/profiles/pfecpfizercomus_profile/themes/pfecpfizercomus/public/assets/images/logo-blue.svg`
- **Fill color:** `#0000c9` (single color, flat)
- **Viewbox:** `0 0 1505.9 621.4` (landscape ratio ~2.42:1)
- **Structure:** Double helix "P" mark (left) + "Pfizer" wordmark (right), all in one SVG group
- **Design credit:** MCKL Type (letterforms), Team (identity system), Landor & Fitch (brand strategy)

### Logo Description

The double helix mark is composed of 4 curved paths forming two intertwined ribbons in a DNA-inspired "P" shape. The wordmark "Pfizer" uses custom letterforms with:
- A distinctive "P" with an open bowl
- A unique "f" with an extended descender stroke that sweeps dramatically
- Angular, confident letterforms throughout
- The "r" has a minimal, clean terminal

### Key Observation

The logo on pfizer.com is now **monochrome** `#0000c9` -- not the two-tone blue (dark/light) shown in the 2021 launch. This suggests the identity has been simplified/refined for digital use.

---

## 4. Spacing System (CSS Custom Properties)

Complete spacing scale using `rem` units:

| Token | Value |
|-------|-------|
| `--spacing-0` | `0px` |
| `--spacing-0_5` | `0.125rem` (2px) |
| `--spacing-1` | `0.25rem` (4px) |
| `--spacing-1_5` | `0.375rem` (6px) |
| `--spacing-2` | `0.5rem` (8px) |
| `--spacing-2_5` | `0.625rem` (10px) |
| `--spacing-3` | `0.75rem` (12px) |
| `--spacing-3_5` | `0.875rem` (14px) |
| `--spacing-4` | `1rem` (16px) |
| `--spacing-5` | `1.25rem` (20px) |
| `--spacing-6` | `1.5rem` (24px) |
| `--spacing-7` | `1.75rem` (28px) |
| `--spacing-8` | `2rem` (32px) |
| `--spacing-9` | `2.25rem` (36px) |
| `--spacing-10` | `2.5rem` (40px) |
| `--spacing-11` | `2.75rem` (44px) |
| `--spacing-12` | `3rem` (48px) |
| `--spacing-14` | `3.5rem` (56px) |
| `--spacing-16` | `4rem` (64px) |
| `--spacing-18` | `4.5rem` (72px) |
| `--spacing-20` | `5rem` (80px) |
| `--spacing-24` | `6rem` (96px) |
| `--spacing-28` | `7rem` (112px) |
| `--spacing-32` | `8rem` (128px) |
| `--spacing-36` | `9rem` (144px) |
| `--spacing-40` | `10rem` (160px) |
| `--spacing-44` | `11rem` (176px) |
| `--spacing-48` | `12rem` (192px) |
| `--spacing-52` | `13rem` (208px) |
| `--spacing-56` | `14rem` (224px) |
| `--spacing-60` | `15rem` (240px) |
| `--spacing-64` | `16rem` (256px) |
| `--spacing-72` | `18rem` (288px) |
| `--spacing-80` | `20rem` (320px) |
| `--spacing-96` | `24rem` (384px) |
| `--spacing-px` | `1px` |

### Layout Spacing Aliases

| Token | Value | Usage |
|-------|-------|-------|
| `--desktop-padding-none` | `--spacing-0` | No padding |
| `--desktop-padding-xs` | `--spacing-3` (12px) | Extra small sections |
| `--desktop-padding-sm` | `--spacing-6` (24px) | Card default spacing |
| `--desktop-padding-md` | `--spacing-12` (48px) | Default section spacing |
| `--desktop-padding-lg` | `--spacing-24` (96px) | Large sections |
| `--mobile--padding-none` | `--spacing-0` | Mobile no padding |
| `--mobile--padding-sm` | `--spacing-4` (16px) | Mobile small |
| `--mobile--padding-md` | `--spacing-6` (24px) | Mobile default |
| `--mobile--padding-lg` | `--spacing-12` (48px) | Mobile large |

---

## 5. Border Radius System

| Token | Value |
|-------|-------|
| `--border-radius-sharp` | `0px` |
| `--border-radius-xs` | `2px` |
| `--border-radius-sm` | `4px` |
| `--border-radius-md` | `6px` |
| `--border-radius-lg` | `8px` |
| `--border-radius-xl` | `12px` |
| `--border-radius-2xl` | `16px` |
| `--border-radius-3xl` | `24px` |
| `--border-radius-4xl` | `32px` |
| `--default-radius` | `var(--spacing-4)` = `1rem` (16px) |

**Design note:** Pills/buttons use `62px` or `3.66667em` for fully rounded shapes. The default card radius is `16px`.

---

## 6. Shadows

```css
--card-box-shadow: 0 0 32px 0 rgba(0 0 0 / 8%);
```

Subtle, wide-spread shadow with 8% opacity. Very light, modern feel.

---

## 7. Component Patterns

### Buttons

**Primary Button (Light theme):**
- Background: `var(--pfizer-blue-70)` = `#0000c9`
- Text: `var(--neutral-white)` = `#ffffff`
- Border-radius: pill (`62px`) or `--default-radius`
- Hover: background shifts (theme-dependent)
- Disabled: `background: #c9c9c9`, `color: var(--neutral-60)`

**Primary Button (Dark/section-light theme):**
- Background: `var(--neutral-white)`
- Text: `var(--pfizer-blue-60)` = `#2e29ff`
- Hover: `background: var(--theme-lightgray)`, `border: var(--neutral-10)`

**Secondary Button:**
- Background: `transparent`
- Border: `var(--neutral-white)` or `var(--pfizer-blue-70)`
- Ghost/outline style

**Button Classes:** `btn--primary`, `btn--secondary`, `btn--round`, `btn--round-sm`, `btn--slider`, `btn--pill`

### Section Themes

The site uses a section-based theming system:
- `.section-dark` -- dark background (deep blue/navy), white text
- `.section-light` -- branded blue/cyan backgrounds, white text
- Default -- white background, dark text
- `.bright-blue` -- electric blue variant
- `.dark` -- dark mode variant

**Section background examples from homepage:**
- `background: #0095ff` (Bright cyan-blue)
- `background: #E0F5FF` (Ice blue)
- `background: #F2F9FC` (Frost)
- `background: #2e29ff` (Electric blue)

### Cards

- Default spacing: `var(--desktop-padding-sm)` = 24px
- Shadow: `0 0 32px 0 rgba(0 0 0 / 8%)`
- Border-radius: `var(--default-radius)` = 16px

### Navigation

- Uses Foundation framework (`grid-container`, `off-canvas-wrapper`)
- Section-based color coding: `section-orange` for Science, `section-corporate` for About
- Bleed-through transparent header on hero sections
- Mega-menu with 3-level depth

---

## 8. Layout Grid

- Framework: Zurb Foundation (responsive grid)
- Breakpoints (from CSS font-family config string):
  - `small`: 0em
  - `tiny`: 25.875em (414px)
  - `medium`: 45em (720px)
  - `lmedium`: 64em (1024px)
  - `large`: 80em (1280px)
  - `mlarge`: 90em (1440px)
  - `xlarge`: 120em (1920px)
- Max content width: `1239px` (header), responsive images up to `1920px`

---

## 9. Photography & Imagery Style

- **Human-first:** Big, emotional, diverse photography -- not sterile clinical imagery
- **Authentic:** Real patients and healthcare professionals, not stock-looking
- **Warm:** Natural lighting, warm skin tones, genuine expressions
- **Inclusive:** Diverse representation across age, ethnicity, gender
- **Scientific moments:** Lab imagery is modern and aspirational, not clinical
- **Video-forward:** YouTube embeds prominent on homepage, story-driven content
- **CDN:** Images served from `cdn.pfizer.com` with WebP format support

---

## 10. Brand Voice & Tone

- **Confident but accessible:** "Every Breakthrough Matters" campaign language
- **Human-centered:** Patient stories front and center, not corporate jargon
- **Forward-looking:** "Tomorrow" typeface name, progress-oriented messaging
- **Scientific credibility:** Data-backed claims, but presented warmly
- **Conversational:** Not clinical or formal -- approachable for consumers

---

## 11. Dark vs Light Treatment

The site is primarily **light-themed** with strategic dark sections:
- **Dark sections:** Deep navy (`#000067` to `#00003a`) with white text, used for hero areas and emphasis
- **Light sections:** White (`#ffffff`) or ice blue (`#E0F5FF`, `#F2F9FC`) backgrounds with dark text
- **Bright sections:** Electric blue (`#2e29ff`) or bright cyan (`#0095ff`) backgrounds with white text
- **No full dark mode toggle** -- theme is applied per-section

---

## 12. Key Design Evolution Notes

### 2021 Rebrand (Team / Landor & Fitch)
- Removed the pill/oval shape from logo
- Introduced DNA double helix mark
- Two-tone blue palette (light blue + dark blue)
- Noto Sans as brand typeface
- Logo colors: `#0070BF` (French Blue) + `#00AFF0` (Vivid Cerulean)

### Current (2025-2026) Evolution
- **Logo simplified to monochrome** `#0000c9` (a deeper, more saturated pure blue)
- **Custom typeface PfizerDiatype** replaced Noto Sans (Noto Sans remains as fallback)
- **PfizerTomorrow** display face added for headlines
- **Full monospace family** (PfizerDiatypeMono) for data/code contexts
- **Expanded color system** with proper design tokens (10-step blue, cyan, neutral scales)
- **Electric blue `#2e29ff`** introduced as high-energy accent (not in original rebrand)
- **Foundation grid** framework for layout (responsive, not rigid)
- **Variable font support** (`PfizerDiatype-PlusVariable`)

---

## 13. Sources

- [Brand New: New Logo and Identity for Pfizer by Team](https://www.underconsideration.com/brandnew/archives/new_logo_and_identity_for_pfizer_by_team.php)
- [Pfizer - Team Design](https://team.design/work/pfizer/)
- [MCKL Type - Pfizer Custom Typeface](https://www.mckltype.com/custom/pfizer)
- [Pfizer Rebrand on Behance](https://www.behance.net/gallery/123853613/Pfizer-Rebrand)
- [Pfizer Corporate Brand Guidelines 2023 on Scribd](https://www.scribd.com/document/719785941/pfizer-brand-standards)
- [Pfizer Brand Guidelines on Branding Style Guides](https://brandingstyleguides.com/guide/pfizer/)
- [Pfizer Brand Identity Center](https://brandid.pfizer.com/)
- [Pfizer Corporate Identity Site](https://id.pfizer.com/identity-elements-0)
- [Pfizer Color Palette - Design Pieces](https://www.designpieces.com/palette/pfizer-color-palette-hex-and-rgb/)
- [Pfizer Brand Color Codes - BrandColorCode.com](https://www.brandcolorcode.com/pfizer)
- [Pfizer Logo History - DesignYourWay](https://www.designyourway.net/blog/pfizer-logo/)
- [Pfizer Brand Development - Norvell Jefferson](https://www.norvelljefferson.com/cases/pfizer-website-design)
- [Fast Company - Pfizer Logo Redesign](https://www.fastcompany.com/90591119/pfizer-unveils-its-first-major-logo-redesign-in-70-years)
- [Pfizer 2025 Annual Review](https://annualreview.pfizer.com/)
- [Pfizer Brand Guidelines on Internet Archive](https://archive.org/details/pfizer-brand-guidelines)
