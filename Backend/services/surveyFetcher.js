import { db } from '../db.js';
import { surveys, surveyCommonDetails, inventoryItems } from '../models/schema.js';
import { residentialProfiles, residentialOccupancy, residentialAppliances, evCharging, backupPowerSources, solarInstallations, residentialCommonLoadsInfo, residentialCommonLoads, residentialLoadFlexibility } from '../models/residential.js';
import { commercialProfiles, commercialShifts, commercialControls } from '../models/commercial.js';
import { industrialProfiles, industrialShifts, productionProcesses, industrialControls, processDependencies as processDependenciesTable } from '../models/industrial.js';
import { demandResponseProfiles, drLoadSelections, commercialDemandResponse, industrialDemandResponse } from '../models/demand_response.js';
import { eq } from 'drizzle-orm';

/**
 * Fetches the entire 360 view of a survey concurrently.
 * @param {string} id - The survey UUID
 * @returns {Promise<Object|null>} The complete survey object or null if not found.
 */
export async function fetchFullSurvey(id) {
  const [survey] = await db.select().from(surveys).where(eq(surveys.id, id));
  if (!survey) return null;

  const results = await Promise.all([
    db.select().from(surveyCommonDetails).where(eq(surveyCommonDetails.surveyId, id)),
    db.select().from(inventoryItems).where(eq(inventoryItems.surveyId, id)),
    
    // Residential (2-10)
    db.select().from(residentialProfiles).where(eq(residentialProfiles.surveyId, id)),
    db.select().from(residentialOccupancy).where(eq(residentialOccupancy.surveyId, id)),
    db.select().from(residentialAppliances).where(eq(residentialAppliances.surveyId, id)),
    db.select().from(evCharging).where(eq(evCharging.surveyId, id)),
    db.select().from(backupPowerSources).where(eq(backupPowerSources.surveyId, id)),
    db.select().from(solarInstallations).where(eq(solarInstallations.surveyId, id)),
    db.select().from(residentialCommonLoadsInfo).where(eq(residentialCommonLoadsInfo.surveyId, id)),
    db.select().from(residentialCommonLoads).where(eq(residentialCommonLoads.surveyId, id)),
    db.select().from(residentialLoadFlexibility).where(eq(residentialLoadFlexibility.surveyId, id)),
    
    // Commercial (11-13)
    db.select().from(commercialProfiles).where(eq(commercialProfiles.surveyId, id)),
    db.select().from(commercialShifts).where(eq(commercialShifts.surveyId, id)),
    db.select().from(commercialControls).where(eq(commercialControls.surveyId, id)),
    
    // Industrial (14-18)
    db.select().from(industrialProfiles).where(eq(industrialProfiles.surveyId, id)),
    db.select().from(industrialShifts).where(eq(industrialShifts.surveyId, id)),
    db.select().from(productionProcesses).where(eq(productionProcesses.surveyId, id)),
    db.select().from(processDependenciesTable).where(eq(processDependenciesTable.surveyId, id)),
    db.select().from(industrialControls).where(eq(industrialControls.surveyId, id)),
    
    // Demand Response (19-22)
    db.select().from(demandResponseProfiles).where(eq(demandResponseProfiles.surveyId, id)),
    db.select().from(commercialDemandResponse).where(eq(commercialDemandResponse.surveyId, id)),
    db.select().from(industrialDemandResponse).where(eq(industrialDemandResponse.surveyId, id)),
    db.select().from(drLoadSelections).where(eq(drLoadSelections.surveyId, id))
  ]);

  return { 
    survey, 
    commonDetails: results[0][0] || null, 
    inventoryItems: results[1] || [],
    residential: {
      profiles: results[2][0] || null,
      occupancy: results[3] || [],
      appliances: results[4] || [],
      ev: results[5][0] || null,
      backup: results[6] || [],
      solar: results[7][0] || null,
      commonLoadsInfo: results[8][0] || null,
      commonLoads: results[9] || [],
      loadFlexibility: results[10][0] || null
    },
    commercial: {
      profiles: results[11][0] || null,
      shifts: results[12] || [],
      controls: results[13][0] || null
    },
    industrial: {
      profiles: results[14][0] || null,
      shifts: results[15] || [],
      processes: results[16] || [],
      processDependencies: results[17] || [],
      controls: results[18][0] || null
    },
    demandResponse: {
      profiles: results[19][0] || null,
      commercialDR: results[20][0] || null,
      industrialDR: results[21][0] || null,
      loadSelections: results[22] || []
    }
  };
}
