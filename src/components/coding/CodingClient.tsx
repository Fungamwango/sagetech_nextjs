"use client";

import { useMemo, useState } from "react";

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

export default function CodingClient() {
  const [tutorialId, setTutorialId] = useState<TutorialId>("html");
  const [topicId, setTopicId] = useState<string>("html-intro");
  const [showTutorials, setShowTutorials] = useState(false);
  const [showTopics, setShowTopics] = useState(false);

  const tutorial = useMemo(
    () => TUTORIALS.find((item) => item.id === tutorialId) ?? TUTORIALS[0],
    [tutorialId]
  );

  const iframeSrc = useMemo(() => {
    const hash = topicId ? `#${encodeURIComponent(topicId)}` : "";
    return `/api/coding/tutorial?type=${tutorialId}${hash}`;
  }, [tutorialId, topicId]);

  return (
    <div>
      <div id="post-navbar" className="mb-3">
        <div id="title">
          <i className="fa fa-code" /> Coding...
        </div>

        <div className="post-links-wrapper">
          <div className="dropdown-wrapper block">
            <button
              type="button"
              className="post-links w-full"
              onClick={() => {
                setShowTutorials((current) => !current);
                setShowTopics(false);
              }}
            >
              <span id="tools-span">Tutorials</span> <i className="fa fa-chevron-down" />
            </button>
            <div className={`dropdown-content !static !w-full !p-2 ${showTutorials ? "!block" : "!hidden"}`}>
              {TUTORIALS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`block w-full border-b border-white/15 py-3 text-left text-sm ${tutorialId === item.id ? "text-cyan-400" : "text-white/75"}`}
                  onClick={() => {
                    setTutorialId(item.id);
                    setTopicId(item.topics[0]?.id ?? "");
                    setShowTutorials(false);
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="dropdown-wrapper block">
            <button
              type="button"
              className="post-links w-full"
              onClick={() => {
                setShowTopics((current) => !current);
                setShowTutorials(false);
              }}
            >
              <span id="topics-span">Topics</span> <i className="fa fa-chevron-down" />
            </button>
            <div className={`dropdown-content !static !w-full !max-h-64 !overflow-y-auto !p-2 ${showTopics ? "!block" : "!hidden"}`}>
              {tutorial.topics.map((topic) => (
                <button
                  key={topic.id}
                  type="button"
                  className={`block w-full border-b border-white/15 py-3 text-left text-sm ${topicId === topic.id ? "text-cyan-400" : "text-white/75"}`}
                  onClick={() => {
                    setTopicId(topic.id);
                    setShowTopics(false);
                  }}
                >
                  {topic.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <iframe
        key={`${tutorialId}-${topicId}`}
        src={iframeSrc}
        title={`${tutorial.title} tutorial`}
        className="w-full border border-white/10 bg-white"
        style={{ minHeight: "78vh" }}
      />
    </div>
  );
}
