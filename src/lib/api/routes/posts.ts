import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { db } from "@/lib/db";
import { posts, likes, comments, notifications, users, follows } from "@/lib/db/schema";
import { eq, desc, sql, and, or, ilike, asc, isNull } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { getPostTypeCost, getUserLevel } from "@/lib/utils";
import { fetchLinkPreviewFromText } from "@/lib/linkPreview";
import { slugifyPostText } from "@/lib/postUrls";
import { getPointCostSettings, getPointRewardSettings } from "@/lib/websiteSettings";

function pickPostHeadline(post: {
  blogTitle?: string | null;
  productName?: string | null;
  singer?: string | null;
  filename?: string | null;
  bookTitle?: string | null;
  generalPost?: string | null;
  postDescription?: string | null;
  advertTitle?: string | null;
  linkTitle?: string | null;
}) {
  return (
    post.blogTitle ||
    post.productName ||
    post.filename ||
    post.singer ||
    post.bookTitle ||
    post.advertTitle ||
    post.linkTitle ||
    post.generalPost ||
    post.postDescription ||
    "post"
  );
}

const createPostSchemaBase = z.object({
  postType: z.enum(["general", "song", "video", "photo", "app", "book", "document", "product", "advert", "blog"]),
  privacy: z.enum(["public", "private", "friends"]).default("public"),
  fileUrl: z.string().optional(),
  galleryUrls: z.array(z.string()).optional(),
  filename: z.string().optional(),
  thumbnailUrl: z.string().optional(),
  storageKey: z.string().optional(),
  generalPost: z.string().optional(),
  postDescription: z.string().optional(),
  // Song
  singer: z.string().optional(),
  songType: z.string().optional(),
  albumCover: z.string().optional(),
  // Blog
  blogTitle: z.string().optional(),
  blogContent: z.string().optional(),
  // Product
  productName: z.string().optional(),
  productType: z.string().optional(),
  productPrice: z.string().optional(),
  // App
  appType: z.string().optional(),
  appCategory: z.string().optional(),
  appDeveloper: z.string().optional(),
  appVersion: z.string().optional(),
  // Book
  bookTitle: z.string().optional(),
  author: z.string().optional(),
  bookCategory: z.string().optional(),
  // Advert
  advertTitle: z.string().optional(),
  advertUrl: z.string().optional(),
  // File metadata
  fileResourceType: z.string().optional(),
});

const createPostSchema = createPostSchemaBase.superRefine((data, ctx) => {
  const hasText = (value?: string) => Boolean(value?.trim());
  const hasSingleFile = hasText(data.fileUrl);
  const hasGallery = (data.galleryUrls?.length ?? 0) > 0;

  switch (data.postType) {
    case "general":
      if (!hasText(data.generalPost) && !hasSingleFile && !hasGallery) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "General posts must include text or at least one image.",
          path: ["generalPost"],
        });
      }
      break;
    case "song":
      if (!hasSingleFile) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Song posts require an audio file.",
          path: ["fileUrl"],
        });
      }
      if (!hasText(data.filename)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Song title is required.",
          path: ["filename"],
        });
      }
      if (!hasText(data.singer)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Singer / artist is required.",
          path: ["singer"],
        });
      }
      if (!hasText(data.albumCover)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Song posts require cover art.",
          path: ["albumCover"],
        });
      }
      break;
    case "video":
      if (!hasSingleFile) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Video posts require a video file.",
          path: ["fileUrl"],
        });
      }
      break;
    case "app":
      if (!hasSingleFile) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "App posts require an app file.",
          path: ["fileUrl"],
        });
      }
      if (!hasText(data.filename)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "App name is required.",
          path: ["filename"],
        });
      }
      break;
    case "book":
      if (!hasSingleFile) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Book posts require a file.",
          path: ["fileUrl"],
        });
      }
      if (!hasText(data.bookTitle)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Book title is required.",
          path: ["bookTitle"],
        });
      }
      break;
    case "product":
      if (!hasSingleFile && !hasGallery) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Product posts require at least one image.",
          path: ["fileUrl"],
        });
      }
      if (!hasText(data.productName)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Product name is required.",
          path: ["productName"],
        });
      }
      break;
    case "advert":
      if (!hasSingleFile && !hasText(data.postDescription) && !hasText(data.advertTitle)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Adverts need media or a description.",
          path: ["postDescription"],
        });
      }
      break;
    case "blog":
      if (!hasText(data.blogTitle) || !hasText(data.blogContent)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Blog posts require a title and content.",
          path: ["blogContent"],
        });
      }
      break;
    case "photo":
    case "document":
      if (!hasSingleFile) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "A file is required for this post type.",
          path: ["fileUrl"],
        });
      }
      break;
  }
});

