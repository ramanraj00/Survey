import express from 'express';
import crypto from 'crypto';
import { db } from '../db.js';
import { surveys, surveyAuditLogs, surveyCommonDetails, inventoryItems, invitations } from '../models/schema.js';
import { residentialProfiles, residentialOccupancy, residentialAppliances, evCharging, backupPowerSources, solarInstallations, residentialCommonLoadsInfo, residentialCommonLoads, residentialLoadFlexibility } from '../models/residential.js';
import { commercialProfiles, commercialShifts, commercialControls } from '../models/commercial.js';
import { industrialProfiles, industrialShifts, productionProcesses, industrialControls } from '../models/industrial.js';
import { demandResponseProfiles, drLoadSelections, commercialDemandResponse, industrialDemandResponse } from '../models/demand_response.js';
import { processDependencies as processDependenciesTable } from '../models/industrial.js';
import { eq, and, sql, count, not, gte, lt, or, ilike } from 'drizzle-orm';
import { requireAuth, requireRole } from '../middlewares.js';
import { fetchFullSurvey } from '../services/surveyFetcher.js';

export const adminRouter = express.Router();

adminRouter.use(requireAuth);
adminRouter.use(requireRole('admin'));

// ==========================================
// INVITATIONS MANAGEMENT
// ==========================================

adminRouter.get('/invitations', async (req, res) => {
  try {
    const invites = await db.select({
      id: invitations.id,
      email: invitations.email,
      role: invitations.role,
      status: invitations.status,
      expiresAt: invitations.expiresAt,
      createdAt: invitations.createdAt
    }).from(invitations).orderBy(sql`${invitations.createdAt} DESC`);
    res.json(invites);
  } catch (error) {
    console.error("Error fetching invitations:", error);
    res.status(500).json({ error: "Failed to fetch invitations" });
  }
});

