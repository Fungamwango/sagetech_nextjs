"use client";

import { useEffect, useRef } from "react";

type AdsterraBannerEmbedProps = {
  code: string;
  className?: string;
};

export default function AdsterraBannerEmbed({ code, className }: AdsterraBannerEmbedProps) {
  const hostRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    host.innerHTML = "";

    const template = document.createElement("template");
    template.innerHTML = code;

    Array.from(template.content.childNodes).forEach((node) => {
      if (node.nodeName.toLowerCase() === "script") {
        const original = node as HTMLScriptElement;
        const script = document.createElement("script");
        Array.from(original.attributes).forEach((attr) => script.setAttribute(attr.name, attr.value));
        script.text = original.text;
        host.appendChild(script);
        return;
      }
      host.appendChild(node.cloneNode(true));
    });
  }, [code]);

  return <div ref={hostRef} className={className} />;
}
