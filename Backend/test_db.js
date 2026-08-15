import { db } from './db.js';
import { surveys } from './models/schema.js';
async function test() {
  const data = await db.select().from(surveys);
  console.log('Total surveys:', data.length);
  process.exit(0);
}
test();
