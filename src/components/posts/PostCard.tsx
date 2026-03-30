"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { timeAgo, formatCount } from "@/lib/utils";
import { useToast, type AppToast } from "@/components/ui/ToastProvider";
import { parseMediaUrls } from "@/lib/postMedia";
import { getPostPath } from "@/lib/postUrls";

interface PostCardProps {
  post: {
    id: string;
    postType: string;
    fileType?: string | null;
    fileUrl?: string | null;
    filename?: string | null;
    thumbnailUrl?: string | null;
    generalPost?: string | null;
    postDescription?: string | null;
    singer?: string | null;
    songType?: string | null;
    albumCover?: string | null;
    blogTitle?: string | null;
    blogContent?: string | null;
    productName?: string | null;
    productType?: string | null;
    productPrice?: string | null;
    appType?: string | null;
    appCategory?: string | null;
    appDeveloper?: string | null;
    bookTitle?: string | null;
    author?: string | null;
    bookCategory?: string | null;
    advertTitle?: string | null;
    advertUrl?: string | null;
    views?: number | null;
    likesCount?: number | null;
    commentsCount?: number | null;
    downloadsCount?: number | null;
    createdAt?: string | null;
    userId: string;
    username?: string | null;
    userPicture?: string | null;
    userLevel?: string | null;
    likedByMe?: boolean;
  };
  currentUserId?: string | null;
  onDelete?: (id: string) => void;
}

// Deterministic waveform heights to avoid flickering
const WAVE_HEIGHTS = [30, 60, 80, 45, 70, 50, 90, 35, 65, 75, 40, 85, 55, 70, 30, 60, 45, 80, 50, 65];

type DeleteConfirmState = {
  id: string;
  label: string;
} | null;

