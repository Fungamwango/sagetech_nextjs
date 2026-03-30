import { getAdminSession } from "@/lib/auth";
import Link from "next/link";
import AdminLogoutButton from "./AdminLogoutButton";

const adminLinks = [
  { href: "/admin", icon: "fas fa-tachometer-alt", label: "Dashboard" },
  { href: "/admin/posts", icon: "fas fa-file-alt", label: "Posts" },
  { href: "/admin/users", icon: "fas fa-users", label: "Users" },
  { href: "/admin/recharges", icon: "fas fa-coins", label: "Recharges" },
  { href: "/admin/reports", icon: "fas fa-flag", label: "Reports" },
  { href: "/admin/messages", icon: "fas fa-envelope", label: "Messages" },
  { href: "/admin/account", icon: "fas fa-user-cog", label: "Account" },
  { href: "/admin/website", icon: "fas fa-code", label: "Edit Website" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getAdminSession();

  // Allow login page without session
  // Redirect to login if no session (except login page)
  return (
    <div
      className="min-h-screen"
      style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.95), rgb(10,25,35), rgba(0,0,0,0.95))" }}
    >
      {session && (
        <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-black/80 backdrop-blur-sm">
          <div className="flex items-center justify-between gap-3 px-4 py-3">
            <Link href="/admin" className="min-w-0 text-base font-bold text-white sm:text-lg" style={{ fontFamily: "serif" }}>
              <span className="truncate">SageTech <span className="text-red-400">Admin</span></span>
            </Link>
            <div className="flex items-center gap-2 sm:gap-4">
              <span className="hidden max-w-[140px] truncate text-sm text-white/50 sm:block">{session.username}</span>
              <AdminLogoutButton />
            </div>
          </div>
          <div className="border-t border-white/5 px-3 py-2 lg:hidden">
            <div className="flex gap-2 overflow-x-auto pb-1">
              {adminLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex shrink-0 items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-white/75 transition-colors hover:bg-white/5 hover:text-white"
                >
                  <i className={`${link.icon} text-[11px]`} />
                  {link.label}
                </Link>
              ))}
              <Link
                href="/"
                className="flex shrink-0 items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-white/55 transition-colors hover:bg-white/5 hover:text-white"
              >
                <i className="fas fa-external-link-alt text-[11px]" />
                View Site
              </Link>
            </div>
          </div>
        </nav>
      )}

      <div className={`flex ${session ? "pt-[108px] lg:pt-14" : ""}`}>
        {session && (
          <aside className="fixed left-0 top-14 hidden h-full min-h-screen w-56 overflow-y-auto border-r border-white/10 bg-black/20 pb-20 lg:block">
            <ul className="p-3 space-y-1">
              {adminLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    <i className={`${link.icon} w-4`} />
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/"
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/40 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <i className="fas fa-external-link-alt w-4" />
                  View Site
                </Link>
              </li>
            </ul>
          </aside>
        )}
        <main className={`min-w-0 flex-1 p-4 sm:p-5 lg:p-6 ${session ? "lg:ml-56" : ""}`}>{children}</main>
      </div>
    </div>
  );
}
