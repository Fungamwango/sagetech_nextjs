import { and, desc, eq, gte, ne, notInArray, or, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { follows, posts, users } from "@/lib/db/schema";
import { getPrimaryMediaUrl } from "@/lib/postMedia";
import { getPostPath, slugifyPostText } from "@/lib/postUrls";

function pickPostHeadline(post: {
  slug?: string | null;
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

function resolveStoredSlug(post: Parameters<typeof pickPostHeadline>[0]) {
  return post.slug?.trim() || slugifyPostText(pickPostHeadline(post));
}

export async function getPostById(id: string) {
  const [post] = await db
    .select({
      id: posts.id,
      postType: posts.postType,
      slug: posts.slug,
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
  const isAdvertExpired =
    post.postType === "advert" &&
    new Date(post.advertExpiresAt ?? new Date(new Date(post.createdAt ?? Date.now()).getTime() + 30 * 24 * 60 * 60 * 1000)).getTime() < Date.now();
  const isPublicVisible = post.approved && post.privacy === "public";

  let isFollowerVisible = false;
  if (post.approved && post.privacy === "friends" && currentUserId && !isOwner) {
    const [follow] = await db
      .select({ id: follows.id })
      .from(follows)
      .where(and(eq(follows.followerId, currentUserId), eq(follows.followingId, post.userId)))
      .limit(1);
    isFollowerVisible = Boolean(follow);
  }

  if ((!isPublicVisible && !isFollowerVisible && !isOwner) || (isAdvertExpired && !isOwner)) return null;
  return post;
}

export function getPostSeo(post: NonNullable<Awaited<ReturnType<typeof getPostById>>>) {
  const titleBase = pickPostHeadline(post);
  let title = `${titleBase} | SageTech`;
  let description = (
    post.linkDescription ||
    post.postDescription ||
    post.generalPost ||
    post.blogContent ||
    (post.postType === "product" ? `View ${post.productName ?? "this product"} on SageTech.` : "") ||
    `View this ${post.postType} on SageTech.`
  );

  if (post.postType === "song") {
    const songTitle = post.filename || titleBase || "Song";
    const singer = post.singer || "Unknown artist";
    const songType = post.songType || "music";
    title = `${songTitle} by ${singer} - Download & Stream Mp3 Song now | ${songType}`;
    description = `${songTitle} by ${singer} - Download & Stream Mp3 Song now | ${songType}${post.postDescription ? ` - ${post.postDescription}` : ""}`;
  } else if (post.postType === "guest_ai") {
    const aiTitle = post.blogTitle || titleBase || "AI Post";
    title = `${aiTitle} | Sage AI`;
    description = (post.blogContent || post.postDescription || "AI-generated public post on SageTech.")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 180);
  } else if (post.postType === "product") {
    const productName = post.productName || titleBase || "Product";
    const productCategory = post.productType || "Marketplace";
    title = `${productName} - Buy Now | ${productCategory} | SageTech`;
    description = `${productName} available for purchase on SageTech.${post.postDescription ? ` ${post.postDescription}` : ""}`;
  } else if (post.postType === "video") {
    title = `${titleBase} - Watch & Download video Now`;
    description = `${titleBase} - Watch & Download video Now${post.postDescription ? ` - ${post.postDescription}` : ""}`;
  } else if (post.postType === "advert") {
    const advertTitle = post.advertTitle || titleBase || "Advert";
    title = `${advertTitle} - Advert | SageTech`;
    description = `${advertTitle}${post.postDescription ? ` - ${post.postDescription}` : " - Discover more on SageTech."}`;
  } else if (post.postType === "document") {
    const documentTitle = post.filename || "Document";
    const documentDescription = post.postDescription || "Document file";
    title = `${documentTitle} / ${documentDescription} - Download Now`;
    description = `${documentTitle} / ${documentDescription} - Download Now`;
  }

  description = description.slice(0, 180);

  const image = post.linkImage || getPrimaryMediaUrl(post.fileUrl) || post.thumbnailUrl || post.albumCover || "/files/sagetech_icon.jpg";

  return { title, description, image };
}

export async function getRelatedPostsByType(postId: string, postType: string, limit = 5) {
  if (postType === "guest_ai") return [];

  const selectShape = {
    id: posts.id,
    slug: posts.slug,
    postType: posts.postType,
    fileUrl: posts.fileUrl,
    thumbnailUrl: posts.thumbnailUrl,
    albumCover: posts.albumCover,
    songType: posts.songType,
    blogTitle: posts.blogTitle,
    blogContent: posts.blogContent,
    generalPost: posts.generalPost,
    postDescription: posts.postDescription,
    productName: posts.productName,
    singer: posts.singer,
    filename: posts.filename,
    bookTitle: posts.bookTitle,
    author: posts.author,
    bookCategory: posts.bookCategory,
    advertTitle: posts.advertTitle,
    advertClicks: posts.advertClicks,
    advertExpiresAt: posts.advertExpiresAt,
    linkTitle: posts.linkTitle,
    createdAt: posts.createdAt,
    views: posts.views,
    downloadsCount: posts.downloadsCount,
    userId: posts.userId,
    username: users.username,
  } as const;

  const baseWhere = and(
    eq(posts.postType, postType as typeof posts.postType.enumValues[number]),
    eq(posts.approved, true),
    eq(posts.privacy, "public"),
    or(
      sql`${posts.postType} <> 'advert'`,
      and(eq(posts.postType, "advert"), sql`COALESCE(${posts.advertExpiresAt}, ${posts.createdAt} + INTERVAL '30 days') >= NOW()`)
    ),
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
