"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useBackClosable } from "@/hooks/useBackClosable";
import ConfirmModal from "@/components/ui/ConfirmModal";

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
  { href: "/documents", icon: "fas fa-file-alt", label: "Documents" },
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
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const closeLogoutModal = useBackClosable(logoutModalOpen, () => {
    if (!loggingOut) setLogoutModalOpen(false);
  });
  const visibleLinks = sidebarLinks.filter((link) => !link.authOnly || user);
  const profileHref = user ? `/profile/${user.id}` : "/login";

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "same-origin",
        cache: "no-store",
      });
      if (!response.ok) {
        throw new Error("Logout failed");
      }
      setLogoutModalOpen(false);
      window.location.replace("/login");
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <aside
      className="fixed top-0 hidden h-full overflow-y-auto pb-48 text-white lg:block"
      style={{
        background: "linear-gradient(to bottom, rgba(0,0,0,0.9), rgb(22,40,50), rgba(0,0,0,0.9))",
        marginTop: "var(--app-header-offset, 45px)",
        left: "0px",
        width: "calc((100vw - 650px) / 2 - 10px)",
      }}
    >
      {/* User profile section */}
      {user && (
        <div className="p-3">
          {!hideProfileSummaryOnly && (
            <>
              <div className="text-center border border-white/10 p-3">
                <Link href={`/profile/${user.id}`}>
                  <Image
                    src={user.picture || "/files/default-avatar.svg"}
                    alt={user.username}
                    width={168}
                    height={168}
                    className="mx-auto h-[168px] w-[168px] rounded-full border-2 border-white/40 object-cover"
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
                      className="ml-4 grid grid-cols-[10%_80%] items-center gap-2 border-b border-white/10 py-4 text-[15px] cursor-pointer transition-colors hover:text-cyan-400"
                    >
                      <i className={`${link.icon} text-[13px]`} />
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
                    "ml-4 grid grid-cols-[10%_80%] items-center gap-2 border-b border-white/10 py-4 text-[15px] capitalize cursor-pointer transition-colors hover:text-cyan-400",
                    pathname === href && "text-cyan-400"
                  )}
                >
                  <i className={`${link.icon} text-[13px]`} />
                  <span style={{ wordSpacing: "2px" }}>{link.label}</span>
                </Link>
              </li>
            );
            })}
            <li>
              <button
                onClick={() => setLogoutModalOpen(true)}
                className="ml-4 grid w-full grid-cols-[10%_80%] items-center gap-2 border-b border-white/10 py-4 text-left text-[15px] capitalize cursor-pointer text-red-300 transition-colors hover:text-red-400"
              >
                <i className="fas fa-sign-out-alt text-[13px]" />
                <span>Logout</span>
              </button>
            </li>
          </ul>
        </div>
      )}

      <ConfirmModal
        open={logoutModalOpen}
        title="Log out?"
        description="You will be signed out of your SageTech account on this device."
        confirmLabel="Log out"
        loading={loggingOut}
        iconClassName="fas fa-sign-out-alt"
        onConfirm={() => {
          void handleLogout();
        }}
        onClose={closeLogoutModal}
      />

      {!user && (
        <div className="p-4">
          <p className="mb-4 text-sm opacity-70" style={{ fontFamily: "serif" }}>
            Join SageTech to connect with friends, earn points and more.
          </p>
          <Link
            href="/register"
            className="mb-2 block w-full rounded-full border border-cyan-300/25 bg-[linear-gradient(135deg,rgba(0,138,124,0.92),rgba(0,184,217,0.92))] px-5 py-2.5 text-center text-sm font-semibold text-white transition-colors hover:border-cyan-200/35 hover:bg-[linear-gradient(135deg,rgba(0,154,138,0.96),rgba(0,200,232,0.96))]"
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
                      className="ml-4 grid grid-cols-[10%_80%] items-center gap-2 border-b border-white/10 py-3 text-[15px] transition-colors hover:text-cyan-400"
                    >
                      <i className={`${link.icon} text-[13px]`} />
                      <span style={{ wordSpacing: "2px" }}>{link.label}</span>
                    </a>
                  </li>
                );
              }
              return (
              <li key={link.label}>
                <Link
                  href={href}
                  className="ml-4 grid grid-cols-[10%_80%] items-center gap-2 border-b border-white/10 py-3 text-[15px] capitalize transition-colors hover:text-cyan-400"
                >
                  <i className={`${link.icon} text-[13px]`} />
                  <span style={{ wordSpacing: "2px" }}>{link.label}</span>
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
