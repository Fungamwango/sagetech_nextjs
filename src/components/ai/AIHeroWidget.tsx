"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

import { DICTIONARY_LANGUAGES } from "@/lib/dictionaryLanguages";

const LANGS: [string, string][] = DICTIONARY_LANGUAGES.map(({ code, label }) => [code, label]);

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
      const entry = LANGS.find(([code]) => code === saved);
      setSelectedLang(saved);
      setSelectedLangLabel(entry ? entry[1].split(" ")[0] : saved.toUpperCase());
    } catch {
      // ignore storage access issues
    }
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  function selectLang(code: string, label: string) {
    setSelectedLang(code);
    setSelectedLangLabel(label.split(" ")[0]);
    setLangOpen(false);
    setLangSearch("");
    try {
      localStorage.setItem("sageai_lang", code);
    } catch {
      // ignore storage access issues
    }
  }

  const filteredLangs = langSearch
    ? LANGS.filter(
        ([code, name]) =>
          name.toLowerCase().includes(langSearch.toLowerCase()) ||
          code.toLowerCase().includes(langSearch.toLowerCase()),
      )
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
        const d = (await res.json()) as { error?: string };
        setError(d.error || "Something went wrong");
        return;
      }

      const d = (await res.json()) as {
        response: string;
        postId: string | null;
        sharePath?: string | null;
        savedAsGuest?: boolean;
      };
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
      <div className="mb-2 flex items-center gap-2">
        <i className="fas fa-robot text-sm text-cyan-400" />
        <span className="text-sm font-semibold text-white">Ask Sage AI</span>
        <Link href="/ai" className="ml-auto text-xs text-cyan-400 hover:underline">
          Open full chat →
        </Link>
      </div>

      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if ((e.ctrlKey || e.metaKey) && e.key === "Enter") ask();
        }}
        placeholder="Ask me anything... I'll answer in your selected language."
        rows={2}
        className="w-full resize-none rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none placeholder:text-white/55 focus:border-cyan-500/50"
      />

      <div className="mt-2 flex items-center gap-2">
        <span className="whitespace-nowrap text-xs text-white/40">AI responds in:</span>

        <div className="relative" ref={langRef}>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              setLangOpen((v) => !v);
            }}
            className="flex min-w-[72px] items-center gap-1 rounded-md border border-white/20 bg-black/20 px-2 py-1 text-xs text-white transition-colors hover:border-cyan-400/50"
          >
            <i className="fas fa-globe text-cyan-400" style={{ fontSize: "10px" }} />
            <span>{selectedLangLabel}</span>
            <i className="fas fa-chevron-down" style={{ fontSize: "8px", opacity: 0.5 }} />
          </button>

          {langOpen && (
            <div className="absolute left-0 top-full z-50 mt-1 min-w-[180px] overflow-hidden rounded-lg border border-white/15 bg-[#111820] shadow-xl">
              <div className="p-1.5">
                <input
                  autoFocus
                  type="text"
                  value={langSearch}
                  onChange={(e) => setLangSearch(e.target.value)}
                  placeholder="Search language..."
                  className="w-full rounded border border-white/10 bg-white/5 px-2 py-1 text-xs text-white outline-none"
                />
              </div>
              <ul className="max-h-48 overflow-y-auto">
                {filteredLangs.map(([code, name]) => (
                  <li key={code}>
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        selectLang(code, name);
                      }}
                      className={`w-full px-3 py-1.5 text-left text-xs transition-colors hover:bg-cyan-500/10 ${
                        selectedLang === code ? "text-cyan-400" : "text-white/80"
                      }`}
                    >
                      {name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <button
          onClick={ask}
          disabled={loading || !input.trim()}
          className="ml-auto flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-opacity disabled:opacity-50"
          style={{ background: "linear-gradient(135deg,#00a884,#00c8e8)", color: "white" }}
        >
          {loading ? (
            <>
              <i className="fas fa-spinner fa-spin" /> Thinking...
            </>
          ) : (
            <>
              <i className="fas fa-paper-plane" /> Ask Sage AI
            </>
          )}
        </button>
      </div>

      {error && <p className="mt-2 text-xs text-red-400">{error}</p>}

      {response && (
        <div className="mt-3 max-h-64 overflow-y-auto rounded-lg border border-white/10 bg-black/20 p-3">
          <div
            className="ai-blog-content text-sm leading-relaxed text-white/85"
            dangerouslySetInnerHTML={{ __html: response.html }}
          />
          {response.sharePath && (
            <Link href={response.sharePath} className="mt-2 inline-block text-xs text-cyan-400 hover:underline">
              <i className="fas fa-external-link-alt mr-1" />
              View as post
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
