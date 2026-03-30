import { NextRequest, NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";

const TUTORIAL_MAP = {
  html: {
    content: ["public", "original", "coding", "html_tutorial", "index.php"],
    style: ["public", "original", "coding", "html_tutorial", "css", "style.css"],
    title: "Learn HTML",
  },
  css: {
    content: ["public", "original", "coding", "css_tutorial", "index.php"],
    style: ["public", "original", "coding", "css_tutorial", "css", "style.css"],
    title: "Learn CSS",
  },
  sagejs: {
    content: ["public", "original", "coding", "sage-js_tutorial", "index.html"],
    style: ["public", "original", "coding", "sage-js_tutorial", "css", "style.css"],
    title: "Learn Sage.js",
  },
} as const;

function stripPhp(raw: string) {
  return raw.replace(/<\?(?:php)?[\s\S]*?\?>/gi, "");
}

function cleanupContent(raw: string) {
  return stripPhp(raw)
    .replace(/<meta[^>]*viewport[^>]*>\s*/gi, "")
    .replace(/<script>[\s\S]*?location\.assign\([\s\S]*?<\/script>/gi, "")
    .replace(/<script>[\s\S]*?\$\(document\)\.ready[\s\S]*?<\/script>/gi, "")
    .replace(/<script>[\s\S]*?window\.onclick[\s\S]*?<\/script>/gi, "");
}

export async function GET(req: NextRequest) {
  const type = (req.nextUrl.searchParams.get("type") ?? "html") as keyof typeof TUTORIAL_MAP;
  const tutorial = TUTORIAL_MAP[type] ?? TUTORIAL_MAP.html;

  const contentPath = path.join(process.cwd(), ...tutorial.content);
  const stylePath = path.join(process.cwd(), ...tutorial.style);
  const shellStylePath = path.join(process.cwd(), "public", "original", "coding", "css", "style.css");

  const [rawContent, tutorialCss, shellCss] = await Promise.all([
    fs.readFile(contentPath, "utf8"),
    fs.readFile(stylePath, "utf8"),
    fs.readFile(shellStylePath, "utf8"),
  ]);

  const html = `<!doctype html>
  <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no" />
      <title>${tutorial.title}</title>
      <base href="${req.nextUrl.origin}/original/coding/" />
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css" />
      <style>
        body {
          margin: 0;
          padding: 0;
          background: rgb(245, 245, 255);
          color: rgba(0, 0, 0, 0.84);
        }
        ${shellCss}
        ${tutorialCss}
      </style>
      <script src="${req.nextUrl.origin}/original/sage-js/sage-js.js"></script>
    </head>
    <body>
      ${cleanupContent(rawContent)}
    </body>
  </html>`;

  return new NextResponse(html, {
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}
