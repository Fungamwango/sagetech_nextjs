import { db } from "@/lib/db";
import { websiteInfo } from "@/lib/db/schema";
import { eq, inArray } from "drizzle-orm";

export const DEFAULT_MONETISE_MIN_POSTS = 5;
export const DEFAULT_POINT_REWARD_SETTINGS = {
  points_post_create_reward: 3,
  points_like_reward: 1,
  points_comment_reward: 2,
  points_reply_reward: 2,
  points_download_reward: 1,
} as const;

export const DEFAULT_POINT_COST_SETTINGS = {
  cost_general_post: 0,
  cost_song_post: 80,
  cost_video_post: 5,
  cost_document_post: 10,
  cost_product_post: 40,
  cost_advert_post: 100,
  cost_book_post: 10,
} as const;

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

export async function getPointRewardSettings() {
  const keys = Object.keys(DEFAULT_POINT_REWARD_SETTINGS) as Array<keyof typeof DEFAULT_POINT_REWARD_SETTINGS>;
  const rows = await db
    .select({ key: websiteInfo.key, value: websiteInfo.value })
    .from(websiteInfo)
    .where(inArray(websiteInfo.key, keys));

  const stored = new Map(rows.map((row) => [row.key, row.value]));

  return Object.fromEntries(
    keys.map((key) => {
      const fallback = DEFAULT_POINT_REWARD_SETTINGS[key];
      const parsed = Number(stored.get(key) ?? fallback);
      return [key, Number.isFinite(parsed) && parsed >= 0 ? Math.floor(parsed) : fallback];
    })
  ) as typeof DEFAULT_POINT_REWARD_SETTINGS;
}

export async function getPointCostSettings() {
  const keys = Object.keys(DEFAULT_POINT_COST_SETTINGS) as Array<keyof typeof DEFAULT_POINT_COST_SETTINGS>;
  const rows = await db
    .select({ key: websiteInfo.key, value: websiteInfo.value })
    .from(websiteInfo)
    .where(inArray(websiteInfo.key, keys));

  const stored = new Map(rows.map((row) => [row.key, row.value]));

  return Object.fromEntries(
    keys.map((key) => {
      const fallback = DEFAULT_POINT_COST_SETTINGS[key];
      const parsed = Number(stored.get(key) ?? fallback);
      return [key, Number.isFinite(parsed) && parsed >= 0 ? Math.floor(parsed) : fallback];
    })
  ) as typeof DEFAULT_POINT_COST_SETTINGS;
}
