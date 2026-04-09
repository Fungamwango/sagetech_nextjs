"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";

interface Song {
  id: string;
  fileUrl?: string | null;
  filename?: string | null;
  singer?: string | null;
  songType?: string | null;
  albumCover?: string | null;
  views?: number | null;
  downloadsCount?: number | null;
  likesCount?: number | null;
}

const WAVE_HEIGHTS = [30, 60, 80, 45, 70, 50, 90, 35, 65, 75, 40, 85, 55, 70, 30, 60, 45, 80, 50, 65];
const PAGE_SIZE = 20;

function formatTime(s: number) {
  if (!isFinite(s) || isNaN(s)) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

function stripExt(name?: string | null) {
  return name ? name.replace(/\.[^.]+$/, "") : "Unknown";
}

export default function MusicPlaylistPlayer() {
  const [allSongs, setAllSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [audioLoading, setAudioLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const fetchSongs = useCallback(async (offset: number, searchQuery: string, append: boolean) => {
    if (append) setLoadingMore(true);
    else setLoading(true);
    try {
      const params = new URLSearchParams({
        type: "song",
        limit: String(PAGE_SIZE),
        offset: String(offset),
        lightweight: "1",
      });
      if (searchQuery) params.set("q", searchQuery);
      const res = await fetch(`/api/posts?${params}`);
      const data = await res.json();
      const songs: Song[] = (data.posts ?? []);
      setHasMore(songs.length === PAGE_SIZE);
      if (append) {
        setAllSongs((prev) => [...prev, ...songs]);
      } else {
        setAllSongs(songs);
        setActiveIndex(0);
      }
    } finally {
      if (append) setLoadingMore(false);
      else setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSongs(0, search, false);
    setPage(0);
  }, [search, fetchSongs]);

  const currentSong = allSongs[activeIndex];

  // Infinite scroll
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          const nextOffset = (page + 1) * PAGE_SIZE;
          setPage((p) => p + 1);
          fetchSongs(nextOffset, search, true);
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, loadingMore, page, search, fetchSongs]);

  // Audio sync
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentSong?.fileUrl) return;
    const wasPlaying = playing;
    audio.src = currentSong.fileUrl;
    audio.load();
    setProgress(0);
    setCurrentTime(0);
    setDuration(0);
    if (wasPlaying) audio.play().catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSong?.id]);

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      audio.play().catch(() => {});
      setPlaying(true);
    }
  };

  const handlePrev = () => {
    if (activeIndex > 0) {
      setActiveIndex((i) => i - 1);
      setPlaying(true);
    }
  };

  const handleNext = () => {
    if (activeIndex < allSongs.length - 1) {
      setActiveIndex((i) => i + 1);
      setPlaying(true);
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    const bar = progressRef.current;
    if (!audio || !bar || !duration) return;
    const rect = bar.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    audio.currentTime = ratio * duration;
    setProgress(ratio * 100);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Search */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-white/40 text-sm" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") setSearch(searchInput.trim());
            }}
            placeholder="Search songs, artists..."
            className="w-full rounded-xl border border-white/10 bg-white/[0.06] pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-white/30 outline-none focus:border-cyan-400/40 focus:bg-white/[0.08]"
          />
        </div>
        <button
          onClick={() => setSearch(searchInput.trim())}
          className="rounded-xl border border-white/10 bg-white/[0.06] px-4 py-2.5 text-sm text-white/70 hover:bg-white/[0.1] hover:text-white transition-colors"
        >
          Search
        </button>
        {search && (
          <button
            onClick={() => { setSearch(""); setSearchInput(""); }}
            className="rounded-xl border border-white/10 bg-white/[0.06] px-3 py-2.5 text-sm text-white/50 hover:text-white transition-colors"
          >
            <i className="fas fa-times" />
          </button>
        )}
      </div>

      {/* Now Playing Card */}
      {currentSong && (
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            background: "linear-gradient(145deg, rgba(0,170,132,0.12) 0%, rgba(0,200,232,0.08) 100%)",
            border: "1px solid rgba(0,200,232,0.15)",
          }}
        >
          {/* Album cover + info */}
          <div className="flex items-center gap-4 p-4">
            <div className="relative h-20 w-20 flex-shrink-0 rounded-xl overflow-hidden bg-white/[0.06]">
              {currentSong.albumCover ? (
                <Image src={currentSong.albumCover} alt="cover" fill className="object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <i className="fas fa-music text-2xl text-cyan-400/60" />
                </div>
              )}
              {playing && (
                <div className="absolute inset-0 flex items-end justify-center pb-1 gap-px bg-black/30">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="w-1 rounded-full bg-cyan-400"
                      style={{
                        animation: `bounce ${0.6 + i * 0.1}s ease-in-out infinite alternate`,
                        height: `${8 + i * 4}px`,
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-white truncate">{stripExt(currentSong.filename)}</p>
              <p className="text-sm text-white/50 truncate mt-0.5">{currentSong.singer || "Unknown Artist"}</p>
              {currentSong.songType && (
                <span className="mt-1 inline-block rounded-full border border-cyan-400/20 bg-cyan-400/10 px-2 py-0.5 text-[10px] text-cyan-300">
                  {currentSong.songType}
                </span>
              )}
            </div>
          </div>

          {/* Waveform */}
          <div className="flex items-end justify-center gap-px px-4" style={{ height: "32px" }}>
            {WAVE_HEIGHTS.map((h, i) => {
              const frac = duration > 0 ? currentTime / duration : 0;
              const filled = i / WAVE_HEIGHTS.length < frac;
              return (
                <div
                  key={i}
                  className="w-1.5 rounded-full flex-shrink-0 transition-colors"
                  style={{
                    height: `${(h / 100) * 32}px`,
                    background: filled
                      ? "linear-gradient(to top, #00a884, #00c8e8)"
                      : playing
                      ? `rgba(255,255,255,${0.08 + Math.abs(Math.sin((Date.now() / 200 + i) * 0.5)) * 0.12})`
                      : "rgba(255,255,255,0.1)",
                  }}
                />
              );
            })}
          </div>

          {/* Progress bar */}
          <div className="px-4 pt-2 pb-1">
            <div
              ref={progressRef}
              className="h-1.5 w-full cursor-pointer rounded-full bg-white/10"
              onClick={handleSeek}
            >
              <div
                className="h-full rounded-full"
                style={{
                  width: `${progress}%`,
                  background: "linear-gradient(90deg, #00a884, #00c8e8)",
                }}
              />
            </div>
            <div className="mt-1 flex justify-between text-[11px] text-white/40">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4 pb-4 px-4">
            <button
              onClick={handlePrev}
              disabled={activeIndex === 0}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.08] text-white/80 transition hover:bg-white/[0.14] disabled:opacity-30"
            >
              <i className="fas fa-step-backward text-sm" />
            </button>
            <button
              onClick={toggle}
              disabled={audioLoading}
              className="flex h-14 w-14 items-center justify-center rounded-full text-white transition-all"
              style={{
                background: "linear-gradient(135deg, #00a884, #00c8e8)",
                boxShadow: playing ? "0 0 28px rgba(0,170,132,0.6)" : "0 4px 16px rgba(0,0,0,0.4)",
              }}
            >
              {audioLoading ? (
                <i className="fas fa-circle-notch fa-spin text-lg" />
              ) : playing ? (
                <i className="fas fa-pause text-lg" />
              ) : (
                <i className="fas fa-play text-lg ml-0.5" />
              )}
            </button>
            <button
              onClick={handleNext}
              disabled={activeIndex >= allSongs.length - 1}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.08] text-white/80 transition hover:bg-white/[0.14] disabled:opacity-30"
            >
              <i className="fas fa-step-forward text-sm" />
            </button>
          </div>

          <audio
            ref={audioRef}
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            onWaiting={() => setAudioLoading(true)}
            onCanPlay={() => setAudioLoading(false)}
            onTimeUpdate={() => {
              const a = audioRef.current;
              if (!a) return;
              setCurrentTime(a.currentTime);
              setProgress(a.duration > 0 ? (a.currentTime / a.duration) * 100 : 0);
            }}
            onDurationChange={() => {
              const a = audioRef.current;
              if (a) setDuration(a.duration);
            }}
            onEnded={handleNext}
          />
        </div>
      )}

      {/* Song list */}
      <div className="rounded-2xl overflow-hidden border border-white/[0.06] bg-white/[0.02]">
        <div className="px-4 py-3 border-b border-white/[0.06]">
          <span className="text-sm font-medium text-white/70">
            {loading ? "Loading..." : `${allSongs.length} song${allSongs.length !== 1 ? "s" : ""}${search ? ` for "${search}"` : ""}`}
          </span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <i className="fas fa-circle-notch fa-spin text-cyan-400 text-xl" />
          </div>
        ) : allSongs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-2">
            <i className="fas fa-music text-3xl text-white/20" />
            <p className="text-sm text-white/40">No songs found</p>
          </div>
        ) : (
          <>
            {allSongs.map((song, index) => {
              const isActive = index === activeIndex;
              return (
                <button
                  key={song.id}
                  type="button"
                  onClick={() => {
                    if (isActive) {
                      toggle();
                    } else {
                      setActiveIndex(index);
                      setPlaying(true);
                    }
                  }}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors border-b border-white/[0.04] last:border-0 hover:bg-white/[0.04]"
                  style={isActive ? { background: "rgba(0,200,232,0.06)" } : {}}
                >
                  {/* Index / play icon */}
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full">
                    {isActive && playing ? (
                      <i className="fas fa-pause text-xs text-cyan-400" />
                    ) : isActive ? (
                      <i className="fas fa-play text-xs text-cyan-400 ml-0.5" />
                    ) : (
                      <span className="text-xs text-white/30">{index + 1}</span>
                    )}
                  </div>

                  {/* Album art */}
                  <div className="relative h-10 w-10 flex-shrink-0 rounded-lg overflow-hidden bg-white/[0.06]">
                    {song.albumCover ? (
                      <Image src={song.albumCover} alt="cover" fill className="object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <i className="fas fa-music text-xs text-white/30" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm truncate font-medium ${isActive ? "text-cyan-300" : "text-white/85"}`}>
                      {stripExt(song.filename)}
                    </p>
                    <p className="text-xs text-white/40 truncate">{song.singer || "Unknown Artist"}</p>
                  </div>

                  {/* Genre */}
                  {song.songType && (
                    <span className="hidden sm:block text-[10px] text-white/30 flex-shrink-0">{song.songType}</span>
                  )}

                  {/* Plays */}
                  {(song.views ?? 0) > 0 && (
                    <span className="flex-shrink-0 text-[11px] text-white/25 flex items-center gap-1">
                      <i className="fas fa-headphones text-[9px]" />
                      {song.views}
                    </span>
                  )}
                </button>
              );
            })}
            <div ref={sentinelRef} className="h-2" />
            {loadingMore && (
              <div className="flex items-center justify-center py-4">
                <i className="fas fa-circle-notch fa-spin text-cyan-400/60 text-sm" />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
