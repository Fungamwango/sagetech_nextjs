// R2 helpers using fetch + Web Crypto (no AWS SDK — compatible with Cloudflare Workers)

const ACCOUNT_ID = () => process.env.CLOUDFLARE_R2_ACCOUNT_ID!;
const ACCESS_KEY = () => process.env.CLOUDFLARE_R2_ACCESS_KEY_ID!;
const SECRET_KEY = () => process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY!;
export const R2_BUCKET = "sagetech-storage";

function endpoint() {
  return `https://${ACCOUNT_ID()}.r2.cloudflarestorage.com`;
}

export function getR2Directory(contentType: string): "images" | "videos" | "music" | "docs" {
  if (contentType.startsWith("audio/")) return "music";
  if (contentType.startsWith("video/")) return "videos";
  if (contentType.startsWith("image/")) return "images";
  return "docs";
}

// ── HMAC-SHA256 helpers ──────────────────────────────────────────────────────

async function hmacSha256(key: ArrayBuffer | Uint8Array, data: string): Promise<ArrayBuffer> {
  const rawKey = key instanceof Uint8Array ? key.buffer.slice(key.byteOffset, key.byteOffset + key.byteLength) as ArrayBuffer : key;
  const cryptoKey = await crypto.subtle.importKey(
    "raw", rawKey, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
  );
  return crypto.subtle.sign("HMAC", cryptoKey, new TextEncoder().encode(data));
}

async function sha256Hex(data: string): Promise<string> {
  const encoded = new TextEncoder().encode(data);
  const buf = await crypto.subtle.digest("SHA-256", encoded.buffer.slice(encoded.byteOffset, encoded.byteOffset + encoded.byteLength) as ArrayBuffer);
  return toHex(buf);
}

function toHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
}

async function getSigningKey(secretKey: string, date: string, region: string, service: string): Promise<ArrayBuffer> {
  const kDate    = await hmacSha256(new TextEncoder().encode(`AWS4${secretKey}`), date);
  const kRegion  = await hmacSha256(kDate, region);
  const kService = await hmacSha256(kRegion, service);
  return hmacSha256(kService, "aws4_request");
}

// ── Presigned PUT URL ────────────────────────────────────────────────────────

export async function generatePresignedUrl(key: string, _contentType: string): Promise<string> {
  const region = "auto";
  const service = "s3";
  const accessKey = ACCESS_KEY();
  const secretKey = SECRET_KEY();
  const bucket = R2_BUCKET;
  const host = `${ACCOUNT_ID()}.r2.cloudflarestorage.com`;
  const expiresIn = 900;

  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]/g, "").replace(/\.\d{3}/, "");
  const dateStamp = amzDate.slice(0, 8);

  const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;
  const credential = `${accessKey}/${credentialScope}`;

  const encodedKey = key.split("/").map(encodeURIComponent).join("/");
  const canonicalUri = `/${bucket}/${encodedKey}`;

  const queryParams = new URLSearchParams({
    "X-Amz-Algorithm": "AWS4-HMAC-SHA256",
    "X-Amz-Credential": credential,
    "X-Amz-Date": amzDate,
    "X-Amz-Expires": String(expiresIn),
    "X-Amz-SignedHeaders": "host",
  });
  // Sort query params for canonical request
  queryParams.sort();
  const canonicalQueryString = queryParams.toString();

  const canonicalHeaders = `host:${host}\n`;
  const signedHeaders = "host";
  const payloadHash = "UNSIGNED-PAYLOAD";

  const canonicalRequest = [
    "PUT",
    canonicalUri,
    canonicalQueryString,
    canonicalHeaders,
    signedHeaders,
    payloadHash,
  ].join("\n");

  const hashedCanonicalRequest = await sha256Hex(canonicalRequest);
  const stringToSign = [
    "AWS4-HMAC-SHA256",
    amzDate,
    credentialScope,
    hashedCanonicalRequest,
  ].join("\n");

  const signingKey = await getSigningKey(secretKey, dateStamp, region, service);
  const signatureBuf = await hmacSha256(signingKey, stringToSign);
  const signature = toHex(signatureBuf);

  queryParams.set("X-Amz-Signature", signature);

  return `${endpoint()}/${bucket}/${encodedKey}?${queryParams.toString()}`;
}

