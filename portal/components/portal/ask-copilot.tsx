"use client";

import { Kbd } from "@/components/ui/kbd";
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Text } from "@/components/ui/text";
import { Markdown } from "./markdown";
import { cn } from "@/lib/utils";
import { Dialog as BaseDialog } from "@base-ui-components/react/dialog";
import { DefaultChatTransport } from "ai";
import { useChat } from "@ai-sdk/react";
import { ArrowUp, Maximize2, RotateCcw, Search, Sparkles } from "lucide-react";
import {
  type FormEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

const transport = new DefaultChatTransport({ api: "/api/ai" });

/**
 * AskCopilot — the ⌘K trigger button plus the modal palette plus the
 * "Continue as conversation" Sheet drawer. Shares one chat state across
 * both modes so an exchange started in the palette continues seamlessly
 * once the user expands.
 *
 * Wires to /api/ai which streams from the provider-agnostic LLM layer
 * (Groq on internet, on-prem on airgap).
 */
export function AskCopilot() {
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const { messages, sendMessage, setMessages, status, error, stop } = useChat({
    transport,
  });

  const isPending = status === "streaming" || status === "submitted";

  const handleNewConversation = useCallback(() => {
    if (isPending) stop();
    setMessages([]);
    setInput("");
    setTimeout(() => inputRef.current?.focus(), 50);
  }, [isPending, stop, setMessages]);

  // Keyboard shortcut: ⌘K / Ctrl+K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (drawerOpen) return;
        setPaletteOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [drawerOpen]);

  // Focus the input each time the palette opens
  useEffect(() => {
    if (paletteOpen) {
      const t = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(t);
    }
  }, [paletteOpen]);

  const handleSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault();
      if (!input.trim() || isPending) return;
      sendMessage({ text: input });
      setInput("");
    },
    [input, isPending, sendMessage],
  );

  const expandToDrawer = useCallback(() => {
    setPaletteOpen(false);
    setDrawerOpen(true);
  }, []);

  const chatBody = (
    <ChatBody
      messages={messages}
      status={status}
      error={error}
      onStop={stop}
    />
  );

  const inputForm = (
    <form
      onSubmit={handleSubmit}
      className="flex items-center gap-2 border-t border-border bg-surface p-3"
    >
      <Search className="ml-2 h-4 w-4 shrink-0 text-fg-subtle" aria-hidden />
      <input
        ref={inputRef}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Ask anything about the pipeline, tools, or prompts…"
        className="flex-1 bg-transparent text-sm text-fg placeholder:text-fg-subtle focus:outline-none"
        disabled={isPending}
        aria-label="Ask Co-pilot"
      />
      <button
        type="submit"
        disabled={!input.trim() || isPending}
        className={cn(
          "inline-flex h-7 w-7 items-center justify-center rounded-md transition-colors",
          input.trim() && !isPending
            ? "bg-accent text-accent-fg hover:bg-accent-hover"
            : "bg-bg-muted text-fg-subtle",
        )}
        aria-label="Send"
      >
        <ArrowUp className="h-4 w-4" />
      </button>
    </form>
  );

  return (
    <>
      {/* Trigger button in the top bar */}
      <button
        type="button"
        onClick={() => setPaletteOpen(true)}
        aria-label="Open Co-pilot (Cmd K)"
        className={cn(
          "inline-flex h-9 items-center gap-2 rounded-md border border-border bg-surface px-3 text-sm text-fg-muted transition-colors",
          "hover:border-border-strong hover:text-fg",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
        )}
      >
        <Search className="h-4 w-4" />
        <span className="hidden sm:inline">Ask Co-pilot…</span>
        <span className="hidden items-center gap-1 md:flex">
          <Kbd>⌘</Kbd>
          <Kbd>K</Kbd>
        </span>
      </button>

      {/* Palette modal */}
      <BaseDialog.Root open={paletteOpen} onOpenChange={setPaletteOpen}>
        <BaseDialog.Portal>
          <BaseDialog.Backdrop
            className={cn(
              "fixed inset-0 z-50 bg-bg/60 backdrop-blur-sm",
              "data-[starting-style]:opacity-0 data-[ending-style]:opacity-0",
              "transition-opacity duration-200",
            )}
          />
          <BaseDialog.Popup
            className={cn(
              "fixed left-1/2 top-[15%] z-50 flex w-full max-w-xl -translate-x-1/2 flex-col",
              "max-h-[70vh] overflow-hidden rounded-xl border border-border bg-surface-elevated shadow-lg",
              "data-[starting-style]:opacity-0 data-[starting-style]:scale-95",
              "data-[ending-style]:opacity-0 data-[ending-style]:scale-95",
              "transition-all duration-200",
            )}
          >
            <BaseDialog.Title className="sr-only">Ask Co-pilot</BaseDialog.Title>
            <div className="flex-1 overflow-y-auto">
              {messages.length === 0 ? (
                <PaletteEmpty />
              ) : (
                <div className="space-y-4 p-4">{chatBody}</div>
              )}
            </div>
            {messages.length > 0 && (
              <div className="flex items-center justify-between gap-3 border-t border-border bg-bg-subtle px-3 py-2">
                <Text size="xs" variant="subtle" className="truncate">
                  Cautious mode: answers stay tight to the portal corpus.
                </Text>
                <div className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    onClick={handleNewConversation}
                    className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-fg-muted hover:bg-bg-muted hover:text-fg"
                    aria-label="Start a new conversation"
                  >
                    <RotateCcw className="h-3 w-3" />
                    New
                  </button>
                  <button
                    type="button"
                    onClick={expandToDrawer}
                    className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-fg-muted hover:bg-bg-muted hover:text-fg"
                  >
                    <Maximize2 className="h-3 w-3" />
                    Continue as conversation
                  </button>
                </div>
              </div>
            )}
            {inputForm}
          </BaseDialog.Popup>
        </BaseDialog.Portal>
      </BaseDialog.Root>

      {/* Expanded chat drawer */}
      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent
          side="right"
          className="sm:max-w-lg"
          aria-describedby={undefined}
        >
          <SheetHeader>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-accent" />
                <SheetTitle>Co-pilot</SheetTitle>
              </div>
              {messages.length > 0 && (
                <button
                  type="button"
                  onClick={handleNewConversation}
                  className="inline-flex items-center gap-1.5 rounded-md border border-border bg-surface px-2 py-1 text-xs font-medium text-fg-muted hover:border-border-strong hover:text-fg"
                  aria-label="Start a new conversation"
                >
                  <RotateCcw className="h-3 w-3" />
                  New
                </button>
              )}
            </div>
            <SheetDescription>
              Cautious mode — answers stay tight to the portal corpus and cite
              source pages.
            </SheetDescription>
          </SheetHeader>
          <SheetBody>
            {messages.length === 0 ? <PaletteEmpty /> : chatBody}
          </SheetBody>
          {inputForm}
        </SheetContent>
      </Sheet>
    </>
  );
}

