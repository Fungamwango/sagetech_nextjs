import { Hono } from "hono";
import { handle } from "hono/vercel";
import { authRouter } from "./routes/auth";
import { postsRouter } from "./routes/posts";
import { usersRouter } from "./routes/users";
import { messagesRouter } from "./routes/messages";
import { notificationsRouter } from "./routes/notifications";
import { adminRouter } from "./routes/admin";
import { businessRouter } from "./routes/business";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { promises as fs } from "fs";
import path from "path";
import vm from "vm";
import { sql } from "drizzle-orm";
import { DICTIONARY_SEED_WORDS } from "@/lib/dictionarySeed";

const app = new Hono().basePath("/api");

app.use("*", logger());
app.use(
  "*",
  cors({
    origin: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    credentials: true,
  })
);

// Health check
app.get("/health", (c) => c.json({ status: "ok", timestamp: new Date().toISOString() }));

// Mount routers
app.route("/auth", authRouter);
app.route("/posts", postsRouter);
app.route("/users", usersRouter);
app.route("/messages", messagesRouter);
app.route("/notifications", notificationsRouter);
app.route("/admin", adminRouter);
app.route("/business", businessRouter);

// Leaderboard
  app.get("/leaderboard", async (c) => {
    const { db } = await import("@/lib/db");
    const { users } = await import("@/lib/db/schema");
    const { and, desc, ne } = await import("drizzle-orm");
    const { GUEST_AI_EMAIL, GUEST_AI_USERNAME } = await import("@/lib/aiPosts");

    const leaders = await db
      .select({
      id: users.id,
      username: users.username,
      picture: users.picture,
      points: users.points,
      awards: users.awards,
      level: users.level,
      })
      .from(users)
      .where(and(ne(users.username, GUEST_AI_USERNAME), ne(users.email, GUEST_AI_EMAIL)))
      .orderBy(desc(users.points))
      .limit(50);

  return c.json({ leaders });
});

// Contact
app.post("/contact", async (c) => {
  const { zValidator } = await import("@hono/zod-validator");
  const { z } = await import("zod");
  const body = await c.req.json();
  const { name, email, phone, message } = body;

  if (!name || !message) return c.json({ error: "Name and message required" }, 400);

  const { db } = await import("@/lib/db");
  const { contactMessages } = await import("@/lib/db/schema");

  await db.insert(contactMessages).values({ name, email, phone, message });
  return c.json({ success: true });
});

function buildAmountLink(baseLink: string, amount: number) {
  const normalized = baseLink.trim();
  if (!normalized) return "";
  const amountText = amount.toFixed(2);

  if (normalized.includes("{amount}")) {
    return normalized.replaceAll("{amount}", amountText);
  }

  if (/paypal\.me/i.test(normalized)) {
    return `${normalized.replace(/\/$/, "")}/${amountText}`;
  }

  const url = new URL(normalized);
  url.searchParams.set("amount", amountText);
  if (!url.searchParams.has("currency_code")) url.searchParams.set("currency_code", "USD");
  return url.toString();
}

type CachedCurrencyRates = {
  base: string;
  rates: Record<string, number>;
  updatedAt: string;
};

const CURRENCY_CACHE_TTL_MS = 5 * 60 * 1000;
const currencyRatesCache = new Map<string, { expiresAt: number; data: CachedCurrencyRates }>();

async function getCachedCurrencyRates(base: string) {
  const normalizedBase = base.trim().toUpperCase();
  const cached = currencyRatesCache.get(normalizedBase);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.data;
  }

  const url = new URL("https://api.openexchangeapi.com/v1/latest");
  url.searchParams.set("base", normalizedBase);

  const apiKey = process.env.OPEN_EXCHANGE_API_KEY?.trim();
  const res = await fetch(url.toString(), {
    headers: apiKey ? { Authorization: `Bearer ${apiKey}` } : undefined,
    next: { revalidate: 300 },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch live currency rates.");
  }

  const payload = (await res.json()) as {
    base?: string;
    rates?: Record<string, number>;
    timestamp?: number;
    date?: string;
  };

  if (!payload?.base || !payload?.rates || typeof payload.rates !== "object") {
    throw new Error("Currency service returned an invalid response.");
  }

  const updatedAt = payload.date
    ? new Date(payload.date).toISOString()
    : payload.timestamp
      ? new Date(payload.timestamp * 1000).toISOString()
      : new Date().toISOString();

  const data = {
    base: payload.base.toUpperCase(),
    rates: payload.rates,
    updatedAt,
  };

  currencyRatesCache.set(normalizedBase, {
    data,
    expiresAt: Date.now() + CURRENCY_CACHE_TTL_MS,
  });

  return data;
}

