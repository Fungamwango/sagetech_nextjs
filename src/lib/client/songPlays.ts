"use client";

const PLAYED_SONGS_SESSION_KEY = "sagetech_played_songs_session";

function readPlayedSongs(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.sessionStorage.getItem(PLAYED_SONGS_SESSION_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((value): value is string => typeof value === "string") : [];
  } catch {
    return [];
  }
}

function writePlayedSongs(ids: string[]) {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(PLAYED_SONGS_SESSION_KEY, JSON.stringify(ids));
  } catch {
    // ignore storage failures
  }
}

export function hasTrackedSongPlay(postId: string) {
  return readPlayedSongs().includes(postId);
}

export async function trackSongPlayOnce(postId: string) {
  if (!postId || typeof window === "undefined") return false;
  const played = readPlayedSongs();
  if (played.includes(postId)) return false;

  writePlayedSongs([...played, postId]);

  try {
    await fetch(`/api/posts/${postId}/play`, {
      method: "POST",
      keepalive: true,
    });
    return true;
  } catch {
    return false;
  }
}
