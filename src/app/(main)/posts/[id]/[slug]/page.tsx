import { notFound, permanentRedirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getVisiblePostById } from "@/lib/posts";
import { getPostPath } from "@/lib/postUrls";

interface LegacyPostPageProps {
  params: Promise<{ id: string; slug: string }>;
}

export default async function LegacyPostPage({ params }: LegacyPostPageProps) {
  const [{ id }, currentUser] = await Promise.all([params, getCurrentUser()]);
  const post = await getVisiblePostById(id, currentUser?.id ?? null);

  if (!post) notFound();

  permanentRedirect(getPostPath(post));
}
