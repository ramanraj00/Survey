import { db } from './db.js';

async function run() {
  try {
    await db.execute('DROP TABLE IF EXISTS inventory_items CASCADE');
    await db.execute('DROP TABLE IF EXISTS surveys CASCADE');
    console.log('Successfully dropped conflicting tables');
  } catch (error) {
    console.error('Error dropping tables:', error);
  }
  process.exit(0);
}

run();
