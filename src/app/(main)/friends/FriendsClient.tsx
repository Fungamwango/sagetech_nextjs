"use client";

import { useState, useEffect } from "react";
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
}

interface FriendsClientProps {
  currentUserId: string | null;
}

export default function FriendsClient({ currentUserId }: FriendsClientProps) {
  const { showToast } = useToast();
  const [users, setUsers] = useState<SageUser[]>([]);
  const [following, setFollowing] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async (q = "") => {
    setLoading(true);
    const url = q ? `/api/users?q=${encodeURIComponent(q)}` : "/api/users";
    const res = await fetch(url);
    if (res.ok) {
      const d = await res.json();
      setUsers(d.users ?? []);
    } else {
      showToast({ type: "error", message: "Unable to load users." });
    }
    setLoading(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadUsers(search);
  };

  const handleFollow = async (userId: string) => {
    const res = await fetch(`/api/users/${userId}/follow`, { method: "POST" });
    if (res.ok) {
      const d = await res.json();
      setFollowing((prev) => {
        const next = new Set(prev);
        if (d.following) next.add(userId); else next.delete(userId);
        return next;
      });
      showToast({ type: "success", message: d.following ? "User followed." : "User unfollowed." });
    } else {
      showToast({ type: "error", message: "Unable to update follow status." });
    }
  };

  return (
    <div>
      <h1 className="text-lg font-bold text-white mb-4">Discover People</h1>

      <form onSubmit={handleSearch} className="flex gap-2 mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search users..."
          className="sage-input flex-1 rounded-l-full text-sm py-2"
        />
        <button type="submit" className="btn-sage rounded-r-full px-4">
          <i className="fas fa-search" />
        </button>
      </form>

      {loading && (
        <div className="text-center py-8">
          <div className="modern-list-loader mx-auto" aria-hidden="true">
            <div className="modern-list-loader__core" />
          </div>
          <p className="loading-text mt-2">Loading users...</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-3">
        {users.map((u) => (
          <div key={u.id} className="sage-card flex items-center gap-3 fade-in">
            <Link href={`/profile/${u.id}`} className="relative flex-shrink-0">
              <Image
                src={u.picture || "/files/default-avatar.svg"}
                alt={u.username}
                width={44}
                height={44}
                className="rounded-full object-cover border border-white/20"
              />
              {u.isOnline && <span className="absolute bottom-0 right-0 online-dot" />}
            </Link>

            <div className="flex-1 min-w-0">
              <Link href={`/profile/${u.id}`}>
                <p className="text-sm font-semibold text-white capitalize hover:text-cyan-400 transition-colors truncate">
                  {u.username}
                </p>
              </Link>
              <p className={`text-xs level-${u.level?.toLowerCase() ?? "amateur"}`}>
                {u.level ?? "Amateur"}
              </p>
              <p className="text-xs text-cyan-400">
                {parseFloat(String(u.points ?? 0)).toFixed(0)} pts
              </p>
            </div>

            {currentUserId && currentUserId !== u.id && (
              <button
                onClick={() => handleFollow(u.id)}
                className={`btn-sage text-xs px-3 py-1.5 flex-shrink-0 ${following.has(u.id) ? "opacity-70" : ""}`}
              >
                {following.has(u.id) ? (
                  <><i className="fas fa-user-minus mr-1" />Unfollow</>
                ) : (
                  <><i className="fas fa-user-plus mr-1" />Follow</>
                )}
              </button>
            )}
          </div>
        ))}
      </div>

      {!loading && users.length === 0 && (
        <div className="text-center py-16">
          <i className="fas fa-users text-4xl text-white/20 mb-3" />
          <p className="text-white/40 text-sm">No users found</p>
        </div>
      )}
    </div>
  );
}
