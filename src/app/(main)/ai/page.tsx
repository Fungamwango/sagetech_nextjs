"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";

// 80+ languages matching sageblog
const LANGS: [string, string][] = [
  ["en","English"],["es","Español"],["fr","Français"],["de","Deutsch"],["pt","Português"],
  ["it","Italiano"],["nl","Nederlands"],["ru","Русский"],["zh-CN","中文 (简体)"],["zh-TW","中文 (繁體)"],
  ["ja","日本語"],["ko","한국어"],["ar","العربية"],["hi","हिन्दी"],["bn","বাংলা"],
  ["sw","Kiswahili"],["yo","Yorùbá"],["ha","Hausa"],["am","አማርኛ"],["ig","Igbo"],["zu","Zulu"],
  ["tr","Türkçe"],["pl","Polski"],["vi","Tiếng Việt"],["th","ภาษาไทย"],["id","Bahasa Indonesia"],
  ["ms","Bahasa Melayu"],["uk","Українська"],["ro","Română"],["cs","Čeština"],["sk","Slovenčina"],
  ["sv","Svenska"],["no","Norsk"],["da","Dansk"],["fi","Suomi"],["hu","Magyar"],["el","Ελληνικά"],
  ["he","עברית"],["fa","فارسی"],["ur","اردو"],["ta","தமிழ்"],["te","తెలుగు"],["ml","മലയാളം"],
  ["kn","ಕನ್ನಡ"],["mr","मराठी"],["gu","ગુજરાતી"],["pa","ਪੰਜਾਬੀ"],["ne","नेपाली"],["si","සිංහල"],
  ["tl","Filipino"],["ceb","Cebuano"],["ca","Català"],["lt","Lietuvių"],["lv","Latviešu"],
  ["et","Eesti"],["sl","Slovenščina"],["hr","Hrvatski"],["sr","Српски"],["bg","Български"],
  ["mk","Македонски"],["bs","Bosanski"],["sq","Shqip"],["ka","ქართული"],["hy","Հայերեն"],
  ["az","Azərbaycanca"],["kk","Қазақша"],["uz","Oʻzbek"],["mn","Монгол"],["my","မြန်မာဘာသာ"],
  ["km","ខ្មែរ"],["lo","ລາວ"],["gl","Galego"],["eu","Euskara"],["cy","Cymraeg"],["af","Afrikaans"],
  ["ht","Haitian Creole"],["mi","Māori"],["xh","Xhosa"],["st","Sesotho"],["sn","Shona"],
  ["so","Somali"],["bem","Bemba"],["ny","Chichewa / Nyanja"],["to","Tonga"],["loz","Lozi"],
];

interface HistoryEntry {
  question: string;
  answer: string;
  answer_en: string;
  postId: string | null;
  sharePath?: string | null;
  lang: string;
  ts: number;
}

const SPIN_MSGS = ["Thinking…","Processing your question…","Consulting knowledge base…","Generating response…","Almost there…","Translating…"];

