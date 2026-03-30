import { NextRequest, NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";

function stripPhp(raw: string) {
  return raw.replace(/<\?(?:php)?[\s\S]*?\?>/gi, "");
}

function cleanupContent(raw: string) {
  return stripPhp(raw)
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/^\s*<!--[\s\S]*?-->\s*/i, "")
    .replace(/â€¢/g, "&bull;");
}

export async function GET(req: NextRequest) {
  const contentPath = path.join(
    process.cwd(),
    "public",
    "original",
    "bible_study",
    "bible",
    "index.php"
  );
  const shellStylePath = path.join(
    process.cwd(),
    "public",
    "original",
    "bible_study",
    "css",
    "style.css"
  );
  const contentStylePath = path.join(
    process.cwd(),
    "public",
    "original",
    "bible_study",
    "bible",
    "css",
    "style.css"
  );

  const [rawContent, shellCss, contentCss] = await Promise.all([
    fs.readFile(contentPath, "utf8"),
    fs.readFile(shellStylePath, "utf8"),
    fs.readFile(contentStylePath, "utf8"),
  ]);

  const html = `<!doctype html>
  <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no" />
      <title>Bible Study</title>
      <base href="${req.nextUrl.origin}/original/bible_study/" />
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css" />
      <style>
        body {
          margin: 0;
          padding: 12px;
          background: rgb(245, 245, 255);
          color: rgba(0, 0, 0, 0.84);
        }
        #scroll-up {
          position: sticky;
          top: 10px;
          margin-left: auto;
          width: 34px;
          height: 34px;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10;
        }
        ${shellCss}
        ${contentCss}
      </style>
    </head>
    <body>
      ${cleanupContent(rawContent)}
    </body>
  </html>`;

  return new NextResponse(html, {
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}
