import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db, cyberAttacks } from "@/lib/db";
import { eq, and } from "drizzle-orm";

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await db.delete(cyberAttacks).where(and(eq(cyberAttacks.id, id), eq(cyberAttacks.senderId, user.id)));

  return NextResponse.json({ success: true });
}
