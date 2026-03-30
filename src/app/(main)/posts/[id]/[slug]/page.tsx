import type { Metadata } from "next";
import Script from "next/script";
import { notFound, permanentRedirect } from "next/navigation";
import PostFeed from "@/components/posts/PostFeed";
import { getCurrentUser } from "@/lib/auth";
import { getPostSeo, getVisiblePostById } from "@/lib/posts";
import { getPostPath } from "@/lib/postUrls";

interface PostPageProps {
  params: Promise<{ id: string; slug: string }>;
}

function getSiteUrl() {
  return process.env.NEXT_PUBLIC_APP_URL || "https://sageteche.com";
}

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const { id } = await params;
  const currentUser = await getCurrentUser();
  const post = await getVisiblePostById(id, currentUser?.id ?? null);

  if (!post) {
    return {
      title: "Post not found | SageTech",
      robots: { index: false, follow: false },
    };
  }

  const siteUrl = getSiteUrl();
  const canonical = `${siteUrl}${getPostPath(post)}`;
  const seo = getPostSeo(post);
  const imageUrl = seo.image.startsWith("http") ? seo.image : `${siteUrl}${seo.image}`;

  return {
    title: seo.title,
    description: seo.description,
    alternates: { canonical },
    openGraph: {
      type: "article",
      title: seo.title,
      description: seo.description,
      url: canonical,
      siteName: "SageTech",
      images: [{ url: imageUrl, alt: seo.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: seo.title,
      description: seo.description,
      images: [imageUrl],
    },
  };
}

export default async function PostPage({ params }: PostPageProps) {
  const [{ id, slug }, currentUser] = await Promise.all([params, getCurrentUser()]);
  const post = await getVisiblePostById(id, currentUser?.id ?? null);

  if (!post) notFound();

  const canonicalPath = getPostPath(post);
  const requestedPath = `/posts/${id}/${slug}`;
  if (requestedPath !== canonicalPath) {
    permanentRedirect(canonicalPath);
  }

  const siteUrl = getSiteUrl();
  const canonical = `${siteUrl}${canonicalPath}`;
  const seo = getPostSeo(post);
  const imageUrl = seo.image.startsWith("http") ? seo.image : `${siteUrl}${seo.image}`;

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SocialMediaPosting",
    headline: seo.title,
    articleBody: seo.description,
    datePublished: post.createdAt,
    author: {
      "@type": "Person",
      name: post.username ?? "SageTech user",
      url: `${siteUrl}/profile/${post.userId}`,
    },
    mainEntityOfPage: canonical,
    image: imageUrl,
    publisher: {
      "@type": "Organization",
      name: "SageTech",
      logo: {
        "@type": "ImageObject",
        url: `${siteUrl}/files/sagetech_icon.jpg`,
      },
    },
  };

  return (
    <div className="mx-auto max-w-[760px]">
      <Script
        id={`post-jsonld-${post.id}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <PostFeed
        currentUserId={currentUser?.id ?? null}
        currentUser={currentUser ? { id: currentUser.id, username: currentUser.username, picture: currentUser.picture, points: currentUser.points } : null}
        postId={post.id}
        showComposer={false}
      />
    </div>
  );
}
