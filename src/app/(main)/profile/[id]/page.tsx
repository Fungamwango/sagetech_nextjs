import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { users, follows, posts } from "@/lib/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { notFound } from "next/navigation";
import ProfilePageClient from "./ProfilePageClient";

interface ProfilePageProps {
  params: Promise<{ id: string }>;
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { id } = await params;
  const currentUser = await getCurrentUser();

  const [profile] = await db
    .select()
    .from(users)
    .where(eq(users.id, id))
    .limit(1);

  if (!profile) notFound();

  const [
    followerCount,
    followingCount,
    postCount,
    photoCount,
    videoCount,
    appCount,
    songCount,
    bookCount,
    documentCount,
    productCount,
  ] = await Promise.all([
    db.select({ count: sql<number>`COUNT(*)` }).from(follows).where(eq(follows.followingId, id)),
    db.select({ count: sql<number>`COUNT(*)` }).from(follows).where(eq(follows.followerId, id)),
    db.select({ count: sql<number>`COUNT(*)` }).from(posts).where(eq(posts.userId, id)),
    db.select({ count: sql<number>`COUNT(*)` }).from(posts).where(and(eq(posts.userId, id), eq(posts.postType, "photo"))),
    db.select({ count: sql<number>`COUNT(*)` }).from(posts).where(and(eq(posts.userId, id), eq(posts.postType, "video"))),
    db.select({ count: sql<number>`COUNT(*)` }).from(posts).where(and(eq(posts.userId, id), eq(posts.postType, "app"))),
    db.select({ count: sql<number>`COUNT(*)` }).from(posts).where(and(eq(posts.userId, id), eq(posts.postType, "song"))),
    db.select({ count: sql<number>`COUNT(*)` }).from(posts).where(and(eq(posts.userId, id), eq(posts.postType, "book"))),
    db.select({ count: sql<number>`COUNT(*)` }).from(posts).where(and(eq(posts.userId, id), eq(posts.postType, "document"))),
    db.select({ count: sql<number>`COUNT(*)` }).from(posts).where(and(eq(posts.userId, id), eq(posts.postType, "product"))),
  ]);

  let isFollowing = false;
  if (currentUser && currentUser.id !== id) {
    const [follow] = await db
      .select({ id: follows.id })
      .from(follows)
      .where(and(eq(follows.followerId, currentUser.id), eq(follows.followingId, id)))
      .limit(1);
    isFollowing = !!follow;
  }

  const isMe = currentUser?.id === id;

  return (
    <ProfilePageClient
      profile={{
        id: profile.id,
        username: profile.username,
        email: profile.email,
        picture: profile.picture,
        bio: profile.bio,
        points: profile.points,
        awards: profile.awards,
        level: profile.level,
        isOnline: profile.isOnline,
      }}
      counts={{
        followers: Number(followerCount[0]?.count ?? 0),
        following: Number(followingCount[0]?.count ?? 0),
        posts: Number(postCount[0]?.count ?? 0),
        photos: Number(photoCount[0]?.count ?? 0),
        videos: Number(videoCount[0]?.count ?? 0),
        apps: Number(appCount[0]?.count ?? 0),
        music: Number(songCount[0]?.count ?? 0),
        books: Number(bookCount[0]?.count ?? 0),
        documents: Number(documentCount[0]?.count ?? 0),
        products: Number(productCount[0]?.count ?? 0),
      }}
      isMe={isMe}
      isFollowing={isFollowing}
      currentUserId={currentUser?.id ?? null}
    />
  );
}
