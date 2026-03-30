import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db, cyberHacked } from "@/lib/db";
import { eq, and } from "drizzle-orm";

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await db.delete(cyberHacked).where(and(eq(cyberHacked.id, id), eq(cyberHacked.receiverId, user.id)));

  return NextResponse.json({ success: true });
}
