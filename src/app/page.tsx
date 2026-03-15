"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { SCROLL_REVEAL, SPRING } from "@/lib/motion-config";

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

const features = [
  {
    title: "BUILD",
    lead: "\u201CCreate an HCP page for Ibrance, UK market, highlight new efficacy data.\u201D",
    body: "That\u2019s the brief. 45 seconds later, two compliant variants. Every component from the approved library. Edit with chat. Deploy in one click.",
    href: "/build",
    icon: (
      <svg aria-hidden="true" className="h-8 w-8" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
      </svg>
    ),
  },
  {
    title: "COMPLY",
    lead: "\u201CCan this page go live?\u201D",
    body: "The compliance gate answers before the page renders \u2014 not after. Brand tokens, pharma regulations, WCAG accessibility. If it doesn\u2019t pass, it doesn\u2019t render.",
    href: "/transparency",
    icon: (
      <svg aria-hidden="true" className="h-8 w-8" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
      </svg>
    ),
  },
  {
    title: "SCAN",
    lead: "\u201CWhich of our 2,000 sites have drifted?\u201D",
    body: "Point at any live URL. The scanner extracts every token and flags what\u2019s changed. One dashboard. Every property. Every drift detected.",
    href: "/scan",
    icon: (
      <svg aria-hidden="true" className="h-8 w-8" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
      </svg>
    ),
  },
] as const;

const steps = [
  {
    number: "1",
    title: "Describe what you need",
    description: "Plain English",
  },
  {
    number: "2",
    title: "AI assembles from approved parts",
    description: "Not generates from scratch",
  },
  {
    number: "3",
    title: "Compliance validates before render",
    description: "Gate, not report",
  },
  {
    number: "4",
    title: "Chat to refine, deploy in seconds",
    description: "Edit with conversation",
  },
] as const;

const differentiators = [
  "Other tools generate, then check. We constrain at generation \u2014 the AI can only compose from approved components.",
  "Compliance isn\u2019t a report you read after. It\u2019s a gate \u2014 pages cannot render until they pass.",
  "Every decision is logged \u2014 who, what, when, why. SHA-256 hash chain. Tamper-proof.",
  "Marketer, QA, Developer \u2014 each sees exactly what they need. Same system, different lens.",
] as const;

// ---------------------------------------------------------------------------
// Animation variants
// ---------------------------------------------------------------------------

const EASE_OUT: [number, number, number, number] = [0.16, 1, 0.3, 1];

const heroVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
};

const heroChildVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE_OUT } },
};

const cardContainerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 48, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.6, ease: EASE_OUT },
  },
};

const iconVariants = {
  hidden: { rotate: -10, scale: 0.8 },
  visible: {
    rotate: 0,
    scale: 1,
    transition: { delay: 0.3, ...SPRING.BOUNCY },
  },
};

const stepsContainerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const numberVariants = {
  hidden: { scale: 0 },
  visible: { scale: 1, transition: { ...SPRING.BOUNCY } },
};

const stepTextVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE_OUT } },
};

const connectorVariants = {
  hidden: { scaleX: 0 },
  visible: { scaleX: 1, transition: { duration: 0.4, ease: EASE_OUT } },
};

const statsContainerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const statItemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE_OUT } },
};

const diffContainerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const diffItemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: EASE_OUT } },
};

