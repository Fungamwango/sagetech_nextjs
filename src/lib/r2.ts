import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const ACCOUNT_ID = process.env.CLOUDFLARE_R2_ACCOUNT_ID!;

export const r2 = new S3Client({
  region: "auto",
  endpoint: `https://${ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY!,
  },
});

export const R2_BUCKET = "sagetech-storage";

export function getR2Directory(contentType: string): "images" | "videos" | "music" | "docs" {
  if (contentType.startsWith("audio/")) return "music";
  if (contentType.startsWith("video/")) return "videos";
  if (contentType.startsWith("image/")) return "images";
  return "docs";
}

export async function generatePresignedUrl(key: string, contentType: string): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: R2_BUCKET,
    Key: key,
    ContentType: contentType,
  });
  return getSignedUrl(r2, command, { expiresIn: 900 });
}

export async function uploadBufferToR2(key: string, contentType: string, body: Buffer | Uint8Array | string) {
  const command = new PutObjectCommand({
    Bucket: R2_BUCKET,
    Key: key,
    ContentType: contentType,
    Body: body,
  });
  await r2.send(command);
}

export async function deleteObjectFromR2(key: string) {
  const command = new DeleteObjectCommand({
    Bucket: R2_BUCKET,
    Key: key,
  });
  await r2.send(command);
}

export async function deleteR2Keys(keys: string[]) {
  const uniqueKeys = [...new Set(keys.filter(Boolean))];
  await Promise.all(uniqueKeys.map((key) => deleteObjectFromR2(key)));
}

export function extractR2KeyFromUrl(fileUrl?: string | null) {
  if (!fileUrl) return null;

  const trimmed = fileUrl.trim();
  if (!trimmed) return null;

  const publicBase = (process.env.NEXT_PUBLIC_R2_PUBLIC_URL ?? "").replace(/\/+$/, "");
  if (publicBase && trimmed.startsWith(`${publicBase}/`)) {
    return decodeURIComponent(trimmed.slice(publicBase.length + 1));
  }

  try {
    const pathname = new URL(trimmed).pathname.replace(/^\/+/, "");
    if (/^(images|videos|music|docs)\//.test(pathname)) {
      return decodeURIComponent(pathname);
    }
  } catch {
    if (/^(images|videos|music|docs)\//.test(trimmed)) {
      return decodeURIComponent(trimmed);
    }
  }

  return null;
}
