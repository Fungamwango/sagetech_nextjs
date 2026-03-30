"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ModernLoader } from "@/components/ui/ModernLoader";

interface LeaderUser {
  id: string;
  username: string;
  picture?: string | null;
  points?: string | number | null;
  level?: string | null;
}

export default function RightSidebar() {
  const pathname = usePathname();
  const [leaders, setLeaders] = useState<LeaderUser[]>([]);
  const [loadingLeaders, setLoadingLeaders] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    (async () => {
      try {
        const res = await fetch("/api/leaderboard", {
          signal: controller.signal,
          cache: "no-store",
        });
        if (!res.ok) {
          throw new Error(`Leaderboard request failed: ${res.status}`);
        }
        const d = await res.json();
        setLeaders((d.leaders ?? []).slice(0, 10));
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          console.error("[RightSidebar] leaderboard fetch failed", error);
          setLeaders([]);
        }
      } finally {
        setLoadingLeaders(false);
      }
    })();

    return () => controller.abort();
  }, []);

  return (
    <aside className="hidden lg:block">
      <div className="sticky top-[96px] space-y-4">
        <div
          className="w-full cursor-pointer border border-white/10 p-2 text-center"
          style={{ minHeight: "260px", background: "rgba(0,0,0,0.18)" }}
        >
          <div
            className="mb-3 rounded p-3 text-left"
            style={{ background: "linear-gradient(to bottom, rgba(0, 180, 200, 0.12), rgba(0,0,0,0.08))" }}
          >
            <p className="text-[11px] uppercase tracking-[0.2em] text-white/45">Sponsored</p>
            <p className="mt-2 text-sm font-semibold text-white">Grow on SageTech</p>
            <p className="mt-1 text-xs leading-relaxed text-white/55">
              Upload content, stay active, and build points across the platform.
            </p>
          </div>

          <div className="space-y-2">
            <Link
              href="/upload"
              className="flex items-center justify-between rounded border border-white/10 px-3 py-2 text-left text-sm text-white/75 transition-colors hover:text-cyan-400"
            >
              <span><i className="fas fa-paper-plane mr-2 text-cyan-400" />Post something</span>
              <i className="fas fa-chevron-right text-[10px]" />
            </Link>
            <Link
              href="/recharge"
              className="flex items-center justify-between rounded border border-white/10 px-3 py-2 text-left text-sm text-white/75 transition-colors hover:text-cyan-400"
            >
              <span><i className="fas fa-coins mr-2 text-cyan-400" />Recharge points</span>
              <i className="fas fa-chevron-right text-[10px]" />
            </Link>
            <Link
              href="/tools"
              className="flex items-center justify-between rounded border border-white/10 px-3 py-2 text-left text-sm text-white/75 transition-colors hover:text-cyan-400"
            >
              <span><i className="fas fa-tools mr-2 text-cyan-400" />Sage tools</span>
              <i className="fas fa-chevron-right text-[10px]" />
            </Link>
          </div>
        </div>

        <div className="sage-card">
          <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-cyan-400">
            <i className="fas fa-trophy mr-1" /> Top Users
          </h3>
          {loadingLeaders && (
            <div className="flex justify-center py-2">
              <ModernLoader compact label="Loading..." />
            </div>
          )}
          {!loadingLeaders && leaders.length === 0 && (
            <p className="py-2 text-center text-xs text-white/40">Leaderboard unavailable</p>
          )}
          {leaders.slice(0, 5).map((user, i) => (
            <Link
              key={user.id}
              href={`/profile/${user.id}`}
              className="flex items-center gap-2 rounded px-1 py-2 transition-colors hover:bg-white/5"
            >
              <span className="w-4 text-xs text-white/40">{i + 1}.</span>
              <Image
                src={user.picture || "/files/default-avatar.svg"}
                alt={user.username}
                width={24}
                height={24}
                className="h-6 w-6 rounded-full border border-white/20 object-cover"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs capitalize text-white">{user.username}</p>
                <p className="text-xs text-cyan-400">{parseFloat(String(user.points ?? 0)).toFixed(0)} pts</p>
              </div>
            </Link>
          ))}
          <Link href="/leaderboard" className="mt-2 block py-1 text-center text-xs text-cyan-400 hover:text-cyan-300">
            View full leaderboard
          </Link>
        </div>
      </div>
    </aside>
  );
}
