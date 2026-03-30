import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db, cyberAttacks } from "@/lib/db";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { targetPhone, targetEmail, attackType, emailSubject, message, buttonName, buttonColor, linkId, linkUrl } = body;

  if (!attackType || !message || !linkId || !linkUrl) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  await db.insert(cyberAttacks).values({
    senderId: user.id,
    targetPhone: targetPhone || "unset",
    targetEmail: targetEmail || "unset",
    attackType,
    emailSubject: emailSubject || "unset",
    message,
    buttonName: buttonName || "Click here to find out",
    buttonColor: buttonColor || "#085",
    linkId,
    linkUrl,
  });

  return NextResponse.json({ success: true });
}
