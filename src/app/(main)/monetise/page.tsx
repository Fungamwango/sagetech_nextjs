import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { posts, users } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import MonetiseClient from "./MonetiseClient";

export default async function MonetisePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [postCount] = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(posts)
    .where(eq(posts.userId, user.id));

  const totalPosts = Number(postCount?.count ?? 0);
  const shouldBeMonetised = !!user.adsUrl && totalPosts >= 5;

  if (user.isMonetised !== shouldBeMonetised) {
    await db
      .update(users)
      .set({ isMonetised: shouldBeMonetised, updatedAt: new Date() })
      .where(eq(users.id, user.id));
  }

  return (
    <MonetiseClient
      userId={user.id}
      initialAdsUrl={user.adsUrl ?? ""}
      initialAdsFreq={(user.adsFreq as "high" | "medium" | "low" | null) ?? "low"}
      postCount={totalPosts}
      isMonetised={shouldBeMonetised}
    />
  );
}
