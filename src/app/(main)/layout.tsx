import { getCurrentUser } from "@/lib/auth";
import Header from "@/components/layout/Header";
import LeftSidebar from "@/components/layout/LeftSidebar";
import RightSidebar from "@/components/layout/RightSidebar";

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  const navUser = user
    ? { id: user.id, username: user.username, picture: user.picture, points: user.points }
    : null;

  return (
    <>
      <Header user={navUser} />

      <main
        className="min-h-screen px-[6px] pb-6 pt-[54px] sm:px-[10px]"
        style={{
          marginTop: "46px",
          background: "linear-gradient(to bottom, rgba(0,0,0,0.9), rgb(22,40,50), rgba(0,0,0,0.9))",
          backgroundAttachment: "fixed",
        }}
      >
        <div
          className="grid grid-cols-1 gap-[8px] lg:grid-cols-[25%_minmax(0,620px)_25%] lg:justify-center"
        >
          <div
            className="hidden lg:block"
            style={{ visibility: "hidden" }}
            aria-hidden
          />

          <section
            className="min-h-screen w-full"
            style={{ padding: "0", maxWidth: "620px" }}
          >
            {children}
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
