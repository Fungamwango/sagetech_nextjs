import nodemailer from "nodemailer";

function getSmtpConfig() {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM || user;
  const secure = process.env.SMTP_SECURE === "true" || port === 465;

  if (!host || !user || !pass || !from) {
    return null;
  }

  return {
    host,
    port,
    secure,
    auth: { user, pass },
    from,
  };
}

export async function sendPasswordResetEmail(email: string, code: string) {
  const config = getSmtpConfig();

  if (!config) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(`SMTP not configured. Password reset code for ${email}: ${code}`);
      return { delivered: false as const, fallback: true as const };
    }
    throw new Error("SMTP is not configured");
  }

  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: config.auth,
  });

  await transporter.sendMail({
    from: config.from,
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
