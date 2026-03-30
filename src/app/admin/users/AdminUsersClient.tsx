"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useToast } from "@/components/ui/ToastProvider";
import AdminModal from "../components/AdminModal";
import AdminConfirmModal from "../components/AdminConfirmModal";
import { ModernLoader } from "@/components/ui/ModernLoader";

interface AdminUser {
  id: string;
  username: string;
  email: string;
  picture?: string | null;
  bio?: string | null;
  points?: string | null;
  awards?: number | null;
  level?: string | null;
  isOnline?: boolean | null;
  lastSeen?: string | null;
  isMonetised?: boolean | null;
  createdAt: string;
}

interface UserDetails extends AdminUser {
  adsUrl?: string | null;
  adsFreq?: string | null;
  postsCount: number;
}

const levelOptions = ["amateur", "intermediate", "expert", "master", "professor"] as const;

export default function AdminUsersClient() {
  const { showToast } = useToast();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [endNoticeVisible, setEndNoticeVisible] = useState(false);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserDetails | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<UserDetails | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [purgeDays, setPurgeDays] = useState("50");
  const [previewingPurge, setPreviewingPurge] = useState(false);
  const [pendingPurge, setPendingPurge] = useState<{ days: number; count: number } | null>(null);
  const [purging, setPurging] = useState(false);

  const [form, setForm] = useState({
    username: "",
    email: "",
    bio: "",
    points: "0",
    awards: "0",
    level: "amateur",
    isMonetised: false,
  });
  const canSearch = search.trim().length > 1;

  const loadUsers = async (offset = 0, mode: "replace" | "append" = "replace", searchTerm = query) => {
    if (mode === "replace") setLoading(true);
    if (mode === "append") setLoadingMore(true);
    if (mode === "replace" && searchTerm.trim().length > 1) setSearching(true);
    const params = new URLSearchParams({ offset: String(offset) });
    if (searchTerm.trim()) params.set("q", searchTerm.trim());
    const res = await fetch(`/api/admin/users?${params.toString()}`);
    const data = await res.json().catch(() => ({ users: [] }));
    const nextUsers = data.users ?? [];
    setUsers((current) => (mode === "append" ? [...current, ...nextUsers] : nextUsers));
    setHasMore(nextUsers.length === 30);
    if (mode === "append" && nextUsers.length < 30) {
      setEndNoticeVisible(true);
      setTimeout(() => setEndNoticeVisible(false), 1800);
    }
    if (mode === "replace") setLoading(false);
    if (mode === "append") setLoadingMore(false);
    if (mode === "replace") setSearching(false);
  };

  useEffect(() => {
    void loadUsers();
  }, []);

  const syncLocalUser = (nextUser: UserDetails) => {
    setUsers((current) =>
      current.map((user) =>
        user.id === nextUser.id
          ? {
              ...user,
              username: nextUser.username,
              email: nextUser.email,
              bio: nextUser.bio,
              points: nextUser.points,
              awards: nextUser.awards,
              level: nextUser.level,
              isOnline: nextUser.isOnline,
              lastSeen: nextUser.lastSeen,
              isMonetised: nextUser.isMonetised,
              picture: nextUser.picture,
            }
          : user
      )
    );
  };

  const openUser = async (id: string) => {
    setDetailsOpen(true);
    setDetailsLoading(true);
    const res = await fetch(`/api/admin/users/${id}`);
    if (!res.ok) {
      setDetailsLoading(false);
      setDetailsOpen(false);
      showToast({ type: "error", message: "Unable to load that user." });
      return;
    }
    const data = await res.json();
    const user = data.user as UserDetails;
    setSelectedUser(user);
    setForm({
      username: user.username ?? "",
      email: user.email ?? "",
      bio: user.bio ?? "",
      points: String(user.points ?? "0"),
      awards: String(user.awards ?? 0),
      level: (user.level ?? "amateur").toLowerCase(),
      isMonetised: Boolean(user.isMonetised),
    });
    setDetailsLoading(false);
  };

  const saveUser = async () => {
    if (!selectedUser) return;
    setSaving(true);
    const res = await fetch(`/api/admin/users/${selectedUser.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: form.username.trim(),
        email: form.email.trim(),
        bio: form.bio.trim(),
        points: form.points,
        awards: Number(form.awards),
        level: form.level,
        isMonetised: form.isMonetised,
      }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      showToast({ type: "error", message: data?.error || "Unable to save user changes." });
      setSaving(false);
      return;
    }

    const nextUser: UserDetails = {
      ...selectedUser,
      username: form.username.trim(),
      email: form.email.trim(),
      bio: form.bio.trim() || null,
      points: form.points,
      awards: Number(form.awards),
      level: form.level,
      isMonetised: form.isMonetised,
    };
    setSelectedUser(nextUser);
    syncLocalUser(nextUser);
    showToast({ type: "success", message: "User updated successfully." });
    setSaving(false);
  };

  const deleteUser = async () => {
    if (!confirmDelete) return;
    setDeleting(true);
    const res = await fetch(`/api/admin/users/${confirmDelete.id}`, { method: "DELETE" });
    if (!res.ok) {
      showToast({ type: "error", message: "Unable to delete user." });
      setDeleting(false);
      return;
    }
    setUsers((current) => current.filter((user) => user.id !== confirmDelete.id));
    if (selectedUser?.id === confirmDelete.id) {
      setSelectedUser(null);
      setDetailsOpen(false);
    }
    showToast({ type: "success", message: "User deleted." });
    setConfirmDelete(null);
    setDeleting(false);
  };

  const previewInactivePurge = async () => {
    const days = Number(purgeDays);
    if (!Number.isInteger(days) || days < 1) {
      showToast({ type: "error", message: "Enter a valid inactivity period in days." });
      return;
    }
    setPreviewingPurge(true);
    const res = await fetch(`/api/admin/users/inactive/preview?days=${days}`);
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      showToast({ type: "error", message: data?.error || "Unable to preview inactive users." });
      setPreviewingPurge(false);
      return;
    }
    const count = Number(data?.count ?? 0);
    if (count === 0) {
      showToast({ type: "error", message: `No inactive users found beyond ${days} days.` });
      setPreviewingPurge(false);
      return;
    }
    setPendingPurge({ days, count });
    setPreviewingPurge(false);
  };

  const purgeInactiveUsers = async () => {
    if (!pendingPurge) return;
    setPurging(true);
    const res = await fetch(`/api/admin/users/inactive?days=${pendingPurge.days}`, { method: "DELETE" });
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      showToast({ type: "error", message: data?.error || "Unable to purge inactive users." });
      setPurging(false);
      return;
    }
    await loadUsers(0, "replace");
    setPendingPurge(null);
    setPurging(false);
    showToast({ type: "success", message: `Purged ${data?.deletedCount ?? 0} inactive users.` });
  };

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Manage Users</h1>
          <p className="mt-1 text-sm text-white/40">Search, edit, delete, or purge inactive accounts safely.</p>
        </div>
        <div className="flex items-stretch gap-2 lg:max-w-sm">
          <input
            type="number"
            min="1"
            value={purgeDays}
            onChange={(e) => setPurgeDays(e.target.value)}
            className="w-[35%] min-w-[90px] rounded-xl border border-white/10 bg-black/20 px-3 py-2.5 text-sm text-white outline-none focus:border-red-500/40"
            placeholder="Days"
          />
          <button
            type="button"
            onClick={() => void previewInactivePurge()}
            disabled={previewingPurge}
            className="rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-2.5 text-sm font-medium text-red-200 transition-colors hover:bg-red-500/15 disabled:opacity-60"
          >
            {previewingPurge ? (
              <span className="inline-flex items-center gap-2"><span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent" />Checking...</span>
            ) : (
              "Purge inactive"
            )}
          </button>
        </div>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          const nextQuery = search.trim();
          if (nextQuery.length <= 1) return;
          setQuery(nextQuery);
          void loadUsers(0, "replace", nextQuery);
        }}
        className="mb-4 flex items-stretch gap-2"
      >
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search users by username, email, or points..."
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
          Searching users...
        </div>
      ) : null}
      {loading ? <ModernLoader label="Loading users..." sublabel="Fetching admin user list" /> : null}

      <div className="space-y-2">
        {users.map((user) => (
          <div key={user.id} className="sage-card flex items-start gap-3">
            <button type="button" onClick={() => openUser(user.id)} className="flex min-w-0 flex-1 items-center gap-3 text-left">
              <Image
                src={user.picture || "/files/default-avatar.svg"}
                alt={user.username}
                width={44}
                height={44}
                className="h-11 w-11 rounded-full border border-white/20 object-cover flex-shrink-0"
              />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-semibold capitalize text-white">{user.username}</p>
                  {user.isOnline ? <span className="text-[11px] text-emerald-400">Online</span> : null}
                  {user.isMonetised ? <span className="text-[11px] text-green-400">Monetised</span> : null}
                </div>
                <p className="truncate text-xs text-white/40">{user.email}</p>
                <div className="mt-0.5 flex flex-wrap items-center gap-2">
                  <span className={`text-xs level-${user.level?.toLowerCase() ?? "amateur"}`}>{user.level}</span>
                  <span className="text-xs text-cyan-400">{parseFloat(String(user.points ?? 0)).toFixed(0)} pts</span>
                  <span className="text-xs text-white/30">
                    {user.lastSeen ? `Seen ${new Date(user.lastSeen).toLocaleString()}` : "No recent activity"}
                  </span>
                </div>
              </div>
            </button>
            <div className="flex flex-shrink-0 flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={() => openUser(user.id)}
                className="rounded-lg border border-cyan-800/40 px-2.5 py-2 text-xs text-cyan-400 transition-colors hover:bg-cyan-900/20"
                title="View details"
                aria-label={`View details for ${user.username}`}
              >
                <i className="fas fa-eye" />
              </button>
              <button
                type="button"
                onClick={() => setConfirmDelete((selectedUser?.id === user.id ? selectedUser : { ...user, postsCount: 0 }) as UserDetails)}
                className="rounded-lg border border-red-800/40 px-2.5 py-2 text-xs text-red-400 transition-colors hover:bg-red-900/20"
                title="Delete user"
              >
                <i className="fas fa-trash" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {!loading && users.length === 0 ? <p className="py-8 text-center text-sm text-white/40">No users found</p> : null}

      {!loading && users.length > 0 ? (
        <div className="mt-5 flex justify-center">
          {hasMore ? (
            <button
              type="button"
              onClick={() => void loadUsers(users.length, "append")}
              disabled={loadingMore}
              className="inline-flex min-w-[150px] items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white transition-colors hover:bg-white/[0.07] disabled:cursor-not-allowed disabled:opacity-45"
            >
              {loadingMore ? <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent" /> : null}
              {loadingMore ? "Loading..." : "Load more"}
            </button>
          ) : endNoticeVisible ? (
            <div className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white/70">
              No more users
            </div>
          ) : null}
        </div>
      ) : null}

      <AdminModal
        open={detailsOpen}
        onClose={() => !saving && setDetailsOpen(false)}
        title={selectedUser ? `User: ${selectedUser.username}` : "User details"}
        description="Review account details, monetisation state, and edit the user safely."
      >
        {detailsLoading || !selectedUser ? (
          <div className="flex justify-center py-8">
            <ModernLoader compact label="Loading user details..." sublabel="Pulling account profile" />
          </div>
        ) : (
          <div className="space-y-5">
            <div className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-black/20 p-4 md:flex-row md:items-center">
              <Image
                src={selectedUser.picture || "/files/default-avatar.svg"}
                alt={selectedUser.username}
                width={84}
                height={84}
                className="h-20 w-20 rounded-full border border-white/15 object-cover"
              />
              <div className="grid flex-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <p className="text-xs uppercase tracking-wide text-white/35">Posts</p>
                  <p className="mt-1 text-lg font-semibold text-white">{selectedUser.postsCount}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-white/35">Points</p>
                  <p className="mt-1 text-lg font-semibold text-cyan-400">{parseFloat(String(selectedUser.points ?? 0)).toFixed(0)}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-white/35">Joined</p>
                  <p className="mt-1 text-sm text-white/80">{new Date(selectedUser.createdAt).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-white/35">Last Seen</p>
                  <p className="mt-1 text-sm text-white/80">
                    {selectedUser.lastSeen ? new Date(selectedUser.lastSeen).toLocaleString() : "Unknown"}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm text-white/60">Username</span>
                <input
                  value={form.username}
                  onChange={(e) => setForm((current) => ({ ...current, username: e.target.value }))}
                  className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-500/50"
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm text-white/60">Email</span>
                <input
                  value={form.email}
                  onChange={(e) => setForm((current) => ({ ...current, email: e.target.value }))}
                  className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-500/50"
                />
              </label>
              <label className="space-y-2 md:col-span-2">
                <span className="text-sm text-white/60">Bio</span>
                <textarea
                  value={form.bio}
                  onChange={(e) => setForm((current) => ({ ...current, bio: e.target.value }))}
                  rows={4}
                  className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-500/50"
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm text-white/60">Points</span>
                <input
                  type="number"
                  value={form.points}
                  onChange={(e) => setForm((current) => ({ ...current, points: e.target.value }))}
                  className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-500/50"
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm text-white/60">Awards</span>
                <input
                  type="number"
                  value={form.awards}
                  onChange={(e) => setForm((current) => ({ ...current, awards: e.target.value }))}
                  className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-500/50"
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm text-white/60">Level</span>
                <select
                  value={form.level}
                  onChange={(e) => setForm((current) => ({ ...current, level: e.target.value }))}
                  className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-500/50"
                >
                  {levelOptions.map((level) => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/20 px-3 py-3 text-sm text-white/80">
                <input
                  type="checkbox"
                  checked={form.isMonetised}
                  onChange={(e) => setForm((current) => ({ ...current, isMonetised: e.target.checked }))}
                />
                Monetised account
              </label>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-white/70">
              <div className="grid gap-2 md:grid-cols-2">
                <p>
                  <span className="text-white/40">Online:</span> {selectedUser.isOnline ? "Yes" : "No"}
                </p>
                <p>
                  <span className="text-white/40">Ads frequency:</span> {selectedUser.adsFreq || "Not set"}
                </p>
                <p className="md:col-span-2 break-all">
                  <span className="text-white/40">Ads URL:</span> {selectedUser.adsUrl || "Not set"}
                </p>
              </div>
            </div>

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={() => setConfirmDelete(selectedUser)}
                className="rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-2 text-sm text-red-200 transition-colors hover:bg-red-500/15"
              >
                Delete user
              </button>
              <button
                type="button"
                onClick={saveUser}
                disabled={saving}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-cyan-500/25 bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-200 transition-colors hover:bg-cyan-500/15 disabled:opacity-60 sm:w-auto"
              >
                {saving ? <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent" /> : null}
                {saving ? "Saving..." : "Save changes"}
              </button>
            </div>
          </div>
        )}
      </AdminModal>

      <AdminConfirmModal
        open={Boolean(confirmDelete)}
        onClose={() => !deleting && setConfirmDelete(null)}
        onConfirm={deleteUser}
        loading={deleting}
        title="Delete user"
        description={`Delete ${confirmDelete?.username ?? "this user"} and remove their account permanently? This action cannot be undone.`}
        confirmLabel="Delete user"
        intent="danger"
      />

      <AdminConfirmModal
        open={Boolean(pendingPurge)}
        onClose={() => !purging && setPendingPurge(null)}
        onConfirm={purgeInactiveUsers}
        loading={purging}
        title="Purge inactive users"
        description={pendingPurge ? `Delete ${pendingPurge.count} inactive user${pendingPurge.count === 1 ? "" : "s"} who have been inactive for more than ${pendingPurge.days} days? This will permanently remove their accounts and associated data.` : ""}
        confirmLabel="Purge inactive users"
        intent="danger"
      />
    </div>
  );
}