export default function AIPage() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<{ question: string; answer: string; postId: string | null; sharePath?: string | null } | null>(null);
  const [statusMsg, setStatusMsg] = useState("");
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  // Language picker
  const [selectedLang, setSelectedLang] = useState("en");
  const [selectedLangLabel, setSelectedLangLabel] = useState("English");
  const [langOpen, setLangOpen] = useState(false);
  const [langSearch, setLangSearch] = useState("");
  const langRef = useRef<HTMLDivElement>(null);

  // TTS
  const [ttsPlaying, setTtsPlaying] = useState(false);

  // Spinner
  const spinTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [spinMsg, setSpinMsg] = useState("Thinking…");
  const [spinSec, setSpinSec] = useState(0);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("sageai_history");
      if (saved) setHistory(JSON.parse(saved));
      const savedLang = localStorage.getItem("sageai_lang") || "en";
      const entry = LANGS.find(([c]) => c === savedLang);
      setSelectedLang(savedLang);
      setSelectedLangLabel(entry ? entry[1] : savedLang);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) setLangOpen(false);
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  function selectLang(code: string, label: string) {
    setSelectedLang(code);
    setSelectedLangLabel(label);
    setLangOpen(false);
    setLangSearch("");
    try { localStorage.setItem("sageai_lang", code); } catch { /* ignore */ }
  }

  const filteredLangs = langSearch
    ? LANGS.filter(([c, n]) => n.toLowerCase().includes(langSearch.toLowerCase()) || c.toLowerCase().includes(langSearch.toLowerCase()))
    : LANGS;

  function startSpinner() {
    let sec = 0, idx = 0;
    setSpinSec(0);
    setSpinMsg(SPIN_MSGS[0]);
    spinTimerRef.current = setInterval(() => {
      sec++;
      setSpinSec(sec);
      if (sec % 3 === 0) { idx++; setSpinMsg(SPIN_MSGS[idx % SPIN_MSGS.length]); }
    }, 1000);
  }

  function stopSpinner() {
    if (spinTimerRef.current) { clearInterval(spinTimerRef.current); spinTimerRef.current = null; }
  }

  async function sendMessage(e?: React.FormEvent) {
    e?.preventDefault();
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
          history: history.slice(0, 6).map((h) => ({ question: h.question, answer: h.answer, answer_en: h.answer_en })),
        }),
      });

      stopSpinner();

      if (!res.ok) {
        const err = await res.json() as { error?: string };
        setStatusMsg(err.error || "Something went wrong");
        return;
      }

      const data = await res.json() as { response: string; answer_en: string; question: string; language: string; postId: string | null; sharePath?: string | null; savedAsGuest?: boolean };
      setResponse({ question: data.question, answer: data.response, postId: data.postId, sharePath: data.sharePath });
      setInput("");

      if (data.postId && data.savedAsGuest) setStatusMsg("✓ Guest AI post published publicly");
      else if (data.postId) setStatusMsg("✓ Answer saved as a post");
      setTimeout(() => setStatusMsg(""), 4000);

      // Save to history
      const entry: HistoryEntry = {
        question: data.question,
        answer: data.response,
        answer_en: data.answer_en || data.response,
        postId: data.postId,
        sharePath: data.sharePath,
        lang: selectedLang,
        ts: Date.now(),
      };
      setHistory((prev) => {
        const next = [entry, ...prev].slice(0, 20);
        try { localStorage.setItem("sageai_history", JSON.stringify(next)); } catch { /* ignore */ }
        return next;
      });
    } catch {
      stopSpinner();
      setStatusMsg("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function loadHistoryEntry(h: HistoryEntry) {
    setResponse({ question: h.question, answer: h.answer, postId: h.postId, sharePath: h.sharePath });
  }

  function speakText() {
    if (!response) return;
    if (!("speechSynthesis" in window)) return;
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      setTtsPlaying(false);
      return;
    }
    const text = response.answer.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    const utt = new SpeechSynthesisUtterance(text);
    utt.lang = selectedLang;
    utt.rate = 0.95;
    setTtsPlaying(true);
    utt.onend = () => setTtsPlaying(false);
    utt.onerror = () => setTtsPlaying(false);
    window.speechSynthesis.speak(utt);
  }

  return (
    <div className="text-white text-sm">
      <h1 className="text-lg font-bold text-white mb-0.5">
        <i className="fas fa-robot text-cyan-400 mr-2" />Sage AI
      </h1>
      <p className="text-xs text-white/40 mb-4">Ask anything — your question gets an AI answer and is published as a post.</p>

      {/* Input box */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-3 mb-4">
        <form onSubmit={sendMessage}>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if ((e.ctrlKey || e.metaKey) && e.key === "Enter") sendMessage(); }}
            placeholder="Ask a question… e.g. Why do humans dream?"
            rows={3}
            className="w-full bg-transparent border border-white/10 rounded-lg p-2 text-white text-sm outline-none resize-none focus:border-cyan-400/50 placeholder:text-white/30"
            disabled={loading}
          />
          <div className="flex items-center justify-between mt-2 flex-wrap gap-2">
            {/* Language picker */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-white/50 text-xs">🌐 Respond in:</span>
              <div className="relative" ref={langRef}>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setLangOpen((v) => !v); }}
                  className="flex items-center gap-1 text-xs bg-white/10 hover:bg-white/15 border border-white/10 rounded px-3 py-1 text-white/80 min-w-[120px] justify-between"
                >
                  <span>{selectedLangLabel}</span><span className="opacity-50">▾</span>
                </button>
                {langOpen && (
                  <div className="absolute top-full left-0 mt-1 z-50 bg-[#0d1f2d] border border-white/10 rounded-lg shadow-xl w-52 max-h-64 overflow-hidden">
                    <div className="p-2">
                      <input
                        type="text"
                        autoFocus
                        placeholder="Search language…"
                        value={langSearch}
                        onChange={(e) => setLangSearch(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Escape") setLangOpen(false);
                          if (e.key === "Enter" && filteredLangs[0]) selectLang(filteredLangs[0][0], filteredLangs[0][1]);
                        }}
                        className="w-full bg-white/10 border border-white/10 rounded px-2 py-1 text-xs text-white outline-none"
                      />
                    </div>
                    <ul className="overflow-y-auto max-h-48 pb-1">
                      {filteredLangs.map(([code, name]) => (
                        <li
                          key={code}
                          onClick={() => selectLang(code, name)}
                          className={`px-3 py-1.5 cursor-pointer text-xs hover:bg-white/10 ${code === selectedLang ? "bg-cyan-700/40 text-cyan-300" : "text-white/80"}`}
                        >
                          {name} <span className="opacity-40">{code}</span>
                        </li>
                      ))}
                      {filteredLangs.length === 0 && langSearch && (
                        <li
                          onClick={() => selectLang(langSearch, langSearch)}
                          className="px-3 py-1.5 cursor-pointer text-xs text-cyan-400 border-t border-white/10 hover:bg-white/10"
                        >
                          Use &quot;{langSearch}&quot; as language code
                        </li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
              {statusMsg && <span className="text-xs text-cyan-400">{statusMsg}</span>}
            </div>
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="btn-sage rounded-full px-5 py-1.5 text-xs disabled:opacity-40"
            >
              Ask →
            </button>
          </div>
        </form>
      </div>

      {/* Quick prompts */}
      {!response && !loading && (
        <div className="grid grid-cols-2 gap-1.5 mb-4">
          {["Tell me a joke", "Explain photosynthesis", "What is AI?", "History of Zambia"].map((s) => (
            <button
              key={s}
              onClick={() => setInput(s)}
              className="text-xs border border-white/10 text-white/50 px-2 py-2 rounded-lg hover:border-cyan-400/40 hover:text-cyan-400 transition-colors text-left"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Spinner */}
      {loading && (
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm"
              style={{ background: "linear-gradient(135deg,#6366f1,#7c3aed)" }}>
              🤖
            </div>
            <div className="bg-white/5 border border-purple-500/20 rounded-xl px-4 py-2 flex items-center gap-3">
              <div className="flex gap-1 items-center">
                {[0, 0.15, 0.3].map((d, i) => (
                  <span key={i} className="w-2 h-2 bg-purple-400 rounded-full inline-block animate-bounce"
                    style={{ animationDelay: `${d}s` }} />
                ))}
              </div>
              <span className="text-xs text-white/60">{spinMsg}</span>
              <span className="text-xs text-white/30 ml-auto">{spinSec}s</span>
            </div>
          </div>
        </div>
      )}

      {/* Response */}
      {response && !loading && (
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-4">
          <div className="text-xs text-white/40 uppercase tracking-widest mb-1">Your question</div>
          <div className="font-semibold text-white border-l-2 border-cyan-500 pl-3 mb-4 text-sm leading-snug">
            {response.question}
          </div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-white/40 uppercase tracking-widest">SageAI&apos;s answer</span>
            {"speechSynthesis" in (typeof window !== "undefined" ? window : {}) && (
              <button
                onClick={speakText}
                className="text-white/40 hover:text-cyan-400 text-sm transition-colors"
                title={ttsPlaying ? "Stop" : "Listen"}
              >
                {ttsPlaying ? "⏹" : "🔊"}
              </button>
            )}
          </div>
          <div
            className="text-sm text-white/85 leading-relaxed ai-blog-content"
            dangerouslySetInnerHTML={{ __html: response.answer }}
          />
          {response.sharePath && (
            <div className="mt-3 pt-3 border-t border-white/10">
              <Link
                href={response.sharePath}
                className="text-xs text-cyan-400 hover:underline"
              >
                📖 View as post →
              </Link>
            </div>
          )}
        </div>
      )}

      {/* History */}
      {history.length > 0 && (
        <div>
          <h4 className="text-xs text-white/40 uppercase tracking-widest mb-2">Recent Questions</h4>
          <ul className="space-y-2">
            {history.map((h, i) => {
              const langName = LANGS.find(([c]) => c === h.lang)?.[1] ?? h.lang;
              return (
                <li
                  key={i}
                  onClick={() => loadHistoryEntry(h)}
                  className="bg-white/5 border border-white/10 hover:border-cyan-400/30 rounded-lg px-3 py-2 cursor-pointer transition-colors"
                >
                  <p className="text-xs text-white/80 font-medium truncate">{h.question}</p>
                  <p className="text-[11px] text-white/30 mt-0.5">
                    {langName} · {new Date(h.ts).toLocaleDateString()}
                    {h.sharePath && (
                      <Link
                        href={h.sharePath}
                        onClick={(e) => e.stopPropagation()}
                        className="ml-2 text-cyan-400/70 hover:text-cyan-400"
                      >
                        view post
                      </Link>
                    )}
                  </p>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
