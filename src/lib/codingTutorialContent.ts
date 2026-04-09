// @ts-ignore
import htmlContent from "../../public/original/coding/html_tutorial/index.php?raw";
// @ts-ignore
import htmlStyle from "../../public/original/coding/html_tutorial/css/style.css?raw";
// @ts-ignore
import cssContent from "../../public/original/coding/css_tutorial/index.php?raw";
// @ts-ignore
import cssStyle from "../../public/original/coding/css_tutorial/css/style.css?raw";
// @ts-ignore
import sagejsContent from "../../public/original/coding/sage-js_tutorial/index.html?raw";
// @ts-ignore
import sagejsStyle from "../../public/original/coding/sage-js_tutorial/css/style.css?raw";
// @ts-ignore
import shellStyle from "../../public/original/coding/css/style.css?raw";

export type CodingTutorialId = "html" | "css" | "sagejs";

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
  return {
    html: {
      title: "Learn HTML",
      wrapperId: "html_tutorial_wrapper",
      contentHtml: cleanupContent(htmlContent as string, "html_tutorial_wrapper"),
      styleCss: `${shellStyle as string}\n${htmlStyle as string}`,
    },
    css: {
      title: "Learn CSS",
      wrapperId: "css-tutorial-wrapper",
      contentHtml: cleanupContent(cssContent as string, "css-tutorial-wrapper"),
      styleCss: `${shellStyle as string}\n${cssStyle as string}`,
    },
    sagejs: {
      title: "Learn Sage.js",
      wrapperId: "tutorial-wrapper",
      contentHtml: cleanupContent(sagejsContent as string, "tutorial-wrapper"),
      styleCss: `${shellStyle as string}\n${sagejsStyle as string}`,
    },
  } as Record<CodingTutorialId, { title: string; wrapperId: string; contentHtml: string; styleCss: string }>;
}
