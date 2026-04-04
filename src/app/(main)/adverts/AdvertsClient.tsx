"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import PostFeed from "@/components/posts/PostFeed";
import { useToast } from "@/components/ui/ToastProvider";

type AdvertRow = {
  id: string;
  slug?: string | null;
  advertTitle?: string | null;
  advertUrl?: string | null;
  postDescription?: string | null;
  fileUrl?: string | null;
  fileType?: string | null;
  views?: number | null;
  advertClicks?: number | null;
  likesCount?: number | null;
  commentsCount?: number | null;
  approved?: boolean | null;
  createdAt?: string | Date | null;
  updatedAt?: string | Date | null;
  advertExpiresAt?: string | Date | null;
};

interface AdvertsClientProps {
  currentUserId: string | null;
}

type TabKey = "manage" | "feed";

const PAGE_SIZE = 6;

function daysRemaining(expiresAt: string | Date | null | undefined, createdAt?: string | Date | null | undefined) {
  const value = expiresAt
    ? new Date(expiresAt).getTime()
    : createdAt
      ? new Date(createdAt).getTime() + 30 * 24 * 60 * 60 * 1000
      : NaN;
  if (Number.isNaN(value)) return 0;
  return Math.ceil((value - Date.now()) / (1000 * 60 * 60 * 24));
}

