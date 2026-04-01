import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function timeAgo(date: Date | string | null): string {
  if (!date) return "";
  const value = new Date(date);
  if (Number.isNaN(value.getTime())) return "";

  const diffMs = Date.now() - value.getTime();
  const diffSec = Math.max(0, Math.floor(diffMs / 1000));

  if (diffSec < 60) return `${diffSec || 1} sec ago`;

  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} min ago`;

  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr} hr ago`;

  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay} ${diffDay === 1 ? "day" : "days"} ago`;

  const diffWeek = Math.floor(diffDay / 7);
  if (diffWeek < 5) return `${diffWeek} wk ago`;

  const diffMonth = Math.floor(diffDay / 30);
  if (diffMonth < 12) return `${diffMonth} mo ago`;

  const diffYear = Math.floor(diffDay / 365);
  if (diffYear < 10) return `${diffYear} yr ago`;

  const diffDecade = Math.floor(diffYear / 10);
  return `${diffDecade} dec ago`;
}

export function formatPoints(points: string | number | null): string {
  const num = parseFloat(String(points ?? 0));
  if (num >= 1000) return (num / 1000).toFixed(1) + "k";
  return num.toFixed(2);
}

export function getUserLevel(points: number): string {
  if (points >= 100000) return "professor";
  if (points >= 20000) return "master";
  if (points >= 10000) return "expert";
  if (points >= 1000) return "intermediate";
  return "amateur";
}

export function getLevelColor(level: string): string {
  switch (level.toLowerCase()) {
    case "professor": return "text-yellow-400";
    case "master": return "text-purple-400";
    case "expert": return "text-blue-400";
    case "intermediate": return "text-green-400";
    default: return "text-gray-400";
  }
}

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}

export function generateResetCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function isValidPhone(phone: string): boolean {
  return /^[0-9]{10,15}$/.test(phone.replace(/[\s\-+]/g, ""));
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function getPostTypeCost(postType: string): number {
  switch (postType) {
    case "song": return 80;
    case "video": return 5;
    case "photo": return 0.5;
    case "app": return 50;
    case "book": return 40;
    case "blog": return 5;
    case "product": return 40;
    case "advert": return 100;
    case "document": return 2;
    default: return 0;
  }
}

export function formatCount(n: number | null | undefined): string {
  if (!n) return "0";
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, "") + "k";
  return String(n);
}

export function getFileTypeFromMime(mime: string): "image" | "video" | "audio" | "document" | "none" {
  if (mime.startsWith("image/")) return "image";
  if (mime.startsWith("video/")) return "video";
  if (mime.startsWith("audio/")) return "audio";
  if (mime.includes("pdf") || mime.includes("document") || mime.includes("word")) return "document";
  return "none";
}
