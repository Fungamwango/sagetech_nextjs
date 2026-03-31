import { Hono, type Context, type Next } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import {
  admins,
  posts,
  users,
  rechargeRequests,
  contactMessages,
  websiteInfo,
  reports,
  comments,
  likes,
  follows,
  messages,
  notifications,
  passwordResetCodes,
  quizChallenges,
  cyberAttacks,
  cyberHacked,
} from "@/lib/db/schema";
import { eq, desc, sql, or, and } from "drizzle-orm";
import { getPostPath } from "@/lib/postUrls";
import { createAdminSession, destroyAdminSession, getAdminSession } from "@/lib/auth";
import { getUserLevel } from "@/lib/utils";
import { parseMediaUrls } from "@/lib/postMedia";
import { deleteR2Keys, extractR2KeyFromUrl } from "@/lib/r2";

async function requireAdmin(c: Context, next: Next) {
  const session = await getAdminSession();
  if (!session) {
    return c.json({ error: "Admin authentication required" }, 401);
  }
  await next();
}

const ONLINE_WINDOW_SQL = sql`(${users.lastSeen} IS NOT NULL AND ${users.lastSeen} >= NOW() - INTERVAL '5 minutes')`;

async function createSystemNotification(userId: string, content: string, postId?: string | null) {
  await db.insert(notifications).values({
    userId,
    type: "system",
    content,
    postId: postId ?? null,
  });
}

function collectPostFileKeys(postRecord: {
  storageKey?: string | null;
  fileUrl?: string | null;
  thumbnailUrl?: string | null;
  albumCover?: string | null;
}) {
  return [
    postRecord.storageKey,
    extractR2KeyFromUrl(postRecord.thumbnailUrl),
    extractR2KeyFromUrl(postRecord.albumCover),
    ...parseMediaUrls(postRecord.fileUrl).map((url) => extractR2KeyFromUrl(url)),
  ].filter((key): key is string => Boolean(key));
}

async function deletePostWithAssets(postId: string) {
  const [postRecord] = await db
    .select({
      id: posts.id,
      userId: posts.userId,
      storageKey: posts.storageKey,
      fileUrl: posts.fileUrl,
      thumbnailUrl: posts.thumbnailUrl,
      albumCover: posts.albumCover,
    })
    .from(posts)
    .where(eq(posts.id, postId))
    .limit(1);

  if (!postRecord) return null;

  const keysToDelete = collectPostFileKeys(postRecord);
  await db.delete(posts).where(eq(posts.id, postId));

  if (keysToDelete.length > 0) {
    await deleteR2Keys(keysToDelete);
  }

  return postRecord;
}

async function deleteUserWithAssets(userId: string) {
  const [userRecord] = await db
    .select({ picture: users.picture })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!userRecord) return false;

  const userPosts = await db
    .select({
      fileUrl: posts.fileUrl,
      thumbnailUrl: posts.thumbnailUrl,
      albumCover: posts.albumCover,
      storageKey: posts.storageKey,
    })
    .from(posts)
    .where(eq(posts.userId, userId));

  const userMessages = await db
    .select({ fileUrl: messages.fileUrl })
    .from(messages)
    .where(or(eq(messages.senderId, userId), eq(messages.receiverId, userId)));

  const keysToDelete = [
    extractR2KeyFromUrl(userRecord.picture),
    ...userPosts.flatMap((post) => [
      post.storageKey,
      extractR2KeyFromUrl(post.thumbnailUrl),
      extractR2KeyFromUrl(post.albumCover),
      ...parseMediaUrls(post.fileUrl).map((url) => extractR2KeyFromUrl(url)),
    ]),
    ...userMessages.map((message) => extractR2KeyFromUrl(message.fileUrl)),
  ].filter((key): key is string => Boolean(key));

  await db.transaction(async (tx) => {
    await tx.delete(cyberHacked).where(eq(cyberHacked.receiverId, userId));
    await tx.delete(cyberAttacks).where(eq(cyberAttacks.senderId, userId));

    await tx.delete(quizChallenges).where(eq(quizChallenges.senderId, userId));
    await tx.delete(quizChallenges).where(eq(quizChallenges.receiverId, userId));

    await tx.delete(notifications).where(eq(notifications.actorId, userId));
    await tx.delete(notifications).where(eq(notifications.userId, userId));

    await tx.delete(messages).where(eq(messages.senderId, userId));
    await tx.delete(messages).where(eq(messages.receiverId, userId));

    await tx.delete(follows).where(eq(follows.followerId, userId));
    await tx.delete(follows).where(eq(follows.followingId, userId));

    await tx.delete(likes).where(eq(likes.userId, userId));
    await tx.delete(comments).where(eq(comments.userId, userId));
    await tx.delete(reports).where(eq(reports.reporterId, userId));
    await tx.delete(rechargeRequests).where(eq(rechargeRequests.userId, userId));
    await tx.delete(passwordResetCodes).where(eq(passwordResetCodes.userId, userId));

    await tx.delete(posts).where(eq(posts.userId, userId));
    await tx.delete(users).where(eq(users.id, userId));
  });

  if (keysToDelete.length > 0) {
    await deleteR2Keys(keysToDelete);
  }

  return true;
}

