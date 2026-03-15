# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Status

Phase 1 complete. The site has a cinematic, scroll-driven landing page with
Motion animations, rewritten copy across all pages for narrative storytelling,
and a restructured navigation (Build, Scan, Audit Trail, How It Works, Components).

Warm Obsidian design system applied: dark charcoal base (#0C0A12), UX-split
violet palette (saturated #A78BFA for interactive, muted for structural), all
12 pharma components converted to dark-mode glass-morphism. Teal preserved for
status indicators. Token names: `brand-*` (replaces legacy `pfizer-blue-*`).

## Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server (webpack, hot reload) |
| `npm run build` | Production build with type checking (webpack) |
| `npm start` | Serve production build |
| `npm run lint` | ESLint across entire project |
| `npm test` | Run test suite (Vitest) |
| `npm run test:coverage` | Run tests with V8 coverage report |

## Architecture

- Next.js 16 App Router (webpack mode)
- TypeScript strict mode
- Tailwind CSS 3 for UI styling
- Convex for real-time backend state and audit logging
- Vercel AI SDK (multi-provider: Gemini, Claude, OpenRouter)
- Zod for runtime schemas and cross-agent contracts
- Vitest + Testing Library for tests
- Motion (Framer Motion) for animations

## Conventions

- Feature and domain code lives under `src/`
- Shared runtime utilities live in `src/lib/`
- Shared types and schemas live in `src/types/`
- Design system JSON data lives in `src/design-system/`
- Future agent prompts and schemas live in `agents/`
- always calculate "time to do something" in "claude-code" hours instead of human hours. you must look up the latest claude code features to derive the correct estimate.
