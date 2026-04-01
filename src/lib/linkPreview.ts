type LinkPreview = {
  url: string;
  title: string;
  description: string;
  image: string;
};

const URL_ONLY_PATTERN = /^(https?:\/\/|www\.)[^\s]+$/i;
const URL_PATTERN = /(?:https?:\/\/|www\.)[^\s]+/i;

function normaliseLinkInput(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.startsWith("http://") || trimmed.startsWith("https://")
    ? trimmed
    : `https://${trimmed}`;
}

function isPrivateHostname(hostname: string) {
  const value = hostname.toLowerCase();
  if (
    value === "localhost" ||
    value === "::1" ||
    value.endsWith(".local") ||
    value === "0.0.0.0"
  ) {
    return true;
  }

  if (/^\d+\.\d+\.\d+\.\d+$/.test(value)) {
    const parts = value.split(".").map(Number);
    const [a, b] = parts;
    if (a === 10 || a === 127) return true;
    if (a === 192 && b === 168) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 169 && b === 254) return true;
  }

  return false;
}

function decodeHtml(value: string) {
  return value
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">");
}

function stripTags(value: string) {
  return decodeHtml(value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim());
}

function extractMeta(html: string, key: string, attribute: "property" | "name" = "property") {
  const pattern = new RegExp(
    `<meta[^>]+${attribute}=["']${key}["'][^>]+content=["']([^"']+)["'][^>]*>|<meta[^>]+content=["']([^"']+)["'][^>]+${attribute}=["']${key}["'][^>]*>`,
    "i"
  );
  const match = html.match(pattern);
  return stripTags(match?.[1] || match?.[2] || "");
}

function extractTitle(html: string) {
  const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return stripTags(match?.[1] || "");
}

function makeAbsoluteUrl(baseUrl: string, value: string) {
  if (!value) return "";
  try {
    return new URL(value, baseUrl).toString();
  } catch {
    return value;
  }
}

export function isLinkOnlyPostText(value?: string | null) {
  const trimmed = value?.trim() ?? "";
  return URL_ONLY_PATTERN.test(trimmed);
}

export function extractFirstUrlFromText(value?: string | null) {
  const match = (value ?? "").match(URL_PATTERN);
  return match?.[0] ?? null;
}

export async function fetchLinkPreviewFromText(value?: string | null): Promise<LinkPreview | null> {
  const extracted = extractFirstUrlFromText(value);
  if (!extracted) return null;

  const normalised = normaliseLinkInput(extracted);
  if (!normalised) return null;

  let url: URL;
  try {
    url = new URL(normalised);
  } catch {
    return null;
  }

  if (!["http:", "https:"].includes(url.protocol) || isPrivateHostname(url.hostname)) {
    return null;
  }

  try {
    const response = await fetch(url.toString(), {
      headers: {
        "User-Agent": "SageTechLinkPreviewBot/1.0",
        Accept: "text/html,application/xhtml+xml",
      },
      redirect: "follow",
      cache: "no-store",
    });

    if (!response.ok) return null;
    const contentType = response.headers.get("content-type") ?? "";
    if (!contentType.includes("text/html")) return null;

    const html = await response.text();
    const title =
      extractMeta(html, "og:title") ||
      extractMeta(html, "twitter:title", "name") ||
      extractTitle(html);
    const description =
      extractMeta(html, "og:description") ||
      extractMeta(html, "twitter:description", "name") ||
      extractMeta(html, "description", "name");
    const image = makeAbsoluteUrl(
      url.toString(),
      extractMeta(html, "og:image") || extractMeta(html, "twitter:image", "name")
    );

    if (!title && !description && !image) return null;

    return {
      url: url.toString(),
      title: title || url.hostname,
      description,
      image,
    };
  } catch {
    return null;
  }
}