app.get("/tools/currency", async (c) => {
  const base = (c.req.query("base") ?? "USD").toUpperCase();
  const symbols = (c.req.query("symbols") ?? "")
    .split(",")
    .map((symbol) => symbol.trim().toUpperCase())
    .filter(Boolean);

  if (!/^[A-Z]{3}$/.test(base)) {
    return c.json({ error: "Invalid base currency." }, 400);
  }

  if (symbols.some((symbol) => !/^[A-Z]{3}$/.test(symbol))) {
    return c.json({ error: "Invalid target currency." }, 400);
  }

  try {
    const data = await getCachedCurrencyRates(base);
    const rates = symbols.length
      ? Object.fromEntries(
          symbols
            .filter((symbol) => symbol === base || typeof data.rates[symbol] === "number")
            .map((symbol) => [symbol, symbol === base ? 1 : data.rates[symbol]])
        )
      : data.rates;

    return c.json({
      success: true,
      base: data.base,
      rates,
      updatedAt: data.updatedAt,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load live currency rates right now.";
    return c.json({ error: message }, 502);
  }
});

// ── AI helpers ────────────────────────────────────────────────────
function mdToHtml(raw: string): string {
  if (!raw) return "";
  if (/^\s*<(p|h[1-6]|ul|ol|div|section|blockquote)[\s>]/i.test(raw)) return raw;
  const lines = raw.split("\n");
  const out: string[] = [];
  let inUl = false, inOl = false;
  const closeList = () => {
    if (inUl) { out.push("</ul>"); inUl = false; }
    if (inOl) { out.push("</ol>"); inOl = false; }
  };
  const inline = (s: string) => s
    .replace(/<\d+>/g, "")
    .replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/__(.+?)__/g, "<strong>$1</strong>")
    .replace(/\*([^*\n]+?)\*/g, "<em>$1</em>")
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .trim();
  for (let line of lines) {
    line = line.replace(/<br\s*\/?>/gi, "").trim();
    if (!line) { closeList(); continue; }
    if (/^<(h[1-6]|p|ul|ol|li|blockquote|div)[\s>]/i.test(line)) { closeList(); out.push(line); continue; }
    const hm = line.match(/^(#{1,6})\s+(.+)/);
    if (hm) { closeList(); out.push(`<h${Math.min(hm[1].length + 1, 4)}>${inline(hm[2])}</h${Math.min(hm[1].length + 1, 4)}>`); continue; }
    if (line.startsWith("> ")) { closeList(); out.push(`<blockquote><p>${inline(line.slice(2))}</p></blockquote>`); continue; }
    const olm = line.match(/^\d+\.\s+(.+)/);
    if (olm) { if (!inOl) { if (inUl) { out.push("</ul>"); inUl = false; } out.push("<ol>"); inOl = true; } out.push(`<li>${inline(olm[1])}</li>`); continue; }
    const ulm = line.match(/^[-*•]\s+(.+)/);
    if (ulm) { if (!inUl) { if (inOl) { out.push("</ol>"); inOl = false; } out.push("<ul>"); inUl = true; } out.push(`<li>${inline(ulm[1])}</li>`); continue; }
    closeList();
    const text = inline(line);
    if (text) out.push(`<p>${text}</p>`);
  }
  closeList();
  return out.join("\n").trim();
}

async function translateText(text: string, lang: string): Promise<string> {
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${encodeURIComponent(lang)}&dt=t&q=${encodeURIComponent(text)}`;
    const res = await fetch(url);
    const data = await res.json() as unknown[][];
    return (data[0] as unknown[][]).map((s) => (s as unknown[])[0]).join("") || text;
  } catch { return text; }
}

async function translateHtml(html: string, lang: string): Promise<string> {
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${encodeURIComponent(lang)}&dt=t&q=${encodeURIComponent(html)}`;
    const res = await fetch(url);
    const data = await res.json() as unknown[][];
    return (data[0] as unknown[][]).map((s) => (s as unknown[])[0]).join("") || html;
  } catch { return html; }
}

const translationCache = new Map<string, string>();
const exampleCache = new Map<string, string[]>();
let bembaDictionaryCache: Array<{ word: string; html: string; bemba: string; englishExample: string; bembaExample: string }> | null = null;
let allLanguagesBaseWordsCache: string[] | null = null;

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function extractFirstMatch(value: string, regex: RegExp) {
  const match = value.match(regex);
  return match?.[1]?.replace(/&gt;/g, ">").replace(/&lt;/g, "<").replace(/\s+/g, " ").trim() ?? "";
}

function extractBembaTextFromHtml(html: string) {
  return extractFirstMatch(html, /class=bemba_text>(.*?)<\/span>/i);
}

function extractEnglishExampleFromHtml(html: string) {
  return extractFirstMatch(html, /class=in_english><span>English&gt;&gt;<\/span>(.*?)<\/div>/i);
}

function extractBembaExampleFromHtml(html: string) {
  return extractFirstMatch(html, /class=in_bemba><span>Bemba&gt;&gt;<\/span>(.*?)<\/div>/i);
}

async function getBembaDictionaryEntries() {
  if (bembaDictionaryCache) return bembaDictionaryCache;
  const dictionaryPath = path.join(process.cwd(), "dictionary", "dictionary", "dictionary.js");
  const raw = await fs.readFile(dictionaryPath, "utf8");
  const sandbox: { dictionary?: Record<string, string> } = {};
  vm.runInNewContext(raw, sandbox);
  const parsed = sandbox.dictionary ?? {};
  bembaDictionaryCache = Object.entries(parsed).map(([word, html]) => ({
    word,
    html,
    bemba: extractBembaTextFromHtml(html),
    englishExample: extractEnglishExampleFromHtml(html),
    bembaExample: extractBembaExampleFromHtml(html),
  }));
  return bembaDictionaryCache;
}

async function getAllLanguagesBaseWords() {
  if (allLanguagesBaseWordsCache) return allLanguagesBaseWordsCache;

  const entries = await getBembaDictionaryEntries();
  const seen = new Set<string>();
  const combined: string[] = [];

  for (const word of DICTIONARY_SEED_WORDS) {
    const normalized = String(word).trim().toLowerCase();
    if (!normalized || seen.has(normalized)) continue;
    seen.add(normalized);
    combined.push(String(word).trim());
  }

  for (const entry of entries) {
    const normalized = entry.word.trim().toLowerCase();
    if (!normalized || seen.has(normalized)) continue;
    seen.add(normalized);
    combined.push(entry.word.trim());
  }

  allLanguagesBaseWordsCache = combined;
  return allLanguagesBaseWordsCache;
}

async function translateTextBetween(text: string, from: string, to: string): Promise<string> {
  if (!text.trim() || from === to) return text;
  const cacheKey = `${from}:${to}:${text}`;
  const cached = translationCache.get(cacheKey);
  if (cached) return cached;

  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${encodeURIComponent(from)}&tl=${encodeURIComponent(to)}&dt=t&q=${encodeURIComponent(text)}`;
    const res = await fetch(url);
    const data = await res.json() as unknown[][];
    const translated = (data[0] as unknown[][]).map((segment) => (segment as unknown[])[0]).join("") || text;
    translationCache.set(cacheKey, translated);
    return translated;
  } catch {
    return text;
  }
}

async function runCloudflarePrompt(prompt: string): Promise<string> {
  const { accountId, token } = CF_ACCOUNTS[Math.floor(Math.random() * CF_ACCOUNTS.length)];
  const res = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/@cf/meta/llama-3.2-3b-instruct`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messages: [
        {
          role: "system",
          content: "Return only plain text. No markdown, no bullets, no numbering. Keep it concise.",
        },
        { role: "user", content: prompt },
      ],
      max_tokens: 300,
      temperature: 0.7,
    }),
  });
  const data = await res.json() as { result?: { response?: string } };
  return (data.result?.response || "").trim();
}

