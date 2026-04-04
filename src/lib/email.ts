import { Resend } from "resend";

function getResend() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  return new Resend(apiKey);
}

export async function sendPasswordResetEmail(email: string, code: string) {
  const resend = getResend();

  if (!resend) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(`Resend not configured. Password reset code for ${email}: ${code}`);
      return { delivered: false as const, fallback: true as const };
    }
    throw new Error("RESEND_API_KEY is not configured");
  }

  const from = process.env.EMAIL_FROM || "SageTech <noreply@sagetech.app>";

  await resend.emails.send({
    from,
    to: email,
    subject: "SageTech Password Reset Code",
    text: `Your SageTech password reset code is ${code}. It expires in 15 minutes.`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #111827;">
        <h2 style="margin-bottom: 12px;">SageTech Password Reset</h2>
        <p>Your password reset code is:</p>
        <p style="font-size: 24px; font-weight: 700; letter-spacing: 4px; margin: 16px 0;">${code}</p>
        <p>This code expires in 15 minutes.</p>
        <p>If you did not request this, you can ignore this email.</p>
      </div>
    `,
  });

  return { delivered: true as const, fallback: false as const };
}