const updatePostSchema = createPostSchemaBase.partial().omit({ postType: true, fileResourceType: true });
const updateCommentSchema = z.object({ content: z.string().min(1).max(1000) });
const ADVERT_DURATION_DAYS = 30;

async function incrementPostViews(postId: string) {
  await db
    .update(posts)
    .set({ views: sql`${posts.views} + 1` })
    .where(eq(posts.id, postId));
}

function getAdvertActiveWhereClause() {
  return or(
    sql`${posts.postType} <> 'advert'`,
    and(
      eq(posts.postType, "advert"),
      sql`COALESCE(${posts.advertExpiresAt}, ${posts.createdAt} + INTERVAL '30 days') >= NOW()`
    )
  )!;
}

async function getConfiguredPostTypeCost(postType: string) {
  const costs = await getPointCostSettings();

  switch (postType) {
    case "song":
      return costs.cost_song_post;
    case "video":
      return costs.cost_video_post;
    case "book":
      return costs.cost_book_post;
    case "document":
      return costs.cost_document_post;
    case "product":
      return costs.cost_product_post;
    case "advert":
      return costs.cost_advert_post;
    default:
      return costs.cost_general_post;
  }
}

async function addPointsToUser(userId: string, points: number) {
  if (!points) return;

  const [user] = await db
    .select({ points: users.points })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  const currentPoints = parseFloat(String(user?.points ?? 0));
  const nextPoints = currentPoints + points;
  const nextLevel = getUserLevel(nextPoints);

  await db
    .update(users)
    .set({
      points: String(nextPoints),
      level: nextLevel as typeof users.level._.data,
    })
    .where(eq(users.id, userId));
}

async function getUserPoints(userId: string) {
  const [user] = await db
    .select({ points: users.points })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  return parseFloat(String(user?.points ?? 0));
}

