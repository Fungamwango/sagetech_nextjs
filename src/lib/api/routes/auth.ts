import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { users, passwordResetCodes } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import { createSession, destroySession, getSession } from "@/lib/auth";
import { generateResetCode } from "@/lib/utils";
import { sendPasswordResetEmail } from "@/lib/email";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(4, "Password too short"),
});

const registerSchema = z.object({
  username: z.string().min(4).max(50),
  email: z.string().email(),
  password: z.string().min(4).max(100),
});

const changePasswordSchema = z.object({
  code: z.string().length(6),
  email: z.string().email(),
  newPassword: z.string().min(4),
});

const checkResetCodeSchema = z.object({
  code: z.string().length(6),
  email: z.string().email(),
});

export const authRouter = new Hono()
  .post("/login", zValidator("json", loginSchema), async (c) => {
    const { email, password } = c.req.valid("json");

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!user) {
      return c.json({ error: "Wrong password or email" }, 401);
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return c.json({ error: "Wrong password or email" }, 401);
    }

    await createSession(user.id, user.username);

    return c.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        picture: user.picture,
        points: user.points,
        level: user.level,
      },
    });
  })
  .post("/register", zValidator("json", registerSchema), async (c) => {
    const { username, email, password } = c.req.valid("json");

    const [existingEmail] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingEmail) {
      return c.json({ error: "The email is already in use with another account" }, 409);
    }

    const [existingUsername] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.username, username))
      .limit(1);

    if (existingUsername) {
      return c.json({ error: "Username already taken" }, 409);
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const [newUser] = await db
      .insert(users)
      .values({
        username,
        email,
        password: hashedPassword,
        points: "1000",
        level: "intermediate",
      })
      .returning({ id: users.id, username: users.username, email: users.email });

    await createSession(newUser.id, newUser.username);

    return c.json({ success: true, user: newUser }, 201);
  })
  .post("/logout", async (c) => {
    await destroySession();
    return c.json({ success: true });
  })
  .get("/me", async (c) => {
    const session = await getSession();
    if (!session) return c.json({ user: null });

    const [user] = await db
      .select({
        id: users.id,
        username: users.username,
        email: users.email,
        picture: users.picture,
        bio: users.bio,
        points: users.points,
        awards: users.awards,
        level: users.level,
        isOnline: users.isOnline,
        isMonetised: users.isMonetised,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.id, session.userId))
      .limit(1);

    return c.json({ user: user ?? null });
  })
  .get("/check-email/:email", async (c) => {
    const email = c.req.param("email");
    const [user] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    return c.json({ taken: !!user });
  })
  .post(
    "/forgot-password",
    zValidator("json", z.object({ email: z.string().email() })),
    async (c) => {
      const { email } = c.req.valid("json");

      const [user] = await db
        .select({ id: users.id, email: users.email })
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      if (!user) {
        return c.json({ error: "This email is not registered with any account" }, 404);
      }

      const code = generateResetCode();
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

      await db.insert(passwordResetCodes).values({
        userId: user.id,
        code,
        expiresAt,
      });

      try {
        const mail = await sendPasswordResetEmail(user.email, code);
        return c.json({
          success: true,
          message: mail.delivered
            ? "Reset code sent to your email"
            : "SMTP is not configured. Check the server logs for the reset code.",
        });
      } catch (error) {
        console.error("Failed to send password reset email", error);
        return c.json({ error: "Failed to send reset email" }, 500);
      }
    }
  )
  .post("/check-reset-code", zValidator("json", checkResetCodeSchema), async (c) => {
    const { code, email } = c.req.valid("json");

    const [user] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!user) return c.json({ error: "User not found" }, 404);

    const [resetCode] = await db
      .select()
      .from(passwordResetCodes)
      .where(eq(passwordResetCodes.userId, user.id))
      .orderBy(desc(passwordResetCodes.createdAt))
      .limit(1);

    if (!resetCode || resetCode.code !== code || resetCode.used) {
      return c.json({ error: "Invalid or expired code" }, 400);
    }

    if (new Date() > resetCode.expiresAt) {
      return c.json({ error: "Code expired" }, 400);
    }

    return c.json({ success: true });
  })
  .post("/reset-password", zValidator("json", changePasswordSchema), async (c) => {
    const { code, email, newPassword } = c.req.valid("json");

    const [user] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!user) return c.json({ error: "User not found" }, 404);

    const [resetCode] = await db
      .select()
      .from(passwordResetCodes)
      .where(eq(passwordResetCodes.userId, user.id))
      .orderBy(desc(passwordResetCodes.createdAt))
      .limit(1);

    if (!resetCode || resetCode.code !== code || resetCode.used) {
      return c.json({ error: "Invalid or expired code" }, 400);
    }

    if (new Date() > resetCode.expiresAt) {
      return c.json({ error: "Code expired" }, 400);
    }

    const hashed = await bcrypt.hash(newPassword, 12);
    await db.update(users).set({ password: hashed }).where(eq(users.id, user.id));
    await db
      .update(passwordResetCodes)
      .set({ used: true })
      .where(eq(passwordResetCodes.id, resetCode.id));

    const [updatedUser] = await db
      .select({ username: users.username })
      .from(users)
      .where(eq(users.id, user.id))
      .limit(1);

    return c.json({ success: true, username: updatedUser?.username ?? null });
  });
