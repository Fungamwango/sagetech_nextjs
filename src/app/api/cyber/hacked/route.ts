import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db, cyberHacked, users } from "@/lib/db";
import { eq, desc } from "drizzle-orm";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { password } = await req.json();
  if (!password) return NextResponse.json({ error: "Password required" }, { status: 400 });

  const [dbUser] = await db.select({ password: users.password }).from(users).where(eq(users.id, user.id));
  if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const valid = await bcrypt.compare(password, dbUser.password);
  if (!valid) return NextResponse.json({ error: "Wrong password" }, { status: 403 });

  const hacked = await db
    .select()
    .from(cyberHacked)
    .where(eq(cyberHacked.receiverId, user.id))
    .orderBy(desc(cyberHacked.createdAt))
    .limit(50);

  // Mark as seen
  await db
    .update(cyberHacked)
    .set({ seen: true })
    .where(eq(cyberHacked.receiverId, user.id));

  return NextResponse.json(hacked);
}
