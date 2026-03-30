"use client";

import { useEffect, useMemo, useRef, useState } from "react";

const BOOKS = [
  { id: "genesis", label: "Genesis" },
  { id: "Noah", label: "Noah" },
  { id: "Abraham", label: "Abraham" },
  { id: "Isaac", label: "Isaac" },
  { id: "Exodus", label: "Exodus" },
  { id: "Levitcus", label: "Levitcus" },
  { id: "Numbers", label: "Numbers" },
  { id: "Joshua", label: "Joshua" },
  { id: "judges", label: "Judges" },
  { id: "rush", label: "Rush" },
  { id: "first-samuel", label: "First Samuel" },
  { id: "second-samuel", label: "Second Samuel" },
  { id: "First-Kings", label: "First Kings" },
  { id: "second-kings", label: "Second Kings" },
  { id: "First-Chronicles", label: "First Chronicles" },
  { id: "second-Chronicles", label: "Second Chronicles" },
  { id: "Ezra", label: "Ezra" },
  { id: "Nehemiah", label: "Nehemiah" },
  { id: "Ester", label: "Ester" },
  { id: "Job", label: "Job" },
  { id: "Psalms", label: "Psalms" },
  { id: "Proverbs", label: "Proverbs" },
  { id: "Ecclesiastes", label: "Ecclesiastes" },
  { id: "The-Song-of-Solomon", label: "Song of Solomon" },
  { id: "Isaiah", label: "Isaiah" },
  { id: "Jeremiah", label: "Jeremiah" },
  { id: "Lamentations", label: "Lamentations" },
  { id: "Ezekiel", label: "Ezekiel" },
  { id: "Daniel", label: "Daniel" },
  { id: "Hosea", label: "Hosea" },
  { id: "Joel", label: "Joel" },
  { id: "Amos", label: "Amos" },
  { id: "Obadiah", label: "Obadiah" },
  { id: "Jonah", label: "Jonah" },
  { id: "Micah", label: "Micah" },
  { id: "Nahum", label: "Nahum" },
  { id: "Habakkuk", label: "Habakkuk" },
  { id: "Zephaniah", label: "Zephaniah" },
  { id: "Haggai", label: "Haggai" },
  { id: "Zechariah", label: "Zechariah" },
  { id: "Malachi", label: "Malachi" },
  { id: "Matthew", label: "Matthew" },
  { id: "mark", label: "Mark" },
  { id: "Luke", label: "Luke" },
  { id: "John", label: "John" },
  { id: "Acts", label: "Acts" },
  { id: "Romans", label: "Romans" },
  { id: "first-corinthians", label: "First Corinthians" },
  { id: "Galatians", label: "Galatians" },
  { id: "Ephesians", label: "Ephesians" },
  { id: "Philippians", label: "Philippians" },
  { id: "Colossians", label: "Colossians" },
  { id: "first-thessalonians", label: "First Thessalonians" },
  { id: "Second-Thessalonians", label: "Second Thessalonians" },
  { id: "first-timothy", label: "First Timothy" },
  { id: "second-timothy", label: "Second Timothy" },
  { id: "Titus", label: "Titus" },
  { id: "Philemon", label: "Philemon" },
  { id: "Hebrews", label: "Hebrews" },
  { id: "James", label: "James" },
  { id: "first-peter", label: "First Peter" },
  { id: "second-peter", label: "Second Peter" },
  { id: "first-john", label: "First John" },
  { id: "second-john", label: "Second John" },
  { id: "third-john", label: "Third John" },
  { id: "jude", label: "Jude" },
  { id: "revelation", label: "Revelation" },
] as const;

const KEYPOINTS = [
  { id: "first-sin", label: "First Sin Story" },
  { id: "snake-convinced-eve", label: "A Snake Convinced Eve" },
  { id: "lineage-of-adam-and-eve", label: "Lineage of Adam and Eve" },
  { id: "Tower-of-Babel", label: "Tower of Babel" },
  { id: "Sodom", label: "Sodom and Gomorrah" },
  { id: "Test-of-Abraham", label: "Test of Abraham" },
  { id: "Coat-of-Many-Colors", label: "Coat of Many Colors" },
  { id: "Burning-Bush", label: "Burning Bush" },
  { id: "TEN-COMMANDMENTS", label: "Ten Commandments" },
  { id: "Samson", label: "Samson" },
  { id: "david-and-goliath", label: "David and Goliath" },
  { id: "David-and-Bathsheba", label: "David and Bathsheba" },
  { id: "Story-of-Tamar", label: "Story of Tamar" },
  { id: "the-divided-kingdom", label: "The Divided Kingdom" },
  { id: "lions-of-den", label: "The Lion's Den" },
  { id: "jesus-select-disciples", label: "Jesus Selected 12 Disciples" },
  { id: "jesus-preached-at-capernaum", label: "Jesus Preached At Capernaum" },
  { id: "farmer-sowing-grains", label: "Farmer Sowing Grains" },
  { id: "kings-with-debt", label: "Kings With Debtor" },
  { id: "last-first", label: "Last First, First Last" },
  { id: "Ten-Bridesmaids", label: "Ten Bridesmaids" },
  { id: "Investment", label: "Investment" },
  { id: "miracles-jesus-performed", label: "Jesus Performed Healing" },
  { id: "jesus-in-jerusalem-1", label: "Jesus In Jerusalem" },
  { id: "Crucifixion-of-jesus", label: "The Crucifixion of Jesus" },
  { id: "resurrection-of-jesus", label: "The Resurrection of Jesus" },
  { id: "Capernaum-healing", label: "Capernaum Healing" },
  { id: "jesus-spoke-kingdom", label: "Jesus Spoke Kingdom of God" },
  { id: "jesus-disagreement-with-pharisees", label: "Jesus vs Pharisees" },
  { id: "jesus-interaction-with-disciples", label: "Jesus and Disciples" },
  { id: "jesus-in-jerusalem-2", label: "Jesus In Jerusalem (Mark 11)" },
  { id: "jesus-passover", label: "Jesus Passover Supper" },
  { id: "Crucifixion-of-jesus-2", label: "Crucifixion of Jesus (Mark 15)" },
  { id: "jesus-at-twelve", label: "Jesus at Twelve" },
  { id: "jesus-spoke-heaven", label: "Kingdom of Heaven" },
  { id: "jesus-disagreement-with-pharisees-2", label: "Jesus vs Pharisees (Luke)" },
  { id: "jesus-in-jerusalem-3", label: "Jesus In Jerusalem (Luke)" },
  { id: "resurrection-of-jesus-3", label: "Resurrection of Jesus (Luke)" },
  { id: "Jesus-trial-and-crucifixion", label: "Jesus Trial and Crucifixion" },
  { id: "resurrection-of-jesus-4", label: "Resurrection of Jesus (John 20)" },
  { id: "stephen-stoned", label: "Stephen Stoned To Death" },
  { id: "judgement-described", label: "Judgment Day Described" },
  { id: "throne-of-god", label: "The Throne of God" },
  { id: "seal-broken-by-lamb", label: "The Seal Broken By The Lamb" },
  { id: "trumpets", label: "The Trumpets Blowing" },
  { id: "dead-people-judged", label: "The Dead Are Judged" },
  { id: "stories-of-jesus", label: "Stories of Jesus" },
  { id: "PERSISTENCE-PAYS", label: "Persistence Pays" },
  { id: "RICH-MAN-BEGGAR-MAN", label: "Rich Man and Beggar" },
  { id: "Job", label: "The Story of Job" },
] as const;

