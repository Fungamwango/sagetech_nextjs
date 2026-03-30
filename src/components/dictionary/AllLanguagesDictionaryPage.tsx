"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import Image from "next/image";
import { DICTIONARY_LANGUAGES, DEFAULT_SOURCE_LANGUAGE, DEFAULT_TARGET_LANGUAGE, getDictionaryLanguageLabel } from "@/lib/dictionaryLanguages";

// ─── Types ───────────────────────────────────────────────────────────────────
interface DictEntry { word: string; bemba: string; html: string; base?: string; sourceLang?: string; targetLang?: string }
interface GeneratedExample { source: string; target: string }
interface QuizQuestion { word: string; correct: string; options: string[] }
interface ChallengeUser { id: string; username: string; picture: string | null; level: string | null; points: string | null; isOnline: boolean | null }
interface IncomingChallenge {
  id: string; senderId: string; senderScore: number; questions: string;
  status: string | null; createdAt: string | null; senderUsername: string | null; senderPicture: string | null;
}
interface Leader { id: string; username: string; picture: string | null; level: string | null; points: string | null }

type QuizMode = "solo" | "challenge-friend" | "accepted-challenge";

// ─── Helpers ─────────────────────────────────────────────────────────────────
function getEarnedPoints(s: number): number {
  const pts = [0, 0, 0, 0, 1, 2, 3, 5, 7, 9, 10];
  return pts[s] ?? 0;
}

function renderHtml(html: string) {
  return html
    .replace(/class=bemba_text/g, 'style="color:aqua;font-weight:bold;font-size:1.2em"')
    .replace(/class=in_english/g, 'style="margin-top:8px;color:rgba(255,255,255,0.7)"')
    .replace(/class=in_bemba/g, 'style="margin-top:4px;color:rgba(255,255,255,0.6)"');
}

function InlineTranslationPair({ source, target }: { source: string; target: string }) {
  return (
    <div className="text-lg font-semibold text-white sm:text-xl">
      <span className="capitalize text-white">{source}</span>
      <span className="px-2 text-white/45">:</span>
      <span className="capitalize text-cyan-300">{target}</span>
    </div>
  );
}

function speak(text: string) {
  if ("speechSynthesis" in window) {
    const u = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(u);
  }
}

function Avatar({ src, size = 32 }: { src: string | null; size?: number }) {
  return (
    <Image
      src={src && src !== "" ? src : "/files/default-avatar.svg"}
      alt="avatar"
      width={size}
      height={size}
      className="rounded-full object-cover"
      style={{ width: size, height: size, minWidth: size }}
    />
  );
}

