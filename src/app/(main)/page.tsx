import { getCurrentUser } from "@/lib/auth";
import PostFeed from "@/components/posts/PostFeed";
import AIHeroWidget from "@/components/ai/AIHeroWidget";

interface HomeProps {
  searchParams: Promise<{ q?: string; type?: string; postId?: string }>;
}

export default async function HomePage({ searchParams }: HomeProps) {
  const [user, params] = await Promise.all([getCurrentUser(), searchParams]);
  const activeQuery = params.q?.trim();

  return (
    <div>
      <AIHeroWidget />
      <PostFeed
        currentUserId={user?.id ?? null}
        currentUser={user ? { id: user.id, username: user.username, picture: user.picture, points: user.points } : null}
        postType={params.type}
        postId={params.postId}
        search={activeQuery}
        showComposer
        order={activeQuery ? "search" : "random"}
      />
    </div>
  );
}
