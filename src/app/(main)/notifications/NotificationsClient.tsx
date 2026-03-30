"use client";

import { useState, useEffect } from "react";
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

  useEffect(() => {
    loadNotifications();
    // Mark all as read
    fetch("/api/notifications/read", { method: "PUT" });
  }, []);

  const loadNotifications = async () => {
    setLoading(true);
    const res = await fetch("/api/notifications");
    if (res.ok) {
      const d = await res.json();
      setNotifications(d.notifications ?? []);
    } else {
      showToast({ type: "error", message: "Unable to load notifications." });
    }
    setLoading(false);
  };

  const deleteNotif = async (id: string) => {
    const res = await fetch(`/api/notifications/${id}`, { method: "DELETE" });
    if (res.ok) {
      setNotifications((n) => n.filter((x) => x.id !== id));
      showToast({ type: "success", message: "Notification deleted." });
    } else {
      showToast({ type: "error", message: "Unable to delete notification." });
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="modern-list-loader mx-auto" aria-hidden="true">
          <div className="modern-list-loader__core" />
        </div>
        <p className="loading-text mt-2">Loading notifications...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-bold text-white">Notifications</h1>
        {notifications.length > 0 && (
          <button
            onClick={async () => {
              const res = await fetch("/api/notifications/read", { method: "PUT" });
              showToast({
                type: res.ok ? "success" : "error",
                message: res.ok ? "Notifications marked as read." : "Unable to mark notifications as read.",
              });
            }}
            className="text-xs text-cyan-400 hover:text-cyan-300"
          >
            Mark all read
          </button>
        )}
      </div>

      {notifications.length === 0 && (
        <div className="text-center py-16">
          <i className="fas fa-bell-slash text-4xl text-white/20 mb-3" />
          <p className="text-white/40 text-sm">No notifications yet</p>
        </div>
      )}

      <div className="space-y-2">
        {notifications.map((notif) => {
          const { icon, color } = typeIcons[notif.type] ?? typeIcons.system;
          return (
            <div
              key={notif.id}
              className={`sage-card flex items-start gap-3 fade-in ${!notif.seen ? "border-cyan-800/40 bg-cyan-900/10" : ""}`}
            >
              {notif.actorId ? (
                <Link href={`/profile/${notif.actorId}`}>
                  <Image
                    src={notif.actorPicture || "/files/default-avatar.svg"}
                    alt={notif.actorUsername ?? "user"}
                    width={36}
                    height={36}
                    className="rounded-full object-cover border border-white/20 flex-shrink-0"
                  />
                </Link>
              ) : (
                <div className={`w-9 h-9 rounded-full flex items-center justify-center bg-white/5 flex-shrink-0 ${color}`}>
                  <i className={icon} />
                </div>
              )}

              <div className="flex-1 min-w-0">
                <p className="text-sm text-white">{notif.content}</p>
                <p className="text-xs text-white/40 mt-0.5">{timeAgo(notif.createdAt)}</p>
                {notif.postId && (
                  <Link
                    href={`/?postId=${notif.postId}`}
                    className="text-xs text-cyan-400 hover:text-cyan-300 mt-1 inline-block"
                  >
                    View post →
                  </Link>
                )}
              </div>

              <div className="flex items-center gap-1 flex-shrink-0">
                {!notif.seen && (
                  <span className="w-2 h-2 rounded-full bg-cyan-400" />
                )}
                <button
                  onClick={() => deleteNotif(notif.id)}
                  className="text-white/20 hover:text-red-400 text-xs p-1 transition-colors"
                >
                  <i className="fas fa-times" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
