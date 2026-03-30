import { getCurrentUser } from "@/lib/auth";
import PostFeed from "@/components/posts/PostFeed";

export default async function BlogPage() {
  const user = await getCurrentUser();
  return (
    <div>
      <h1 className="text-lg font-bold text-white mb-4">
        <i className="fas fa-blog text-cyan-400 mr-2" />Blog
      </h1>
      <PostFeed postType="blog" currentUserId={user?.id ?? null} showComposer={false} />
    </div>
  );
}
