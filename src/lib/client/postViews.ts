"use client";

const VIEWED_POSTS_SESSION_KEY = "sagetech_viewed_posts_session";

function readViewedPosts(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.sessionStorage.getItem(VIEWED_POSTS_SESSION_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((value): value is string => typeof value === "string") : [];
  } catch {
    return [];
  }
}

function writeViewedPosts(ids: string[]) {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(VIEWED_POSTS_SESSION_KEY, JSON.stringify(ids));
  } catch {
    // ignore storage failures
  }
}

export function hasTrackedPostView(postId: string) {
  return readViewedPosts().includes(postId);
}

export async function trackPostViewOnce(postId: string) {
  if (!postId || typeof window === "undefined") return false;
  const viewed = readViewedPosts();
  if (viewed.includes(postId)) return false;

  writeViewedPosts([...viewed, postId]);

  try {
    await fetch(`/api/posts/${postId}/view`, {
      method: "POST",
      keepalive: true,
    });
    return true;
  } catch {
    return false;
  }
}