type JumpLink = { id: string; label: string };

function JumpList({
  items,
  activeId,
  onSelect,
}: {
  items: readonly JumpLink[];
  activeId: string;
  onSelect: (item: JumpLink) => void;
}) {
  return (
    <div className="grid gap-2">
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          className={`block w-full border-b border-white/15 py-2.5 text-left text-sm transition-colors ${
            activeId === item.id ? "text-cyan-400" : "text-white/75 hover:text-white"
          }`}
          onClick={() => onSelect(item)}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}

export default function BibleStudyClient() {
  const [bookId, setBookId] = useState<string>(BOOKS[0]?.id ?? "genesis");
  const [bookLabel, setBookLabel] = useState<string>("Books");
  const [keypointId, setKeypointId] = useState<string>("");
  const [keypointLabel, setKeypointLabel] = useState<string>("Keypoints");
  const [showBooks, setShowBooks] = useState(false);
  const [showKeypoints, setShowKeypoints] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const iframeSrc = useMemo(() => {
    const target = keypointId || bookId;
    return `/api/bible-study/content${target ? `#${encodeURIComponent(target)}` : ""}`;
  }, [bookId, keypointId]);

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowBooks(false);
        setShowKeypoints(false);
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  return (
    <div>
      <div id="post-navbar" className="mb-3" ref={wrapperRef}>
        <div id="title">
          <i className="fa fa-bible" /> Bible-study...
        </div>

        <div className="post-links-wrapper flex flex-wrap items-start gap-2">
          <div className="dropdown-wrapper relative">
            <button
              type="button"
              className={`post-links min-w-[160px] ${showBooks ? "post-active_link" : ""}`}
              onClick={() => {
                setShowBooks((current) => !current);
                setShowKeypoints(false);
              }}
            >
              <span id="book-span">{bookLabel}</span> <i className="fa fa-chevron-down" />
            </button>
            <div
              className={`dropdown-content absolute left-0 top-full z-20 mt-1 max-h-72 w-[260px] overflow-y-auto rounded-md border border-white/10 !p-2 shadow-2xl ${showBooks ? "!block" : "!hidden"}`}
              style={{ background: "linear-gradient(to bottom, rgba(10, 30, 40, 0.98), rgba(6, 18, 28, 0.98))" }}
            >
              <JumpList
                items={BOOKS}
                activeId={bookId}
                onSelect={(item) => {
                  setBookId(item.id);
                  setBookLabel(item.label);
                  setKeypointId("");
                  setKeypointLabel("Keypoints");
                  setShowBooks(false);
                }}
              />
            </div>
          </div>

          <div className="dropdown-wrapper relative">
            <button
              type="button"
              className={`post-links min-w-[160px] ${showKeypoints ? "post-active_link" : ""}`}
              onClick={() => {
                setShowKeypoints((current) => !current);
                setShowBooks(false);
              }}
            >
              <span id="keypoints-span">{keypointLabel}</span> <i className="fa fa-chevron-down" />
            </button>
            <div
              className={`dropdown-content absolute left-0 top-full z-20 mt-1 max-h-72 w-[280px] overflow-y-auto rounded-md border border-white/10 !p-2 shadow-2xl ${showKeypoints ? "!block" : "!hidden"}`}
              style={{ background: "linear-gradient(to bottom, rgba(10, 30, 40, 0.98), rgba(6, 18, 28, 0.98))" }}
            >
              <JumpList
                items={KEYPOINTS}
                activeId={keypointId}
                onSelect={(item) => {
                  setKeypointId(item.id);
                  setKeypointLabel(item.label);
                  setShowKeypoints(false);
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <iframe
        key={`${bookId}-${keypointId}`}
        src={iframeSrc}
        title="Bible study content"
        className="w-full border border-white/10 bg-white"
        style={{ minHeight: "78vh" }}
      />
    </div>
  );
}
