import { and, desc, eq, gte, ne, notInArray, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { posts, users } from "@/lib/db/schema";
import { getPrimaryMediaUrl } from "@/lib/postMedia";
import { getPostPath } from "@/lib/postUrls";

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
    post.singer ||
    post.filename ||
    post.bookTitle ||
    post.advertTitle ||
    post.linkTitle ||
    post.generalPost ||
    post.postDescription ||
    "post"
  );
}

export async function getPostById(id: string) {
  const [post] = await db
    .select({
      id: posts.id,
      postType: posts.postType,
      fileType: posts.fileType,
      privacy: posts.privacy,
      approved: posts.approved,
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
      userIsMonetised: users.isMonetised,
      userMonetiseProvider: users.monetiseProvider,
      userAdsterraBannerCode: users.adsterraBannerCode,
      userAdsterraApiToken: users.adsterraApiToken,
      userAdsterraDomainId: users.adsterraDomainId,
      userAdsterraPlacementId: users.adsterraPlacementId,
    })
    .from(posts)
    .leftJoin(users, eq(posts.userId, users.id))
    .where(eq(posts.id, id))
    .limit(1);

  return post ?? null;
}

export async function getVisiblePostById(id: string, currentUserId?: string | null) {
  const post = await getPostById(id);
  if (!post) return null;

  const isOwner = currentUserId === post.userId;
  const isPublicVisible = post.approved && post.privacy === "public";

  if (!isPublicVisible && !isOwner) return null;
  return post;
}

export function getPostSeo(post: NonNullable<Awaited<ReturnType<typeof getPostById>>>) {
  const titleBase = pickPostHeadline(post);
  const title = `${titleBase} | SageTech`;
  const description = (
    post.linkDescription ||
    post.postDescription ||
    post.generalPost ||
    post.blogContent ||
    (post.postType === "song" ? `Listen to ${post.singer ?? post.filename ?? "this song"} on SageTech.` : "") ||
    (post.postType === "video" ? `Watch this video on SageTech.` : "") ||
    (post.postType === "product" ? `View ${post.productName ?? "this product"} on SageTech.` : "") ||
    `View this ${post.postType} on SageTech.`
  ).slice(0, 180);

  const image = post.linkImage || getPrimaryMediaUrl(post.fileUrl) || post.thumbnailUrl || post.albumCover || "/files/sagetech_icon.jpg";

  return { title, description, image };
}

export async function getRelatedPostsByType(postId: string, postType: string, limit = 5) {
  const selectShape = {
    id: posts.id,
    postType: posts.postType,
    blogTitle: posts.blogTitle,
    blogContent: posts.blogContent,
    generalPost: posts.generalPost,
    postDescription: posts.postDescription,
    productName: posts.productName,
    singer: posts.singer,
    filename: posts.filename,
    bookTitle: posts.bookTitle,
    advertTitle: posts.advertTitle,
    linkTitle: posts.linkTitle,
    createdAt: posts.createdAt,
    views: posts.views,
    userId: posts.userId,
    username: users.username,
  } as const;

  const baseWhere = and(
    eq(posts.postType, postType as typeof posts.postType.enumValues[number]),
    eq(posts.approved, true),
    eq(posts.privacy, "public"),
    ne(posts.id, postId)
  );

  const highViewPosts = await db
    .select(selectShape)
    .from(posts)
    .leftJoin(users, eq(posts.userId, users.id))
    .where(and(baseWhere, gte(posts.views, 20)))
    .orderBy(desc(posts.views), sql`RANDOM()`)
    .limit(limit);

  if (highViewPosts.length >= limit) return highViewPosts;

  const usedIds = highViewPosts.map((post) => post.id);
  const fallbackPosts = await db
    .select(selectShape)
    .from(posts)
    .leftJoin(users, eq(posts.userId, users.id))
    .where(
      and(
        baseWhere,
        ...(usedIds.length ? [notInArray(posts.id, usedIds)] : [])
      )
    )
    .orderBy(desc(posts.views), sql`RANDOM()`)
    .limit(Math.max(0, limit - highViewPosts.length));

  return [...highViewPosts, ...fallbackPosts];
}
