import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import Script from "next/script";
import { getAiPostById, incrementAiPostViews } from "@/lib/aiPosts";
import { getAiPostPath } from "@/lib/aiPostUrls";

interface AiPostPageProps {
  params: Promise<{ id: string; slug: string }>;
}

function getSiteUrl() {
  return process.env.NEXT_PUBLIC_APP_URL || "https://sageteche.com";
}

export async function generateMetadata({ params }: AiPostPageProps): Promise<Metadata> {
  const { id } = await params;
  const post = await getAiPostById(id);

  if (!post) {
    return {
      title: "AI post not found | SageTech",
      robots: { index: false, follow: false },
    };
  }

  const siteUrl = getSiteUrl();
  const canonical = `${siteUrl}${getAiPostPath(post)}`;
  const title = `${post.title} | Sage AI`;
  const description = (post.content || "AI-generated answer on SageTech").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 180);

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      type: "article",
      title,
      description,
      url: canonical,
      siteName: "SageTech",
      images: [{ url: `${siteUrl}/files/sagetech_icon.jpg`, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${siteUrl}/files/sagetech_icon.jpg`],
    },
  };
}

export default async function AiPostPage({ params }: AiPostPageProps) {
  const { id, slug } = await params;
  const post = await getAiPostById(id);
  if (!post) notFound();

  const canonicalPath = getAiPostPath(post);
  if (`/ai/posts/${id}/${slug}` !== canonicalPath) {
    permanentRedirect(canonicalPath);
  }

  await incrementAiPostViews(id);

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    articleBody: (post.content || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim(),
    datePublished: post.createdAt,
    author: {
      "@type": "Organization",
      name: "Sage AI",
    },
    publisher: {
      "@type": "Organization",
      name: "SageTech",
    },
  };

  return (
    <div className="mx-auto max-w-[760px]">
      <Script
        id={`ai-post-jsonld-${post.id}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <article className="modern-feed-card fade-in">
        <div className="modern-feed-card__body">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-cyan-400/80">Sage AI</p>
              <h1 className="mt-2 text-xl font-bold text-white">{post.title}</h1>
              <p className="mt-2 text-xs text-white/45">
                Published publicly • View-only AI post • {post.views ?? 0} views
              </p>
            </div>
          </div>
          <div
            className="ai-blog-content text-sm leading-relaxed text-white/85"
            dangerouslySetInnerHTML={{ __html: post.content || "" }}
          />
        </div>
      </article>
    </div>
  );
}
