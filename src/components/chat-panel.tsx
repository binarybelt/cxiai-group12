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
    <div className="flex flex-col rounded-2xl border border-gray-200 bg-white">
      <div className="border-b border-gray-100 px-4 py-3">
        <p className="text-sm font-semibold text-gray-700">Chat Edit</p>
        <p className="text-xs text-gray-400">
          Describe changes to refine the generated page
        </p>
      </div>

      {/* Message list */}
      <div className="flex max-h-60 flex-col gap-2 overflow-y-auto px-4 py-3">
        {chatHistory.length === 0 && (
          <>
            <p className="text-xs text-gray-400">
              Type an instruction like &ldquo;make the hero warmer&rdquo; or
              &ldquo;add a data table section&rdquo;
            </p>
            {currentSpec && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="text-xs text-gray-400">Try challenging:</span>
                {CHALLENGE_PROMPTS.map((cp) => (
                  <button
                    key={cp.label}
                    type="button"
                    onClick={() => setInput(cp.text)}
                    className="rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-xs text-red-600 transition hover:bg-red-100"
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
            className={`rounded-xl px-3 py-2 text-xs ${
              msg.role === "user"
                ? "self-end bg-pfizer-blue-50 text-pfizer-blue-800"
                : "self-start bg-gray-100 text-gray-700"
            }`}
          >
            {msg.content}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Error */}
      {error && (
        <div className="mx-4 mb-2 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </div>
      )}

      {/* Input bar */}
      <form onSubmit={handleSubmit} className="flex gap-2 border-t border-gray-100 px-4 py-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={
            currentSpec ? "Describe your edit..." : "Generate a page first"
          }
          disabled={!currentSpec || isEditing}
          className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus:border-pfizer-blue-500 focus:outline-none focus:ring-1 focus:ring-pfizer-blue-200 disabled:opacity-40"
        />
        <button
          type="submit"
          disabled={!currentSpec || isEditing || !input.trim()}
          className="rounded-lg bg-pfizer-blue-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-pfizer-blue-800 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isEditing ? "Editing..." : "Send"}
        </button>
      </form>
    </div>
  );
}

export default ChatPanel;