async function generateExampleSentences(englishTerm: string) {
  const cacheKey = englishTerm.toLowerCase();
  const cached = exampleCache.get(cacheKey);
  if (cached) return cached;

  try {
    const raw = await runCloudflarePrompt(`Write exactly one short basic everyday sentence using the word or phrase "${englishTerm}". Return only the sentence, nothing else.`);
    const lines = raw.split(/\r?\n/).map((line) => line.trim()).filter(Boolean).slice(0, 1);
    if (lines.length > 0) {
      exampleCache.set(cacheKey, lines);
      return lines;
    }
  } catch {
    // ignore
  }

  const fallback = [
    `I use ${englishTerm} every day.`,
  ];
  exampleCache.set(cacheKey, fallback);
  return fallback;
}

function buildDictionaryHtml(fromLabel: string, toLabel: string, sourceText: string, translatedText: string, examples: Array<{ source: string; target: string }> = []) {
  const exampleHtml = examples
    .map((example) => `<div class=in_english><strong>${escapeHtml(fromLabel)} example:</strong> ${escapeHtml(example.source)}</div><div class=in_bemba><strong>${escapeHtml(toLabel)} example:</strong> ${escapeHtml(example.target)}</div>`)
    .join("");

  return `<div class=bemba_text>${escapeHtml(translatedText)}</div><div class=in_english><strong>${escapeHtml(fromLabel)}:</strong> ${escapeHtml(sourceText)}</div><div class=in_bemba><strong>${escapeHtml(toLabel)}:</strong> ${escapeHtml(translatedText)}</div>${exampleHtml}`;
}

async function buildDictionaryEntry(baseWord: string, from: string, to: string, fromLabel: string, toLabel: string, includeExamples = false) {
  const [sourceText, translatedText] = await Promise.all([
    translateTextBetween(baseWord, "en", from),
    translateTextBetween(baseWord, "en", to),
  ]);

  let examples: Array<{ source: string; target: string }> = [];
  if (includeExamples) {
    const englishExamples = await generateExampleSentences(baseWord);
    examples = await Promise.all(
      englishExamples.map(async (sentence) => ({
        source: await translateTextBetween(sentence, "en", from),
        target: await translateTextBetween(sentence, "en", to),
      }))
    );
  }

  return {
    word: sourceText,
    bemba: translatedText,
    html: buildDictionaryHtml(fromLabel, toLabel, sourceText, translatedText, examples),
    base: baseWord,
    sourceLang: from,
    targetLang: to,
  };
}

function slugifyPostText(value: string): string {
  return value
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "post";
}

// Cloudflare AI account pool - random rotation across 11 accounts
const CF_ACCOUNTS = [
  { accountId: "9f814249d80baa3f7fc398a840a8508b", token: "HU83BHDMxj0D8TI1QxzH7Y5cQ8Ft1mOwFbxskoB3" },
  { accountId: "4f32612e26f36a9a59eb98e97d7bfaba", token: "6wzAWWHF_lZc43Gag5brU5mZ-5Uwqv-xSiM3v7BE" },
  { accountId: "7feb77ecce5297bb6a6108c96f5f01e7", token: "t8ZWWWRoAVv3Oblt6sZgsN5hzoT5BxozP2YFhSB3" },
  { accountId: "d8d8f9ffc702997ac91f749c085c25b2", token: "bzxs52cZHoBn0v_I1OUMFrJPLii6CZmadRwSSu1a" },
  { accountId: "2ce8ee80133574af95d9c1aa935a1179", token: "x3o3U8Ly3GXqGKW_SMs-Ip5PmwboVwR6AEG4iXOH" },
  { accountId: "a83bbb16fee71d5e2867dc8072e03d1f", token: "wM2jqVdAjemmxbnSORKNSfiiVKcLEsW2CeX9yuDY" },
  { accountId: "bf7cd8beae00dfe62a94407793ae7405", token: "eOPj6kPG3buEkRt_o1Das2id-z4AQRdFV_iEUKg-" },
  { accountId: "a19242227521b747c897cadc6869f3df", token: "yyDJKaLsJTWU_DdW5xjTB_wv-cC4TpKhF1BISa6Q" },
  { accountId: "2b63e81ee2041c4dbae1921dff7a8797", token: "NKscmbD8oFcFyHQ47DKBa34Kjb5Lh968GrHoXUQF" },
  { accountId: "94b60a5b1d9e872c22273169fc7f9f28", token: "q0tvQLtnSnCEyZSaWq-6cJrEvNukUwzplaLg9YP7" },
  { accountId: "b6085c5d02be6ccde4f30ef144f8311f", token: "gkkzCNh98O5phMWCd-XhMX0ERbDsT3aSp2d6yVns" },
];

