"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { timeAgo } from "@/lib/utils";
import { useToast } from "@/components/ui/ToastProvider";

interface Notification {
  id: string;
  type: string;
  content: string;
  postId?: string | null;
  seen: boolean;
  createdAt: string;
  actorId?: string | null;
  actorUsername?: string | null;
  actorPicture?: string | null;
}

const typeIcons: Record<string, { icon: string; color: string }> = {
  like: { icon: "fas fa-thumbs-up", color: "text-cyan-400" },
  comment: { icon: "fas fa-comment", color: "text-green-400" },
  follow: { icon: "fas fa-user-plus", color: "text-blue-400" },
  message: { icon: "fas fa-envelope", color: "text-purple-400" },
  system: { icon: "fas fa-bell", color: "text-yellow-400" },
};

export default function NotificationsClient() {
  const { showToast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingAllRead, setMarkingAllRead] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    void initialLoad();
  }, []);

  const getNotificationLink = (notif: Notification) => {
    if (notif.type === "message" && notif.actorId) return `/messages?user=${notif.actorId}`;
    if (notif.type === "follow" && notif.actorId) return `/profile/${notif.actorId}`;
    if (notif.postId) return `/?postId=${notif.postId}`;
    if (notif.actorId) return `/profile/${notif.actorId}`;
    return null;
  };

  const loadNotifications = async (append = false) => {
    const offset = append ? notifications.length : 0;
    if (append) setLoadingMore(true);
    else setLoading(true);

    const res = await fetch(`/api/notifications?offset=${offset}&limit=20`);
    if (res.ok) {
      const data = await res.json();
      const incoming = (data.notifications ?? []) as Notification[];
      setNotifications((current) => {
        if (!append) return incoming;
        const existingIds = new Set(current.map((item) => item.id));
        return [...current, ...incoming.filter((item) => !existingIds.has(item.id))];
      });
      setHasMore(!!data.hasMore);
      setTotalCount(Number(data.totalCount ?? 0));
    } else {
      showToast({ type: "error", message: "Unable to load notifications." });
    }

    if (append) setLoadingMore(false);
    else setLoading(false);
  };

  const markAllAsRead = async (silent = false) => {
    setMarkingAllRead(true);
    const res = await fetch("/api/notifications/read", { method: "PUT" });
    if (res.ok) {
      setNotifications((current) => current.map((item) => ({ ...item, seen: true })));
      if (!silent) {
        showToast({ type: "success", message: "Notifications marked as read." });
      }
    } else if (!silent) {
      showToast({ type: "error", message: "Unable to mark notifications as read." });
    }
    setMarkingAllRead(false);
  };

  const initialLoad = async () => {
    await loadNotifications(false);
    await markAllAsRead(true);
  };

  const deleteNotif = async (id: string) => {
    setDeletingId(id);
    const res = await fetch(`/api/notifications/${id}`, { method: "DELETE" });
    if (res.ok) {
      setNotifications((current) => current.filter((item) => item.id !== id));
      setTotalCount((current) => Math.max(0, current - 1));
      showToast({ type: "success", message: "Notification deleted." });
    } else {
      showToast({ type: "error", message: "Unable to delete notification." });
    }
    setDeletingId(null);
  };

  if (loading) {
    return (
      <div className="py-12 text-center">
        <div className="modern-list-loader mx-auto" aria-hidden="true">
          <div className="modern-list-loader__core" />
        </div>
        <p className="loading-text mt-2">Loading notifications...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-white">Notifications</h1>
          {totalCount > 0 ? (
            <p className="mt-1 text-xs text-white/45">
              {totalCount.toLocaleString()} notification{totalCount === 1 ? "" : "s"}
            </p>
          ) : null}
        </div>
        {notifications.length > 0 ? (
          <button
            type="button"
            onClick={() => void markAllAsRead(false)}
            disabled={markingAllRead}
            className="text-xs text-cyan-400 hover:text-cyan-300 disabled:opacity-60"
          >
            {markingAllRead ? (
              <>
                <i className="fas fa-spinner fa-spin mr-1" />
                Marking...
              </>
            ) : (
              "Mark all read"
            )}
          </button>
        ) : null}
      </div>

      {notifications.length === 0 ? (
        <div className="py-16 text-center">
          <i className="fas fa-bell-slash mb-3 text-4xl text-white/20" />
          <p className="text-sm text-white/40">No notifications yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((notif) => {
            const { icon, color } = typeIcons[notif.type] ?? typeIcons.system;
            const destination = getNotificationLink(notif);
            return (
              <div
                key={notif.id}
                className={`sage-card flex items-start gap-3 fade-in ${
                  !notif.seen ? "border-cyan-800/40 bg-cyan-900/10" : ""
                }`}
              >
                {notif.actorId ? (
                  <Link href={`/profile/${notif.actorId}`}>
                    <Image
                      src={notif.actorPicture || "/files/default-avatar.svg"}
                      alt={notif.actorUsername ?? "user"}
                      width={36}
                      height={36}
                      className="h-9 w-9 rounded-full border border-white/20 object-cover"
                    />
                  </Link>
                ) : (
                  <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-white/5 ${color}`}>
                    <i className={icon} />
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  {destination ? (
                    <Link href={destination} className="text-sm text-white transition-colors hover:text-cyan-300">
                      {notif.content}
                    </Link>
                  ) : (
                    <p className="text-sm text-white">{notif.content}</p>
                  )}
                  <p className="mt-0.5 text-xs text-white/40">{timeAgo(notif.createdAt)}</p>
                  {destination ? (
                    <Link href={destination} className="mt-1 inline-block text-xs text-cyan-400 hover:text-cyan-300">
                      {notif.type === "message"
                        ? "Open chat ->"
                        : notif.type === "follow"
                          ? "View profile ->"
                          : "View item ->"}
                    </Link>
                  ) : null}
                </div>

                <div className="flex flex-shrink-0 items-center gap-1">
                  {!notif.seen ? <span className="h-2 w-2 rounded-full bg-cyan-400" /> : null}
                  <button
                    type="button"
                    onClick={() => void deleteNotif(notif.id)}
                    disabled={deletingId === notif.id}
                    className="p-1 text-xs text-white/20 transition-colors hover:text-red-400 disabled:opacity-60"
                  >
                    {deletingId === notif.id ? <i className="fas fa-spinner fa-spin" /> : <i className="fas fa-times" />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {hasMore ? (
        <div className="pt-4 text-center">
          <button
            type="button"
            onClick={() => void loadNotifications(true)}
            disabled={loadingMore}
            className="text-sm font-medium text-cyan-400 hover:text-cyan-300 disabled:opacity-60"
          >
            {loadingMore ? (
              <>
                <i className="fas fa-spinner fa-spin mr-1" />
                Loading more...
              </>
            ) : (
              "Load more notifications"
            )}
          </button>
        </div>
      ) : null}
    </div>
  );
}
