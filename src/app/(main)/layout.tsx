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
        className="min-h-screen"
        style={{
          padding: "5px",
          paddingTop: "50px",
          marginTop: "46px",
          background: "linear-gradient(to bottom, rgba(0,0,0,0.9), rgb(22,40,50), rgba(0,0,0,0.9))",
          backgroundAttachment: "fixed",
        }}
      >
        <div
          className="grid grid-cols-1 gap-[5px] lg:grid-cols-[25%_50%_25%]"
        >
          <div
            className="hidden lg:block"
            style={{ visibility: "hidden" }}
            aria-hidden
          />

          <section
            className="min-h-screen"
            style={{ padding: "0" }}
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