// ── Upload buffer (server-side) ──────────────────────────────────────────────

export async function uploadBufferToR2(key: string, contentType: string, body: Uint8Array | string) {
  const bucket = R2_BUCKET;
  const host = `${ACCOUNT_ID()}.r2.cloudflarestorage.com`;
  const region = "auto";
  const service = "s3";
  const accessKey = ACCESS_KEY();
  const secretKey = SECRET_KEY();

  const bodyBytes = typeof body === "string" ? new TextEncoder().encode(body) : body;
  const bodyBuffer = bodyBytes.buffer.slice(bodyBytes.byteOffset, bodyBytes.byteOffset + bodyBytes.byteLength) as ArrayBuffer;

  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]/g, "").replace(/\.\d{3}/, "");
  const dateStamp = amzDate.slice(0, 8);

  const payloadHash = toHex(await crypto.subtle.digest("SHA-256", bodyBuffer));
  const encodedKey = key.split("/").map(encodeURIComponent).join("/");
  const canonicalUri = `/${bucket}/${encodedKey}`;
  const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;

  const canonicalHeaders = `content-type:${contentType}\nhost:${host}\nx-amz-content-sha256:${payloadHash}\nx-amz-date:${amzDate}\n`;
  const signedHeaders = "content-type;host;x-amz-content-sha256;x-amz-date";

  const canonicalRequest = ["PUT", canonicalUri, "", canonicalHeaders, signedHeaders, payloadHash].join("\n");
  const hashedCanonicalRequest = await sha256Hex(canonicalRequest);
  const stringToSign = ["AWS4-HMAC-SHA256", amzDate, credentialScope, hashedCanonicalRequest].join("\n");

  const signingKey = await getSigningKey(secretKey, dateStamp, region, service);
  const signature = toHex(await hmacSha256(signingKey, stringToSign));

  const authorization = `AWS4-HMAC-SHA256 Credential=${accessKey}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

  const res = await fetch(`${endpoint()}/${bucket}/${encodedKey}`, {
    method: "PUT",
    headers: {
      "Content-Type": contentType,
      "x-amz-content-sha256": payloadHash,
      "x-amz-date": amzDate,
      "Authorization": authorization,
    },
    body: new Blob([bodyBuffer], { type: contentType }),
  });

  if (!res.ok) throw new Error(`R2 upload failed: ${res.status} ${await res.text()}`);
}

// ── Delete ───────────────────────────────────────────────────────────────────

export async function deleteObjectFromR2(key: string) {
  const bucket = R2_BUCKET;
  const host = `${ACCOUNT_ID()}.r2.cloudflarestorage.com`;
  const region = "auto";
  const service = "s3";
  const accessKey = ACCESS_KEY();
  const secretKey = SECRET_KEY();

  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]/g, "").replace(/\.\d{3}/, "");
  const dateStamp = amzDate.slice(0, 8);
  const payloadHash = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"; // SHA256 of empty string

  const encodedKey = key.split("/").map(encodeURIComponent).join("/");
  const canonicalUri = `/${bucket}/${encodedKey}`;
  const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;

  const canonicalHeaders = `host:${host}\nx-amz-content-sha256:${payloadHash}\nx-amz-date:${amzDate}\n`;
  const signedHeaders = "host;x-amz-content-sha256;x-amz-date";

  const canonicalRequest = ["DELETE", canonicalUri, "", canonicalHeaders, signedHeaders, payloadHash].join("\n");
  const hashedCanonicalRequest = await sha256Hex(canonicalRequest);
  const stringToSign = ["AWS4-HMAC-SHA256", amzDate, credentialScope, hashedCanonicalRequest].join("\n");

  const signingKey = await getSigningKey(secretKey, dateStamp, region, service);
  const signature = toHex(await hmacSha256(signingKey, stringToSign));

  const authorization = `AWS4-HMAC-SHA256 Credential=${accessKey}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

  await fetch(`${endpoint()}/${bucket}/${encodedKey}`, {
    method: "DELETE",
    headers: {
      "x-amz-content-sha256": payloadHash,
      "x-amz-date": amzDate,
      "Authorization": authorization,
    },
  });
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
