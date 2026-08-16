import express from 'express';
import { db } from '../db.js';
import { surveys, surveyCommonDetails, inventoryItems } from '../models/schema.js';
import { residentialProfiles, residentialOccupancy, residentialAppliances, evCharging, backupPowerSources, solarInstallations, residentialCommonLoadsInfo, residentialCommonLoads, residentialLoadFlexibility } from '../models/residential.js';
import { commercialProfiles, commercialShifts, commercialControls } from '../models/commercial.js';
import { industrialProfiles, industrialShifts, productionProcesses, processDependencies as processDependenciesTable, industrialControls } from '../models/industrial.js';
import { demandResponseProfiles, drLoadSelections, commercialDemandResponse, industrialDemandResponse } from '../models/demand_response.js';
import { eq, and, sql } from 'drizzle-orm';
import { requireAuth, requireRole, checkSurveyOwnership, checkSurveyStatus, checkVersionBody } from '../middlewares.js';
import { fetchFullSurvey } from '../services/surveyFetcher.js';
import { validateSurveyData } from '../services/validator.js';

export const surveyRouter = express.Router();

surveyRouter.use(requireAuth);
surveyRouter.use(requireRole(['agent', 'admin']));

// Atomic Version Bumper Helper
const bumpVersionAtomic = async (tx, surveyId, clientVersion) => {
  const result = await tx.update(surveys)
    .set({ 
      version: sql`${surveys.version} + 1`, 
      updatedAt: new Date() 
    })
    .where(and(eq(surveys.id, surveyId), eq(surveys.version, clientVersion)))
    .returning({ newVersion: surveys.version });
    
  if (result.length === 0) {
    throw new Error("VERSION_MISMATCH");
  }
  return result[0].newVersion;
};


// Helper to safely upsert sections even if data is empty
const upsertSection = async (tx, table, surveyId, data) => {
  // Filter out fields with undefined values and convert empty strings to null to prevent DB casting errors
  const cleanData = {};
  if (data) {
    for (const [k, v] of Object.entries(data)) {
      if (v !== undefined) {
        cleanData[k] = v === '' ? null : v;
      }
    }
  }

  if (Object.keys(cleanData).length > 0) {
    await tx.insert(table).values({ surveyId, ...cleanData }).onConflictDoUpdate({ target: table.surveyId, set: cleanData });
  } else {
    await tx.insert(table).values({ surveyId }).onConflictDoNothing();
  }
};

// Helper to clean array data
const cleanArrayData = (arr) => {
  return arr.map(item => {
    const cleanItem = {};
    for (const [k, v] of Object.entries(item)) {
      if (v !== undefined && !['id', 'surveyId', 'createdAt', 'updatedAt'].includes(k)) {
        cleanItem[k] = v === '' ? null : v;
      }
    }
    return cleanItem;
  });
};

// GET /api/surveys (List Agent's Surveys)
surveyRouter.get('/', async (req, res) => {
  try {
    const list = await db.select({
      survey: surveys,
      consumerName: surveyCommonDetails.respondentName
    })
    .from(surveys)
    .leftJoin(surveyCommonDetails, eq(surveys.id, surveyCommonDetails.surveyId))
    .where(eq(surveys.agentId, req.user.id));
    
    const flatList = list.map(row => ({
      ...row.survey,
      consumerName: row.consumerName
    }));
    
    res.json(flatList);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch surveys" });
  }
});

