import 'dotenv/config';
import { db } from './db.js';
import { surveys } from './models/schema.js';
import { auth } from './auth.js';

async function test() {
  try {
    const surveyList = await db.select().from(surveys).limit(1);
    const survey = surveyList[0];
    if (!survey) { console.log("No surveys found"); return; }
    
    // We need an agent token or we just mock the request directly to the router
    // Or we can just use the db transaction code directly
    
    // Let's run exactly what PUT /residential runs:
    const { residentialProfiles, residentialOccupancy, residentialAppliances, evCharging, backupPowerSources, solarInstallations, residentialCommonLoadsInfo, residentialCommonLoads, residentialLoadFlexibility } = await import('./models/residential.js');
    const { eq } = await import('drizzle-orm');

    const upsertSection = async (tx, table, surveyId, data) => {
      const cleanData = {};
      if (data) {
        for (const [k, v] of Object.entries(data)) {
          if (v !== undefined) cleanData[k] = v;
        }
      }
      if (Object.keys(cleanData).length > 0) {
        await tx.insert(table).values({ surveyId, ...cleanData }).onConflictDoUpdate({ target: table.surveyId, set: cleanData });
      } else {
        await tx.insert(table).values({ surveyId }).onConflictDoNothing();
      }
    };

    const req = { survey: { id: survey.id }, body: { 
      version: survey.version,
      profiles: {}, occupancy: [], appliances: [], ev: {}, backup: [], solar: {}, commonLoadsInfo: {}, commonLoads: [], loadFlexibility: {}
    }};

    const { profiles, occupancy, appliances, ev, backup, solar, commonLoadsInfo, commonLoads, loadFlexibility } = req.body;
    
    await db.transaction(async (tx) => {
      console.log("Upserting profiles...");
      if (profiles) await upsertSection(tx, residentialProfiles, req.survey.id, profiles);
      console.log("Upserting occupancy...");
      if (occupancy) {
        await tx.delete(residentialOccupancy).where(eq(residentialOccupancy.surveyId, req.survey.id));
        if (occupancy.length > 0) await tx.insert(residentialOccupancy).values(occupancy.map(o => ({ surveyId: req.survey.id, ...o })));
      }
      console.log("Upserting appliances...");
      if (appliances) {
        await tx.delete(residentialAppliances).where(eq(residentialAppliances.surveyId, req.survey.id));
        if (appliances.length > 0) await tx.insert(residentialAppliances).values(appliances.map(a => ({ surveyId: req.survey.id, ...a })));
      }
      console.log("Upserting ev...");
      if (ev) await upsertSection(tx, evCharging, req.survey.id, ev);
      console.log("Upserting backup...");
      if (backup) {
        await tx.delete(backupPowerSources).where(eq(backupPowerSources.surveyId, req.survey.id));
        if (backup.length > 0) await tx.insert(backupPowerSources).values(backup.map(b => ({ surveyId: req.survey.id, ...b })));
      }
      console.log("Upserting solar...");
      if (solar) await upsertSection(tx, solarInstallations, req.survey.id, solar);
      console.log("Upserting commonLoadsInfo...");
      if (commonLoadsInfo) await upsertSection(tx, residentialCommonLoadsInfo, req.survey.id, commonLoadsInfo);
      console.log("Upserting commonLoads...");
      if (commonLoads) {
        await tx.delete(residentialCommonLoads).where(eq(residentialCommonLoads.surveyId, req.survey.id));
        if (commonLoads.length > 0) await tx.insert(residentialCommonLoads).values(commonLoads.map(c => ({ surveyId: req.survey.id, ...c })));
      }
      console.log("Upserting loadFlexibility...");
      if (loadFlexibility) await upsertSection(tx, residentialLoadFlexibility, req.survey.id, loadFlexibility);
    });
    console.log("Transaction SUCCESS!");
  } catch (error) {
    console.error("Test Error:", error);
  }
}
test();
