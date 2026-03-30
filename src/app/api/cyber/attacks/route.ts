import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db, cyberAttacks } from "@/lib/db";
import { eq, desc } from "drizzle-orm";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const attacks = await db
    .select()
    .from(cyberAttacks)
    .where(eq(cyberAttacks.senderId, user.id))
    .orderBy(desc(cyberAttacks.createdAt))
    .limit(50);

  return NextResponse.json(attacks);
}