// POST /api/surveys (Create Draft)
surveyRouter.post('/', async (req, res) => {
  const { consumerCategory, consumerSubcategory } = req.body;
  if (!consumerCategory) return res.status(400).json({ error: "consumerCategory is required" });

  try {
    // Generate a collision-resistant survey number using the current DB count atomically
    const [{ surveyCount }] = await db.select({ surveyCount: sql`count(*)::int` }).from(surveys);
    const paddedNum = String(Number(surveyCount) + 1).padStart(6, '0');
    const surveyNumber = `SUR-${new Date().getFullYear()}-${paddedNum}`;

    const [newSurvey] = await db.insert(surveys).values({
      agentId: req.user.id,
      consumerCategory,
      consumerSubcategory,
      surveyNumber,
      status: 'DRAFT',
      version: 1
    }).returning();
    res.json(newSurvey);
  } catch (error) {
    console.error("Survey creation error:", error);
    res.status(500).json({ error: "Failed to create survey" });
  }
});

// GET /api/surveys/:id (Get Single Survey)
surveyRouter.get('/:id', checkSurveyOwnership, async (req, res) => {
  try {
    const fullSurvey = await fetchFullSurvey(req.survey.id);
    if (!fullSurvey) return res.status(404).json({ error: "Survey not found" });

    res.json(fullSurvey);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch survey details" });
  }
});

// PUT /api/surveys/:id/common
surveyRouter.put('/:id/common', checkSurveyOwnership, checkSurveyStatus(['DRAFT']), checkVersionBody, async (req, res) => {
  const { version, data } = req.body;
  try {
    let newVersion;
    await db.transaction(async (tx) => {
      newVersion = await bumpVersionAtomic(tx, req.survey.id, version);
      await upsertSection(tx, surveyCommonDetails, req.survey.id, data);
    });
    res.json({ success: true, newVersion });
  } catch (error) {
    if (error.message === "VERSION_MISMATCH") return res.status(409).json({ error: "Conflict: Version mismatch" });
    console.error("[PUT /common] Tx error:", error);
    res.status(500).json({ error: "Failed to save common details" });
  }
});

// PUT /api/surveys/:id/inventory
surveyRouter.put('/:id/inventory', checkSurveyOwnership, checkSurveyStatus(['DRAFT']), checkVersionBody, async (req, res) => {
  const { version, items } = req.body;
  try {
    let newVersion;
    await db.transaction(async (tx) => {
      newVersion = await bumpVersionAtomic(tx, req.survey.id, version);
      await tx.delete(inventoryItems).where(eq(inventoryItems.surveyId, req.survey.id));
      if (items && items.length > 0) {
        await tx.insert(inventoryItems).values(cleanArrayData(items).map(item => ({ surveyId: req.survey.id, ...item })));
      }
    });
    res.json({ success: true, newVersion });
  } catch (error) {
    if (error.message === "VERSION_MISMATCH") return res.status(409).json({ error: "Conflict: Version mismatch" });
    console.error("[PUT /inventory] Tx error:", error);
    res.status(500).json({ error: "Failed to save inventory items" });
  }
});

