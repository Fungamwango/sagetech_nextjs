import { getCurrentUser } from "@/lib/auth";
import PostFeed from "@/components/posts/PostFeed";

export default async function VideosPage() {
  const user = await getCurrentUser();
  return (
    <div>
      <h1 className="text-lg font-bold text-white mb-4">
        <i className="fas fa-video text-cyan-400 mr-2" />Videos
      </h1>
      <PostFeed postType="video" currentUserId={user?.id ?? null} showComposer={false} gridView={true} />
    </div>
  );
}
