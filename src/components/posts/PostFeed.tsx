"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import PostCard from "./PostCard";
import PostComposer from "./PostComposer";
import { getPrimaryMediaUrl } from "@/lib/postMedia";

interface CurrentUser {
  id: string;
  username?: string | null;
  picture?: string | null;
  points?: string | number | null;
}

interface PostFeedProps {
  currentUserId?: string | null;
  currentUser?: CurrentUser | null;
  postType?: string;
  userId?: string;
  postId?: string;
  search?: string;
  showComposer?: boolean;
  gridView?: boolean;
  order?: string;
}

export default function PostFeed({
  currentUserId,
  currentUser,
  postType,
  userId,
  postId,
  search,
  showComposer = true,
  gridView = false,
  order,
}: PostFeedProps) {
  const [posts, setPosts] = useState<any[]>([]);
  const [selectedGridPost, setSelectedGridPost] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const fetchMoreRef = useRef<() => void>(() => {});
  const LIMIT = 15;

  const buildUrl = useCallback(
    (o: number) => {
      const params = new URLSearchParams({ limit: String(LIMIT), offset: String(o) });
      if (postType) params.set("type", postType);
      if (userId) params.set("userId", userId);
      if (postId) params.set("postId", postId);
      if (search) params.set("q", search);
      if (order) params.set("order", order);
      return `/api/posts?${params}`;
    },
    [postType, userId, postId, search, order]
  );

  const fetchPosts = useCallback(async (reset = false) => {
    const currentOffset = reset ? 0 : offset;
    if (!reset && !hasMore) return;

    reset ? setLoading(true) : setLoadingMore(true);

    const res = await fetch(buildUrl(currentOffset));
    if (res.ok) {
      const data = await res.json();
      const newPosts: any[] = data.posts ?? [];
      setPosts((prev) => (reset ? newPosts : [...prev, ...newPosts]));
      setHasMore(newPosts.length === LIMIT);
      setOffset(currentOffset + newPosts.length);
    }
    reset ? setLoading(false) : setLoadingMore(false);
  }, [offset, hasMore, buildUrl]);

  // Initial load + reset on filter change
  useEffect(() => {
    setPosts([]);
    setOffset(0);
    setHasMore(true);
    fetchPosts(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postType, userId, postId, search, order]);

  useEffect(() => {
    const handler = () => {
      setPosts([]);
      setOffset(0);
      setHasMore(true);
      fetchPosts(true);
    };
    window.addEventListener("post-created", handler as EventListener);
    return () => window.removeEventListener("post-created", handler as EventListener);
  }, [fetchPosts]);

  // Keep ref in sync so the observer callback always sees latest values
  useEffect(() => {
    fetchMoreRef.current = () => {
      if (hasMore && !loadingMore && !loading) fetchPosts(false);
    };
  }, [hasMore, loadingMore, loading, fetchPosts]);

  // Create observer once — never recreated, uses ref to avoid stale closure
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting) fetchMoreRef.current(); },
      { threshold: 0.1 }
    );
    if (sentinelRef.current) observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, []);

  const handlePostCreated = (newPost: any) => {
    setPosts((prev) => [newPost, ...prev]);
  };

  const handlePostDeleted = (id: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <div>
      {showComposer && (
        <PostComposer user={currentUser ?? null} onCreated={handlePostCreated} />
      )}

      {loading && (
        <div className="text-center py-12">
          <div className="modern-list-loader mx-auto" aria-hidden="true">
            <div className="modern-list-loader__core" />
          </div>
          <p className="loading-text mt-3">Loading posts...</p>
        </div>
      )}

      {!loading && posts.length === 0 && (
        <div className="text-center py-16">
          <i className="fas fa-inbox text-4xl text-white/20 mb-3" />
          <p className="text-white/40 text-sm">
            {search ? `Nothing found for "${search}"` : "No posts available"}
          </p>
        </div>
      )}

      {gridView ? (
        <>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: postType === "photo" ? "repeat(auto-fill,minmax(6rem,1fr))" : "repeat(auto-fill,minmax(10rem,1fr))",
              gap: "4px",
            }}
          >
            {posts.map((post) => (
              <button
                key={post.id}
                onClick={() => setSelectedGridPost(post)}
                className="relative group overflow-hidden"
                style={{ aspectRatio: "1", background: "#111" }}
              >
                {getPrimaryMediaUrl(post.fileUrl) ? (
                  <Image
                    src={getPrimaryMediaUrl(post.fileUrl)!}
                    alt={post.postDescription ?? post.filename ?? ""}
                    fill
                    sizes="10rem"
                    className="object-cover group-hover:opacity-80 transition-opacity"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <i className="fas fa-film text-white/20 text-2xl" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                  <i className={`${postType === "photo" ? "fas fa-expand" : "fas fa-play"} text-white text-xl opacity-0 group-hover:opacity-100 transition-opacity`} />
                </div>
                <p className="absolute bottom-0 left-0 right-0 text-xs text-white/80 px-1 py-0.5 truncate bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                  {post.filename ?? post.postDescription ?? post.singer ?? ""}
                </p>
              </button>
            ))}
          </div>

          {/* Grid post modal */}
          {selectedGridPost && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              style={{ background: "rgba(0,0,0,0.85)" }}
              onClick={(e) => { if (e.target === e.currentTarget) setSelectedGridPost(null); }}
            >
              <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-lg" style={{ background: "rgb(22,40,50)" }}>
                <button
                  onClick={() => setSelectedGridPost(null)}
                  className="absolute top-2 right-2 z-10 text-white/60 hover:text-white text-xl p-1"
                >
                  <i className="fas fa-times" />
                </button>
                <PostCard post={selectedGridPost} currentUserId={currentUserId} onDelete={(id) => { handlePostDeleted(id); setSelectedGridPost(null); }} />
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="space-y-0">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              currentUserId={currentUserId}
              onDelete={handlePostDeleted}
            />
          ))}
        </div>
      )}

      {/* Infinite scroll sentinel */}
      <div ref={sentinelRef} className="h-4" />

      {loadingMore && (
        <div className="text-center py-4 text-cyan-400 text-sm flex items-center justify-center gap-2">
          <span className="inline-loader" aria-hidden="true" />
          Loading more posts...
        </div>
      )}

      {!hasMore && posts.length > 0 && (
        <p className="text-center text-red-400 text-sm py-4">No more posts</p>
      )}
    </div>
  );
}
