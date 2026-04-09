import { Suspense } from "react";
import { getCurrentUser } from "@/lib/auth";
import Header from "@/components/layout/Header";
import LeftSidebar from "@/components/layout/LeftSidebar";
import RightSidebar from "@/components/layout/RightSidebar";
import NativeBannerAd from "@/components/ads/NativeBannerAd";

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  const navUser = user
    ? { id: user.id, username: user.username, picture: user.picture, points: user.points }
    : null;

  return (
    <>
      <Suspense fallback={null}>
        <Header user={navUser} />
      </Suspense>

      <main
        className="min-h-screen px-0 pb-6 pt-[54px] sm:px-[10px]"
        style={{
          marginTop: "var(--app-header-offset, 45px)",
          background: "linear-gradient(to bottom, rgba(0,0,0,0.9), rgb(22,40,50), rgba(0,0,0,0.9))",
          backgroundAttachment: "fixed",
        }}
      >
        <div
          className="grid w-full grid-cols-1 justify-items-center gap-[8px] lg:grid-cols-[minmax(0,1fr)_minmax(0,650px)_minmax(0,1fr)] lg:justify-center lg:justify-items-stretch"
        >
          <div
            className="hidden lg:block"
            style={{ visibility: "hidden" }}
            aria-hidden
          />

          <section
            className="mx-auto min-h-screen w-full"
            style={{ padding: "0", maxWidth: "650px" }}
          >
            {children}
            <NativeBannerAd />
          </section>

          <div className="hidden lg:block">
            <RightSidebar />
          </div>
        </div>
      </main>

      <LeftSidebar user={navUser} />
    </>
  );
}
