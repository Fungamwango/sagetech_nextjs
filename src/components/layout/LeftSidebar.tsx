"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface SidebarUser {
  id: string;
  username: string;
  picture?: string | null;
  points?: string | number | null;
  level?: string | null;
  awards?: number | null;
}

interface LeftSidebarProps {
  user: SidebarUser | null;
}

const sidebarLinks = [
  { href: "/profile", icon: "fas fa-user", label: "My profile", authOnly: true },
  { href: "/monetise", icon: "fas fa-donate", label: "Monetise", authOnly: true },
  { href: "/upload", icon: "fas fa-paper-plane", label: "Post something" },
  { href: "/ai", icon: "fas fa-comment", label: "Sage AI" },
  { href: "/dictionary", icon: "fas fa-folder", label: "Bemba dictionary" },
  { href: "/all-languages-dictionary", icon: "fas fa-language", label: "All Languages dictionary" },
  { href: "/friends", icon: "fas fa-users", label: "People" },
  { href: "/messages", icon: "fas fa-envelope", label: "Messages" },
  { href: "/videos", icon: "fas fa-tv", label: "Videos" },
  { href: "/music", icon: "fas fa-music", label: "Music" },
  { href: "/books", icon: "fas fa-book", label: "Books" },
  { href: "/blog", icon: "fas fa-blog", label: "Blog" },
  { href: "/business", icon: "fas fa-store", label: "Business" },
  { href: "/adverts", icon: "fas fa-ad", label: "Adverts" },
  { href: "/coding", icon: "fas fa-code", label: "Coding" },
  { href: "/bible-study", icon: "fas fa-bible", label: "Bible Study" },
  { href: "/leaderboard", icon: "fas fa-trophy", label: "Leader Board" },
  { href: "/cyber", icon: "fas fa-lock", label: "Sage Cyber" },
  { href: "/tools", icon: "fas fa-tools", label: "Sage Tools" },
  { href: "/recharge", icon: "fas fa-coins", label: "Recharge Points" },
  { href: "/about", icon: "fas fa-users", label: "About us" },
  { href: "/contact", icon: "fas fa-phone", label: "Contact us" },
  {
    href: "https://play.google.com/store/apps/details?id=io.kodular.chandamark386.Bemba_dictionary_offline",
    icon: "fas fa-download",
    label: "Download Bemba dictionary App",
    external: true,
  },
];

