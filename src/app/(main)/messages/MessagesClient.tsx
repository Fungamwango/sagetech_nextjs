"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { timeAgo } from "@/lib/utils";
import { useToast } from "@/components/ui/ToastProvider";
import { prepareUploadFile } from "@/lib/client/upload";

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

interface PendingAttachment {
  file: File;
  previewUrl?: string | null;
  fileType: "image" | "video" | "audio" | "document";
}

interface ChatUser {
  id: string;
  username: string;
  picture?: string | null;
  isOnline?: boolean;
  lastSeen?: string | null;
}

function presenceLabel(user: { isOnline?: boolean; lastSeen?: string | null } | null) {
  if (!user) return "";
  if (user.isOnline) return "Online";
  if (user.lastSeen) return `Seen ${timeAgo(user.lastSeen)}`;
  return "Offline";
}

function getAttachmentType(file: File): "image" | "video" | "audio" | "document" {
  if (file.type.startsWith("image/")) return "image";
  if (file.type.startsWith("video/")) return "video";
  if (file.type.startsWith("audio/")) return "audio";
  return "document";
}

function getFileLabel(fileUrl: string) {
  try {
    const pathname = new URL(fileUrl).pathname;
    return decodeURIComponent(pathname.split("/").pop() || "Document");
  } catch {
    return "Document";
  }
}

interface MessageStreamPayload {
  type: "message_sent" | "message_deleted" | "messages_read" | "typing_started" | "typing_stopped" | "heartbeat";
  userId: string;
  peerId?: string;
  messageId?: string;
  timestamp: string;
}