// AI Chat (Cloudflare AI) - with language, history and auto-save as blog post
app.post("/ai/chat", async (c) => {
  const body = await c.req.json<{
    message: string;
    model?: string;
    language?: string;
    history?: { question: string; answer_en?: string; answer: string }[];
  }>();
  if (!body?.message?.trim()) return c.json({ error: "Message required" }, 400);

  const question = body.message.trim().substring(0, 500);
  const targetLang = (body.language || "en").substring(0, 10);
  const priorTurns = (body.history || []).slice(-6);

  // Pick a random account from the pool
  const { accountId, token } = CF_ACCOUNTS[Math.floor(Math.random() * CF_ACCOUNTS.length)];
  const aiModel = body.model ?? "@cf/meta/llama-3.2-3b-instruct";

  // Build conversation history for context
  const historyMessages: { role: string; content: string }[] = [];
  for (const turn of priorTurns) {
    if (turn.question) historyMessages.push({ role: "user", content: turn.question.substring(0, 300) });
    const raw = turn.answer_en || turn.answer;
    if (raw) {
      const plain = raw.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().substring(0, 600);
      historyMessages.push({ role: "assistant", content: plain });
    }
  }

  // Call Cloudflare AI
  const cfRes = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${aiModel}`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [
          {
            role: "system",
            content: `You are SageAI, a knowledgeable assistant on SageTech. Give thorough, well-structured answers.
RULES:
- Output clean HTML only. Use <p> for paragraphs. Use <h3> for section headings. Use <strong> only for emphasis within a sentence. Use <ul><li> for lists. No markdown, no code fences.
- For factual or explanatory questions: write 300-600 words with clear sections and specific details.
- For casual greetings like "how are you", respond warmly and briefly in 1–2 sentences, then invite a question.
- Never cut off mid-answer. Always complete your response fully.`,
          },
          ...historyMessages,
          { role: "user", content: question },
        ],
        max_tokens: 2048,
        temperature: 0.8,
      }),
    }
  );

  const cfData = await cfRes.json() as { result?: { response?: string } };
  let answer = cfData?.result?.response ?? "";
  answer = answer.replace(/^```(?:html)?\s*/i, "").replace(/\s*```\s*$/, "").trim();
  if (!/^\s*<(p|h[1-6]|ul|ol|div|blockquote)[\s>]/i.test(answer)) answer = mdToHtml(answer);
  if (!answer) return c.json({ error: "No response from AI" }, 500);

  // Translate question + answer if non-English
  const [translatedQ, translatedA] = await Promise.all([
    targetLang !== "en" ? translateText(question, targetLang) : Promise.resolve(question),
    targetLang !== "en" ? translateHtml(answer, targetLang) : Promise.resolve(answer),
  ]);

  // Save authenticated chats as public blog posts.
  // Save guest chats in the main posts table as guest_ai so they remain shareable,
  // while the UI can still keep them view-only.
  let postId: string | null = null;
  let sharePath: string | null = null;
  let savedAsGuest = false;
  try {
    const { getSession } = await import("@/lib/auth");
    const { db } = await import("@/lib/db");
    const { posts } = await import("@/lib/db/schema");
    const { ensureGuestAiUserId } = await import("@/lib/aiPosts");
    const session = await getSession();
    if (session?.userId) {
      const title = translatedQ.substring(0, 200);
      const [inserted] = await db.insert(posts).values({
        userId: session.userId,
        postType: "blog",
        blogTitle: title,
        blogContent: translatedA,
        approved: true,
        privacy: "public",
      }).returning({ id: posts.id });
      postId = inserted?.id ?? null;
      if (postId) {
        sharePath = `/posts/${slugifyPostText(title)}/${postId}`;
      }
    } else {
      const title = translatedQ.substring(0, 200);
      const guestAiUserId = await ensureGuestAiUserId();
      const [inserted] = await db.insert(posts).values({
        userId: guestAiUserId,
        postType: "guest_ai",
        blogTitle: title,
        blogContent: translatedA,
        approved: true,
        privacy: "public",
        slug: slugifyPostText(title),
      }).returning({ id: posts.id });
      postId = inserted?.id ?? null;
      if (postId) {
        sharePath = `/posts/${slugifyPostText(title)}/${postId}`;
      }
      savedAsGuest = true;
    }
  } catch (e) {
    console.error("[ai/chat] failed to save post:", e);
  }

  return c.json({
    response: translatedA,
    answer_en: answer,
    question: translatedQ,
    language: targetLang,
    postId,
    sharePath,
    savedAsGuest,
  });
});

// Dictionary
app.get("/dictionary/languages", async (c) => {
  const { DICTIONARY_LANGUAGES, DEFAULT_SOURCE_LANGUAGE, DEFAULT_TARGET_LANGUAGE } = await import("@/lib/dictionaryLanguages");
  return c.json({ languages: DICTIONARY_LANGUAGES, defaults: { from: DEFAULT_SOURCE_LANGUAGE, to: DEFAULT_TARGET_LANGUAGE } });
});

app.get("/dictionary/search", async (c) => {
  const { getDictionaryLanguageLabel, DEFAULT_SOURCE_LANGUAGE, DEFAULT_TARGET_LANGUAGE } = await import("@/lib/dictionaryLanguages");
  const q = (c.req.query("q") ?? "").trim();
  const from = c.req.query("from")?.trim() || DEFAULT_SOURCE_LANGUAGE;
  const to = c.req.query("to")?.trim() || DEFAULT_TARGET_LANGUAGE;
  if (!q) return c.json({ results: [] });

  const englishQuery = (from === "en" ? q : await translateTextBetween(q, from, "en")).toLowerCase();
  const baseWords = await getAllLanguagesBaseWords();
  const scored = baseWords
    .map((word) => {
      const lower = word.toLowerCase();
      let rank = Number.POSITIVE_INFINITY;
      if (lower === englishQuery) rank = 0;
      else if (lower.startsWith(englishQuery)) rank = 1;
      else if (lower.includes(englishQuery)) rank = 2;
      return Number.isFinite(rank) ? { word: String(word), rank } : null;
    })
    .filter(Boolean) as Array<{ word: string; rank: number }>;
  scored.sort((a, b) => a.rank - b.rank || a.word.localeCompare(b.word));
  const ranked = scored.slice(0, 12);

  const fromLabel = getDictionaryLanguageLabel(from);
  const toLabel = getDictionaryLanguageLabel(to);
  const directEnglishTerm = from === "en" ? q : await translateTextBetween(q, from, "en");
  const directEntry = await buildDictionaryEntry(directEnglishTerm, from, to, fromLabel, toLabel, true);
  const rankedEntries = await Promise.all(ranked.map((entry) => buildDictionaryEntry(entry.word, from, to, fromLabel, toLabel, true)));
  const seen = new Set<string>();
  const results = [directEntry, ...rankedEntries].filter((entry) => {
    const key = `${entry.word.toLowerCase()}::${entry.bemba.toLowerCase()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  return c.json({ results });
});

app.get("/dictionary/word-of-the-day", async (c) => {
  const { getDictionaryLanguageLabel, DEFAULT_SOURCE_LANGUAGE, DEFAULT_TARGET_LANGUAGE } = await import("@/lib/dictionaryLanguages");
  const from = c.req.query("from")?.trim() || DEFAULT_SOURCE_LANGUAGE;
  const to = c.req.query("to")?.trim() || DEFAULT_TARGET_LANGUAGE;
  const baseWords = await getAllLanguagesBaseWords();
  const dayIndex = Math.floor(Date.now() / 86400000) % baseWords.length;
  const baseWord = baseWords[dayIndex];
  const entry = await buildDictionaryEntry(baseWord, from, to, getDictionaryLanguageLabel(from), getDictionaryLanguageLabel(to), true);
  return c.json(entry);
});

app.get("/dictionary/examples", async (c) => {
  const { getDictionaryLanguageLabel, DEFAULT_SOURCE_LANGUAGE, DEFAULT_TARGET_LANGUAGE } = await import("@/lib/dictionaryLanguages");
  const term = (c.req.query("term") ?? "").trim();
  const from = c.req.query("from")?.trim() || DEFAULT_SOURCE_LANGUAGE;
  const to = c.req.query("to")?.trim() || DEFAULT_TARGET_LANGUAGE;
  if (!term) return c.json({ examples: [] });

  const englishTerm = from === "en" ? term : await translateTextBetween(term, from, "en");
  const englishExamples = await generateExampleSentences(englishTerm);
  const examples = await Promise.all(
    englishExamples.map(async (sentence) => ({
      source: await translateTextBetween(sentence, "en", from),
      target: await translateTextBetween(sentence, "en", to),
    }))
  );

  return c.json({
    fromLabel: getDictionaryLanguageLabel(from),
    toLabel: getDictionaryLanguageLabel(to),
    examples,
  });
});

app.get("/dictionary/quiz", async (c) => {
  const { DEFAULT_SOURCE_LANGUAGE, DEFAULT_TARGET_LANGUAGE } = await import("@/lib/dictionaryLanguages");
  const from = c.req.query("from")?.trim() || DEFAULT_SOURCE_LANGUAGE;
  const to = c.req.query("to")?.trim() || DEFAULT_TARGET_LANGUAGE;

  const baseWords = await getAllLanguagesBaseWords();
  const picked = [...baseWords].sort(() => Math.random() - 0.5).slice(0, 20);
  const translated = await Promise.all(
    picked.map(async (baseWord) => ({
      baseWord,
      source: await translateTextBetween(baseWord, "en", from),
      target: await translateTextBetween(baseWord, "en", to),
    }))
  );

  const questions = translated.slice(0, 10).map((entry, index) => {
    const wrongOptions = translated
      .filter((candidate, candidateIndex) => candidateIndex !== index && candidate.target !== entry.target)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .map((candidate) => candidate.target);
    const options = [...wrongOptions, entry.target].sort(() => Math.random() - 0.5);
    return { word: entry.source, correct: entry.target, options };
  });

  return c.json({ questions, from, to });
});

app.get("/dictionary/words", async (c) => {
  const { getDictionaryLanguageLabel, DEFAULT_SOURCE_LANGUAGE, DEFAULT_TARGET_LANGUAGE } = await import("@/lib/dictionaryLanguages");
  const page = parseInt(c.req.query("page") ?? "0");
  const from = c.req.query("from")?.trim() || DEFAULT_SOURCE_LANGUAGE;
  const to = c.req.query("to")?.trim() || DEFAULT_TARGET_LANGUAGE;
  const PAGE_SIZE = 20;
  const baseWords = await getAllLanguagesBaseWords();
  const slice = baseWords.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const words = await Promise.all(slice.map((baseWord) => buildDictionaryEntry(baseWord, from, to, getDictionaryLanguageLabel(from), getDictionaryLanguageLabel(to), false)));
  return c.json({ words, total: baseWords.length, pages: Math.ceil(baseWords.length / PAGE_SIZE) });
});

app.get("/bemba-dictionary/search", async (c) => {
  const q = (c.req.query("q") ?? "").trim().toLowerCase();
  if (!q) return c.json({ results: [] });
  const entries = await getBembaDictionaryEntries();
  const scored = entries
    .map((entry) => {
      const english = entry.word.toLowerCase();
      const bemba = entry.bemba.toLowerCase();
      let rank = Number.POSITIVE_INFINITY;
      if (english === q || bemba === q) rank = 0;
      else if (english.startsWith(q) || bemba.startsWith(q)) rank = 1;
      else if (english.includes(q) || bemba.includes(q)) rank = 2;
      return Number.isFinite(rank) ? { entry, rank } : null;
    })
    .filter(Boolean) as Array<{ entry: (typeof entries)[number]; rank: number }>;
  scored.sort((a, b) => a.rank - b.rank || a.entry.word.localeCompare(b.entry.word));
  return c.json({
    results: scored.slice(0, 20).map(({ entry }) => ({
      word: entry.word,
      bemba: entry.bemba,
      html: entry.html,
    })),
  });
});

app.get("/bemba-dictionary/words", async (c) => {
  const page = parseInt(c.req.query("page") ?? "0");
  const PAGE_SIZE = 20;
  const entries = await getBembaDictionaryEntries();
  const slice = entries.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  return c.json({
    words: slice.map((entry) => ({ word: entry.word, bemba: entry.bemba, html: entry.html })),
    total: entries.length,
    pages: Math.ceil(entries.length / PAGE_SIZE),
  });
});

app.get("/bemba-dictionary/word-of-the-day", async (c) => {
  const entries = await getBembaDictionaryEntries();
  const dayIndex = Math.floor(Date.now() / 86400000) % entries.length;
  const entry = entries[dayIndex];
  return c.json({ word: entry.word, bemba: entry.bemba, html: entry.html });
});

app.get("/bemba-dictionary/quiz", async (c) => {
  const entries = await getBembaDictionaryEntries();
  const picked = [...entries].sort(() => Math.random() - 0.5).slice(0, 20);
  const questions = picked.slice(0, 10).map((entry, index) => {
    const wrongOptions = picked
      .filter((candidate, candidateIndex) => candidateIndex !== index && candidate.bemba !== entry.bemba)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .map((candidate) => candidate.bemba);
    return {
      word: entry.word,
      correct: entry.bemba,
      options: [...wrongOptions, entry.bemba].sort(() => Math.random() - 0.5),
    };
  });
  return c.json({ questions });
});

// Dictionary - users to challenge
app.get("/dictionary/challenge-users", async (c) => {
  const { getSession } = await import("@/lib/auth");
  const { db } = await import("@/lib/db");
  const { users } = await import("@/lib/db/schema");
  const { ilike, not, eq, and } = await import("drizzle-orm");
  const session = await getSession();
  const q = (c.req.query("q") ?? "").toLowerCase().trim();
  let qb = db.select({
    id: users.id,
    username: users.username,
    picture: users.picture,
    level: users.level,
    points: users.points,
    isOnline: sql<boolean>`(${users.lastSeen} IS NOT NULL AND ${users.lastSeen} >= NOW() - INTERVAL '1 minute')`,
  }).from(users);
  const conds: any[] = [];
  if (session) conds.push(not(eq(users.id, session.userId)));
  if (q) conds.push(ilike(users.username, `%${q}%`));
  const result = conds.length > 0 ? await qb.where(and(...conds)).limit(30) : await qb.limit(30);
  return c.json({ users: result });
});

// Dictionary - incoming challenges
app.get("/dictionary/challenges", async (c) => {
  const { getSession } = await import("@/lib/auth");
  const session = await getSession();
  if (!session) return c.json({ challenges: [] });
  const { db } = await import("@/lib/db");
  const { quizChallenges, users } = await import("@/lib/db/schema");
  const { eq, desc } = await import("drizzle-orm");
  const result = await db.select({
    id: quizChallenges.id, senderId: quizChallenges.senderId,
    senderScore: quizChallenges.senderScore, questions: quizChallenges.questions,
    status: quizChallenges.status, createdAt: quizChallenges.createdAt,
    senderUsername: users.username, senderPicture: users.picture,
  }).from(quizChallenges).leftJoin(users, eq(quizChallenges.senderId, users.id))
    .where(eq(quizChallenges.receiverId, session.userId)).orderBy(desc(quizChallenges.createdAt)).limit(20);
  return c.json({ challenges: result });
});

// Dictionary - challenges count (for badge)
app.get("/dictionary/challenges/count", async (c) => {
  const { getSession } = await import("@/lib/auth");
  const session = await getSession();
  if (!session) return c.json({ count: 0 });
  const { db } = await import("@/lib/db");
  const { quizChallenges } = await import("@/lib/db/schema");
  const { eq, and, count } = await import("drizzle-orm");
  const [row] = await db.select({ count: count() }).from(quizChallenges)
    .where(and(eq(quizChallenges.receiverId, session.userId), eq(quizChallenges.status, "pending")));
  return c.json({ count: Number(row?.count ?? 0) });
});

// Dictionary - send challenge
app.post("/dictionary/challenge/send", async (c) => {
  const { getSession } = await import("@/lib/auth");
  const session = await getSession();
  if (!session) return c.json({ error: "Unauthorized" }, 401);
  const { receiverId, questions, senderScore } = await c.req.json();
  const { db } = await import("@/lib/db");
  const { quizChallenges, notifications } = await import("@/lib/db/schema");
  await db.insert(quizChallenges).values({ senderId: session.userId, receiverId, questions: JSON.stringify(questions), senderScore, status: "pending" });
  await db.insert(notifications).values({ userId: receiverId, actorId: session.userId, type: "system", content: `${session.username} has challenged you to take a language quiz!` });
  return c.json({ success: true });
});

// Dictionary - decline challenge
app.post("/dictionary/challenges/:id/decline", async (c) => {
  const { getSession } = await import("@/lib/auth");
  const session = await getSession();
  if (!session) return c.json({ error: "Unauthorized" }, 401);
  const { db } = await import("@/lib/db");
  const { quizChallenges } = await import("@/lib/db/schema");
  const { and, eq } = await import("drizzle-orm");
  await db.delete(quizChallenges).where(and(eq(quizChallenges.id, c.req.param("id")), eq(quizChallenges.receiverId, session.userId)));
  return c.json({ success: true });
});

// Dictionary - complete accepted challenge
app.post("/dictionary/challenges/:id/complete", async (c) => {
  const { getSession } = await import("@/lib/auth");
  const session = await getSession();
  if (!session) return c.json({ error: "Unauthorized" }, 401);
  const { receiverScore } = await c.req.json();
  const { db } = await import("@/lib/db");
  const { quizChallenges, users, notifications } = await import("@/lib/db/schema");
  const { and, eq, sql } = await import("drizzle-orm");
  const [ch] = await db.select().from(quizChallenges).where(and(eq(quizChallenges.id, c.req.param("id")), eq(quizChallenges.receiverId, session.userId))).limit(1);
  if (!ch) return c.json({ error: "Not found" }, 404);
  const ss = ch.senderScore ?? 0;
  let result: "win" | "draw" | "lose";
  let rPts = 0, sPts = 0;
  if (receiverScore > ss) { result = "win"; rPts = 20; }
  else if (receiverScore === ss) { result = "draw"; rPts = 10; sPts = 10; }
  else { result = "lose"; sPts = 20; }
  if (rPts > 0) await db.update(users).set({ points: sql`${users.points} + ${rPts}` }).where(eq(users.id, session.userId));
  if (sPts > 0) await db.update(users).set({ points: sql`${users.points} + ${sPts}` }).where(eq(users.id, ch.senderId));
  const msg = result === "win" ? `You lost the language challenge! ${session.username} scored ${receiverScore}/10 vs your ${ss}/10`
    : result === "draw" ? `Language challenge draw! Both you and ${session.username} scored ${ss}/10. You each get 10 points.`
    : `You won the language challenge! You scored ${ss}/10 vs ${session.username}'s ${receiverScore}/10. You get 20 points!`;
  await db.insert(notifications).values({ userId: ch.senderId, actorId: session.userId, type: "system", content: msg });
  await db.update(quizChallenges).set({ status: "completed" }).where(eq(quizChallenges.id, ch.id));
  return c.json({ success: true, result, receiverPoints: rPts, senderPoints: sPts });
});

// Dictionary - leaderboard
app.get("/dictionary/leaderboard", async (c) => {
  const { db } = await import("@/lib/db");
  const { users } = await import("@/lib/db/schema");
  const { desc } = await import("drizzle-orm");
  const leaders = await db.select({ id: users.id, username: users.username, picture: users.picture, level: users.level, points: users.points }).from(users).orderBy(desc(users.points)).limit(10);
  return c.json({ leaders });
});

// Dictionary - save quiz points
app.post("/dictionary/quiz/save-points", async (c) => {
  const { getSession } = await import("@/lib/auth");
  const session = await getSession();
  if (!session) return c.json({ error: "Unauthorized" }, 401);
  const { points } = await c.req.json();
  if (!points || points <= 0) return c.json({ success: false });
  const { db } = await import("@/lib/db");
  const { users } = await import("@/lib/db/schema");
  const { eq, sql } = await import("drizzle-orm");
  await db.update(users).set({ points: sql`${users.points} + ${points}` }).where(eq(users.id, session.userId));
  return c.json({ success: true });
});

// Upload presign (Cloudflare R2)
app.post("/upload/presign", async (c) => {
  const { getSession } = await import("@/lib/auth");
  const session = await getSession();
  if (!session) return c.json({ error: "Unauthorized" }, 401);

  const { filename, contentType, fileSize } = await c.req.json();
  if (!filename || !contentType || typeof fileSize !== "number") {
    return c.json({ error: "filename, contentType and fileSize are required" }, 400);
  }

  const { getR2Directory, generatePresignedUrl } = await import("@/lib/r2");
  const { getMaxUploadBytes, getUploadRuleMessage } = await import("@/lib/uploadRules");

  const maxBytes = getMaxUploadBytes(contentType);
  if (fileSize > maxBytes) {
    return c.json({ error: getUploadRuleMessage(contentType) }, 400);
  }

  const dir = getR2Directory(contentType);
  const ext = (filename as string).split(".").pop() ?? "bin";
  const key = `${dir}/${session.userId}-${Date.now()}.${ext}`;

  const uploadUrl = await generatePresignedUrl(key, contentType);
  const publicBase = process.env.NEXT_PUBLIC_R2_PUBLIC_URL ?? "";
  const fileUrl = `${publicBase}/${key}`;

  return c.json({ uploadUrl, fileUrl, key });
});

app.post("/upload/file", async (c) => {
  try {
    const { getSession } = await import("@/lib/auth");
    const session = await getSession();
    if (!session) return c.json({ error: "Unauthorized" }, 401);

    const formData = await c.req.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) {
      return c.json({ error: "A file is required" }, 400);
    }

    const { getR2Directory, uploadBufferToR2 } = await import("@/lib/r2");
    const { getMaxUploadBytes, getUploadRuleMessage } = await import("@/lib/uploadRules");

    const maxBytes = getMaxUploadBytes(file.type);
    if (file.size > maxBytes) {
      return c.json({ error: getUploadRuleMessage(file.type) }, 400);
    }

    const ext = file.name.split(".").pop() ?? "bin";
    const dir = getR2Directory(file.type);
    const key = `${dir}/${session.userId}-${Date.now()}.${ext}`;
    const arrayBuffer = await file.arrayBuffer();
    await uploadBufferToR2(key, file.type, Buffer.from(arrayBuffer));

    const publicBase = process.env.NEXT_PUBLIC_R2_PUBLIC_URL ?? "";
    const fileUrl = `${publicBase}/${key}`;

    return c.json({ success: true, fileUrl, key });
  } catch (error) {
    console.error("Upload route failed", error);
    const message = error instanceof Error ? error.message : "Upload failed";
    return c.json({ error: message }, 500);
  }
});

