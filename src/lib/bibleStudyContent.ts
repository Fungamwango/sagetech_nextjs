import fs from "node:fs/promises";
import path from "node:path";

function stripPhp(raw: string) {
  return raw.replace(/<\?(?:php)?[\s\S]*?\?>/gi, "");
}

function extractBibleWrapper(raw: string) {
  const match = raw.match(/<div id="bible-wrapper">[\s\S]*<\/div>\s*$/i);
  return match ? match[0] : raw;
}

function cleanupContent(raw: string) {
  return extractBibleWrapper(stripPhp(raw))
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<div id="scroll-up"[\s\S]*?<\/div>/i, "")
    .replace(/Ã¢â‚¬Â¢/g, "&bull;")
    .replace(/â€¢/g, "&bull;");
}

export async function getBibleStudyContent() {
  const contentPath = path.join(
    process.cwd(),
    "public",
    "original",
    "bible_study",
    "bible",
    "index.php"
  );

  const rawContent = await fs.readFile(contentPath, "utf8");
  return cleanupContent(rawContent);
}
