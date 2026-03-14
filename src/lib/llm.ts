/**
 * LLM provider resolver.
 *
 * Reads `LLM_PROVIDER` env var to select the active provider.
 * Each route calls `getLLM()` instead of importing a provider directly.
 *
 * Supported providers:
 *   - "google"    → Gemini 2.5 Flash (free tier, default)
 *   - "anthropic" → Claude Sonnet 4.5
 *   - "openrouter" → any model via OPENROUTER_MODEL env var
 *
 * Required env vars per provider:
 *   google:      GOOGLE_GENERATIVE_AI_API_KEY
 *   anthropic:   ANTHROPIC_API_KEY
 *   openrouter:  OPENROUTER_API_KEY (+ optional OPENROUTER_MODEL)
 */
import type { LanguageModel } from "ai";

type Provider = "google" | "anthropic" | "openrouter";

const PROVIDER_DEFAULTS: Record<Provider, string> = {
  google: "gemini-2.5-flash",
  anthropic: "claude-sonnet-4-5-20250414",
  openrouter: "google/gemini-2.5-flash",
};

const ENV_KEYS: Record<Provider, string> = {
  google: "GOOGLE_GENERATIVE_AI_API_KEY",
  anthropic: "ANTHROPIC_API_KEY",
  openrouter: "OPENROUTER_API_KEY",
};

function resolveProvider(): Provider {
  const raw = (process.env.LLM_PROVIDER ?? "google").toLowerCase();
  if (raw === "google" || raw === "anthropic" || raw === "openrouter") {
    return raw;
  }
  throw new Error(
    `Unknown LLM_PROVIDER "${raw}". Supported: google, anthropic, openrouter`,
  );
}

export function getLLM(): LanguageModel {
  const provider = resolveProvider();
  const envKey = ENV_KEYS[provider];

  if (!process.env[envKey]) {
    throw new Error(
      `${envKey} is required when LLM_PROVIDER=${provider}. ` +
        `Set it in .env.local.`,
    );
  }

  switch (provider) {
    case "google": {
      const { google } = require("@ai-sdk/google") as typeof import("@ai-sdk/google");
      const model = process.env.GOOGLE_MODEL ?? PROVIDER_DEFAULTS.google;
      return google(model);
    }
    case "anthropic": {
      const { anthropic } = require("@ai-sdk/anthropic") as typeof import("@ai-sdk/anthropic");
      const model = process.env.ANTHROPIC_MODEL ?? PROVIDER_DEFAULTS.anthropic;
      return anthropic(model);
    }
    case "openrouter": {
      const { createOpenRouter } = require("@openrouter/ai-sdk-provider") as typeof import("@openrouter/ai-sdk-provider");
      const openrouter = createOpenRouter({ apiKey: process.env.OPENROUTER_API_KEY });
      const model = process.env.OPENROUTER_MODEL ?? PROVIDER_DEFAULTS.openrouter;
      return openrouter(model);
    }
  }
}
