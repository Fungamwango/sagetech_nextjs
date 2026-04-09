"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ModernLoader } from "@/components/ui/ModernLoader";
import { getPostPath } from "@/lib/postUrls";

interface LeaderUser {
  id: string;
  username: string;
  picture?: string | null;
  points?: string | number | null;
  level?: string | null;
}

interface SidebarAdvert {
  id: string;
  slug?: string | null;
  advertTitle?: string | null;
  advertUrl?: string | null;
  postDescription?: string | null;
  fileUrl?: string | null;
  fileType?: string | null;
}

function getAdvertSidebarLabel(description?: string | null, title?: string | null) {
  const desc = (description ?? "").trim();
  if (desc) {
    return desc.length > 25 ? `${desc.slice(0, 25).trimEnd()}...` : desc;
  }

  const value = (title ?? "").trim();
  if (!value) return "Sponsored advert";
  return value.length > 25 ? `${value.slice(0, 25).trimEnd()}...` : value;
}

export default function RightSidebar() {
  const pathname = usePathname();
  const [leaders, setLeaders] = useState<LeaderUser[]>([]);
  const [loadingLeaders, setLoadingLeaders] = useState(true);
  const [adverts, setAdverts] = useState<SidebarAdvert[]>([]);
  const [loadingAdvert, setLoadingAdvert] = useState(true);
  const [sidebarEnabled, setSidebarEnabled] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(min-width: 1024px)");
    const sync = () => setSidebarEnabled(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (!sidebarEnabled) {
      setLoadingLeaders(false);
      return;
    }

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
  }, [sidebarEnabled]);

  useEffect(() => {
    if (!sidebarEnabled) {
      setLoadingAdvert(false);
      return;
    }

    const controller = new AbortController();
    const seed = Math.random().toString(36).slice(2, 10);

    (async () => {
      try {
        const res = await fetch(`/api/posts?type=advert&limit=10&order=random&seed=${seed}&lightweight=1`, {
          signal: controller.signal,
          cache: "no-store",
        });
        if (!res.ok) throw new Error(`Advert request failed: ${res.status}`);
        const data = await res.json();
        setAdverts((data.posts ?? []).slice(0, 10));
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          console.error("[RightSidebar] advert fetch failed", error);
          setAdverts([]);
        }
      } finally {
        setLoadingAdvert(false);
      }
    })();

    return () => controller.abort();
  }, [sidebarEnabled]);

  const handleAdvertClick = (advertId: string) => {
    void fetch(`/api/posts/${advertId}/advert-click`, { method: "POST" }).catch(() => {});
  };

  return (
    <aside
      className="fixed right-0 top-0 hidden h-full overflow-y-auto pb-48 text-white lg:block"
      style={{
        background: "linear-gradient(to bottom, rgba(0,0,0,0.9), rgb(22,40,50), rgba(0,0,0,0.9))",
        marginTop: "var(--app-header-offset, 45px)",
        width: "calc((100vw - 650px) / 2 - 10px)",
      }}
    >
      <div className="space-y-4 p-3">
        <div className="w-full border border-white/10 p-2 text-center" style={{ minHeight: "260px", background: "rgba(0,0,0,0.18)" }}>
          <div className="mb-2 px-1 text-left">
            <p className="text-[11px] uppercase tracking-[0.2em] text-white/45">Sponsored</p>
          </div>

          {loadingAdvert ? (
            <div className="flex min-h-[210px] items-center justify-center rounded-[18px] border border-white/10 bg-white/[0.03] text-sm text-white/45">
              Loading adverts...
            </div>
          ) : adverts.length > 0 ? (
            <div
              className="grid gap-2"
              style={{ gridTemplateColumns: "repeat(auto-fit, minmax(88px, 1fr))" }}
            >
              {adverts.map((advert) =>
                advert.advertUrl ? (
                  <a
                    key={advert.id}
                    href={advert.advertUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => handleAdvertClick(advert.id)}
                    className="group block w-full overflow-hidden border border-white/10 bg-transparent text-left transition-colors hover:border-cyan-400/20"
                  >
                    {advert.fileUrl && advert.fileType === "image" ? (
                      <>
                        <div className="overflow-hidden bg-black/20">
                          <img
                            src={advert.fileUrl}
                            alt={advert.advertTitle || "Advert"}
                            className="block w-full h-auto max-h-[180px] bg-black/25 p-1 object-contain transition-transform duration-300 group-hover:scale-[1.02]"
                          />
                        </div>
                        <div className="px-2.5 pb-2.5 pt-2">
                          <p className="truncate text-[14px] font-bold tracking-[0.01em] text-white">
                            {getAdvertSidebarLabel(advert.postDescription, advert.advertTitle)}
                          </p>
                        </div>
                      </>
                    ) : (
                      <div className="relative grid aspect-square overflow-hidden bg-black/20">
                        {advert.fileType === "video" ? (
                          <div className="flex h-full w-full items-center justify-center bg-[linear-gradient(180deg,rgba(0,180,200,0.12),rgba(0,0,0,0.35))] text-cyan-200">
                            <span className="flex h-12 w-12 items-center justify-center rounded-full border border-white/15 bg-black/35">
                              <i className="fas fa-play ml-0.5 text-sm" />
                            </span>
                          </div>
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-[linear-gradient(180deg,rgba(0,180,200,0.12),rgba(0,0,0,0.35))] text-cyan-200">
                            <i className="fas fa-ad text-2xl" />
                          </div>
                        )}

                        <div className="absolute inset-x-0 bottom-0 bg-[linear-gradient(180deg,transparent,rgba(2,8,12,0.97))] px-2.5 pb-2.5 pt-8">
                          <p className="truncate text-[14px] font-bold tracking-[0.01em] text-white drop-shadow-[0_1px_6px_rgba(0,0,0,0.45)]">
                            {getAdvertSidebarLabel(advert.postDescription, advert.advertTitle)}
                          </p>
                        </div>
                      </div>
                    )}
                  </a>
                ) : (
                  <Link
                    key={advert.id}
                    href={getPostPath({
                      id: advert.id,
                      slug: advert.slug ?? null,
                      postType: "advert",
                      advertTitle: advert.advertTitle ?? null,
                      postDescription: advert.postDescription ?? null,
                    } as never)}
                    onClick={() => handleAdvertClick(advert.id)}
                    className="group block w-full overflow-hidden border border-white/10 bg-transparent text-left transition-colors hover:border-cyan-400/20"
                  >
                    {advert.fileUrl && advert.fileType === "image" ? (
                      <>
                        <div className="overflow-hidden bg-black/20">
                          <img
                            src={advert.fileUrl}
                            alt={advert.advertTitle || "Advert"}
                            className="block w-full h-auto max-h-[180px] bg-black/25 p-1 object-contain transition-transform duration-300 group-hover:scale-[1.02]"
                          />
                        </div>
                        <div className="px-2.5 pb-2.5 pt-2">
                          <p className="truncate text-[14px] font-bold tracking-[0.01em] text-white">
                            {getAdvertSidebarLabel(advert.postDescription, advert.advertTitle)}
                          </p>
                        </div>
                      </>
                    ) : (
                      <div className="relative grid aspect-square overflow-hidden bg-black/20">
                        {advert.fileType === "video" ? (
                          <div className="flex h-full w-full items-center justify-center bg-[linear-gradient(180deg,rgba(0,180,200,0.12),rgba(0,0,0,0.35))] text-cyan-200">
                            <span className="flex h-12 w-12 items-center justify-center rounded-full border border-white/15 bg-black/35">
                              <i className="fas fa-play ml-0.5 text-sm" />
                            </span>
                          </div>
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-[linear-gradient(180deg,rgba(0,180,200,0.12),rgba(0,0,0,0.35))] text-cyan-200">
                            <i className="fas fa-ad text-2xl" />
                          </div>
                        )}

                        <div className="absolute inset-x-0 bottom-0 bg-[linear-gradient(180deg,transparent,rgba(2,8,12,0.97))] px-2.5 pb-2.5 pt-8">
                          <p className="truncate text-[14px] font-bold tracking-[0.01em] text-white drop-shadow-[0_1px_6px_rgba(0,0,0,0.45)]">
                            {getAdvertSidebarLabel(advert.postDescription, advert.advertTitle)}
                          </p>
                        </div>
                      </div>
                    )}
                  </Link>
                )
              )}
            </div>
          ) : (
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
          )}
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
