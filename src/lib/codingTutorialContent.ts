import fs from "node:fs/promises";
import path from "node:path";

export type CodingTutorialId = "html" | "css" | "sagejs";

type TutorialSource = {
  content: string[];
  style: string[];
  wrapperId: string;
  title: string;
};

const TUTORIAL_SOURCES: Record<CodingTutorialId, TutorialSource> = {
  html: {
    content: ["public", "original", "coding", "html_tutorial", "index.php"],
    style: ["public", "original", "coding", "html_tutorial", "css", "style.css"],
    wrapperId: "html_tutorial_wrapper",
    title: "Learn HTML",
  },
  css: {
    content: ["public", "original", "coding", "css_tutorial", "index.php"],
    style: ["public", "original", "coding", "css_tutorial", "css", "style.css"],
    wrapperId: "css-tutorial-wrapper",
    title: "Learn CSS",
  },
  sagejs: {
    content: ["public", "original", "coding", "sage-js_tutorial", "index.html"],
    style: ["public", "original", "coding", "sage-js_tutorial", "css", "style.css"],
    wrapperId: "tutorial-wrapper",
    title: "Learn Sage.js",
  },
};

function stripPhp(raw: string) {
  return raw.replace(/<\?(?:php)?[\s\S]*?\?>/gi, "");
}

function extractWrapper(raw: string, wrapperId: string) {
  const pattern = new RegExp(`<div id=["']${wrapperId}["'][\\s\\S]*<\\/div>\\s*$`, "i");
  const match = raw.match(pattern);
  return match ? match[0] : raw;
}

function cleanupContent(raw: string, wrapperId: string) {
  return extractWrapper(stripPhp(raw), wrapperId)
    .replace(/<meta[^>]*viewport[^>]*>\s*/gi, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<div id="scroll-up"[\s\S]*?<\/div>/i, "")
    .replace(/Ã¢â‚¬Â¢/g, "&bull;")
    .replace(/â€¢/g, "&bull;");
}

export async function getCodingTutorialContent() {
  const entries = await Promise.all(
    (Object.entries(TUTORIAL_SOURCES) as Array<[CodingTutorialId, TutorialSource]>).map(async ([id, source]) => {
      const contentPath = path.join(process.cwd(), ...source.content);
      const stylePath = path.join(process.cwd(), ...source.style);
      const shellStylePath = path.join(process.cwd(), "public", "original", "coding", "css", "style.css");

      const [rawContent, tutorialCss, shellCss] = await Promise.all([
        fs.readFile(contentPath, "utf8"),
        fs.readFile(stylePath, "utf8"),
        fs.readFile(shellStylePath, "utf8"),
      ]);

      return [
        id,
        {
          title: source.title,
          wrapperId: source.wrapperId,
          contentHtml: cleanupContent(rawContent, source.wrapperId),
          styleCss: `${shellCss}\n${tutorialCss}`,
        },
      ] as const;
    })
  );

  return Object.fromEntries(entries) as Record<
    CodingTutorialId,
    { title: string; wrapperId: string; contentHtml: string; styleCss: string }
  >;
}
