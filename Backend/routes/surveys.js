import express from 'express';
import { db } from '../db.js';
import { surveys, surveyCommonDetails, inventoryItems } from '../models/schema.js';
import { residentialProfiles, residentialOccupancy, residentialAppliances, evCharging, backupPowerSources, solarInstallations, residentialCommonLoadsInfo, residentialCommonLoads, residentialLoadFlexibility } from '../models/residential.js';
import { commercialProfiles, commercialShifts, commercialControls } from '../models/commercial.js';
import { industrialProfiles, industrialShifts, productionProcesses, industrialControls } from '../models/industrial.js';
import { demandResponseProfiles, drLoadSelections, commercialDemandResponse, industrialDemandResponse } from '../models/demand_response.js';
import { eq, and, sql } from 'drizzle-orm';
import { requireAuth, requireRole, checkSurveyOwnership, checkSurveyStatus, checkVersionBody } from '../middlewares.js';

export const surveyRouter = express.Router();

surveyRouter.use(requireAuth);
surveyRouter.use(requireRole('agent'));

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

// GET /api/surveys (List Agent's Surveys)
surveyRouter.get('/', async (req, res) => {
  try {
    const list = await db.select().from(surveys).where(eq(surveys.agentId, req.user.id));
    res.json(list);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch surveys" });
  }
});

