# Motion Design System -- Cinematic Enterprise Pharma Tool

Stack: Next.js 16 + React 19 + Tailwind + `motion` (framer-motion successor)

Install: `npm install motion`

---

## 0. FOUNDATION: Reduced Motion + Shared Config

Every pattern below must respect `prefers-reduced-motion`. Set this once at the app root.

### Global MotionConfig (layout.tsx wrapper)

```tsx
// src/components/motion-provider.tsx
"use client";

import { MotionConfig } from "motion/react";

export function MotionProvider({ children }: { children: React.ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      {children}
    </MotionConfig>
  );
}
```

With `reducedMotion="user"`, Motion automatically disables transform and layout
animations for users who have "Reduce Motion" enabled in their OS settings.
Opacity and color animations are preserved -- they don't cause motion sickness.

### Custom hook for CSS-only animations

```tsx
// src/lib/use-reduced-motion.ts
"use client";

import { useEffect, useState } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

export function useReducedMotion(): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(QUERY);
    setMatches(mql.matches);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  return matches;
}
```

### CSS fallback for all keyframe animations

```css
/* globals.css -- add at the top */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Spring Presets (shared constants)

```tsx
// src/lib/motion-config.ts

// Snappy -- buttons, tabs, small interactive elements
export const SPRING_SNAPPY = { type: "spring", stiffness: 500, damping: 30 } as const;

// Smooth -- cards entering, panels sliding
export const SPRING_SMOOTH = { type: "spring", stiffness: 300, damping: 30 } as const;

// Gentle -- large layout shifts, page-level transitions
export const SPRING_GENTLE = { type: "spring", stiffness: 200, damping: 25 } as const;

// Bouncy -- success celebrations, attention-getting
export const SPRING_BOUNCY = { type: "spring", stiffness: 400, damping: 15 } as const;

// For non-spring animations (opacity, color)
export const EASE_OUT = { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] } as const;
export const EASE_IN_OUT = { duration: 0.3, ease: [0.4, 0, 0.2, 1] } as const;

// Stagger timing for lists
export const STAGGER_FAST = 0.05;  // 50ms between children
export const STAGGER_DEFAULT = 0.08; // 80ms
export const STAGGER_SLOW = 0.12;  // 120ms -- for dramatic reveals
```

---

## 1. SCROLL-TRIGGERED ANIMATIONS (Apple-style)

### 1A. Feature Cards Staggering In On Scroll

**Where to use:** Landing page feature grid, pipeline step cards in BuildUI.

```tsx
// src/components/motion/scroll-stagger-list.tsx
"use client";

import { motion, stagger, useInView } from "motion/react";
import { useRef } from "react";
import { SPRING_SMOOTH, STAGGER_DEFAULT } from "@/lib/motion-config";

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: STAGGER_DEFAULT,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      ...SPRING_SMOOTH,
      opacity: { duration: 0.4 },
      filter: { duration: 0.4 },
    },
  },
};

interface ScrollStaggerListProps {
  children: React.ReactNode[];
  className?: string;
}

export function ScrollStaggerList({ children, className }: ScrollStaggerListProps) {
  return (
    <motion.div
      className={className}
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
    >
      {children.map((child, i) => (
        <motion.div key={i} variants={itemVariants}>
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}
```

**Usage in the pipeline:**
```tsx
<ScrollStaggerList className="grid grid-cols-3 gap-6">
  <FeatureCard title="Interpret Brief" />
  <FeatureCard title="Generate Page" />
  <FeatureCard title="Compliance Check" />
</ScrollStaggerList>
```

### 1B. Compliance Gauge Filling On Scroll

**Where to use:** `ComplianceSidebar` -- the ScoreBar component. The bar fills up as it scrolls into view.

```tsx
// src/components/motion/animated-score-bar.tsx
"use client";

import { motion, useInView } from "motion/react";
import { useRef } from "react";

interface AnimatedScoreBarProps {
  label: string;
  value: number; // 0-100
}

export function AnimatedScoreBar({ label, value }: AnimatedScoreBarProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });

  const color =
    value >= 80 ? "bg-green-500" : value >= 50 ? "bg-yellow-400" : "bg-red-500";

  return (
    <div ref={ref} className="flex flex-col gap-1">
      <div className="flex justify-between text-xs text-zinc-400">
        <span>{label}</span>
        <motion.span
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.6, duration: 0.3 }}
        >
          {value}%
        </motion.span>
      </div>
      <div className="h-2 w-full rounded-full bg-zinc-800 overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${color}`}
          initial={{ width: 0 }}
          animate={isInView ? { width: `${value}%` } : {}}
          transition={{
            duration: 1.2,
            ease: [0.25, 0.46, 0.45, 0.94],
            delay: 0.2,
          }}
        />
      </div>
    </div>
  );
}
```

### 1C. Text Lines Revealing Word-by-Word

**Where to use:** Hero section headlines, interpretation summary reveal.

```tsx
// src/components/motion/text-reveal.tsx
"use client";

