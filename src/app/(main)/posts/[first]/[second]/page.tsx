"use server";

import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";
import Image from "next/image";
import { notFound, permanentRedirect } from "next/navigation";
import PostFeed from "@/components/posts/PostFeed";
import PostShareBar from "@/components/posts/PostShareBar";
import PostViewTracker from "@/components/posts/PostViewTracker";
import AdsterraBannerEmbed from "@/components/monetise/AdsterraBannerEmbed";
import MonetisationSummaryCard from "@/components/monetise/MonetisationSummaryCard";
import { getCurrentUser } from "@/lib/auth";
import { canUseAdsterraStats, fetchAdsterraStats } from "@/lib/adsterra";
import { getPostSeo, getRelatedPostsByType, getVisiblePostById } from "@/lib/posts";
import { getPostPath } from "@/lib/postUrls";
import { getPrimaryMediaUrl } from "@/lib/postMedia";

interface PostPageProps {
  params: Promise<{ first: string; second: string }>;
}

function getSiteUrl() {
  return process.env.NEXT_PUBLIC_APP_URL || "https://sageteche.com";
}

function stripHtml(value: string | null | undefined) {
  return (value ?? "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function stripFileExtension(value: string | null | undefined) {
  return (value ?? "").replace(/\.[^.]+$/, "").trim();
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function resolveRouteParts(first: string, second: string) {
  if (isUuid(second)) {
    return { id: second, slug: first };
  }

  if (isUuid(first)) {
    return { id: first, slug: second };
  }

  return null;
}

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const { first, second } = await params;
  const resolved = resolveRouteParts(first, second);

  if (!resolved) {
    return {
      title: "Post not found | SageTech",
      robots: { index: false, follow: false },
    };
  }

  const currentUser = await getCurrentUser();
  const post = await getVisiblePostById(resolved.id, currentUser?.id ?? null);

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
  const [{ first, second }, currentUser] = await Promise.all([params, getCurrentUser()]);
  const resolved = resolveRouteParts(first, second);

  if (!resolved) notFound();

  const post = await getVisiblePostById(resolved.id, currentUser?.id ?? null);
  if (!post) notFound();

  const canonicalPath = getPostPath(post);
  const requestedPath = `/posts/${first}/${second}`;
  if (requestedPath !== canonicalPath) {
    permanentRedirect(canonicalPath);
  }

  const siteUrl = getSiteUrl();
  const canonical = `${siteUrl}${canonicalPath}`;
  const seo = getPostSeo(post);
  const imageUrl = seo.image.startsWith("http") ? seo.image : `${siteUrl}${seo.image}`;
  let monetiseStats = null;
  const isOwnerViewing = currentUser?.id === post.userId;
  const relatedPosts = await getRelatedPostsByType(post.id, post.postType, 5);

  if (
    isOwnerViewing &&
    canUseAdsterraStats({
      provider: post.userMonetiseProvider,
      isMonetised: post.userIsMonetised,
      token: post.userAdsterraApiToken,
    })
  ) {
    try {
      monetiseStats = await fetchAdsterraStats({
        token: post.userAdsterraApiToken ?? "",
        domainId: post.userAdsterraDomainId,
        placementId: post.userAdsterraPlacementId,
      });
    } catch {
      monetiseStats = null;
    }
  }

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
      <PostViewTracker postId={post.id} />
      <PostShareBar url={canonical} title={seo.title} />
      <PostFeed
        currentUserId={currentUser?.id ?? null}
        currentUser={currentUser ? { id: currentUser.id, username: currentUser.username, picture: currentUser.picture, points: currentUser.points } : null}
        postId={post.id}
        showComposer={false}
        fullContent
      />
      {relatedPosts.length > 0 ? (
        <section className="mt-4 rounded-[20px] border border-white/10 bg-white/[0.03] px-3 py-3">
          <div className="mb-3">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/38">
              More {post.postType === "general" ? "Posts" : `${post.postType} Posts`}
            </h2>
          </div>
          <div className="space-y-2">
            {relatedPosts.map((related) => {
              const title =
                related.blogTitle ||
                related.productName ||
                related.filename ||
                related.singer ||
                related.bookTitle ||
                related.advertTitle ||
                related.linkTitle ||
                related.generalPost ||
                related.postDescription ||
                "Untitled post";
              const excerpt =
                stripHtml(related.postDescription) ||
                stripHtml(related.generalPost) ||
                stripHtml(related.blogContent) ||
                stripHtml(title);
              const mediaUrl = getPrimaryMediaUrl(related.fileUrl) || related.thumbnailUrl || related.albumCover;

              if (related.postType === "song") {
                return (
                  <Link
                    key={related.id}
                    href={getPostPath(related)}
                    className="block rounded-2xl border border-white/8 bg-white/[0.03] px-3 py-3 transition-colors hover:border-cyan-400/18 hover:bg-white/[0.05]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative h-[60px] w-[60px] flex-shrink-0 overflow-hidden rounded-2xl border border-white/8 bg-black/20">
                        {mediaUrl ? (
                          <Image src={mediaUrl} alt={title} fill className="object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-cyan-300/70">
                            <i className="fas fa-music text-lg" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-3">
                          <p className="truncate text-sm font-semibold text-white/90">
                            {stripFileExtension(related.filename) || related.singer || "Song"}
                          </p>
                          <span className="whitespace-nowrap text-[11px] text-white/36">{related.views ?? 0} plays</span>
                        </div>
                        <p className="mt-1 truncate text-xs text-white/62">{related.singer || "Unknown artist"}</p>
                        <p className="mt-1 truncate text-[11px] uppercase tracking-[0.12em] text-cyan-300/72">
                          {related.songType || "Music"}
                        </p>
                      </div>
                    </div>
                  </Link>
                );
              }

              if (related.postType === "video") {
                return (
                  <Link
                    key={related.id}
                    href={getPostPath(related)}
                    className="block overflow-hidden rounded-2xl border border-white/8 bg-white/[0.03] transition-colors hover:border-cyan-400/18 hover:bg-white/[0.05]"
                  >
                    <div className="flex gap-3 p-3">
                      <div className="relative h-[78px] w-[132px] flex-shrink-0 overflow-hidden rounded-xl border border-white/8 bg-black/20">
                        {mediaUrl ? (
                          <Image src={mediaUrl} alt={title} fill className="object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-cyan-300/70">
                            <i className="fas fa-video text-lg" />
                          </div>
                        )}
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-black/45 text-white">
                            <i className="fas fa-play text-xs ml-0.5" />
                          </span>
                        </div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-3">
                          <p className="line-clamp-2 text-sm font-semibold text-white/90">{title}</p>
                          <span className="whitespace-nowrap text-[11px] text-white/36">{related.views ?? 0} views</span>
                        </div>
                        <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-white/58">{excerpt}</p>
                      </div>
                    </div>
                  </Link>
                );
              }

              if (related.postType === "document") {
                return (
                  <Link
                    key={related.id}
                    href={getPostPath(related)}
                    className="block rounded-2xl border border-white/8 bg-white/[0.03] px-3 py-3 transition-colors hover:border-cyan-400/18 hover:bg-white/[0.05]"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-[44px] w-[44px] flex-shrink-0 items-center justify-center rounded-2xl border border-blue-400/18 bg-blue-400/10 text-blue-300">
                        <i className="fas fa-file-alt text-sm" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-3">
                          <p className="truncate text-sm font-semibold text-white/90">
                            {related.filename || related.bookTitle || "Document"}
                          </p>
                          <span className="whitespace-nowrap text-[11px] text-white/36">{related.downloadsCount ?? 0} downloads</span>
                        </div>
                        <p className="mt-1 truncate text-xs text-white/58">
                          {related.author || related.bookCategory || "Document file"}
                        </p>
                        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-white/52">{excerpt}</p>
                      </div>
                    </div>
                  </Link>
                );
              }

              return (
                <Link
                  key={related.id}
                  href={getPostPath(related)}
                  className="block rounded-2xl border border-white/8 bg-white/[0.03] px-3 py-2.5 transition-colors hover:border-cyan-400/18 hover:bg-white/[0.05]"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="line-clamp-1 text-sm font-semibold text-white/85">{title}</p>
                    <span className="whitespace-nowrap text-[11px] text-white/30">{related.views ?? 0} views</span>
                  </div>
                  <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-white/52">{excerpt}</p>
                </Link>
              );
            })}
          </div>
        </section>
      ) : null}
      {isOwnerViewing && post.userIsMonetised && post.userMonetiseProvider === "adsterra" && monetiseStats ? (
        <div className="mt-4">
          <MonetisationSummaryCard
            provider={post.userMonetiseProvider}
            impressions={monetiseStats.impressions}
            clicks={monetiseStats.clicks}
            revenue={monetiseStats.revenue}
            ctr={monetiseStats.ctr}
            cpm={monetiseStats.cpm}
          />
        </div>
      ) : null}
      {post.userIsMonetised && post.userMonetiseProvider === "adsterra" && post.userAdsterraBannerCode ? (
        <section className="mt-4 rounded-[3px] border border-white/10 bg-white/[0.02] px-3 py-4">
          <div className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-white/40">Sponsored</div>
          <AdsterraBannerEmbed code={post.userAdsterraBannerCode} />
        </section>
      ) : null}
    </div>
  );
}
