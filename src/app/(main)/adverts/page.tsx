import { getCurrentUser } from "@/lib/auth";
import PostFeed from "@/components/posts/PostFeed";

export default async function AdvertsPage() {
  const user = await getCurrentUser();
  return (
    <div>
      <h1 className="text-lg font-bold text-white mb-1">
        <i className="fas fa-ad text-cyan-400 mr-2" />Adverts
      </h1>
      <p className="text-sm text-white/50 mb-4">Sponsored content & advertisements</p>
      <PostFeed postType="advert" currentUserId={user?.id ?? null} showComposer={false} />
    </div>
  );
}
