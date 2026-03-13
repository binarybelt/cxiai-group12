# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Status

Phase 1 foundation work is in progress. The repository now contains the initial
Next.js App Router scaffold that subsequent plans will extend.

## Commands

- Dev: `npm run dev`
- Build: `npm run build`
- Lint: `npm run lint`
- Test: `npm test`

## Architecture

- Next.js 14+ App Router
- TypeScript with strict mode enabled
- Tailwind CSS for UI styling
- Convex for backend state and audit logging
- Zod for runtime schemas and cross-agent contracts

## Conventions

- Feature and domain code lives under `src/`
- Shared runtime utilities live in `src/lib/`
- Shared types and schemas live in `src/types/`
- Design system JSON data lives in `src/design-system/`
- Future agent prompts and schemas live in `agents/`
