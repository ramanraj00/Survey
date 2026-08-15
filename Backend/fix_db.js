import { db } from './db.js';
import fs from 'fs';
async function run() {
  try {
    const sqlStr = fs.readFileSync('drizzle/0001_good_boom_boom.sql', 'utf8');
    await db.execute(sqlStr);
    console.log("Migration applied successfully!");
    process.exit(0);
  } catch (err) {
    console.error("Migration failed:", err);
    process.exit(1);
  }
}
run();
