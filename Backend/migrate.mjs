import 'dotenv/config';
import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

neonConfig.webSocketConstructor = ws;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function run() {
  try {
    await pool.query(`ALTER TABLE demand_response_profiles ALTER COLUMN required_advance_notice TYPE text USING required_advance_notice::text`);
    await pool.query(`ALTER TABLE demand_response_profiles ALTER COLUMN automation_interest TYPE text USING automation_interest::text`);
    console.log("Migration Success");
  } catch (err) {
    console.error("PG Error:", err.message);
  } finally {
    await pool.end();
  }
}

run();