adminRouter.post('/invitations', async (req, res) => {
  try {
    const { email, role = 'agent' } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });

    // Check if invitation already exists
    const existingInvite = await db.select().from(invitations).where(eq(invitations.email, email)).limit(1);
    if (existingInvite.length > 0) {
      return res.status(400).json({ error: "Email already exists." });
    }

    // Generate secure token
    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    
    // Expires in 7 days
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const [invite] = await db.insert(invitations).values({
      email,
      tokenHash,
      role,
      expiresAt,
      status: 'PENDING',
      createdBy: req.user.id
    }).returning({ id: invitations.id });

    // In a real app, send an email here. We return the token for the frontend to copy.
    res.json({ success: true, token, inviteId: invite.id, email });
  } catch (error) {
    console.error("Error creating invitation:", error);
    res.status(500).json({ error: "Failed to create invitation" });
  }
});

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
        oldValue: oldVal !== undefined ? oldVal : null,
        newValue: newVal !== undefined ? newVal : null
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
    
    const residentialResult = await db.select({ count: count() }).from(surveys).where(eq(surveys.consumerCategory, 'RESIDENTIAL'));
    const commercialResult = await db.select({ count: count() }).from(surveys).where(eq(surveys.consumerCategory, 'COMMERCIAL'));
    const industrialResult = await db.select({ count: count() }).from(surveys).where(eq(surveys.consumerCategory, 'INDUSTRIAL'));

    res.json({
      totalSurveys: totalResult[0].count,
      draft: draftResult[0].count,
      submitted: submittedResult[0].count,
      approved: approvedResult[0].count,
      byCategory: {
        residential: residentialResult[0].count,
        commercial: commercialResult[0].count,
        industrial: industrialResult[0].count
      }
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

// GET /api/admin/surveys (Paginated List)
adminRouter.get('/surveys', async (req, res) => {
  try {
    const { page = 1, limit = 20, status, category, agentId, search, date, email } = req.query;
    
    const { user } = await import('../models/auth-schema.js');
    const { surveyCommonDetails } = await import('../models/schema.js');

    const conditions = [];
    if (status) {
      conditions.push(eq(surveys.status, status));
    } else {
      conditions.push(not(eq(surveys.status, 'DRAFT')));
    }
    if (category) conditions.push(eq(surveys.consumerCategory, category));
    if (agentId) conditions.push(eq(surveys.agentId, agentId));
    if (email) conditions.push(ilike(user.email, `%${email}%`));
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      conditions.push(and(gte(surveys.createdAt, startOfDay), lt(surveys.createdAt, endOfDay)));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
    const offset = (Number(page) - 1) * Number(limit);

    // Fetch total count matching conditions
    const totalResult = await db.select({ count: count() })
      .from(surveys)
      .leftJoin(user, eq(surveys.agentId, user.id))
      .where(whereClause);
    const total = totalResult[0].count;
    
    // Fetch paginated data

    const paginatedData = await db.select({
      survey: surveys,
      agentEmail: user.email,
      consumerName: surveyCommonDetails.respondentName
    })
      .from(surveys)
      .leftJoin(user, eq(surveys.agentId, user.id))
      .leftJoin(surveyCommonDetails, eq(surveys.id, surveyCommonDetails.surveyId))
      .where(whereClause)
      .limit(Number(limit))
      .offset(offset);

    const flatData = paginatedData.map(row => ({
      ...row.survey,
      agentEmail: row.agentEmail,
      consumerName: row.consumerName
    }));

    res.json({ data: flatData, pagination: { page: Number(page), limit: Number(limit), total } });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch surveys" });
  }
});

// GET /api/admin/surveys/:id (360 view)
adminRouter.get('/surveys/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const fullSurvey = await fetchFullSurvey(id);
    if (!fullSurvey) return res.status(404).json({ error: "Survey not found" });

    // Fetch agent email
    let agentEmail = null;
    if (fullSurvey.survey.agentId) {
      const { user } = await import('../models/auth-schema.js');
      const agentUser = await db.select({ email: user.email }).from(user).where(eq(user.id, fullSurvey.survey.agentId));
      if (agentUser.length > 0) agentEmail = agentUser[0].email;
    }

    res.json({ ...fullSurvey, agentEmail });
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

// PATCH /api/admin/surveys/:id/inventory (Bulk overwrite with granular Element-level Audit)
adminRouter.patch('/surveys/:id/inventory', async (req, res) => {
  const { id } = req.params;
  const { version, items } = req.body;
  if (!version || !items) return res.status(400).json({ error: "version and items required" });

  try {
    let newVersion;
    await db.transaction(async (tx) => {
      newVersion = await bumpVersionAtomicAdmin(tx, id, version);

      const oldItems = await tx.select().from(inventoryItems).where(eq(inventoryItems.surveyId, id));
      const oldMap = {};
      oldItems.forEach(i => oldMap[i.id || i.equipmentDescription] = i);
      const newMap = {};
      items.forEach(i => newMap[i.id || i.equipmentDescription] = i);

      await tx.delete(inventoryItems).where(eq(inventoryItems.surveyId, id));
      if (items.length > 0) {
        await tx.insert(inventoryItems).values(items.map(i => ({ surveyId: id, ...i })));
      }

      const allEntities = new Set([...Object.keys(oldMap), ...Object.keys(newMap)]);
      for (const entityKey of allEntities) {
        await generateElementAudits(tx, id, req.user.id, 'inventory_items', entityKey, oldMap[entityKey], newMap[entityKey]);
      }
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
  const { version, profiles, occupancy, appliances, ev, backup, solar, commonLoadsInfo, commonLoads, loadFlexibility } = req.body; 
  if (!version) return res.status(400).json({ error: "version required" });

  try {
    let newVersion;
    await db.transaction(async (tx) => {
      newVersion = await bumpVersionAtomicAdmin(tx, id, version);

      // --- PROFILES ---
      if (profiles) {
        const [oldProf] = await tx.select().from(residentialProfiles).where(eq(residentialProfiles.surveyId, id));
        await tx.insert(residentialProfiles).values({ surveyId: id, ...profiles }).onConflictDoUpdate({ target: residentialProfiles.surveyId, set: { ...profiles } });
        await generateElementAudits(tx, id, req.user.id, 'residential_profiles', null, oldProf, profiles);
      }

      // --- OCCUPANCY ---
      if (occupancy) {
        const oldOcc = await tx.select().from(residentialOccupancy).where(eq(residentialOccupancy.surveyId, id));
        const oldMap = {};
        oldOcc.forEach(o => oldMap[o.id || o.timeSlot] = o);
        const newMap = {};
        occupancy.forEach(o => newMap[o.id || o.timeSlot] = o);

        await tx.delete(residentialOccupancy).where(eq(residentialOccupancy.surveyId, id));
        if (occupancy.length > 0) {
          await tx.insert(residentialOccupancy).values(occupancy.map(o => ({ surveyId: id, ...o })));
        }

        const allEntities = new Set([...Object.keys(oldMap), ...Object.keys(newMap)]);
        for (const entityKey of allEntities) {
          await generateElementAudits(tx, id, req.user.id, 'residential_occupancy', entityKey, oldMap[entityKey], newMap[entityKey]);
        }
      }

      // --- APPLIANCES ---
      if (appliances) {
        const oldAppliances = await tx.select().from(residentialAppliances).where(eq(residentialAppliances.surveyId, id));
        const oldMap = {};
        oldAppliances.forEach(a => oldMap[a.id || a.applianceType] = a);
        const newMap = {};
        appliances.forEach(a => newMap[a.id || a.applianceType] = a);

        await tx.delete(residentialAppliances).where(eq(residentialAppliances.surveyId, id));
        if (appliances.length > 0) {
          await tx.insert(residentialAppliances).values(appliances.map(a => ({ surveyId: id, ...a })));
        }

        const allEntities = new Set([...Object.keys(oldMap), ...Object.keys(newMap)]);
        for (const entityKey of allEntities) {
          await generateElementAudits(tx, id, req.user.id, 'residential_appliances', entityKey, oldMap[entityKey], newMap[entityKey]);
        }
      }

      // --- EV CHARGING ---
      if (ev) {
        const [oldEV] = await tx.select().from(evCharging).where(eq(evCharging.surveyId, id));
        await tx.insert(evCharging).values({ surveyId: id, ...ev }).onConflictDoUpdate({ target: evCharging.surveyId, set: { ...ev } });
        await generateElementAudits(tx, id, req.user.id, 'ev_charging', null, oldEV, ev);
      }

      // --- BACKUP POWER SOURCES ---
      if (backup) {
        const oldBackup = await tx.select().from(backupPowerSources).where(eq(backupPowerSources.surveyId, id));
        const oldMap = {};
        oldBackup.forEach(b => oldMap[b.id || b.type] = b);
        const newMap = {};
        backup.forEach(b => newMap[b.id || b.type] = b);

        await tx.delete(backupPowerSources).where(eq(backupPowerSources.surveyId, id));
        if (backup.length > 0) {
          await tx.insert(backupPowerSources).values(backup.map(b => ({ surveyId: id, ...b })));
        }

        const allEntities = new Set([...Object.keys(oldMap), ...Object.keys(newMap)]);
        for (const entityKey of allEntities) {
          await generateElementAudits(tx, id, req.user.id, 'backup_power_sources', entityKey, oldMap[entityKey], newMap[entityKey]);
        }
      }

      // --- SOLAR INSTALLATIONS ---
      if (solar) {
        const [oldSolar] = await tx.select().from(solarInstallations).where(eq(solarInstallations.surveyId, id));
        await tx.insert(solarInstallations).values({ surveyId: id, ...solar }).onConflictDoUpdate({ target: solarInstallations.surveyId, set: { ...solar } });
        await generateElementAudits(tx, id, req.user.id, 'solar_installations', null, oldSolar, solar);
      }

      // --- COMMON LOADS INFO ---
      if (commonLoadsInfo) {
        const [oldInfo] = await tx.select().from(residentialCommonLoadsInfo).where(eq(residentialCommonLoadsInfo.surveyId, id));
        await tx.insert(residentialCommonLoadsInfo).values({ surveyId: id, ...commonLoadsInfo }).onConflictDoUpdate({ target: residentialCommonLoadsInfo.surveyId, set: { ...commonLoadsInfo } });
        await generateElementAudits(tx, id, req.user.id, 'residential_common_loads_info', null, oldInfo, commonLoadsInfo);
      }

      // --- COMMON LOADS (Arrays) ---
      if (commonLoads) {
        const oldLoads = await tx.select().from(residentialCommonLoads).where(eq(residentialCommonLoads.surveyId, id));
        const oldMapLoads = {};
        oldLoads.forEach(l => oldMapLoads[l.id || l.loadType + (l.loadName || '')] = l);
        const newMapLoads = {};
        commonLoads.forEach(l => newMapLoads[l.id || l.loadType + (l.loadName || '')] = l);

        await tx.delete(residentialCommonLoads).where(eq(residentialCommonLoads.surveyId, id));
        if (commonLoads.length > 0) {
          await tx.insert(residentialCommonLoads).values(commonLoads.map(l => ({ surveyId: id, ...l })));
        }

        const allLoadEntities = new Set([...Object.keys(oldMapLoads), ...Object.keys(newMapLoads)]);
        for (const entityKey of allLoadEntities) {
          await generateElementAudits(tx, id, req.user.id, 'residential_common_loads', entityKey, oldMapLoads[entityKey], newMapLoads[entityKey]);
        }
      }

      // --- LOAD FLEXIBILITY ---
      if (loadFlexibility) {
        const [oldFlex] = await tx.select().from(residentialLoadFlexibility).where(eq(residentialLoadFlexibility.surveyId, id));
        await tx.insert(residentialLoadFlexibility).values({ surveyId: id, ...loadFlexibility }).onConflictDoUpdate({ target: residentialLoadFlexibility.surveyId, set: { ...loadFlexibility } });
        await generateElementAudits(tx, id, req.user.id, 'residential_load_flexibility', null, oldFlex, loadFlexibility);
      }
    });
    res.json({ success: true, newVersion });
  } catch (error) {
    if (error.message === "VERSION_MISMATCH_OR_APPROVED") return res.status(409).json({ error: "Conflict: Version mismatch or survey is APPROVED" });
    res.status(500).json({ error: "Transaction failed", details: error.message });
  }
});

// PATCH /api/admin/surveys/:id/commercial
adminRouter.patch('/surveys/:id/commercial', async (req, res) => {
  const { id } = req.params;
  const { version, profiles, shifts, controls } = req.body; 
  if (!version) return res.status(400).json({ error: "version required" });

  try {
    let newVersion;
    await db.transaction(async (tx) => {
      newVersion = await bumpVersionAtomicAdmin(tx, id, version);

      // --- PROFILES ---
      if (profiles) {
        const [oldProf] = await tx.select().from(commercialProfiles).where(eq(commercialProfiles.surveyId, id));
        await tx.insert(commercialProfiles).values({ surveyId: id, ...profiles }).onConflictDoUpdate({ target: commercialProfiles.surveyId, set: { ...profiles } });
        await generateElementAudits(tx, id, req.user.id, 'commercial_profiles', null, oldProf, profiles);
      }

      // --- SHIFTS ---
      if (shifts) {
        const oldShifts = await tx.select().from(commercialShifts).where(eq(commercialShifts.surveyId, id));
        const oldMap = {};
        oldShifts.forEach(s => oldMap[s.id || s.shiftNumber] = s);
        const newMap = {};
        shifts.forEach(s => newMap[s.id || s.shiftNumber] = s);

        await tx.delete(commercialShifts).where(eq(commercialShifts.surveyId, id));
        if (shifts.length > 0) {
          await tx.insert(commercialShifts).values(shifts.map(s => ({ surveyId: id, ...s })));
        }

        const allEntities = new Set([...Object.keys(oldMap), ...Object.keys(newMap)]);
        for (const entityKey of allEntities) {
          await generateElementAudits(tx, id, req.user.id, 'commercial_shifts', entityKey, oldMap[entityKey], newMap[entityKey]);
        }
      }

      // --- CONTROLS ---
      if (controls) {
        const [oldControls] = await tx.select().from(commercialControls).where(eq(commercialControls.surveyId, id));
        await tx.insert(commercialControls).values({ surveyId: id, ...controls }).onConflictDoUpdate({ target: commercialControls.surveyId, set: { ...controls } });
        await generateElementAudits(tx, id, req.user.id, 'commercial_controls', null, oldControls, controls);
      }
    });
    res.json({ success: true, newVersion });
  } catch (error) {
    if (error.message === "VERSION_MISMATCH_OR_APPROVED") return res.status(409).json({ error: "Conflict: Version mismatch or survey is APPROVED" });
    res.status(500).json({ error: "Transaction failed", details: error.message });
  }
});

// PATCH /api/admin/surveys/:id/industrial
adminRouter.patch('/surveys/:id/industrial', async (req, res) => {
  const { id } = req.params;
  const { version, profiles, shifts, processes, processDependencies, controls } = req.body; 
  if (!version) return res.status(400).json({ error: "version required" });

  try {
    let newVersion;
    await db.transaction(async (tx) => {
      newVersion = await bumpVersionAtomicAdmin(tx, id, version);

      // --- PROFILES ---
      if (profiles) {
        const [oldProf] = await tx.select().from(industrialProfiles).where(eq(industrialProfiles.surveyId, id));
        await tx.insert(industrialProfiles).values({ surveyId: id, ...profiles }).onConflictDoUpdate({ target: industrialProfiles.surveyId, set: { ...profiles } });
        await generateElementAudits(tx, id, req.user.id, 'industrial_profiles', null, oldProf, profiles);
      }

      // --- SHIFTS ---
      if (shifts) {
        const oldShifts = await tx.select().from(industrialShifts).where(eq(industrialShifts.surveyId, id));
        const oldMap = {};
        oldShifts.forEach(s => oldMap[s.id || s.shiftNumber] = s);
        const newMap = {};
        shifts.forEach(s => newMap[s.id || s.shiftNumber] = s);

        await tx.delete(industrialShifts).where(eq(industrialShifts.surveyId, id));
        if (shifts.length > 0) {
          await tx.insert(industrialShifts).values(shifts.map(s => ({ surveyId: id, ...s })));
        }

        const allEntities = new Set([...Object.keys(oldMap), ...Object.keys(newMap)]);
        for (const entityKey of allEntities) {
          await generateElementAudits(tx, id, req.user.id, 'industrial_shifts', entityKey, oldMap[entityKey], newMap[entityKey]);
        }
      }

      // --- PROCESSES ---
      if (processes) {
        const oldProcesses = await tx.select().from(productionProcesses).where(eq(productionProcesses.surveyId, id));
        const oldMap = {};
        oldProcesses.forEach(p => oldMap[p.id || p.processName] = p);
        const newMap = {};
        processes.forEach(p => newMap[p.id || p.processName] = p);

        await tx.delete(productionProcesses).where(eq(productionProcesses.surveyId, id));
        if (processes.length > 0) {
          await tx.insert(productionProcesses).values(processes.map(p => ({ surveyId: id, ...p })));
        }

        const allEntities = new Set([...Object.keys(oldMap), ...Object.keys(newMap)]);
        for (const entityKey of allEntities) {
          await generateElementAudits(tx, id, req.user.id, 'production_processes', entityKey, oldMap[entityKey], newMap[entityKey]);
        }
      }
      
      // --- PROCESS DEPENDENCIES ---
      if (processDependencies) {
        const oldDeps = await tx.select().from(processDependenciesTable).where(eq(processDependenciesTable.surveyId, id));
        const oldMap = {};
        oldDeps.forEach(d => oldMap[d.id || `${d.processId}-${d.dependsOnProcessId}`] = d);
        const newMap = {};
        processDependencies.forEach(d => newMap[d.id || `${d.processId}-${d.dependsOnProcessId}`] = d);

        await tx.delete(processDependenciesTable).where(eq(processDependenciesTable.surveyId, id));
        if (processDependencies.length > 0) {
          await tx.insert(processDependenciesTable).values(processDependencies.map(d => ({ surveyId: id, ...d })));
        }

        const allEntities = new Set([...Object.keys(oldMap), ...Object.keys(newMap)]);
        for (const entityKey of allEntities) {
          await generateElementAudits(tx, id, req.user.id, 'process_dependencies', entityKey, oldMap[entityKey], newMap[entityKey]);
        }
      }

      // --- CONTROLS ---
      if (controls) {
        const [oldControls] = await tx.select().from(industrialControls).where(eq(industrialControls.surveyId, id));
        await tx.insert(industrialControls).values({ surveyId: id, ...controls }).onConflictDoUpdate({ target: industrialControls.surveyId, set: { ...controls } });
        await generateElementAudits(tx, id, req.user.id, 'industrial_controls', null, oldControls, controls);
      }
    });
    res.json({ success: true, newVersion });
  } catch (error) {
    if (error.message === "VERSION_MISMATCH_OR_APPROVED") return res.status(409).json({ error: "Conflict: Version mismatch or survey is APPROVED" });
    res.status(500).json({ error: "Transaction failed", details: error.message });
  }
});

// PATCH /api/admin/surveys/:id/demand-response
adminRouter.patch('/surveys/:id/demand-response', async (req, res) => {
  const { id } = req.params;
  const { version, profiles, commercialDR, industrialDR, loadSelections } = req.body; 
  if (!version) return res.status(400).json({ error: "version required" });

  try {
    let newVersion;
    await db.transaction(async (tx) => {
      newVersion = await bumpVersionAtomicAdmin(tx, id, version);

      if (profiles) {
        const [oldProf] = await tx.select().from(demandResponseProfiles).where(eq(demandResponseProfiles.surveyId, id));
        await tx.insert(demandResponseProfiles).values({ surveyId: id, ...profiles }).onConflictDoUpdate({ target: demandResponseProfiles.surveyId, set: { ...profiles } });
        await generateElementAudits(tx, id, req.user.id, 'demand_response_profiles', null, oldProf, profiles);
      }
      
      if (commercialDR) {
        const [oldCom] = await tx.select().from(commercialDemandResponse).where(eq(commercialDemandResponse.surveyId, id));
        await tx.insert(commercialDemandResponse).values({ surveyId: id, ...commercialDR }).onConflictDoUpdate({ target: commercialDemandResponse.surveyId, set: { ...commercialDR } });
        await generateElementAudits(tx, id, req.user.id, 'commercial_demand_response', null, oldCom, commercialDR);
      }
      
      if (industrialDR) {
        const [oldInd] = await tx.select().from(industrialDemandResponse).where(eq(industrialDemandResponse.surveyId, id));
        await tx.insert(industrialDemandResponse).values({ surveyId: id, ...industrialDR }).onConflictDoUpdate({ target: industrialDemandResponse.surveyId, set: { ...industrialDR } });
        await generateElementAudits(tx, id, req.user.id, 'industrial_demand_response', null, oldInd, industrialDR);
      }

      if (loadSelections) {
        const oldLoads = await tx.select().from(drLoadSelections).where(eq(drLoadSelections.surveyId, id));
        const oldMap = {};
        oldLoads.forEach(l => oldMap[l.id || `${l.inventoryItemId || ''}-${l.processId || ''}`] = l);
        const newMap = {};
        loadSelections.forEach(l => newMap[l.id || `${l.inventoryItemId || ''}-${l.processId || ''}`] = l);

        await tx.delete(drLoadSelections).where(eq(drLoadSelections.surveyId, id));
        if (loadSelections.length > 0) {
          await tx.insert(drLoadSelections).values(loadSelections.map(l => ({ surveyId: id, ...l })));
        }

        const allEntities = new Set([...Object.keys(oldMap), ...Object.keys(newMap)]);
        for (const entityKey of allEntities) {
          await generateElementAudits(tx, id, req.user.id, 'dr_load_selections', entityKey, oldMap[entityKey], newMap[entityKey]);
        }
      }
    });
    res.json({ success: true, newVersion });
  } catch (error) {
    if (error.message === "VERSION_MISMATCH_OR_APPROVED") return res.status(409).json({ error: "Conflict: Version mismatch or survey is APPROVED" });
    res.status(500).json({ error: "Transaction failed", details: error.message });
  }
});

// POST /api/admin/surveys/:id/approve
adminRouter.post('/surveys/:id/approve', async (req, res) => {
  const { id } = req.params;
  const { version } = req.body;

  if (!version) return res.status(400).json({ error: "version is required to prevent stale approvals" });

  try {
    const result = await db.update(surveys)
      .set({ 
        status: 'APPROVED', 
        approvedAt: new Date(), 
        approvedBy: req.user.id, 
        updatedAt: new Date(),
        version: sql`${surveys.version} + 1`
      })
      .where(and(
        eq(surveys.id, id), 
        eq(surveys.status, 'SUBMITTED'),
        eq(surveys.version, version)
      ));

    if (result.count === 0) return res.status(409).json({ error: "Conflict: Survey must be in SUBMITTED state and version must match" });

    res.json({ success: true, status: 'APPROVED' });
  } catch (error) {
    res.status(500).json({ error: "Failed to approve survey" });
  }
});
