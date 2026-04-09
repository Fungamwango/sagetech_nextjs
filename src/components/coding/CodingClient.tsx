"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Script from "next/script";
import type { ReactNode } from "react";

type TutorialId = "html" | "css" | "sagejs";

const TUTORIALS: {
  id: TutorialId;
  label: string;
  title: string;
  icon: string;
  topics: { id: string; label: string }[];
}[] = [
  {
    id: "html",
    label: "Learn HTML",
    title: "HTML",
    icon: "fab fa-html5",
    topics: [
      { id: "html-intro", label: "HTML Intro" },
      { id: "html-elements", label: "Elements" },
      { id: "html-attributes", label: "Attributes" },
      { id: "html-headings", label: "Headings" },
      { id: "html-marquee", label: "Marquee" },
      { id: "html-paragraphs", label: "Paragraphs" },
      { id: "html-style", label: "Style" },
      { id: "html-comments", label: "Comments" },
      { id: "html-links", label: "Links" },
      { id: "html-tables", label: "Tables" },
      { id: "html-list", label: "List" },
      { id: "html-iframes", label: "Iframe" },
      { id: "html-images", label: "Images" },
      { id: "html-video", label: "Video" },
      { id: "html-audio", label: "Audio" },
      { id: "html-form", label: "Form" },
      { id: "html-inputs", label: "Inputs" },
      { id: "html-textarea", label: "Textarea" },
      { id: "html-button", label: "Button" },
      { id: "html-select", label: "Select" },
      { id: "html-javascript", label: "Javascript" },
    ],
  },
  {
    id: "css",
    label: "Learn CSS",
    title: "CSS",
    icon: "fab fa-css3-alt",
    topics: [
      { id: "css-intro", label: "CSS Intro" },
      { id: "css-syntax", label: "Syntax" },
      { id: "css-backgrounds", label: "Backgrounds" },
      { id: "css-margin", label: "Margins" },
      { id: "css-padding", label: "Paddings" },
      { id: "css-border", label: "Borders" },
      { id: "css-text", label: "Text" },
      { id: "css-font", label: "Font" },
      { id: "css-display", label: "Display" },
      { id: "css-position", label: "Position" },
      { id: "css-colors", label: "Colors" },
    ],
  },
  {
    id: "sagejs",
    label: "Learn Sage.js",
    title: "Sage.js",
    icon: "fas fa-code",
    topics: [
      { id: "intro", label: "Intro" },
      { id: "hide()", label: "hide()" },
      { id: "show()", label: "show()" },
      { id: "toggle()", label: "toggle()" },
      { id: "getValue()", label: "getValue()" },
      { id: "setValue()", label: "setValue()" },
      { id: "getHTML()", label: "getHTML()" },
      { id: "setHTML()", label: "setHTML()" },
      { id: "toggleHTML()", label: "toggleHTML()" },
      { id: "appendHTML()", label: "appendHTML()" },
      { id: "prependHTML()", label: "prependHTML()" },
      { id: "getAttr()", label: "getAttr()" },
      { id: "setAttr()", label: "setAttr()" },
      { id: "when()", label: "when()" },
      { id: "E()", label: "E()" },
      { id: "getStyle()", label: "getStyle()" },
      { id: "setStyle()", label: "setStyle()" },
      { id: "addClass()", label: "addClass()" },
      { id: "removeClass()", label: "removeClass()" },
      { id: "toggleClass()", label: "toggleClass()" },
      { id: "slideShow()", label: "slideShow()" },
      { id: "loadData()", label: "loadData()" },
      { id: "sendData()", label: "sendData()" },
      { id: "filePreview()", label: "filePreview()" },
      { id: "myLocation()", label: "myLocation()" },
      { id: "locationByIp()", label: "locationByIp()" },
      { id: "copyText()", label: "copyText()" },
      { id: "clock()", label: "clock()" },
      { id: "countDown()", label: "countDown()" },
      { id: "after()", label: "after()" },
      { id: "every()", label: "every()" },
      { id: "stop()", label: "stop()" },
      { id: "dragDrop()", label: "dragDrop()" },
      { id: "createFile()", label: "createFile()" },
      { id: "random()", label: "random()" },
      { id: "createSPA()", label: "createSPA()" },
    ],
  },
];

function SelectionPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-white/55">
      <span className="mr-1 uppercase tracking-[0.12em] text-white/35">{label}</span>
      <span className="text-white/75">{value}</span>
    </div>
  );
}

function ModernDropdown({
  label,
  value,
  open,
  onToggle,
  children,
}: {
  label: string;
  value: string;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  return (
    <div className="relative min-w-0">
      <button
        type="button"
        className={`flex min-h-[58px] w-full items-center justify-between gap-3 rounded-[16px] border px-4 py-3 text-left transition-all ${
          open
            ? "border-cyan-400/35 bg-[rgba(18,62,74,0.92)] shadow-[0_14px_34px_rgba(0,0,0,0.28)]"
            : "border-white/10 bg-[rgba(255,255,255,0.04)] hover:border-white/18 hover:bg-[rgba(255,255,255,0.06)]"
        }`}
        onClick={onToggle}
      >
        <span className="min-w-0">
          <span className="block text-[10px] uppercase tracking-[0.16em] text-white/38">{label}</span>
          <span className="mt-1 block truncate text-sm font-medium text-white/88">{value}</span>
        </span>
        <i
          className={`fa fa-chevron-down text-[12px] text-white/55 transition-transform ${
            open ? "rotate-180 text-cyan-300" : ""
          }`}
        />
      </button>
      <div
        className={`absolute left-0 top-full z-20 mt-2 max-h-80 w-full overflow-y-auto rounded-[18px] border border-white/10 bg-[linear-gradient(180deg,rgba(10,30,40,0.985),rgba(6,18,28,0.985))] p-2 shadow-[0_26px_70px_rgba(0,0,0,0.42)] ${
          open ? "block" : "hidden"
        }`}
      >
        {children}
      </div>
    </div>
  );
}

function DropdownList({
  items,
  activeId,
  onSelect,
}: {
  items: { id: string; label: string }[];
  activeId: string;
  onSelect: (item: { id: string; label: string }) => void;
}) {
  return (
    <div className="grid gap-1.5">
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          className={`block w-full rounded-[12px] px-3 py-2.5 text-left text-sm transition-colors ${
            activeId === item.id
              ? "bg-cyan-400/12 text-cyan-300"
              : "text-white/72 hover:bg-white/[0.04] hover:text-white"
          }`}
          onClick={() => onSelect(item)}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}

export default function CodingClient({
  tutorialContent,
}: {
  tutorialContent: Record<TutorialId, { title: string; wrapperId: string; contentHtml: string; styleCss: string }>;
}) {
  const [tutorialId, setTutorialId] = useState<TutorialId>("html");
  const [topicId, setTopicId] = useState<string>("html-intro");
  const [showTutorials, setShowTutorials] = useState(false);
  const [showTopics, setShowTopics] = useState(false);
  const shellRef = useRef<HTMLDivElement | null>(null);

  const tutorial = useMemo(
    () => TUTORIALS.find((item) => item.id === tutorialId) ?? TUTORIALS[0],
    [tutorialId]
  );
  const activeTutorialContent = tutorialContent[tutorialId];
  const activeTopicLabel =
    tutorial.topics.find((topic) => topic.id === topicId)?.label ?? tutorial.topics[0]?.label ?? "Topics";

  const findTopicTarget = (nextTutorialId: TutorialId, nextTopicId: string) => {
    const shell = shellRef.current;
    if (!shell) return null;

    const byId = shell.querySelector<HTMLElement>(`#${CSS.escape(nextTopicId)}`);
    if (byId) return byId;

    const topic = TUTORIALS.find((item) => item.id === nextTutorialId)?.topics.find((item) => item.id === nextTopicId);
    if (!topic) return null;

    const normalizedLabel = topic.label.trim().toLowerCase();
    const headings = Array.from(shell.querySelectorAll<HTMLElement>("section h1, section h2, section h3, h1, h2, h3"));
    return (
      headings.find((heading) => {
        const text = heading.textContent?.trim().toLowerCase() ?? "";
        return text.startsWith(normalizedLabel);
      }) ?? null
    );
  };

  useEffect(() => {
    const hash = window.location.hash.replace(/^#/, "");
    if (!hash) return;

    for (const item of TUTORIALS) {
      const topic = item.topics.find((entry) => entry.id === hash);
      if (topic) {
        setTutorialId(item.id);
        setTopicId(topic.id);
        return;
      }
    }
  }, []);

  useEffect(() => {
    const shell = shellRef.current;
    if (!shell) return;

    const handle = window.setTimeout(() => {
      const target = findTopicTarget(tutorialId, topicId);
      target?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 0);

    return () => window.clearTimeout(handle);
  }, [tutorialId, topicId]);

  const jumpTo = (nextTutorialId: TutorialId, nextTopicId: string) => {
    setTutorialId(nextTutorialId);
    setTopicId(nextTopicId);
    window.history.replaceState(null, "", `#${nextTopicId}`);
  };

  return (
    <div className="space-y-3">
      <Script src="/original/sage-js/sage-js.js" strategy="afterInteractive" />

      <div id="post-navbar" className="mb-3">
        <div className="mb-3 flex flex-wrap items-start justify-between gap-3 rounded-[18px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.015))] p-3">
          <div className="min-w-0">
            <div id="title">
              <i className="fa fa-code" /> Coding...
            </div>
            <p className="mt-1 text-sm text-white/50">
              Learn HTML, CSS, and Sage.js with simple interactive tutorials.
            </p>
          </div>


        </div>

        <div className="grid grid-cols-2 gap-3">
          <ModernDropdown
            label="Tutorials"
            value={tutorial.label}
            open={showTutorials}
            onToggle={() => {
              setShowTutorials((current) => !current);
              setShowTopics(false);
            }}
          >
            <DropdownList
              items={TUTORIALS.map((item) => ({ id: item.id, label: item.label }))}
              activeId={tutorialId}
              onSelect={(item) => {
                const nextTutorial = TUTORIALS.find((entry) => entry.id === item.id) ?? TUTORIALS[0];
                const nextTopicId = nextTutorial.topics[0]?.id ?? "";
                setTutorialId(nextTutorial.id);
                setTopicId(nextTopicId);
                if (nextTopicId) {
                  window.history.replaceState(null, "", `#${nextTopicId}`);
                }
                setShowTutorials(false);
              }}
            />
          </ModernDropdown>

          <ModernDropdown
            label="Topics"
            value={activeTopicLabel}
            open={showTopics}
            onToggle={() => {
              setShowTopics((current) => !current);
              setShowTutorials(false);
            }}
          >
            <DropdownList
              items={tutorial.topics}
              activeId={topicId}
              onSelect={(topic) => {
                jumpTo(tutorialId, topic.id);
                setShowTopics(false);
              }}
            />
          </ModernDropdown>
        </div>
      </div>

      <div className="overflow-hidden rounded-[18px] border border-white/10 bg-white/[0.03]">
        <style
          dangerouslySetInnerHTML={{
            __html: `
              .coding-tutorial-shell { background: rgb(245,245,255); color: rgba(0,0,0,0.84); }
              .coding-tutorial-shell ${activeTutorialContent.styleCss}
              .coding-tutorial-shell #scroll-up { display: none; }
            `,
          }}
        />
        <div ref={shellRef} className="coding-tutorial-shell max-h-[78vh] overflow-y-auto">
          <div dangerouslySetInnerHTML={{ __html: activeTutorialContent.contentHtml }} />
        </div>
      </div>
    </div>
  );
}
