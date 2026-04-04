import { sql } from "drizzle-orm";

import { ensureGuestAiUserId } from "@/lib/aiPosts";
import { db } from "@/lib/db";
import { posts } from "@/lib/db/schema";
import { slugifyPostText } from "@/lib/postUrls";

type LegacyAiPostRow = {
  id: string;
  title: string;
  content: string | null;
  views: number | null;
  created_at: Date | null;
};

async function main() {
  const guestAiUserId = await ensureGuestAiUserId();

  const tableExistsResult = await db.execute(sql`
    SELECT EXISTS (
      SELECT 1
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_name = 'ai_posts'
    ) AS exists
  `);

  const tableExists = Boolean(tableExistsResult.rows[0]?.exists);
  if (!tableExists) {
    console.log("ai_posts table not found. Nothing to migrate.");
    return;
  }

  const legacyRowsResult = await db.execute(sql`
    SELECT id, title, content, views, created_at
    FROM ai_posts
    ORDER BY created_at ASC
  `);

  const legacyRows = legacyRowsResult.rows as LegacyAiPostRow[];
  if (legacyRows.length === 0) {
    console.log("ai_posts table is empty. Dropping it.");
    await db.execute(sql`DROP TABLE IF EXISTS ai_posts`);
    return;
  }

  for (const row of legacyRows) {
    const title = row.title?.trim() || "AI Post";
    const content = row.content ?? "";
    const createdAt = row.created_at ?? new Date();

    await db
      .insert(posts)
      .values({
        id: row.id,
        userId: guestAiUserId,
        postType: "guest_ai",
        approved: true,
        privacy: "public",
        blogTitle: title,
        blogContent: content,
        slug: slugifyPostText(title),
        views: Number(row.views ?? 0),
        createdAt,
        updatedAt: createdAt,
      })
      .onConflictDoNothing({ target: posts.id });
  }

  await db.execute(sql`DROP TABLE IF EXISTS ai_posts`);
  console.log(`Migrated ${legacyRows.length} guest AI posts into posts and dropped ai_posts.`);
}

main().catch((error) => {
  console.error("Failed to migrate guest AI posts:", error);
  process.exit(1);
});
