import { db } from './db.js';
import * as schema from './models/schema.js';
import * as residential from './models/residential.js';

async function run() {
  const [survey] = await db.select().from(schema.surveys).limit(1);
  if (!survey) { console.log("No survey found"); process.exit(0); }
  const surveyId = survey.id;
  
  const tables = [
    { name: 'residentialProfiles', table: residential.residentialProfiles, data: { adultCount: 2 } },
    { name: 'evCharging', table: residential.evCharging, data: { vehicleCount: 1, chargingFrequency: 'Daily' } },
    { name: 'solarInstallations', table: residential.solarInstallations, data: { installed: true } },
    { name: 'backupPowerSources', table: residential.backupPowerSources, data: { available: true } },
    { name: 'residentialAppliances', table: residential.residentialAppliances, data: { available: true } },
    { name: 'residentialOccupancy', table: residential.residentialOccupancy, data: { weekdayOccupancy: 'yes' } },
    { name: 'residentialCommonLoadsInfo', table: residential.residentialCommonLoadsInfo, data: { hasSeparateConnection: true } },
    { name: 'residentialCommonLoads', table: residential.residentialCommonLoads, data: { loadType: 'LIFT' } },
    { name: 'residentialLoadFlexibility', table: residential.residentialLoadFlexibility, data: { acTemperatureAdjustment: 'yes' } },
  ];
  
  for (const t of tables) {
    try {
      await db.insert(t.table).values({ surveyId, ...t.data }).onConflictDoNothing();
      console.log(`Table ${t.name} OK`);
    } catch (e) {
      console.error(`Table ${t.name} FAILED:`, e.message);
    }
  }
  process.exit(0);
}
run();
