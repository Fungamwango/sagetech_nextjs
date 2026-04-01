"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useBackClosable } from "@/hooks/useBackClosable";

const UploadClient = dynamic(() => import("@/app/(main)/upload/UploadClient"), { ssr: false });

interface ComposerUser {
  id: string;
  username?: string | null;
  picture?: string | null;
  points?: string | number | null;
}

interface PostComposerProps {
  user: ComposerUser | null;
  onCreated: (post: any) => void;
}

const QUICK_ACTIONS = [
  { label: "General", icon: "fas fa-images", type: "general" },
  { label: "Music", icon: "fas fa-music", type: "song" },
  { label: "More", icon: "fas fa-plus", type: "more" },
];

export default function PostComposer({ user, onCreated }: PostComposerProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [initialType, setInitialType] = useState<string | undefined>(undefined);
  const modalRef = useRef<HTMLDivElement>(null);
  const closeComposer = useBackClosable(open, () => setOpen(false));

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") closeComposer(); };
    if (open) document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [closeComposer, open]);

  // Prevent body scroll when modal open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const openWith = (type?: string) => {
    if (!user) {
      router.push("/login");
      return;
    }
    setInitialType(type === "more" ? undefined : type);
    setOpen(true);
  };

  return (
    <>
      {/* ── Composer bar ── */}
      <div className="modern-composer fade-in">
        <div className="flex items-center gap-3">
          <Image
            src={user?.picture || "/files/default-avatar.svg"}
            alt={user?.username || "user"}
            width={44}
            height={44}
            className="h-11 w-11 rounded-full border border-white/15 object-cover"
          />
          <button
            onClick={() => openWith("general")}
            className="min-h-[46px] flex-1 rounded-full border border-white/10 bg-white/[0.04] px-4 text-left text-sm text-white/55 transition-colors hover:bg-white/[0.07]"
          >
            Share an update, photo, or video{user?.username ? `, ${user.username}` : ""}...
          </button>
        </div>

        <div className="modern-feed-divider my-3" />

        <div className="grid grid-cols-3 gap-1.5">
          {QUICK_ACTIONS.map((a) => (
            <button
              key={a.type}
              onClick={() => openWith(a.type)}
              className="modern-pill-action flex items-center justify-center gap-1.5 px-2 py-1.5 text-[11px] font-medium text-white/70 hover:text-white"
            >
              <i className={`${a.icon} text-sm ${a.type === "general" ? "text-emerald-400" : a.type === "song" ? "text-fuchsia-400" : a.type === "video" ? "text-rose-400" : a.type === "blog" ? "text-amber-300" : "text-cyan-400"}`} />
              <span>{a.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Upload modal ── */}
      {open && user && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
          style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)" }}
          onClick={(e) => { if (e.target === e.currentTarget) closeComposer(); }}
        >
          <div
            ref={modalRef}
            className="w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl overflow-hidden"
            style={{
              background: "#0d1f2d",
              border: "1px solid rgba(255,255,255,0.1)",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            {/* Modal header */}
            <div
              className="flex items-center justify-between px-4 py-3 sticky top-0 z-10"
              style={{ background: "#0d1f2d", borderBottom: "1px solid rgba(255,255,255,0.08)" }}
            >
              <span className="text-base font-semibold text-white">Create Post</span>
              <button
                onClick={closeComposer}
                className="w-8 h-8 rounded-full flex items-center justify-center text-white/60 hover:text-white transition-colors"
                style={{ background: "rgba(255,255,255,0.08)" }}
              >
                <i className="fas fa-times text-sm" />
              </button>
            </div>

            {/* Upload form */}
            <div className="p-4">
              <UploadClient
                user={{ id: user.id, username: user.username ?? "", points: user.points }}
                initialType={initialType}
                onSuccess={() => {
                  closeComposer();
                  // Refresh feed by triggering a reload event
                  window.dispatchEvent(new CustomEvent("post-created"));
                }}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
