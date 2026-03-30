"use client";

import { useEffect, useState } from "react";
import { timeAgo } from "@/lib/utils";
import { useToast } from "@/components/ui/ToastProvider";
import AdminModal from "../components/AdminModal";
import AdminConfirmModal from "../components/AdminConfirmModal";
import { ModernLoader } from "@/components/ui/ModernLoader";

interface AdminPost {
  id: string;
  postType: string;
  generalPost?: string | null;
  blogTitle?: string | null;
  postDescription?: string | null;
  fileUrl?: string | null;
  approved: boolean;
  createdAt: string;
  userId: string;
  username?: string | null;
}

export default function AdminPostsClient() {
  const { showToast } = useToast();
  const [posts, setPosts] = useState<AdminPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [endNoticeVisible, setEndNoticeVisible] = useState(false);
  const [filter, setFilter] = useState<"pending" | "all">("all");
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [editingPost, setEditingPost] = useState<AdminPost | null>(null);
  const [saving, setSaving] = useState(false);
  const [confirmApprove, setConfirmApprove] = useState<AdminPost | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<AdminPost | null>(null);
  const [processingAction, setProcessingAction] = useState<"approve" | "delete" | null>(null);
  const [form, setForm] = useState({
    generalPost: "",
    blogTitle: "",
    postDescription: "",
    approved: false,
  });
  const canSearch = search.trim().length > 1;

  const load = async (offset = 0, mode: "replace" | "append" = "replace", searchTerm = query) => {
    if (mode === "replace") setLoading(true);
    if (mode === "append") setLoadingMore(true);
    if (mode === "replace" && searchTerm.trim().length > 1) setSearching(true);
    const params = new URLSearchParams({
      status: filter,
      offset: String(offset),
    });
    if (searchTerm.trim()) params.set("q", searchTerm.trim());
    const res = await fetch(`/api/admin/posts?${params.toString()}`);
    if (res.ok) {
      const d = await res.json();
      const nextPosts = d.posts ?? [];
      setPosts((current) => (mode === "append" ? [...current, ...nextPosts] : nextPosts));
      setHasMore(nextPosts.length === 30);
      if (mode === "append" && nextPosts.length < 30) {
        setEndNoticeVisible(true);
        setTimeout(() => setEndNoticeVisible(false), 1800);
      }
    }
    if (mode === "replace") setLoading(false);
    if (mode === "append") setLoadingMore(false);
    if (mode === "replace") setSearching(false);
  };

  useEffect(() => {
    void load();
  }, [filter]);

  const openEdit = (post: AdminPost) => {
    setEditingPost(post);
    setForm({
      generalPost: post.generalPost ?? "",
      blogTitle: post.blogTitle ?? "",
      postDescription: post.postDescription ?? "",
      approved: post.approved,
    });
  };

  const savePost = async () => {
    if (!editingPost) return;
    setSaving(true);
    const res = await fetch(`/api/admin/posts/${editingPost.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        generalPost: form.generalPost,
        blogTitle: form.blogTitle,
        postDescription: form.postDescription,
        approved: form.approved,
      }),
    });
    if (!res.ok) {
      showToast({ type: "error", message: "Unable to save post changes." });
      setSaving(false);
      return;
    }

    setPosts((current) =>
      current.map((post) =>
        post.id === editingPost.id
          ? {
              ...post,
              generalPost: form.generalPost,
              blogTitle: form.blogTitle,
              postDescription: form.postDescription,
              approved: form.approved,
            }
          : post
      )
    );
    showToast({ type: "success", message: "Post updated successfully." });
    setSaving(false);
    setEditingPost(null);
  };

  const approve = async () => {
    if (!confirmApprove) return;
    setProcessingAction("approve");
    const res = await fetch(`/api/admin/posts/${confirmApprove.id}/approve`, { method: "PATCH" });
    if (!res.ok) {
      showToast({ type: "error", message: "Unable to approve post." });
      setProcessingAction(null);
      return;
    }
    setPosts((current) => current.map((post) => (post.id === confirmApprove.id ? { ...post, approved: true } : post)));
    showToast({ type: "success", message: "Post approved." });
    setConfirmApprove(null);
    setProcessingAction(null);
  };

  const deletePost = async () => {
    if (!confirmDelete) return;
    setProcessingAction("delete");
    const res = await fetch(`/api/admin/posts/${confirmDelete.id}`, { method: "DELETE" });
    if (!res.ok) {
      showToast({ type: "error", message: "Unable to delete post." });
      setProcessingAction(null);
      return;
    }
    setPosts((current) => current.filter((post) => post.id !== confirmDelete.id));
    if (editingPost?.id === confirmDelete.id) setEditingPost(null);
    showToast({ type: "success", message: "Post deleted." });
    setConfirmDelete(null);
    setProcessingAction(null);
  };

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Manage Posts</h1>
          <p className="text-sm text-white/40">Search by content, title, username, or post type.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {(["pending", "all"] as const).map((value) => (
            <button
              key={value}
              onClick={() => setFilter(value)}
              className={`rounded-full px-3 py-1 text-xs capitalize transition-colors ${
                filter === value ? "bg-[#006688] text-white" : "border border-white/30 text-white/60 hover:text-white"
              }`}
            >
              {value}
            </button>
          ))}
        </div>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          const nextQuery = search.trim();
          if (nextQuery.length <= 1) return;
          setQuery(nextQuery);
          void load(0, "replace", nextQuery);
        }}
        className="mb-4 flex items-stretch gap-2"
      >
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search posts, titles, usernames..."
          className="w-[80%] min-w-0 rounded-xl border border-white/10 bg-black/20 px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-500/50"
        />
        <div className="flex w-[20%] min-w-[112px] gap-2">
          <button
            type="submit"
            disabled={!canSearch}
            className="btn-sage flex-1 px-3 disabled:cursor-not-allowed disabled:opacity-45"
          >
            {searching ? (
              <>
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent" />
                <span className="hidden sm:inline">Searching</span>
              </>
            ) : (
              "Search"
            )}
          </button>
        </div>
      </form>

      {searching ? (
        <div className="mb-4 rounded-xl border border-cyan-500/20 bg-cyan-500/10 px-4 py-3 text-sm text-cyan-200">
          <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent align-[-2px]" />
          Searching posts...
        </div>
      ) : null}

      {loading ? <ModernLoader label="Loading posts..." sublabel="Preparing moderation queue" /> : null}

      <div className="space-y-3">
        {posts.map((post) => (
          <div key={post.id} className="sage-card flex items-start gap-3">
            <button type="button" onClick={() => openEdit(post)} className="min-w-0 flex-1 text-left">
              <div className="mb-1 flex items-center gap-2">
                <span className="rounded-full bg-cyan-900/30 px-2 py-0.5 text-xs capitalize text-cyan-400">{post.postType}</span>
                <span className={`text-xs ${post.approved ? "text-green-400" : "text-yellow-400"}`}>
                  {post.approved ? "Approved" : "Pending"}
                </span>
                <span className="text-xs text-white/30">{timeAgo(post.createdAt)}</span>
              </div>
              <p className="truncate text-sm text-white">
                {post.generalPost ?? post.blogTitle ?? post.postDescription ?? post.fileUrl ?? "(media post)"}
              </p>
              <p className="mt-0.5 text-xs text-white/40">by {post.username || "Unknown user"}</p>
            </button>

            <div className="flex flex-shrink-0 flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={() => openEdit(post)}
                className="rounded-lg border border-cyan-800/40 px-2.5 py-2 text-xs text-cyan-400 transition-colors hover:bg-cyan-900/20"
                title="View details"
                aria-label={`View details for post by ${post.username || "Unknown user"}`}
              >
                <i className="fas fa-eye" />
              </button>
              {!post.approved ? (
                <button
                  type="button"
                  onClick={() => setConfirmApprove(post)}
                  className="rounded-lg border border-green-800/40 px-2.5 py-2 text-xs text-green-400 transition-colors hover:bg-green-900/20"
                  title="Approve post"
                >
                  <i className="fas fa-check" />
                </button>
              ) : null}
              <button
                type="button"
                onClick={() => setConfirmDelete(post)}
                className="rounded-lg border border-red-800/40 px-2.5 py-2 text-xs text-red-400 transition-colors hover:bg-red-900/20"
                title="Delete post"
              >
                <i className="fas fa-trash" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {!loading && posts.length === 0 ? <p className="py-8 text-center text-sm text-white/40">No posts found</p> : null}

      {!loading && posts.length > 0 ? (
        <div className="mt-5 flex justify-center">
          {hasMore ? (
            <button
              type="button"
              onClick={() => void load(posts.length, "append")}
              disabled={loadingMore}
              className="inline-flex min-w-[150px] items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white transition-colors hover:bg-white/[0.07] disabled:cursor-not-allowed disabled:opacity-45"
            >
              {loadingMore ? <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent" /> : null}
              {loadingMore ? "Loading..." : "Load more"}
            </button>
          ) : endNoticeVisible ? (
            <div className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white/70">
              No more posts
            </div>
          ) : null}
        </div>
      ) : null}

      <AdminModal
        open={Boolean(editingPost)}
        onClose={() => !saving && setEditingPost(null)}
        title={editingPost ? `Edit post by ${editingPost.username || "Unknown user"}` : "Edit post"}
        description="Review the content, moderation state, and save changes."
      >
        {editingPost ? (
          <div className="space-y-4">
            <label className="space-y-2">
              <span className="text-sm text-white/60">Title</span>
              <input
                value={form.blogTitle}
                onChange={(e) => setForm((current) => ({ ...current, blogTitle: e.target.value }))}
                className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-500/50"
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm text-white/60">Main content</span>
              <textarea
                rows={5}
                value={form.generalPost}
                onChange={(e) => setForm((current) => ({ ...current, generalPost: e.target.value }))}
                className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-500/50"
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm text-white/60">Description</span>
              <textarea
                rows={4}
                value={form.postDescription}
                onChange={(e) => setForm((current) => ({ ...current, postDescription: e.target.value }))}
                className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-500/50"
              />
            </label>
            <label className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/20 px-3 py-3 text-sm text-white/80">
              <input
                type="checkbox"
                checked={form.approved}
                onChange={(e) => setForm((current) => ({ ...current, approved: e.target.checked }))}
              />
              Approved
            </label>
            <div className="flex items-center justify-end">
              <button
                type="button"
                onClick={savePost}
                disabled={saving}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-cyan-500/25 bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-200 transition-colors hover:bg-cyan-500/15 disabled:opacity-60 sm:w-auto"
              >
                {saving ? <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent" /> : null}
                {saving ? "Saving..." : "Save changes"}
              </button>
            </div>
          </div>
        ) : null}
      </AdminModal>

      <AdminConfirmModal
        open={Boolean(confirmApprove)}
        onClose={() => processingAction !== "approve" && setConfirmApprove(null)}
        onConfirm={approve}
        loading={processingAction === "approve"}
        title="Approve post"
        description={`Approve the post from ${confirmApprove?.username || "this user"} and make it publicly available?`}
        confirmLabel="Approve post"
        intent="success"
      />

      <AdminConfirmModal
        open={Boolean(confirmDelete)}
        onClose={() => processingAction !== "delete" && setConfirmDelete(null)}
        onConfirm={deletePost}
        loading={processingAction === "delete"}
        title="Delete post"
        description="Delete this post permanently? This action cannot be undone."
        confirmLabel="Delete post"
        intent="danger"
      />
    </div>
  );
}
