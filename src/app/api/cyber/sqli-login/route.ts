// Intentionally vulnerable SQL injection lab endpoint - for educational use only.
// DO NOT use patterns from this file in production code.
import { NextRequest, NextResponse } from "next/server";
import { Pool, neonConfig } from "@neondatabase/serverless";
import ws from "ws";

neonConfig.webSocketConstructor = ws;

function getPool() {
  const connStr = (process.env.DATABASE_URL ?? "").replace(/[&?]channel_binding=require/g, "");
  return new Pool({ connectionString: connStr });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { level, phoneNumber, password, gender, date } = body;
  const pool = getPool();

  try {
    let rows: unknown[] = [];

    if (level === 1) {
      // Level 1 (weak): raw concatenation - intentionally vulnerable
      const query = `SELECT * FROM sqli_admin WHERE login_password='${password}' AND login_number='${phoneNumber}'`;
      const result = await pool.query(query);
      rows = result.rows;
    } else if (level === 2) {
      // Level 2 (medium): gender not escaped - intentionally vulnerable
      const query = `SELECT * FROM sqli_admin WHERE login_password='${password}' AND gender='${gender}'`;
      const result = await pool.query(query);
      rows = result.rows;
    } else if (level === 3) {
      // Level 3 (strong): date inserted raw - intentionally vulnerable
      const result = await pool.query(`SELECT * FROM sqli_admin WHERE login_password='${password}'`);
      rows = result.rows;
      if (date) {
        await pool.query(`INSERT INTO sqli_login_date(log_in_date) VALUES('${date}')`);
      }
    } else if (level === 4) {
      // Level 4 (impossible): both fields escaped properly - use parameterised
      const result = await pool.query(
        "SELECT * FROM sqli_admin WHERE login_password=$1 AND login_number=$2",
        [password, phoneNumber]
      );
      rows = result.rows;
    }

    const success = Array.isArray(rows) && rows.length > 0;
    return NextResponse.json({ success });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  } finally {
    await pool.end();
  }
}
