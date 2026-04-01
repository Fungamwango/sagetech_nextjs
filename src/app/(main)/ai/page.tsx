"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { DICTIONARY_LANGUAGES } from "@/lib/dictionaryLanguages";
import { useBackClosable } from "@/hooks/useBackClosable";

type LanguageOption = { code: string; label: string };

type HistoryEntry = {
  question: string;
  answer: string;
  answer_en: string;
  postId: string | null;
  sharePath?: string | null;
  lang: string;
  ts: number;
};

type AIResponse = {
  question: string;
  answer: string;
  postId: string | null;
  sharePath?: string | null;
};

const LANGS: LanguageOption[] = DICTIONARY_LANGUAGES.map((entry) => ({
  code: entry.code,
  label: entry.label,
}));

const QUICK_PROMPTS = [
  "Tell me a joke",
  "Explain photosynthesis",
  "What is AI?",
  "History of Zambia",
];

const SPINNER_MESSAGES = [
  "Thinking...",
  "Processing your question...",
  "Consulting knowledge base...",
  "Generating response...",
  "Almost there...",
  "Translating...",
];

function formatHistoryDate(timestamp: number) {
  return new Date(timestamp).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function stripHtml(value: string) {
  return value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

export default function AIPage() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<AIResponse | null>(null);
  const [statusMsg, setStatusMsg] = useState("");
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [selectedLang, setSelectedLang] = useState("en");
  const [langOpen, setLangOpen] = useState(false);
  const [langSearch, setLangSearch] = useState("");
  const [ttsPlaying, setTtsPlaying] = useState(false);
  const [spinnerMsg, setSpinnerMsg] = useState(SPINNER_MESSAGES[0]);
  const [spinnerSec, setSpinnerSec] = useState(0);
  const langRef = useRef<HTMLDivElement>(null);
  const spinTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const closeLanguagePicker = useBackClosable(langOpen, () => setLangOpen(false));

  const selectedLanguage = useMemo(
    () => LANGS.find((entry) => entry.code === selectedLang) ?? { code: selectedLang, label: selectedLang },
    [selectedLang]
  );

  const filteredLangs = useMemo(() => {
    if (!langSearch.trim()) return LANGS;
    const needle = langSearch.trim().toLowerCase();
    return LANGS.filter(
      (entry) => entry.label.toLowerCase().includes(needle) || entry.code.toLowerCase().includes(needle)
    );
  }, [langSearch]);

  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem("sageai_history");
      if (savedHistory) setHistory(JSON.parse(savedHistory));
      const savedLang = localStorage.getItem("sageai_lang") || "en";
      setSelectedLang(savedLang);
    } catch {
      // ignore local storage failures
    }
  }, []);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(event.target as Node)) {
        setLangOpen(false);
      }
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  useEffect(() => {
    return () => {
      if (spinTimerRef.current) clearInterval(spinTimerRef.current);
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  function selectLang(code: string) {
    setSelectedLang(code);
    setLangOpen(false);
    setLangSearch("");
    try {
      localStorage.setItem("sageai_lang", code);
    } catch {
      // ignore local storage failures
    }
  }

  function startSpinner() {
    let seconds = 0;
    let messageIndex = 0;
    setSpinnerSec(0);
    setSpinnerMsg(SPINNER_MESSAGES[0]);
    spinTimerRef.current = setInterval(() => {
      seconds += 1;
      setSpinnerSec(seconds);
      if (seconds % 3 === 0) {
        messageIndex += 1;
        setSpinnerMsg(SPINNER_MESSAGES[messageIndex % SPINNER_MESSAGES.length]);
      }
    }, 1000);
  }

  function stopSpinner() {
    if (spinTimerRef.current) {
      clearInterval(spinTimerRef.current);
      spinTimerRef.current = null;
    }
  }

  async function sendMessage(event?: React.FormEvent) {
    event?.preventDefault();
    const question = input.trim();
    if (!question || question.length < 2 || loading) return;

    setLoading(true);
    setResponse(null);
    setStatusMsg("");
    startSpinner();

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: question,
          language: selectedLang,
          history: history.slice(0, 6).map((entry) => ({
            question: entry.question,
            answer: entry.answer,
            answer_en: entry.answer_en,
          })),
        }),
      });

      stopSpinner();

      if (!res.ok) {
        const err = (await res.json().catch(() => null)) as { error?: string } | null;
        setStatusMsg(err?.error || "Something went wrong.");
        return;
      }

      const data = (await res.json()) as {
        response: string;
        answer_en: string;
        question: string;
        language: string;
        postId: string | null;
        sharePath?: string | null;
        savedAsGuest?: boolean;
      };

      setResponse({
        question: data.question,
        answer: data.response,
        postId: data.postId,
        sharePath: data.sharePath,
      });
      setInput("");

      if (data.postId && data.savedAsGuest) setStatusMsg("Guest AI post published publicly.");
      else if (data.postId) setStatusMsg("Answer saved as a post.");

      const nextEntry: HistoryEntry = {
        question: data.question,
        answer: data.response,
        answer_en: data.answer_en || data.response,
        postId: data.postId,
        sharePath: data.sharePath,
        lang: selectedLang,
        ts: Date.now(),
      };

      setHistory((current) => {
        const next = [nextEntry, ...current].slice(0, 20);
        try {
          localStorage.setItem("sageai_history", JSON.stringify(next));
        } catch {
          // ignore local storage failures
        }
        return next;
      });

      window.setTimeout(() => setStatusMsg(""), 4000);
    } catch {
      stopSpinner();
      setStatusMsg("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function loadHistoryEntry(entry: HistoryEntry) {
    setSelectedLang(entry.lang);
    setResponse({
      question: entry.question,
      answer: entry.answer,
      postId: entry.postId,
      sharePath: entry.sharePath,
    });
  }

  function speakText() {
    if (!response || typeof window === "undefined" || !("speechSynthesis" in window)) return;

    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      setTtsPlaying(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(stripHtml(response.answer));
    utterance.lang = selectedLang;
    utterance.rate = 0.95;
    utterance.onend = () => setTtsPlaying(false);
    utterance.onerror = () => setTtsPlaying(false);
    setTtsPlaying(true);
    window.speechSynthesis.speak(utterance);
  }

  return (
    <div className="space-y-5 text-white">
      <section className="overflow-visible rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(7,20,30,0.98),rgba(4,13,20,0.96))] shadow-[0_28px_70px_rgba(0,0,0,0.28)]">
        <div className="border-b border-white/8 px-4 py-4 sm:px-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-lg font-bold text-white">
                <i className="fas fa-robot mr-2 text-cyan-400" />
                Sage AI
              </h1>
              <p className="mt-1 text-sm text-white/50">
                Ask anything. Sage AI answers, and the response can be published as a post automatically.
              </p>
            </div>
            <div className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-medium text-cyan-300">
              Responding in {selectedLanguage.label}
            </div>
          </div>
        </div>

        <div className="space-y-4 px-4 py-4 sm:px-5">
          <form onSubmit={sendMessage} className="space-y-3">
            <textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
                  void sendMessage();
                }
              }}
              placeholder="Ask me anything, I will respond in selected language"
              rows={4}
              disabled={loading}
              className="w-full resize-none rounded-3xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-white/45 focus:border-cyan-400/40"
            />

            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-medium uppercase tracking-[0.16em] text-white/35">Language</span>
                <div className="relative" ref={langRef}>
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      if (langOpen) {
                        closeLanguagePicker();
                        return;
                      }
                      setLangOpen(true);
                    }}
                    className="inline-flex min-w-[164px] items-center justify-between gap-3 rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-sm text-white/80 transition-colors hover:border-white/15 hover:bg-white/[0.08]"
                  >
                    <span className="truncate">{selectedLanguage.label}</span>
                    <i className={`fas fa-chevron-${langOpen ? "up" : "down"} text-[11px] text-white/35`} />
                  </button>

                  {langOpen ? (
                    <div className="absolute left-0 top-[calc(100%+8px)] z-50 w-[236px] overflow-hidden rounded-3xl border border-white/10 bg-[#081722] shadow-[0_24px_80px_rgba(0,0,0,0.42)]">
                      <div className="border-b border-white/8 p-3">
                        <input
                          type="text"
                          autoFocus
                          value={langSearch}
                          onChange={(event) => setLangSearch(event.target.value)}
                          onKeyDown={(event) => {
                            if (event.key === "Escape") closeLanguagePicker();
                            if (event.key === "Enter" && filteredLangs[0]) {
                              selectLang(filteredLangs[0].code);
                            }
                          }}
                          placeholder="Search language..."
                          className="w-full rounded-2xl border border-white/10 bg-white/[0.05] px-3 py-2 text-xs text-white outline-none placeholder:text-white/30 focus:border-cyan-400/35"
                        />
                      </div>
                      <ul className="max-h-[420px] overflow-y-auto py-1">
                        {filteredLangs.map((entry) => (
                          <li key={entry.code}>
                            <button
                              type="button"
                              onClick={() => selectLang(entry.code)}
                              className={`flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm transition-colors ${
                                entry.code === selectedLang
                                  ? "bg-cyan-500/12 text-cyan-300"
                                  : "text-white/75 hover:bg-white/[0.05] hover:text-white"
                              }`}
                            >
                              <span className="truncate">{entry.label}</span>
                              <span className="text-[11px] uppercase tracking-[0.12em] text-white/30">{entry.code}</span>
                            </button>
                          </li>
                        ))}
                        {filteredLangs.length === 0 ? (
                          <li className="px-3 py-3 text-xs text-white/35">No language matches that search.</li>
                        ) : null}
                      </ul>
                    </div>
                  ) : null}
                </div>
                {statusMsg ? <span className="text-xs text-cyan-400">{statusMsg}</span> : null}
              </div>

              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="btn-sage inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm disabled:opacity-40"
              >
                {loading ? <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent" /> : <i className="fas fa-paper-plane" />}
                Ask Sage AI
              </button>
            </div>
          </form>

          {!response && !loading ? (
            <div className="grid gap-2 sm:grid-cols-2">
              {QUICK_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => setInput(prompt)}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-3 text-left text-sm text-white/65 transition-colors hover:border-cyan-400/25 hover:text-cyan-300"
                >
                  {prompt}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </section>

      {loading ? (
        <section className="rounded-[28px] border border-white/10 bg-white/[0.04] px-4 py-4 shadow-[0_20px_60px_rgba(0,0,0,0.2)] sm:px-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-400/12 text-cyan-300">
              <i className="fas fa-robot" />
            </div>
            <div className="flex min-w-0 flex-1 items-center gap-3 rounded-2xl border border-cyan-400/12 bg-cyan-400/8 px-4 py-3">
              <div className="flex items-center gap-1">
                {[0, 1, 2].map((index) => (
                  <span
                    key={index}
                    className="inline-block h-2 w-2 animate-bounce rounded-full bg-cyan-300"
                    style={{ animationDelay: `${index * 0.12}s` }}
                  />
                ))}
              </div>
              <span className="text-sm text-white/70">{spinnerMsg}</span>
              <span className="ml-auto text-xs text-white/35">{spinnerSec}s</span>
            </div>
          </div>
        </section>
      ) : null}

      {response && !loading ? (
        <section className="rounded-[28px] border border-white/10 bg-white/[0.04] px-4 py-4 shadow-[0_20px_60px_rgba(0,0,0,0.2)] sm:px-5">
          <div className="mb-4">
            <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-white/35">Your question</div>
            <div className="mt-2 rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-sm font-medium leading-relaxed text-white">
              {response.question}
            </div>
          </div>

          <div className="flex items-center justify-between gap-3">
            <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-white/35">Sage AI answer</div>
            {typeof window !== "undefined" && "speechSynthesis" in window ? (
              <button
                type="button"
                onClick={speakText}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-sm text-white/50 transition-colors hover:border-cyan-400/30 hover:text-cyan-300"
                title={ttsPlaying ? "Stop audio" : "Play audio"}
              >
                <i className={`fas fa-${ttsPlaying ? "stop" : "volume-up"}`} />
              </button>
            ) : null}
          </div>

          <div
            className="ai-blog-content mt-3 text-sm leading-relaxed text-white/85"
            dangerouslySetInnerHTML={{ __html: response.answer }}
          />

          {response.sharePath ? (
            <div className="mt-4 border-t border-white/8 pt-4">
              <Link href={response.sharePath} className="text-sm font-medium text-cyan-400 hover:text-cyan-300 hover:underline">
                View as post
              </Link>
            </div>
          ) : null}
        </section>
      ) : null}

      {history.length > 0 ? (
        <section className="rounded-[28px] border border-white/10 bg-white/[0.03] px-4 py-4 shadow-[0_20px_60px_rgba(0,0,0,0.16)] sm:px-5">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-[11px] font-medium uppercase tracking-[0.18em] text-white/35">Recent questions</h2>
            <span className="text-xs text-white/30">{history.length} saved</span>
          </div>

          <ul className="space-y-2">
            {history.map((entry, index) => {
              const language = LANGS.find((item) => item.code === entry.lang)?.label ?? entry.lang;
              return (
                <li key={`${entry.ts}-${index}`}>
                  <button
                    type="button"
                    onClick={() => loadHistoryEntry(entry)}
                    className="w-full rounded-2xl border border-white/8 bg-white/[0.03] px-3 py-3 text-left transition-colors hover:border-cyan-400/20 hover:bg-white/[0.05]"
                  >
                    <div className="truncate text-sm font-medium text-white/85">{entry.question}</div>
                    <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-white/35">
                      <span>{language}</span>
                      <span>•</span>
                      <span>{formatHistoryDate(entry.ts)}</span>
                      {entry.sharePath ? (
                        <>
                          <span>•</span>
                          <Link
                            href={entry.sharePath}
                            onClick={(event) => event.stopPropagation()}
                            className="text-cyan-400/80 hover:text-cyan-300"
                          >
                            view post
                          </Link>
                        </>
                      ) : null}
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