// Recharge request (manual international payment confirmation)
app.post("/recharge", async (c) => {
  const { getSession } = await import("@/lib/auth");
  const session = await getSession();
  if (!session) return c.json({ error: "Unauthorized" }, 401);

  const body = await c.req.json();
  const amount = Number(body?.amount);
  const method = String(body?.method ?? "").trim();
  const transactionId = String(body?.transactionId ?? "").trim();

  if (!Number.isFinite(amount) || amount < 0.1) {
    return c.json({ error: "Invalid recharge amount." }, 400);
  }
  if (amount > 1000) {
    return c.json({ error: "Recharge amount is too large." }, 400);
  }
  if (!["international", "wise", "payoneer"].includes(method)) {
    return c.json({ error: "Only international manual payments use this confirmation flow." }, 400);
  }
  if (transactionId.length < 4) {
    return c.json({ error: "A valid payment reference is required." }, 400);
  }

  const points = Math.round(amount * 100);
  if (points < 10) {
    return c.json({ error: "Recharge must be at least 10 points." }, 400);
  }
  if (points > 100000) {
    return c.json({ error: "Recharge points cannot exceed 100000 in one request." }, 400);
  }

  const { db } = await import("@/lib/db");
  const { rechargeRequests } = await import("@/lib/db/schema");
  const { eq, and } = await import("drizzle-orm");

  const [existing] = await db
    .select({ id: rechargeRequests.id })
    .from(rechargeRequests)
    .where(and(eq(rechargeRequests.userId, session.userId), eq(rechargeRequests.transactionId, transactionId)))
    .limit(1);

  if (existing) {
    return c.json({ error: "This payment reference has already been submitted." }, 400);
  }

  await db.insert(rechargeRequests).values({
    userId: session.userId,
    amount: String(amount),
    points: String(points),
    method,
    transactionId,
    status: "pending",
  });

  return c.json({ success: true, message: "International payment submitted for verification." });
});