export default function LeftSidebar({ user }: LeftSidebarProps) {
  const pathname = usePathname();
  const hideProfileSummaryOnly = /^\/profile\/[^/]+/.test(pathname);
  const visibleLinks = sidebarLinks.filter((link) => !link.authOnly || user);
  const profileHref = user ? `/profile/${user.id}` : "/login";

  return (
    <aside
      className="fixed top-0 h-full w-[25%] overflow-y-auto pb-48 text-white hidden lg:block"
      style={{
        background: "linear-gradient(to bottom, rgba(0,0,0,0.9), rgb(22,40,50), rgba(0,0,0,0.9))",
        marginTop: "45px",
      }}
    >
      {/* User profile section */}
      {user && (
        <div className="p-3">
          {!hideProfileSummaryOnly && (
            <>
              <p
                className="text-sm opacity-70 mb-3"
                style={{ fontStyle: "oblique", fontFamily: "serif" }}
              >
                welcome {user.username}
              </p>
              <div className="text-center border border-white/10 p-3">
                <Link href={`/profile/${user.id}`}>
                  <Image
                    src={user.picture || "/files/default-avatar.svg"}
                    alt={user.username}
                    width={130}
                    height={130}
                    className="mx-auto h-[130px] w-[130px] rounded-full border-2 border-white/40 object-cover"
                  />
                </Link>
                <Link
                  href={`/profile/${user.id}`}
                  className="block mt-2 font-semibold text-white hover:text-cyan-400 transition-colors capitalize"
                >
                  {user.username}
                </Link>
                <p className={cn("text-xs mt-1", `level-${user.level?.toLowerCase() ?? "amateur"}`)}>
                  {user.level ?? "Amateur"}
                </p>
                <p className="text-cyan-400 text-sm mt-1">
                  <i className="fas fa-coins mr-1" />
                  {parseFloat(String(user.points ?? 0)).toFixed(2)} pts
                </p>
              </div>
            </>
          )}

          {/* Sidebar nav */}
          <ul className={hideProfileSummaryOnly ? "" : "mt-2"}>
            {visibleLinks.map((link) => {
              const href = link.href === "/profile" ? profileHref : link.href;
              if ("external" in link && link.external) {
                return (
                  <li key={link.label}>
                    <a
                      href={href}
                      target="_blank"
                      rel="noreferrer"
                      className="grid grid-cols-[10%_80%] gap-1 items-center py-3 ml-4 border-b border-white/10 text-sm cursor-pointer hover:text-cyan-400 transition-colors"
                    >
                      <i className={`${link.icon} text-xs`} />
                      <span style={{ wordSpacing: "2px" }}>{link.label}</span>
                    </a>
                  </li>
                );
              }
              return (
              <li key={link.label}>
                <Link
                  href={href}
                  className={cn(
                    "grid grid-cols-[10%_80%] gap-1 items-center py-3 ml-4 border-b border-white/10 text-sm capitalize cursor-pointer hover:text-cyan-400 transition-colors",
                    pathname === href && "text-cyan-400"
                  )}
                >
                  <i className={`${link.icon} text-xs`} />
                  <span style={{ wordSpacing: "2px" }}>{link.label}</span>
                </Link>
              </li>
            );
            })}
            <li>
              <button
                onClick={() => fetch("/api/auth/logout", { method: "POST" }).then(() => window.location.href = "/login")}
                className="grid grid-cols-[10%_80%] gap-1 items-center py-3 ml-4 border-b border-white/10 text-sm capitalize cursor-pointer hover:text-red-400 transition-colors text-red-300 w-full text-left"
              >
                <i className="fas fa-sign-out-alt text-xs" />
                <span>Logout</span>
              </button>
            </li>
          </ul>
        </div>
      )}

      {!user && (
        <div className="p-4 text-center">
          <p className="text-sm opacity-70 mb-4" style={{ fontFamily: "serif" }}>
            Join SageTech to connect with friends, earn points and more.
          </p>
          <Link
            href="/register"
            className="block w-full btn-sage text-center mb-2"
          >
            Create Account
          </Link>
          <Link
            href="/login"
            className="block w-full text-center py-2 border border-white/30 text-white text-sm rounded-full hover:border-cyan-400 hover:text-cyan-400 transition-colors"
          >
            Sign In
          </Link>
          <ul className="mt-4">
            {visibleLinks.slice(0, 14).map((link) => {
              const href = link.href === "/profile" ? profileHref : link.href;
              if ("external" in link && link.external) {
                return (
                  <li key={link.label}>
                    <a
                      href={href}
                      target="_blank"
                      rel="noreferrer"
                      className="grid grid-cols-[10%_80%] gap-1 items-center py-2 ml-2 border-b border-white/10 text-sm hover:text-cyan-400 transition-colors"
                    >
                      <i className={`${link.icon} text-xs`} />
                      <span>{link.label}</span>
                    </a>
                  </li>
                );
              }
              return (
              <li key={link.label}>
                <Link
                  href={href}
                  className="grid grid-cols-[10%_80%] gap-1 items-center py-2 ml-2 border-b border-white/10 text-sm capitalize hover:text-cyan-400 transition-colors"
                >
                  <i className={`${link.icon} text-xs`} />
                  <span>{link.label}</span>
                </Link>
              </li>
            );
            })}
          </ul>
        </div>
      )}
    </aside>
  );
}