import { motion } from "motion/react";
import { STAGGER_FAST } from "@/lib/motion-config";

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: STAGGER_FAST,
    },
  },
};

const wordVariants = {
  hidden: { opacity: 0, y: 12, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

interface TextRevealProps {
  text: string;
  className?: string;
  as?: "h1" | "h2" | "h3" | "p";
}

export function TextReveal({ text, className, as: Tag = "p" }: TextRevealProps) {
  const words = text.split(" ");

  return (
    <Tag className={className}>
      <motion.span
        className="inline"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.5 }}
      >
        {words.map((word, i) => (
          <motion.span
            key={i}
            variants={wordVariants}
            className="inline-block mr-[0.25em]"
          >
            {word}
          </motion.span>
        ))}
      </motion.span>
    </Tag>
  );
}
```

### 1D. Parallax Depth Between Background and Content

**Where to use:** Landing page hero section, background glow layers.

```tsx
// src/components/motion/parallax-section.tsx
"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";

interface ParallaxSectionProps {
  children: React.ReactNode;
  backgroundContent?: React.ReactNode;
  /** Speed factor: 0 = fixed, 0.5 = half scroll speed, 1 = normal */
  speed?: number;
  className?: string;
}

export function ParallaxSection({
  children,
  backgroundContent,
  speed = 0.5,
  className,
}: ParallaxSectionProps) {
  const ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  // Background moves slower than scroll -- creates depth
  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", `${speed * 100}%`]);

  // Foreground gets subtle counter-movement
  const foregroundY = useTransform(scrollYProgress, [0, 1], ["0%", `${(1 - speed) * 20}%`]);

  return (
    <div ref={ref} className={`relative overflow-hidden ${className ?? ""}`}>
      {backgroundContent && (
        <motion.div
          className="absolute inset-0 -z-10"
          style={{ y: backgroundY }}
        >
          {backgroundContent}
        </motion.div>
      )}
      <motion.div style={{ y: foregroundY }}>
        {children}
      </motion.div>
    </div>
  );
}
```

### 1E. Scroll Progress Indicator

**Where to use:** Top of the BuildUI page to show pipeline progress through the workflow.

```tsx
// src/components/motion/scroll-progress.tsx
"use client";

import { motion, useScroll } from "motion/react";

