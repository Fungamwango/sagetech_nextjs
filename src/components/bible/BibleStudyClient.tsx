"use client";

import { useEffect, useRef, useState } from "react";

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
  children: React.ReactNode;
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
        className={`absolute left-0 top-full z-20 mt-2 max-h-80 w-full min-w-[170px] overflow-y-auto rounded-[18px] border border-white/10 bg-[linear-gradient(180deg,rgba(10,30,40,0.985),rgba(6,18,28,0.985))] p-2 shadow-[0_26px_70px_rgba(0,0,0,0.42)] ${
          open ? "block" : "hidden"
        }`}
      >
        {children}
      </div>
    </div>
  );
}

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

function SelectionPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-white/55">
      <span className="mr-1 uppercase tracking-[0.12em] text-white/35">{label}</span>
      <span className="text-white/75">{value}</span>
    </div>
  );
}

export default function BibleStudyClient({ contentHtml }: { contentHtml: string }) {
  const [bookId, setBookId] = useState<string>(BOOKS[0]?.id ?? "genesis");
  const [bookLabel, setBookLabel] = useState<string>("Books");
  const [keypointId, setKeypointId] = useState<string>("");
  const [keypointLabel, setKeypointLabel] = useState<string>("Keypoints");
  const [showBooks, setShowBooks] = useState(false);
  const [showKeypoints, setShowKeypoints] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    const hash = window.location.hash.replace(/^#/, "");
    if (!hash) return;

    const book = BOOKS.find((item) => item.id === hash);
    const keypoint = KEYPOINTS.find((item) => item.id === hash);

    if (book) {
      setBookId(book.id);
      setBookLabel(book.label);
    }

    if (keypoint) {
      setKeypointId(keypoint.id);
      setKeypointLabel(keypoint.label);
    }
  }, []);

  const jumpTo = (item: JumpLink, type: "book" | "keypoint") => {
    if (type === "book") {
      setBookId(item.id);
      setBookLabel(item.label);
      setKeypointId("");
      setKeypointLabel("Keypoints");
      setShowBooks(false);
    } else {
      setKeypointId(item.id);
      setKeypointLabel(item.label);
      setShowKeypoints(false);
    }

    window.history.replaceState(null, "", `#${item.id}`);
    window.requestAnimationFrame(() => {
      const target = document.getElementById(item.id);
      target?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  return (
    <div className="space-y-3">
      <div
        id="post-navbar"
        className="rounded-[18px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.015))] p-3"
        ref={wrapperRef}
      >
        <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-[18px] font-semibold text-white">
              <i className="fa fa-bible text-cyan-400" />
              <span>Bible Study</span>
            </div>
            <p className="mt-1 text-sm text-white/50">
              Browse by book or jump straight to key study points.
            </p>
          </div>

        
        </div>

        <div className="grid grid-cols-2 gap-3">
          <ModernDropdown
            label="Books"
            value={bookLabel}
            open={showBooks}
            onToggle={() => {
              setShowBooks((current) => !current);
              setShowKeypoints(false);
            }}
          >
              <JumpList
                items={BOOKS}
                activeId={bookId}
                onSelect={(item) => jumpTo(item, "book")}
              />
          </ModernDropdown>

          <ModernDropdown
            label="Key Points"
            value={keypointLabel}
            open={showKeypoints}
            onToggle={() => {
              setShowKeypoints((current) => !current);
              setShowBooks(false);
            }}
          >
              <JumpList
                items={KEYPOINTS}
                activeId={keypointId}
                onSelect={(item) => jumpTo(item, "keypoint")}
              />
          </ModernDropdown>
        </div>
      </div>

      <div className="overflow-hidden rounded-[18px] border border-white/10 bg-white/[0.03]">
        <div className="bible-study-content-shell max-h-[78vh] overflow-y-auto bg-[#f5f5ff] text-black/85">
          <div dangerouslySetInnerHTML={{ __html: contentHtml }} />
        </div>
      </div>

      <style jsx global>{`
        .bible-study-content-shell {
          scroll-behavior: smooth;
        }

        .bible-study-content-shell #bible-wrapper {
          text-align: left;
          position: relative;
        }

        .bible-study-content-shell #bible-wrapper strong {
          display: inline-block;
          border-radius: 3px;
          background: linear-gradient(to bottom, rgba(0, 0, 0, 0.5), rgb(22, 40, 50), rgba(0, 0, 0, 0.5));
          padding: 2px 8px;
          font-size: 20px;
          color: white;
        }

        .bible-study-content-shell #bible-wrapper p {
          margin: 0;
          border-bottom: 1px solid rgba(0, 0, 0, 0.18);
          background: rgb(245, 245, 255);
          padding: 16px 10px;
          line-height: 1.7;
          word-spacing: 1.4px;
        }

        .bible-study-content-shell #bible-wrapper b {
          color: rgba(0, 0, 0, 0.92);
        }
      `}</style>
    </div>
  );
}
