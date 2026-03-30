"use client";

import { useEffect, useState } from "react";
import { useToast } from "@/components/ui/ToastProvider";
import { ModernLoader } from "@/components/ui/ModernLoader";
import AdminConfirmModal from "../components/AdminConfirmModal";

interface AdminMessage {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  message: string;
  reply?: string | null;
  seen?: boolean | null;
  createdAt: string;
}

export default function AdminMessagesClient() {
  const { showToast } = useToast();
  const [messages, setMessages] = useState<AdminMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminMessage | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/messages").then((r) => r.json()).then((d) => {
      setMessages(d.messages ?? []);
      setLoading(false);
    });
  }, []);

  const markSeen = async (id: string) => {
    await fetch(`/api/admin/messages/${id}/seen`, { method: "PATCH" });
    setMessages((current) => current.map((message) => (message.id === id ? { ...message, seen: true } : message)));
  };

  const sendReply = async (id: string) => {
    const reply = replyDrafts[id]?.trim();
    if (!reply) {
      showToast({ type: "error", message: "Please write a reply first." });
      return;
    }

    setSendingId(id);
    const res = await fetch(`/api/admin/messages/${id}/reply`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reply }),
    });

    if (res.ok) {
      setMessages((current) => current.map((message) => (message.id === id ? { ...message, reply, seen: true } : message)));
      showToast({ type: "success", message: "Reply saved." });
    } else {
      showToast({ type: "error", message: "Unable to save reply." });
    }
    setSendingId(null);
  };

  const deleteMessage = async () => {
    if (!deleteTarget) return;
    setDeletingId(deleteTarget.id);
    const res = await fetch(`/api/admin/messages/${deleteTarget.id}`, { method: "DELETE" });
    if (res.ok) {
      setMessages((current) => current.filter((message) => message.id !== deleteTarget.id));
      showToast({ type: "success", message: "Message deleted." });
      setDeleteTarget(null);
    } else {
      showToast({ type: "error", message: "Unable to delete message." });
    }
    setDeletingId(null);
  };

  return (
    <div>
      <h1 className="text-xl font-bold text-white mb-4">Messages from users</h1>
      {loading ? <ModernLoader label="Loading messages..." sublabel="Checking user contact inbox" /> : null}

      <div className="space-y-4">
        {messages.map((message) => (
          <div key={message.id} className="sage-card">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-white capitalize">{message.name}</p>
                <p className="text-xs text-white/40">{message.email || message.phone || "No contact details"}</p>
                <p className="text-xs text-white/30 mt-1">{new Date(message.createdAt).toLocaleString()}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                <span className={`text-xs ${message.seen ? "text-white/35" : "text-cyan-400"}`}>
                  {message.seen ? "Seen" : "New"}
                </span>
                {!message.seen && (
                  <button
                    onClick={() => markSeen(message.id)}
                    className="text-xs px-2 py-1 rounded border border-cyan-800/40 text-cyan-400 hover:bg-cyan-900/20"
                  >
                    Mark seen
                  </button>
                )}
                <button
                  onClick={() => setDeleteTarget(message)}
                  className="text-xs px-2 py-1 rounded border border-red-800/40 text-red-300 hover:bg-red-900/20"
                >
                  Delete
                </button>
              </div>
            </div>

            <div className="mt-3 rounded-lg border border-white/10 bg-black/20 px-3 py-3 text-sm text-white/80 whitespace-pre-wrap">
              {message.message}
            </div>

            <div className="mt-3">
              <label className="text-xs text-white/50 uppercase tracking-wider">Reply</label>
              <textarea
                value={replyDrafts[message.id] ?? message.reply ?? ""}
                onChange={(e) => setReplyDrafts((current) => ({ ...current, [message.id]: e.target.value }))}
                className="sage-input mt-1 min-h-28 w-full rounded-lg"
                placeholder="Write your reply here..."
              />
              <div className="mt-2 flex justify-end">
                <button
                  onClick={() => sendReply(message.id)}
                  disabled={sendingId === message.id}
                  className="btn-sage w-full sm:w-auto"
                >
                  {sendingId === message.id ? <><i className="fas fa-spinner fa-spin mr-1" />Saving...</> : "Save reply"}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {!loading && messages.length === 0 && (
        <p className="text-white/40 text-sm text-center py-8">No messages found</p>
      )}

      <AdminConfirmModal
        open={Boolean(deleteTarget)}
        onClose={() => !deletingId && setDeleteTarget(null)}
        onConfirm={() => void deleteMessage()}
        loading={Boolean(deletingId)}
        title="Delete admin message"
        description="Delete this contact message permanently from the admin inbox?"
        confirmLabel="Delete message"
        intent="danger"
      />
    </div>
  );
}