export default function PostCard({ post, currentUserId, onDelete }: PostCardProps) {
  const { showToast } = useToast();
  const [postState, setPostState] = useState(post);
  const [liked, setLiked] = useState(post.likedByMe ?? false);
  const [likeCount, setLikeCount] = useState(post.likesCount ?? 0);
  const [showComments, setShowComments] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [editingPost, setEditingPost] = useState(false);
  const [editPostText, setEditPostText] = useState(post.blogContent ?? post.generalPost ?? post.postDescription ?? "");
  const [savingPost, setSavingPost] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingPost, setDeletingPost] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportingPost, setReportingPost] = useState(false);
  const [reportError, setReportError] = useState("");
  const menuRef = useRef<HTMLDivElement>(null);
  const postPath = getPostPath({
    id: postState.id,
    blogTitle: postState.blogTitle,
    productName: postState.productName,
    singer: postState.singer,
    filename: postState.filename,
    bookTitle: postState.bookTitle,
    generalPost: postState.generalPost,
    postDescription: postState.postDescription,
    advertTitle: postState.advertTitle,
  });

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setShowMenu(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLike = async () => {
    const res = await fetch(`/api/posts/${postState.id}/like`, { method: "POST" });
    if (res.ok) {
      const d = await res.json();
      setLiked(d.liked);
      setLikeCount((c) => (d.liked ? c + 1 : Math.max(0, c - 1)));
    }
  };

  const handleDelete = async () => {
    setDeletingPost(true);
    const res = await fetch(`/api/posts/${postState.id}`, { method: "DELETE" });
    if (res.ok) {
      setDeleteModalOpen(false);
      showToast({ type: "success", message: "Post deleted." });
      onDelete?.(postState.id);
    } else {
      showToast({ type: "error", message: "Unable to delete post." });
    }
    setDeletingPost(false);
  };

  const handleDownload = async () => {
    await fetch(`/api/posts/${postState.id}/download`, { method: "POST" });
  };

  const handleShare = async () => {
    const url = `${window.location.origin}${postPath}`;
    const title = postState.blogTitle ?? postState.singer ?? postState.productName ?? postState.generalPost ?? "SageTech post";
    if (navigator.share) {
      try { await navigator.share({ title, url }); } catch {}
    } else {
      navigator.clipboard.writeText(url);
      showToast({ type: "success", message: "Link copied." });
    }
    setShowMenu(false);
  };

  const handleSavePost = async () => {
    const content = editPostText.trim();
    if (!content) return;

    const payload: Record<string, string> = {};
    if (postState.postType === "blog") payload.blogContent = content;
    else if (postState.postType === "general") payload.generalPost = content;
    else payload.postDescription = content;

    setSavingPost(true);
    const res = await fetch(`/api/posts/${postState.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      setPostState((current) => ({
        ...current,
        ...payload,
      }));
      setEditingPost(false);
      setShowMenu(false);
      showToast({ type: "success", message: "Post updated." });
    } else {
      showToast({ type: "error", message: "Unable to update post." });
    }
    setSavingPost(false);
  };

  const handleReportPost = async () => {
    const reason = reportReason.trim();
    if (reason.length < 5) {
      setReportError("Please enter at least 5 characters.");
      return;
    }

    setReportingPost(true);
    setReportError("");
    const res = await fetch(`/api/posts/${postState.id}/report`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason }),
    });

    if (res.ok) {
      setReportModalOpen(false);
      setReportReason("");
      setShowMenu(false);
      showToast({ type: "success", message: "Report submitted." });
    } else {
      setReportError("Unable to submit report right now.");
      showToast({ type: "error", message: "Unable to submit report." });
    }
    setReportingPost(false);
  };

  const getPostTitle = () => {
    switch (postState.postType) {
      case "song": return postState.singer ?? postState.filename;
      case "video": return postState.filename ?? postState.postDescription;
      case "blog": return postState.blogTitle;
      case "product": return postState.productName;
      case "app": return postState.filename ?? postState.appType;
      case "book": return postState.bookTitle ?? postState.author;
      case "advert": return postState.advertTitle ?? postState.postDescription;
      default: return null;
    }
  };

  const postTitle = getPostTitle();
  const textContent = postState.blogContent ?? postState.generalPost ?? postState.postDescription;
  const TRUNCATE = 150;
  const [expanded, setExpanded] = useState(false);
  const needsTruncate = !!textContent && textContent.length > TRUNCATE;
  const displayText = expanded || !needsTruncate ? textContent : textContent?.slice(0, TRUNCATE) + "...";

  return (
    <>
      <article className="modern-feed-card fade-in">
      <div className="modern-feed-card__body">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Link href={`/profile/${postState.userId}`} className="flex items-center gap-2">
            <Image
              src={postState.userPicture || "/files/default-avatar.svg"}
              alt={postState.username ?? "user"}
              width={38}
              height={38}
              className="h-[38px] w-[38px] flex-shrink-0 rounded-full object-cover"
              style={{ border: "2px solid rgba(0,200,220,0.3)" }}
            />
          </Link>
          <div>
            <Link href={`/profile/${postState.userId}`} className="text-sm font-semibold text-white capitalize hover:text-cyan-400 transition-colors">
              {postState.username}
            </Link>
            <div>
              <Link href={postPath} className={`text-xs level-${postState.userLevel?.toLowerCase() ?? "amateur"} hover:underline`}>
                {postState.userLevel ?? "Amateur"} . {timeAgo(postState.createdAt ?? null)}
              </Link>
            </div>
          </div>
        </div>

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="text-white/40 hover:text-white p-2 transition-colors rounded-full hover:bg-white/5"
          >
            <i className="fas fa-ellipsis-v text-sm" />
          </button>
          {showMenu && (
            <div
              className="absolute right-0 top-8 rounded-xl shadow-2xl z-20 overflow-hidden"
              style={{ background: "#0d2535", border: "1px solid rgba(255,255,255,0.1)", minWidth: "160px" }}
            >
              <button onClick={handleShare} className="flex items-center gap-3 w-full px-4 py-3 text-sm text-white/80 hover:bg-white/5 transition-colors">
                <i className="fas fa-share-alt text-cyan-400 w-4" /> Share
              </button>
              <Link
                href={`/messages?user=${post.userId}`}
                className="flex items-center gap-3 w-full px-4 py-3 text-sm text-white/80 hover:bg-white/5 transition-colors"
                onClick={() => setShowMenu(false)}
              >
                <i className="fas fa-comment-dots text-cyan-400 w-4" /> Chat with sender
              </Link>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}${postPath}`);
                  setShowMenu(false);
                }}
                className="flex items-center gap-3 w-full px-4 py-3 text-sm text-white/80 hover:bg-white/5 transition-colors"
              >
                <i className="fas fa-copy text-white/40 w-4" /> Copy link
              </button>
              {currentUserId === postState.userId && (
                <button
                  onClick={() => {
                    setEditPostText(postState.blogContent ?? postState.generalPost ?? postState.postDescription ?? "");
                    setEditingPost(true);
                    setShowMenu(false);
                  }}
                  className="flex items-center gap-3 w-full px-4 py-3 text-sm text-white/80 hover:bg-white/5 transition-colors border-t border-white/5"
                >
                  <i className="fas fa-pen w-4" /> Edit
                </button>
              )}
              {currentUserId === postState.userId && (
                <button
                  onClick={() => {
                    setDeleteModalOpen(true);
                    setShowMenu(false);
                  }}
                  className="flex items-center gap-3 w-full px-4 py-3 text-sm text-red-400 hover:bg-red-900/20 transition-colors border-t border-white/5"
                >
                  <i className="fas fa-trash w-4" /> Delete
                </button>
              )}
              {currentUserId !== postState.userId && (
                <button
                  onClick={() => {
                    setReportModalOpen(true);
                    setReportReason("");
                    setReportError("");
                    setShowMenu(false);
                  }}
                  className="flex items-center gap-3 w-full px-4 py-3 text-sm text-white/50 hover:bg-white/5 transition-colors border-t border-white/5"
                >
                  <i className="fas fa-flag w-4" /> Report
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Post type badge */}
      {postState.postType !== "general" && (
        <span
          className="text-xs px-2 py-0.5 rounded-full capitalize mb-2 inline-block"
          style={{ background: "rgba(0,180,200,0.12)", color: "#00c8e8", border: "1px solid rgba(0,180,200,0.25)" }}
        >
          {postState.postType}
        </span>
      )}

      {/* Title for blog/advert */}
      {postState.postType === "blog" && postState.blogTitle && (
        <p className="text-base font-bold text-white mb-2">{postState.blogTitle}</p>
      )}

      {/* Media content */}
      <PostContent post={postState} onDownload={handleDownload} />

      {/* Text content with truncation */}
      {editingPost ? (
        <div className="mt-2 space-y-2">
          <textarea
            value={editPostText}
            onChange={(e) => setEditPostText(e.target.value)}
            className="sage-input w-full text-sm min-h-28 rounded-2xl px-4 py-3"
            placeholder="Edit your post..."
          />
          <div className="flex items-center gap-2">
            <button
              onClick={handleSavePost}
              disabled={savingPost || !editPostText.trim()}
              className="text-xs px-3 py-2 rounded-full font-semibold disabled:opacity-50"
              style={{ background: "linear-gradient(135deg,#00a884,#00c8e8)", color: "white" }}
            >
              {savingPost ? <i className="fas fa-spinner fa-spin" /> : "Save"}
            </button>
            <button
              onClick={() => {
                setEditingPost(false);
                setEditPostText(postState.blogContent ?? postState.generalPost ?? postState.postDescription ?? "");
              }}
              className="text-xs px-3 py-2 rounded-full text-white/70 border border-white/10 hover:bg-white/5"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : displayText && (
        <div className="mt-2">
          {postState.postType === "blog" && /<[a-z][\s\S]*>/i.test(displayText) ? (
            <>
              <div
                className="text-sm text-white/85 leading-relaxed ai-blog-content"
                dangerouslySetInnerHTML={{ __html: displayText }}
              />
              {needsTruncate && (
                <button onClick={() => setExpanded(!expanded)} className="text-xs text-cyan-400 mt-1 hover:underline">
                  {expanded ? "Show less" : "Read more"}
                </button>
              )}
            </>
          ) : (
            <>
              <p className="text-sm text-white/85 leading-relaxed">{displayText}</p>
              {needsTruncate && (
                <button onClick={() => setExpanded(!expanded)} className="text-xs text-cyan-400 mt-1 hover:underline">
                  {expanded ? "Show less" : "Read more"}
                </button>
              )}
            </>
          )}
        </div>
      )}

      {/* Non-text title */}
      {postTitle && postState.postType !== "blog" && (
        <p className="text-sm text-white mt-2 font-medium">{postTitle}</p>
      )}
      {postState.postDescription && !["general", "blog", "advert"].includes(postState.postType) && !editingPost && (
        <p className="text-xs text-white/55 mt-1">{postState.postDescription}</p>
      )}

      {/* Stats bar */}
      <div className="modern-feed-divider mt-4 mb-3" />
      <div
        className="grid gap-2"
        style={{ gridTemplateColumns: ["song", "app", "book", "document", "product", "advert"].includes(postState.postType) ? "1fr 1fr 1fr auto" : "1fr 1fr 1fr" }}
      >
          <button
            onClick={handleLike}
            className={`modern-pill-action flex items-center justify-center gap-1.5 px-3 py-2 text-sm transition-all ${liked ? "text-cyan-400" : "text-white/60 hover:text-cyan-400"}`}
          >
            <i className={`${liked ? "fas" : "far"} fa-thumbs-up`} />
            <span className="text-xs font-medium">{likeCount}</span>
          </button>
          <button
            onClick={() => setShowComments(!showComments)}
            className={`modern-pill-action flex items-center justify-center gap-1.5 px-3 py-2 text-sm transition-colors ${showComments ? "text-cyan-400" : "text-white/60 hover:text-cyan-400"}`}
          >
            <i className={`${showComments ? "fas" : "far"} fa-comment`} />
            <span className="text-xs font-medium">{postState.commentsCount ?? 0}</span>
          </button>
          <span className="modern-pill-action flex items-center justify-center gap-1 px-3 py-2 text-xs text-white/45">
            <i className="far fa-eye" />
            <span>{postState.views ?? 0}</span>
          </span>

        {["song", "app", "book", "document"].includes(postState.postType) && postState.fileUrl && (
          <a
            href={postState.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleDownload}
            className="flex items-center justify-center gap-1.5 text-xs px-3 py-1.5 rounded-sm transition-colors"
            style={{ color: "#00c8e8", border: "1px solid rgba(0,200,220,0.3)", background: "rgba(0,200,220,0.06)" }}
          >
            <i className="fas fa-download" />
            <span>{postState.downloadsCount ?? 0}</span>
          </a>
        )}

        {postState.postType === "product" && postState.postDescription && (
          <a
            href={`/messages?user=${postState.userId}&product=${postState.id}`}
            className="flex items-center justify-center text-xs px-4 py-1.5 rounded-sm font-semibold transition-colors"
            style={{ background: "#034", color: "white" }}
          >
            Buy now
          </a>
        )}

        {postState.postType === "advert" && postState.advertUrl && (
          <a
            href={postState.advertUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center text-xs px-4 py-1.5 rounded-sm font-semibold transition-colors"
            style={{ background: "rgba(0,200,220,0.15)", color: "#00c8e8", border: "1px solid rgba(0,200,220,0.3)" }}
          >
            Learn more
          </a>
        )}
      </div>

      {showComments && (
        <CommentsSection
          postId={postState.id}
          currentUserId={currentUserId}
          onCountChange={(delta) =>
            setPostState((current) => ({
              ...current,
              commentsCount: Math.max(0, (current.commentsCount ?? 0) + delta),
            }))
          }
          onToast={showToast}
        />
      )}
      </div>
      </article>

      <ConfirmDeleteModal
        open={deleteModalOpen}
        title="Delete post?"
        description="This post will be removed permanently. This action cannot be undone."
        confirmLabel="Delete post"
        loading={deletingPost}
        onConfirm={handleDelete}
        onClose={() => {
          if (!deletingPost) setDeleteModalOpen(false);
        }}
      />

      <ReportPostModal
        open={reportModalOpen}
        reason={reportReason}
        error={reportError}
        loading={reportingPost}
        onReasonChange={(value) => {
          setReportReason(value);
          if (reportError) setReportError("");
        }}
        onSubmit={handleReportPost}
        onClose={() => {
          if (!reportingPost) {
            setReportModalOpen(false);
            setReportError("");
          }
        }}
      />
    </>
  );
}

// ─── Post Media Content ──────────────────────────────────────────
function PostContent({ post, onDownload }: { post: PostCardProps["post"]; onDownload: () => void }) {
  const mediaUrls = parseMediaUrls(post.fileUrl);
  const primaryMediaUrl = mediaUrls[0];

  if (post.postType === "song" && post.fileUrl) return <MusicPlayer post={post} />;
  if (post.postType === "video" && post.fileUrl) return <VideoPlayer post={post} />;

  if (
    post.postType === "photo" ||
    (["general", "blog", "advert"].includes(post.postType) && primaryMediaUrl && post.fileType === "image")
  ) {
    return <PhotoGalleryViewer images={mediaUrls} alt={post.postDescription ?? post.blogTitle ?? "Photo"} />;
  }

  if (
    (["general", "blog", "advert"].includes(post.postType) && primaryMediaUrl && post.fileType === "video")
  ) {
    return <VideoPlayer post={{ ...post, fileUrl: primaryMediaUrl }} />;
  }

  if (post.postType === "product" && primaryMediaUrl) {
    return (
      <div className="my-2">
        <div className="relative rounded-xl overflow-hidden" style={{ maxHeight: "280px" }}>
          <Image
            src={primaryMediaUrl}
            alt={post.productName ?? "Product"}
            width={500}
            height={280}
            className="w-full object-cover"
          />
          <div
            className="absolute bottom-0 left-0 right-0 px-3 py-2"
            style={{ background: "linear-gradient(to top, rgba(0,0,0,0.85), transparent)" }}
          >
            <p className="text-white font-bold text-sm">{post.productName}</p>
            {post.productPrice && (
              <p className="text-cyan-400 font-bold">K{post.productPrice}
                {post.productType && <span className="text-white/50 font-normal ml-2 text-xs capitalize">{post.productType}</span>}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (["app", "book", "document"].includes(post.postType) && primaryMediaUrl) {
    const icon = post.postType === "app" ? "fas fa-mobile-alt" : post.postType === "book" ? "fas fa-book-open" : "fas fa-file-alt";
    const color = post.postType === "app" ? "#7c3aed" : post.postType === "book" ? "#d97706" : "#3b82f6";
    return (
      <div
        className="my-2 flex items-center gap-3 rounded-xl p-4"
        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
      >
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: `${color}22`, border: `1px solid ${color}44` }}
        >
          <i className={`${icon} text-xl`} style={{ color }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white truncate">{post.filename ?? post.bookTitle ?? post.appType ?? "File"}</p>
          {post.author && <p className="text-xs text-white/50 mt-0.5">by {post.author}</p>}
          {post.appDeveloper && <p className="text-xs text-white/50 mt-0.5">{post.appDeveloper}</p>}
          {post.bookCategory && <p className="text-xs text-white/40 mt-0.5 capitalize">{post.bookCategory}</p>}
        </div>
        <a
          href={primaryMediaUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={onDownload}
          className="flex-shrink-0 flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg font-semibold transition-colors"
          style={{ background: `${color}22`, color, border: `1px solid ${color}44` }}
        >
          <i className="fas fa-download" /> Download
        </a>
      </div>
    );
  }

  return null;
}

// ─── Music Player ────────────────────────────────────────────────
function MusicPlayer({ post }: { post: PostCardProps["post"] }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [loading, setLoading] = useState(false);
  const [plays, setPlays] = useState(post.views ?? 0);
  const playTracked = useRef(false);

  const trackPlay = useCallback(() => {
    if (playTracked.current) return;
    playTracked.current = true;
    setPlays((p) => p + 1);
    fetch(`/api/posts/${post.id}/play`, { method: "POST" }).catch(() => {});
  }, [post.id]);

  const toggle = () => {
    const a = audioRef.current;
    if (!a) return;
    if (playing) {
      a.pause();
      setPlaying(false);
    } else {
      setLoading(true);
      a.play()
        .then(() => { setPlaying(true); setLoading(false); trackPlay(); })
        .catch(() => setLoading(false));
    }
  };

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    const a = audioRef.current;
    if (!a || !a.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    a.currentTime = ((e.clientX - rect.left) / rect.width) * a.duration;
  };

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

  return (
    <div className="my-2 rounded-2xl overflow-hidden relative" style={{ background: "rgba(0,0,0,0.4)" }}>
      {/* Blurred background */}
      {post.albumCover && (
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${post.albumCover})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "blur(30px) brightness(0.25)",
            transform: "scale(1.1)",
          }}
        />
      )}

      <div className="relative flex items-center gap-4 p-4">
        {/* Spinning disc */}
        <div className="relative flex-shrink-0" style={{ width: 64, height: 64 }}>
          <div
            className="w-16 h-16 rounded-full overflow-hidden"
            style={{
              border: "3px solid rgba(0,200,220,0.3)",
              animation: playing ? "spin 8s linear infinite" : "none",
              boxShadow: playing ? "0 0 20px rgba(0,200,220,0.4)" : "none",
            }}
          >
            {post.albumCover ? (
              <Image src={post.albumCover} alt="Album" fill className="object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center" style={{ background: "radial-gradient(circle at 40% 40%, #1a5a7a, #0a1a2a)" }}>
                <i className="fas fa-music text-cyan-400 text-xl" />
              </div>
            )}
          </div>
          {/* Center hole */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#0a1a22", border: "2px solid rgba(255,255,255,0.2)" }} />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-base font-bold text-white truncate">{post.singer ?? "Unknown Artist"}</p>
          <p className="text-xs text-cyan-400/80 capitalize truncate">{post.songType ?? "Music"}</p>

          {/* Progress bar */}
          <div
            className="mt-3 h-1.5 rounded-full cursor-pointer relative group"
            style={{ background: "rgba(255,255,255,0.1)" }}
            onClick={seek}
          >
            <div
              className="h-full rounded-full"
              style={{ width: `${progress}%`, background: "linear-gradient(90deg,#00a884,#00c8e8)" }}
            />
            <div
              className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white shadow-lg -ml-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ left: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-xs text-white/40">{fmt(currentTime)}</span>
            <span className="text-xs text-white/40">{duration ? fmt(duration) : "--:--"}</span>
          </div>
        </div>

        {/* Play/Pause */}
        <button
          onClick={toggle}
          className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center transition-all"
          style={{
            background: "linear-gradient(135deg,#00a884,#00c8e8)",
            boxShadow: playing ? "0 0 24px rgba(0,170,132,0.6)" : "0 4px 12px rgba(0,0,0,0.4)",
          }}
        >
          {loading ? (
            <i className="fas fa-spinner fa-spin text-white" />
          ) : playing ? (
            <i className="fas fa-pause text-white" />
          ) : (
            <i className="fas fa-play text-white ml-0.5" />
          )}
        </button>
      </div>

      {/* Waveform */}
      <div className="flex items-end justify-center gap-px px-4 pb-2" style={{ height: "24px" }}>
        {WAVE_HEIGHTS.map((h, i) => (
          <div
            key={i}
            className="rounded-full flex-1"
            style={{
              background: playing ? "linear-gradient(to top,#00a884,#00c8e8)" : "rgba(255,255,255,0.1)",
              height: playing ? `${h}%` : "30%",
              animation: playing ? `waveBar ${0.3 + (i % 5) * 0.1}s ease-in-out infinite alternate` : "none",
              animationDelay: playing ? `${i * 0.04}s` : "0s",
              transition: "background 0.3s",
            }}
          />
        ))}
      </div>

      {/* Stats bar */}
      <div className="flex items-center gap-4 px-4 pb-3 pt-1">
        <span className="flex items-center gap-1.5 text-xs text-white/40">
          <i className="fas fa-play-circle text-cyan-500/60" />
          <span>{formatCount(plays)} plays</span>
        </span>
        {(post.downloadsCount ?? 0) > 0 && (
          <span className="flex items-center gap-1.5 text-xs text-white/40">
            <i className="fas fa-download text-white/30" />
            <span>{formatCount(post.downloadsCount)} downloads</span>
          </span>
        )}
        {post.likesCount != null && post.likesCount > 0 && (
          <span className="flex items-center gap-1.5 text-xs text-white/40">
            <i className="fas fa-heart text-pink-500/50" />
            <span>{formatCount(post.likesCount)}</span>
          </span>
        )}
      </div>

      <audio
        ref={audioRef}
        src={post.fileUrl!}
        onTimeUpdate={() => {
          const a = audioRef.current;
          if (!a) return;
          setCurrentTime(a.currentTime);
          setProgress(a.duration ? (a.currentTime / a.duration) * 100 : 0);
        }}
        onLoadedMetadata={() => setDuration(audioRef.current?.duration ?? 0)}
        onEnded={() => { setPlaying(false); setProgress(0); setCurrentTime(0); }}
        onWaiting={() => setLoading(true)}
        onPlaying={() => setLoading(false)}
      />
    </div>
  );
}

// ─── Video Player ────────────────────────────────────────────────
function VideoPlayer({ post }: { post: PostCardProps["post"] }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [muted, setMuted] = useState(false);
  const [views, setViews] = useState(post.views ?? 0);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const playTracked = useRef(false);

  const trackPlay = useCallback(() => {
    if (playTracked.current) return;
    playTracked.current = true;
    setViews((v) => v + 1);
    fetch(`/api/posts/${post.id}/play`, { method: "POST" }).catch(() => {});
  }, [post.id]);

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

  const revealControls = useCallback(() => {
    setShowControls(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    if (playing) hideTimer.current = setTimeout(() => setShowControls(false), 2500);
  }, [playing]);

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (playing) { v.pause(); setPlaying(false); }
    else { v.play(); setPlaying(true); trackPlay(); }
    revealControls();
  };

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    const v = videoRef.current;
    if (!v || !v.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    v.currentTime = ((e.clientX - rect.left) / rect.width) * v.duration;
  };

  const toggleMute = () => {
    if (videoRef.current) videoRef.current.muted = !muted;
    setMuted(!muted);
  };

  const fullscreen = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.requestFullscreen) v.requestFullscreen();
  };

  return (
    <div
      className="my-2 rounded-xl overflow-hidden relative bg-black group"
      style={{ maxHeight: "340px" }}
      onMouseMove={revealControls}
      onMouseEnter={revealControls}
    >
      <video
        ref={videoRef}
        src={post.fileUrl!}
        poster={post.thumbnailUrl ?? post.albumCover ?? undefined}
        className="w-full object-contain"
        style={{ maxHeight: "300px", display: "block" }}
        onTimeUpdate={() => {
          const v = videoRef.current;
          if (!v) return;
          setCurrentTime(v.currentTime);
          setProgress(v.duration ? (v.currentTime / v.duration) * 100 : 0);
        }}
        onLoadedMetadata={() => setDuration(videoRef.current?.duration ?? 0)}
        onEnded={() => { setPlaying(false); setProgress(0); setCurrentTime(0); setShowControls(true); }}
        onClick={togglePlay}
      />

      {/* Center play overlay */}
      {!playing && (
        <div
          className="absolute inset-0 flex items-center justify-center cursor-pointer"
          onClick={togglePlay}
          style={{ background: "rgba(0,0,0,0.3)" }}
        >
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center"
            style={{ background: "rgba(0,200,220,0.9)", boxShadow: "0 0 30px rgba(0,200,220,0.5)" }}
          >
            <i className="fas fa-play text-white text-xl ml-1" />
          </div>
        </div>
      )}

      {/* Control bar */}
      <div
        className="absolute bottom-0 left-0 right-0 transition-all duration-300"
        style={{
          background: "linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 100%)",
          padding: "24px 12px 10px",
          opacity: showControls ? 1 : 0,
          transform: showControls ? "translateY(0)" : "translateY(4px)",
          pointerEvents: showControls ? "auto" : "none",
        }}
      >
        {/* Progress */}
        <div
          className="h-1 rounded-full cursor-pointer mb-2 relative group/seek"
          style={{ background: "rgba(255,255,255,0.2)" }}
          onClick={seek}
        >
          <div className="h-full rounded-full" style={{ width: `${progress}%`, background: "#00c8e8" }} />
          <div
            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white -ml-1.5 opacity-0 group-hover/seek:opacity-100 transition-opacity"
            style={{ left: `${progress}%` }}
          />
        </div>

        <div className="flex items-center gap-3">
          <button onClick={togglePlay} className="text-white w-7 flex items-center justify-center">
            <i className={`fas fa-${playing ? "pause" : "play"}`} />
          </button>
          <span className="text-xs text-white/70">{fmt(currentTime)} / {duration ? fmt(duration) : "--:--"}</span>
          <span className="flex-1" />
          {/* Stats inline */}
          <span className="flex items-center gap-1 text-xs text-white/50">
            <i className="fas fa-eye" /> {formatCount(views)}
          </span>
          {(post.likesCount ?? 0) > 0 && (
            <span className="flex items-center gap-1 text-xs text-white/50">
              <i className="fas fa-heart" /> {formatCount(post.likesCount)}
            </span>
          )}
          <button onClick={toggleMute} className="text-white/70 hover:text-white text-sm transition-colors">
            <i className={`fas fa-volume-${muted ? "mute" : "up"}`} />
          </button>
          <button onClick={fullscreen} className="text-white/70 hover:text-white text-sm transition-colors">
            <i className="fas fa-expand" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Photo Viewer with Lightbox ──────────────────────────────────
function PhotoGalleryViewer({ images, alt }: { images: string[]; alt: string }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const visible = images.slice(0, 4);
  const remaining = images.length - visible.length;

  useEffect(() => {
    if (openIndex == null) return;

    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenIndex(null);
      if (e.key === "ArrowRight") setOpenIndex((current) => (current == null ? current : (current + 1) % images.length));
      if (e.key === "ArrowLeft") setOpenIndex((current) => (current == null ? current : (current - 1 + images.length) % images.length));
    };

    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [images.length, openIndex]);

  if (images.length <= 1) {
    return images[0] ? <PhotoViewer src={images[0]} alt={alt} /> : null;
  }

  return (
    <>
      <div className={`post-gallery-grid post-gallery-grid--${Math.min(images.length, 4)}`}>
        {visible.map((src, index) => (
          <button
            key={`${src}-${index}`}
            type="button"
            className={`post-gallery-grid__item post-gallery-grid__item--${Math.min(images.length, 4)}-${index + 1}`}
            onClick={() => setOpenIndex(index)}
          >
            <Image src={src} alt={`${alt} ${index + 1}`} fill className="object-cover transition-transform duration-300 hover:scale-[1.02]" />
            {remaining > 0 && index === visible.length - 1 && (
              <span className="post-gallery-grid__more">+{remaining}</span>
            )}
          </button>
        ))}
      </div>

      {openIndex != null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 px-4"
          onClick={() => setOpenIndex(null)}
        >
          <button
            type="button"
            className="absolute right-4 top-4 text-2xl text-white/70 transition-colors hover:text-white"
            onClick={() => setOpenIndex(null)}
          >
            <i className="fas fa-times" />
          </button>
          <button
            type="button"
            className="post-gallery-nav post-gallery-nav--left"
            onClick={(e) => {
              e.stopPropagation();
              setOpenIndex((current) => (current == null ? current : (current - 1 + images.length) % images.length));
            }}
          >
            <i className="fas fa-chevron-left" />
          </button>
          <button
            type="button"
            className="post-gallery-nav post-gallery-nav--right"
            onClick={(e) => {
              e.stopPropagation();
              setOpenIndex((current) => (current == null ? current : (current + 1) % images.length));
            }}
          >
            <i className="fas fa-chevron-right" />
          </button>
          <Image
            src={images[openIndex]}
            alt={`${alt} ${openIndex + 1}`}
            width={1400}
            height={1000}
            className="max-h-[92vh] max-w-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}

function PhotoViewer({ src, alt }: { src: string; alt: string }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    if (open) document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  return (
    <>
      <div
        className="my-2 rounded-xl overflow-hidden cursor-zoom-in relative group"
        onClick={() => setOpen(true)}
      >
        <Image
          src={src}
          alt={alt}
          width={600}
          height={400}
          className="w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          style={{ maxHeight: "350px" }}
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
            <i className="fas fa-expand text-white text-2xl drop-shadow-lg" />
          </div>
        </div>
      </div>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.95)" }}
          onClick={() => setOpen(false)}
        >
          <button
            className="absolute top-4 right-4 text-white/70 hover:text-white text-2xl z-10"
            onClick={() => setOpen(false)}
          >
            <i className="fas fa-times" />
          </button>
          <Image
            src={src}
            alt={alt}
            width={1200}
            height={800}
            className="max-w-full max-h-screen object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}

// ─── Comments Section ─────────────────────────────────────────────
function ConfirmDeleteModal({
  open,
  title,
  description,
  confirmLabel,
  loading,
  onConfirm,
  onClose,
}: {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  loading: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center px-4"
      style={{ background: "rgba(2,8,15,0.72)", backdropFilter: "blur(8px)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-3xl p-5 shadow-2xl"
        style={{
          background: "linear-gradient(180deg, rgba(10,23,34,0.98), rgba(4,12,20,0.98))",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3">
          <div
            className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ background: "rgba(239,68,68,0.12)", color: "#f87171", border: "1px solid rgba(248,113,113,0.18)" }}
          >
            <i className="fas fa-trash" />
          </div>
          <div className="min-w-0">
            <p className="text-base font-semibold text-white">{title}</p>
            <p className="text-sm text-white/55 mt-1 leading-relaxed">{description}</p>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 rounded-full text-sm text-white/70 border border-white/10 hover:bg-white/5 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2 rounded-full text-sm font-semibold text-white disabled:opacity-60"
            style={{ background: "linear-gradient(135deg,#b91c1c,#ef4444)" }}
          >
            {loading ? <i className="fas fa-spinner fa-spin" /> : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

function ReportPostModal({
  open,
  reason,
  error,
  loading,
  onReasonChange,
  onSubmit,
  onClose,
}: {
  open: boolean;
  reason: string;
  error: string;
  loading: boolean;
  onReasonChange: (value: string) => void;
  onSubmit: () => void;
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center px-4"
      style={{ background: "rgba(2,8,15,0.72)", backdropFilter: "blur(8px)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-3xl p-5 shadow-2xl"
        style={{
          background: "linear-gradient(180deg, rgba(10,23,34,0.98), rgba(4,12,20,0.98))",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3">
          <div
            className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ background: "rgba(245,158,11,0.12)", color: "#fbbf24", border: "1px solid rgba(251,191,36,0.18)" }}
          >
            <i className="fas fa-flag" />
          </div>
          <div className="min-w-0">
            <p className="text-base font-semibold text-white">Report post</p>
            <p className="text-sm text-white/55 mt-1 leading-relaxed">
              Tell us what is wrong with this post. Your report will be reviewed.
            </p>
          </div>
        </div>

        <div className="mt-4">
          <textarea
            value={reason}
            onChange={(e) => onReasonChange(e.target.value)}
            placeholder="Describe the issue..."
            className="sage-input w-full min-h-28 rounded-2xl px-4 py-3 text-sm"
          />
          {error && <p className="text-xs text-red-400 mt-2">{error}</p>}
        </div>

        <div className="mt-5 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 rounded-full text-sm text-white/70 border border-white/10 hover:bg-white/5 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onSubmit}
            disabled={loading}
            className="px-4 py-2 rounded-full text-sm font-semibold text-white disabled:opacity-60"
            style={{ background: "linear-gradient(135deg,#d97706,#f59e0b)" }}
          >
            {loading ? <i className="fas fa-spinner fa-spin" /> : "Submit report"}
          </button>
        </div>
      </div>
    </div>
  );
}

function CommentsSection({
  postId,
  currentUserId,
  onCountChange,
  onToast,
}: {
  postId: string;
  currentUserId?: string | null;
  onCountChange?: (delta: number) => void;
  onToast?: (toast: NonNullable<AppToast>) => void;
}) {
  const [comments, setComments] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [replyInput, setReplyInput] = useState<Record<string, string>>({});
  const [replyLoading, setReplyLoading] = useState<Record<string, boolean>>({});
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editInput, setEditInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [savingComment, setSavingComment] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<DeleteConfirmState>(null);
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/posts/${postId}/comments`)
      .then((r) => r.json())
      .then((d) => setComments(d.comments ?? []));
  }, [postId]);

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim()) return;
    setLoading(true);
    const res = await fetch(`/api/posts/${postId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: input }),
    });
    if (res.ok) {
      const d = await res.json();
      setComments((c) => [...c, d.comment]);
      setInput("");
      onCountChange?.(1);
      onToast?.({ type: "success", message: "Comment posted." });
    } else {
      onToast?.({ type: "error", message: "Unable to post comment." });
    }
    setLoading(false);
  };

  const handleReplySubmit = async (parentId: string) => {
    const content = replyInput[parentId]?.trim();
    if (!content) return;
    setReplyLoading((current) => ({ ...current, [parentId]: true }));

    const res = await fetch(`/api/posts/${postId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, parentId }),
    });

    if (res.ok) {
      const d = await res.json();
      setComments((current) => [...current, d.comment]);
      setReplyInput((current) => ({ ...current, [parentId]: "" }));
      setReplyingTo(null);
      onCountChange?.(1);
      onToast?.({ type: "success", message: "Reply sent." });
    } else {
      onToast?.({ type: "error", message: "Unable to send reply." });
    }
    setReplyLoading((current) => ({ ...current, [parentId]: false }));
  };

  const handleDeleteComment = async (commentId: string) => {
    setDeletingCommentId(commentId);
    const res = await fetch(`/api/posts/${postId}/comments/${commentId}`, { method: "DELETE" });
    if (!res.ok) {
      setDeletingCommentId(null);
      onToast?.({ type: "error", message: "Unable to delete item." });
      return;
    }

    const idsToRemove = new Set(
      comments.filter((comment) => comment.id === commentId || comment.parentId === commentId).map((comment) => comment.id)
    );
    setComments((current) => current.filter((comment) => !idsToRemove.has(comment.id)));
    onCountChange?.(-idsToRemove.size);
    setDeleteTarget(null);
    setDeletingCommentId(null);
    onToast?.({ type: "success", message: "Item deleted." });
  };

  const handleSaveComment = async () => {
    if (!editingCommentId || !editInput.trim()) return;
    setSavingComment(true);

    const res = await fetch(`/api/posts/${postId}/comments/${editingCommentId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: editInput.trim() }),
    });
    if (!res.ok) {
      setSavingComment(false);
      onToast?.({ type: "error", message: "Unable to save changes." });
      return;
    }

    setComments((current) =>
      current.map((comment) =>
        comment.id === editingCommentId ? { ...comment, content: editInput.trim() } : comment
      )
    );
    setEditingCommentId(null);
    setEditInput("");
    setSavingComment(false);
    onToast?.({ type: "success", message: "Changes saved." });
  };

  const rootComments = comments.filter((comment) => !comment.parentId);
  const repliesByParent = comments.reduce((acc, comment) => {
    if (!comment.parentId) return acc;
    acc[comment.parentId] = [...(acc[comment.parentId] ?? []), comment];
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <div className="mt-4 pt-3" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
      <div className="space-y-3 mb-3 max-h-56 overflow-y-auto">
        {rootComments.length === 0 && (
          <p className="text-xs text-white/30 text-center py-2">No comments yet</p>
        )}
        {rootComments.map((c) => (
          <div key={c.id} className="space-y-2">
            <div className="flex gap-2.5 items-start">
              <Image
                src={c.userPicture || "/files/default-avatar.svg"}
                alt={c.username || "user"}
                width={28}
                height={28}
                className="rounded-full object-cover flex-shrink-0 mt-0.5"
                style={{ border: "1.5px solid rgba(0,200,220,0.2)" }}
              />
              <div className="modern-comment-surface flex-1 px-3 py-2.5">
                <p className="text-xs font-semibold text-cyan-400 capitalize">{c.username}</p>
                {editingCommentId === c.id ? (
                  <div className="space-y-2 mt-1">
                    <textarea
                      value={editInput}
                      onChange={(e) => setEditInput(e.target.value)}
                      className="sage-input w-full text-sm min-h-20 rounded-2xl px-3 py-2"
                    />
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleSaveComment}
                        disabled={savingComment || !editInput.trim()}
                        className="text-xs px-3 py-1.5 rounded-full font-semibold"
                        style={{ background: "linear-gradient(135deg,#00a884,#00c8e8)", color: "white" }}
                      >
                        {savingComment ? <i className="fas fa-spinner fa-spin" /> : "Save"}
                      </button>
                      <button
                        onClick={() => {
                          setEditingCommentId(null);
                          setEditInput("");
                        }}
                        className="text-xs text-white/60 hover:text-white"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-white/80 mt-0.5 leading-relaxed">{c.content}</p>
                )}
                <div className="mt-2 flex items-center gap-3 text-[11px] text-white/45">
                  {currentUserId && (
                    <button
                      onClick={() => setReplyingTo((current) => (current === c.id ? null : c.id))}
                      className="hover:text-cyan-400 transition-colors"
                    >
                      Reply
                    </button>
                  )}
                  {currentUserId === c.userId && (
                    <button
                      onClick={() => {
                        setEditingCommentId(c.id);
                        setEditInput(c.content);
                      }}
                      className="hover:text-cyan-400 transition-colors"
                    >
                      Edit
                    </button>
                  )}
                  {currentUserId === c.userId && (
                    <button
                      onClick={() => setDeleteTarget({ id: c.id, label: "comment" })}
                      className="hover:text-red-400 transition-colors"
                    >
                      {deletingCommentId === c.id ? <i className="fas fa-spinner fa-spin" /> : "Delete"}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {replyingTo === c.id && currentUserId && (
              <div className="ml-10 flex gap-2">
                <input
                  type="text"
                  value={replyInput[c.id] ?? ""}
                  onChange={(e) => setReplyInput((current) => ({ ...current, [c.id]: e.target.value }))}
                  placeholder={`Reply to ${c.username}...`}
                  className="sage-input flex-1 text-sm py-2 rounded-full px-4"
                />
                <button
                  type="button"
                  onClick={() => handleReplySubmit(c.id)}
                  disabled={replyLoading[c.id] || !(replyInput[c.id] ?? "").trim()}
                  className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-all disabled:opacity-40"
                  style={{ background: "linear-gradient(135deg,#00a884,#00c8e8)" }}
                >
                  {replyLoading[c.id] ? (
                    <i className="fas fa-spinner fa-spin text-white text-xs" />
                  ) : (
                    <i className="fas fa-reply text-white text-xs" />
                  )}
                </button>
              </div>
            )}

            {(repliesByParent[c.id] ?? []).map((reply: any) => (
              <div key={reply.id} className="ml-10 flex gap-2.5 items-start">
                <Image
                  src={reply.userPicture || "/files/default-avatar.svg"}
                  alt={reply.username || "user"}
                  width={24}
                  height={24}
                  className="rounded-full object-cover flex-shrink-0 mt-0.5"
                  style={{ border: "1px solid rgba(0,200,220,0.2)" }}
                />
                <div className="modern-comment-surface flex-1 px-3 py-2.5">
                  <p className="text-xs font-semibold text-cyan-400 capitalize">{reply.username}</p>
                  {editingCommentId === reply.id ? (
                    <div className="space-y-2 mt-1">
                      <textarea
                        value={editInput}
                        onChange={(e) => setEditInput(e.target.value)}
                        className="sage-input w-full text-sm min-h-20 rounded-2xl px-3 py-2"
                      />
                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleSaveComment}
                          disabled={savingComment || !editInput.trim()}
                          className="text-xs px-3 py-1.5 rounded-full font-semibold"
                          style={{ background: "linear-gradient(135deg,#00a884,#00c8e8)", color: "white" }}
                        >
                          {savingComment ? <i className="fas fa-spinner fa-spin" /> : "Save"}
                        </button>
                        <button
                          onClick={() => {
                            setEditingCommentId(null);
                            setEditInput("");
                          }}
                          className="text-xs text-white/60 hover:text-white"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-white/80 mt-0.5 leading-relaxed">{reply.content}</p>
                  )}
                  <div className="mt-2 flex items-center gap-3 text-[11px] text-white/45">
                    {currentUserId === reply.userId && (
                      <button
                        onClick={() => {
                          setEditingCommentId(reply.id);
                          setEditInput(reply.content);
                        }}
                        className="hover:text-cyan-400 transition-colors"
                      >
                        Edit
                      </button>
                    )}
                    {currentUserId === reply.userId && (
                      <button
                        onClick={() => setDeleteTarget({ id: reply.id, label: "reply" })}
                        className="hover:text-red-400 transition-colors"
                      >
                        {deletingCommentId === reply.id ? <i className="fas fa-spinner fa-spin" /> : "Delete"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      {currentUserId && (
        <form onSubmit={handleSubmit} className="mt-3 flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Write a comment..."
            className="sage-input flex-1 rounded-full px-4 py-2.5 text-sm"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="modern-pill-action flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full transition-all disabled:opacity-40"
            style={{ background: "linear-gradient(135deg,#00a884,#00c8e8)" }}
          >
            {loading ? <i className="fas fa-spinner fa-spin text-white text-xs" /> : <i className="fas fa-paper-plane text-white text-xs" />}
          </button>
        </form>
      )}

      <ConfirmDeleteModal
        open={!!deleteTarget}
        title={deleteTarget ? `Delete ${deleteTarget.label}?` : "Delete item?"}
        description={deleteTarget ? `This ${deleteTarget.label} will be removed permanently. This action cannot be undone.` : ""}
        confirmLabel={deleteTarget ? `Delete ${deleteTarget.label}` : "Delete"}
        loading={!!deletingCommentId}
        onConfirm={() => {
          if (deleteTarget) void handleDeleteComment(deleteTarget.id);
        }}
        onClose={() => {
          if (!deletingCommentId) setDeleteTarget(null);
        }}
      />
    </div>
  );
}