function formatDate(value: string | Date | null | undefined) {
  if (!value) return "Unknown";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown";
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getExpiryDateLabel(expiresAt: string | Date | null | undefined, createdAt?: string | Date | null | undefined) {
  if (expiresAt) return formatDate(expiresAt);
  if (createdAt) return formatDate(new Date(new Date(createdAt).getTime() + 30 * 24 * 60 * 60 * 1000));
  return "Unknown";
}

function buildCtr(clicks: number, views: number) {
  if (!views || !clicks) return "0.00%";
  return `${((clicks / views) * 100).toFixed(2)}%`;
}

export default function AdvertsClient({ currentUserId }: AdvertsClientProps) {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<TabKey>(currentUserId ? "manage" : "feed");
  const [items, setItems] = useState<AdvertRow[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [availablePoints, setAvailablePoints] = useState(0);
  const [renewCost, setRenewCost] = useState(100);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [infoOpenId, setInfoOpenId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [actionId, setActionId] = useState<string | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editUrl, setEditUrl] = useState("");

  const canLoadMore = items.length < totalCount;

  const summary = useMemo(() => {
    const active = items.filter((item) => daysRemaining(item.advertExpiresAt, item.createdAt) > 0).length;
    const expired = items.filter((item) => daysRemaining(item.advertExpiresAt, item.createdAt) <= 0).length;
    return { active, expired };
  }, [items]);

  const fetchManage = async (append = false) => {
    if (!currentUserId) return;
    append ? setLoadingMore(true) : setLoading(true);
    if (!append) setLoadError(null);

    try {
      const nextOffset = append ? items.length : 0;
      const res = await fetch(`/api/posts/adverts/manage?limit=${PAGE_SIZE}&offset=${nextOffset}`, { cache: "no-store" });
      if (!res.ok) throw new Error("Unable to load adverts right now.");
      const data = await res.json();
      const nextItems: AdvertRow[] = data.adverts ?? [];
      setItems((current) => (append ? [...current, ...nextItems] : nextItems));
      setTotalCount(Number(data.totalCount ?? 0));
      setAvailablePoints(Number(data.availablePoints ?? 0));
      setRenewCost(Number(data.renewCost ?? 100));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to load adverts right now.";
      setLoadError(message);
    } finally {
      append ? setLoadingMore(false) : setLoading(false);
    }
  };

  useEffect(() => {
    if (!currentUserId) return;
    void fetchManage(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUserId]);

  const startEdit = (item: AdvertRow) => {
    setEditingId(item.id);
    setInfoOpenId(null);
    setEditTitle(item.advertTitle ?? "");
    setEditDescription(item.postDescription ?? "");
    setEditUrl(item.advertUrl ?? "");
  };

  const saveEdit = async (id: string) => {
    if (!editTitle.trim()) {
      showToast({ type: "error", message: "Advert title is required." });
      return;
    }
    if (!editUrl.trim()) {
      showToast({ type: "error", message: "Advert URL is required." });
      return;
    }

    setActionId(id);
    try {
      const res = await fetch(`/api/posts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          advertTitle: editTitle.trim(),
          postDescription: editDescription.trim(),
          advertUrl: editUrl.trim(),
        }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error ?? "Unable to update advert.");

      setItems((current) =>
        current.map((item) =>
          item.id === id
            ? {
                ...item,
                advertTitle: editTitle.trim(),
                postDescription: editDescription.trim(),
                advertUrl: editUrl.trim(),
              }
            : item
        )
      );
      setEditingId(null);
      showToast({ type: "success", message: "Advert updated." });
    } catch (error) {
      showToast({ type: "error", message: error instanceof Error ? error.message : "Unable to update advert." });
    } finally {
      setActionId(null);
    }
  };

  const renewAdvert = async (id: string) => {
    setActionId(id);
    try {
      const res = await fetch(`/api/posts/${id}/advert-renew`, { method: "POST" });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error ?? "Unable to renew advert.");

      setItems((current) =>
        current.map((item) =>
          item.id === id
            ? {
                ...item,
                approved: true,
                advertExpiresAt: data?.advertExpiresAt ?? item.advertExpiresAt,
              }
            : item
        )
      );
      setAvailablePoints(Number(data?.availablePoints ?? availablePoints));
      showToast({ type: "success", message: "Advert renewed for 30 more days." });
    } catch (error) {
      showToast({ type: "error", message: error instanceof Error ? error.message : "Unable to renew advert." });
    } finally {
      setActionId(null);
    }
  };

  const deleteAdvert = async (id: string) => {
    setActionId(id);
    try {
      const res = await fetch(`/api/posts/${id}`, { method: "DELETE" });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error ?? "Unable to delete advert.");

      setItems((current) => current.filter((item) => item.id !== id));
      setTotalCount((current) => Math.max(0, current - 1));
      if (infoOpenId === id) setInfoOpenId(null);
      if (editingId === id) setEditingId(null);
      if (deleteTargetId === id) setDeleteTargetId(null);
      showToast({ type: "success", message: "Advert deleted." });
    } catch (error) {
      showToast({ type: "error", message: error instanceof Error ? error.message : "Unable to delete advert." });
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl border border-cyan-400/15 bg-cyan-400/10 text-cyan-300">
          <i className="fas fa-ad text-sm" />
        </span>
        <h1 className="text-lg font-bold text-white">Adverts</h1>
      </div>

      {currentUserId ? (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            {[
              { key: "manage", label: "My adverts" },
              { key: "feed", label: "Public adverts" },
            ].map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key as TabKey)}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                  activeTab === tab.key
                    ? "border-cyan-400/30 bg-cyan-400/10 text-cyan-200"
                    : "border-white/10 bg-white/[0.03] text-white/60 hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === "manage" ? (
            <section className="rounded-[22px] border border-white/10 bg-white/[0.03] p-3 sm:p-4">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-white">Advert manager</p>
                  <p className="mt-1 text-xs text-white/45">
                    Renew expired adverts at {renewCost} pts and keep track of views, clicks, and days left.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-white/60">
                    {summary.active} active
                  </span>
                  <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-white/60">
                    {summary.expired} expired
                  </span>
                  <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1.5 text-cyan-200">
                    {availablePoints.toFixed(2)} pts
                  </span>
                </div>
              </div>

              {loading ? <div className="py-10 text-center text-sm text-white/45">Loading your adverts...</div> : null}
              {!loading && loadError ? <div className="py-10 text-center text-sm text-red-200">{loadError}</div> : null}
              {!loading && !loadError && items.length === 0 ? (
                <div className="py-10 text-center text-sm text-white/45">You have not posted any adverts yet.</div>
              ) : null}

              {!loading && !loadError && items.length > 0 ? (
                <div className="space-y-3">
                  {items.map((item) => {
                    const remaining = daysRemaining(item.advertExpiresAt, item.createdAt);
                    const expired = remaining <= 0;
                    const views = Number(item.views ?? 0);
                    const clicks = Number(item.advertClicks ?? 0);
                    const ctr = buildCtr(clicks, views);

                    return (
                      <div key={item.id} className="overflow-hidden rounded-[22px] border border-white/10 bg-black/15">
                        <div className="flex flex-col gap-3 px-3 py-3 sm:flex-row sm:items-center sm:justify-between">
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="truncate text-sm font-semibold text-white">
                                {item.advertTitle || "Untitled advert"}
                              </p>
                              <span
                                className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${
                                  expired
                                    ? "border border-red-400/20 bg-red-500/10 text-red-200"
                                    : "border border-emerald-400/20 bg-emerald-500/10 text-emerald-200"
                                }`}
                              >
                                {expired ? "Expired" : `${remaining} day${remaining === 1 ? "" : "s"} left`}
                              </span>
                            </div>
                            <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] text-white/45">
                              <span>{views} views</span>
                              <span>{clicks} clicks</span>
                              <span>{ctr} CTR</span>
                              <span>Expires {getExpiryDateLabel(item.advertExpiresAt, item.createdAt)}</span>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setInfoOpenId((current) => (current === item.id ? null : item.id))}
                              className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[11px] text-white/70 transition-colors hover:text-white"
                            >
                              Info
                            </button>
                            <button
                              type="button"
                              onClick={() => (editingId === item.id ? setEditingId(null) : startEdit(item))}
                              className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[11px] text-white/70 transition-colors hover:text-white"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => void renewAdvert(item.id)}
                              disabled={!expired || actionId === item.id}
                              className={`rounded-full px-3 py-1.5 text-[11px] transition-colors ${
                                expired
                                  ? "border border-cyan-400/20 bg-cyan-400/10 text-cyan-200 hover:bg-cyan-400/15"
                                  : "border border-white/10 bg-white/[0.03] text-white/35"
                              } disabled:cursor-not-allowed disabled:opacity-70`}
                            >
                              {actionId === item.id ? "Renewing..." : "Renew"}
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteTargetId(item.id)}
                              disabled={actionId === item.id}
                              className="rounded-full border border-red-400/20 bg-red-500/10 px-3 py-1.5 text-[11px] text-red-200 transition-colors hover:bg-red-500/15 disabled:opacity-60"
                            >
                              Delete
                            </button>
                          </div>
                        </div>

                        {infoOpenId === item.id ? (
                          <div className="border-t border-white/8 bg-white/[0.02] px-3 py-3 text-sm text-white/65">
                            <div className="grid gap-3 sm:grid-cols-2">
                              <div>
                                <p className="text-[11px] uppercase tracking-[0.16em] text-white/38">Advert URL</p>
                                {item.advertUrl ? (
                                  <a
                                    href={item.advertUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="mt-1 block break-words text-cyan-300 hover:text-cyan-200"
                                  >
                                    {item.advertUrl}
                                  </a>
                                ) : (
                                  <p className="mt-1 text-white/45">No destination URL</p>
                                )}
                              </div>
                              <div>
                                <p className="text-[11px] uppercase tracking-[0.16em] text-white/38">Metrics</p>
                                <div className="mt-1 space-y-1 text-white/58">
                                  <p>{views} views</p>
                                  <p>{clicks} clicks</p>
                                  <p>{ctr} click rate</p>
                                </div>
                              </div>
                              <div>
                                <p className="text-[11px] uppercase tracking-[0.16em] text-white/38">Timeline</p>
                                <div className="mt-1 space-y-1 text-white/58">
                                  <p>Posted {formatDate(item.createdAt)}</p>
                                  <p>Updated {formatDate(item.updatedAt)}</p>
                                  <p>Expires {getExpiryDateLabel(item.advertExpiresAt, item.createdAt)}</p>
                                </div>
                              </div>
                              <div>
                                <p className="text-[11px] uppercase tracking-[0.16em] text-white/38">Advert details</p>
                                <p className="mt-1 leading-relaxed text-white/58">
                                  {item.postDescription?.trim() || "No advert description added."}
                                </p>
                                <div className="mt-3">
                                  <Link
                                    href={`/posts/${item.slug || item.id}/${item.id}`}
                                    className="text-xs text-cyan-300 hover:text-cyan-200"
                                  >
                                    Open advert page
                                  </Link>
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : null}

                        {editingId === item.id ? (
                          <div className="border-t border-white/8 bg-white/[0.02] px-3 py-3">
                            <div className="grid gap-3">
                              <input
                                value={editTitle}
                                onChange={(event) => setEditTitle(event.target.value)}
                                placeholder="Advert title"
                                className="sage-input w-full rounded-2xl py-2.5 text-sm"
                              />
                              <textarea
                                value={editDescription}
                                onChange={(event) => setEditDescription(event.target.value)}
                                placeholder="Advert description"
                                className="sage-input min-h-[96px] w-full resize-none rounded-2xl py-2.5 text-sm"
                              />
                              <input
                                type="url"
                                value={editUrl}
                                onChange={(event) => setEditUrl(event.target.value)}
                                placeholder="https://your-link.com"
                                className="sage-input w-full rounded-2xl py-2.5 text-sm"
                              />
                              <div className="flex flex-wrap items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => void saveEdit(item.id)}
                                  disabled={actionId === item.id}
                                  className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-xs font-medium text-cyan-200 transition-colors hover:bg-cyan-400/15 disabled:opacity-60"
                                >
                                  {actionId === item.id ? "Saving..." : "Save changes"}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditingId(null)}
                                  className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-xs text-white/65 transition-colors hover:text-white"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              ) : null}

              {canLoadMore ? (
                <div className="pt-3 text-center">
                  <button
                    type="button"
                    onClick={() => void fetchManage(true)}
                    disabled={loadingMore}
                    className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-white/70 transition-colors hover:text-white disabled:opacity-50"
                  >
                    {loadingMore ? "Loading more adverts..." : "Load more adverts"}
                  </button>
                </div>
              ) : null}
            </section>
          ) : (
            <PostFeed postType="advert" currentUserId={currentUserId} showComposer={false} />
          )}
        </div>
      ) : (
        <PostFeed postType="advert" currentUserId={null} showComposer={false} />
      )}

      <ConfirmDeleteModal
        open={!!deleteTargetId}
        title="Delete advert?"
        description="This advert will be removed permanently. This action cannot be undone."
        confirmLabel="Delete advert"
        loading={!!(deleteTargetId && actionId === deleteTargetId)}
        onConfirm={() => {
          if (deleteTargetId) void deleteAdvert(deleteTargetId);
        }}
        onClose={() => {
          if (!(deleteTargetId && actionId === deleteTargetId)) {
            setDeleteTargetId(null);
          }
        }}
      />
    </div>
  );
}

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
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-lg font-semibold text-white">{title}</p>
            <p className="mt-2 text-sm leading-relaxed text-white/58">{description}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white/55 transition-colors hover:bg-white/[0.07] hover:text-white"
            aria-label="Close delete dialog"
          >
            <i className="fas fa-times text-sm" />
          </button>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white/68 transition-colors hover:bg-white/[0.07] hover:text-white"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/14 px-4 py-2 text-sm font-medium text-red-100 transition-colors hover:bg-red-500/20 disabled:opacity-60"
          >
            {loading ? <i className="fas fa-spinner fa-spin" /> : <i className="fas fa-trash-alt" />}
            <span>{confirmLabel}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
