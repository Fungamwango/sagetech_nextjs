import { db } from "@/lib/db";
import { websiteInfo } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export const DEFAULT_MONETISE_MIN_POSTS = 5;

export async function getMonetiseMinPosts() {
  const [row] = await db
    .select({ value: websiteInfo.value })
    .from(websiteInfo)
    .where(eq(websiteInfo.key, "monetise_min_posts"))
    .limit(1);

  const parsed = Number(row?.value ?? DEFAULT_MONETISE_MIN_POSTS);
  if (!Number.isFinite(parsed) || parsed < 1) return DEFAULT_MONETISE_MIN_POSTS;
  return Math.floor(parsed);
}