export const postsRouter = new Hono()
  .get("/points-config", async (c) => {
    const [costs, rewards] = await Promise.all([getPointCostSettings(), getPointRewardSettings()]);
    return c.json({ costs, rewards });
  })

  // ─── Get posts feed ─────────────────────────────────────────
  .get("/", async (c) => {
    const session = await getSession();
    const url = new URL(c.req.url);
    const limit = parseInt(url.searchParams.get("limit") ?? "15");
    const offset = parseInt(url.searchParams.get("offset") ?? "0");
    const postType = url.searchParams.get("type");
    const productCategory = url.searchParams.get("category")?.trim();
    const rawSearch = url.searchParams.get("q");
    const search = rawSearch?.trim();
    const userId = url.searchParams.get("userId");
    const postId = url.searchParams.get("postId");
    const order = url.searchParams.get("order") ?? "latest";
    const seed = url.searchParams.get("seed") ?? "sagetech";
    const lightweight = url.searchParams.get("lightweight") === "1";
    const exactSearch = search?.toLowerCase() ?? "";
    const prefixSearch = `${search ?? ""}%`;
    const fuzzySearch = `%${search ?? ""}%`;

    const visibilityCondition = session?.userId
      ? or(
          eq(posts.privacy, "public"),
          eq(posts.userId, session.userId),
          and(
            eq(posts.privacy, "friends"),
            sql`EXISTS (
              SELECT 1
              FROM follows
              WHERE follows.follower_id = ${session.userId}
                AND follows.following_id = ${posts.userId}
            )`
          )
        )
      : eq(posts.privacy, "public");

    const conditions = [eq(posts.approved, true), visibilityCondition, getAdvertActiveWhereClause()];

    if (postType && postType !== "all") {
      if (postType === "video") {
        conditions.push(eq(posts.fileType, "video"));
        conditions.push(ilike(posts.fileUrl, "%.mp4%"));
      } else if (postType === "song") {
        conditions.push(eq(posts.fileType, "audio"));
      } else if (postType === "photo") {
        conditions.push(eq(posts.fileType, "image"));
      } else {
        conditions.push(eq(posts.postType, postType as typeof posts.postType._.data));
      }
    }
    if (productCategory) {
      conditions.push(eq(posts.productType, productCategory));
    }
    if (userId) {
      conditions.push(eq(posts.userId, userId));
    }
    if (postId) {
      conditions.push(eq(posts.id, postId));
    }
    if (search) {
      conditions.push(
        or(
          ilike(posts.generalPost, fuzzySearch),
          ilike(posts.postDescription, fuzzySearch),
          ilike(posts.blogTitle, fuzzySearch),
          ilike(posts.blogContent, fuzzySearch),
          ilike(posts.singer, fuzzySearch),
          ilike(posts.productName, fuzzySearch),
          ilike(posts.productType, fuzzySearch),
          ilike(posts.author, fuzzySearch),
          ilike(posts.bookTitle, fuzzySearch),
          ilike(posts.appDeveloper, fuzzySearch),
          ilike(posts.filename, fuzzySearch),
          ilike(posts.advertTitle, fuzzySearch),
          ilike(users.username, fuzzySearch)
        )!
      );
    }

    const searchRank = search
      ? sql<number>`(
          CASE WHEN lower(coalesce(${posts.blogTitle}, '')) = ${exactSearch} THEN 180 ELSE 0 END +
          CASE WHEN lower(coalesce(${posts.productName}, '')) = ${exactSearch} THEN 170 ELSE 0 END +
          CASE WHEN lower(coalesce(${posts.bookTitle}, '')) = ${exactSearch} THEN 170 ELSE 0 END +
          CASE WHEN lower(coalesce(${posts.filename}, '')) = ${exactSearch} THEN 160 ELSE 0 END +
          CASE WHEN lower(coalesce(${users.username}, '')) = ${exactSearch} THEN 150 ELSE 0 END +
          CASE WHEN lower(coalesce(${posts.generalPost}, '')) = ${exactSearch} THEN 140 ELSE 0 END +
          CASE WHEN lower(coalesce(${posts.postDescription}, '')) = ${exactSearch} THEN 120 ELSE 0 END +
          CASE WHEN lower(coalesce(${posts.blogTitle}, '')) LIKE lower(${prefixSearch}) THEN 90 ELSE 0 END +
          CASE WHEN lower(coalesce(${posts.productName}, '')) LIKE lower(${prefixSearch}) THEN 85 ELSE 0 END +
          CASE WHEN lower(coalesce(${posts.bookTitle}, '')) LIKE lower(${prefixSearch}) THEN 85 ELSE 0 END +
          CASE WHEN lower(coalesce(${users.username}, '')) LIKE lower(${prefixSearch}) THEN 80 ELSE 0 END +
          CASE WHEN lower(coalesce(${posts.generalPost}, '')) LIKE lower(${prefixSearch}) THEN 60 ELSE 0 END +
          CASE WHEN lower(coalesce(${posts.postDescription}, '')) LIKE lower(${prefixSearch}) THEN 45 ELSE 0 END +
          CASE WHEN lower(coalesce(${posts.blogContent}, '')) LIKE lower(${fuzzySearch}) THEN 28 ELSE 0 END +
          CASE WHEN lower(coalesce(${posts.generalPost}, '')) LIKE lower(${fuzzySearch}) THEN 25 ELSE 0 END +
          CASE WHEN lower(coalesce(${posts.postDescription}, '')) LIKE lower(${fuzzySearch}) THEN 20 ELSE 0 END +
          CASE WHEN lower(coalesce(${posts.singer}, '')) LIKE lower(${fuzzySearch}) THEN 18 ELSE 0 END +
          CASE WHEN lower(coalesce(${posts.author}, '')) LIKE lower(${fuzzySearch}) THEN 18 ELSE 0 END +
          CASE WHEN lower(coalesce(${posts.appDeveloper}, '')) LIKE lower(${fuzzySearch}) THEN 18 ELSE 0 END +
          CASE WHEN lower(coalesce(${posts.advertTitle}, '')) LIKE lower(${fuzzySearch}) THEN 16 ELSE 0 END +
          CASE WHEN lower(coalesce(${posts.productType}, '')) LIKE lower(${fuzzySearch}) THEN 14 ELSE 0 END
        )`
      : null;

    const orderBy =
      search && searchRank
        ? [desc(searchRank), desc(posts.views), desc(posts.createdAt)]
        : order === "random"
        ? [
            sql`CASE
              WHEN ${posts.createdAt} >= NOW() - INTERVAL '1 day' THEN 0
              WHEN ${posts.createdAt} >= NOW() - INTERVAL '7 days' THEN 1
              WHEN ${posts.createdAt} >= NOW() - INTERVAL '30 days' THEN 2
              ELSE 3
            END`,
            sql`md5(${posts.id}::text || ${seed})`,
            desc(posts.createdAt),
          ]
        : [desc(posts.createdAt)];

    const feedPosts = await db
      .select({
        id: posts.id,
        postType: posts.postType,
        slug: posts.slug,
        fileType: posts.fileType,
        privacy: posts.privacy,
        fileUrl: posts.fileUrl,
        filename: posts.filename,
        thumbnailUrl: posts.thumbnailUrl,
        generalPost: posts.generalPost,
        postDescription: posts.postDescription,
        linkUrl: posts.linkUrl,
        linkTitle: posts.linkTitle,
        linkDescription: posts.linkDescription,
        linkImage: posts.linkImage,
        singer: posts.singer,
        songType: posts.songType,
        albumCover: posts.albumCover,
        blogTitle: posts.blogTitle,
        blogContent: posts.blogContent,
        productName: posts.productName,
        productType: posts.productType,
        productPrice: posts.productPrice,
        appType: posts.appType,
        appCategory: posts.appCategory,
        appDeveloper: posts.appDeveloper,
        bookTitle: posts.bookTitle,
        author: posts.author,
        bookCategory: posts.bookCategory,
        advertTitle: posts.advertTitle,
        advertUrl: posts.advertUrl,
        advertClicks: posts.advertClicks,
        advertExpiresAt: posts.advertExpiresAt,
        views: posts.views,
        likesCount: posts.likesCount,
        commentsCount: posts.commentsCount,
        downloadsCount: posts.downloadsCount,
        createdAt: posts.createdAt,
        userId: posts.userId,
        username: users.username,
        userPicture: users.picture,
        userLevel: users.level,
      })
      .from(posts)
      .leftJoin(users, eq(posts.userId, users.id))
      .where(and(...conditions))
      .orderBy(...orderBy)
      .limit(limit)
      .offset(offset);

    if (lightweight) {
      return c.json({
        posts: feedPosts.map((post) => ({
          ...post,
          likedByMe: false,
          isFollowingAuthor: false,
        })),
      });
    }

    // Add "liked by me" flag
    const result = await Promise.all(
      feedPosts.map(async (post) => {
        let likedByMe = false;
        let isFollowingAuthor = false;
        if (session?.userId) {
          const [like] = await db
            .select({ id: likes.id })
            .from(likes)
            .where(and(eq(likes.postId, post.id), eq(likes.userId, session.userId)))
            .limit(1);
          likedByMe = !!like;

          if (post.userId !== session.userId) {
            const [follow] = await db
              .select({ id: follows.id })
              .from(follows)
              .where(and(eq(follows.followerId, session.userId), eq(follows.followingId, post.userId)))
              .limit(1);
            isFollowingAuthor = !!follow;
          }
        }
        return { ...post, likedByMe, isFollowingAuthor };
      })
    );

    return c.json({ posts: result });
  })

  // ─── Get single post ─────────────────────────────────────────
  .get("/adverts/manage", async (c) => {
    const session = await getSession();
    if (!session) return c.json({ error: "Unauthorized" }, 401);

    const url = new URL(c.req.url);
    const limit = parseInt(url.searchParams.get("limit") ?? "8");
    const offset = parseInt(url.searchParams.get("offset") ?? "0");

    const adverts = await db
      .select({
        id: posts.id,
        slug: posts.slug,
        advertTitle: posts.advertTitle,
        advertUrl: posts.advertUrl,
        postDescription: posts.postDescription,
        fileUrl: posts.fileUrl,
        fileType: posts.fileType,
        views: posts.views,
        advertClicks: posts.advertClicks,
        likesCount: posts.likesCount,
        commentsCount: posts.commentsCount,
        approved: posts.approved,
        createdAt: posts.createdAt,
        updatedAt: posts.updatedAt,
        advertExpiresAt: posts.advertExpiresAt,
      })
      .from(posts)
      .where(and(eq(posts.userId, session.userId), eq(posts.postType, "advert")))
      .orderBy(desc(posts.createdAt))
      .limit(limit)
      .offset(offset);

    const [totals] = await db
      .select({
        total: sql<number>`count(*)::int`,
      })
      .from(posts)
      .where(and(eq(posts.userId, session.userId), eq(posts.postType, "advert")));

    const [me] = await db
      .select({ points: users.points })
      .from(users)
      .where(eq(users.id, session.userId))
      .limit(1);

    return c.json({
      adverts,
      totalCount: Number(totals?.total ?? 0),
      availablePoints: parseFloat(String(me?.points ?? 0)),
      renewCost: await getConfiguredPostTypeCost("advert"),
      advertDurationDays: ADVERT_DURATION_DAYS,
    });
  })

  .get("/:id", async (c) => {
    const id = c.req.param("id");
    const [post] = await db
      .select()
      .from(posts)
      .leftJoin(users, eq(posts.userId, users.id))
      .where(eq(posts.id, id))
      .limit(1);

    if (!post) return c.json({ error: "Post not found" }, 404);

    // Increment views
    await incrementPostViews(id);

    return c.json({ post });
  })

  // ─── Create post ─────────────────────────────────────────────
  .post("/:id/view", async (c) => {
    const id = c.req.param("id");
    await incrementPostViews(id);

    return c.json({ success: true });
  })

  .post("/:id/share", async (c) => {
    const id = c.req.param("id");
    await incrementPostViews(id);
    return c.json({ success: true });
  })

  .post("/:id/advert-click", async (c) => {
    const id = c.req.param("id");
    await db
      .update(posts)
      .set({ advertClicks: sql`${posts.advertClicks} + 1` })
      .where(and(eq(posts.id, id), eq(posts.postType, "advert")));

    return c.json({ success: true });
  })

  .post("/:id/advert-renew", async (c) => {
    const session = await getSession();
    if (!session) return c.json({ error: "Unauthorized" }, 401);

    const id = c.req.param("id");
    const [post] = await db
      .select({
        id: posts.id,
        userId: posts.userId,
        postType: posts.postType,
        advertExpiresAt: posts.advertExpiresAt,
        createdAt: posts.createdAt,
      })
      .from(posts)
      .where(eq(posts.id, id))
      .limit(1);

    if (!post || post.postType !== "advert") return c.json({ error: "Advert not found" }, 404);
    if (post.userId !== session.userId) return c.json({ error: "Forbidden" }, 403);

    const effectiveExpiry = post.advertExpiresAt
      ? new Date(post.advertExpiresAt)
      : new Date(new Date(post.createdAt ?? Date.now()).getTime() + ADVERT_DURATION_DAYS * 24 * 60 * 60 * 1000);

    const isStillActive = effectiveExpiry.getTime() > Date.now();

    if (isStillActive) {
      return c.json({ error: "This advert is still active." }, 400);
    }

    const cost = await getConfiguredPostTypeCost("advert");
    const [user] = await db
      .select({ points: users.points })
      .from(users)
      .where(eq(users.id, session.userId))
      .limit(1);

    const currentPoints = parseFloat(String(user?.points ?? 0));
    if (currentPoints < cost) {
      return c.json({ error: `Insufficient points. You need ${cost} pts to renew this advert.` }, 400);
    }

    const nextPoints = currentPoints - cost;
    const nextLevel = getUserLevel(nextPoints);

    await db
      .update(users)
      .set({ points: String(nextPoints), level: nextLevel as typeof users.level._.data })
      .where(eq(users.id, session.userId));

    const [renewed] = await db
      .update(posts)
      .set({
        approved: true,
        advertExpiresAt: sql`NOW() + INTERVAL '30 days'`,
        updatedAt: new Date(),
      })
      .where(eq(posts.id, id))
      .returning({
        advertExpiresAt: posts.advertExpiresAt,
      });

    return c.json({
      success: true,
      advertExpiresAt: renewed?.advertExpiresAt ?? null,
      availablePoints: nextPoints,
      renewCost: cost,
    });
  })

  .post("/", zValidator("json", createPostSchema), async (c) => {
    const session = await getSession();
    if (!session) return c.json({ error: "Unauthorized" }, 401);

    const data = c.req.valid("json");
    const cost = await getConfiguredPostTypeCost(data.postType);

    // Check and deduct points if cost > 0
    if (cost > 0) {
      const [user] = await db
        .select({ points: users.points })
        .from(users)
        .where(eq(users.id, session.userId))
        .limit(1);

      const currentPoints = parseFloat(String(user?.points ?? 0));
      if (currentPoints < cost) {
        return c.json({ error: `Insufficient points. You need ${cost} pts to post this.` }, 400);
      }

      const newPoints = currentPoints - cost;
      const newLevel = getUserLevel(newPoints);
      await db
        .update(users)
        .set({ points: String(newPoints), level: newLevel as typeof users.level._.data })
        .where(eq(users.id, session.userId));
    }

    // Auto-derive fileType from postType + resource_type
    const deriveFileType = (
      postType: string,
      fileUrl?: string,
      resourceType?: string,
      galleryUrls?: string[]
    ): "image" | "video" | "audio" | "document" | "none" => {
      if (postType === "song") return "audio";
      if (postType === "video") return "video";
      if (postType === "photo") return "image";
      if (postType === "app" || postType === "book" || postType === "document") return "document";
      if ((galleryUrls?.length ?? 0) > 1) return "image";
      if (fileUrl) {
        if (resourceType === "video") return "video";
        return "image";
      }
      return "none";
    };
    const resolvedFileUrl =
      (data.galleryUrls?.length ?? 0) > 0
        ? JSON.stringify(data.galleryUrls)
        : data.fileUrl;
    const fileType = deriveFileType(data.postType, resolvedFileUrl, data.fileResourceType, data.galleryUrls);
    const linkPreview =
      data.postType === "general" && !resolvedFileUrl
        ? await fetchLinkPreviewFromText(data.generalPost)
        : null;

    // Auto-approve quick social content so it appears immediately in the app.
      const autoApprove =
        data.postType === "general" ||
        data.postType === "blog" ||
        data.postType === "song" ||
        data.postType === "video" ||
        data.postType === "product" ||
        data.postType === "document" ||
        data.postType === "advert";

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { fileResourceType: _frt, galleryUrls: _galleryUrls, ...postData } = data;
    const stableSlug = slugifyPostText(
      pickPostHeadline({
        ...data,
        generalPost: data.generalPost,
        postDescription: data.postDescription,
        filename: data.filename,
        singer: data.singer,
        blogTitle: data.blogTitle,
        productName: data.productName,
        bookTitle: data.bookTitle,
        advertTitle: data.advertTitle,
        linkTitle: linkPreview?.title,
      })
    );

    const [newPost] = await db
      .insert(posts)
      .values({
        userId: session.userId,
        ...postData,
        slug: stableSlug,
        fileUrl: resolvedFileUrl,
        fileType,
        linkUrl: linkPreview?.url,
        linkTitle: linkPreview?.title,
        linkDescription: linkPreview?.description,
        linkImage: linkPreview?.image,
        productPrice: postData.productPrice ? postData.productPrice : undefined,
        advertExpiresAt: data.postType === "advert" ? sql`NOW() + INTERVAL '30 days'` : undefined,
        approved: autoApprove,
      })
      .returning();

    if (newPost.approved && newPost.privacy === "public") {
      const followerRows = await db
        .select({ userId: follows.followerId })
        .from(follows)
        .where(eq(follows.followingId, session.userId));

      if (followerRows.length > 0) {
        await db.insert(notifications).values(
          followerRows.map((row) => ({
            userId: row.userId,
            actorId: session.userId,
            type: "system" as const,
            content: `${session.username} shared a new ${data.postType} post`,
            postId: newPost.id,
          }))
        );
      }
    }

    const pointSettings = await getPointRewardSettings();
    await addPointsToUser(session.userId, pointSettings.points_post_create_reward);

    const availablePoints = await getUserPoints(session.userId);
    return c.json({ success: true, post: newPost, availablePoints }, 201);
  })

  // ─── Delete post ─────────────────────────────────────────────
  .delete("/:id", async (c) => {
    const session = await getSession();

    const id = c.req.param("id");
    const [post] = await db
      .select({
        id: posts.id,
        postType: posts.postType,
        userId: posts.userId,
        slug: posts.slug,
        blogTitle: posts.blogTitle,
        productName: posts.productName,
        singer: posts.singer,
        filename: posts.filename,
        bookTitle: posts.bookTitle,
        generalPost: posts.generalPost,
        postDescription: posts.postDescription,
        advertTitle: posts.advertTitle,
        linkTitle: posts.linkTitle,
      })
      .from(posts)
      .where(eq(posts.id, id))
      .limit(1);

    if (!post) return c.json({ error: "Post not found" }, 404);
    if (post.postType !== "guest_ai") {
      if (!session) return c.json({ error: "Unauthorized" }, 401);
      if (post.userId !== session.userId) return c.json({ error: "Forbidden" }, 403);
    }

    await db.delete(posts).where(eq(posts.id, id));
    return c.json({ success: true });
  })

  // Update post
  .patch("/:id", zValidator("json", updatePostSchema), async (c) => {
    const session = await getSession();
    if (!session) return c.json({ error: "Unauthorized" }, 401);

    const id = c.req.param("id");
    const [post] = await db
      .select({
        userId: posts.userId,
        slug: posts.slug,
        blogTitle: posts.blogTitle,
        productName: posts.productName,
        singer: posts.singer,
        filename: posts.filename,
        bookTitle: posts.bookTitle,
        generalPost: posts.generalPost,
        postDescription: posts.postDescription,
        advertTitle: posts.advertTitle,
        linkTitle: posts.linkTitle,
      })
      .from(posts)
      .where(eq(posts.id, id))
      .limit(1);

    if (!post) return c.json({ error: "Post not found" }, 404);
    if (post.userId !== session.userId) return c.json({ error: "Forbidden" }, 403);

    const data = c.req.valid("json");
    const cleaned = Object.fromEntries(Object.entries(data).filter(([, value]) => value !== undefined));
    if (Object.keys(cleaned).length === 0) return c.json({ error: "No changes provided" }, 400);

    const nextSlug = post.slug?.trim()
      ? undefined
      : slugifyPostText(
          pickPostHeadline({
            blogTitle: post.blogTitle,
            productName: post.productName,
            singer: post.singer,
            filename: post.filename,
            bookTitle: post.bookTitle,
            generalPost: post.generalPost,
            postDescription: post.postDescription,
            advertTitle: post.advertTitle,
            linkTitle: post.linkTitle,
          })
        );

    const [updatedPost] = await db
      .update(posts)
      .set({ ...cleaned, ...(nextSlug ? { slug: nextSlug } : {}), updatedAt: new Date() })
      .where(eq(posts.id, id))
      .returning();

    return c.json({ success: true, post: updatedPost });
  })

  // ─── Like post ───────────────────────────────────────────────
  .post("/:id/like", async (c) => {
    const session = await getSession();
    if (!session) return c.json({ error: "Unauthorized" }, 401);

    const postId = c.req.param("id");
    const [targetPost] = await db
      .select({ id: posts.id, postType: posts.postType, userId: posts.userId })
      .from(posts)
      .where(eq(posts.id, postId))
      .limit(1);

    if (!targetPost) return c.json({ error: "Post not found" }, 404);
    if (targetPost.postType === "guest_ai") return c.json({ error: "Guest AI posts are view-only." }, 400);

    const [existing] = await db
      .select({ id: likes.id })
      .from(likes)
      .where(and(eq(likes.postId, postId), eq(likes.userId, session.userId)))
      .limit(1);

    if (existing) {
      // Unlike
      await db.delete(likes).where(eq(likes.id, existing.id));
      await db
        .update(posts)
        .set({ likesCount: sql`GREATEST(${posts.likesCount} - 1, 0)` })
        .where(eq(posts.id, postId));
      return c.json({ liked: false });
    } else {
      // Like
      await db.insert(likes).values({ userId: session.userId, postId });
      await db
        .update(posts)
        .set({ likesCount: sql`${posts.likesCount} + 1` })
        .where(eq(posts.id, postId));

      // Notify post owner
      if (targetPost && targetPost.userId !== session.userId) {
        await db.insert(notifications).values({
          userId: targetPost.userId,
          actorId: session.userId,
          type: "like",
          content: `${session.username} liked your post`,
          postId,
        });
        const pointSettings = await getPointRewardSettings();
        await addPointsToUser(session.userId, pointSettings.points_like_reward);
      }

      return c.json({ liked: true });
    }
  })

  // ─── Get comments ─────────────────────────────────────────────
  .get("/:id/comments", async (c) => {
    const postId = c.req.param("id");
    const offset = parseInt(c.req.query("offset") ?? "0");
    const parentId = c.req.query("parentId");
    const baseCondition = and(
      eq(comments.postId, postId),
      parentId ? eq(comments.parentId, parentId) : isNull(comments.parentId)
    );

    const [total] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(comments)
      .where(baseCondition);
    const [threadTotal] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(comments)
      .where(eq(comments.postId, postId));

    const postComments = await db
      .select({
        id: comments.id,
        content: comments.content,
        likesCount: comments.likesCount,
        parentId: comments.parentId,
        createdAt: comments.createdAt,
        userId: comments.userId,
        username: users.username,
        userPicture: users.picture,
        repliesCount: parentId
          ? sql<number>`0`
          : sql<number>`(
              SELECT COUNT(*)
              FROM comments AS reply_comments
              WHERE reply_comments.parent_id = ${comments.id}
            )`,
      })
      .from(comments)
      .leftJoin(users, eq(comments.userId, users.id))
      .where(baseCondition)
      .orderBy(asc(comments.createdAt))
      .limit(20)
      .offset(offset);

    return c.json({
      comments: postComments,
      totalCount: Number(total?.count ?? 0),
      threadTotalCount: Number(threadTotal?.count ?? 0),
    });
  })

  // ─── Add comment ─────────────────────────────────────────────
  .post(
    "/:id/comments",
    zValidator("json", z.object({ content: z.string().min(1).max(1000), parentId: z.string().optional() })),
    async (c) => {
      const session = await getSession();
      if (!session) return c.json({ error: "Unauthorized" }, 401);

      const postId = c.req.param("id");
      const { content, parentId } = c.req.valid("json");

      const [targetPost] = await db
        .select({ id: posts.id, postType: posts.postType, userId: posts.userId })
        .from(posts)
        .where(eq(posts.id, postId))
        .limit(1);

      if (!targetPost) return c.json({ error: "Post not found" }, 404);
      if (targetPost.postType === "guest_ai") return c.json({ error: "Guest AI posts are view-only." }, 400);

      const [comment] = await db
        .insert(comments)
        .values({ postId, userId: session.userId, content, parentId })
        .returning();

      await db
        .update(posts)
        .set({ commentsCount: sql`${posts.commentsCount} + 1` })
        .where(eq(posts.id, postId));

      // Notify post owner
      if (targetPost && targetPost.userId !== session.userId) {
        await db.insert(notifications).values({
          userId: targetPost.userId,
          actorId: session.userId,
          type: "comment",
          content: `${session.username} commented on your post`,
          postId,
        });
        const pointSettings = await getPointRewardSettings();
        await addPointsToUser(
          session.userId,
          parentId ? pointSettings.points_reply_reward : pointSettings.points_comment_reward
        );
      }

      return c.json({ success: true, comment }, 201);
    }
  )

  // ─── Delete comment ──────────────────────────────────────────
  .delete("/:id/comments/:commentId", async (c) => {
    const session = await getSession();
    if (!session) return c.json({ error: "Unauthorized" }, 401);

    const commentId = c.req.param("commentId");
    const postId = c.req.param("id");

    const [comment] = await db
      .select({ userId: comments.userId })
      .from(comments)
      .where(eq(comments.id, commentId))
      .limit(1);

    if (!comment) return c.json({ error: "Comment not found" }, 404);
    if (comment.userId !== session.userId) return c.json({ error: "Forbidden" }, 403);

    await db.delete(comments).where(eq(comments.id, commentId));
    await db
      .update(posts)
      .set({ commentsCount: sql`GREATEST(${posts.commentsCount} - 1, 0)` })
      .where(eq(posts.id, postId));

    return c.json({ success: true });
  })

  // Update comment / reply
  .patch("/:id/comments/:commentId", zValidator("json", updateCommentSchema), async (c) => {
    const session = await getSession();
    if (!session) return c.json({ error: "Unauthorized" }, 401);

    const commentId = c.req.param("commentId");
    const { content } = c.req.valid("json");

    const [comment] = await db
      .select({ userId: comments.userId })
      .from(comments)
      .where(eq(comments.id, commentId))
      .limit(1);

    if (!comment) return c.json({ error: "Comment not found" }, 404);
    if (comment.userId !== session.userId) return c.json({ error: "Forbidden" }, 403);

    const [updatedComment] = await db
      .update(comments)
      .set({ content, updatedAt: new Date() })
      .where(eq(comments.id, commentId))
      .returning();

    return c.json({ success: true, comment: updatedComment });
  })

  // ─── Like / Unlike comment ───────────────────────────────────
  .post("/:id/comments/:commentId/like", async (c) => {
    const session = await getSession();
    if (!session) return c.json({ error: "Unauthorized" }, 401);
    const commentId = c.req.param("commentId");

    const existing = await db
      .select({ id: likes.id })
      .from(likes)
      .where(and(eq(likes.userId, session.userId), eq(likes.commentId, commentId)))
      .limit(1);

    if (existing.length > 0) {
      await db.delete(likes).where(and(eq(likes.userId, session.userId), eq(likes.commentId, commentId)));
      await db.update(comments).set({ likesCount: sql`GREATEST(${comments.likesCount} - 1, 0)` }).where(eq(comments.id, commentId));
      const [updated] = await db.select({ likesCount: comments.likesCount }).from(comments).where(eq(comments.id, commentId)).limit(1);
      return c.json({ liked: false, likesCount: updated?.likesCount ?? 0 });
    } else {
      await db.insert(likes).values({ userId: session.userId, commentId });
      await db.update(comments).set({ likesCount: sql`${comments.likesCount} + 1` }).where(eq(comments.id, commentId));
      const [updated] = await db.select({ likesCount: comments.likesCount }).from(comments).where(eq(comments.id, commentId)).limit(1);
      return c.json({ liked: true, likesCount: updated?.likesCount ?? 0 });
    }
  })

  // ─── Track play (song play / video view) ────────────────────
  .post("/:id/play", async (c) => {
    const postId = c.req.param("id");
    await db
      .update(posts)
      .set({ views: sql`${posts.views} + 1` })
      .where(eq(posts.id, postId));
    return c.json({ success: true });
  })

  // ─── Track download ──────────────────────────────────────────
  .post("/:id/download", async (c) => {
    const session = await getSession();
    const postId = c.req.param("id");
    const [targetPost] = await db
      .select({ userId: posts.userId, postType: posts.postType })
      .from(posts)
      .where(eq(posts.id, postId))
      .limit(1);

    if (!targetPost) return c.json({ error: "Post not found" }, 404);

    await db
      .update(posts)
      .set({ downloadsCount: sql`${posts.downloadsCount} + 1` })
      .where(eq(posts.id, postId));

    if (
      session?.userId &&
      targetPost.postType !== "guest_ai" &&
      targetPost.userId !== session.userId
    ) {
      const pointSettings = await getPointRewardSettings();
      await addPointsToUser(session.userId, pointSettings.points_download_reward);
    }

    return c.json({ success: true });
  })

  // ─── Report post ─────────────────────────────────────────────
  .post(
    "/:id/report",
    zValidator("json", z.object({ reason: z.string().min(5) })),
    async (c) => {
      const session = await getSession();
      if (!session) return c.json({ error: "Unauthorized" }, 401);

      const postId = c.req.param("id");
      const { reason } = c.req.valid("json");

      const { reports } = await import("@/lib/db/schema");
      await db.insert(reports).values({ reporterId: session.userId, postId, reason });

      return c.json({ success: true });
    }
  );
