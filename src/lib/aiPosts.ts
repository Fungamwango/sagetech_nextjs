import { eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { aiPosts } from "@/lib/db/schema";

export async function getAiPostById(id: string) {
  const [post] = await db.select().from(aiPosts).where(eq(aiPosts.id, id)).limit(1);
  return post ?? null;
}

export async function incrementAiPostViews(id: string) {
  await db
    .update(aiPosts)
    .set({ views: sql`${aiPosts.views} + 1` })
    .where(eq(aiPosts.id, id));
}
