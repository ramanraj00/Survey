import express from 'express';
import { db } from '../db.js';
import { surveys, surveyAuditLogs, surveyCommonDetails, inventoryItems } from '../models/schema.js';
import { residentialProfiles, residentialOccupancy, residentialAppliances, evCharging, backupPowerSources, solarInstallations } from '../models/residential.js';
import { commercialProfiles, commercialShifts, commercialControls } from '../models/commercial.js';
import { industrialProfiles, industrialShifts, productionProcesses, industrialControls } from '../models/industrial.js';
import { demandResponseProfiles, drLoadSelections } from '../models/demand_response.js';
import { eq, and, sql, count } from 'drizzle-orm';
import { requireAuth, requireRole } from '../middlewares.js';

export const adminRouter = express.Router();

adminRouter.use(requireAuth);
adminRouter.use(requireRole('admin'));

// Helper for Atomic Version Bump for Admin
const bumpVersionAtomicAdmin = async (tx, surveyId, clientVersion) => {
  const result = await tx.update(surveys)
    .set({ version: sql`${surveys.version} + 1`, updatedAt: new Date() })
    .where(and(eq(surveys.id, surveyId), eq(surveys.version, clientVersion), sql`${surveys.status} != 'APPROVED'`))
    .returning({ newVersion: surveys.version });
    
  if (result.length === 0) {
    throw new Error("VERSION_MISMATCH_OR_APPROVED");
  }
  return result[0].newVersion;
};

// Helper for Granular Element-level Auditing
async function generateElementAudits(tx, surveyId, userId, section, entityId, oldObj, newObj) {
  const audits = [];
  const allKeys = new Set([...Object.keys(oldObj || {}), ...Object.keys(newObj || {})]);
  
  allKeys.forEach(key => {
    // Ignore internal fields
    if (['id', 'surveyId', 'createdAt', 'updatedAt'].includes(key)) return;
    
    const oldVal = oldObj ? oldObj[key] : null;
    const newVal = newObj ? newObj[key] : null;
    
    // Compare stringified values to avoid reference issues and safely compare numbers/booleans
    if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
      audits.push({
        surveyId,
        userId,
        action: oldObj ? (newObj ? 'UPDATE' : 'DELETE') : 'CREATE',
        section,
        entityId: entityId ? String(entityId) : null,
        field: key,
        oldValue: oldVal !== null && oldVal !== undefined ? JSON.stringify(oldVal) : null,
        newValue: newVal !== null && newVal !== undefined ? JSON.stringify(newVal) : null
      });
    }
  });

  if (audits.length > 0) {
    await tx.insert(surveyAuditLogs).values(audits);
  }
}