// POST /api/surveys (Create Draft)
surveyRouter.post('/', async (req, res) => {
  const { consumerCategory, consumerSubcategory } = req.body;
  if (!consumerCategory) return res.status(400).json({ error: "consumerCategory is required" });

  try {
    const surveyNumber = `SUR-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
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
    res.status(500).json({ error: "Failed to create survey" });
  }
});

// GET /api/surveys/:id (Get Single Survey)
surveyRouter.get('/:id', checkSurveyOwnership, async (req, res) => {
  res.json(req.survey); // Currently only returns core survey. Aggregation happens via Admin API or can be added here.
});

// PUT /api/surveys/:id/common
surveyRouter.put('/:id/common', checkSurveyOwnership, checkSurveyStatus(['DRAFT']), checkVersionBody, async (req, res) => {
  const { version, data } = req.body;
  try {
    let newVersion;
    await db.transaction(async (tx) => {
      newVersion = await bumpVersionAtomic(tx, req.survey.id, version);
      await tx.insert(surveyCommonDetails).values({ surveyId: req.survey.id, ...data })
        .onConflictDoUpdate({ target: surveyCommonDetails.surveyId, set: { ...data } });
    });
    res.json({ success: true, newVersion });
  } catch (error) {
    if (error.message === "VERSION_MISMATCH") return res.status(409).json({ error: "Conflict: Version mismatch" });
    res.status(500).json({ error: "Transaction failed" });
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
        await tx.insert(inventoryItems).values(items.map(item => ({ surveyId: req.survey.id, ...item })));
      }
    });
    res.json({ success: true, newVersion });
  } catch (error) {
    if (error.message === "VERSION_MISMATCH") return res.status(409).json({ error: "Conflict: Version mismatch" });
    res.status(500).json({ error: "Transaction failed" });
  }
});

// PUT /api/surveys/:id/residential
surveyRouter.put('/:id/residential', checkSurveyOwnership, checkSurveyStatus(['DRAFT']), checkVersionBody, async (req, res) => {
  const { version, profiles, occupancy, appliances, ev, backup, solar, commonLoadsInfo, commonLoads, loadFlexibility } = req.body;
  try {
    let newVersion;
    await db.transaction(async (tx) => {
      newVersion = await bumpVersionAtomic(tx, req.survey.id, version);
      
      if (profiles) await tx.insert(residentialProfiles).values({ surveyId: req.survey.id, ...profiles }).onConflictDoUpdate({ target: residentialProfiles.surveyId, set: { ...profiles } });
      
      if (occupancy) {
        await tx.delete(residentialOccupancy).where(eq(residentialOccupancy.surveyId, req.survey.id));
        if (occupancy.length > 0) await tx.insert(residentialOccupancy).values(occupancy.map(o => ({ surveyId: req.survey.id, ...o })));
      }
      
      if (appliances) {
        await tx.delete(residentialAppliances).where(eq(residentialAppliances.surveyId, req.survey.id));
        if (appliances.length > 0) await tx.insert(residentialAppliances).values(appliances.map(a => ({ surveyId: req.survey.id, ...a })));
      }
      
      if (ev) await tx.insert(evCharging).values({ surveyId: req.survey.id, ...ev }).onConflictDoUpdate({ target: evCharging.surveyId, set: { ...ev } });
      
      if (backup) {
        await tx.delete(backupPowerSources).where(eq(backupPowerSources.surveyId, req.survey.id));
        if (backup.length > 0) await tx.insert(backupPowerSources).values(backup.map(b => ({ surveyId: req.survey.id, ...b })));
      }
      
      if (solar) await tx.insert(solarInstallations).values({ surveyId: req.survey.id, ...solar }).onConflictDoUpdate({ target: solarInstallations.surveyId, set: { ...solar } });

      if (commonLoadsInfo) await tx.insert(residentialCommonLoadsInfo).values({ surveyId: req.survey.id, ...commonLoadsInfo }).onConflictDoUpdate({ target: residentialCommonLoadsInfo.surveyId, set: { ...commonLoadsInfo } });
      
      if (commonLoads) {
        await tx.delete(residentialCommonLoads).where(eq(residentialCommonLoads.surveyId, req.survey.id));
        if (commonLoads.length > 0) await tx.insert(residentialCommonLoads).values(commonLoads.map(c => ({ surveyId: req.survey.id, ...c })));
      }
      
      if (loadFlexibility) await tx.insert(residentialLoadFlexibility).values({ surveyId: req.survey.id, ...loadFlexibility }).onConflictDoUpdate({ target: residentialLoadFlexibility.surveyId, set: { ...loadFlexibility } });
    });
    res.json({ success: true, newVersion });
  } catch (error) {
    if (error.message === "VERSION_MISMATCH") return res.status(409).json({ error: "Conflict: Version mismatch" });
    res.status(500).json({ error: "Transaction failed", details: error.message });
  }
});

// PUT /api/surveys/:id/commercial
surveyRouter.put('/:id/commercial', checkSurveyOwnership, checkSurveyStatus(['DRAFT']), checkVersionBody, async (req, res) => {
  const { version, profiles, shifts, controls } = req.body;
  try {
    let newVersion;
    await db.transaction(async (tx) => {
      newVersion = await bumpVersionAtomic(tx, req.survey.id, version);
      if (profiles) await tx.insert(commercialProfiles).values({ surveyId: req.survey.id, ...profiles }).onConflictDoUpdate({ target: commercialProfiles.surveyId, set: { ...profiles } });
      if (shifts) {
        await tx.delete(commercialShifts).where(eq(commercialShifts.surveyId, req.survey.id));
        if (shifts.length > 0) await tx.insert(commercialShifts).values(shifts.map(s => ({ surveyId: req.survey.id, ...s })));
      }
      if (controls) await tx.insert(commercialControls).values({ surveyId: req.survey.id, ...controls }).onConflictDoUpdate({ target: commercialControls.surveyId, set: { ...controls } });
    });
    res.json({ success: true, newVersion });
  } catch (error) {
    if (error.message === "VERSION_MISMATCH") return res.status(409).json({ error: "Conflict: Version mismatch" });
    res.status(500).json({ error: "Transaction failed" });
  }
});

// PUT /api/surveys/:id/industrial
surveyRouter.put('/:id/industrial', checkSurveyOwnership, checkSurveyStatus(['DRAFT']), checkVersionBody, async (req, res) => {
  const { version, profiles, shifts, processes, controls } = req.body;
  try {
    let newVersion;
    await db.transaction(async (tx) => {
      newVersion = await bumpVersionAtomic(tx, req.survey.id, version);
      if (profiles) await tx.insert(industrialProfiles).values({ surveyId: req.survey.id, ...profiles }).onConflictDoUpdate({ target: industrialProfiles.surveyId, set: { ...profiles } });
      if (shifts) {
        await tx.delete(industrialShifts).where(eq(industrialShifts.surveyId, req.survey.id));
        if (shifts.length > 0) await tx.insert(industrialShifts).values(shifts.map(s => ({ surveyId: req.survey.id, ...s })));
      }
      if (processes) {
        await tx.delete(productionProcesses).where(eq(productionProcesses.surveyId, req.survey.id));
        if (processes.length > 0) await tx.insert(productionProcesses).values(processes.map(p => ({ surveyId: req.survey.id, ...p })));
      }
      if (controls) await tx.insert(industrialControls).values({ surveyId: req.survey.id, ...controls }).onConflictDoUpdate({ target: industrialControls.surveyId, set: { ...controls } });
    });
    res.json({ success: true, newVersion });
  } catch (error) {
    if (error.message === "VERSION_MISMATCH") return res.status(409).json({ error: "Conflict: Version mismatch" });
    res.status(500).json({ error: "Transaction failed" });
  }
});

// PUT /api/surveys/:id/demand-response
surveyRouter.put('/:id/demand-response', checkSurveyOwnership, checkSurveyStatus(['DRAFT']), checkVersionBody, async (req, res) => {
  const { version, profiles, loadSelections, commercialDR, industrialDR } = req.body;
  try {
    let newVersion;
    await db.transaction(async (tx) => {
      newVersion = await bumpVersionAtomic(tx, req.survey.id, version);
      if (profiles) await tx.insert(demandResponseProfiles).values({ surveyId: req.survey.id, ...profiles }).onConflictDoUpdate({ target: demandResponseProfiles.surveyId, set: { ...profiles } });
      
      if (commercialDR) await tx.insert(commercialDemandResponse).values({ surveyId: req.survey.id, ...commercialDR }).onConflictDoUpdate({ target: commercialDemandResponse.surveyId, set: { ...commercialDR } });
      
      if (industrialDR) await tx.insert(industrialDemandResponse).values({ surveyId: req.survey.id, ...industrialDR }).onConflictDoUpdate({ target: industrialDemandResponse.surveyId, set: { ...industrialDR } });
      
      if (loadSelections) {
        await tx.delete(drLoadSelections).where(eq(drLoadSelections.surveyId, req.survey.id));
        if (loadSelections.length > 0) await tx.insert(drLoadSelections).values(loadSelections.map(l => ({ surveyId: req.survey.id, ...l })));
      }
    });
    res.json({ success: true, newVersion });
  } catch (error) {
    if (error.message === "VERSION_MISMATCH") return res.status(409).json({ error: "Conflict: Version mismatch" });
    res.status(500).json({ error: "Transaction failed" });
  }
});

// GET /api/surveys/:id/validate (Soft Validation Engine)
surveyRouter.get('/:id/validate', checkSurveyOwnership, async (req, res) => {
  try {
    const warnings = [];
    const { id } = req.params;
    
    const [common] = await db.select().from(surveyCommonDetails).where(eq(surveyCommonDetails.surveyId, id));
    if (!common) {
      warnings.push({ field: "commonDetails", message: "Common details section is empty" });
    } else {
      if (!common.meterNumber) warnings.push({ field: "meterNumber", message: "Meter number is missing" });
      if (!common.sanctionedLoad) warnings.push({ field: "sanctionedLoad", message: "Sanctioned load is missing" });
    }

    const items = await db.select().from(inventoryItems).where(eq(inventoryItems.surveyId, id));
    if (items.length === 0) {
      warnings.push({ field: "inventory", message: "Inventory is empty" });
    } else {
      items.forEach((item, index) => {
        if (!item.equipmentDescription) warnings.push({ field: `inventory[${index}].equipmentDescription`, message: "Equipment description is missing" });
        if (!item.ratedCapacity) warnings.push({ field: `inventory[${index}].ratedCapacity`, message: "Rated capacity is missing" });
      });
    }
    
    res.json({ valid: true, warnings });
  } catch (error) {
    res.status(500).json({ error: "Failed to validate survey" });
  }
});

// POST /api/surveys/:id/submit
surveyRouter.post('/:id/submit', checkSurveyOwnership, checkSurveyStatus(['DRAFT']), async (req, res) => {
  try {
    const warnings = [];
    const [common] = await db.select().from(surveyCommonDetails).where(eq(surveyCommonDetails.surveyId, req.survey.id));
    if (!common) warnings.push({ field: "commonDetails", message: "Common details section is empty" });
    else {
      if (!common.meterNumber) warnings.push({ field: "meterNumber", message: "Meter number is missing" });
      if (!common.sanctionedLoad) warnings.push({ field: "sanctionedLoad", message: "Sanctioned load is missing" });
    }

    // Atomic submit
    const result = await db.update(surveys)
      .set({ status: 'SUBMITTED', submittedAt: new Date(), updatedAt: new Date() })
      .where(and(eq(surveys.id, req.survey.id), eq(surveys.status, 'DRAFT')));

    if (result.count === 0) return res.status(409).json({ error: "Conflict: Survey already submitted or modified" });
    
    res.json({ success: true, status: "SUBMITTED", warnings });
  } catch (error) {
    res.status(500).json({ error: "Failed to submit survey" });
  }
});