export const adminRouter = new Hono()
  .post(
    "/login",
    zValidator("json", z.object({ username: z.string(), password: z.string() })),
    async (c) => {
      const { username, password } = c.req.valid("json");

      const [admin] = await db
        .select()
        .from(admins)
        .where(
          or(
            eq(admins.username, username),
            eq(admins.primaryPhone, username),
            eq(admins.secondaryPhone, username)
          )
        )
        .limit(1);

      if (!admin) return c.json({ error: "Invalid credentials" }, 401);

      const match = await bcrypt.compare(password, admin.password);
      if (!match) return c.json({ error: "Invalid credentials" }, 401);

      await createAdminSession(admin.id, admin.username);
      return c.json({ success: true });
    }
  )
  .get("/account", requireAdmin, async (c) => {
    const session = await getAdminSession();
    const [admin] = await db
      .select({
        id: admins.id,
        username: admins.username,
        primaryPhone: admins.primaryPhone,
        secondaryPhone: admins.secondaryPhone,
        email: admins.email,
        createdAt: admins.createdAt,
      })
      .from(admins)
      .where(eq(admins.id, session!.adminId))
      .limit(1);

    const [pictureRow] = await db
      .select()
      .from(websiteInfo)
      .where(eq(websiteInfo.key, "admin_picture"))
      .limit(1);

    return c.json({
      account: {
        ...admin,
        picture: pictureRow?.value || "/files/default-avatar.svg",
      },
    });
  })
  .patch(
    "/account",
    requireAdmin,
    zValidator(
      "json",
      z.object({
        username: z.string().trim().min(3, "Username must be at least 3 characters").max(50).regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
        secondaryPhone: z.union([
          z.literal(""),
          z.string().trim().regex(/^\+?[0-9]{9,20}$/, "Secondary phone must be 9 to 20 digits"),
        ]).optional(),
        email: z.string().trim().email(),
        currentPassword: z.string().optional(),
        newPassword: z.union([z.literal(""), z.string().min(8, "New password must be at least 8 characters").max(100)]).optional(),
      }).superRefine((data, ctx) => {
        const nextPassword = data.newPassword?.trim();
        if (nextPassword) {
          if (!data.currentPassword?.trim()) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Current password is required to set a new password", path: ["currentPassword"] });
          }
          if (data.currentPassword?.trim() && data.currentPassword.trim() === nextPassword) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "New password must be different from the current password", path: ["newPassword"] });
          }
        }
      })
    ),
    async (c) => {
      const session = await getAdminSession();
      const { username, secondaryPhone, email, currentPassword, newPassword } = c.req.valid("json");

      const [admin] = await db.select().from(admins).where(eq(admins.id, session!.adminId)).limit(1);
      if (!admin) return c.json({ error: "Admin not found" }, 404);

      const [usernameOwner] = await db
        .select({ id: admins.id })
        .from(admins)
        .where(eq(admins.username, username))
        .limit(1);
      if (usernameOwner && usernameOwner.id !== admin.id) {
        return c.json({ error: "Username is already taken" }, 409);
      }

      const [emailOwner] = await db
        .select({ id: admins.id })
        .from(admins)
        .where(eq(admins.email, email))
        .limit(1);
      if (emailOwner && emailOwner.id !== admin.id) {
        return c.json({ error: "Email is already in use" }, 409);
      }

      const nextValues: Partial<typeof admins.$inferInsert> = {
        username: username.trim(),
        secondaryPhone: secondaryPhone?.trim() || null,
        email: email.trim().toLowerCase(),
      };

      if (newPassword?.trim()) {
        const trimmedCurrentPassword = currentPassword?.trim() ?? "";
        const trimmedNewPassword = newPassword.trim();
        if (!trimmedCurrentPassword) {
          return c.json({ error: "Current password is required to set a new password" }, 400);
        }
        const valid = await bcrypt.compare(trimmedCurrentPassword, admin.password);
        if (!valid) return c.json({ error: "Current password is incorrect" }, 400);
        if (trimmedCurrentPassword === trimmedNewPassword) {
          return c.json({ error: "New password must be different from the current password" }, 400);
        }
        nextValues.password = await bcrypt.hash(trimmedNewPassword, 12);
      }

      await db.update(admins).set(nextValues).where(eq(admins.id, admin.id));
      return c.json({ success: true });
    }
  )
  .patch(
    "/account/picture",
    requireAdmin,
    zValidator("json", z.object({ picture: z.string().min(1) })),
    async (c) => {
      const { picture } = c.req.valid("json");
      const [existing] = await db.select().from(websiteInfo).where(eq(websiteInfo.key, "admin_picture")).limit(1);
      if (existing) {
        await db.update(websiteInfo).set({ value: picture, updatedAt: new Date() }).where(eq(websiteInfo.key, "admin_picture"));
      } else {
        await db.insert(websiteInfo).values({ key: "admin_picture", value: picture });
      }
      return c.json({ success: true });
    }
  )
  .delete("/account/picture", requireAdmin, async (c) => {
    await db.delete(websiteInfo).where(eq(websiteInfo.key, "admin_picture"));
    return c.json({ success: true });
  })
  .post("/logout", async (c) => {
    await destroyAdminSession();
    return c.json({ success: true });
  })
  .get("/stats", requireAdmin, async (c) => {
    const [totalUsers] = await db.select({ count: sql<number>`COUNT(*)` }).from(users);
    const [totalPosts] = await db.select({ count: sql<number>`COUNT(*)` }).from(posts);
    const [pendingPosts] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(posts)
      .where(eq(posts.approved, false));
    const [pendingRecharges] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(rechargeRequests)
      .where(eq(rechargeRequests.status, "pending"));
    const [unreadMessages] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(contactMessages)
      .where(eq(contactMessages.seen, false));
    const [onlineUsers] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(users)
      .where(ONLINE_WINDOW_SQL);
    const [newUsersToday] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(users)
      .where(sql`DATE(${users.createdAt}) = CURRENT_DATE`);
    const [pendingReports] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(reports)
      .where(eq(reports.status, "pending"));

    const visitsSeries = await db.execute(sql`
      select to_char(date(last_seen), 'YYYY-MM-DD') as day, count(*)::int as value
      from users
      where date(last_seen) >= current_date - interval '6 day'
      group by date(last_seen)
      order by date(last_seen) asc
    `);

    const newUsersSeries = await db.execute(sql`
      select to_char(date(created_at), 'YYYY-MM-DD') as day, count(*)::int as value
      from users
      where date(created_at) >= current_date - interval '6 day'
      group by date(created_at)
      order by date(created_at) asc
    `);

    const postsSeries = await db.execute(sql`
      select to_char(date(created_at), 'YYYY-MM-DD') as day, count(*)::int as value
      from posts
      where date(created_at) >= current_date - interval '6 day'
      group by date(created_at)
      order by date(created_at) asc
    `);

    const makeSevenDaySeries = (rows: Array<{ day: string; value: number }>) => {
      const map = new Map(rows.map((row) => [row.day, Number(row.value)]));
      const days = Array.from({ length: 7 }, (_, index) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - index));
        const day = date.toISOString().slice(0, 10);
        return {
          day,
          value: map.get(day) ?? 0,
        };
      });
      return days;
    };

    return c.json({
      totalUsers: Number(totalUsers?.count ?? 0),
      totalPosts: Number(totalPosts?.count ?? 0),
      pendingPosts: Number(pendingPosts?.count ?? 0),
      pendingRecharges: Number(pendingRecharges?.count ?? 0),
      unreadMessages: Number(unreadMessages?.count ?? 0),
      onlineUsers: Number(onlineUsers?.count ?? 0),
      newUsersToday: Number(newUsersToday?.count ?? 0),
      pendingReports: Number(pendingReports?.count ?? 0),
      visitsLast7Days: makeSevenDaySeries((visitsSeries.rows as Array<{ day: string; value: number }>) ?? []),
      newUsersLast7Days: makeSevenDaySeries((newUsersSeries.rows as Array<{ day: string; value: number }>) ?? []),
      postsLast7Days: makeSevenDaySeries((postsSeries.rows as Array<{ day: string; value: number }>) ?? []),
    });
  })
  .get("/users", requireAdmin, async (c) => {
    const offset = parseInt(c.req.query("offset") ?? "0");
    const query = c.req.query("q")?.trim();
    const pattern = query ? `%${query.toLowerCase()}%` : null;
    const userSearch = pattern
      ? sql`(
          LOWER(COALESCE(${users.username}, '')) LIKE ${pattern}
          OR LOWER(COALESCE(${users.email}, '')) LIKE ${pattern}
          OR LOWER(COALESCE(${users.bio}, '')) LIKE ${pattern}
          OR CAST(COALESCE(${users.points}, '0') AS TEXT) LIKE ${`%${query}%`}
        )`
      : undefined;
    const allUsers = await db
      .select({
        id: users.id,
        username: users.username,
        email: users.email,
        picture: users.picture,
        bio: users.bio,
        points: users.points,
        awards: users.awards,
        level: users.level,
        isOnline: sql<boolean>`${ONLINE_WINDOW_SQL}`,
        lastSeen: users.lastSeen,
        isMonetised: users.isMonetised,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(userSearch)
      .orderBy(desc(users.createdAt))
      .limit(30)
      .offset(offset);
    return c.json({ users: allUsers });
  })
  .get("/users/:id", requireAdmin, async (c) => {
    const id = c.req.param("id") as string;
    const [user] = await db
      .select({
        id: users.id,
        username: users.username,
        email: users.email,
        picture: users.picture,
        bio: users.bio,
        points: users.points,
        awards: users.awards,
        level: users.level,
        isOnline: sql<boolean>`${ONLINE_WINDOW_SQL}`,
        lastSeen: users.lastSeen,
        isMonetised: users.isMonetised,
        adsUrl: users.adsUrl,
        adsFreq: users.adsFreq,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.id, id))
      .limit(1);
    if (!user) return c.json({ error: "User not found" }, 404);

    const [postCount] = await db.select({ count: sql<number>`COUNT(*)` }).from(posts).where(eq(posts.userId, id));
    return c.json({ user: { ...user, postsCount: Number(postCount?.count ?? 0) } });
  })
  .patch(
    "/users/:id",
    requireAdmin,
    zValidator(
      "json",
      z.object({
        username: z.string().min(1).max(50),
        email: z.string().email(),
        bio: z.string().optional(),
        points: z.string(),
        awards: z.number().int().min(0),
        level: z.enum(["amateur", "intermediate", "expert", "master", "professor"]),
        isMonetised: z.boolean(),
      })
    ),
    async (c) => {
      const id = c.req.param("id") as string;
      const data = c.req.valid("json");

      const [existingUser] = await db.select({ id: users.id }).from(users).where(eq(users.id, id)).limit(1);
      if (!existingUser) return c.json({ error: "User not found" }, 404);

      const [usernameOwner] = await db.select({ id: users.id }).from(users).where(eq(users.username, data.username)).limit(1);
      if (usernameOwner && usernameOwner.id !== id) return c.json({ error: "Username already exists" }, 409);

      const [emailOwner] = await db.select({ id: users.id }).from(users).where(eq(users.email, data.email)).limit(1);
      if (emailOwner && emailOwner.id !== id) return c.json({ error: "Email already exists" }, 409);

      await db.update(users).set({
        username: data.username,
        email: data.email,
        bio: data.bio ?? null,
        points: data.points,
        awards: data.awards,
        level: data.level,
        isMonetised: data.isMonetised,
      }).where(eq(users.id, id));

      return c.json({ success: true });
    }
  )
  .get(
    "/users/inactive/preview",
    requireAdmin,
    zValidator("query", z.object({ days: z.coerce.number().int().min(1).max(3650).default(50) })),
    async (c) => {
      const { days } = c.req.valid("query");
      const result = await db.execute(sql`
        select count(*)::int as count
        from users
        where coalesce(last_seen, created_at) < now() - (${days} * interval '1 day')
      `);
      const count = Number((result.rows?.[0] as { count?: number } | undefined)?.count ?? 0);
      return c.json({ count, days });
    }
  )
  .delete(
    "/users/inactive",
    requireAdmin,
    zValidator("query", z.object({ days: z.coerce.number().int().min(1).max(3650).default(50) })),
    async (c) => {
      const { days } = c.req.valid("query");
      const inactiveUsers = await db.execute(sql`
        select id
        from users
        where coalesce(last_seen, created_at) < now() - (${days} * interval '1 day')
      `);
      const userIds = ((inactiveUsers.rows as Array<{ id: string }>) ?? []).map((row) => row.id);

      for (const userId of userIds) {
        await deleteUserWithAssets(userId);
      }

      return c.json({ success: true, deletedCount: userIds.length, days });
    }
  )
  .delete("/users/:id", requireAdmin, async (c) => {
    const userId = c.req.param("id") as string;
    const deleted = await deleteUserWithAssets(userId);
    if (!deleted) return c.json({ error: "User not found" }, 404);
    return c.json({ success: true });
  })
  .get("/posts", requireAdmin, async (c) => {
    const offset = parseInt(c.req.query("offset") ?? "0");
    const status = c.req.query("status") ?? "pending";
    const query = c.req.query("q")?.trim();
    const pattern = query ? `%${query.toLowerCase()}%` : null;
    const postSearch = pattern
      ? sql`(
          LOWER(COALESCE(${posts.generalPost}, '')) LIKE ${pattern}
          OR LOWER(COALESCE(${posts.blogTitle}, '')) LIKE ${pattern}
          OR LOWER(COALESCE(${posts.postDescription}, '')) LIKE ${pattern}
          OR LOWER(COALESCE(${users.username}, '')) LIKE ${pattern}
          OR LOWER(COALESCE(${posts.postType}, '')) LIKE ${pattern}
        )`
      : undefined;
    const statusFilter = status === "pending" ? eq(posts.approved, false) : undefined;
    const whereClause = statusFilter && postSearch ? and(statusFilter, postSearch) : statusFilter ?? postSearch;

    const allPosts = await db
      .select({
        id: posts.id,
        postType: posts.postType,
        fileUrl: posts.fileUrl,
        generalPost: posts.generalPost,
        blogTitle: posts.blogTitle,
        postDescription: posts.postDescription,
        approved: posts.approved,
        createdAt: posts.createdAt,
        userId: posts.userId,
        username: users.username,
      })
      .from(posts)
      .leftJoin(users, eq(posts.userId, users.id))
      .where(whereClause)
      .orderBy(desc(posts.createdAt))
      .limit(30)
      .offset(offset);

    return c.json({ posts: allPosts });
  })
  .patch("/posts/:id/approve", requireAdmin, async (c) => {
    await db.update(posts).set({ approved: true }).where(eq(posts.id, c.req.param("id") as string));
    return c.json({ success: true });
  })
  .patch(
    "/posts/:id",
    requireAdmin,
    zValidator(
      "json",
      z.object({
        generalPost: z.string().optional(),
        blogTitle: z.string().optional(),
        postDescription: z.string().optional(),
        approved: z.boolean().optional(),
      })
    ),
    async (c) => {
      const id = c.req.param("id") as string;
      const data = c.req.valid("json");
      const payload = Object.fromEntries(Object.entries(data).filter(([, value]) => value !== undefined));
      if (!Object.keys(payload).length) return c.json({ error: "No changes provided" }, 400);
      await db.update(posts).set({ ...payload, updatedAt: new Date() }).where(eq(posts.id, id));
      return c.json({ success: true });
    }
  )
  .delete("/posts/:id", requireAdmin, async (c) => {
    const postId = c.req.param("id") as string;
    const deletedPost = await deletePostWithAssets(postId);
    if (!deletedPost) return c.json({ error: "Post not found" }, 404);
    return c.json({ success: true });
  })
  .get("/recharges", requireAdmin, async (c) => {
    const status = c.req.query("status")?.trim() || "pending";
    const query = c.req.query("q")?.trim();
    const pattern = query ? `%${query.toLowerCase()}%` : null;
    const statusFilter = status === "all" ? undefined : eq(rechargeRequests.status, status);
    const searchFilter = pattern
      ? sql`(
          LOWER(COALESCE(${users.username}, '')) LIKE ${pattern}
          OR LOWER(COALESCE(${users.email}, '')) LIKE ${pattern}
          OR LOWER(COALESCE(${rechargeRequests.method}, '')) LIKE ${pattern}
          OR LOWER(COALESCE(${rechargeRequests.transactionId}, '')) LIKE ${pattern}
          OR CAST(COALESCE(${rechargeRequests.amount}, '0') AS TEXT) LIKE ${`%${query}%`}
          OR CAST(COALESCE(${rechargeRequests.points}, '0') AS TEXT) LIKE ${`%${query}%`}
        )`
      : undefined;
    const whereClause = statusFilter && searchFilter ? and(statusFilter, searchFilter) : statusFilter ?? searchFilter;

    const recharges = await db
      .select({
        id: rechargeRequests.id,
        amount: rechargeRequests.amount,
        points: rechargeRequests.points,
        method: rechargeRequests.method,
        transactionId: rechargeRequests.transactionId,
        status: rechargeRequests.status,
        createdAt: rechargeRequests.createdAt,
        processedAt: rechargeRequests.processedAt,
        userId: rechargeRequests.userId,
        username: users.username,
        email: users.email,
        picture: users.picture,
      })
      .from(rechargeRequests)
      .leftJoin(users, eq(rechargeRequests.userId, users.id))
      .where(whereClause)
      .orderBy(desc(rechargeRequests.createdAt))
      .limit(100);

    return c.json({ recharges });
  })
  .patch(
    "/recharges/:id/approve",
    requireAdmin,
    zValidator("json", z.object({ approve: z.boolean() })),
    async (c) => {
      const { approve } = c.req.valid("json");
      const id = c.req.param("id");

      const [recharge] = await db
        .select()
        .from(rechargeRequests)
        .where(eq(rechargeRequests.id, id))
        .limit(1);

      if (!recharge) return c.json({ error: "Not found" }, 404);

      if (approve) {
        const [currentUser] = await db
          .select({ points: users.points })
          .from(users)
          .where(eq(users.id, recharge.userId))
          .limit(1);
        const newPoints = parseFloat(String(currentUser?.points ?? 0)) + parseFloat(String(recharge.points));
        const newLevel = getUserLevel(newPoints);
        await db
          .update(users)
          .set({ points: String(newPoints), level: newLevel as typeof users.level._.data })
          .where(eq(users.id, recharge.userId));
      }

      await db
        .update(rechargeRequests)
        .set({ status: approve ? "approved" : "rejected", processedAt: new Date() })
        .where(eq(rechargeRequests.id, id));

      await createSystemNotification(
        recharge.userId,
        approve
          ? `Your recharge request for ${recharge.points} points has been approved.`
          : `Your recharge request for ${recharge.points} points has been rejected.`
      );

      return c.json({ success: true });
    }
  )
  .delete("/recharges/:id", requireAdmin, async (c) => {
    await db.delete(rechargeRequests).where(eq(rechargeRequests.id, c.req.param("id") as string));
    return c.json({ success: true });
  })
  .get("/reports", requireAdmin, async (c) => {
    const result = await db.execute(sql`
      select
        r.id,
        r.reason,
        r.status,
        r.created_at,
        r.post_id,
        reporter.username as reporter_username,
        reporter.picture as reporter_picture,
        p.user_id as culprit_id,
        culprit.username as culprit_username,
        culprit.picture as culprit_picture,
        p.post_type,
        p.general_post,
        p.blog_title,
        p.post_description
      from reports r
      left join users reporter on reporter.id = r.reporter_id
      left join posts p on p.id = r.post_id
      left join users culprit on culprit.id = p.user_id
      order by r.created_at desc
    `);

    const allReports = ((result.rows as Array<{
      id: string;
      reason: string;
      status: "pending" | "reviewed" | "resolved";
      created_at: string;
      post_id: string | null;
      reporter_username: string | null;
      reporter_picture: string | null;
      culprit_id: string | null;
      culprit_username: string | null;
      culprit_picture: string | null;
      post_type: string | null;
      general_post: string | null;
      blog_title: string | null;
      post_description: string | null;
    }>) ?? []).map((row) => ({
      id: row.id,
      reason: row.reason,
      status: row.status,
      createdAt: row.created_at,
      postId: row.post_id,
      reporterUsername: row.reporter_username,
      reporterPicture: row.reporter_picture,
      culpritId: row.culprit_id,
      culpritUsername: row.culprit_username,
      culpritPicture: row.culprit_picture,
      postType: row.post_type,
      postPreview: row.general_post || row.blog_title || row.post_description || null,
      postPath: row.post_id
        ? getPostPath({
            id: row.post_id,
            generalPost: row.general_post,
            blogTitle: row.blog_title,
            postDescription: row.post_description,
          })
        : null,
    }));

    return c.json({ reports: allReports });
  })
  .patch(
    "/reports/:id",
    requireAdmin,
    zValidator("json", z.object({ status: z.enum(["pending", "reviewed", "resolved"]) })),
    async (c) => {
      const { status } = c.req.valid("json");
      await db.update(reports).set({ status }).where(eq(reports.id, c.req.param("id") as string));
      return c.json({ success: true });
    }
  )
  .delete("/reports/:id", requireAdmin, async (c) => {
    await db.delete(reports).where(eq(reports.id, c.req.param("id") as string));
    return c.json({ success: true });
  })
  .post("/reports/:id/delete-post", requireAdmin, async (c) => {
    const reportId = c.req.param("id") as string;
    const [reportRecord] = await db
      .select({
        id: reports.id,
        postId: reports.postId,
        culpritId: posts.userId,
      })
      .from(reports)
      .leftJoin(posts, eq(reports.postId, posts.id))
      .where(eq(reports.id, reportId))
      .limit(1);

    if (!reportRecord) return c.json({ error: "Report not found" }, 404);
    if (!reportRecord.postId) return c.json({ error: "This report is no longer attached to a post" }, 404);

    if (reportRecord.culpritId) {
      await createSystemNotification(
        reportRecord.culpritId,
        "One of your posts was removed by an administrator after a report review.",
        reportRecord.postId
      );
    }

    const deletedPost = await deletePostWithAssets(reportRecord.postId);
    if (!deletedPost) return c.json({ error: "Reported post was already removed" }, 404);

    return c.json({ success: true });
  })
  .post(
    "/reports/:id/suspend",
    requireAdmin,
    zValidator(
      "json",
      z.object({
        durationValue: z.number().int().positive().max(3650),
        durationUnit: z.enum(["hours", "days", "weeks"]),
        reason: z.string().trim().min(3).max(500),
      })
    ),
    async (c) => {
      const reportId = c.req.param("id") as string;
      const { durationValue, durationUnit, reason } = c.req.valid("json");
      const [reportRecord] = await db
        .select({
          id: reports.id,
          postId: reports.postId,
          culpritId: posts.userId,
          culpritUsername: users.username,
        })
        .from(reports)
        .leftJoin(posts, eq(reports.postId, posts.id))
        .leftJoin(users, eq(posts.userId, users.id))
        .where(eq(reports.id, reportId))
        .limit(1);

      if (!reportRecord) return c.json({ error: "Report not found" }, 404);
      if (!reportRecord.culpritId) return c.json({ error: "This report has no identifiable culprit account" }, 404);

      const multiplier = durationUnit === "hours" ? 60 * 60 * 1000 : durationUnit === "weeks" ? 7 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
      const suspendedUntil = new Date(Date.now() + durationValue * multiplier);

      await db
        .update(users)
        .set({
          suspendedUntil,
          suspendReason: reason,
          updatedAt: new Date(),
        })
        .where(eq(users.id, reportRecord.culpritId));

      await createSystemNotification(
        reportRecord.culpritId,
        `Your account has been suspended for ${durationValue} ${durationUnit} because of a reported post. Reason: ${reason}`,
        reportRecord.postId
      );

      await db.update(reports).set({ status: "resolved" }).where(eq(reports.id, reportId));
      return c.json({ success: true, suspendedUntil, culpritUsername: reportRecord.culpritUsername ?? null });
    }
  )
  .get("/messages", requireAdmin, async (c) => {
    const msgs = await db
      .select()
      .from(contactMessages)
      .orderBy(desc(contactMessages.createdAt))
      .limit(50);
    return c.json({ messages: msgs });
  })
  .patch("/messages/:id/seen", requireAdmin, async (c) => {
    await db
      .update(contactMessages)
      .set({ seen: true })
      .where(eq(contactMessages.id, c.req.param("id") as string));
    return c.json({ success: true });
  })
  .patch(
    "/messages/:id/reply",
    requireAdmin,
    zValidator("json", z.object({ reply: z.string() })),
    async (c) => {
      const { reply } = c.req.valid("json");
      await db
        .update(contactMessages)
        .set({ reply, seen: true })
        .where(eq(contactMessages.id, c.req.param("id") as string));
      return c.json({ success: true });
    }
  )
  .delete("/messages/:id", requireAdmin, async (c) => {
    await db.delete(contactMessages).where(eq(contactMessages.id, c.req.param("id") as string));
    return c.json({ success: true });
  })
  .get("/website-settings", requireAdmin, async (c) => {
    const rows = await db.select().from(websiteInfo).orderBy(websiteInfo.key);
    return c.json({
      settings: Object.fromEntries(rows.map((row) => [row.key, row.value ?? ""])),
    });
  })
  .patch(
    "/website-settings",
    requireAdmin,
    zValidator("json", z.object({ settings: z.record(z.string(), z.string()) })),
    async (c) => {
      const { settings } = c.req.valid("json");

      const minimumPostsRaw = settings.monetise_min_posts;
      if (minimumPostsRaw != null) {
        const minimumPosts = Number(minimumPostsRaw);
        if (!Number.isFinite(minimumPosts) || minimumPosts < 1 || !Number.isInteger(minimumPosts)) {
          return c.json({ error: "Monetise minimum posts must be a whole number of at least 1." }, 400);
        }
      }

      for (const [key, value] of Object.entries(settings)) {
        const [existing] = await db.select().from(websiteInfo).where(eq(websiteInfo.key, key)).limit(1);
        if (existing) {
          await db.update(websiteInfo).set({ value, updatedAt: new Date() }).where(eq(websiteInfo.key, key));
        } else {
          await db.insert(websiteInfo).values({ key, value });
        }
      }

      return c.json({ success: true });
    }
  )
  .patch(
    "/users/:id/monetise",
    requireAdmin,
    zValidator("json", z.object({ enable: z.boolean() })),
    async (c) => {
      const { enable } = c.req.valid("json");
      await db
        .update(users)
        .set({ isMonetised: enable })
        .where(eq(users.id, c.req.param("id") as string));
      return c.json({ success: true });
    }
  );
