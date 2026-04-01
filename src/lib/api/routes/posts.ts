import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { db } from "@/lib/db";
import { posts, likes, comments, notifications, users, follows } from "@/lib/db/schema";
import { eq, desc, sql, and, or, ilike, asc, isNull } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { getPostTypeCost, getUserLevel } from "@/lib/utils";
import { fetchLinkPreviewFromText } from "@/lib/linkPreview";

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
      if (!hasText(data.singer)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Singer / artist is required.",
          path: ["singer"],
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
      if (!hasSingleFile) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Product posts require an image.",
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

async function incrementPostViews(postId: string) {
  await db
    .update(posts)
    .set({ views: sql`${posts.views} + 1` })
    .where(eq(posts.id, postId));
}

export const postsRouter = new Hono()

  // ─── Get posts feed ─────────────────────────────────────────
  .get("/", async (c) => {
    const session = await getSession();
    const url = new URL(c.req.url);
    const limit = parseInt(url.searchParams.get("limit") ?? "15");
    const offset = parseInt(url.searchParams.get("offset") ?? "0");
    const postType = url.searchParams.get("type");
    const search = url.searchParams.get("q");
    const userId = url.searchParams.get("userId");
    const postId = url.searchParams.get("postId");
    const order = url.searchParams.get("order") ?? "latest";
    const seed = url.searchParams.get("seed") ?? "sagetech";

    const conditions = [eq(posts.approved, true), eq(posts.privacy, "public")];

    if (postType && postType !== "all") {
      conditions.push(eq(posts.postType, postType as typeof posts.postType._.data));
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
          ilike(posts.generalPost, `%${search}%`),
          ilike(posts.postDescription, `%${search}%`),
          ilike(posts.blogTitle, `%${search}%`),
          ilike(posts.singer, `%${search}%`),
          ilike(posts.productName, `%${search}%`),
          ilike(posts.author, `%${search}%`),
          ilike(posts.bookTitle, `%${search}%`),
          ilike(posts.appDeveloper, `%${search}%`)
        )!
      );
    }

    const orderBy =
      order === "random"
        ? [
            sql`CASE
              WHEN ${posts.createdAt} >= NOW() - INTERVAL '1 day' THEN 0
              WHEN ${posts.createdAt} >= NOW() - INTERVAL '7 days' THEN 1
              WHEN ${posts.createdAt} >= NOW() - INTERVAL '30 days' THEN 2
              ELSE 3
            END`,
            desc(posts.createdAt),
            sql`md5(${posts.id}::text || ${seed})`,
          ]
        : [desc(posts.createdAt)];

    const feedPosts = await db
      .select({
        id: posts.id,
        postType: posts.postType,
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

  .post("/", zValidator("json", createPostSchema), async (c) => {
    const session = await getSession();
    if (!session) return c.json({ error: "Unauthorized" }, 401);

    const data = c.req.valid("json");
    const cost = getPostTypeCost(data.postType);

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

    // Auto-approve general posts, require approval for media
    const autoApprove = data.postType === "general" || data.postType === "blog";

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { fileResourceType: _frt, galleryUrls: _galleryUrls, ...postData } = data;
    const [newPost] = await db
      .insert(posts)
      .values({
        userId: session.userId,
        ...postData,
        fileUrl: resolvedFileUrl,
        fileType,
        linkUrl: linkPreview?.url,
        linkTitle: linkPreview?.title,
        linkDescription: linkPreview?.description,
        linkImage: linkPreview?.image,
        productPrice: postData.productPrice ? postData.productPrice : undefined,
        approved: autoApprove,
      })
      .returning();

    return c.json({ success: true, post: newPost }, 201);
  })

  // ─── Delete post ─────────────────────────────────────────────
  .delete("/:id", async (c) => {
    const session = await getSession();
    if (!session) return c.json({ error: "Unauthorized" }, 401);

    const id = c.req.param("id");
    const [post] = await db
      .select({ userId: posts.userId })
      .from(posts)
      .where(eq(posts.id, id))
      .limit(1);

    if (!post) return c.json({ error: "Post not found" }, 404);
    if (post.userId !== session.userId) return c.json({ error: "Forbidden" }, 403);

    await db.delete(posts).where(eq(posts.id, id));
    return c.json({ success: true });
  })

  // Update post
  .patch("/:id", zValidator("json", updatePostSchema), async (c) => {
    const session = await getSession();
    if (!session) return c.json({ error: "Unauthorized" }, 401);

    const id = c.req.param("id");
    const [post] = await db
      .select({ userId: posts.userId })
      .from(posts)
      .where(eq(posts.id, id))
      .limit(1);

    if (!post) return c.json({ error: "Post not found" }, 404);
    if (post.userId !== session.userId) return c.json({ error: "Forbidden" }, 403);

    const data = c.req.valid("json");
    const cleaned = Object.fromEntries(Object.entries(data).filter(([, value]) => value !== undefined));
    if (Object.keys(cleaned).length === 0) return c.json({ error: "No changes provided" }, 400);

    const [updatedPost] = await db
      .update(posts)
      .set({ ...cleaned, updatedAt: new Date() })
      .where(eq(posts.id, id))
      .returning();

    return c.json({ success: true, post: updatedPost });
  })

  // ─── Like post ───────────────────────────────────────────────
  .post("/:id/like", async (c) => {
    const session = await getSession();
    if (!session) return c.json({ error: "Unauthorized" }, 401);

    const postId = c.req.param("id");

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
      const [targetPost] = await db
        .select({ userId: posts.userId })
        .from(posts)
        .where(eq(posts.id, postId))
        .limit(1);

      if (targetPost && targetPost.userId !== session.userId) {
        await db.insert(notifications).values({
          userId: targetPost.userId,
          actorId: session.userId,
          type: "like",
          content: `${session.username} liked your post`,
          postId,
        });
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

      const [comment] = await db
        .insert(comments)
        .values({ postId, userId: session.userId, content, parentId })
        .returning();

      await db
        .update(posts)
        .set({ commentsCount: sql`${posts.commentsCount} + 1` })
        .where(eq(posts.id, postId));

      // Notify post owner
      const [targetPost] = await db
        .select({ userId: posts.userId })
        .from(posts)
        .where(eq(posts.id, postId))
        .limit(1);

      if (targetPost && targetPost.userId !== session.userId) {
        await db.insert(notifications).values({
          userId: targetPost.userId,
          actorId: session.userId,
          type: "comment",
          content: `${session.username} commented on your post`,
          postId,
        });
        // Award +0.02 pts for commenting on someone else's post
        await db
          .update(users)
          .set({ points: sql`${users.points} + 0.02` })
          .where(eq(users.id, session.userId));
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
    const postId = c.req.param("id");
    await db
      .update(posts)
      .set({ downloadsCount: sql`${posts.downloadsCount} + 1` })
      .where(eq(posts.id, postId));
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
