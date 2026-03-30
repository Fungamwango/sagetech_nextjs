"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface DayStat {
  day: string;
  value: number;
}

interface Stats {
  totalUsers: number;
  totalPosts: number;
  pendingPosts: number;
  pendingRecharges: number;
  unreadMessages: number;
  onlineUsers: number;
  newUsersToday: number;
  pendingReports: number;
  visitsLast7Days: DayStat[];
  newUsersLast7Days: DayStat[];
  postsLast7Days: DayStat[];
}

function StatSeries({ title, rows, tone }: { title: string; rows: DayStat[]; tone: "cyan" | "green" | "yellow" }) {
  const max = Math.max(...rows.map((row) => row.value), 1);
  const toneClass =
    tone === "green" ? "bg-green-400/80" : tone === "yellow" ? "bg-yellow-400/80" : "bg-cyan-400/80";

  return (
    <div className="sage-card">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-white">{title}</h3>
        <span className="text-xs text-white/40">Last 7 days</span>
      </div>
      <div className="grid grid-cols-7 gap-2">
        {rows.map((row) => (
          <div key={row.day} className="flex min-h-[132px] flex-col items-center justify-end gap-2">
            <span className="text-[11px] text-white/60">{row.value}</span>
            <div className="flex h-20 w-full items-end rounded-xl bg-white/5 px-1.5 py-1.5">
              <div
                className={`w-full rounded-lg ${toneClass}`}
                style={{ height: `${Math.max((row.value / max) * 100, row.value > 0 ? 10 : 4)}%` }}
              />
            </div>
            <span className="text-[10px] uppercase tracking-wide text-white/35">
              {new Date(row.day).toLocaleDateString(undefined, { weekday: "short" })}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AdminStats() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch("/api/admin/stats").then((r) => r.json()).then(setStats);
  }, []);

  const cards = [
    { label: "Total Users", value: stats?.totalUsers ?? "...", icon: "fas fa-users", color: "text-blue-400", href: "/admin/users" },
    { label: "Online Users", value: stats?.onlineUsers ?? "...", icon: "fas fa-signal", color: "text-emerald-400", href: "/admin/users" },
    { label: "New Users Today", value: stats?.newUsersToday ?? "...", icon: "fas fa-user-plus", color: "text-cyan-400", href: "/admin/users" },
    { label: "Total Posts", value: stats?.totalPosts ?? "...", icon: "fas fa-file-alt", color: "text-green-400", href: "/admin/posts" },
    { label: "Pending Posts", value: stats?.pendingPosts ?? "...", icon: "fas fa-clock", color: "text-yellow-400", href: "/admin/posts?status=pending" },
    { label: "Pending Recharges", value: stats?.pendingRecharges ?? "...", icon: "fas fa-coins", color: "text-orange-400", href: "/admin/recharges" },
    { label: "Unread Messages", value: stats?.unreadMessages ?? "...", icon: "fas fa-envelope", color: "text-purple-400", href: "/admin/messages" },
    { label: "Pending Reports", value: stats?.pendingReports ?? "...", icon: "fas fa-flag", color: "text-red-400", href: "/admin/reports" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="mb-2 text-xl font-bold text-white">Admin Dashboard</h1>
        <p className="text-sm text-white/45">Today, live activity, and the last 7 days in one place.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {cards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="sage-card transition-all hover:border-white/20 hover:bg-white/[0.03]"
          >
            <div className="mb-3 flex items-center justify-between">
              <i className={`${card.icon} ${card.color} text-xl`} />
              <i className="fas fa-arrow-up-right-from-square text-xs text-white/20" />
            </div>
            <p className="text-2xl font-bold text-white">{card.value}</p>
            <p className="mt-1 text-xs text-white/50">{card.label}</p>
          </Link>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <StatSeries title="Daily Visits" rows={stats?.visitsLast7Days ?? []} tone="cyan" />
        <StatSeries title="New Users" rows={stats?.newUsersLast7Days ?? []} tone="green" />
        <StatSeries title="Posts Created" rows={stats?.postsLast7Days ?? []} tone="yellow" />
      </div>

      <div className="sage-card">
        <h2 className="mb-3 text-base font-bold text-white">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
          {[
            { href: "/admin/posts", label: "Review Posts", icon: "fas fa-check-circle", color: "text-green-400" },
            { href: "/admin/users", label: "Manage Users", icon: "fas fa-user-cog", color: "text-blue-400" },
            { href: "/admin/recharges", label: "Process Recharges", icon: "fas fa-coins", color: "text-yellow-400" },
            { href: "/admin/reports", label: "Review Reports", icon: "fas fa-flag", color: "text-red-400" },
            { href: "/admin/messages", label: "Read Messages", icon: "fas fa-envelope", color: "text-cyan-400" },
            { href: "/admin/website", label: "Edit Website", icon: "fas fa-code", color: "text-purple-400" },
          ].map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2.5 text-sm text-white/70 transition-all hover:bg-white/5 hover:text-white"
            >
              <i className={`${action.icon} ${action.color}`} />
              {action.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
