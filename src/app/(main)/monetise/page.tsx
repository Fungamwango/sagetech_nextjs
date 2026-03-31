import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { posts, users } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { canUseAdsterraStats, fetchAdsterraAllTimeRevenue, fetchAdsterraStats } from "@/lib/adsterra";
import { getMonetiseMinPosts } from "@/lib/websiteSettings";
import MonetiseClient from "./MonetiseClient";

export default async function MonetisePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [postCountRows, minimumPosts] = await Promise.all([
    db
    .select({ count: sql<number>`COUNT(*)` })
    .from(posts)
    .where(eq(posts.userId, user.id)),
    getMonetiseMinPosts(),
  ]);

  const totalPosts = Number(postCountRows[0]?.count ?? 0);
  const provider = (user.monetiseProvider as "monetag" | "adsterra" | null) ?? "monetag";
  const hasConfig = provider === "adsterra" ? !!user.adsterraBannerCode : !!user.adsUrl;
  const shouldBeMonetised = hasConfig && totalPosts >= minimumPosts;
  let adsterraStats = null;

  if (
    canUseAdsterraStats({
      provider,
      isMonetised: shouldBeMonetised,
      token: user.adsterraApiToken,
    })
  ) {
    try {
      const [recentStats, allTimeRevenue] = await Promise.all([
        fetchAdsterraStats({
          token: user.adsterraApiToken ?? "",
          domainId: user.adsterraDomainId,
          placementId: user.adsterraPlacementId,
        }),
        fetchAdsterraAllTimeRevenue({
          token: user.adsterraApiToken ?? "",
          domainId: user.adsterraDomainId,
          placementId: user.adsterraPlacementId,
        }),
      ]);
      adsterraStats = recentStats ? { ...recentStats, allTimeRevenue } : null;
    } catch {
      adsterraStats = null;
    }
  }

  if (user.isMonetised !== shouldBeMonetised) {
    await db
      .update(users)
      .set({ isMonetised: shouldBeMonetised, updatedAt: new Date() })
      .where(eq(users.id, user.id));
  }

  return (
    <MonetiseClient
      userId={user.id}
      initialProvider={provider}
      initialAdsUrl={user.adsUrl ?? ""}
      initialAdsFreq={(user.adsFreq as "high" | "medium" | "low" | null) ?? "low"}
      initialAdsterraBannerCode={user.adsterraBannerCode ?? ""}
      initialAdsterraApiToken={user.adsterraApiToken ?? ""}
      initialAdsterraDomainId={user.adsterraDomainId ?? ""}
      initialAdsterraPlacementId={user.adsterraPlacementId ?? ""}
      postCount={totalPosts}
      minimumPosts={minimumPosts}
      isMonetised={shouldBeMonetised}
      adsterraStats={adsterraStats}
    />
  );
}
