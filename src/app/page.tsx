"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { MODELS, type Model, type Message } from "@/lib/models";

// ─── Translations ─────────────────────────────────────────────────────────────

type Lang = "pt" | "en";

const translations = {
  pt: {
    placeholder: "Mensagem para o CassisGPT...",
    newChat: "Nova conversa",
    resetWarning: "Trocar o modelo irá resetar a conversa atual.",
    confirm: "Confirmar",
    cancel: "Cancelar",
    emptyTitle: "Sou pequeno, mas sou seu 😬",
    emptySubtitle: "Estado da Arte de 2019... mas estamos em 2026 😅 Me pergunta algo... Talvez eu acerte",
    thinking: "Pensando...",
    errorMessage: "Algo deu errado. Tente novamente.",
    disclaimer:
      "Este é um projeto de estudos. Nenhuma informação fornecida pelos modelos deve ser levada a sério.",
  },
  en: {
    placeholder: "Message CassisGPT...",
    newChat: "New chat",
    resetWarning: "Changing the model will reset the current conversation.",
    confirm: "Confirm",
    cancel: "Cancel",
    emptyTitle: "Small but yours 😬",
    emptySubtitle: "State of the art in 2019... but hey, it's 2026 now 😅 Ask me something... Maybe I'll get it right",
    thinking: "Thinking...",
    errorMessage: "Something went wrong. Please try again.",
    disclaimer:
      "This is a studying project. None of the information provided by the models should be taken seriously.",
  },
} satisfies Record<Lang, Record<string, string>>;

// ─── Icons ────────────────────────────────────────────────────────────────────

function SendIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
    </svg>
  );
}

