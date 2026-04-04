import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { users, follows, posts, notifications } from "@/lib/db/schema";
import { eq, sql, and, ne, ilike, desc, inArray, exists } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { getMonetiseMinPosts } from "@/lib/websiteSettings";
import { GUEST_AI_EMAIL, GUEST_AI_USERNAME } from "@/lib/aiPosts";

const updateProfileSchema = z.object({
  username: z.string().min(3).max(50).optional(),
  bio: z.string().max(300).optional(),
  picture: z.string().optional(),
});

const updateMonetiseSchema = z.object({
  provider: z.enum(["monetag", "adsterra"]),
  adsUrl: z.string().url().optional().or(z.literal("")),
  adsFreq: z.enum(["high", "medium", "low"]).optional(),
  adsterraBannerCode: z.string().optional().or(z.literal("")),
  adsterraApiToken: z.string().optional().or(z.literal("")),
  adsterraDomainId: z.string().optional().or(z.literal("")),
  adsterraPlacementId: z.string().optional().or(z.literal("")),
});

const updatePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(4).max(100),
});

const ONLINE_WINDOW_SQL = sql<boolean>`(${users.lastSeen} IS NOT NULL AND ${users.lastSeen} >= NOW() - INTERVAL '1 minute')`;

function isMonetiseConfigReady(input: {
  provider: "monetag" | "adsterra";
  adsUrl?: string;
  adsterraBannerCode?: string;
}) {
  if (input.provider === "adsterra") {
    return !!input.adsterraBannerCode?.trim();
  }
  return !!input.adsUrl?.trim();
}

