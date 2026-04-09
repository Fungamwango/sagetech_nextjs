"use client";

import { useState } from "react";
import PostFeed from "@/components/posts/PostFeed";
import MusicPlaylistPlayer from "@/components/music/MusicPlaylistPlayer";

const TABS = [
  { id: "feed", label: "Feed", icon: "fa-stream" },
  { id: "playlist", label: "Playlist", icon: "fa-list-music" },
] as const;

type Tab = (typeof TABS)[number]["id"];

export default function MusicPage() {
  const [activeTab, setActiveTab] = useState<Tab>("feed");

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl border border-cyan-400/15 bg-cyan-400/10 text-cyan-300">
          <i className="fas fa-music text-sm" />
        </span>
        <h1 className="text-lg font-bold text-white">Music</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl border border-white/[0.07] bg-white/[0.03] p-1">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-sm font-medium transition-all"
            style={
              activeTab === tab.id
                ? {
                    background: "linear-gradient(135deg, rgba(0,170,132,0.25), rgba(0,200,232,0.18))",
                    color: "#00c8e8",
                    border: "1px solid rgba(0,200,232,0.2)",
                  }
                : { color: "rgba(255,255,255,0.45)" }
            }
          >
            <i className={`fas ${tab.icon} text-xs`} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === "feed" ? (
        <PostFeed postType="song" currentUserId={null} showComposer={false} />
      ) : (
        <MusicPlaylistPlayer />
      )}
    </div>
  );
}