const checkmarkVariants = {
  hidden: { pathLength: 0 },
  visible: {
    pathLength: 1,
    transition: { duration: 0.4, ease: EASE_OUT },
  },
};

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col">
      {/* Hero — asymmetric layout */}
      <motion.section
        className="relative flex items-center px-6 pb-16 pt-20 lg:px-16"
        variants={heroVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="flex w-full flex-col gap-12 lg:flex-row lg:items-center lg:gap-16">
          {/* Left — headline */}
          <div className="flex-1">
            <motion.p
              className="mb-4 font-mono text-sm font-semibold uppercase tracking-[0.3em] text-brand-accent"
              variants={heroChildVariants}
            >
              PFIZER CXI+AI CHALLENGE 2026
            </motion.p>

            <h1 className="max-w-2xl font-display text-4xl font-bold tracking-[-0.03em] text-white/[0.93] sm:text-5xl lg:text-6xl">
              <motion.span className="block" variants={heroChildVariants}>
                2,000 websites.
              </motion.span>
              <motion.span className="block" variants={heroChildVariants}>
                One design system.
              </motion.span>
              <motion.span
                className="block text-teal"
                style={{ textShadow: "0 0 30px rgba(0,212,170,0.3)" }}
                variants={heroChildVariants}
              >
                Zero compliance gaps.
              </motion.span>
            </h1>

            <motion.p
              className="mt-6 max-w-xl text-lg leading-8 text-white/55"
              variants={heroChildVariants}
            >
              Every page your AI builds is compliant before it renders — not after.
              The design system isn&apos;t a checklist. It&apos;s the only vocabulary the AI knows.
            </motion.p>

            <motion.div className="mt-8 flex gap-4" variants={heroChildVariants}>
              <Link
                href="/build"
                className="rounded-lg bg-brand-700 px-6 py-2.5 text-sm font-semibold text-white transition hover:shadow-[0_0_20px_rgba(109,40,217,0.4)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
              >
                Start Building →
              </Link>
              <Link
                href="/transparency"
                className="rounded-lg border border-white/[0.08] bg-white/[0.03] px-6 py-2.5 text-sm font-semibold text-white/55 transition hover:border-white/[0.16] hover:text-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
              >
                See How It Works
              </Link>
            </motion.div>
          </div>

          {/* Right — tablet mockup with float */}
          <div className="flex-1" style={{ perspective: "1200px" }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1, y: [0, -8, 0] }}
              transition={{
                opacity: { ...SPRING.GENTLE },
                scale: { ...SPRING.GENTLE },
                y: { duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 },
              }}
            >
              <div className="rounded-[2.5rem] bg-gradient-to-br from-brand-900/60 via-brand-800/40 to-teal/10 p-8 shadow-2xl">
                <Image
                  src="/mockup-preview-scrolled.png"
                  alt="Design Delivery Accelerator — approved pharma components rendered in the design system"
                  width={800}
                  height={500}
                  className="rounded-xl"
                  priority
                />
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Problem Statement — scroll-triggered glass card */}
      <section className="px-6 py-14">
        <motion.div
          className="mx-auto max-w-3xl rounded-2xl border border-white/[0.06] bg-white/[0.03] p-10 text-center backdrop-blur-sm"
          initial={{
            ...SCROLL_REVEAL.initial,
            boxShadow: "0 0 0 rgba(167,139,250,0)",
          }}
          whileInView={{
            ...SCROLL_REVEAL.whileInView,
            boxShadow: [
              "0 0 0 rgba(167,139,250,0)",
              "0 0 20px rgba(167,139,250,0.15)",
              "0 0 0 rgba(167,139,250,0)",
            ],
          }}
          viewport={SCROLL_REVEAL.viewport}
          transition={{
            ...SCROLL_REVEAL.transition,
            boxShadow: { duration: 2, delay: 0.6, ease: "easeInOut" },
          }}
        >
          <h2 className="mb-4 font-display text-xl font-bold uppercase tracking-wider text-brand-accent">
            The Problem
          </h2>
          <blockquote className="mb-4 text-lg italic leading-relaxed text-white/70">
            &ldquo;I&apos;m the go-between — designers and marketers, back and forth, back and forth. It takes ages.&rdquo;
          </blockquote>
          <p className="mb-4 text-sm text-white/40">— Pfizer CXI presenter</p>
          <p className="text-lg leading-relaxed text-white/55">
            A simple page update takes weeks. Dozens of agencies, no central oversight.
            Existing AI tools generate freely then check.
            The brand drifts a little more with every cycle.
          </p>
        </motion.div>
      </section>

      {/* Stats row */}
      <motion.div
        className="mx-auto grid max-w-4xl gap-8 px-6 py-12 text-center sm:grid-cols-4"
        variants={statsContainerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
      >
        {[
          { value: "218", label: "tests passing" },
          { value: "13", label: "compliance rules" },
          { value: "3", label: "AI agents" },
          { value: "45s", label: "generation time" },
        ].map((stat) => (
          <motion.div key={stat.label} variants={statItemVariants}>
            <div className="text-3xl font-bold text-teal">{stat.value}</div>
            <div className="mt-1 text-sm text-white/55">{stat.label}</div>
          </motion.div>
        ))}
      </motion.div>

      {/* Feature cards — stagger reveal */}
      <motion.section
        className="mx-auto grid w-full max-w-5xl gap-6 px-6 py-16 sm:grid-cols-3"
        variants={cardContainerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
      >
        {features.map((f) => (
          <motion.div key={f.title} variants={cardVariants}>
            <Link
              href={f.href}
              className="group flex h-full flex-col rounded-2xl border border-white/[0.06] border-t-white/[0.16] bg-white/[0.03] p-6 backdrop-blur-sm transition hover:-translate-y-1 hover:border-white/[0.12] hover:bg-white/[0.05] hover:shadow-[0_8px_30px_rgba(0,0,0,0.3)]"
            >
              <motion.div
                className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-brand-accent/20 to-teal/20 text-brand-accent transition group-hover:from-brand-accent/30 group-hover:to-teal/30"
                variants={iconVariants}
              >
                {f.icon}
              </motion.div>
              <h3 className="font-display text-lg font-bold text-white/[0.93]">{f.title}</h3>
              <p className="mt-2 text-sm font-medium italic text-white/70">{f.lead}</p>
              <p className="mt-2 text-sm leading-relaxed text-white/55">{f.body}</p>
            </Link>
          </motion.div>
        ))}
      </motion.section>

      {/* How it works — steps with stagger */}
      <section className="border-t border-white/[0.06] px-6 py-16">
        <div className="mx-auto max-w-5xl">
          <motion.h2
            className="mb-10 text-center font-display text-2xl font-bold text-white/[0.93]"
            {...SCROLL_REVEAL}
          >
            How it works
          </motion.h2>
          <motion.div
            className="grid gap-8 sm:grid-cols-4"
            variants={stepsContainerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
          >
            {steps.map((s, i) => (
              <motion.div key={s.number} className="relative text-center" variants={stepTextVariants}>
                <motion.div
                  className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-brand-accent to-brand-700 font-mono text-sm font-bold text-white"
                  variants={numberVariants}
                >
                  {s.number}
                </motion.div>
                <h3 className="font-display text-base font-semibold text-white/[0.93]">
                  {s.title}
                </h3>
                <p className="mt-1 text-sm text-white/55">{s.description}</p>
                {/* Connecting line between steps */}
                {i < steps.length - 1 && (
                  <motion.div
                    className="absolute top-5 hidden h-px w-8 bg-white/[0.08] sm:block"
                    style={{ right: "-16px", transformOrigin: "left" }}
                    variants={connectorVariants}
                  />
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Trust Differentiators — checkmark cascade */}
      <section className="border-t border-white/[0.06] px-6 py-16">
        <div className="mx-auto max-w-3xl">
          <motion.h2
            className="mb-8 text-center font-display text-2xl font-bold text-white/[0.93]"
            {...SCROLL_REVEAL}
          >
            Why this is different
          </motion.h2>
          <motion.ul
            className="space-y-4"
            variants={diffContainerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
          >
            {differentiators.map((d) => (
              <motion.li
                key={d}
                className="flex items-start gap-3 text-white/[0.93]"
                variants={diffItemVariants}
              >
                <svg
                  aria-hidden="true"
                  className="mt-1 h-5 w-5 flex-shrink-0 text-teal"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                >
                  <motion.path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m4.5 12.75 6 6 9-13.5"
                    variants={checkmarkVariants}
                  />
                </svg>
                <span className="text-base leading-relaxed">{d}</span>
              </motion.li>
            ))}
          </motion.ul>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="border-t border-white/[0.06] px-6 py-16">
        <div className="mx-auto max-w-3xl text-center">
          <motion.div {...SCROLL_REVEAL}>
            <h2 className="mb-6 font-display text-2xl font-bold text-white/[0.93]">
              See it in action
            </h2>
            <div className="flex justify-center gap-4">
              <Link
                href="/build"
                className="rounded-lg bg-brand-700 px-6 py-2.5 text-sm font-semibold text-white transition hover:shadow-[0_0_20px_rgba(109,40,217,0.4)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
              >
                Try the Demo →
              </Link>
              <Link
                href="/evidence"
                className="rounded-lg border border-white/[0.08] bg-white/[0.03] px-6 py-2.5 text-sm font-semibold text-white/55 transition hover:border-white/[0.16] hover:text-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
              >
                View Audit Trail
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer note */}
      <section className="border-t border-white/[0.06] px-6 py-8">
        <motion.p
          className="text-center text-sm text-white/35"
          {...SCROLL_REVEAL}
        >
          Built for the Pfizer CXI+AI Challenge 2026 · Group 12
        </motion.p>
      </section>
    </main>
  );
}
