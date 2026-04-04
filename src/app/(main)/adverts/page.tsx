import { getCurrentUser } from "@/lib/auth";
import PostFeed from "@/components/posts/PostFeed";

export default async function AdvertsPage() {
  const user = await getCurrentUser();
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl border border-cyan-400/15 bg-cyan-400/10 text-cyan-300">
          <i className="fas fa-ad text-sm" />
        </span>
        <h1 className="text-lg font-bold text-white">Adverts</h1>
      </div>
      <PostFeed postType="advert" currentUserId={user?.id ?? null} showComposer={false} />
    </div>
  );
}
