import { slugifyPostText } from "@/lib/postUrls";

export function getAiPostPath(post: { id: string; title?: string | null; content?: string | null }) {
  const base = post.title || post.content || "ai-post";
  return `/posts/${slugifyPostText(base)}/${post.id}`;
}
