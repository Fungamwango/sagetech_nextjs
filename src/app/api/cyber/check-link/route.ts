import { NextRequest, NextResponse } from "next/server";
import { db, cyberAttacks } from "@/lib/db";
import { eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const linkId = req.nextUrl.searchParams.get("id");
  if (!linkId) return NextResponse.json({ valid: false });

  const [attack] = await db.select({ id: cyberAttacks.id }).from(cyberAttacks).where(eq(cyberAttacks.linkId, linkId));
  return NextResponse.json({ valid: !!attack });
}
