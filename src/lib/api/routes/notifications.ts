import { Hono } from "hono";
import { db } from "@/lib/db";
import { notifications, users } from "@/lib/db/schema";
import { eq, desc, sql, and } from "drizzle-orm";
import { getSession } from "@/lib/auth";

export const notificationsRouter = new Hono()

  // ─── Get notifications ───────────────────────────────────────
  .get("/", async (c) => {
    const session = await getSession();
    if (!session) return c.json({ error: "Unauthorized" }, 401);

    const offset = parseInt(c.req.query("offset") ?? "0");
    const limit = Math.min(20, Math.max(1, parseInt(c.req.query("limit") ?? "20")));

    const [result] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(notifications)
      .where(eq(notifications.userId, session.userId));

    const notifs = await db
      .select({
        id: notifications.id,
        type: notifications.type,
        content: notifications.content,
        postId: notifications.postId,
        seen: notifications.seen,
        createdAt: notifications.createdAt,
        actorId: notifications.actorId,
        actorUsername: users.username,
        actorPicture: users.picture,
      })
      .from(notifications)
      .leftJoin(users, eq(notifications.actorId, users.id))
      .where(eq(notifications.userId, session.userId))
      .orderBy(desc(notifications.createdAt))
      .limit(limit)
      .offset(offset);

    return c.json({
      notifications: notifs,
      totalCount: Number(result?.count ?? 0),
      hasMore: offset + notifs.length < Number(result?.count ?? 0),
    });
  })

  // ─── Unread count ─────────────────────────────────────────────
  .get("/count", async (c) => {
    const session = await getSession();
    if (!session) return c.json({ count: 0 });

    const [result] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(notifications)
      .where(and(eq(notifications.userId, session.userId), eq(notifications.seen, false)));

    return c.json({ count: Number(result?.count ?? 0) });
  })

  // ─── Mark all as read ────────────────────────────────────────
  .put("/read", async (c) => {
    const session = await getSession();
    if (!session) return c.json({ error: "Unauthorized" }, 401);

    await db
      .update(notifications)
      .set({ seen: true })
      .where(and(eq(notifications.userId, session.userId), eq(notifications.seen, false)));

    return c.json({ success: true });
  })

  // ─── Delete notification ──────────────────────────────────────
  .delete("/:id", async (c) => {
    const session = await getSession();
    if (!session) return c.json({ error: "Unauthorized" }, 401);

    const notifId = c.req.param("id");
    await db
      .delete(notifications)
      .where(and(eq(notifications.id, notifId), eq(notifications.userId, session.userId)));

    return c.json({ success: true });
  });
