"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useBackClosable } from "@/hooks/useBackClosable";
import ConfirmModal from "@/components/ui/ConfirmModal";

interface NavUser {
  id: string;
  username: string;
  picture?: string | null;
  points?: string | number | null;
}

interface HeaderProps {
  user: NavUser | null;
}

declare global {
  interface Window {
    _pwaInstall?: () => Promise<void>;
    __pwaInstallAvailable?: boolean;
  }
}

type PointsUpdatedDetail = { points: number };

const navLinks = [
  { href: "/", icon: "fas fa-home", label: "home", id: "home-link" },
  { href: "/messages", icon: "fas fa-envelope", label: "messages", id: "messages-link" },
  { href: "/notifications", icon: "fas fa-bell", label: "notifications", id: "notifications-link" },
  { href: "/friends", icon: "fas fa-user-plus", label: "people", id: "friends-link", mobileHide: true },
  { href: "/ai", icon: "fas fa-comment", label: "sage", id: "sage-link", badge: "AI" },
];

const allSidebarLinks = [
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

export default function Header({ user }: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showSearch, setShowSearch] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [notifCount, setNotifCount] = useState(0);
  const [msgCount, setMsgCount] = useState(0);
  const [livePoints, setLivePoints] = useState(parseFloat(String(user?.points ?? 0)));
  const [scrolled, setScrolled] = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [installAvailable, setInstallAvailable] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const closeMenu = useBackClosable(showMenu, () => setShowMenu(false));
  const closeLogoutModal = useBackClosable(logoutModalOpen, () => {
    if (!loggingOut) setLogoutModalOpen(false);
  });

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--app-header-offset", scrolled ? "45px" : "58px");
    return () => {
      root.style.setProperty("--app-header-offset", "45px");
    };
  }, [scrolled]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        menuRef.current &&
        !menuRef.current.contains(target) &&
        !menuButtonRef.current?.contains(target)
      ) {
        closeMenu();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [closeMenu]);

  useEffect(() => {
    setShowMenu(false);
    setShowSearch(false);
  }, [pathname]);

  useEffect(() => {
    setSearchQuery(searchParams.get("q") ?? "");
  }, [searchParams]);

  useEffect(() => {
    setLivePoints(parseFloat(String(user?.points ?? 0)));
  }, [user?.points]);

  useEffect(() => {
    const handlePointsUpdated = (event: Event) => {
      const detail = (event as CustomEvent<PointsUpdatedDetail>).detail;
      if (typeof detail?.points === "number" && Number.isFinite(detail.points)) {
        setLivePoints(detail.points);
      }
    };

    window.addEventListener("points-updated", handlePointsUpdated);
    return () => window.removeEventListener("points-updated", handlePointsUpdated);
  }, []);

  useEffect(() => {
    setInstallAvailable(Boolean(window.__pwaInstallAvailable));

    const onAvailability = (event: Event) => {
      const detail = (event as CustomEvent<{ available: boolean }>).detail;
      setInstallAvailable(Boolean(detail?.available));
    };

    window.addEventListener("pwa-install-availability", onAvailability);
    return () => window.removeEventListener("pwa-install-availability", onAvailability);
  }, []);

  useEffect(() => {
    if (!user) return;
    const interval = setInterval(() => {
      fetch(`/api/users/${user.id}/online`, { method: "POST" });
    }, 30000);
    fetch(`/api/users/${user.id}/online`, { method: "POST" });
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const fetchCounts = async () => {
      const [nRes, mRes] = await Promise.all([
        fetch("/api/notifications/count"),
        fetch("/api/messages/unread/count"),
      ]);
      if (nRes.ok) setNotifCount((await nRes.json()).count ?? 0);
      if (mRes.ok) setMsgCount((await mRes.json()).count ?? 0);
    };
    fetchCounts();
    const interval = setInterval(fetchCounts, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;
    router.push(`/?q=${encodeURIComponent(query)}`);
    setShowSearch(false);
  };

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
      setShowMenu(false);
      router.replace("/login");
      router.refresh();
      window.location.assign(`/login?logout=${Date.now()}`);
    } finally {
      setLoggingOut(false);
    }
  };

  const visibleSidebarLinks = allSidebarLinks.filter((link) => !link.authOnly || user);
  const profileHref = user ? `/profile/${user.id}` : "/login";

  return (
    <nav
      className="fixed left-0 right-0 z-50 px-[8px] py-[8px] sm:px-[10px]"
      style={{
        background: "linear-gradient(to bottom, rgba(0,0,0,0.96), rgba(12,28,38,0.97), rgba(22,40,50,0.95))",
        top: "-14px",
        transition: "top 1.5s ease",
        backdropFilter: "blur(10px)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div
        className="mx-auto flex max-w-[1280px] items-start justify-between gap-3 overflow-hidden pt-1 transition-all duration-[1500ms] ease-in-out"
        style={{
          marginBottom: scrolled ? "0px" : "6px",
          maxHeight: scrolled ? "0px" : "62px",
          opacity: scrolled ? 0 : 1,
          transform: scrolled ? "translateY(-18px)" : "translateY(0)",
        }}
      >
        <Link href="/" className="flex min-w-0 items-center gap-2">
          <Image src="/files/sagetech_icon.jpg" alt="SageTech" width={35} height={35} className="rounded-sm object-cover" />
          <span className="truncate text-[28px] font-bold text-white max-sm:text-[18px]" style={{ fontFamily: "serif", wordSpacing: "2.2px" }}>
            Sage<span className="text-cyan-400">Tech</span>
          </span>
        </Link>

        <div className="ml-auto flex flex-shrink-0 items-start gap-2 sm:gap-3">
          {user ? (
              <Link href={profileHref} className="rounded-full border border-white/10 bg-white/[0.03] p-1 transition-colors hover:border-cyan-400/40">
                <Image
                  src={user.picture || "/files/default-avatar.svg"}
                  alt={user.username}
                  width={32}
                  height={32}
                  className="h-8 w-8 rounded-full object-cover"
                />
              </Link>
          ) : (
            <Link
              href="/login"
              className="mt-[6px] rounded-[20px] border border-white/30 bg-white/[0.03] px-[60px] py-[4px] text-sm text-white transition-colors hover:border-cyan-400 hover:text-cyan-400 max-sm:px-[30px]"
            >
              Login
            </Link>
          )}
        </div>
      </div>

      <div
        className="mx-auto h-px max-w-[1280px] bg-white/15 transition-all duration-[1500ms] ease-in-out"
        style={{ marginBottom: scrolled ? "4px" : "2px" }}
      />

      <ul className="mx-auto grid max-w-[1280px] list-none items-center gap-[3px]" style={{ gridTemplateColumns: "repeat(6, minmax(0, 1fr))" }}>
        {navLinks.map((link) => {
          const isActive = pathname === link.href;
          const badge =
            link.id === "notifications-link" ? notifCount :
            link.id === "messages-link" ? msgCount : 0;

          return (
            <li key={link.id} className={cn("text-center text-white", link.mobileHide && "max-[770px]:hidden")}>
              <Link
                href={link.href}
                className={cn(
                  "flex min-w-0 items-center justify-center gap-[10px] rounded-full px-3 py-[6px] text-[13.5px] capitalize text-white transition-all",
                  isActive ? "active-link text-cyan-400 bg-transparent" : "min-[650px]:hover:active-link"
                )}
              >
                <span className="relative">
                  <i className={`${link.icon} text-[17px] max-[500px]:text-[15px]`} />
                  {"badge" in link && link.badge ? (
                    <span className="badge-red absolute -top-1.5 left-full -translate-x-1/3 !bg-sky-800 !px-1 !py-[1px] !text-[9px]">
                      {link.badge}
                    </span>
                  ) : null}
                  {badge > 0 && (
                    <span className="badge-red absolute -top-1 -right-1">{badge > 9 ? "9+" : badge}</span>
                  )}
                </span>
                <span className="hidden text-[13.5px] min-[995px]:inline">{link.label}</span>
              </Link>
            </li>
          );
        })}

        <li className="text-center">
          <button
            onClick={() => setShowSearch((v) => !v)}
            className={cn(
              "flex w-full min-w-0 items-center justify-center gap-[10px] rounded-full px-5 py-[6px] text-[13.5px] capitalize text-white transition-all",
              showSearch ? "active-link text-cyan-400 bg-transparent" : "min-[650px]:hover:active-link"
            )}
          >
            <i className="fas fa-search text-[17px] max-[500px]:text-[15px]" />
            <span className="hidden text-[13.5px] min-[995px]:inline">search</span>
          </button>
        </li>
        <li className="text-center">
          <button
            ref={menuButtonRef}
            onClick={() => {
              if (showMenu) {
                closeMenu();
                return;
              }
              setShowMenu(true);
            }}
            className={cn(
              "hidden w-full min-w-0 items-center justify-center gap-[10px] rounded-full px-3 py-[6px] text-[13.5px] capitalize text-white transition-all max-[995px]:flex",
              showMenu ? "active-link text-cyan-400 bg-transparent" : "min-[650px]:hover:active-link"
            )}
          >
            <span className="relative">
              <i className="fas fa-align-justify text-[17px] max-[500px]:text-[15px]" />
              <span className="badge-red absolute -top-1 -right-2 text-[12px] leading-none">+</span>
            </span>
          </button>
        </li>
      </ul>

      {showSearch && (
        <form onSubmit={handleSearch} className="mx-auto mt-4 flex max-w-[1280px] gap-0">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search posts..."
            className="sage-input flex-1 rounded-none py-2 text-sm"
            autoFocus
            style={{ width: "80%", borderRadius: "18px 0 0 18px" }}
          />
          <button
            type="submit"
            disabled={!searchQuery.trim()}
            className="border border-white/30 bg-black/20 px-4 text-sm text-white transition-colors hover:text-cyan-400"
            style={{
              width: "20%",
              borderRadius: "0 18px 18px 0",
              opacity: searchQuery.trim() ? 1 : 0.45,
              cursor: searchQuery.trim() ? "pointer" : "not-allowed",
            }}
          >
            Search
          </button>
        </form>
      )}

      {showMenu && (
        <div
          ref={menuRef}
          className="mx-auto mt-3 max-h-[calc(100vh-132px)] max-w-[1280px] overflow-y-auto rounded-[18px] border border-white/10 bg-[rgba(5,16,23,0.94)] px-3 pb-3 pt-2 shadow-[0_16px_40px_rgba(0,0,0,0.28)] lg:hidden"
        >
          {user && (
            <div className="mb-2 flex items-center gap-3 border-b border-white/10 px-1 py-3">
                <Image
                  src={user.picture || "/files/default-avatar.svg"}
                  alt={user.username}
                  width={38}
                  height={38}
                  className="h-[38px] w-[38px] rounded-full object-cover border border-white/30"
                />
              <div>
                <p className="text-sm font-semibold capitalize text-white">{user.username}</p>
                <p className="text-xs text-cyan-400">
                  <i className="fas fa-coins mr-1" />
                  {livePoints.toFixed(2)} pts
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-x-4 gap-y-0 sm:grid-cols-2">
            {installAvailable && (
              <button
                type="button"
                onClick={() => {
                  void window._pwaInstall?.();
                }}
                className="flex items-center gap-3 border-b border-white/10 py-3 text-left text-[16px] text-white transition-colors hover:text-cyan-400 sm:col-span-2"
              >
                <i className="fas fa-download w-5 text-center text-[13px]" />
                Install App
              </button>
            )}
            {visibleSidebarLinks.map((link) => {
              const href = link.href === "/profile" ? profileHref : link.href;
              const className = cn(
                "flex items-center gap-3 border-b border-white/10 py-3 text-[16px] transition-colors",
                pathname === href ? "text-cyan-400" : "text-white hover:text-cyan-400"
              );

              if ("external" in link && link.external) {
                return (
                  <a
                    key={link.label}
                    href={href}
                  target="_blank"
                  rel="noreferrer"
                  className={className}
                >
                  <i className={`${link.icon} w-5 text-center text-[13px]`} />
                  {link.label}
                </a>
              );
              }

              return (
                <Link
                  key={link.label}
                  href={href}
                  className={className}
                >
                  <i className={`${link.icon} w-5 text-center text-[13px]`} />
                  {link.label}
                </Link>
              );
            })}
          </div>

          <div className="mt-3 flex flex-col gap-3 border-t border-white/10 pt-2 sm:flex-row">
            {user ? (
              <button
                onClick={() => setLogoutModalOpen(true)}
                className="flex items-center gap-3 text-[16px] text-red-400"
              >
                <i className="fas fa-sign-out-alt" /> Logout
              </button>
            ) : (
              <>
                <Link href="/login" className="btn-sage px-5 py-2 text-[16px]">Login</Link>
                <Link href="/register" className="rounded-full border border-white/30 px-5 py-2 text-[16px] text-white transition-colors hover:border-cyan-400 hover:text-cyan-400">Register</Link>
              </>
            )}
          </div>
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
    </nav>
  );
}