app.post("/recharge/international-link", async (c) => {
  const { getSession } = await import("@/lib/auth");
  const session = await getSession();
  if (!session) return c.json({ error: "Unauthorized" }, 401);

  const body = await c.req.json();
  const points = Number(body?.points);
  const amount = Number(body?.amount);
  const wiseLink = process.env.WISE_PAYMENT_LINK || process.env.NEXT_PUBLIC_WISE_PAYMENT_LINK || "";
  const payoneerLink = process.env.PAYONEER_PAYMENT_LINK || process.env.NEXT_PUBLIC_PAYONEER_PAYMENT_LINK || "";
  const baseLink = wiseLink || payoneerLink;
  const provider = wiseLink ? "Wise" : payoneerLink ? "Payoneer" : "";

  if (!Number.isFinite(points) || points < 10 || !Number.isInteger(points)) {
    return c.json({ error: "Invalid points amount." }, 400);
  }
  if (!Number.isFinite(amount) || amount < 0.1) {
    return c.json({ error: "Invalid payment amount." }, 400);
  }
  if (!baseLink) {
    return c.json({ error: "International payment is not configured." }, 500);
  }

  return c.json({
    success: true,
    url: buildAmountLink(baseLink, amount),
    amount: amount.toFixed(2),
    points,
    provider,
  });
});

