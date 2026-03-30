"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";

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

export default function AIHeroWidget() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<{ html: string; postId: string | null; sharePath?: string | null } | null>(null);
  const [error, setError] = useState("");

  const [selectedLang, setSelectedLang] = useState("en");
  const [selectedLangLabel, setSelectedLangLabel] = useState("EN");
  const [langOpen, setLangOpen] = useState(false);
  const [langSearch, setLangSearch] = useState("");
  const langRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("sageai_lang") || "en";
      const entry = LANGS.find(([c]) => c === saved);
      setSelectedLang(saved);
      setSelectedLangLabel(entry ? entry[1].split(" ")[0] : saved.toUpperCase());
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) setLangOpen(false);
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  function selectLang(code: string, label: string) {
    setSelectedLang(code);
    setSelectedLangLabel(label.split(" ")[0]);
    setLangOpen(false);
    setLangSearch("");
    try { localStorage.setItem("sageai_lang", code); } catch { /* ignore */ }
  }

  const filteredLangs = langSearch
    ? LANGS.filter(([c, n]) => n.toLowerCase().includes(langSearch.toLowerCase()) || c.toLowerCase().includes(langSearch.toLowerCase()))
    : LANGS;

  async function ask() {
    const q = input.trim();
    if (!q || loading) return;
    setLoading(true);
    setResponse(null);
    setError("");
    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: q, language: selectedLang }),
      });
      if (!res.ok) {
        const d = await res.json() as { error?: string };
        setError(d.error || "Something went wrong");
        return;
      }
      const d = await res.json() as { response: string; postId: string | null; sharePath?: string | null; savedAsGuest?: boolean };
      setResponse({ html: d.response, postId: d.postId, sharePath: d.sharePath });
      setInput("");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="mb-3 rounded-xl border border-white/10 p-3"
      style={{ background: "linear-gradient(135deg,rgba(0,180,200,0.07),rgba(0,80,120,0.12))" }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <i className="fas fa-robot text-cyan-400 text-sm" />
        <span className="font-semibold text-sm text-white">Ask Sage AI</span>
        <Link href="/ai" className="ml-auto text-xs text-cyan-400 hover:underline">
          Open full chat →
        </Link>
      </div>

      {/* Textarea */}
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => { if ((e.ctrlKey || e.metaKey) && e.key === "Enter") ask(); }}
        placeholder="Ask me anything… I'll answer in your selected language."
        rows={2}
        className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/30 outline-none focus:border-cyan-500/50 resize-none"
      />

      {/* Controls row */}
      <div className="flex items-center gap-2 mt-2">
        <span className="text-xs text-white/40 whitespace-nowrap">AI responds in:</span>

        {/* Language picker */}
        <div className="relative" ref={langRef}>
          <button
            type="button"
            onClick={() => setLangOpen((v) => !v)}
            className="flex items-center gap-1 text-xs border border-white/20 rounded-md px-2 py-1 bg-black/20 text-white hover:border-cyan-400/50 transition-colors min-w-[72px]"
          >
            <i className="fas fa-globe text-cyan-400" style={{ fontSize: "10px" }} />
            <span>{selectedLangLabel}</span>
            <i className="fas fa-chevron-down" style={{ fontSize: "8px", opacity: 0.5 }} />
          </button>
          {langOpen && (
            <div className="absolute top-full left-0 mt-1 z-50 bg-[#111820] border border-white/15 rounded-lg shadow-xl min-w-[180px] overflow-hidden">
              <div className="p-1.5">
                <input
                  autoFocus
                  type="text"
                  value={langSearch}
                  onChange={(e) => setLangSearch(e.target.value)}
                  placeholder="Search language…"
                  className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-xs text-white outline-none"
                />
              </div>
              <ul className="overflow-y-auto max-h-48">
                {filteredLangs.map(([code, name]) => (
                  <li key={code}>
                    <button
                      type="button"
                      onClick={() => selectLang(code, name)}
                      className={`w-full text-left px-3 py-1.5 text-xs hover:bg-cyan-500/10 transition-colors ${selectedLang === code ? "text-cyan-400" : "text-white/80"}`}
                    >
                      {name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Ask button */}
        <button
          onClick={ask}
          disabled={loading || !input.trim()}
          className="ml-auto flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg disabled:opacity-50 transition-opacity"
          style={{ background: "linear-gradient(135deg,#00a884,#00c8e8)", color: "white" }}
        >
          {loading ? (
            <><i className="fas fa-spinner fa-spin" /> Thinking…</>
          ) : (
            <><i className="fas fa-paper-plane" /> Ask Sage AI</>
          )}
        </button>
      </div>

      {/* Error */}
      {error && <p className="text-xs text-red-400 mt-2">{error}</p>}

      {/* Response */}
      {response && (
        <div className="mt-3 bg-black/20 border border-white/10 rounded-lg p-3 max-h-64 overflow-y-auto">
          <div
            className="text-sm text-white/85 leading-relaxed ai-blog-content"
            dangerouslySetInnerHTML={{ __html: response.html }}
          />
          {response.sharePath && (
            <Link
              href={response.sharePath}
              className="inline-block mt-2 text-xs text-cyan-400 hover:underline"
            >
              <i className="fas fa-external-link-alt mr-1" />View as post
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
