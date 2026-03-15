/**
 * Motion design tokens — spring presets, easing curves, and timing constants.
 * Currently consumed by MotionProvider. Individual constants available for
 * component-level animations.
 */
export const SPRING = {
  SNAPPY: { type: "spring" as const, stiffness: 500, damping: 30, mass: 1 },
  SMOOTH: { type: "spring" as const, stiffness: 300, damping: 30, mass: 1 },
  GENTLE: { type: "spring" as const, stiffness: 200, damping: 25, mass: 1 },
  BOUNCY: { type: "spring" as const, stiffness: 400, damping: 15, mass: 1 },
} as const;

export const EASE = {
  out: [0.16, 1, 0.3, 1] as const,
  inOut: [0.4, 0, 0.2, 1] as const,
  bounce: [0.34, 1.56, 0.64, 1] as const,
} as const;

export const STAGGER = {
  DEFAULT: 0.08, // 80ms between siblings
  FAST: 0.04,
  SLOW: 0.12,
} as const;

export const DURATION = {
  fast: 0.15,
  normal: 0.3,
  slow: 0.6,
  gauge: 2,
} as const;

/** Standard scroll-reveal animation props */
export const SCROLL_REVEAL = {
  initial: { opacity: 0, y: 32, filter: "blur(4px)" },
  whileInView: { opacity: 1, y: 0, filter: "blur(0px)" },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
} as const;
