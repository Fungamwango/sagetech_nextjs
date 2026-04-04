import type { MetadataRoute } from "next";
import { and, desc, eq, or, sql } from "drizzle-orm";

import { db } from "@/lib/db";
import { posts } from "@/lib/db/schema";
import { getPostPath } from "@/lib/postUrls";

function getSiteUrl() {
  return process.env.NEXT_PUBLIC_APP_URL || "https://sageteche.com";
}

const staticRoutes: Array<{
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
}> = [
  { path: "/", changeFrequency: "hourly", priority: 1 },
  { path: "/ai", changeFrequency: "daily", priority: 0.95 },
  { path: "/dictionary", changeFrequency: "weekly", priority: 0.9 },
  { path: "/all-languages-dictionary", changeFrequency: "weekly", priority: 0.9 },
  { path: "/friends", changeFrequency: "daily", priority: 0.85 },
  { path: "/videos", changeFrequency: "daily", priority: 0.9 },
  { path: "/music", changeFrequency: "daily", priority: 0.9 },
  { path: "/documents", changeFrequency: "daily", priority: 0.88 },
  { path: "/blog", changeFrequency: "daily", priority: 0.88 },
  { path: "/business", changeFrequency: "daily", priority: 0.84 },
  { path: "/adverts", changeFrequency: "daily", priority: 0.84 },
  { path: "/apps", changeFrequency: "weekly", priority: 0.8 },
  { path: "/coding", changeFrequency: "weekly", priority: 0.8 },
  { path: "/bible-study", changeFrequency: "weekly", priority: 0.75 },
  { path: "/leaderboard", changeFrequency: "daily", priority: 0.78 },
  { path: "/cyber", changeFrequency: "weekly", priority: 0.72 },
  { path: "/tools", changeFrequency: "weekly", priority: 0.82 },
  { path: "/recharge", changeFrequency: "weekly", priority: 0.65 },
  { path: "/about", changeFrequency: "monthly", priority: 0.6 },
  { path: "/contact", changeFrequency: "monthly", priority: 0.6 },
  { path: "/login", changeFrequency: "monthly", priority: 0.35 },
  { path: "/register", changeFrequency: "monthly", priority: 0.35 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();

  const staticEntries: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: `${siteUrl}${route.path}`,
    lastModified: new Date(),
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  const publicPosts = await db
    .select({
      id: posts.id,
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
      postType: posts.postType,
      createdAt: posts.createdAt,
      updatedAt: posts.updatedAt,
      advertExpiresAt: posts.advertExpiresAt,
    })
    .from(posts)
    .where(
      and(
        eq(posts.approved, true),
        eq(posts.privacy, "public"),
        or(
          sql`${posts.postType} <> 'advert'`,
          and(
            eq(posts.postType, "advert"),
            sql`COALESCE(${posts.advertExpiresAt}, ${posts.createdAt} + INTERVAL '30 days') >= NOW()`
          )
        )
      )
    )
    .orderBy(desc(posts.updatedAt), desc(posts.createdAt));

  const postEntries: MetadataRoute.Sitemap = publicPosts.map((post) => {
    const url = `${siteUrl}${getPostPath(post)}`;
    const lastModified = post.updatedAt ?? post.createdAt ?? new Date();

    const priority =
      post.postType === "product" || post.postType === "advert"
        ? 0.85
        : post.postType === "blog" || post.postType === "guest_ai"
          ? 0.82
          : post.postType === "video" || post.postType === "song"
            ? 0.8
            : 0.76;

    const changeFrequency =
      post.postType === "advert"
        ? "daily"
        : post.postType === "blog" || post.postType === "guest_ai"
          ? "weekly"
          : "monthly";

    return {
      url,
      lastModified,
      changeFrequency,
      priority,
    };
  });

  return [...staticEntries, ...postEntries];
}