function LanguagePicker({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState("");
  const rootRef = useRef<HTMLDivElement | null>(null);

  const selectedLabel = getDictionaryLanguageLabel(value);
  const filteredLanguages = useMemo(() => {
    const query = filter.trim().toLowerCase();
    if (!query) return DICTIONARY_LANGUAGES;
    return DICTIONARY_LANGUAGES.filter((language) =>
      language.label.toLowerCase().includes(query) || language.code.toLowerCase().includes(query),
    );
  }, [filter]);

  useEffect(() => {
    if (!open) return;
    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [open]);

  return (
    <div ref={rootRef} className="relative grid min-w-0 gap-1 text-xs text-white/50">
      <span>{label}</span>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="sage-input flex min-w-0 items-center justify-between gap-2 rounded py-2 text-left text-sm text-white"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="truncate">{selectedLabel}</span>
        <i className={`fas ${open ? "fa-chevron-up" : "fa-chevron-down"} text-[10px] text-white/45`} />
      </button>
      {open && (
        <div className="absolute left-0 right-0 top-full z-30 mt-2 overflow-hidden rounded-xl border border-cyan-400/25 bg-[#07131a] shadow-[0_24px_60px_rgba(0,0,0,0.55)]">
          <div className="border-b border-white/10 p-2">
            <div className="relative">
              <i className="fas fa-search pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[11px] text-white/35" />
              <input
                type="text"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                placeholder="Search language..."
                className="w-full rounded-lg border border-white/12 bg-black/35 py-2 pl-8 pr-3 text-sm text-white outline-none placeholder:text-white/25 focus:border-cyan-400/35"
                autoFocus
              />
            </div>
          </div>
          <div className="max-h-64 overflow-y-auto py-1">
            {filteredLanguages.length === 0 ? (
              <div className="px-3 py-3 text-sm text-white/40">No language found</div>
            ) : (
              filteredLanguages.map((language) => {
                const active = language.code === value;
                return (
                  <button
                    key={language.code}
                    type="button"
                    onClick={() => {
                      onChange(language.code);
                      setOpen(false);
                      setFilter("");
                    }}
                    className={`flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm transition-colors ${
                      active ? "bg-cyan-400/14 text-cyan-200" : "text-white hover:bg-white/8"
                    }`}
                    role="option"
                    aria-selected={active}
                  >
                    <span className="truncate">{language.label}</span>
                    <span className="shrink-0 text-[11px] uppercase tracking-wide text-white/45">{language.code}</span>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function LanguageSelectors({
  sourceLang,
  targetLang,
  onSourceChange,
  onTargetChange,
  onSwap,
}: {
  sourceLang: string;
  targetLang: string;
  onSourceChange: (value: string) => void;
  onTargetChange: (value: string) => void;
  onSwap: () => void;
}) {
  return (
    <div className="mb-4 grid grid-cols-[1fr_auto_1fr] items-end gap-2 rounded border border-white/10 bg-black/10 p-3">
      <LanguagePicker label="From" value={sourceLang} onChange={onSourceChange} />
      <button
        type="button"
        onClick={onSwap}
        className="inline-flex h-10 items-center justify-center rounded border border-cyan-400/30 px-3 text-cyan-400 transition-colors hover:bg-cyan-400/10"
        title="Swap languages"
        aria-label="Swap languages"
      >
        <i className="fas fa-exchange-alt" />
      </button>
      <LanguagePicker label="To" value={targetLang} onChange={onTargetChange} />
    </div>
  );
}

function ExamplePanel({
  sourceLabel,
  targetLabel,
  examples,
  loading,
}: {
  sourceLabel: string;
  targetLabel: string;
  examples: GeneratedExample[];
  loading: boolean;
}) {
  return (
    <div className="mt-4 rounded border border-white/10 bg-black/10 p-4">
      <div className="mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-white/45">
        <i className={`fas ${loading ? "fa-spinner fa-spin" : "fa-sparkles"}`} />
        AI-generated examples
      </div>
      {loading ? (
        <div className="text-sm text-white/50">Generating fresh examples...</div>
      ) : examples.length === 0 ? (
        <div className="text-sm text-white/40">Examples will appear here for the current translation.</div>
      ) : (
        <div className="space-y-3">
          {examples.map((example, index) => (
            <div key={index} className="rounded border border-white/10 bg-white/5 p-3">
              <div className="text-xs uppercase tracking-wide text-white/35">{sourceLabel}</div>
              <div className="mt-1 text-sm text-white/85">{example.source}</div>
              <div className="mt-3 text-xs uppercase tracking-wide text-white/35">{targetLabel}</div>
              <div className="mt-1 text-sm text-cyan-300">{example.target}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── QuizRunner ───────────────────────────────────────────────────────────────
interface QuizRunnerProps {
  questions: QuizQuestion[];
  mode: QuizMode;
  challengeData?: { challengeId: string; senderScore: number; senderUsername: string };
  challengeTarget?: { id: string; username: string };
  onComplete: (score: number, questions: QuizQuestion[]) => void;
}

function QuizRunner({ questions, mode, challengeData, challengeTarget, onComplete }: QuizRunnerProps) {
  const [qIndex, setQIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [chosen, setChosen] = useState<string | null>(null);
  const [timer, setTimer] = useState(15);
  const [started, setStarted] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const scoreRef = useRef(0);

  const startTimer = useCallback(() => {
    setTimer(15);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimer((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current!);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  }, []);

  // Auto-advance on timeout
  useEffect(() => {
    if (!started) return;
    if (timer === 0 && chosen === null) {
      handleAdvance(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timer]);

  useEffect(() => {
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const handleAdvance = (answer: string | null) => {
    if (timerRef.current) clearInterval(timerRef.current);
    const display = answer ?? "__timeout__";
    setChosen(display);
    const correct = questions[qIndex]?.correct;
    let newScore = scoreRef.current;
    if (answer && answer === correct) {
      newScore = scoreRef.current + 1;
      scoreRef.current = newScore;
      setScore(newScore);
    }
    setTimeout(() => {
      const next = qIndex + 1;
      if (next >= questions.length) {
        onComplete(newScore, questions);
      } else {
        setQIndex(next);
        setChosen(null);
        startTimer();
      }
    }, 1200);
  };

  const handleAnswer = (option: string) => {
    if (chosen !== null) return;
    if (timerRef.current) clearInterval(timerRef.current);
    handleAdvance(option);
  };

  const beginQuiz = () => {
    setStarted(true);
    setQIndex(0);
    setScore(0);
    scoreRef.current = 0;
    setChosen(null);
    startTimer();
  };

  const q = questions[qIndex];

  if (!started) {
    return (
      <div style={{ background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.1)", padding: "16px", borderRadius: "4px" }}>
        {mode === "challenge-friend" && challengeTarget && (
          <div className="mb-3 p-2 rounded text-sm text-cyan-300" style={{ background: "rgba(0,200,200,0.08)", border: "1px solid rgba(0,200,200,0.2)" }}>
            You are challenging <strong>{challengeTarget.username}</strong>! Take this quiz and we&apos;ll send them your score.
          </div>
        )}
        {mode === "accepted-challenge" && challengeData && (
          <div className="mb-3 p-2 rounded text-sm text-yellow-300" style={{ background: "rgba(255,200,0,0.08)", border: "1px solid rgba(255,200,0,0.2)" }}>
            <strong>{challengeData.senderUsername}</strong> challenged you! They scored <strong>{challengeData.senderScore}/10</strong>. Beat them to win 20 points!
          </div>
        )}
        {mode === "solo" && (
          <div className="mb-3 text-sm text-white/80">
            Welcome to the quiz. You will translate between the selected languages in both directions. Note the following before starting:
          </div>
        )}
        <ul className="text-sm text-white/60 space-y-1 mb-4 list-disc list-inside">
          <li>The quiz has ten (10) multiple choice questions.</li>
          <li>You will earn 10 points when you get all questions correct.</li>
          <li>You will only begin to earn points when you have at least 40% and above.</li>
        </ul>
        <button onClick={beginQuiz} className="btn-sage px-8">Start now</button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-white/60">
          <span className="text-cyan-400 font-bold">{qIndex + 1}</span> / {questions.length}
        </span>
        <div className={`text-sm font-bold ${timer <= 5 ? "text-red-400" : "text-cyan-400"}`}>
          Next &gt; 00:{String(timer).padStart(2, "0")}sec
        </div>
      </div>
      <div className="mb-4 p-3 rounded text-center" style={{ background: "rgba(0,0,0,0.2)" }}>
        <p className="text-white/60 text-sm">What is the translation of</p>
        <p className="text-2xl font-bold text-white capitalize mt-1">{q?.word}</p>
      </div>
      <ol className="space-y-2" style={{ listStyleType: "upper-alpha", paddingLeft: "1.5rem" }}>
        {q?.options.map((opt, i) => {
          let bg = "rgba(255,255,255,0.05)";
          let color = "white";
          if (chosen !== null) {
            if (opt === q.correct) { bg = "#084"; color = "white"; }
            else if (opt === chosen) { bg = "crimson"; color = "white"; }
          }
          return (
            <li key={i}>
              <button
                onClick={() => handleAnswer(opt)}
                disabled={chosen !== null}
                className="w-full text-left px-4 py-3 rounded text-sm transition-all cursor-pointer"
                style={{ background: bg, color, border: "1px solid rgba(255,255,255,0.1)" }}
              >
                {opt}
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
type Tab = "translate" | "quiz" | "challenge" | "my-challenges" | "leaderboard" | "wotd" | "random";

export default function DictionaryPage() {
  const [tab, setTab] = useState<Tab>("translate");
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);

  // ── Translate state
  const [wordList, setWordList] = useState<DictEntry[]>([]);
  const [wordListPage, setWordListPage] = useState(0);
  const [wordListTotal, setWordListTotal] = useState(0);
  const [wordListPages, setWordListPages] = useState(0);
  const [loadingWords, setLoadingWords] = useState(false);
  const [search, setSearch] = useState("");
  const [suggestions, setSuggestions] = useState<DictEntry[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selected, setSelected] = useState<DictEntry | null>(null);
  const [searching, setSearching] = useState(false);
  const [searchSubmitted, setSearchSubmitted] = useState(false);
  const [sourceLang, setSourceLang] = useState(DEFAULT_SOURCE_LANGUAGE);
  const [targetLang, setTargetLang] = useState(DEFAULT_TARGET_LANGUAGE);
  const [generatedExamples, setGeneratedExamples] = useState<GeneratedExample[]>([]);
  const [loadingExamples, setLoadingExamples] = useState(false);

  // ── Quiz state
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [loadingQuiz, setLoadingQuiz] = useState(false);
  const [quizActive, setQuizActive] = useState(false);
  const [quizDone, setQuizDone] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [finalQuestions, setFinalQuestions] = useState<QuizQuestion[]>([]);
  const [pointsSaved, setPointsSaved] = useState(false);
  const [savingPoints, setSavingPoints] = useState(false);

  // ── Challenge state
  const [challengeUsers, setChallengeUsers] = useState<ChallengeUser[]>([]);
  const [challengeSearch, setChallengeSearch] = useState("");
  const [loadingChallengeUsers, setLoadingChallengeUsers] = useState(false);
  const challengeSearchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [challengeTarget, setChallengeTarget] = useState<ChallengeUser | null>(null);
  const [challengeQs, setChallengeQs] = useState<QuizQuestion[]>([]);
  const [challengeQuizActive, setChallengeQuizActive] = useState(false);
  const [challengeQuizDone, setChallengeQuizDone] = useState(false);
  const [challengeSent, setChallengeSent] = useState(false);
  const [sendingChallenge, setSendingChallenge] = useState(false);
  // When user finishes solo quiz and clicks "Challenge a Friend"
  const [pendingChallengeQs, setPendingChallengeQs] = useState<QuizQuestion[] | null>(null);

  // ── My Challenges state
  const [incomingChallenges, setIncomingChallenges] = useState<IncomingChallenge[]>([]);
  const [loadingChallenges, setLoadingChallenges] = useState(false);
  const [challengeBadge, setChallengeBadge] = useState(0);
  const [acceptedChallenge, setAcceptedChallenge] = useState<IncomingChallenge | null>(null);
  const [acceptedQuizActive, setAcceptedQuizActive] = useState(false);
  const [acceptedQuizDone, setAcceptedQuizDone] = useState(false);
  const [acceptedResult, setAcceptedResult] = useState<{ result: string; receiverPoints: number; receiverScore: number } | null>(null);

  // ── Leaderboard state
  const [leaders, setLeaders] = useState<Leader[]>([]);
  const [loadingLeaders, setLoadingLeaders] = useState(false);

  // ── Word of Day state
  const [wotd, setWotd] = useState<DictEntry | null>(null);
  const [randomEntry, setRandomEntry] = useState<DictEntry | null>(null);
  const [currentEntry, setCurrentEntry] = useState<DictEntry | null>(null);
  const [entryHistory, setEntryHistory] = useState<DictEntry[]>([]);
  const [historyCursor, setHistoryCursor] = useState(-1);
  const [speaking, setSpeaking] = useState(false);

  // ── On mount
  useEffect(() => {
    fetch(`/api/dictionary/word-of-the-day?from=${encodeURIComponent(sourceLang)}&to=${encodeURIComponent(targetLang)}`).then(r => r.json()).then(d => setWotd(d));
    fetch("/api/dictionary/challenges/count").then(r => r.json()).then(d => setChallengeBadge(d.count ?? 0));
    loadWordListPage(0, sourceLang, targetLang);
  }, [sourceLang, targetLang]);

  useEffect(() => {
    setSelected(null);
    setSuggestions([]);
    setSearch("");
    setCurrentEntry(null);
    setEntryHistory([]);
    setHistoryCursor(-1);
    setRandomEntry(null);
    setGeneratedExamples([]);
    setSearchSubmitted(false);
    fetch(`/api/dictionary/word-of-the-day?from=${encodeURIComponent(sourceLang)}&to=${encodeURIComponent(targetLang)}`).then(r => r.json()).then(d => setWotd(d));
    loadWordListPage(0, sourceLang, targetLang);
  }, [sourceLang, targetLang]);

  useEffect(() => {
    return () => {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // ── Load word list page
  const loadWordListPage = async (page: number, from = sourceLang, to = targetLang) => {
    setLoadingWords(true);
    const res = await fetch(`/api/dictionary/words?page=${page}&from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`);
    const data = await res.json();
    setWordList(data.words ?? []);
    setWordListTotal(data.total ?? 0);
    setWordListPages(data.pages ?? 0);
    setWordListPage(page);
    setLoadingWords(false);
  };

  // ── Translate search
  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      setSearchSubmitted(false);
      return;
    }
    setSearching(true);
    const res = await fetch(`/api/dictionary/search?q=${encodeURIComponent(q)}&from=${encodeURIComponent(sourceLang)}&to=${encodeURIComponent(targetLang)}`);
    const data = await res.json();
    setSuggestions(data.results ?? []);
    setShowSuggestions(true);
    setSearching(false);
  }, [sourceLang, targetLang]);

  const handleSearchSubmit = () => {
    if (!search.trim()) {
      setSearchSubmitted(false);
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    setSelected(null);
    setSearchSubmitted(true);
    void doSearch(search);
  };

  const selectWord = (entry: DictEntry) => {
    setSelected(entry);
    setSearch("");
    setShowSuggestions(false);
    setSearchSubmitted(false);
    setCurrentEntry(entry);
    setEntryHistory((prev) => {
      const next = [...prev.slice(0, historyCursor + 1), entry];
      setHistoryCursor(next.length - 1);
      return next;
    });
  };

  const fetchRandomWord = useCallback(async () => {
    const totalPages = wordListPages > 0 ? wordListPages : 1;
    const randomPage = Math.floor(Math.random() * totalPages);
    const res = await fetch(`/api/dictionary/words?page=${randomPage}&from=${encodeURIComponent(sourceLang)}&to=${encodeURIComponent(targetLang)}`);
    const data = await res.json();
    const words = (data.words ?? []) as DictEntry[];
    if (words.length === 0) return null;
    return words[Math.floor(Math.random() * words.length)] ?? null;
  }, [sourceLang, targetLang, wordListPages]);

  const loadRandomWord = useCallback(async () => {
    const word = await fetchRandomWord();
    if (!word) return;
    setRandomEntry(word);
  }, [fetchRandomWord]);

  const loadNextHomeEntry = useCallback(async () => {
    const entry = await fetchRandomWord();
    if (!entry) return;
    setCurrentEntry(entry);
    setEntryHistory((prev) => {
      const next = [...prev.slice(0, historyCursor + 1), entry];
      setHistoryCursor(next.length - 1);
      return next;
    });
  }, [fetchRandomWord, historyCursor]);

  const goPrevEntry = useCallback(() => {
    if (historyCursor <= 0) return;
    const nextCursor = historyCursor - 1;
    setHistoryCursor(nextCursor);
    setCurrentEntry(entryHistory[nextCursor] ?? null);
    window.speechSynthesis.cancel();
    setSpeaking(false);
  }, [entryHistory, historyCursor]);

  const toggleSpeak = useCallback(() => {
    if (!currentEntry || !("speechSynthesis" in window)) return;
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(`${currentEntry.word}. ${currentEntry.bemba}`);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    setSpeaking(true);
    window.speechSynthesis.speak(utterance);
  }, [currentEntry, speaking]);

  const shareDictionary = useCallback(async () => {
    const shareData = {
      title: "SageTech Dictionary",
      text: `Translate between ${getDictionaryLanguageLabel(sourceLang)} and ${getDictionaryLanguageLabel(targetLang)}, practice with quizzes, and challenge friends.`,
      url: `${window.location.origin}/dictionary`,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        return;
      }

      await navigator.clipboard.writeText(shareData.url);
    } catch {
      // Ignore cancelled share flows.
    }
  }, [sourceLang, targetLang]);

  const switchTab = useCallback((nextTab: Tab) => {
    setTab(nextTab);
    setMoreMenuOpen(false);
  }, []);

  useEffect(() => {
    if (!currentEntry) {
      loadNextHomeEntry();
    }
  }, [currentEntry, loadNextHomeEntry]);

  // ── Quiz tab
  const loadAndStartQuiz = async () => {
    setLoadingQuiz(true);
    const res = await fetch(`/api/dictionary/quiz?from=${encodeURIComponent(sourceLang)}&to=${encodeURIComponent(targetLang)}`);
    const data = await res.json();
    setQuizQuestions(data.questions ?? []);
    setQuizActive(true);
    setQuizDone(false);
    setPointsSaved(false);
    setLoadingQuiz(false);
  };

  const handleQuizComplete = async (score: number, qs: QuizQuestion[]) => {
    setFinalScore(score);
    setFinalQuestions(qs);
    setQuizActive(false);
    setQuizDone(true);
    // Save points
    const pts = getEarnedPoints(score);
    if (pts > 0) {
      setSavingPoints(true);
      try {
        await fetch("/api/dictionary/quiz/save-points", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ points: pts }),
        });
        setPointsSaved(true);
      } catch { /* ignore */ }
      setSavingPoints(false);
    }
  };

  const resetQuiz = () => {
    setQuizActive(false);
    setQuizDone(false);
    setFinalScore(0);
    setFinalQuestions([]);
    setPointsSaved(false);
  };

  // ── Challenge tab — load users
  const loadChallengeUsers = useCallback(async (q: string) => {
    setLoadingChallengeUsers(true);
    const url = q ? `/api/dictionary/challenge-users?q=${encodeURIComponent(q)}` : "/api/dictionary/challenge-users";
    const res = await fetch(url);
    const data = await res.json();
    setChallengeUsers(data.users ?? []);
    setLoadingChallengeUsers(false);
  }, []);

  useEffect(() => {
    if (tab === "challenge" && !challengeTarget) {
      loadChallengeUsers("");
    }
  }, [tab, challengeTarget, loadChallengeUsers]);

  const handleChallengeSearchChange = (val: string) => {
    setChallengeSearch(val);
    if (challengeSearchTimeout.current) clearTimeout(challengeSearchTimeout.current);
    challengeSearchTimeout.current = setTimeout(() => loadChallengeUsers(val), 300);
  };

  const startChallengeQuiz = async (user: ChallengeUser) => {
    setChallengeTarget(user);
    setChallengeQuizDone(false);
    setChallengeSent(false);
    // Use pending questions from solo quiz if available, else fetch fresh
    if (pendingChallengeQs) {
      setChallengeQs(pendingChallengeQs);
      setPendingChallengeQs(null);
    } else {
      const res = await fetch(`/api/dictionary/quiz?from=${encodeURIComponent(sourceLang)}&to=${encodeURIComponent(targetLang)}`);
      const data = await res.json();
      setChallengeQs(data.questions ?? []);
    }
    setChallengeQuizActive(true);
  };

  const handleChallengeQuizComplete = async (score: number, qs: QuizQuestion[]) => {
    setChallengeQuizActive(false);
    setChallengeQuizDone(true);
    if (!challengeTarget) return;
    setSendingChallenge(true);
    try {
      await fetch("/api/dictionary/challenge/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receiverId: challengeTarget.id, questions: qs, senderScore: score }),
      });
      setChallengeSent(true);
    } catch { /* ignore */ }
    setSendingChallenge(false);
  };

  const resetChallenge = () => {
    setChallengeTarget(null);
    setChallengeQs([]);
    setChallengeQuizActive(false);
    setChallengeQuizDone(false);
    setChallengeSent(false);
    setPendingChallengeQs(null);
  };

  // ── My Challenges tab
  const loadChallenges = useCallback(async () => {
    setLoadingChallenges(true);
    const res = await fetch("/api/dictionary/challenges");
    const data = await res.json();
    setIncomingChallenges(data.challenges ?? []);
    setLoadingChallenges(false);
    // Update badge
    const pending = (data.challenges ?? []).filter((c: IncomingChallenge) => c.status === "pending").length;
    setChallengeBadge(pending);
  }, []);

  useEffect(() => {
    if (tab === "my-challenges") loadChallenges();
  }, [tab, loadChallenges]);

  useEffect(() => {
    const activeTerm =
      tab === "translate"
        ? (selected?.word || currentEntry?.word)
        : tab === "wotd"
          ? wotd?.word
          : tab === "random"
            ? randomEntry?.word
            : null;
    if (!activeTerm) {
      setGeneratedExamples([]);
      return;
    }
    setLoadingExamples(true);
    fetch(`/api/dictionary/examples?term=${encodeURIComponent(activeTerm)}&from=${encodeURIComponent(sourceLang)}&to=${encodeURIComponent(targetLang)}`)
      .then((r) => r.json())
      .then((d) => setGeneratedExamples(d.examples ?? []))
      .finally(() => setLoadingExamples(false));
  }, [selected?.word, currentEntry?.word, wotd?.word, randomEntry?.word, sourceLang, targetLang, tab]);

  const declineChallenge = async (id: string) => {
    await fetch(`/api/dictionary/challenges/${id}/decline`, { method: "POST" });
    setIncomingChallenges(prev => prev.filter(c => c.id !== id));
    setChallengeBadge(b => Math.max(0, b - 1));
  };

  const acceptChallenge = (ch: IncomingChallenge) => {
    setAcceptedChallenge(ch);
    setAcceptedQuizDone(false);
    setAcceptedResult(null);
    setAcceptedQuizActive(true);
  };

  const handleAcceptedQuizComplete = async (score: number) => {
    setAcceptedQuizActive(false);
    if (!acceptedChallenge) return;
    const res = await fetch(`/api/dictionary/challenges/${acceptedChallenge.id}/complete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ receiverScore: score }),
    });
    const data = await res.json();
    setAcceptedResult({ result: data.result, receiverPoints: data.receiverPoints ?? 0, receiverScore: score });
    setAcceptedQuizDone(true);
    // Remove from list
    setIncomingChallenges(prev => prev.filter(c => c.id !== acceptedChallenge.id));
    setChallengeBadge(b => Math.max(0, b - 1));
  };

  const resetAccepted = () => {
    setAcceptedChallenge(null);
    setAcceptedQuizActive(false);
    setAcceptedQuizDone(false);
    setAcceptedResult(null);
  };

  // ── Leaderboard tab
  useEffect(() => {
    if (tab === "leaderboard") {
      setLoadingLeaders(true);
      fetch("/api/dictionary/leaderboard").then(r => r.json()).then(d => {
        setLeaders(d.leaders ?? []);
        setLoadingLeaders(false);
      });
    }
  }, [tab]);

  // ── Tab labels
  return (
    <div>
      <div className="mb-4 overflow-visible rounded border border-white/10 bg-white/5">
        <div className="flex items-center justify-between gap-2 border-b border-white/10 px-3 py-3">
          <h1 className="text-base font-bold text-white">All Languages dictionary</h1>
          <div className="flex items-center gap-1 text-xs">
            <button
              type="button"
              onClick={() => switchTab("translate")}
              className={`rounded px-2.5 py-1.5 transition-colors ${tab === "translate" ? "bg-cyan-400/15 text-cyan-400" : "text-white/65 hover:text-white"}`}
            >
              Home
            </button>
            <button
              type="button"
              onClick={() => switchTab("quiz")}
              className={`rounded px-2.5 py-1.5 transition-colors ${tab === "quiz" ? "bg-cyan-400/15 text-cyan-400" : "text-white/65 hover:text-white"}`}
            >
              Quiz
            </button>
            <button
              type="button"
              title="Challenge a Friend"
              onClick={() => switchTab("challenge")}
              className={`relative rounded px-2.5 py-1.5 transition-colors ${tab === "challenge" ? "bg-cyan-400/15 text-cyan-400" : "text-white/65 hover:text-white"}`}
            >
              <i className="fas fa-users" />
            </button>
            <button
              type="button"
              title="Quiz Challenges"
              onClick={() => switchTab("my-challenges")}
              className={`relative rounded px-2.5 py-1.5 transition-colors ${tab === "my-challenges" ? "bg-cyan-400/15 text-cyan-400" : "text-white/65 hover:text-white"}`}
            >
              <i className="fas fa-fighter-jet" />
              {challengeBadge > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] leading-none text-white">
                  {challengeBadge}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => setMoreMenuOpen((current) => !current)}
              className={`rounded px-2.5 py-1.5 transition-colors ${moreMenuOpen ? "bg-cyan-400/15 text-cyan-400" : "text-white/65 hover:text-white"}`}
            >
              <i className="fas fa-align-justify" />
            </button>
          </div>
        </div>

        <div className="relative p-3">
          <LanguageSelectors
            sourceLang={sourceLang}
            targetLang={targetLang}
            onSourceChange={setSourceLang}
            onTargetChange={setTargetLang}
            onSwap={() => {
              setSourceLang(targetLang);
              setTargetLang(sourceLang);
            }}
          />
          <div className="flex items-center gap-2">
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  const value = e.target.value;
                  setSearch(value);
                  if (!value.trim()) {
                    setSuggestions([]);
                    setShowSuggestions(false);
                    setSearchSubmitted(false);
                  }
                }}
                onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSearchSubmit();
                }
              }}
              placeholder={`Search words in ${getDictionaryLanguageLabel(sourceLang)}...`}
              className="sage-input min-w-0 flex-1 rounded-full py-2 text-sm"
              style={{ color: "aqua" }}
            />
            <button
              type="button"
              onClick={handleSearchSubmit}
              disabled={!search.trim() || searching}
              className="inline-flex h-10 shrink-0 items-center justify-center rounded-full border border-cyan-400/35 px-4 text-sm text-cyan-300 transition-colors hover:bg-cyan-400/10 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {searching ? <i className="fas fa-spinner fa-spin" /> : "Search"}
            </button>
          </div>
          {showSuggestions && suggestions.length > 0 && (
            <ul className="absolute left-3 right-3 top-[calc(100%-2px)] z-50 max-h-[300px] overflow-y-auto rounded-b-xl border border-white/10 border-t-0" style={{ background: "#123" }}>
              {suggestions.map((s, i) => (
                <li
                  key={i}
                  onClick={() => selectWord(s)}
                  className="cursor-pointer border-b border-white/10 px-4 py-3 text-sm capitalize transition-colors hover:text-cyan-400"
                  style={{ color: "lightblue" }}
                >
                  <span className="font-medium">{s.word}</span>
                  {s.bemba && <span className="ml-2 text-xs text-white/40">- {s.bemba}</span>}
                </li>
              ))}
            </ul>
          )}
        </div>

        {moreMenuOpen && (
          <div className="grid gap-1 border-t border-white/10 bg-black/10 p-2 text-sm">
            <button type="button" onClick={() => switchTab("challenge")} className="flex items-center gap-3 rounded px-3 py-2 text-left text-white/70 transition-colors hover:bg-white/5 hover:text-cyan-400">
              <i className="fas fa-users w-4 text-center" />
              Challenge a Friend
            </button>
            <button type="button" onClick={() => switchTab("my-challenges")} className="flex items-center gap-3 rounded px-3 py-2 text-left text-white/70 transition-colors hover:bg-white/5 hover:text-cyan-400">
              <i className="fas fa-fighter-jet w-4 text-center" />
              Quiz Challenges
            </button>
            <button type="button" onClick={() => switchTab("wotd")} className="flex items-center gap-3 rounded px-3 py-2 text-left text-white/70 transition-colors hover:bg-white/5 hover:text-cyan-400">
              <i className="fas fa-edit w-4 text-center" />
              Word of the Day
            </button>
            <button
              type="button"
              onClick={async () => {
                await loadRandomWord();
                switchTab("random");
              }}
              className="flex items-center gap-3 rounded px-3 py-2 text-left text-white/70 transition-colors hover:bg-white/5 hover:text-cyan-400"
            >
              <i className="fas fa-random w-4 text-center" />
              Randomise Words
            </button>
            <button type="button" onClick={() => switchTab("leaderboard")} className="flex items-center gap-3 rounded px-3 py-2 text-left text-white/70 transition-colors hover:bg-white/5 hover:text-cyan-400">
              <i className="fas fa-trophy w-4 text-center" />
              Leaderboard
            </button>
            <button type="button" onClick={shareDictionary} className="flex items-center gap-3 rounded px-3 py-2 text-left text-white/70 transition-colors hover:bg-white/5 hover:text-cyan-400">
              <i className="fas fa-share w-4 text-center" />
              Invite Friends
            </button>
          </div>
        )}
      </div>

      {/* ── TRANSLATE TAB ── */}
      {tab === "translate" && (
        <div>
          {/* Selected word detail */}
          {selected ? (
            <div>
              <button onClick={() => { setSelected(null); setSearch(""); setSuggestions([]); setSearchSubmitted(false); }} className="text-xs text-cyan-400 mb-3 hover:underline">
                <i className="fas fa-arrow-left mr-1" />Back to list
              </button>
              <div className="p-4 rounded" style={{ background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.1)" }}>
                <div className="flex items-start justify-between mb-2">
                  <InlineTranslationPair source={selected.word} target={selected.bemba} />
                  <button onClick={() => speak(selected.bemba)} className="text-white/50 hover:text-cyan-400 transition-colors" title="Pronounce">
                    <i className="fas fa-volume-up" />
                  </button>
                </div>
                <ExamplePanel
                  sourceLabel={getDictionaryLanguageLabel(sourceLang)}
                  targetLabel={getDictionaryLanguageLabel(targetLang)}
                  examples={generatedExamples}
                  loading={loadingExamples}
                />
              </div>
            </div>
          ) : (
            <>
              {searchSubmitted && searching && (
                <div className="rounded border border-white/10 p-4 text-center text-white/55" style={{ background: "rgba(0,0,0,0.14)" }}>
                  <i className="fas fa-spinner fa-spin mr-2 text-cyan-400" />
                  Translating..
                </div>
              )}
              {/* Word list */}
              {!searchSubmitted && (
                <>
                  <div className="rounded border border-white/10 p-4" style={{ background: "rgba(0,0,0,0.14)" }}>
                    {currentEntry ? (
                      <div>
                        <div className="rounded px-4 py-4" style={{ background: "rgba(255,255,255,0.03)" }}>
                          <InlineTranslationPair source={currentEntry.word} target={currentEntry.bemba} />
                          <ExamplePanel
                            sourceLabel={getDictionaryLanguageLabel(sourceLang)}
                            targetLabel={getDictionaryLanguageLabel(targetLang)}
                            examples={generatedExamples}
                            loading={loadingExamples}
                          />
                        </div>

                        <div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                          <div className="text-left">
                            <button
                              onClick={goPrevEntry}
                              disabled={historyCursor <= 0}
                              className="rounded border border-white/20 px-4 py-2 text-sm text-white/70 transition-colors hover:border-cyan-400 hover:text-cyan-400 disabled:cursor-not-allowed disabled:opacity-30"
                            >
                              &lt;&lt; prev
                            </button>
                          </div>
                          <div className="flex items-center gap-2 rounded border border-white/10 px-3 py-2">
                            <span className="text-xs text-white/40">{speaking ? "playing..." : "wait.."}</span>
                            <button
                              onClick={toggleSpeak}
                              className="text-cyan-400 transition-colors hover:text-cyan-300"
                              aria-label={speaking ? "Pause audio" : "Play audio"}
                            >
                              <i className={`fas ${speaking ? "fa-pause" : "fa-play"}`} />
                            </button>
                          </div>
                          <div className="text-right">
                            <button
                              onClick={loadNextHomeEntry}
                              className="rounded border border-white/20 px-4 py-2 text-sm text-white/70 transition-colors hover:border-cyan-400 hover:text-cyan-400"
                            >
                              next &gt;&gt;
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="py-8 text-center text-white/40">
                        <i className="fas fa-spinner fa-spin mr-2" />
                        Loading words...
                      </div>
                    )}
                  </div>

                </>
              )}
            </>
          )}
        </div>
      )}

      {/* ── QUIZ TAB ── */}
      {tab === "quiz" && (
        <div>
          {!quizActive && !quizDone && (
            <div style={{ background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.1)", padding: "16px", borderRadius: "4px" }}>
              <div className="mb-3 text-sm text-white/80">
                Welcome to the quiz. You will translate between {getDictionaryLanguageLabel(sourceLang)} and {getDictionaryLanguageLabel(targetLang)} in both directions. Note the following before starting:
              </div>
              <ul className="text-sm text-white/60 space-y-1 mb-4 list-disc list-inside">
                <li>The quiz has ten (10) multiple choice questions.</li>
                <li>You will earn 10 points when you get all questions correct.</li>
                <li>You will only begin to earn points when you have at least 40% and above.</li>
              </ul>
              <button onClick={loadAndStartQuiz} disabled={loadingQuiz} className="btn-sage px-8">
                {loadingQuiz ? <><i className="fas fa-spinner fa-spin mr-2" />Loading...</> : "Start now"}
              </button>
            </div>
          )}

          {quizActive && quizQuestions.length > 0 && (
            <QuizRunner
              questions={quizQuestions}
              mode="solo"
              onComplete={handleQuizComplete}
            />
          )}

          {quizDone && (
            <div className="text-center py-6" style={{ background: "rgba(0,0,0,0.2)", padding: "24px", borderRadius: "4px" }}>
              <h2 className="text-xl font-bold text-white mb-2">The Quiz is over!</h2>
              <p className="text-white/60 text-sm mb-1">
                {finalScore < 4 ? "Sorry 😐," : finalScore <= 7 ? "Nice 😎," : "Congrats! 🎉,"}{" "}You got
              </p>
              <div className="text-5xl font-bold text-cyan-400 my-3">{finalScore}<span className="text-xl text-white/40">/10</span></div>
              <div className="text-lg text-white/70 mb-2">{finalScore * 10}%</div>
              {getEarnedPoints(finalScore) > 0 && (
                <div className="text-sm text-green-400 mb-2">
                  {savingPoints
                    ? <><i className="fas fa-spinner fa-spin mr-1" />Saving points...</>
                    : pointsSaved
                    ? <>You earned <strong>{getEarnedPoints(finalScore)}</strong> point{getEarnedPoints(finalScore) !== 1 ? "s" : ""}! ✓</>
                    : <>You earned <strong>{getEarnedPoints(finalScore)}</strong> point{getEarnedPoints(finalScore) !== 1 ? "s" : ""}!</>
                  }
                </div>
              )}
              <div className="flex gap-3 justify-center flex-wrap mt-4">
                <button onClick={loadAndStartQuiz} className="btn-sage px-6">Play Again</button>
                <button
                  onClick={() => {
                    setPendingChallengeQs(finalQuestions);
                    resetQuiz();
                    setTab("challenge");
                  }}
                  className="px-6 py-2 border border-cyan-400/50 text-cyan-400 rounded-full text-sm hover:bg-cyan-400/10 transition-colors"
                >
                  Challenge a Friend
                </button>
                <button onClick={resetQuiz} className="px-6 py-2 border border-white/30 text-white rounded-full text-sm hover:border-white/60 transition-colors">
                  Back
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── CHALLENGE TAB ── */}
      {tab === "challenge" && (
        <div>
          {/* In quiz flow */}
          {challengeTarget && challengeQuizActive && challengeQs.length > 0 && (
            <div>
              <div className="mb-3 p-2 rounded text-xs text-cyan-300" style={{ background: "rgba(0,200,200,0.08)", border: "1px solid rgba(0,200,200,0.2)" }}>
                Challenging <strong>{challengeTarget.username}</strong>
              </div>
              <QuizRunner
                questions={challengeQs}
                mode="challenge-friend"
                challengeTarget={{ id: challengeTarget.id, username: challengeTarget.username }}
                onComplete={handleChallengeQuizComplete}
              />
            </div>
          )}

          {/* Challenge sent result */}
          {challengeTarget && challengeQuizDone && (
            <div className="text-center py-8" style={{ background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.1)", padding: "24px", borderRadius: "4px" }}>
              {sendingChallenge ? (
                <><i className="fas fa-spinner fa-spin mr-2 text-cyan-400" /><span className="text-white/60">Sending challenge...</span></>
              ) : challengeSent ? (
                <>
                  <div className="text-4xl mb-3">🎯</div>
                  <h3 className="text-lg font-bold text-white mb-1">Challenge Sent!</h3>
                  <p className="text-white/60 text-sm mb-4">Challenge sent to <strong className="text-cyan-400">{challengeTarget.username}</strong>!</p>
                  <button onClick={resetChallenge} className="btn-sage px-6">Challenge Another</button>
                </>
              ) : (
                <p className="text-red-400 text-sm">Failed to send challenge. <button onClick={resetChallenge} className="underline text-cyan-400">Try again</button></p>
              )}
            </div>
          )}

          {/* User picker */}
          {!challengeTarget && (
            <div>
              {pendingChallengeQs && (
                <div className="mb-3 p-2 rounded text-sm text-cyan-300" style={{ background: "rgba(0,200,200,0.08)", border: "1px solid rgba(0,200,200,0.2)" }}>
                  <i className="fas fa-info-circle mr-1" />Pick a user to challenge with your last quiz score.
                  <button onClick={() => setPendingChallengeQs(null)} className="ml-2 text-white/40 hover:text-white text-xs">(clear)</button>
                </div>
              )}
              <div className="relative mb-4">
                <input
                  type="text"
                  value={challengeSearch}
                  onChange={(e) => handleChallengeSearchChange(e.target.value)}
                  placeholder="Search users to challenge..."
                  className="sage-input w-full py-2 rounded-full text-sm px-4"
                />
                {loadingChallengeUsers && <i className="fas fa-spinner fa-spin absolute right-4 top-1/2 -translate-y-1/2 text-white/40 text-xs" />}
              </div>
              {challengeUsers.length === 0 && !loadingChallengeUsers && (
                <p className="text-white/40 text-sm text-center py-4">No users found</p>
              )}
              <ul className="space-y-2">
                {challengeUsers.map((u) => (
                  <li key={u.id} className="flex items-center gap-3 p-3 rounded" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                    <Avatar src={u.picture} size={36} />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-white truncate">{u.username}</div>
                      <div className="text-xs text-white/40 capitalize">{u.level ?? "amateur"} · {u.points ?? "0"} pts</div>
                    </div>
                    <div className="flex items-center gap-2">
                      {u.isOnline && <span className="w-2 h-2 rounded-full bg-green-400 inline-block" title="Online" />}
                      <button onClick={() => startChallengeQuiz(u)} className="btn-sage text-xs px-3 py-1">Challenge</button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* ── MY CHALLENGES TAB ── */}
      {tab === "my-challenges" && (
        <div>
          {/* Accepted challenge quiz */}
          {acceptedChallenge && acceptedQuizActive && (
            <div>
              <div className="mb-3 p-2 rounded text-sm text-yellow-300" style={{ background: "rgba(255,200,0,0.08)", border: "1px solid rgba(255,200,0,0.2)" }}>
                <strong>{acceptedChallenge.senderUsername}</strong> challenged you! They scored <strong>{acceptedChallenge.senderScore}/10</strong>.
              </div>
              <QuizRunner
                questions={JSON.parse(acceptedChallenge.questions) as QuizQuestion[]}
                mode="accepted-challenge"
                challengeData={{
                  challengeId: acceptedChallenge.id,
                  senderScore: acceptedChallenge.senderScore,
                  senderUsername: acceptedChallenge.senderUsername ?? "Someone",
                }}
                onComplete={handleAcceptedQuizComplete}
              />
            </div>
          )}

          {/* Result screen */}
          {acceptedQuizDone && acceptedResult && (
            <div className="text-center py-8" style={{ background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.1)", padding: "24px", borderRadius: "4px" }}>
              {acceptedResult.result === "win" && (
                <>
                  <div className="text-5xl mb-3">🎉</div>
                  <h3 className="text-2xl font-bold text-green-400 mb-1">You Win!</h3>
                  <p className="text-white/60 text-sm mb-1">You scored <strong className="text-white">{acceptedResult.receiverScore}/10</strong> vs their <strong className="text-white">{acceptedChallenge?.senderScore}/10</strong></p>
                  <p className="text-green-400 text-sm">+{acceptedResult.receiverPoints} points added to your profile!</p>
                </>
              )}
              {acceptedResult.result === "draw" && (
                <>
                  <div className="text-5xl mb-3">😎</div>
                  <h3 className="text-2xl font-bold text-cyan-400 mb-1">It&apos;s a Draw!</h3>
                  <p className="text-white/60 text-sm mb-1">Both scored <strong className="text-white">{acceptedResult.receiverScore}/10</strong></p>
                  <p className="text-cyan-400 text-sm">+{acceptedResult.receiverPoints} points each!</p>
                </>
              )}
              {acceptedResult.result === "lose" && (
                <>
                  <div className="text-5xl mb-3">😐</div>
                  <h3 className="text-2xl font-bold text-white/70 mb-1">You Lose</h3>
                  <p className="text-white/60 text-sm mb-1">You scored <strong className="text-white">{acceptedResult.receiverScore}/10</strong> vs their <strong className="text-white">{acceptedChallenge?.senderScore}/10</strong></p>
                  <p className="text-white/40 text-sm">No points this time. Keep practicing!</p>
                </>
              )}
              <button onClick={resetAccepted} className="btn-sage px-6 mt-4">Back to Challenges</button>
            </div>
          )}

          {/* Challenge list */}
          {!acceptedChallenge && !acceptedQuizDone && (
            <>
              {loadingChallenges ? (
                <div className="text-center py-8 text-white/40"><i className="fas fa-spinner fa-spin mr-2" />Loading challenges...</div>
              ) : incomingChallenges.length === 0 ? (
                <div className="text-center py-10 text-white/40">
                  <i className="fas fa-inbox text-2xl mb-3 block" />
                  <p className="text-sm">No incoming challenges</p>
                </div>
              ) : (
                <ul className="space-y-3">
                  {incomingChallenges.map((ch) => (
                    <li key={ch.id} className="p-3 rounded" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                      <div className="flex items-center gap-3 mb-3">
                        <Avatar src={ch.senderPicture} size={36} />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-white">{ch.senderUsername ?? "Unknown"}</div>
                          <div className="text-xs text-white/40">Scored <span className="text-yellow-400 font-bold">{ch.senderScore}/10</span> · {ch.status === "pending" ? <span className="text-cyan-400">Pending</span> : ch.status}</div>
                        </div>
                      </div>
                      {ch.status === "pending" && (
                        <div className="flex gap-2">
                          <button onClick={() => acceptChallenge(ch)} className="btn-sage text-xs px-4 py-1.5 flex-1">Accept</button>
                          <button
                            onClick={() => declineChallenge(ch.id)}
                            className="text-xs px-4 py-1.5 flex-1 rounded border border-white/20 text-white/60 hover:border-red-400 hover:text-red-400 transition-colors"
                          >
                            Decline
                          </button>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </div>
      )}

      {/* ── LEADERBOARD TAB ── */}
      {tab === "leaderboard" && (
        <div>
          <h2 className="text-sm font-semibold text-white/80 mb-3 flex items-center gap-2">
            <i className="fas fa-trophy text-yellow-400" />Top 10 Leaderboard
          </h2>
          {loadingLeaders ? (
            <div className="text-center py-8 text-white/40"><i className="fas fa-spinner fa-spin mr-2" />Loading...</div>
          ) : (
            <ol className="space-y-2">
              {leaders.map((u, i) => (
                <li
                  key={u.id}
                  className="flex items-center gap-3 p-3 rounded"
                  style={{
                    background: i === 0 ? "rgba(255,215,0,0.08)" : i === 1 ? "rgba(192,192,192,0.06)" : i === 2 ? "rgba(205,127,50,0.06)" : "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  <div className="w-7 text-center font-bold text-sm" style={{ color: i === 0 ? "#FFD700" : i === 1 ? "#C0C0C0" : i === 2 ? "#CD7F32" : "rgba(255,255,255,0.4)" }}>
                    {i + 1}
                  </div>
                  <Avatar src={u.picture} size={32} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-white truncate">{u.username}</div>
                    <div className="text-xs text-white/40 capitalize">{u.level ?? "amateur"}</div>
                  </div>
                  <div className="text-sm font-bold text-cyan-400">{u.points ?? "0"} <span className="text-xs text-white/40 font-normal">pts</span></div>
                </li>
              ))}
            </ol>
          )}
        </div>
      )}

      {/* ── WORD OF DAY TAB ── */}
      {tab === "wotd" && (
        <div>
          {wotd ? (
            <div className="p-4 rounded" style={{ background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.1)" }}>
              <p className="text-xs text-white/40 mb-2 italic">
                Word of the day • {getDictionaryLanguageLabel(sourceLang)} to {getDictionaryLanguageLabel(targetLang)}
              </p>
              <div className="flex items-center justify-between mb-3">
                <span className="text-2xl font-bold text-white capitalize">{wotd.word}</span>
                <button onClick={() => speak(wotd.bemba)} className="text-white/50 hover:text-cyan-400 transition-colors">
                  <i className="fas fa-volume-up" />
                </button>
              </div>
              <div
                className="text-sm leading-relaxed"
                style={{ color: "rgba(255,255,255,0.85)", lineHeight: "26px", fontSize: "16px" }}
                dangerouslySetInnerHTML={{ __html: renderHtml(wotd.html) }}
              />
              <ExamplePanel
                sourceLabel={getDictionaryLanguageLabel(sourceLang)}
                targetLabel={getDictionaryLanguageLabel(targetLang)}
                examples={generatedExamples}
                loading={loadingExamples}
              />
            </div>
          ) : (
            <div className="text-center py-8 text-white/40">
              <i className="fas fa-spinner fa-spin mr-2" />Loading...
            </div>
          )}
        </div>
      )}

      {tab === "random" && (
        <div>
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="text-sm text-white/60">
              Keep clicking below to randomise words. They will keep appearing here.
            </p>
            <button onClick={loadRandomWord} className="btn-sage px-5 py-2 text-xs">
              Randomise
            </button>
          </div>
          {randomEntry ? (
            <div className="p-4 rounded" style={{ background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.1)" }}>
              <div className="flex items-start justify-between mb-2">
                <span className="text-xl font-bold text-white capitalize">{randomEntry.word}</span>
                <button onClick={() => speak(randomEntry.bemba)} className="text-white/50 hover:text-cyan-400 transition-colors" title="Pronounce">
                  <i className="fas fa-volume-up" />
                </button>
              </div>
              <div
                className="text-sm leading-relaxed"
                style={{ color: "rgba(255,255,255,0.85)", lineHeight: "26px", fontSize: "16px" }}
                dangerouslySetInnerHTML={{ __html: renderHtml(randomEntry.html) }}
              />
              <ExamplePanel
                sourceLabel={getDictionaryLanguageLabel(sourceLang)}
                targetLabel={getDictionaryLanguageLabel(targetLang)}
                examples={generatedExamples}
                loading={loadingExamples}
              />
            </div>
          ) : (
            <div className="text-center py-8 text-white/40">
              <i className="fas fa-spinner fa-spin mr-2" />Loading...
            </div>
          )}
        </div>
      )}
    </div>
  );
}
