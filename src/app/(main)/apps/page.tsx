import { getCurrentUser } from "@/lib/auth";
import PostFeed from "@/components/posts/PostFeed";

export default async function AppsPage() {
  const user = await getCurrentUser();
  return (
    <div>
      <h1 className="text-lg font-bold text-white mb-4">
        <i className="fas fa-mobile-alt text-cyan-400 mr-2" />Apps
      </h1>
      <PostFeed postType="app" currentUserId={user?.id ?? null} showComposer={false} />
    </div>
  );
}