export function ScrollProgress() {
  const { scrollYProgress } = useScroll();

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-[2px] bg-blue-500 origin-left z-50"
      style={{ scaleX: scrollYProgress }}
    />
  );
}
```

### 1F. CSS `animation-timeline: scroll()` -- Browser Support Status (March 2026)

**Status:** Supported in Chrome 115+, Edge 115+, Opera 101+, Safari 18+.
Firefox has partial support behind a flag. Global support is approximately 85%.

**Recommendation:** Use `motion` library's `useScroll` for production. The JS-based
approach has 100% browser coverage and Motion automatically promotes to native
ScrollTimeline where supported, giving you hardware acceleration for free.

For non-critical decorative effects, progressive enhancement with CSS:

```css
/* Only apply when supported -- graceful no-op in Firefox */
@supports (animation-timeline: scroll()) {
  .scroll-fade-in {
    animation: fade-in linear both;
    animation-timeline: view();
    animation-range: entry 0% entry 100%;
  }

  @keyframes fade-in {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
}
```

---

## 2. PAGE LOAD / ENTRANCE CHOREOGRAPHY

The key to Apple-style entrance: **nothing moves simultaneously.** Every element
has a deliberate delay creating a cascade from most important to least.

### 2A. Hero Entrance Sequence

**Where to use:** Landing page hero, initial BuildUI load.

```tsx
// src/components/motion/hero-entrance.tsx
"use client";

import { motion } from "motion/react";
import { SPRING_GENTLE, EASE_OUT } from "@/lib/motion-config";

// Choreography: badge -> headline -> description -> CTA -> secondary elements
// Each layer has increasing delay, creating a waterfall effect

export function HeroEntrance() {
  return (
    <div className="flex flex-col items-center gap-6 pt-24">
      {/* Layer 1: Badge -- fast fade, appears first */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-sm border border-blue-500/20"
      >
        Pfizer Compliance Platform
      </motion.div>

      {/* Layer 2: Headline -- arrives 150ms after badge */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, ...SPRING_GENTLE }}
        className="text-5xl font-bold text-white text-center tracking-tight"
      >
        Design Delivery Accelerator
      </motion.h1>

      {/* Layer 3: Description -- 300ms delay, gentler motion */}
      <motion.p
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, ...EASE_OUT }}
        className="text-lg text-zinc-400 text-center max-w-xl"
      >
        Generate compliant pharma web pages in seconds.
      </motion.p>

      {/* Layer 4: CTA button -- 450ms, slightly springy */}
      <motion.button
        initial={{ opacity: 0, y: 10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: 0.45, type: "spring", stiffness: 400, damping: 25 }}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium"
      >
        Start Building
      </motion.button>

      {/* Layer 5: Background glow -- last, slowest, most subtle */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 1.5 }}
        className="absolute inset-0 -z-10"
      >
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-blue-500/5 rounded-full blur-[120px]" />
      </motion.div>
    </div>
  );
}
```

### 2B. Dashboard Panel Stagger Entrance

**Where to use:** When BuildUI transitions from "idle" to "done" -- panels appear sequentially.

```tsx
// src/components/motion/panel-entrance.tsx
"use client";

import { motion } from "motion/react";
import { SPRING_SMOOTH, STAGGER_DEFAULT } from "@/lib/motion-config";

const panelContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: STAGGER_DEFAULT,
      delayChildren: 0.1,
    },
  },
};

const panelItem = {
  hidden: { opacity: 0, y: 20, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      ...SPRING_SMOOTH,
      opacity: { duration: 0.4 },
    },
  },
};

interface PanelEntranceProps {
  children: React.ReactNode[];
  className?: string;
}