app.post("/recharge/mobile-money/initiate", async (c) => {
  const { getSession } = await import("@/lib/auth");
  const session = await getSession();
  if (!session) return c.json({ error: "Unauthorized" }, 401);

  const body = await c.req.json();
  const amount = Number(body?.amount);
  const points = Number(body?.points);
  const phoneRaw = String(body?.phone ?? "").trim();
  const authId = process.env.MU_AUTH_ID || "";

  if (!Number.isFinite(amount) || amount < 0.1 || amount > 1000) {
    return c.json({ error: "Invalid recharge amount." }, 400);
  }
  if (!Number.isFinite(points) || points < 10 || points > 100000 || !Number.isInteger(points)) {
    return c.json({ error: "Invalid points amount." }, 400);
  }
  if (!authId) {
    return c.json({ error: "Mobile money is not configured." }, 500);
  }

  let cleanPhone = phoneRaw.replace(/\s+/g, "");
  if (/^260\d{9}$/.test(cleanPhone)) {
    cleanPhone = `0${cleanPhone.substring(3)}`;
  }
  if (!/^0\d{9}$/.test(cleanPhone)) {
    return c.json({ error: "Invalid Zambian phone number." }, 400);
  }

  const muResp = await fetch("https://api.moneyunify.one/payments/request", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body: new URLSearchParams({
      from_payer: cleanPhone,
      amount: amount.toFixed(2),
      auth_id: authId,
    }).toString(),
  });

  const muData = await muResp.json().catch(() => null);
  const txRef = muData?.data?.transaction_id ? String(muData.data.transaction_id) : "";
  if (!muResp.ok || !muData || !txRef) {
    return c.json({ error: muData?.message || "Payment initiation failed. Try again." }, 400);
  }
  const { db } = await import("@/lib/db");
  const { rechargeRequests } = await import("@/lib/db/schema");

  await db.insert(rechargeRequests).values({
    userId: session.userId,
    amount: amount.toFixed(2),
    points: String(points),
    method: "mobile_money",
    transactionId: txRef,
    status: "pending",
  });

  return c.json({
    success: true,
    txRef,
    message:
      muData?.message ||
      "Check your phone for a payment prompt. Enter your PIN to confirm.",
  });
});