function SparkleIcon({ size = 5 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={`w-${size} h-${size}`}>
      <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 ml-auto shrink-0">
      <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
    </svg>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ConfirmDialog({
  message,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
}: {
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.7)" }}>
      <div className="rounded-2xl p-6 w-full max-w-sm flex flex-col gap-5 shadow-2xl" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
        <p className="text-sm leading-relaxed" style={{ color: "var(--foreground)" }}>{message}</p>
        <div className="flex gap-3 justify-end">
          <button onClick={onCancel} className="px-4 py-2 rounded-xl text-sm font-medium cursor-pointer" style={{ background: "var(--surface)", color: "var(--muted)", border: "1px solid var(--border)" }}>
            {cancelLabel}
          </button>
          <button onClick={onConfirm} className="px-4 py-2 rounded-xl text-sm font-medium cursor-pointer" style={{ background: "var(--purple)", color: "#fff" }}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

function ThinkingDots() {
  return (
    <span className="inline-flex items-center gap-1">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-1.5 h-1.5 rounded-full inline-block animate-bounce"
          style={{ background: "var(--purple-light)", animationDelay: `${i * 0.15}s`, animationDuration: "0.8s" }}
        />
      ))}
    </span>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function ChatPage() {
  const [lang, setLang] = useState<Lang>("pt");
  const t = translations[lang];

  const defaultModelForLang = (l: Lang) =>
    MODELS.find((m) => m.id === (l === "pt" ? "br" : "en")) ?? MODELS[0];

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeModel, setActiveModel] = useState<Model>(() => defaultModelForLang("pt"));
  const [pendingModel, setPendingModel] = useState<Model | null>(null);
  const [modelDropdownOpen, setModelDropdownOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const modelDropdownRef = useRef<HTMLDivElement>(null);
  const langDropdownRef = useRef<HTMLDivElement>(null);

  // Load persisted language from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("cassisgpt-lang") as Lang | null;
    if (saved === "pt" || saved === "en") {
      setLang(saved);
      setActiveModel(defaultModelForLang(saved));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (modelDropdownRef.current && !modelDropdownRef.current.contains(e.target as Node))
        setModelDropdownOpen(false);
      if (langDropdownRef.current && !langDropdownRef.current.contains(e.target as Node))
        setLangDropdownOpen(false);
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  const autoResize = () => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 200) + "px";
  };

  const switchLang = (l: Lang) => {
    setLang(l);
    localStorage.setItem("cassisgpt-lang", l);
    setActiveModel(defaultModelForLang(l));
    setMessages([]);
    setError(null);
    setLangDropdownOpen(false);
  };

  const applyModel = (model: Model) => {
    const newLang: Lang = model.id === "br" ? "pt" : "en";
    setActiveModel(model);
    setLang(newLang);
    localStorage.setItem("cassisgpt-lang", newLang);
  };

  const handleModelSelect = (model: Model) => {
    setModelDropdownOpen(false);
    if (model.id === activeModel.id) return;
    if (messages.length > 0) {
      setPendingModel(model);
    } else {
      applyModel(model);
    }
  };

  const confirmModelChange = () => {
    if (pendingModel) {
      applyModel(pendingModel);
      setMessages([]);
      setError(null);
    }
    setPendingModel(null);
  };

  const resetChat = () => {
    setMessages([]);
    setError(null);
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  };

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    const userMsg: Message = { id: crypto.randomUUID(), role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setError(null);
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    setIsLoading(true);

    try {
      const response = await fetch(activeModel.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          instruction: text,
          max_tokens: 200,
          temperature: 0.7,
          top_p: 0.9,
          rep_penalty: 1.3,
        }),
      });
      if (!response.ok) throw new Error("Request failed");
      const data = await response.json();
      const content: string = data.response ?? "";
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: "assistant", content },
      ]);
    } catch {
      setError(t.errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, activeModel, messages, t]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {pendingModel && (
        <ConfirmDialog
          message={t.resetWarning}
          confirmLabel={t.confirm}
          cancelLabel={t.cancel}
          onConfirm={confirmModelChange}
          onCancel={() => setPendingModel(null)}
        />
      )}

      <div className="flex flex-col h-screen w-full" style={{ background: "var(--background)" }}>
        {/* Header */}
        <header className="flex items-center justify-between px-5 py-3 shrink-0" style={{ borderBottom: "1px solid var(--border)", background: "var(--surface)" }}>
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "var(--purple-glow)", border: "1px solid var(--purple-dark)" }}>
              <span style={{ color: "var(--purple-light)" }}><SparkleIcon /></span>
            </div>
            <span className="font-semibold text-base tracking-tight" style={{ color: "var(--foreground)" }}>CassisGPT</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Language switcher */}
            <div className="relative" ref={langDropdownRef}>
              <button
                onClick={() => setLangDropdownOpen((o) => !o)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium cursor-pointer"
                style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--muted)" }}
              >
                {lang === "pt" ? "🇧🇷 PT" : "🇺🇸 EN"}
                <ChevronIcon />
              </button>
              {langDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-36 rounded-xl overflow-hidden shadow-2xl z-40" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
                  {(["pt", "en"] as Lang[]).map((l) => (
                    <button
                      key={l}
                      onClick={() => switchLang(l)}
                      className="w-full flex items-center gap-2 px-4 py-3 text-sm text-left cursor-pointer"
                      style={{
                        color: l === lang ? "var(--purple-light)" : "var(--foreground)",
                        background: l === lang ? "var(--purple-glow)" : "transparent",
                      }}
                    >
                      {l === "pt" ? "🇧🇷 Português" : "🇺🇸 English"}
                      {l === lang && <CheckIcon />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Model selector */}
            <div className="relative" ref={modelDropdownRef}>
              <button
                onClick={() => setModelDropdownOpen((o) => !o)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-medium cursor-pointer"
                style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--foreground)" }}
              >
                <span className="w-2 h-2 rounded-full shrink-0" style={{ background: "var(--purple)" }} />
                {activeModel.name}
                <ChevronIcon />
              </button>
              {modelDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-52 rounded-xl overflow-hidden shadow-2xl z-40" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
                  {MODELS.map((model) => (
                    <button
                      key={model.id}
                      onClick={() => handleModelSelect(model)}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-left cursor-pointer"
                      style={{
                        color: model.id === activeModel.id ? "var(--purple-light)" : "var(--foreground)",
                        background: model.id === activeModel.id ? "var(--purple-glow)" : "transparent",
                      }}
                    >
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ background: model.id === activeModel.id ? "var(--purple)" : "var(--muted)" }} />
                      {model.name}
                      {model.id === activeModel.id && <CheckIcon />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* New chat */}
            <button
              onClick={resetChat}
              title={t.newChat}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium cursor-pointer"
              style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--muted)" }}
            >
              <PlusIcon />
              <span className="hidden sm:inline">{t.newChat}</span>
            </button>
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto w-full">
          {messages.length === 0 && !isLoading ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 px-4 text-center">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-2" style={{ background: "var(--purple-glow)", border: "1px solid var(--purple-dark)" }}>
                <span style={{ color: "var(--purple-light)" }}><SparkleIcon size={8} /></span>
              </div>
              <h1 className="text-2xl font-semibold" style={{ color: "var(--foreground)" }}>{t.emptyTitle}</h1>
              <p className="text-sm" style={{ color: "var(--muted)" }}>{t.emptySubtitle}</p>
              <div className="mt-2 px-3 py-1 rounded-full text-xs font-medium" style={{ background: "var(--purple-glow)", color: "var(--purple-light)", border: "1px solid var(--purple-dark)" }}>
                {activeModel.name}
              </div>
            </div>
          ) : (
            <div className="w-full max-w-3xl mx-auto px-4 py-6 flex flex-col gap-6">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                  {msg.role === "assistant" && (
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5" style={{ background: "var(--purple-glow)", border: "1px solid var(--purple-dark)" }}>
                      <span style={{ color: "var(--purple-light)" }}><SparkleIcon /></span>
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${msg.role === "user" ? "rounded-tr-sm" : "rounded-tl-sm"}`}
                    style={{ background: msg.role === "user" ? "var(--user-bubble)" : "var(--assistant-bubble)", border: "1px solid var(--border)", color: "var(--foreground)" }}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5" style={{ background: "var(--purple-glow)", border: "1px solid var(--purple-dark)" }}>
                    <span style={{ color: "var(--purple-light)" }}><SparkleIcon /></span>
                  </div>
                  <div className="rounded-2xl rounded-tl-sm px-4 py-3 text-sm" style={{ background: "var(--assistant-bubble)", border: "1px solid var(--border)" }}>
                    <ThinkingDots />
                  </div>
                </div>
              )}

              {error && (
                <div className="text-sm px-4 py-3 rounded-2xl text-center" style={{ background: "rgba(220,38,38,0.1)", border: "1px solid rgba(220,38,38,0.3)", color: "#f87171" }}>
                  {error}
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input */}
        <div className="shrink-0 w-full py-4" style={{ borderTop: "1px solid var(--border)", background: "var(--surface)" }}>
          <div className="w-full max-w-3xl mx-auto px-4">
            <div className="flex items-end gap-3 rounded-2xl px-4 py-3 w-full" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
              <textarea
                ref={textareaRef}
                rows={1}
                value={input}
                onChange={(e) => { setInput(e.target.value); autoResize(); }}
                onKeyDown={handleKeyDown}
                placeholder={t.placeholder}
                className="flex-1 w-full min-w-0 resize-none bg-transparent outline-none text-sm leading-relaxed placeholder:text-(--muted)"
                style={{ color: "var(--foreground)", maxHeight: "200px" }}
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || isLoading}
                className="shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ background: input.trim() && !isLoading ? "var(--purple)" : "var(--border)", color: "#fff" }}
              >
                <SendIcon />
              </button>
            </div>
            <p className="text-xs text-center mt-2" style={{ color: "var(--muted)" }}>
              {activeModel.name} &mdash; {t.disclaimer}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
