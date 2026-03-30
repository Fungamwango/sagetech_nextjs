import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { db } from "@/lib/db";
import { messages, users } from "@/lib/db/schema";
import { eq, and, or, desc, sql, ne } from "drizzle-orm";
import { getSession } from "@/lib/auth";

export const messagesRouter = new Hono()

  // ─── Get conversations list ──────────────────────────────────
  .get("/", async (c) => {
    const session = await getSession();
    if (!session) return c.json({ error: "Unauthorized" }, 401);

    // Get latest message per conversation
    const conversations = await db.execute(sql`
      SELECT DISTINCT ON (conversation_partner)
        m.id,
        m.content,
        m.file_type,
        m.created_at,
        m.status,
        CASE
          WHEN m.sender_id = ${session.userId} THEN m.receiver_id
          ELSE m.sender_id
        END as conversation_partner,
        u.username,
        u.picture,
        u.is_online,
        u.last_seen,
        (SELECT COUNT(*) FROM messages unread
         WHERE unread.receiver_id = ${session.userId}
         AND unread.sender_id = CASE
           WHEN m.sender_id = ${session.userId} THEN m.receiver_id
           ELSE m.sender_id
         END
         AND unread.status != 'read') as unread_count
      FROM messages m
      LEFT JOIN users u ON u.id = CASE
        WHEN m.sender_id = ${session.userId} THEN m.receiver_id
        ELSE m.sender_id
      END
      WHERE (m.sender_id = ${session.userId} OR m.receiver_id = ${session.userId})
        AND m.is_deleted = false
      ORDER BY conversation_partner, m.created_at DESC
    `);

    return c.json({ conversations: conversations.rows });
  })

  // ─── Get chat with user ──────────────────────────────────────
  .get("/:userId", async (c) => {
    const session = await getSession();
    if (!session) return c.json({ error: "Unauthorized" }, 401);

    const otherId = c.req.param("userId");
    const offset = parseInt(c.req.query("offset") ?? "0");

    const chat = await db
      .select({
        id: messages.id,
        senderId: messages.senderId,
        receiverId: messages.receiverId,
        content: messages.content,
        fileUrl: messages.fileUrl,
        fileType: messages.fileType,
        status: messages.status,
        createdAt: messages.createdAt,
      })
      .from(messages)
      .where(
        and(
          or(
            and(eq(messages.senderId, session.userId), eq(messages.receiverId, otherId)),
            and(eq(messages.senderId, otherId), eq(messages.receiverId, session.userId))
          ),
          eq(messages.isDeleted, false)
        )
      )
      .orderBy(desc(messages.createdAt))
      .limit(30)
      .offset(offset);

    // Mark received messages as read
    await db
      .update(messages)
      .set({ status: "read" })
      .where(
        and(eq(messages.senderId, otherId), eq(messages.receiverId, session.userId), ne(messages.status, "read"))
      );

    // Get other user info
    const [otherUser] = await db
      .select({
        id: users.id,
        username: users.username,
        picture: users.picture,
        isOnline: users.isOnline,
        lastSeen: users.lastSeen,
      })
      .from(users)
      .where(eq(users.id, otherId))
      .limit(1);

    return c.json({ messages: chat.reverse(), user: otherUser });
  })

  // ─── Send message ─────────────────────────────────────────────
  .post(
    "/:userId",
    zValidator(
      "json",
      z.object({
        content: z.string().optional(),
        fileUrl: z.string().optional(),
        fileType: z.enum(["image", "video", "audio", "document", "none"]).optional(),
      })
    ),
    async (c) => {
      const session = await getSession();
      if (!session) return c.json({ error: "Unauthorized" }, 401);

      const receiverId = c.req.param("userId");
      const { content, fileUrl, fileType } = c.req.valid("json");

      if (!content && !fileUrl) {
        return c.json({ error: "Message cannot be empty" }, 400);
      }

      const [msg] = await db
        .insert(messages)
        .values({
          senderId: session.userId,
          receiverId,
          content,
          fileUrl,
          fileType: fileType ?? "none",
        })
        .returning();

      return c.json({ success: true, message: msg }, 201);
    }
  )

  // ─── Delete message ───────────────────────────────────────────
  .delete("/:messageId", async (c) => {
    const session = await getSession();
    if (!session) return c.json({ error: "Unauthorized" }, 401);

    const messageId = c.req.param("messageId");
    const [msg] = await db
      .select({ senderId: messages.senderId })
      .from(messages)
      .where(eq(messages.id, messageId))
      .limit(1);

    if (!msg) return c.json({ error: "Not found" }, 404);
    if (msg.senderId !== session.userId) return c.json({ error: "Forbidden" }, 403);

    await db.update(messages).set({ isDeleted: true }).where(eq(messages.id, messageId));
    return c.json({ success: true });
  })

  // ─── Unread count ─────────────────────────────────────────────
  .get("/unread/count", async (c) => {
    const session = await getSession();
    if (!session) return c.json({ count: 0 });

    const [result] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(messages)
      .where(and(eq(messages.receiverId, session.userId), ne(messages.status, "read"), eq(messages.isDeleted, false)));

    return c.json({ count: Number(result?.count ?? 0) });
  });
