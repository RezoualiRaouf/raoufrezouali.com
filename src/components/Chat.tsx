"use client";

import { useEffect, useRef, useState } from "react";
import { MessageSquare, X, Send, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Message = {
  role: "user" | "assistant";
  content: string;
};

const SUGGESTIONS = [
  "What projects has Raouf built?",
  "Is he available for hire?",
  "What are his networking skills?",
];

export default function Chat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([
        {
          role: "assistant",
          content:
            "Hey — I'm an AI assistant. Ask me anything about Raouf's skills, projects, or availability.",
        },
      ]);
    }
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  const sendMessage = async (content: string) => {
    if (!content.trim() || loading) return;

    const userMessage: Message = { role: "user", content: content.trim() };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.message },
      ]);
    } catch {
      setError("Network error. Check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const showSuggestions =
    messages.length === 1 && messages[0].role === "assistant";

  return (
    <>
      {/* Floating toggle button */}
      <button
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "fixed bottom-6 right-6 z-50 flex size-12 items-center justify-center rounded-full shadow-lg transition-all duration-200",
          "bg-foreground text-background hover:scale-105 active:scale-95",
        )}
        aria-label={open ? "Close chat" : "Open chat"}
      >
        {open ? <X className="size-5" /> : <MessageSquare className="size-5" />}
      </button>

      {/* Chat panel */}
      <div
        className={cn(
          "fixed bottom-20 right-6 z-50 flex w-[340px] flex-col overflow-hidden rounded-xl border bg-background shadow-xl transition-all duration-200 sm:w-[380px]",
          open
            ? "translate-y-0 opacity-100"
            : "pointer-events-none translate-y-4 opacity-0",
        )}
        style={{ maxHeight: "520px" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="relative flex size-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-green-500" />
            </span>
            <span className="text-sm font-semibold">Ask about Raouf</span>
          </div>
        </div>

        {/* Messages */}
        <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-4">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={cn(
                "max-w-[85%] rounded-xl px-3 py-2 text-sm leading-relaxed",
                msg.role === "user"
                  ? "ml-auto bg-foreground text-background"
                  : "bg-muted text-foreground",
              )}
            >
              {msg.content}
            </div>
          ))}

          {/* Suggestion chips */}
          {showSuggestions && (
            <div className="mt-1 flex flex-col gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  className="w-fit rounded-lg border px-3 py-1.5 text-left text-xs text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Loading indicator */}
          {loading && (
            <div className="flex w-fit items-center gap-2 rounded-xl bg-muted px-3 py-2 text-sm text-muted-foreground">
              <Loader2 className="size-3 animate-spin" />
              <span>Thinking...</span>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="rounded-xl bg-destructive/10 px-3 py-2 text-xs text-destructive">
              {error}
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="border-t p-3">
          <div className="flex items-end gap-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask something..."
              rows={1}
              className="flex-1 resize-none rounded-lg border bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              style={{ maxHeight: "120px" }}
              disabled={loading}
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || loading}
              className={cn(
                "flex size-9 shrink-0 items-center justify-center rounded-lg transition-colors",
                "bg-foreground text-background",
                "disabled:cursor-not-allowed disabled:opacity-40",
                "hover:opacity-80",
              )}
              aria-label="Send message"
            >
              <Send className="size-4" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}