// PUT /api/surveys/:id/residential
surveyRouter.put('/:id/residential', checkSurveyOwnership, checkSurveyStatus(['DRAFT']), checkVersionBody, async (req, res) => {
  const { version, profiles, occupancy, appliances, ev, backup, solar, commonLoadsInfo, commonLoads, loadFlexibility } = req.body;
  try {
    let newVersion;
    await db.transaction(async (tx) => {
      newVersion = await bumpVersionAtomic(tx, req.survey.id, version);
      
      if (profiles) await upsertSection(tx, residentialProfiles, req.survey.id, profiles);
      
      if (occupancy) {
        await tx.delete(residentialOccupancy).where(eq(residentialOccupancy.surveyId, req.survey.id));
        if (occupancy.length > 0) await tx.insert(residentialOccupancy).values(cleanArrayData(occupancy).map(o => ({ surveyId: req.survey.id, ...o })));
      }
      
      if (appliances) {
        await tx.delete(residentialAppliances).where(eq(residentialAppliances.surveyId, req.survey.id));
        if (appliances.length > 0) await tx.insert(residentialAppliances).values(cleanArrayData(appliances).map(a => ({ surveyId: req.survey.id, ...a })));
      }
      
      if (ev) await upsertSection(tx, evCharging, req.survey.id, ev);
      
      if (backup) {
        await tx.delete(backupPowerSources).where(eq(backupPowerSources.surveyId, req.survey.id));
        if (backup.length > 0) await tx.insert(backupPowerSources).values(cleanArrayData(backup).map(b => ({ surveyId: req.survey.id, ...b })));
      }
      
      if (solar) await upsertSection(tx, solarInstallations, req.survey.id, solar);

      if (commonLoadsInfo) await upsertSection(tx, residentialCommonLoadsInfo, req.survey.id, commonLoadsInfo);
      
      if (commonLoads) {
        await tx.delete(residentialCommonLoads).where(eq(residentialCommonLoads.surveyId, req.survey.id));
        if (commonLoads.length > 0) await tx.insert(residentialCommonLoads).values(cleanArrayData(commonLoads).map(c => ({ surveyId: req.survey.id, ...c })));
      }
      
      if (loadFlexibility) await upsertSection(tx, residentialLoadFlexibility, req.survey.id, loadFlexibility);
    });
    res.json({ success: true, newVersion });
  } catch (error) {
    if (error.message === "VERSION_MISMATCH") return res.status(409).json({ error: "Conflict: Version mismatch" });
    console.error("[PUT /residential] Tx error:", error);
    res.status(500).json({ error: "Failed to save residential data" });
  }
});

// PUT /api/surveys/:id/commercial
surveyRouter.put('/:id/commercial', checkSurveyOwnership, checkSurveyStatus(['DRAFT']), checkVersionBody, async (req, res) => {
  const { version, profiles, shifts, controls } = req.body;
  try {
    let newVersion;
    await db.transaction(async (tx) => {
      newVersion = await bumpVersionAtomic(tx, req.survey.id, version);
      if (profiles) await upsertSection(tx, commercialProfiles, req.survey.id, profiles);
      if (shifts) {
        await tx.delete(commercialShifts).where(eq(commercialShifts.surveyId, req.survey.id));
        if (shifts.length > 0) await tx.insert(commercialShifts).values(cleanArrayData(shifts).map(s => ({ surveyId: req.survey.id, ...s })));
      }
      if (controls) await upsertSection(tx, commercialControls, req.survey.id, controls);
    });
    res.json({ success: true, newVersion });
  } catch (error) {
    if (error.message === "VERSION_MISMATCH") return res.status(409).json({ error: "Conflict: Version mismatch" });
    console.error("[PUT /commercial] Tx error:", error);
    res.status(500).json({ error: "Failed to save commercial data" });
  }
});

// PUT /api/surveys/:id/industrial
surveyRouter.put('/:id/industrial', checkSurveyOwnership, checkSurveyStatus(['DRAFT']), checkVersionBody, async (req, res) => {
  const { version, profiles, shifts, processes, processDependencies, controls } = req.body;
  try {
    let newVersion;
    await db.transaction(async (tx) => {
      newVersion = await bumpVersionAtomic(tx, req.survey.id, version);
      if (profiles) await upsertSection(tx, industrialProfiles, req.survey.id, profiles);
      if (shifts) {
        await tx.delete(industrialShifts).where(eq(industrialShifts.surveyId, req.survey.id));
        if (shifts.length > 0) await tx.insert(industrialShifts).values(cleanArrayData(shifts).map(s => ({ surveyId: req.survey.id, ...s })));
      }
      if (processes) {
        await tx.delete(productionProcesses).where(eq(productionProcesses.surveyId, req.survey.id));
        if (processes.length > 0) await tx.insert(productionProcesses).values(cleanArrayData(processes).map(p => ({ surveyId: req.survey.id, ...p })));
      }
      
      if (processDependencies) {
        await tx.delete(processDependenciesTable).where(eq(processDependenciesTable.surveyId, req.survey.id));
        if (processDependencies.length > 0) await tx.insert(processDependenciesTable).values(cleanArrayData(processDependencies).map(pd => ({ surveyId: req.survey.id, ...pd })));
      }
      
      if (controls) await upsertSection(tx, industrialControls, req.survey.id, controls);
    });
    res.json({ success: true, newVersion });
  } catch (error) {
    if (error.message === "VERSION_MISMATCH") return res.status(409).json({ error: "Conflict: Version mismatch" });
    console.error("[PUT /industrial] Tx error:", error);
    res.status(500).json({ error: "Failed to save industrial data" });
  }
});