export const usersRouter = new Hono()

  // ─── Get user profile ────────────────────────────────────────
  .get("/:id", async (c) => {
    const id = c.req.param("id");
    const session = await getSession();

    const [user] = await db
      .select({
        id: users.id,
        username: users.username,
        bio: users.bio,
        picture: users.picture,
        points: users.points,
        awards: users.awards,
        level: users.level,
        isOnline: ONLINE_WINDOW_SQL,
        lastSeen: users.lastSeen,
        isMonetised: users.isMonetised,
        monetiseProvider: users.monetiseProvider,
        adsUrl: users.adsUrl,
        adsFreq: users.adsFreq,
        adsterraBannerCode: users.adsterraBannerCode,
        adsterraDomainId: users.adsterraDomainId,
        adsterraPlacementId: users.adsterraPlacementId,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    if (!user) return c.json({ error: "User not found" }, 404);

    // Counts
    const [followerCount] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(follows)
      .where(eq(follows.followingId, id));

    const [followingCount] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(follows)
      .where(eq(follows.followerId, id));

    const [postCount] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(posts)
      .where(and(eq(posts.userId, id), eq(posts.approved, true)));

    let isFollowing = false;
    if (session?.userId && session.userId !== id) {
      const [follow] = await db
        .select({ id: follows.id })
        .from(follows)
        .where(and(eq(follows.followerId, session.userId), eq(follows.followingId, id)))
        .limit(1);
      isFollowing = !!follow;
    }

    return c.json({
      user: {
        ...user,
        followerCount: Number(followerCount?.count ?? 0),
        followingCount: Number(followingCount?.count ?? 0),
        postCount: Number(postCount?.count ?? 0),
        isFollowing,
        isMe: session?.userId === id,
      },
    });
  })

  // ─── Update profile ──────────────────────────────────────────
  .patch("/:id", zValidator("json", updateProfileSchema), async (c) => {
    const session = await getSession();
    if (!session) return c.json({ error: "Unauthorized" }, 401);

    const id = c.req.param("id");
    if (session.userId !== id) return c.json({ error: "Forbidden" }, 403);

    const data = c.req.valid("json");
    if (data.username) {
      const [existingUsername] = await db
        .select({ id: users.id })
        .from(users)
        .where(and(eq(users.username, data.username), ne(users.id, id)))
        .limit(1);

      if (existingUsername) {
        return c.json({ error: "Username already taken" }, 409);
      }
    }

    const [updated] = await db
      .update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning({ id: users.id, username: users.username, picture: users.picture, bio: users.bio });

    return c.json({ user: updated });
  })

  .patch("/:id/password", zValidator("json", updatePasswordSchema), async (c) => {
    const session = await getSession();
    if (!session) return c.json({ error: "Unauthorized" }, 401);

    const id = c.req.param("id");
    if (session.userId !== id) return c.json({ error: "Forbidden" }, 403);

    const { currentPassword, newPassword } = c.req.valid("json");
    const [user] = await db
      .select({ password: users.password })
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    if (!user) return c.json({ error: "User not found" }, 404);

    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) return c.json({ error: "Current password is not correct" }, 400);

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await db
      .update(users)
      .set({ password: hashedPassword, updatedAt: new Date() })
      .where(eq(users.id, id));

    return c.json({ success: true });
  })

  // Update monetisation settings
  .patch("/:id/monetise", zValidator("json", updateMonetiseSchema), async (c) => {
    const session = await getSession();
    if (!session) return c.json({ error: "Unauthorized" }, 401);

    const id = c.req.param("id");
    if (session.userId !== id) return c.json({ error: "Forbidden" }, 403);

    const {
      provider,
      adsUrl = "",
      adsFreq = "low",
      adsterraBannerCode = "",
      adsterraApiToken = "",
      adsterraDomainId = "",
      adsterraPlacementId = "",
    } = c.req.valid("json");

    const [postCount] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(posts)
      .where(eq(posts.userId, id));

    const count = Number(postCount?.count ?? 0);
    const minimumPosts = await getMonetiseMinPosts();
    if (count < minimumPosts) {
      return c.json({ error: `You must create at least ${minimumPosts} posts to start monetising.` }, 400);
    }

    if (provider === "monetag" && !adsUrl.trim()) {
      return c.json({ error: "Enter a valid Monetag direct link." }, 400);
    }

    if (provider === "adsterra" && !adsterraBannerCode.trim()) {
      return c.json({ error: "Paste your Adsterra banner code or script." }, 400);
    }

    const [updated] = await db
      .update(users)
      .set({
        monetiseProvider: provider,
        adsUrl: adsUrl.trim() || null,
        adsFreq,
        adsterraBannerCode: adsterraBannerCode.trim() || null,
        adsterraApiToken: adsterraApiToken.trim() || null,
        adsterraDomainId: adsterraDomainId.trim() || null,
        adsterraPlacementId: adsterraPlacementId.trim() || null,
        isMonetised: isMonetiseConfigReady({
          provider,
          adsUrl: adsUrl.trim(),
          adsterraBannerCode: adsterraBannerCode.trim(),
        }),
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning({
        isMonetised: users.isMonetised,
        monetiseProvider: users.monetiseProvider,
        adsUrl: users.adsUrl,
        adsFreq: users.adsFreq,
        adsterraBannerCode: users.adsterraBannerCode,
        adsterraDomainId: users.adsterraDomainId,
        adsterraPlacementId: users.adsterraPlacementId,
      });

    return c.json({ success: true, monetise: updated });
  })

  // ─── Follow user ─────────────────────────────────────────────
  .post("/:id/follow", async (c) => {
    const session = await getSession();
    if (!session) return c.json({ error: "Unauthorized" }, 401);

    const targetId = c.req.param("id");
    if (session.userId === targetId) {
      return c.json({ error: "Cannot follow yourself" }, 400);
    }

    const [existing] = await db
      .select({ id: follows.id })
      .from(follows)
      .where(and(eq(follows.followerId, session.userId), eq(follows.followingId, targetId)))
      .limit(1);

    if (existing) {
      // Unfollow
      await db.delete(follows).where(eq(follows.id, existing.id));
      return c.json({ following: false });
    } else {
      // Follow
      await db.insert(follows).values({
        followerId: session.userId,
        followingId: targetId,
      });

      await db.insert(notifications).values({
        userId: targetId,
        actorId: session.userId,
        type: "follow",
        content: `${session.username} started following you`,
      });

      return c.json({ following: true });
    }
  })

  // ─── Get followers ───────────────────────────────────────────
  .get("/:id/followers", async (c) => {
    const id = c.req.param("id");
    const offset = parseInt(c.req.query("offset") ?? "0");

    const followerList = await db
      .select({
        id: users.id,
        username: users.username,
        picture: users.picture,
        level: users.level,
        isOnline: ONLINE_WINDOW_SQL,
      })
      .from(follows)
      .leftJoin(users, eq(follows.followerId, users.id))
      .where(eq(follows.followingId, id))
      .limit(20)
      .offset(offset);

    return c.json({ followers: followerList });
  })

  // ─── Get following ───────────────────────────────────────────
  .get("/:id/following", async (c) => {
    const id = c.req.param("id");
    const offset = parseInt(c.req.query("offset") ?? "0");

    const followingList = await db
      .select({
        id: users.id,
        username: users.username,
        picture: users.picture,
        level: users.level,
        isOnline: ONLINE_WINDOW_SQL,
      })
      .from(follows)
      .leftJoin(users, eq(follows.followingId, users.id))
      .where(eq(follows.followerId, id))
      .limit(20)
      .offset(offset);

    return c.json({ following: followingList });
  })

  // ─── Search users ─────────────────────────────────────────────
  .get("/", async (c) => {
    const session = await getSession();
    const q = c.req.query("q") ?? "";
    const offset = parseInt(c.req.query("offset") ?? "0");
    const filter = (c.req.query("filter") ?? "all").toLowerCase();
    const limit = 20;

    const whereConditions = [
      q ? ilike(users.username, `%${q}%`) : undefined,
      session?.userId ? ne(users.id, session.userId) : undefined,
      ne(users.username, GUEST_AI_USERNAME),
      ne(users.email, GUEST_AI_EMAIL),
      filter === "online" ? ONLINE_WINDOW_SQL : undefined,
      filter === "following" && session?.userId
        ? exists(
            db
              .select({ id: follows.id })
              .from(follows)
              .where(and(eq(follows.followerId, session.userId), eq(follows.followingId, users.id)))
          )
        : undefined,
    ].filter(Boolean);

    const result = await db
      .select({
        id: users.id,
        username: users.username,
        picture: users.picture,
        level: users.level,
        isOnline: ONLINE_WINDOW_SQL,
        points: users.points,
      })
      .from(users)
      .where(whereConditions.length ? and(...whereConditions) : undefined)
      .orderBy(desc(users.points))
      .limit(limit)
      .offset(offset);

    if (!session?.userId || result.length === 0) {
      return c.json({
        hasMore: result.length === limit,
        users: result.map((user) => ({
          ...user,
          isFollowing: false,
        })),
      });
    }

    const userIds = result.map((user) => user.id);
    const followingRows = await db
      .select({ followingId: follows.followingId })
      .from(follows)
      .where(
        and(
          eq(follows.followerId, session.userId),
          inArray(follows.followingId, userIds),
        ),
      );

    const followingSet = new Set(followingRows.map((row) => row.followingId));

    return c.json({
      hasMore: result.length === limit,
      users: result.map((user) => ({
        ...user,
        isFollowing: followingSet.has(user.id),
      })),
    });
  })

  // ─── Update online status ────────────────────────────────────
  .post("/:id/online", async (c) => {
    const session = await getSession();
    if (!session || session.userId !== c.req.param("id")) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    await db
      .update(users)
      .set({ isOnline: true, lastSeen: new Date() })
      .where(eq(users.id, session.userId));
    return c.json({ success: true });
  });
