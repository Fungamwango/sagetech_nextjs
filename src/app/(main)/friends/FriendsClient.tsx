"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useToast } from "@/components/ui/ToastProvider";

interface SageUser {
  id: string;
  username: string;
  picture?: string | null;
  level?: string | null;
  isOnline?: boolean | null;
  points?: string | number | null;
  isFollowing?: boolean;
}

interface FriendsClientProps {
  currentUserId: string | null;
}

type PeopleFilter = "all" | "online" | "following";

const filterOptions: Array<{ id: PeopleFilter; label: string; icon: string }> = [
  { id: "all", label: "All People", icon: "fas fa-users" },
  { id: "online", label: "Online Now", icon: "fas fa-circle" },
  { id: "following", label: "Following", icon: "fas fa-user-check" },
];

function formatPoints(value: string | number | null | undefined) {
  const parsed = Number(value ?? 0);
  if (!Number.isFinite(parsed)) return "0";
  return parsed.toLocaleString(undefined, { maximumFractionDigits: 0 });
}

export default function FriendsClient({ currentUserId }: FriendsClientProps) {
  const { showToast } = useToast();
  const [users, setUsers] = useState<SageUser[]>([]);
  const [following, setFollowing] = useState<Set<string>>(new Set());
  const [searchInput, setSearchInput] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [filter, setFilter] = useState<PeopleFilter>("all");
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [followLoadingId, setFollowLoadingId] = useState<string | null>(null);

  useEffect(() => {
    void loadUsers({ reset: true, q: "", nextFilter: "all" });
  }, []);

  const syncFollowingSet = (nextUsers: SageUser[], reset: boolean) => {
    if (reset) {
      setFollowing(new Set(nextUsers.filter((user) => !!user.isFollowing).map((user) => user.id)));
      return;
    }

    setFollowing((prev) => {
      const next = new Set(prev);
      for (const user of nextUsers) {
        if (user.isFollowing) next.add(user.id);
      }
      return next;
    });
  };

  const loadUsers = async ({
    reset,
    q = appliedSearch,
    nextFilter = filter,
  }: {
    reset: boolean;
    q?: string;
    nextFilter?: PeopleFilter;
  }) => {
    const nextOffset = reset ? 0 : users.length;
    if (reset) setLoading(true);
    else setLoadingMore(true);

    try {
      const params = new URLSearchParams();
      if (q.trim()) params.set("q", q.trim());
      if (nextOffset > 0) params.set("offset", String(nextOffset));
      if (nextFilter !== "all") params.set("filter", nextFilter);

      const url = params.toString() ? `/api/users?${params.toString()}` : "/api/users";
      const res = await fetch(url);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Unable to load users.");
      }

      const nextUsers = (data.users ?? []) as SageUser[];
      setHasMore(Boolean(data.hasMore));
      setUsers((prev) => (reset ? nextUsers : [...prev, ...nextUsers.filter((user) => !prev.some((existing) => existing.id === user.id))]));
      syncFollowingSet(nextUsers, reset);
    } catch (error) {
      showToast({
        type: "error",
        message: error instanceof Error ? error.message : "Unable to load users.",
      });
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleSearch = async (event: React.FormEvent) => {
    event.preventDefault();
    const nextQuery = searchInput.trim();
    setAppliedSearch(nextQuery);
    await loadUsers({ reset: true, q: nextQuery });
  };

  const handleFilterChange = async (nextFilter: PeopleFilter) => {
    setFilter(nextFilter);
    await loadUsers({ reset: true, q: appliedSearch, nextFilter });
  };

  const handleFollow = async (userId: string) => {
    setFollowLoadingId(userId);
    try {
      const res = await fetch(`/api/users/${userId}/follow`, { method: "POST" });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Unable to update follow status.");
      }

      setFollowing((prev) => {
        const next = new Set(prev);
        if (data.following) next.add(userId);
        else next.delete(userId);
        return next;
      });

      setUsers((prev) =>
        prev.map((user) => (user.id === userId ? { ...user, isFollowing: Boolean(data.following) } : user))
      );

      showToast({
        type: "success",
        message: data.following ? "User followed." : "User unfollowed.",
      });
    } catch (error) {
      showToast({
        type: "error",
        message: error instanceof Error ? error.message : "Unable to update follow status.",
      });
    } finally {
      setFollowLoadingId(null);
    }
  };

  return (
    <div className="space-y-5">
      <section className="rounded-[26px] border border-white/10 bg-[linear-gradient(180deg,rgba(8,21,32,0.96),rgba(4,13,20,0.94))] p-4 shadow-[0_22px_70px_rgba(0,0,0,0.24)] sm:p-5">
        <form
          onSubmit={handleSearch}
          className="flex items-center gap-2"
        >
          <div className="min-w-0 flex-1">
            <input
              type="text"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search people..."
              className="sage-input w-full rounded-full border border-white/[0.05] bg-white/[0.03] px-4 py-3 text-sm text-white placeholder:text-white/30"
            />
          </div>
          <button
            type="submit"
            disabled={!searchInput.trim()}
            className="btn-sage shrink-0 rounded-full px-4 py-3 text-sm sm:px-5"
          >
            Search
          </button>
        </form>

        <div className="mt-4 flex flex-wrap gap-2">
          {filterOptions.map((option) => {
            const active = option.id === filter;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => void handleFilterChange(option.id)}
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                  active
                    ? "border-cyan-400/25 bg-cyan-400/12 text-white"
                    : "border-white/10 bg-white/[0.03] text-white/68 hover:text-white"
                }`}
              >
                <i className={`${option.icon} text-[11px] ${option.id === "online" ? "text-emerald-400" : ""}`} />
                {option.label}
              </button>
            );
          })}
        </div>

        {appliedSearch ? (
          <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-cyan-400/15 bg-cyan-400/[0.06] px-3 py-1.5 text-xs text-cyan-200">
            <i className="fas fa-search text-[10px]" />
            Results for "{appliedSearch}"
          </div>
        ) : null}
      </section>

      {loading ? (
        <div className="py-10 text-center">
          <div className="modern-list-loader mx-auto" aria-hidden="true">
            <div className="modern-list-loader__core" />
          </div>
          <p className="loading-text mt-2">Loading people...</p>
        </div>
      ) : (
        <>
          <div className="grid gap-3">
            {users.map((user) => {
              const isFollowing = following.has(user.id);
              const isBusy = followLoadingId === user.id;

              return (
                <div
                  key={user.id}
                  className="rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(8,21,32,0.92),rgba(4,13,20,0.9))] p-4 shadow-[0_18px_50px_rgba(0,0,0,0.18)]"
                >
                  <div className="flex items-center gap-3">
                    <Link href={`/profile/${user.id}`} className="relative shrink-0">
                      <Image
                        src={user.picture || "/files/default-avatar.svg"}
                        alt={user.username}
                        width={52}
                        height={52}
                        className="h-[52px] w-[52px] rounded-full border border-white/15 object-cover"
                      />
                      {user.isOnline ? <span className="absolute bottom-0 right-0 online-dot" /> : null}
                    </Link>

                    <div className="min-w-0 flex-1">
                      <Link href={`/profile/${user.id}`} className="block">
                        <p className="truncate text-sm font-semibold capitalize text-white transition-colors hover:text-cyan-400">
                          {user.username}
                        </p>
                      </Link>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-white/45">
                        <span className={`level-${user.level?.toLowerCase() ?? "amateur"}`}>{user.level ?? "Amateur"}</span>
                        <span>•</span>
                        <span className="text-cyan-400">{formatPoints(user.points)} pts</span>
                        <span>•</span>
                        <span className={user.isOnline ? "text-emerald-400" : "text-white/35"}>
                          {user.isOnline ? "Online" : "Offline"}
                        </span>
                      </div>
                    </div>

                    {currentUserId && currentUserId !== user.id ? (
                      <button
                        type="button"
                        onClick={() => void handleFollow(user.id)}
                        disabled={isBusy}
                        className={`btn-sage shrink-0 rounded-full px-4 py-2 text-xs ${isFollowing ? "opacity-75" : ""} ${isBusy ? "cursor-not-allowed" : ""}`}
                      >
                        {isBusy ? (
                          <span className="inline-flex items-center gap-2">
                            <span className="inline-block h-3 w-3 animate-spin rounded-full border border-white/35 border-t-white" />
                            Please wait
                          </span>
                        ) : isFollowing ? (
                          <>
                            <i className="fas fa-user-check mr-1" />
                            Following
                          </>
                        ) : (
                          <>
                            <i className="fas fa-user-plus mr-1" />
                            Follow
                          </>
                        )}
                      </button>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>

          {!loading && users.length === 0 ? (
            <div className="py-16 text-center">
              <i className="fas fa-users text-4xl text-white/20" />
              <p className="mt-3 text-sm text-white/45">No people found for this view.</p>
            </div>
          ) : null}

          {!loading && hasMore && users.length > 0 ? (
            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => void loadUsers({ reset: false })}
                disabled={loadingMore}
                className="btn-sage rounded-full px-5 py-2.5 text-sm"
              >
                {loadingMore ? "Loading more..." : "Load more people"}
              </button>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