// PUT /api/surveys/:id/demand-response
surveyRouter.put('/:id/demand-response', checkSurveyOwnership, checkSurveyStatus(['DRAFT']), checkVersionBody, async (req, res) => {
  const { version, profiles, loadSelections, commercialDR, industrialDR } = req.body;
  try {
    let newVersion;
    await db.transaction(async (tx) => {
      newVersion = await bumpVersionAtomic(tx, req.survey.id, version);
      if (profiles) await upsertSection(tx, demandResponseProfiles, req.survey.id, profiles);
      
      if (commercialDR) await upsertSection(tx, commercialDemandResponse, req.survey.id, commercialDR);
      
      if (industrialDR) await upsertSection(tx, industrialDemandResponse, req.survey.id, industrialDR);
      
      if (loadSelections) {
        await tx.delete(drLoadSelections).where(eq(drLoadSelections.surveyId, req.survey.id));
        if (loadSelections.length > 0) await tx.insert(drLoadSelections).values(cleanArrayData(loadSelections).map(l => ({ surveyId: req.survey.id, ...l })));
      }
    });
    res.json({ success: true, newVersion });
  } catch (error) {
    if (error.message === "VERSION_MISMATCH") return res.status(409).json({ error: "Conflict: Version mismatch" });
    console.error("[PUT /demand-response] Tx error:", error);
    res.status(500).json({ error: "Failed to save demand response data" });
  }
});

// GET /api/surveys/:id/validate (Soft Validation Engine)
surveyRouter.get('/:id/validate', checkSurveyOwnership, async (req, res) => {
  try {
    const fullSurvey = await fetchFullSurvey(req.params.id);
    if (!fullSurvey) return res.status(404).json({ error: "Survey not found" });

    const validationResult = validateSurveyData(fullSurvey);
    res.json(validationResult);
  } catch (error) {
    res.status(500).json({ error: "Failed to validate survey" });
  }
});

// POST /api/surveys/:id/submit
surveyRouter.post('/:id/submit', checkSurveyOwnership, checkSurveyStatus(['DRAFT']), async (req, res) => {
  const { version } = req.body;
  if (!version) return res.status(400).json({ error: "version is required to prevent race conditions during submission" });

  try {
    // 1. Fetch full state and generate warnings at the exact time of submission
    const fullSurvey = await fetchFullSurvey(req.survey.id);
    if (!fullSurvey) return res.status(404).json({ error: "Survey not found" });

    const validationResult = validateSurveyData(fullSurvey);

    // 2. Atomic submit with optimistic locking
    const result = await db.update(surveys)
      .set({ 
        status: 'SUBMITTED', 
        submittedAt: new Date(), 
        updatedAt: new Date(),
        validationWarnings: validationResult.warnings,
        version: sql`${surveys.version} + 1`
      })
      .where(and(eq(surveys.id, req.survey.id), eq(surveys.status, 'DRAFT'), eq(surveys.version, version)))
      .returning({ id: surveys.id });

    if (!result || result.length === 0) {
      return res.status(409).json({ error: "Conflict: Survey already submitted or modified by another process. Please refresh and try again." });
    }
    
    res.json({ success: true, status: "SUBMITTED", warnings: validationResult.warnings });
  } catch (error) {
    res.status(500).json({ error: "Failed to submit survey" });
  }
});
