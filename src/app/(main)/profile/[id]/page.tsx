import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { users, follows, posts } from "@/lib/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { notFound } from "next/navigation";
import { canUseAdsterraStats, fetchAdsterraStats } from "@/lib/adsterra";
import ProfilePageClient from "./ProfilePageClient";

interface ProfilePageProps {
  params: Promise<{ id: string }>;
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { id } = await params;
  const currentUser = await getCurrentUser();
  const ONLINE_WINDOW_MS = 1 * 60 * 1000;

  const [profile] = await db
    .select()
    .from(users)
    .where(eq(users.id, id))
    .limit(1);

  if (!profile) notFound();

  const [followerCount, followingCount, postCounts] = await Promise.all([
    db.select({ count: sql<number>`COUNT(*)` }).from(follows).where(eq(follows.followingId, id)),
    db.select({ count: sql<number>`COUNT(*)` }).from(follows).where(eq(follows.followerId, id)),
    db
      .select({
        posts: sql<number>`COUNT(*)`,
        photos: sql<number>`COUNT(*) FILTER (WHERE ${posts.postType} = 'photo')`,
        videos: sql<number>`COUNT(*) FILTER (WHERE ${posts.postType} = 'video')`,
        apps: sql<number>`COUNT(*) FILTER (WHERE ${posts.postType} = 'app')`,
        music: sql<number>`COUNT(*) FILTER (WHERE ${posts.postType} = 'song')`,
        books: sql<number>`COUNT(*) FILTER (WHERE ${posts.postType} = 'book')`,
        documents: sql<number>`COUNT(*) FILTER (WHERE ${posts.postType} = 'document')`,
        products: sql<number>`COUNT(*) FILTER (WHERE ${posts.postType} = 'product')`,
      })
      .from(posts)
      .where(eq(posts.userId, id)),
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
  let monetiseStats = null;

  if (
    canUseAdsterraStats({
      provider: profile.monetiseProvider,
      isMonetised: profile.isMonetised,
      token: profile.adsterraApiToken,
    })
  ) {
    try {
      monetiseStats = await fetchAdsterraStats({
        token: profile.adsterraApiToken ?? "",
        domainId: profile.adsterraDomainId,
        placementId: profile.adsterraPlacementId,
      });
    } catch {
      monetiseStats = null;
    }
  }

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
        isOnline: !!profile.lastSeen && Date.now() - new Date(profile.lastSeen).getTime() <= ONLINE_WINDOW_MS,
      }}
      monetise={{
        isMonetised: !!profile.isMonetised,
        provider: profile.monetiseProvider,
        adsterraBannerCode: profile.adsterraBannerCode,
        stats: monetiseStats,
      }}
      counts={{
        followers: Number(followerCount[0]?.count ?? 0),
        following: Number(followingCount[0]?.count ?? 0),
        posts: Number(postCounts[0]?.posts ?? 0),
        photos: Number(postCounts[0]?.photos ?? 0),
        videos: Number(postCounts[0]?.videos ?? 0),
        apps: Number(postCounts[0]?.apps ?? 0),
        music: Number(postCounts[0]?.music ?? 0),
        books: Number(postCounts[0]?.books ?? 0),
        documents: Number(postCounts[0]?.documents ?? 0),
        products: Number(postCounts[0]?.products ?? 0),
      }}
      isMe={isMe}
      isFollowing={isFollowing}
      currentUserId={currentUser?.id ?? null}
    />
  );
}