app.post("/recharge/mobile-money/verify", async (c) => {
  const { getSession } = await import("@/lib/auth");
  const session = await getSession();
  if (!session) return c.json({ error: "Unauthorized" }, 401);

  const body = await c.req.json();
  const txRef = String(body?.txRef ?? "").trim();
  const authId = process.env.MU_AUTH_ID || "";

  if (!txRef) return c.json({ error: "Transaction reference is required." }, 400);

  const { db } = await import("@/lib/db");
  const { rechargeRequests, users, notifications } = await import("@/lib/db/schema");
  const { eq, and } = await import("drizzle-orm");
  const { getUserLevel } = await import("@/lib/utils");

  const [recharge] = await db
    .select()
    .from(rechargeRequests)
    .where(and(eq(rechargeRequests.userId, session.userId), eq(rechargeRequests.transactionId, txRef)))
    .limit(1);

  if (!recharge) return c.json({ error: "Payment not found." }, 404);

  if (recharge.status === "approved") {
    return c.json({ success: true, status: "successful", message: "Payment already confirmed." });
  }
  if (recharge.status === "failed") {
    return c.json({ success: true, status: "failed", message: "This payment failed." });
  }
  if (!authId) {
    return c.json({ success: true, status: "pending", message: "Payment is still pending verification." });
  }

  const muResp = await fetch("https://api.moneyunify.one/payments/verify", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body: new URLSearchParams({
      transaction_id: txRef,
      auth_id: authId,
    }).toString(),
  });
  const muData = await muResp.json().catch(() => null);

  if (!muResp.ok || !muData || muData.isError || !muData.data) {
    return c.json({ success: true, status: "pending", message: muData?.message || "Payment is still pending." });
  }

  const txStatus = String(muData.data.status ?? "").toLowerCase();
  if (txStatus === "successful") {
    const [currentUser] = await db
      .select({ points: users.points })
      .from(users)
      .where(eq(users.id, session.userId))
      .limit(1);

    const newPoints = parseFloat(String(currentUser?.points ?? 0)) + parseFloat(String(recharge.points));
    const newLevel = getUserLevel(newPoints);

    await db.update(users).set({ points: String(newPoints), level: newLevel as typeof users.level._.data }).where(eq(users.id, session.userId));
    await db
      .update(rechargeRequests)
      .set({ status: "approved", processedAt: new Date() })
      .where(eq(rechargeRequests.id, recharge.id));
    await db.insert(notifications).values({
      userId: session.userId,
      actorId: session.userId,
      type: "system",
      content: `Your mobile money payment for ${recharge.points} points was successful.`,
    });

    return c.json({ success: true, status: "successful", message: "Payment confirmed and points added." });
  }

  if (txStatus === "failed") {
    await db.update(rechargeRequests).set({ status: "failed", processedAt: new Date() }).where(eq(rechargeRequests.id, recharge.id));
    return c.json({ success: true, status: "failed", message: "Payment failed." });
  }

  return c.json({ success: true, status: "pending", message: "Payment is still pending." });
});

export const GET = handle(app);
export const POST = handle(app);
export const PUT = handle(app);
export const PATCH = handle(app);
export const DELETE = handle(app);
