import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { db } from "@/lib/db";
import { messages, users } from "@/lib/db/schema";
import { eq, and, or, desc, sql, ne } from "drizzle-orm";
import { getSession } from "@/lib/auth";

const ONLINE_WINDOW_SQL = sql`(u.last_seen IS NOT NULL AND u.last_seen >= NOW() - INTERVAL '1 minute')`;
const USER_ONLINE_WINDOW_SQL = sql<boolean>`(${users.lastSeen} IS NOT NULL AND ${users.lastSeen} >= NOW() - INTERVAL '1 minute')`;

type MessageStreamPayload = {
  type: "message_sent" | "message_deleted" | "messages_read" | "typing_started" | "typing_stopped" | "heartbeat";
  userId: string;
  peerId?: string;
  messageId?: string;
  timestamp: string;
};

type MessageStreamController = {
  enqueue: (value: string) => void;
};

const messageSubscribers = new Map<string, Set<MessageStreamController>>();

function subscribeToMessages(userId: string, controller: MessageStreamController) {
  const subscribers = messageSubscribers.get(userId) ?? new Set<MessageStreamController>();
  subscribers.add(controller);
  messageSubscribers.set(userId, subscribers);
}

function unsubscribeFromMessages(userId: string, controller: MessageStreamController) {
  const subscribers = messageSubscribers.get(userId);
  if (!subscribers) return;
  subscribers.delete(controller);
  if (subscribers.size === 0) {
    messageSubscribers.delete(userId);
  }
}

function emitMessageEvent(userId: string, payload: MessageStreamPayload) {
  const subscribers = messageSubscribers.get(userId);
  if (!subscribers?.size) return;

  const chunk = `data: ${JSON.stringify(payload)}\n\n`;
  for (const controller of Array.from(subscribers)) {
    try {
      controller.enqueue(chunk);
    } catch {
      unsubscribeFromMessages(userId, controller);
    }
  }
}

export const messagesRouter = new Hono()
  .get("/stream", async (c) => {
    const session = await getSession();
    if (!session) return c.json({ error: "Unauthorized" }, 401);

    const encoder = new TextEncoder();
    let keepAlive: ReturnType<typeof setInterval> | null = null;
    let wrappedController: MessageStreamController | null = null;

    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        wrappedController = {
          enqueue(value: string) {
            controller.enqueue(encoder.encode(value));
          },
        };

        subscribeToMessages(session.userId, wrappedController);
        wrappedController.enqueue(
          `data: ${JSON.stringify({
            type: "heartbeat",
            userId: session.userId,
            timestamp: new Date().toISOString(),
          } satisfies MessageStreamPayload)}\n\n`
        );

        keepAlive = setInterval(() => {
          try {
            controller.enqueue(encoder.encode(`: keep-alive ${Date.now()}\n\n`));
          } catch {
            if (keepAlive) clearInterval(keepAlive);
            if (wrappedController) unsubscribeFromMessages(session.userId, wrappedController);
            try {
              controller.close();
            } catch {}
          }
        }, 25000);

        c.req.raw.signal?.addEventListener(
          "abort",
          () => {
            if (keepAlive) clearInterval(keepAlive);
            if (wrappedController) unsubscribeFromMessages(session.userId, wrappedController);
            try {
              controller.close();
            } catch {}
          },
          { once: true }
        );
      },
      cancel() {
        if (keepAlive) clearInterval(keepAlive);
        if (wrappedController) unsubscribeFromMessages(session.userId, wrappedController);
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
      },
    });
  })

  .get("/", async (c) => {
    const session = await getSession();
    if (!session) return c.json({ error: "Unauthorized" }, 401);

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
        ${ONLINE_WINDOW_SQL} as is_online,
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

  .get("/:userId", async (c) => {
    const session = await getSession();
    if (!session) return c.json({ error: "Unauthorized" }, 401);

    const otherId = c.req.param("userId");
    if (otherId === session.userId) return c.json({ error: "Cannot message yourself" }, 400);
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

    await db
      .update(messages)
      .set({ status: "read" })
      .where(
        and(eq(messages.senderId, otherId), eq(messages.receiverId, session.userId), ne(messages.status, "read"))
      );

    emitMessageEvent(otherId, {
      type: "messages_read",
      userId: session.userId,
      peerId: otherId,
      timestamp: new Date().toISOString(),
    });

    const [otherUser] = await db
      .select({
        id: users.id,
        username: users.username,
        picture: users.picture,
        isOnline: USER_ONLINE_WINDOW_SQL,
        lastSeen: users.lastSeen,
      })
      .from(users)
      .where(eq(users.id, otherId))
      .limit(1);

    return c.json({ messages: chat.reverse(), user: otherUser });
  })

  .post(
    "/typing",
    zValidator(
      "json",
      z.object({
        receiverId: z.string().uuid(),
        active: z.boolean(),
      })
    ),
    async (c) => {
      const session = await getSession();
      if (!session) return c.json({ error: "Unauthorized" }, 401);

      const { receiverId, active } = c.req.valid("json");
      if (receiverId === session.userId) {
        return c.json({ error: "Cannot message yourself" }, 400);
      }

      emitMessageEvent(receiverId, {
        type: active ? "typing_started" : "typing_stopped",
        userId: session.userId,
        peerId: receiverId,
        timestamp: new Date().toISOString(),
      });

      return c.json({ success: true });
    }
  )

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
      if (receiverId === session.userId) {
        return c.json({ error: "Cannot message yourself" }, 400);
      }
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

      const payload: MessageStreamPayload = {
        type: "message_sent",
        userId: session.userId,
        peerId: receiverId,
        messageId: msg.id,
        timestamp: new Date().toISOString(),
      };

      emitMessageEvent(receiverId, payload);
      emitMessageEvent(session.userId, payload);

      return c.json({ success: true, message: msg }, 201);
    }
  )

  .delete("/:messageId", async (c) => {
    const session = await getSession();
    if (!session) return c.json({ error: "Unauthorized" }, 401);

    const messageId = c.req.param("messageId");
    const [msg] = await db
      .select({
        senderId: messages.senderId,
        receiverId: messages.receiverId,
      })
      .from(messages)
      .where(eq(messages.id, messageId))
      .limit(1);

    if (!msg) return c.json({ error: "Not found" }, 404);
    if (msg.senderId !== session.userId) return c.json({ error: "Forbidden" }, 403);

    await db.update(messages).set({ isDeleted: true }).where(eq(messages.id, messageId));

    const payload: MessageStreamPayload = {
      type: "message_deleted",
      userId: session.userId,
      peerId: msg.receiverId,
      messageId,
      timestamp: new Date().toISOString(),
    };

    emitMessageEvent(session.userId, payload);
    emitMessageEvent(msg.receiverId, payload);

    return c.json({ success: true });
  })

  .get("/unread/count", async (c) => {
    const session = await getSession();
    if (!session) return c.json({ count: 0 });

    const [result] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(messages)
      .where(and(eq(messages.receiverId, session.userId), ne(messages.status, "read"), eq(messages.isDeleted, false)));

    return c.json({ count: Number(result?.count ?? 0) });
  });
