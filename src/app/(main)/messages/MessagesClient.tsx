"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { timeAgo } from "@/lib/utils";
import { useToast } from "@/components/ui/ToastProvider";

interface CurrentUser {
  id: string;
  username: string;
  picture?: string | null;
}

interface Conversation {
  conversation_partner: string;
  username: string;
  picture: string;
  is_online: boolean;
  content: string;
  created_at: string;
  unread_count: number;
}

interface ChatMessage {
  id: string;
  senderId: string;
  receiverId: string;
  content?: string | null;
  fileUrl?: string | null;
  fileType?: string | null;
  createdAt: string;
}

interface ChatUser {
  id: string;
  username: string;
  picture?: string | null;
  isOnline?: boolean;
}

export default function MessagesClient({ currentUser }: { currentUser: CurrentUser }) {
  const { showToast } = useToast();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatUser, setChatUser] = useState<ChatUser | null>(null);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [inputText, setInputText] = useState("");
  const [searchUser, setSearchUser] = useState("");
  const [searchResults, setSearchResults] = useState<ChatUser[]>([]);
  const [sending, setSending] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ChatMessage | null>(null);
  const [deletingMessageId, setDeletingMessageId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();

  const loadConversations = async () => {
    const res = await fetch("/api/messages");
    if (res.ok) {
      const d = await res.json();
      setConversations(d.conversations ?? []);
    } else {
      showToast({ type: "error", message: "Unable to load conversations." });
    }
  };

  const loadChat = async (userId: string, silent = false) => {
    if (!silent) setChatLoading(true);
    const res = await fetch(`/api/messages/${userId}`);
    if (res.ok) {
      const d = await res.json();
      setChatMessages(d.messages ?? []);
      setChatUser(d.user ?? null);
    } else if (!silent) {
      showToast({ type: "error", message: "Unable to open chat." });
    }
    if (!silent) setChatLoading(false);
  };

  useEffect(() => {
    void loadConversations();
  }, []);

  useEffect(() => {
    const targetUserId = searchParams.get("userId");
    if (targetUserId) {
      setActiveChatId(targetUserId);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!activeChatId) return;
    void loadChat(activeChatId);
    const interval = window.setInterval(() => {
      void loadChat(activeChatId, true);
    }, 5000);
    return () => window.clearInterval(interval);
  }, [activeChatId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const openChat = (userId: string) => {
    setActiveChatId(userId);
    setSearchUser("");
    setSearchResults([]);
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeChatId) return;
    setSending(true);
    const res = await fetch(`/api/messages/${activeChatId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: inputText }),
    });
    if (res.ok) {
      const d = await res.json();
      setChatMessages((m) => [...m, d.message]);
      setInputText("");
      void loadConversations();
    } else {
      showToast({ type: "error", message: "Unable to send message." });
    }
    setSending(false);
  };

  const deleteMessage = async () => {
    if (!deleteTarget) return;
    setDeletingMessageId(deleteTarget.id);
    const res = await fetch(`/api/messages/${deleteTarget.id}`, { method: "DELETE" });
    if (res.ok) {
      setChatMessages((current) => current.filter((message) => message.id !== deleteTarget.id));
      await loadConversations();
      showToast({ type: "success", message: "Message deleted." });
    } else {
      const data = await res.json().catch(() => null);
      showToast({ type: "error", message: data?.error || "Unable to delete message." });
    }
    setDeletingMessageId(null);
    setDeleteTarget(null);
  };

  const searchUsers = async (q: string) => {
    setSearchUser(q);
    if (q.length < 2) {
      setSearchResults([]);
      return;
    }
    const res = await fetch(`/api/users?q=${encodeURIComponent(q)}`);
    if (res.ok) {
      const d = await res.json();
      setSearchResults((d.users ?? []).slice(0, 8));
    } else {
      showToast({ type: "error", message: "Unable to search users." });
    }
  };

  return (
    <>
      <div className="flex h-[calc(100vh-130px)] min-h-[500px]" style={{ background: "#0b141a" }}>
        <div className={`w-full md:w-2/5 flex flex-col ${activeChatId ? "hidden md:flex" : "flex"}`} style={{ borderRight: "1px solid rgba(255,255,255,0.08)" }}>
          <div className="p-3" style={{ background: "#1f2c34", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
            <h2 className="text-base font-bold mb-2" style={{ color: "#e9edef" }}>Messages</h2>
            <input
              type="text"
              value={searchUser}
              onChange={(e) => searchUsers(e.target.value)}
              placeholder="Search people..."
              className="sage-input text-sm rounded-full py-1.5"
            />
            {searchResults.length > 0 && (
              <div className="mt-1 bg-[rgb(22,40,50)] border border-white/10 rounded shadow-lg">
                {searchResults.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => openChat(u.id)}
                    className="flex items-center gap-2 w-full px-3 py-2 hover:bg-white/5 text-left"
                  >
                    <Image src={u.picture || "/files/default-avatar.svg"} alt={u.username} width={28} height={28} className="rounded-full object-cover" />
                    <span className="text-sm text-white capitalize">{u.username}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto" style={{ background: "#111b21" }}>
            {conversations.length === 0 && (
              <p className="text-center text-sm py-8" style={{ color: "rgba(233,237,239,0.4)" }}>No conversations yet</p>
            )}
            {conversations.map((conv) => (
              <button
                key={conv.conversation_partner}
                onClick={() => openChat(conv.conversation_partner)}
                className="flex items-center gap-3 w-full px-3 py-3 text-left transition-colors"
                style={{
                  borderBottom: "1px solid rgba(255,255,255,0.05)",
                  background: activeChatId === conv.conversation_partner ? "#2a3942" : "transparent",
                }}
              >
                <div className="relative">
                  <Image src={conv.picture || "/files/default-avatar.svg"} alt={conv.username} width={40} height={40} className="rounded-full object-cover" />
                  {conv.is_online && <span className="absolute bottom-0 right-0 online-dot w-2.5 h-2.5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <p className="text-sm font-semibold capitalize truncate" style={{ color: "#e9edef" }}>{conv.username}</p>
                    <span className="text-xs ml-1 flex-shrink-0" style={{ color: "rgba(233,237,239,0.4)" }}>{timeAgo(conv.created_at)}</span>
                  </div>
                  <p className="text-xs truncate" style={{ color: "rgba(233,237,239,0.5)" }}>{conv.content ?? "File"}</p>
                </div>
                {conv.unread_count > 0 && <span className="badge-red flex-shrink-0">{conv.unread_count}</span>}
              </button>
            ))}
          </div>
        </div>

        {activeChatId ? (
          <div className="flex-1 flex flex-col" style={{ background: "#0b141a" }}>
            <div className="flex items-center gap-3 px-4 py-3" style={{ background: "#1f2c34" }}>
              <button
                onClick={() => setActiveChatId(null)}
                className="md:hidden mr-1"
                style={{ color: "#00a884" }}
              >
                <i className="fas fa-arrow-left" />
              </button>
              {chatUser && (
                <>
                  <div className="relative">
                    <Image src={chatUser.picture || "/files/default-avatar.svg"} alt={chatUser.username} width={36} height={36} className="rounded-full object-cover" />
                    {chatUser.isOnline && <span className="absolute bottom-0 right-0 online-dot w-2 h-2" />}
                  </div>
                  <div>
                    <p className="text-sm font-semibold capitalize" style={{ color: "#e9edef" }}>{chatUser.username}</p>
                    <p className="text-xs" style={{ color: chatUser.isOnline ? "#00a884" : "rgba(233,237,239,0.5)" }}>
                      {chatUser.isOnline ? "Online" : "Offline"}
                    </p>
                  </div>
                </>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2" style={{ background: "#0b141a" }}>
              {chatLoading ? (
                <div className="flex justify-center py-8">
                  <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70">
                    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent" />
                    Loading messages...
                  </div>
                </div>
              ) : null}
              {!chatLoading && chatMessages.length === 0 ? (
                <p className="py-8 text-center text-sm text-white/40">No messages yet. Say hello.</p>
              ) : null}
              {chatMessages.map((msg) => {
                const isMe = msg.senderId === currentUser.id;
                const deleting = deletingMessageId === msg.id;
                return (
                  <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                    <div className="group relative max-w-[70%]">
                      <div
                        className="px-3 py-2 text-sm rounded-md"
                        style={{
                          background: isMe ? "#005c4b" : "#1f2c34",
                          color: "#e9edef",
                          borderRadius: isMe ? "8px 8px 2px 8px" : "8px 8px 8px 2px",
                        }}
                      >
                        {msg.fileUrl && msg.fileType === "image" && (
                          <Image src={msg.fileUrl} alt="Shared image" width={200} height={150} className="rounded mb-1 object-cover" />
                        )}
                        {msg.content && <p className="break-words pr-7">{msg.content}</p>}
                        <p className="text-xs mt-0.5 text-right" style={{ color: "rgba(233,237,239,0.6)" }}>
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                      {isMe ? (
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(msg)}
                          disabled={deleting}
                          className="absolute right-2 top-2 rounded-full border border-white/10 bg-black/25 px-2 py-1 text-[11px] text-white/65 opacity-0 transition-opacity hover:text-red-300 group-hover:opacity-100 disabled:opacity-60"
                          title="Delete message"
                        >
                          {deleting ? <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-current border-r-transparent" /> : <i className="fas fa-trash" />}
                        </button>
                      ) : null}
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>

            <form onSubmit={sendMessage} className="flex gap-2 p-3" style={{ background: "#1f2c34" }}>
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 rounded-full text-sm py-2 px-4 outline-none border-0"
                style={{ background: "#2a3942", color: "#e9edef" }}
              />
              <button
                type="submit"
                disabled={sending || !inputText.trim()}
                className="rounded-full px-4 py-2 text-sm inline-flex items-center justify-center"
                style={{ background: "#00a884", color: "white" }}
              >
                {sending ? <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent" /> : <i className="fas fa-paper-plane" />}
              </button>
            </form>
          </div>
        ) : (
          <div className="hidden md:flex flex-1 items-center justify-center" style={{ background: "#222e35" }}>
            <div className="text-center">
              <i className="fas fa-comment-dots text-5xl mb-4" style={{ color: "rgba(0,168,132,0.3)" }} />
              <p className="text-sm" style={{ color: "rgba(233,237,239,0.4)" }}>Select a conversation or search for someone</p>
            </div>
          </div>
        )}
      </div>

      {deleteTarget ? (
        <div className="fixed inset-0 z-[90] flex items-center justify-center px-4">
          <button
            type="button"
            onClick={() => !deletingMessageId && setDeleteTarget(null)}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />
          <div className="relative z-[91] w-full max-w-md rounded-3xl border border-white/10 bg-[#06131c] p-5 shadow-[0_30px_80px_rgba(0,0,0,0.45)]">
            <h3 className="text-lg font-semibold text-white">Delete message</h3>
            <p className="mt-2 text-sm leading-6 text-white/70">
              Remove this message from the conversation? This only deletes the message you sent.
            </p>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={Boolean(deletingMessageId)}
                className="rounded-xl border border-white/10 px-4 py-2 text-sm text-white/65 transition-colors hover:bg-white/5 hover:text-white disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void deleteMessage()}
                disabled={Boolean(deletingMessageId)}
                className="inline-flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/15 px-4 py-2 text-sm font-medium text-red-200 transition-colors disabled:opacity-60"
              >
                {deletingMessageId ? <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent" /> : null}
                {deletingMessageId ? "Deleting..." : "Delete message"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
