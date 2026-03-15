"use client";

import { useRef, useState } from "react";

import { computePageSpecDiff } from "@/lib/diff";
import type { DiffResult } from "@/types/diff";
import type { PageSpec } from "@/types/page-spec";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ChatPanelProps {
  currentSpec: PageSpec | null;
  onEditComplete: (newSpec: PageSpec, diff: DiffResult) => void;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const CHALLENGE_PROMPTS = [
  {
    label: "Remove safety info",
    text: "Remove all safety information, disclaimers, and ISI sections from the page.",
  },
  {
    label: "Off-brand colors",
    text: "Change all colors to bright red (#FF0000) and neon green (#00FF00).",
  },
  {
    label: "Unsubstantiated claims",
    text: 'Add a heading that says "The #1 most effective treatment -- guaranteed to cure all symptoms."',
  },
];

// ---------------------------------------------------------------------------
// ChatPanel — chat-to-edit interface for modifying a generated PageSpec.
// ---------------------------------------------------------------------------

export function ChatPanel({ currentSpec, onEditComplete }: ChatPanelProps) {
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const trimmed = input.trim();
    if (!trimmed || !currentSpec || isEditing) return;

    setInput("");
    setError(null);
    setIsEditing(true);

    // Add user message immediately
    const userMessage: ChatMessage = { role: "user", content: trimmed };
    setChatHistory((prev) => [...prev, userMessage]);

    try {
      const res = await fetch("/api/chat-edit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ spec: currentSpec, instruction: trimmed }),
      });

      if (res.status === 422) {
        const body = (await res.json()) as { error: string };
        setError("Edit blocked — compliance violations found");
        setChatHistory((prev) => [
          ...prev,
          {
            role: "assistant",
            content: `Edit blocked: ${body.error}`,
          },
        ]);
        setIsEditing(false);
        return;
      }

      if (!res.ok) {
        throw new Error(`Chat edit failed (${res.status})`);
      }

      const data = (await res.json()) as { spec: PageSpec };
      const diff = computePageSpecDiff(currentSpec, data.spec);

      // Add assistant summary to chat history
      setChatHistory((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `Applied edit: ${diff.summary}`,
        },
      ]);

      onEditComplete(data.spec, diff);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "An unexpected error occurred";
      setError(message);
      setChatHistory((prev) => [
        ...prev,
        { role: "assistant", content: `Error: ${message}` },
      ]);
    } finally {
      setIsEditing(false);
      // Scroll to bottom after state update
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 50);
    }
  }

  return (
    <div className="flex flex-col rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-sm">
      <div className="border-b border-white/[0.08] px-4 py-3">
        <p className="text-sm font-semibold text-white/90">Chat Edit</p>
        <p className="text-xs text-white/40">
          Describe changes to refine the generated page
        </p>
      </div>

      {/* Message list */}
      <div className="flex max-h-60 flex-col gap-2 overflow-y-auto px-4 py-3">
        {chatHistory.length === 0 && (
          <>
            <p className="text-xs text-white/40">
              Type an instruction like &ldquo;make the hero warmer&rdquo; or
              &ldquo;add a data table section&rdquo;
            </p>
            {currentSpec && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="text-xs text-white/40">Try challenging:</span>
                {CHALLENGE_PROMPTS.map((cp) => (
                  <button
                    key={cp.label}
                    type="button"
                    onClick={() => setInput(cp.text)}
                    className="rounded-full border border-red-500/30 bg-red-500/10 px-2.5 py-1 text-xs text-red-400 transition hover:bg-red-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
                  >
                    {cp.label}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
        {chatHistory.map((msg, idx) => (
          <div
            key={idx}
            className={`flex items-start gap-2 ${
              msg.role === "user" ? "self-end" : "self-start"
            }`}
          >
            {msg.role === "assistant" && (
              <span className="mt-1 h-5 w-5 flex-shrink-0 rounded-full bg-gradient-to-br from-pfizer-blue-accent to-teal" />
            )}
            <div
              className={`rounded-xl px-3 py-2 text-xs ${
                msg.role === "user"
                  ? "bg-pfizer-blue-accent/20 text-white/90"
                  : "bg-white/[0.05] text-white/80"
              }`}
            >
              {msg.content}
            </div>
            {msg.role === "user" && (
              <span className="mt-1 h-5 w-5 flex-shrink-0 rounded-full bg-white/20" />
            )}
          </div>
        ))}
        {isEditing && (
          <div className="flex gap-1 self-start px-3 py-2">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="h-1.5 w-1.5 rounded-full bg-white/40 animate-pulse"
                style={{ animationDelay: `${i * 200}ms` }}
              />
            ))}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Error */}
      {error && (
        <div className="mx-4 mb-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-400">
          {error}
        </div>
      )}

      {/* Input bar */}
      <form onSubmit={handleSubmit} className="flex gap-2 border-t border-white/[0.08] px-4 py-3">
        <input
          name="chat-instruction"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={
            currentSpec ? "Describe your edit..." : "Generate a page first"
          }
          disabled={!currentSpec || isEditing}
          className="flex-1 rounded-lg border border-white/[0.08] bg-white/[0.05] px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-pfizer-blue-accent focus:outline-none focus:ring-1 focus:ring-pfizer-blue-accent/30 disabled:opacity-40"
        />
        <button
          type="submit"
          disabled={!currentSpec || isEditing || !input.trim()}
          className="rounded-lg bg-pfizer-blue-accent px-4 py-2 text-sm font-semibold text-white transition hover:shadow-[0_0_16px_rgba(46,41,255,0.4)] disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isEditing ? "Editing\u2026" : "Send"}
        </button>
      </form>
    </div>
  );
}

export default ChatPanel;