// GET /api/admin/stats
adminRouter.get('/stats', async (req, res) => {
  try {
    const totalResult = await db.select({ count: count() }).from(surveys);
    const draftResult = await db.select({ count: count() }).from(surveys).where(eq(surveys.status, 'DRAFT'));
    const submittedResult = await db.select({ count: count() }).from(surveys).where(eq(surveys.status, 'SUBMITTED'));
    const approvedResult = await db.select({ count: count() }).from(surveys).where(eq(surveys.status, 'APPROVED'));
    
    res.json({
      totalSurveys: totalResult[0].count,
      draft: draftResult[0].count,
      submitted: submittedResult[0].count,
      approved: approvedResult[0].count,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

// GET /api/admin/surveys (Paginated List)
adminRouter.get('/surveys', async (req, res) => {
  try {
    const { page = 1, limit = 20, status, category, agentId } = req.query;
    let allData = await db.select().from(surveys);
    
    if (status) allData = allData.filter(s => s.status === status);
    if (category) allData = allData.filter(s => s.consumerCategory === category);
    if (agentId) allData = allData.filter(s => s.agentId === agentId);
    
    const total = allData.length;
    const offset = (Number(page) - 1) * Number(limit);
    const paginatedData = allData.slice(offset, offset + Number(limit));

    res.json({ data: paginatedData, pagination: { page: Number(page), limit: Number(limit), total } });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch surveys" });
  }
});

// GET /api/admin/surveys/:id (360 view)
adminRouter.get('/surveys/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [survey] = await db.select().from(surveys).where(eq(surveys.id, id));
    if (!survey) return res.status(404).json({ error: "Survey not found" });

    const [common] = await db.select().from(surveyCommonDetails).where(eq(surveyCommonDetails.surveyId, id));
    const inventory = await db.select().from(inventoryItems).where(eq(inventoryItems.surveyId, id));
    
    res.json({ ...survey, commonDetails: common || null, inventoryItems: inventory || [] });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch survey details" });
  }
});

// PATCH /api/admin/surveys/:id/common (Element level audit example for object)
adminRouter.patch('/surveys/:id/common', async (req, res) => {
  const { id } = req.params;
  const { version, data } = req.body;
  if (!version || !data) return res.status(400).json({ error: "version and data required" });

  try {
    let newVersion;
    await db.transaction(async (tx) => {
      newVersion = await bumpVersionAtomicAdmin(tx, id, version);

      const [oldCommon] = await tx.select().from(surveyCommonDetails).where(eq(surveyCommonDetails.surveyId, id));

      await tx.insert(surveyCommonDetails)
        .values({ surveyId: id, ...data })
        .onConflictDoUpdate({ target: surveyCommonDetails.surveyId, set: { ...data } });

      await generateElementAudits(tx, id, req.user.id, 'commonDetails', null, oldCommon, data);
    });
    res.json({ success: true, newVersion });
  } catch (error) {
    if (error.message === "VERSION_MISMATCH_OR_APPROVED") return res.status(409).json({ error: "Conflict: Version mismatch or survey is APPROVED" });
    res.status(500).json({ error: "Transaction failed" });
  }
});

// PATCH /api/admin/surveys/:id/residential (Bulk overwrite with granular Element-level Audit)
adminRouter.patch('/surveys/:id/residential', async (req, res) => {
  const { id } = req.params;
  const { version, appliances } = req.body; 
  if (!version || !appliances) return res.status(400).json({ error: "version and appliances required" });

  try {
    let newVersion;
    await db.transaction(async (tx) => {
      newVersion = await bumpVersionAtomicAdmin(tx, id, version);

      const oldAppliances = await tx.select().from(residentialAppliances).where(eq(residentialAppliances.surveyId, id));

      const oldMap = {};
      oldAppliances.forEach(a => oldMap[a.id || a.applianceType] = a);

      const newMap = {};
      appliances.forEach(a => newMap[a.id || a.applianceType] = a);

      // Bulk DB Update
      await tx.delete(residentialAppliances).where(eq(residentialAppliances.surveyId, id));
      if (appliances.length > 0) {
        await tx.insert(residentialAppliances).values(appliances.map(a => ({ surveyId: id, ...a })));
      }

      // Granular Element-level Audits
      const allEntities = new Set([...Object.keys(oldMap), ...Object.keys(newMap)]);
      for (const entityKey of allEntities) {
        const oldObj = oldMap[entityKey];
        const newObj = newMap[entityKey];
        await generateElementAudits(tx, id, req.user.id, 'residential_appliances', entityKey, oldObj, newObj);
      }
    });
    res.json({ success: true, newVersion });
  } catch (error) {
    if (error.message === "VERSION_MISMATCH_OR_APPROVED") return res.status(409).json({ error: "Conflict: Version mismatch or survey is APPROVED" });
    res.status(500).json({ error: "Transaction failed" });
  }
});

// POST /api/admin/surveys/:id/approve
adminRouter.post('/surveys/:id/approve', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.update(surveys)
      .set({ status: 'APPROVED', approvedAt: new Date(), approvedBy: req.user.id, updatedAt: new Date() })
      .where(and(eq(surveys.id, id), eq(surveys.status, 'SUBMITTED')));

    if (result.count === 0) return res.status(400).json({ error: "Conflict: Survey must be in SUBMITTED state to approve" });

    res.json({ success: true, status: 'APPROVED' });
  } catch (error) {
    res.status(500).json({ error: "Failed to approve survey" });
  }
});
