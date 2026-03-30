import { getCurrentUser } from "@/lib/auth";
import PostFeed from "@/components/posts/PostFeed";

export default async function BusinessPage() {
  const user = await getCurrentUser();
  return (
    <div>
      <h1 className="text-lg font-bold text-white mb-1">
        <i className="fas fa-store text-cyan-400 mr-2" />Business & Products
      </h1>
      <p className="text-sm text-white/50 mb-4">Buy and sell products</p>
      <PostFeed postType="product" currentUserId={user?.id ?? null} showComposer={false} />
    </div>
  );
}
