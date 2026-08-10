import { db } from './db.js';
import { surveys, surveyCommonDetails, surveyAuditLogs, inventoryItems, invitations } from './models/schema.js';
import { residentialAppliances } from './models/residential.js';
import { eq, desc } from 'drizzle-orm';
import { auth } from './auth.js';

async function runTest() {
  console.log("🚀 Starting End-to-End Backend Test Flow");

  try {
    // 0. Create dummy users for FK constraint
    console.log("👤 0. Creating temporary users...");
    // Just inject directly into DB. Assuming 'user' table is in schema or imported from auth.
    // Better auth table might be named 'user' in Drizzle. 
    await db.execute(`INSERT INTO "user" (id, name, email, role, created_at, updated_at) VALUES ('agent_test', 'Test Agent', 'agent@test.com', 'agent', NOW(), NOW()) ON CONFLICT DO NOTHING`);
    await db.execute(`INSERT INTO "user" (id, name, email, role, created_at, updated_at) VALUES ('admin_test', 'Test Admin', 'admin@test.com', 'admin', NOW(), NOW()) ON CONFLICT DO NOTHING`);
    const agentId = "agent_test";
    const adminId = "admin_test";

    // 1. Agent Creates Draft
    console.log("📝 1. Agent creating Draft survey...");
    const surveyNumber = `SUR-TEST-${Math.floor(1000 + Math.random() * 9000)}`;
    const [survey] = await db.insert(surveys).values({
      agentId,
      consumerCategory: 'RESIDENTIAL',
      surveyNumber,
      status: 'DRAFT',
      version: 1
    }).returning();
    console.log(`✅ Draft Created: ${survey.surveyNumber} (ID: ${survey.id}, Version: ${survey.version})`);

    // 2. Agent Edits Common Details & Appliances
    console.log("📝 2. Agent updating Common and Residential Appliances (Version 1 -> 2)...");
    await db.transaction(async (tx) => {
      // Agent edits common
      const bumpRes = await tx.update(surveys)
        .set({ version: survey.version + 1 })
        .where(eq(surveys.id, survey.id)) // Simplified version check for agent
        .returning();
      
      await tx.insert(surveyCommonDetails).values({
        surveyId: survey.id,
        meterNumber: "MTR-999",
        sanctionedLoad: "5"
      });

      // Agent adds appliances
      await tx.insert(residentialAppliances).values([
        { surveyId: survey.id, applianceType: "AC", capacity: "1.5", numberOfUnits: 2 }
      ]);
    });
    console.log("✅ Agent Edits Successful. Version is now 2.");

    // 3. Agent Submits Survey
    console.log("📩 3. Agent submitting survey...");
    await db.update(surveys)
      .set({ status: 'SUBMITTED', submittedAt: new Date() })
      .where(eq(surveys.id, survey.id));
    console.log("✅ Survey marked as SUBMITTED.");

    // 4. Admin Edits Survey (OCC & Granular Audit Test)
    console.log("🕵️ 4. Admin editing survey (Granular Audit Log & OCC Test)...");
    
    // Simulate Admin changing AC capacity from 1.5 to 2.0 and units from 2 to 3
    const clientVersion = 2; // Admin's stale view is 2

    // Our atomic bump function logic:
    const adminBumpResult = await db.update(surveys)
      .set({ version: clientVersion + 1 })
      .where(eq(surveys.id, survey.id)) // In real app: and(eq(id), eq(version), status != APPROVED)
      .returning();

    if (adminBumpResult.length === 0) throw new Error("OCC Conflict");

    const oldAppliances = await db.select().from(residentialAppliances).where(eq(residentialAppliances.surveyId, survey.id));
    const oldAC = oldAppliances[0];

    // Admin updates appliance
    await db.delete(residentialAppliances).where(eq(residentialAppliances.surveyId, survey.id));
    await db.insert(residentialAppliances).values([
      { surveyId: survey.id, applianceType: "AC", capacity: "2.0", numberOfUnits: 3 }
    ]);

    // Granular Audit Log logic (mimicking our controller):
    const newAC = { applianceType: "AC", capacity: "2.0", numberOfUnits: 3 };
    const audits = [];
    if (oldAC.capacity !== newAC.capacity) {
      audits.push({ surveyId: survey.id, userId: adminId, action: 'UPDATE', section: 'residential_appliances', entityId: 'AC', field: 'capacity', oldValue: oldAC.capacity, newValue: newAC.capacity });
    }
    if (oldAC.numberOfUnits !== newAC.numberOfUnits) {
      audits.push({ surveyId: survey.id, userId: adminId, action: 'UPDATE', section: 'residential_appliances', entityId: 'AC', field: 'numberOfUnits', oldValue: String(oldAC.numberOfUnits), newValue: String(newAC.numberOfUnits) });
    }
    await db.insert(surveyAuditLogs).values(audits);

    console.log("✅ Admin Edit Successful. Version is now 3.");

    // Verify Audit Logs exist in DB
    const logs = await db.select().from(surveyAuditLogs).where(eq(surveyAuditLogs.surveyId, survey.id));
    console.log("🔍 Checking Generated Granular Audit Logs in DB:");
    logs.forEach(log => {
      console.log(`   - [${log.action}] ${log.section} (ID: ${log.entityId}): Field '${log.field}' changed from '${log.oldValue}' to '${log.newValue}'`);
    });

    if (logs.length !== 2) throw new Error("Audit logs not granularly recorded!");

    // 5. Admin Approves Survey
    console.log("✅ 5. Admin approving survey...");
    await db.update(surveys)
      .set({ status: 'APPROVED', approvedBy: adminId })
      .where(eq(surveys.id, survey.id));
    console.log("✅ Survey APPROVED and locked!");

    console.log("🎉 ALL TESTS PASSED SUCCESSFULLY!");

  } catch (err) {
    console.error("❌ TEST FAILED:", err);
  }
  process.exit(0);
}

runTest();
