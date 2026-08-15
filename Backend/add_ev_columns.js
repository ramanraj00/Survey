import { db } from './db.js';
async function run() {
  try {
    await db.execute('ALTER TABLE "ev_charging" ADD COLUMN IF NOT EXISTS "charging_frequency" text;');
    await db.execute('ALTER TABLE "ev_charging" ADD COLUMN IF NOT EXISTS "peak_shift_ability" text;');
    console.log("Added charging_frequency and peak_shift_ability successfully!");
    process.exit(0);
  } catch (err) {
    console.error("Failed to add columns:", err);
    process.exit(1);
  }
}
run();