export function PanelEntrance({ children, className }: PanelEntranceProps) {
  return (
    <motion.div
      className={className}
      variants={panelContainer}
      initial="hidden"
      animate="visible"
    >
      {children.map((child, i) => (
        <motion.div key={i} variants={panelItem}>
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}
```

---

## 3. MICRO-INTERACTIONS FOR THE COMPLIANCE TOOL

### 3A. Button Press Physics

**Where to use:** Every clickable button in the tool.

```tsx
// src/components/motion/press-button.tsx
"use client";

import { motion, type HTMLMotionProps } from "motion/react";
import { SPRING_SNAPPY } from "@/lib/motion-config";

type PressButtonProps = HTMLMotionProps<"button"> & {
  children: React.ReactNode;
};

export function PressButton({ children, className, ...props }: PressButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      transition={SPRING_SNAPPY}
      className={className}
      {...props}
    >
      {children}
    </motion.button>
  );
}
```

### 3B. Tab/Role Switching with layoutId Morphing Indicator

**Where to use:** The role toggle (Marketer / QA / Developer) in BuildUI.

```tsx
// src/components/motion/role-tabs.tsx
"use client";

import { motion, LayoutGroup } from "motion/react";
import { SPRING_SNAPPY } from "@/lib/motion-config";

interface RoleTabsProps {
  roles: { key: string; label: string }[];
  activeRole: string;
  onRoleChange: (role: string) => void;
}

export function RoleTabs({ roles, activeRole, onRoleChange }: RoleTabsProps) {
  return (
    <LayoutGroup>
      <div className="flex gap-1 p-1 bg-zinc-900 rounded-lg">
        {roles.map((role) => (
          <button
            key={role.key}
            onClick={() => onRoleChange(role.key)}
            className="relative px-4 py-2 text-sm font-medium rounded-md transition-colors"
          >
            {/* Animated background pill -- morphs between tabs */}
            {activeRole === role.key && (
              <motion.div
                layoutId="role-indicator"
                className="absolute inset-0 bg-zinc-700 rounded-md"
                transition={SPRING_SNAPPY}
              />
            )}
            <span className={`relative z-10 ${
              activeRole === role.key ? "text-white" : "text-zinc-400"
            }`}>
              {role.label}
            </span>
          </button>
        ))}
      </div>
    </LayoutGroup>
  );
}
```

### 3C. Score Gauge Animating When Value Changes

**Where to use:** Overall compliance score in ComplianceSidebar.

```tsx
// src/components/motion/animated-gauge.tsx
"use client";

import { motion, useSpring, useTransform } from "motion/react";
import { useEffect } from "react";

interface AnimatedGaugeProps {
  value: number; // 0-100
  size?: number;
}

export function AnimatedGauge({ value, size = 120 }: AnimatedGaugeProps) {
  const springValue = useSpring(0, { stiffness: 100, damping: 20 });

  useEffect(() => {
    springValue.set(value);
  }, [value, springValue]);

  const displayValue = useTransform(springValue, (v) => Math.round(v));

  // SVG arc calculation
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = useTransform(
    springValue,
    [0, 100],
    [circumference, 0]
  );

  const color = value >= 80 ? "#22c55e" : value >= 50 ? "#facc15" : "#ef4444";

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#27272a"
          strokeWidth={4}
        />
        {/* Animated fill */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={4}
          strokeLinecap="round"
          strokeDasharray={circumference}
          style={{ strokeDashoffset }}
        />
      </svg>
      {/* Center number */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.span className="text-2xl font-bold text-white">
          {displayValue}
        </motion.span>
      </div>
    </div>
  );
}
```

### 3D. Pipeline Steps Lighting Up Progressively

**Where to use:** Pipeline phase indicator in BuildUI (idle -> interpreting -> generating -> done).

```tsx
// src/components/motion/pipeline-steps.tsx
"use client";

import { motion } from "motion/react";

type Phase = "idle" | "interpreting" | "generating" | "done" | "error";

const STEPS = [
  { key: "interpreting", label: "Interpret" },
  { key: "generating", label: "Generate" },
  { key: "done", label: "Complete" },
] as const;

const PHASE_ORDER: Record<string, number> = {
  idle: -1,
  interpreting: 0,
  generating: 1,
  done: 2,
  error: -1,
};

export function PipelineSteps({ phase }: { phase: Phase }) {
  const activeIndex = PHASE_ORDER[phase];

  return (
    <div className="flex items-center gap-2">
      {STEPS.map((step, i) => {
        const isActive = i <= activeIndex;
        const isCurrent = i === activeIndex;

        return (
          <div key={step.key} className="flex items-center gap-2">
            {/* Step dot */}
            <motion.div
              className="relative w-3 h-3 rounded-full"
              animate={{
                backgroundColor: isActive ? "#3b82f6" : "#3f3f46",
                scale: isCurrent ? 1 : 1,
              }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            >
              {/* Pulse ring on current step */}
              {isCurrent && (
                <motion.div
                  className="absolute inset-0 rounded-full bg-blue-500"
                  animate={{ scale: [1, 2], opacity: [0.5, 0] }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeOut",
                  }}
                />
              )}
            </motion.div>

            {/* Connector line */}
            {i < STEPS.length - 1 && (
              <motion.div
                className="h-[2px] w-8"
                animate={{
                  backgroundColor: i < activeIndex ? "#3b82f6" : "#3f3f46",
                }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
```

### 3E. Chat Messages Sliding In

**Where to use:** ChatPanel -- messages appear from the appropriate side.

```tsx
// src/components/motion/chat-message.tsx
"use client";

import { motion } from "motion/react";
import { SPRING_SMOOTH } from "@/lib/motion-config";

interface AnimatedChatMessageProps {
  role: "user" | "assistant";
  content: string;
}

export function AnimatedChatMessage({ role, content }: AnimatedChatMessageProps) {
  const isUser = role === "user";

  return (
    <motion.div
      initial={{
        opacity: 0,
        x: isUser ? 20 : -20,
        y: 10,
      }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{
        ...SPRING_SMOOTH,
        opacity: { duration: 0.3 },
      }}
      className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm ${
        isUser
          ? "ml-auto bg-blue-600 text-white rounded-br-md"
          : "mr-auto bg-zinc-800 text-zinc-100 rounded-bl-md"
      }`}
    >
      {content}
    </motion.div>
  );
}
```

### 3F. Compliance Violation Appearing with Urgency

**Where to use:** ComplianceSidebar when violations are detected.

```tsx
// src/components/motion/violation-alert.tsx
"use client";

import { motion } from "motion/react";

interface ViolationAlertProps {
  severity: "critical" | "warning" | "info";
  message: string;
  index: number;
}

export function ViolationAlert({ severity, message, index }: ViolationAlertProps) {
  const borderColor = {
    critical: "border-red-500/50 bg-red-500/5",
    warning: "border-yellow-500/50 bg-yellow-500/5",
    info: "border-blue-500/50 bg-blue-500/5",
  }[severity];

  return (
    <motion.div
      initial={{ opacity: 0, x: -10, height: 0, marginBottom: 0 }}
      animate={{ opacity: 1, x: 0, height: "auto", marginBottom: 8 }}
      transition={{
        delay: index * 0.08,
        type: "spring",
        stiffness: 500,
        damping: 30,
        opacity: { duration: 0.2, delay: index * 0.08 },
        height: { duration: 0.3, delay: index * 0.08 },
      }}
      className={`border-l-2 px-3 py-2 rounded-r-md text-sm ${borderColor}`}
    >
      {/* Severity icon pulses once for critical */}
      {severity === "critical" && (
        <motion.span
          initial={{ scale: 1.3 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 600, damping: 15 }}
          className="inline-block mr-2"
        >
          !!
        </motion.span>
      )}
      <span className="text-zinc-300">{message}</span>
    </motion.div>
  );
}
```

### 3G. Success/Deploy Celebration (Subtle)

**Where to use:** DeployPanel on successful deploy. No confetti -- just a satisfying glow + check.

```tsx
// src/components/motion/success-indicator.tsx
"use client";

import { motion } from "motion/react";
import { SPRING_BOUNCY } from "@/lib/motion-config";

export function SuccessIndicator() {
  return (
    <div className="relative flex items-center justify-center w-16 h-16">
      {/* Expanding glow ring */}
      <motion.div
        className="absolute inset-0 rounded-full bg-green-500/20"
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1.5, opacity: 0 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
      />

      {/* Solid circle */}
      <motion.div
        className="w-12 h-12 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={SPRING_BOUNCY}
      >
        {/* Checkmark SVG draws in */}
        <motion.svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          className="text-green-400"
        >
          <motion.path
            d="M5 13l4 4L19 7"
            stroke="currentColor"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ delay: 0.3, duration: 0.4, ease: "easeOut" }}
          />
        </motion.svg>
      </motion.div>
    </div>
  );
}
```

---

## 4. HOVER AND INTERACTIVE MOTION

### 4A. Card That Tilts Toward Cursor (3D Perspective)

**Where to use:** Feature cards on landing page, example brief cards, variant preview cards.

```tsx
// src/components/motion/tilt-card.tsx
"use client";

import { useRef, type ReactNode } from "react";
import { useReducedMotion } from "@/lib/use-reduced-motion";

interface TiltCardProps {
  children: ReactNode;
  className?: string;
  /** Max rotation in degrees. Default 8. */
  maxTilt?: number;
}

export function TiltCard({ children, className, maxTilt = 8 }: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (reducedMotion || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const xPct = x / rect.width;
    const yPct = y / rect.height;
    const rotateX = (0.5 - yPct) * maxTilt;
    const rotateY = (xPct - 0.5) * maxTilt;

    ref.current.style.transform =
      `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
  }

  function handleMouseLeave() {
    if (!ref.current) return;
    ref.current.style.transform =
      "perspective(800px) rotateX(0deg) rotateY(0deg) scale(1)";
  }

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`transition-transform duration-200 ease-out ${className ?? ""}`}
    >
      {children}
    </div>
  );
}
```

### 4B. Glow Effect That Follows Mouse Position

**Where to use:** Main dashboard cards, the interpretation panel, preview cards.

```tsx
// src/components/motion/glow-card.tsx
"use client";

import { useRef, type ReactNode } from "react";
import { useReducedMotion } from "@/lib/use-reduced-motion";

interface GlowCardProps {
  children: ReactNode;
  className?: string;
  /** Glow color. Default: "rgba(59, 130, 246, 0.15)" (blue-500 at 15%) */
  glowColor?: string;
}

export function GlowCard({
  children,
  className,
  glowColor = "rgba(59, 130, 246, 0.15)",
}: GlowCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (reducedMotion || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    ref.current.style.setProperty("--glow-x", `${x}px`);
    ref.current.style.setProperty("--glow-y", `${y}px`);
  }

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      className={`relative overflow-hidden ${className ?? ""}`}
    >
      {/* Radial glow that follows cursor */}
      <div
        className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: `radial-gradient(400px circle at var(--glow-x, 50%) var(--glow-y, 50%), ${glowColor}, transparent 70%)`,
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
```

**Usage:**
```tsx
<GlowCard className="group p-6 bg-zinc-900 rounded-xl border border-zinc-800">
  <h3>Compliance Score</h3>
  <p>92/100</p>
</GlowCard>
```

### 4C. Buttons That "Breathe" with Subtle Scale

**Where to use:** Primary CTA when idle, deploy button when ready.

```css
/* globals.css */
@keyframes breathe {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.015); }
}

.btn-breathe {
  animation: breathe 3s ease-in-out infinite;
}

.btn-breathe:hover {
  animation: none;
}
```

### 4D. Glass Panel with Parallax on Mouse Move

**Where to use:** Interpretation panel backdrop, modal overlays.

```tsx
// src/components/motion/glass-parallax.tsx
"use client";

import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { useEffect } from "react";
import { useReducedMotion } from "@/lib/use-reduced-motion";

interface GlassParallaxProps {
  children: React.ReactNode;
  className?: string;
}

export function GlassParallax({ children, className }: GlassParallaxProps) {
  const reducedMotion = useReducedMotion();
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springX = useSpring(mouseX, { stiffness: 150, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 150, damping: 20 });

  // Map mouse position to subtle parallax offset (max 10px)
  const bgX = useTransform(springX, [0, window?.innerWidth ?? 1920], [-10, 10]);
  const bgY = useTransform(springY, [0, window?.innerHeight ?? 1080], [-10, 10]);

  useEffect(() => {
    if (reducedMotion) return;
    const handler = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };
    window.addEventListener("mousemove", handler);
    return () => window.removeEventListener("mousemove", handler);
  }, [mouseX, mouseY, reducedMotion]);

  return (
    <div className={`relative ${className ?? ""}`}>
      {/* Parallax background layer */}
      <motion.div
        className="absolute inset-0 -z-10 bg-zinc-900/60 backdrop-blur-xl rounded-xl border border-zinc-700/50"
        style={reducedMotion ? {} : { x: bgX, y: bgY }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
```

---

## 5. TRANSITIONS BETWEEN STATES

### 5A. Brief -> Interpretation (Content Revealing)

**Where to use:** When phase transitions from "interpreting" to showing interpretation.

```tsx
// Usage pattern inside BuildUI
import { AnimatePresence, motion } from "motion/react";

{/* Wrap in AnimatePresence for exit animations */}
<AnimatePresence mode="wait">
  {phase === "interpreting" && (
    <motion.div
      key="interpreting"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
    >
      <SkeletonPulse lines={4} />
    </motion.div>
  )}

  {interpretation && showInterpretation && (
    <motion.div
      key="interpretation"
      initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 30,
        opacity: { duration: 0.4 },
        filter: { duration: 0.5 },
      }}
    >
      {/* Interpretation content */}
    </motion.div>
  )}
</AnimatePresence>
```

### 5B. Generating State (Skeleton + Progress)

**Where to use:** While page is being generated.

```tsx
// src/components/motion/generating-skeleton.tsx
"use client";

import { motion } from "motion/react";

export function GeneratingSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-4 p-6"
    >
      {/* Animated progress text */}
      <motion.div
        className="flex items-center gap-3"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <motion.div
          className="w-4 h-4 rounded-full bg-blue-500"
          animate={{ scale: [1, 1.3, 1], opacity: [1, 0.5, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
        <span className="text-sm text-zinc-400">Generating compliant page...</span>
      </motion.div>

      {/* Skeleton blocks that shimmer */}
      {[1, 0.7, 0.85, 0.6].map((width, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 + i * 0.1 }}
          className="skeleton-shimmer h-4 rounded"
          style={{ width: `${width * 100}%` }}
        />
      ))}
    </motion.div>
  );
}
```

### 5C. Compliance Check (Gauge Filling, Checks Appearing One by One)

**Where to use:** After generation completes, compliance results animate in.

```tsx
// Usage pattern
<AnimatePresence>
  {violations && (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-2"
    >
      {violations.map((v, i) => (
        <ViolationAlert
          key={v.id ?? i}
          severity={v.severity}
          message={v.message}
          index={i}
        />
      ))}
    </motion.div>
  )}
</AnimatePresence>
```

### 5D. Preview Materializing

**Where to use:** When the PageRenderer shows the generated page.

```tsx
// Wrap PageRenderer
<motion.div
  key={currentSpec?.title ?? "preview"}
  initial={{ opacity: 0, scale: 0.98, y: 10 }}
  animate={{ opacity: 1, scale: 1, y: 0 }}
  transition={{
    type: "spring",
    stiffness: 200,
    damping: 25,
    opacity: { duration: 0.5 },
  }}
>
  <PageRenderer spec={currentSpec} />
</motion.div>
```

### 5E. Error/Violation Shake

**Where to use:** When a compliance gate blocks generation.

```tsx
// src/components/motion/shake.tsx
"use client";

import { motion, useAnimation } from "motion/react";
import { useEffect, type ReactNode } from "react";

interface ShakeProps {
  trigger: boolean;
  children: ReactNode;
  className?: string;
}

export function Shake({ trigger, children, className }: ShakeProps) {
  const controls = useAnimation();

  useEffect(() => {
    if (trigger) {
      controls.start({
        x: [0, -6, 6, -4, 4, -2, 2, 0],
        transition: { duration: 0.5 },
      });
    }
  }, [trigger, controls]);

  return (
    <motion.div animate={controls} className={className}>
      {children}
    </motion.div>
  );
}
```

**Usage:**
```tsx
<Shake trigger={!!gateViolations}>
  <GenerateButton />
</Shake>
```

---

## 6. CSS-ONLY MOTION (no JS needed)

All of these go in `globals.css`. They work without the `motion` library.

### 6A. Background Glow Drift

**Where to use:** Behind the hero section, behind the main workspace.

```css
@keyframes glow-drift {
  0% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(30px, -20px) scale(1.05); }
  66% { transform: translate(-20px, 15px) scale(0.95); }
  100% { transform: translate(0, 0) scale(1); }
}

.bg-glow {
  position: absolute;
  width: 600px;
  height: 400px;
  border-radius: 50%;
  filter: blur(120px);
  animation: glow-drift 20s ease-in-out infinite;
  pointer-events: none;
}

.bg-glow--blue {
  background: rgba(59, 130, 246, 0.08);
}

.bg-glow--purple {
  background: rgba(147, 51, 234, 0.06);
  animation-delay: -7s;
  animation-duration: 25s;
}
```

**Usage:**
```tsx
<div className="relative overflow-hidden">
  <div className="bg-glow bg-glow--blue top-1/4 left-1/3" />
  <div className="bg-glow bg-glow--purple bottom-1/4 right-1/4" />
  {/* Content */}
</div>
```

### 6B. Skeleton Shimmer

```css
@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.skeleton-shimmer {
  position: relative;
  overflow: hidden;
  background: #27272a; /* zinc-800 */
}

.skeleton-shimmer::after {
  content: "";
  position: absolute;
  inset: 0;
  transform: translateX(-100%);
  background: linear-gradient(
    100deg,
    transparent 30%,
    rgba(255, 255, 255, 0.04) 50%,
    transparent 70%
  );
  animation: shimmer 1.8s ease-in-out infinite;
}
```

### 6C. Typing Indicator Dots

**Where to use:** ChatPanel when assistant is "thinking."

```css
@keyframes typing-dot {
  0%, 60%, 100% { transform: translateY(0); opacity: 0.3; }
  30% { transform: translateY(-4px); opacity: 1; }
}

.typing-dots {
  display: flex;
  gap: 4px;
  align-items: center;
  padding: 12px 16px;
}

.typing-dots span {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #71717a; /* zinc-500 */
  animation: typing-dot 1.4s ease-in-out infinite;
}

.typing-dots span:nth-child(2) { animation-delay: 0.15s; }
.typing-dots span:nth-child(3) { animation-delay: 0.3s; }
```

**Usage:**
```tsx
<div className="typing-dots">
  <span /><span /><span />
</div>
```

### 6D. Pipeline Dot Pulse

```css
@keyframes dot-pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4); }
  50% { box-shadow: 0 0 0 8px rgba(59, 130, 246, 0); }
}

.pipeline-dot--active {
  background: #3b82f6;
  animation: dot-pulse 2s ease-in-out infinite;
}
```

### 6E. Score Bar Fill Transition

For cases where you want CSS-only score bars (no `motion` dependency).

```css
.score-bar-fill {
  height: 100%;
  border-radius: 9999px;
  transition: width 1s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

/* Trigger: set width via inline style or data attribute */
```

### 6F. Subtle Floating/Breathing on Idle Elements

**Where to use:** Badges, status indicators, empty state illustrations.

```css
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
}

.float-idle {
  animation: float 4s ease-in-out infinite;
}

/* Slower variant for background elements */
.float-idle--slow {
  animation: float 6s ease-in-out infinite;
}
```

---

## 7. PAGE TRANSITIONS (Next.js App Router Caveat)

AnimatePresence-based route transitions do NOT work reliably with Next.js App
Router as of Next.js 16. The App Router's streaming and suspense model unmounts
components before exit animations can run.

### Recommended approach: template.tsx wrapper

```tsx
// src/app/template.tsx
"use client";

import { motion } from "motion/react";

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      {children}
    </motion.div>
  );
}
```

This gives entrance animations on every route change. Exit animations require the
FrozenRouter workaround (fragile, not recommended for production).

**Better alternative for this tool:** Since the app is primarily a single-page
dashboard (BuildUI), use `AnimatePresence mode="wait"` to transition between
pipeline phases (idle/interpreting/generating/done) within the same route. This
works perfectly and is more impactful than route transitions.

---

## 8. IMPLEMENTATION CHECKLIST

Priority order for maximum visual impact with minimum code:

1. **Spring presets + MotionProvider** -- `src/lib/motion-config.ts` + `src/components/motion-provider.tsx`
2. **CSS-only animations** -- background glow, skeleton shimmer, typing dots, dot pulse (globals.css)
3. **Hero entrance choreography** -- landing page first impression
4. **Role tabs with layoutId** -- instant premium feel on a common interaction
5. **Score gauge animation** -- the compliance score is the centerpiece
6. **Scroll-triggered card stagger** -- landing page and feature sections
7. **Chat messages sliding in** -- every interaction feels intentional
8. **Violation alerts with urgency** -- severity drives the motion intensity
9. **Tilt cards + glow-follows-cursor** -- hover interactivity on cards
10. **Pipeline steps lighting up** -- progress visualization
11. **Text reveal** -- hero headlines
12. **Success indicator** -- deploy celebration

---

## Sources

- [Motion for React -- Scroll Animations](https://motion.dev/docs/react-scroll-animations)
- [Motion -- useScroll](https://motion.dev/docs/react-use-scroll)
- [Motion -- useTransform](https://motion.dev/docs/react-use-transform)
- [Motion -- Spring Animation](https://motion.dev/docs/spring)
- [Motion -- Stagger](https://motion.dev/docs/stagger)
- [Motion -- React Accessibility](https://motion.dev/docs/react-accessibility)
- [Motion -- useReducedMotion](https://motion.dev/docs/react-use-reduced-motion)
- [Motion -- Hover Animation](https://motion.dev/docs/react-hover-animation)
- [Motion -- Layout Animations](https://motion.dev/docs/react-layout-group)
- [CSS-Tricks -- Apple Product Page Scroll Animations](https://css-tricks.com/lets-make-one-of-those-fancy-scrolling-animations-used-on-apple-product-pages/)
- [Maxime Heckel -- Advanced Framer Motion Patterns](https://blog.maximeheckel.com/posts/advanced-animation-patterns-with-framer-motion/)
- [Maxime Heckel -- Layout Animations Deep Dive](https://blog.maximeheckel.com/posts/framer-motion-layout-animations/)
- [Frontend.fyi -- CSS 3D Perspective Animations](https://www.frontend.fyi/tutorials/css-3d-perspective-animations)
- [Josh Comeau -- Accessible Animations with prefers-reduced-motion](https://www.joshwcomeau.com/react/prefers-reduced-motion/)
- [MDN -- CSS Scroll-Driven Animations](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Scroll-driven_animations)
- [Can I Use -- CSS Scroll Timeline](https://caniuse.com/css-scroll-timeline)
- [Builder.io -- Apple-style Scroll with CSS view-timeline](https://www.builder.io/blog/view-timeline)
- [Next.js App Router Page Transitions Discussion](https://github.com/vercel/next.js/discussions/42658)
