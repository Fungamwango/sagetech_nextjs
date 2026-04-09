import { NextRequest, NextResponse } from "next/server";
// @ts-ignore
import htmlContent from "../../../../../public/original/coding/html_tutorial/index.php?raw";
// @ts-ignore
import htmlStyle from "../../../../../public/original/coding/html_tutorial/css/style.css?raw";
// @ts-ignore
import cssContent from "../../../../../public/original/coding/css_tutorial/index.php?raw";
// @ts-ignore
import cssStyle from "../../../../../public/original/coding/css_tutorial/css/style.css?raw";
// @ts-ignore
import sagejsContent from "../../../../../public/original/coding/sage-js_tutorial/index.html?raw";
// @ts-ignore
import sagejsStyle from "../../../../../public/original/coding/sage-js_tutorial/css/style.css?raw";
// @ts-ignore
import shellStyle from "../../../../../public/original/coding/css/style.css?raw";

const TUTORIAL_MAP = {
  html: { content: htmlContent as string, style: htmlStyle as string, title: "Learn HTML" },
  css: { content: cssContent as string, style: cssStyle as string, title: "Learn CSS" },
  sagejs: { content: sagejsContent as string, style: sagejsStyle as string, title: "Learn Sage.js" },
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

  const html = `<!doctype html>
  <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no" />
      <title>${tutorial.title}</title>
      <base href="${req.nextUrl.origin}/original/coding/" />
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css" />
      <style>
        body { margin: 0; padding: 0; background: rgb(245, 245, 255); color: rgba(0, 0, 0, 0.84); }
        ${shellStyle as string}
        ${tutorial.style}
      </style>
      <script src="${req.nextUrl.origin}/original/sage-js/sage-js.js"></script>
    </head>
    <body>${cleanupContent(tutorial.content)}</body>
  </html>`;

  return new NextResponse(html, { headers: { "content-type": "text/html; charset=utf-8" } });
}
