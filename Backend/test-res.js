import 'dotenv/config';
import { db } from './db.js';
import { residentialProfiles, evCharging } from './models/residential.js';

async function test() {
  try {
    await db.transaction(async (tx) => {
      // simulate the empty upsert
      const table = residentialProfiles;
      const surveyId = '80ef1372-f67e-46f3-9ce1-38374a496f30'; // valid uuid format
      await tx.insert(table).values({ surveyId }).onConflictDoNothing();
      console.log("Upserted empty profile");
    });
  } catch (error) {
    console.error("DB Error:", error);
  }
}
test();
