import { getCurrentUser } from "@/lib/auth";
import PostFeed from "@/components/posts/PostFeed";

export default async function BooksPage() {
  const user = await getCurrentUser();
  return (
    <div>
      <h1 className="text-lg font-bold text-white mb-4">
        <i className="fas fa-book text-cyan-400 mr-2" />Books
      </h1>
      <PostFeed postType="book" currentUserId={user?.id ?? null} showComposer={false} />
    </div>
  );
}
