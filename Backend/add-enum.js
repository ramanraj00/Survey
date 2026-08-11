import { db } from './db.js';
import { sql } from "drizzle-orm";

async function addEnum() {
  try {
    await db.execute(sql`ALTER TYPE consumer_category ADD VALUE IF NOT EXISTS 'INVENTORY'`);
    console.log("Successfully added INVENTORY to consumer_category enum");
  } catch (err) {
    console.error(err);
  }
  process.exit(0);
}

addEnum();