export default function MessagesClient({ currentUser }: { currentUser: CurrentUser }) {
  const { showToast } = useToast();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatUser, setChatUser] = useState<ChatUser | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<ChatUser[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [inputText, setInputText] = useState("");
  const [searchUser, setSearchUser] = useState("");
  const [searchResults, setSearchResults] = useState<ChatUser[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [uploadingAttachment, setUploadingAttachment] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [chatLoading, setChatLoading] = useState(false);
  const [typingUserId, setTypingUserId] = useState<string | null>(null);
  const [pendingAttachment, setPendingAttachment] = useState<PendingAttachment | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ChatMessage | null>(null);
  const [deletingMessageId, setDeletingMessageId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<number | null>(null);
  const typingActiveRef = useRef(false);
  const searchParams = useSearchParams();

  const clearPendingAttachment = () => {
    setPendingAttachment((current) => {
      if (current?.previewUrl) {
        URL.revokeObjectURL(current.previewUrl);
      }
      return null;
    });
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

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
      setConversations((current) =>
        current.map((conversation) =>
          conversation.conversation_partner === userId
            ? { ...conversation, unread_count: 0 }
            : conversation
        )
      );
    } else if (!silent) {
      showToast({ type: "error", message: "Unable to open chat." });
    }
    if (!silent) setChatLoading(false);
  };

  useEffect(() => {
    void loadConversations();
    void loadOnlineUsers();
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
  }, [activeChatId]);

  useEffect(() => {
    const stream = new EventSource("/api/messages/stream");

    stream.onmessage = (event) => {
      const payload = JSON.parse(event.data) as MessageStreamPayload;
      if (payload.type === "heartbeat") return;
      if (payload.type === "typing_started" || payload.type === "typing_stopped") {
        if (payload.userId === activeChatId && payload.peerId === currentUser.id) {
          setTypingUserId(payload.type === "typing_started" ? payload.userId : null);
        }
        return;
      }

      void loadConversations();
      void loadOnlineUsers();

      if (!activeChatId) return;
      const affectsActiveChat =
        payload.userId === activeChatId ||
        payload.peerId === activeChatId ||
        (payload.type === "messages_read" && payload.peerId === currentUser.id && payload.userId === activeChatId);

      if (affectsActiveChat) {
        void loadChat(activeChatId, true);
      }
    };

    stream.onerror = () => {
      // EventSource reconnects automatically; keep the current UI stable.
    };

    return () => {
      stream.close();
    };
  }, [activeChatId, currentUser.id]);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        window.clearTimeout(typingTimeoutRef.current);
      }
      if (typingActiveRef.current && activeChatId) {
        void sendTypingState(false, activeChatId);
      }
    };
  }, [activeChatId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  useEffect(() => {
    return () => {
      if (pendingAttachment?.previewUrl) {
        URL.revokeObjectURL(pendingAttachment.previewUrl);
      }
    };
  }, [pendingAttachment]);

  const openChat = (userId: string) => {
    setActiveChatId(userId);
    setSearchUser("");
    setSearchResults([]);
    setTypingUserId(null);
    setConversations((current) =>
      current.map((conversation) =>
        conversation.conversation_partner === userId
          ? { ...conversation, unread_count: 0 }
          : conversation
      )
    );
  };

  const sendTypingState = async (active: boolean, receiverId: string) => {
    try {
      await fetch("/api/messages/typing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receiverId, active }),
      });
    } catch {}
  };

  const handleAttachmentChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const rawFile = event.target.files?.[0];
    if (!rawFile) return;

    try {
      const prepared = await prepareUploadFile(rawFile);
      if (prepared.notice) {
        showToast({ type: "success", message: prepared.notice });
      }

      const file = prepared.file;
      const attachmentType = getAttachmentType(file);
      const previewUrl = attachmentType === "image" || attachmentType === "video" ? URL.createObjectURL(file) : null;

      setPendingAttachment((current) => {
        if (current?.previewUrl) {
          URL.revokeObjectURL(current.previewUrl);
        }
        return { file, previewUrl, fileType: attachmentType };
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to prepare attachment.";
      showToast({ type: "error", message });
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const loadOnlineUsers = async () => {
    const res = await fetch("/api/users");
    if (!res.ok) return;
    const d = await res.json();
    setOnlineUsers(((d.users ?? []) as ChatUser[]).filter((user) => user.isOnline).slice(0, 12));
  };

  const uploadAttachment = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const result = await new Promise<{ fileUrl: string }>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", "/api/upload/file");
      xhr.responseType = "json";

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          setUploadProgress(Math.round((event.loaded / event.total) * 100));
        }
      };

      xhr.onload = () => {
        const data = xhr.response;
        if (xhr.status >= 200 && xhr.status < 300 && data?.fileUrl) {
          resolve({ fileUrl: data.fileUrl });
          return;
        }
        reject(new Error(data?.error || "Attachment upload failed."));
      };

      xhr.onerror = () => reject(new Error("Attachment upload failed."));
      xhr.send(formData);
    });

    return result;
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!inputText.trim() && !pendingAttachment) || !activeChatId) return;
    setSending(true);
    try {
      let fileUrl: string | undefined;
      let fileType: "image" | "video" | "audio" | "document" | "none" = "none";

      if (pendingAttachment) {
        setUploadingAttachment(true);
        setUploadProgress(0);
        const uploaded = await uploadAttachment(pendingAttachment.file);
        fileUrl = uploaded.fileUrl;
        fileType = pendingAttachment.fileType;
      }

      const res = await fetch(`/api/messages/${activeChatId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: inputText.trim() || undefined,
          fileUrl,
          fileType,
        }),
      });
      if (res.ok) {
        const d = await res.json();
        setChatMessages((m) => [...m, d.message]);
        setInputText("");
        clearPendingAttachment();
        if (typingTimeoutRef.current) {
          window.clearTimeout(typingTimeoutRef.current);
          typingTimeoutRef.current = null;
        }
        if (typingActiveRef.current) {
          typingActiveRef.current = false;
          void sendTypingState(false, activeChatId);
        }
        void loadConversations();
      } else {
        showToast({ type: "error", message: "Unable to send message." });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to send attachment.";
      showToast({ type: "error", message });
    } finally {
      setSending(false);
      setUploadingAttachment(false);
      setUploadProgress(0);
    }
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
      setSearchLoading(false);
      return;
    }
    setSearchLoading(true);
    const res = await fetch(`/api/users?q=${encodeURIComponent(q)}`);
    if (res.ok) {
      const d = await res.json();
      setSearchResults((d.users ?? []).slice(0, 8));
    } else {
      showToast({ type: "error", message: "Unable to search users." });
    }
    setSearchLoading(false);
  };

  const renderAttachment = (msg: ChatMessage) => {
    if (!msg.fileUrl || !msg.fileType || msg.fileType === "none") return null;

    if (msg.fileType === "image") {
      return (
        <Link href={msg.fileUrl} target="_blank" className="mb-1 block">
          <Image src={msg.fileUrl} alt="Shared image" width={260} height={180} className="rounded-xl object-cover" />
        </Link>
      );
    }

    if (msg.fileType === "video") {
      return (
        <video controls className="mb-1 max-h-72 w-full rounded-xl bg-black" preload="metadata">
          <source src={msg.fileUrl} />
        </video>
      );
    }

    if (msg.fileType === "audio") {
      return (
        <div className="mb-1 rounded-xl bg-black/20 p-2">
          <audio controls className="w-full">
            <source src={msg.fileUrl} />
          </audio>
        </div>
      );
    }

    return (
      <Link
        href={msg.fileUrl}
        target="_blank"
        className="mb-1 flex items-center gap-3 rounded-xl border border-white/10 bg-black/15 px-3 py-2 hover:bg-black/25"
      >
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white/85">
          <i className="fas fa-file-alt" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium text-white">{getFileLabel(msg.fileUrl)}</span>
          <span className="text-xs text-white/55">Open document</span>
        </span>
      </Link>
    );
  };

  return (
    <>
      <div className="flex h-[calc(100vh-130px)] min-h-[500px]" style={{ background: "#0b141a" }}>
        <div className={`w-full md:w-2/5 flex flex-col ${activeChatId ? "hidden md:flex" : "flex"}`} style={{ borderRight: "1px solid rgba(255,255,255,0.08)" }}>
          <div className="p-3" style={{ background: "#1f2c34", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
            <h2 className="text-base font-bold mb-2" style={{ color: "#e9edef" }}>Messages</h2>
            <div className="relative">
              <input
                type="text"
                value={searchUser}
                onChange={(e) => searchUsers(e.target.value)}
                placeholder="Search people..."
                className="sage-input rounded-full py-2 pl-4 pr-10 text-sm"
              />
              {searchLoading ? (
                <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-white/35">
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent" />
                </span>
              ) : (
                <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs text-white/25">
                  <i className="fas fa-search" />
                </span>
              )}
            </div>
            {(searchLoading || searchResults.length > 0 || (searchUser.length >= 2 && !searchLoading)) && (
              <div className="mt-2 overflow-hidden rounded-2xl border border-white/10 bg-[rgb(22,40,50)] shadow-lg">
                {searchLoading ? (
                  <div className="px-4 py-3 text-sm text-white/50">
                    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent align-[-2px]" />{" "}
                    Searching people...
                  </div>
                ) : searchResults.length > 0 ? (
                  searchResults.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => openChat(u.id)}
                      className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-white/5"
                    >
                      <div className="relative">
                        <Image src={u.picture || "/files/default-avatar.svg"} alt={u.username} width={30} height={30} className="rounded-full object-cover" />
                        {u.isOnline ? <span className="absolute bottom-0 right-0 online-dot h-2 w-2" /> : null}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm capitalize text-white">{u.username}</div>
                        <div className="text-[11px] text-white/40">{presenceLabel(u)}</div>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-3 text-sm text-white/45">No people found</div>
                )}
              </div>
            )}
            <div className="mt-3">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/35">Online now</p>
                <span className="text-[11px] text-[#00a884]">{onlineUsers.length}</span>
              </div>
              {onlineUsers.length > 0 ? (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {onlineUsers.map((user) => (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => openChat(user.id)}
                      className="flex min-w-[72px] flex-col items-center rounded-2xl border border-white/8 bg-white/5 px-2.5 py-2 text-center transition-colors hover:bg-white/8"
                    >
                      <div className="relative">
                        <Image
                          src={user.picture || "/files/default-avatar.svg"}
                          alt={user.username}
                          width={42}
                          height={42}
                          className="rounded-full object-cover"
                        />
                        <span className="absolute bottom-0 right-0 online-dot h-2.5 w-2.5" />
                      </div>
                      <span className="mt-1.5 line-clamp-1 w-full text-xs font-medium capitalize text-white">
                        {user.username}
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-white/8 bg-white/5 px-3 py-2 text-xs text-white/40">
                  No users online right now
                </div>
              )}
            </div>
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
                <Link href={`/profile/${conv.conversation_partner}`} className="relative flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                  <Image src={conv.picture || "/files/default-avatar.svg"} alt={conv.username} width={40} height={40} className="rounded-full object-cover" />
                  {conv.is_online && <span className="absolute bottom-0 right-0 online-dot w-2.5 h-2.5" />}
                </Link>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <Link
                      href={`/profile/${conv.conversation_partner}`}
                      onClick={(e) => e.stopPropagation()}
                      className="truncate text-sm font-semibold capitalize hover:text-cyan-300"
                      style={{ color: "#e9edef" }}
                    >
                      {conv.username}
                    </Link>
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
                  <Link href={`/profile/${chatUser.id}`} className="relative">
                    <Image src={chatUser.picture || "/files/default-avatar.svg"} alt={chatUser.username} width={36} height={36} className="rounded-full object-cover" />
                    {chatUser.isOnline && <span className="absolute bottom-0 right-0 online-dot w-2 h-2" />}
                  </Link>
                  <Link href={`/profile/${chatUser.id}`} className="min-w-0">
                    <p className="truncate text-sm font-semibold capitalize hover:text-cyan-300" style={{ color: "#e9edef" }}>{chatUser.username}</p>
                    {typingUserId === chatUser.id ? (
                      <p className="text-xs text-[#00a884]">typing...</p>
                    ) : (
                      <p className="text-xs" style={{ color: chatUser.isOnline ? "#00a884" : "rgba(233,237,239,0.5)" }}>
                        {presenceLabel(chatUser)}
                      </p>
                    )}
                  </Link>
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
                        {renderAttachment(msg)}
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

            <form onSubmit={sendMessage} className="space-y-2 p-3" style={{ background: "#1f2c34" }}>
              {pendingAttachment ? (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      {pendingAttachment.fileType === "image" && pendingAttachment.previewUrl ? (
                        <Image src={pendingAttachment.previewUrl} alt={pendingAttachment.file.name} width={160} height={110} className="mb-2 rounded-xl object-cover" />
                      ) : null}
                      {pendingAttachment.fileType === "video" && pendingAttachment.previewUrl ? (
                        <video src={pendingAttachment.previewUrl} className="mb-2 max-h-40 rounded-xl bg-black" />
                      ) : null}
                      <p className="truncate text-sm font-medium text-white">{pendingAttachment.file.name}</p>
                      <p className="text-xs text-white/50">
                        {pendingAttachment.fileType.charAt(0).toUpperCase() + pendingAttachment.fileType.slice(1)} · {(pendingAttachment.file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                      {uploadingAttachment ? (
                        <div className="mt-2">
                          <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                            <div className="h-full rounded-full bg-[#00a884] transition-[width]" style={{ width: `${uploadProgress}%` }} />
                          </div>
                          <p className="mt-1 text-xs text-white/55">Uploading attachment... {uploadProgress}%</p>
                        </div>
                      ) : null}
                    </div>
                    <button
                      type="button"
                      onClick={clearPendingAttachment}
                      disabled={uploadingAttachment || sending}
                      className="rounded-full border border-white/10 px-2.5 py-1 text-xs text-white/60 hover:bg-white/5 hover:text-white disabled:opacity-50"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ) : null}

              <div className="flex gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={(e) => void handleAttachmentChange(e)}
                  accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingAttachment || sending}
                  className="rounded-full px-3 py-2 text-sm inline-flex items-center justify-center border border-white/10 text-white/70 hover:bg-white/5 hover:text-white disabled:opacity-50"
                  title="Attach file"
                >
                  <i className="fas fa-paperclip" />
                </button>
              <input
                type="text"
                value={inputText}
                onChange={(e) => {
                  const nextValue = e.target.value;
                  setInputText(nextValue);

                  if (!activeChatId) return;

                  if (!nextValue.trim()) {
                    if (typingTimeoutRef.current) {
                      window.clearTimeout(typingTimeoutRef.current);
                      typingTimeoutRef.current = null;
                    }
                    if (typingActiveRef.current) {
                      typingActiveRef.current = false;
                      void sendTypingState(false, activeChatId);
                    }
                    return;
                  }

                  if (!typingActiveRef.current) {
                    typingActiveRef.current = true;
                    void sendTypingState(true, activeChatId);
                  }

                  if (typingTimeoutRef.current) {
                    window.clearTimeout(typingTimeoutRef.current);
                  }
                  typingTimeoutRef.current = window.setTimeout(() => {
                    typingActiveRef.current = false;
                    void sendTypingState(false, activeChatId);
                    typingTimeoutRef.current = null;
                  }, 1200);
                }}
                placeholder="Type a message..."
                className="flex-1 rounded-full text-sm py-2 px-4 outline-none border-0"
                style={{ background: "#2a3942", color: "#e9edef" }}
              />
              <button
                type="submit"
                disabled={sending || uploadingAttachment || (!inputText.trim() && !pendingAttachment)}
                className="rounded-full px-4 py-2 text-sm inline-flex items-center justify-center"
                style={{ background: "#00a884", color: "white" }}
              >
                {sending || uploadingAttachment ? <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent" /> : <i className="fas fa-paper-plane" />}
              </button>
              </div>
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
