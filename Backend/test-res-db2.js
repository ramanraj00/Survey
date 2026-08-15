import { db } from './db.js';
import { residentialProfiles } from './models/residential.js';
const res = await db.select().from(residentialProfiles);
console.log('Residential profiles:', JSON.stringify(res, null, 2));
process.exit(0);
