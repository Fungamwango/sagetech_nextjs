import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import Script from "next/script";
import { headers } from "next/headers";

import PostShareBar from "@/components/posts/PostShareBar";
import { getAiPostById, incrementAiPostViews } from "@/lib/aiPosts";
import { getAiPostPath } from "@/lib/aiPostUrls";

interface AiPostPageProps {
  params: Promise<{ id: string; slug: string }>;
}

function getSiteUrl() {
  return process.env.NEXT_PUBLIC_APP_URL || "https://sageteche.com";
}

async function getLiveSiteUrl() {
  const hdrs = await headers();
  const host = hdrs.get("x-forwarded-host") ?? hdrs.get("host");
  const proto = hdrs.get("x-forwarded-proto") ?? "https";
  if (host) return `${proto}://${host}`;
  return getSiteUrl();
}

function stripHtml(value: string | null | undefined) {
  return (value ?? "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
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

  const siteUrl = await getLiveSiteUrl();
  const canonical = `${siteUrl}${getAiPostPath(post)}`;
  const title = `${post.title} | Sage AI`;
  const description = (stripHtml(post.content || "AI-generated answer on SageTech") || "AI-generated answer on SageTech").slice(0, 180);
  const imageUrl = `${siteUrl}/files/sagetech_icon.jpg`;
  const publishedTime = post.createdAt ? new Date(post.createdAt).toISOString() : undefined;

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
      images: [{ url: imageUrl, alt: title }],
      publishedTime,
      authors: ["Sage AI"],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
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

  const siteUrl = await getLiveSiteUrl();
  const canonicalUrl = `${siteUrl}${canonicalPath}`;
  const imageUrl = `${siteUrl}/files/sagetech_icon.jpg`;
  const articleBody = stripHtml(post.content || "");

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SocialMediaPosting",
    headline: post.title,
    description: articleBody.slice(0, 180),
    articleBody,
    datePublished: post.createdAt,
    mainEntityOfPage: canonicalUrl,
    image: imageUrl,
    author: {
      "@type": "Person",
      name: "Sage AI",
    },
    publisher: {
      "@type": "Organization",
      name: "SageTech",
      logo: {
        "@type": "ImageObject",
        url: imageUrl,
      },
    },
  };

  return (
    <div className="mx-auto max-w-[760px]">
      <Script
        id={`ai-post-jsonld-${post.id}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <div className="mb-2">
        <PostShareBar url={canonicalUrl} title={post.title || "Guest AI post"} />
      </div>

      <article className="modern-feed-card fade-in">
        <div className="modern-feed-card__body">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-cyan-400/80">Sage AI</p>
              <h1 className="mt-2 text-xl font-bold text-white">{post.title}</h1>
              <p className="mt-2 text-xs text-white/45">
                Guest AI post • Publicly shareable • {post.views ?? 0} views
              </p>
            </div>
          </div>

          <div
            className="ai-blog-content text-sm leading-relaxed text-white/85"
            dangerouslySetInnerHTML={{ __html: post.content || "" }}
          />

          <div className="mt-5 flex items-center gap-2 border-t border-white/8 pt-4 text-xs text-white/55">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.04] px-3 py-1.5">
              <i className="fas fa-eye text-[11px] text-cyan-300" />
              {post.views ?? 0} views
            </span>
            <span className="text-white/25">•</span>
            <span>View-only AI post</span>
          </div>
        </div>
      </article>
    </div>
  );
}
