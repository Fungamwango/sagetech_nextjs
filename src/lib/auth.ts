import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { db } from "./db";
import { users, admins } from "./db/schema";
import { eq } from "drizzle-orm";

const SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET || "fallback-secret-key-change-in-production"
);

const COOKIE_NAME = "sagetech_session";
const ADMIN_COOKIE_NAME = "sagetech_admin_session";

export interface SessionPayload {
  userId: string;
  username: string;
  iat?: number;
  exp?: number;
}

export interface AdminSessionPayload {
  adminId: string;
  username: string;
  iat?: number;
  exp?: number;
}

export async function signToken(payload: object, expiresIn = "7d") {
  return new SignJWT(payload as Record<string, unknown>)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(SECRET);
}

export async function verifyToken<T>(token: string): Promise<T | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload as T;
  } catch {
    return null;
  }
}

export async function createSession(userId: string, username: string) {
  const token = await signToken({ userId, username });
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken<SessionPayload>(token);
}

export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getCurrentUser() {
  const session = await getSession();
  if (!session?.userId) return null;
  try {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, session.userId))
      .limit(1);
    return user ?? null;
  } catch (error) {
    console.error("getCurrentUser failed", error);
    return null;
  }
}

export async function createAdminSession(adminId: string, username: string) {
  const token = await signToken({ adminId, username });
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 8,
    path: "/",
  });
}

export async function getAdminSession(): Promise<AdminSessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken<AdminSessionPayload>(token);
}

export async function getCurrentAdmin() {
  const session = await getAdminSession();
  if (!session?.adminId) return null;
  try {
    const [admin] = await db
      .select()
      .from(admins)
      .where(eq(admins.id, session.adminId))
      .limit(1);
    return admin ?? null;
  } catch (error) {
    console.error("getCurrentAdmin failed", error);
    return null;
  }
}

export async function destroyAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE_NAME);
}
