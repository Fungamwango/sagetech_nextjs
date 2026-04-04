import bcrypt from "bcryptjs";
import { and, eq, sql } from "drizzle-orm";

import { db } from "@/lib/db";
import { posts, users } from "@/lib/db/schema";

export const GUEST_AI_USERNAME = "sage_ai_guest";
export const GUEST_AI_EMAIL = "guest-ai@sageteche.local";
const GUEST_AI_PASSWORD = "__guest_ai_system_account__";

export async function ensureGuestAiUserId() {
  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.username, GUEST_AI_USERNAME))
    .limit(1);

  if (existing?.id) return existing.id;

  const hashedPassword = await bcrypt.hash(GUEST_AI_PASSWORD, 12);
  const [created] = await db
    .insert(users)
    .values({
      username: GUEST_AI_USERNAME,
      email: GUEST_AI_EMAIL,
      password: hashedPassword,
      bio: "System guest AI author",
    })
    .returning({ id: users.id });

  return created.id;
}

export async function getAiPostById(id: string) {
  const [post] = await db
    .select({
      id: posts.id,
      title: posts.blogTitle,
      content: posts.blogContent,
      views: posts.views,
      createdAt: posts.createdAt,
      slug: posts.slug,
    })
    .from(posts)
    .where(and(eq(posts.id, id), eq(posts.postType, "guest_ai")))
    .limit(1);

  return post ?? null;
}

export async function incrementAiPostViews(id: string) {
  await db
    .update(posts)
    .set({ views: sql`${posts.views} + 1` })
    .where(and(eq(posts.id, id), eq(posts.postType, "guest_ai")));
}
