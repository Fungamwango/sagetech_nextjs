import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatDistanceToNow } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function timeAgo(date: Date | string | null): string {
  if (!date) return "";
  return formatDistanceToNow(new Date(date), { addSuffix: true });
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