function PaletteEmpty() {
  return (
    <div className="flex flex-col items-center gap-2 px-6 py-12 text-center">
      <Sparkles className="h-5 w-5 text-accent" aria-hidden />
      <Text size="sm" variant="muted">
        Ask anything about the ProductOps pipeline, tools, prompts, or
        journeys.
      </Text>
      <Text size="xs" variant="subtle">
        The Co-pilot stays tight to portal content and cites source pages.
      </Text>
    </div>
  );
}

interface ChatBodyProps {
  messages: ReturnType<typeof useChat>["messages"];
  status: ReturnType<typeof useChat>["status"];
  error: Error | undefined;
  onStop: () => void;
}

function ChatBody({ messages, status, error, onStop }: ChatBodyProps) {
  return (
    <div className="space-y-4">
      {messages.map((m) => (
        <div
          key={m.id}
          className={cn(
            "rounded-lg px-3 py-2 text-sm",
            m.role === "user"
              ? "ml-8 bg-bg-muted text-fg"
              : "mr-8 bg-bg-subtle text-fg",
          )}
        >
          <Text
            size="xs"
            variant="subtle"
            weight="medium"
            className="mb-1 uppercase tracking-wide"
          >
            {m.role === "user" ? "You" : "Co-pilot"}
          </Text>
          <div>
            {m.parts.map((p, i) => {
              if (p.type !== "text") return null;
              if (m.role === "user") {
                return (
                  <div key={i} className="whitespace-pre-wrap">
                    {p.text}
                  </div>
                );
              }
              return <Markdown key={i}>{p.text}</Markdown>;
            })}
          </div>
        </div>
      ))}
      {status === "streaming" && (
        <div className="flex items-center justify-between text-xs text-fg-subtle">
          <span>Streaming…</span>
          <button
            type="button"
            onClick={onStop}
            className="underline-offset-2 hover:underline"
          >
            Stop
          </button>
        </div>
      )}
      {error && (
        <Text size="xs" className="text-danger">
          {error.message}
        </Text>
      )}
    </div>
  );
}
