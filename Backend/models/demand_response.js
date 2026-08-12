import { pgTable, uuid, text, boolean, integer } from "drizzle-orm/pg-core";
import { surveys, inventoryItems } from "./schema.js";

export const demandResponseProfiles = pgTable("demand_response_profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  surveyId: uuid("survey_id").references(() => surveys.id, { onDelete: 'cascade' }).notNull().unique(),
  
  willingness: text("willingness"), // HIGH, MEDIUM, LOW, NOT_INTERESTED
  estimatedAdjustmentDuration: text("estimated_adjustment_duration"), // C4.1
  maximumAdjustmentDuration: integer("maximum_adjustment_duration"), // minutes
  requiredAdvanceNotice: text("required_advance_notice"), // text instead of integer to support 'Immediate', '15-30mins', etc.
  
  participationFrequency: text("participation_frequency"), // e.g. "Once a week"
  notificationMethod: text("notification_method"), // SMS, EMAIL, APP
  
  billSavingsInfluence: text("bill_savings_influence"),
  incentiveInfluence: text("incentive_influence"),
  preferredIncentive: text("preferred_incentive"),
  
  automationInterest: text("automation_interest"),
  trialEventWillingness: boolean("trial_event_willingness"),
  
  constraints: text("constraints"),
});

export const drLoadSelections = pgTable("dr_load_selections", {
  id: uuid("id").primaryKey().defaultRandom(),
  surveyId: uuid("survey_id").references(() => surveys.id, { onDelete: 'cascade' }).notNull(),
  inventoryItemId: uuid("inventory_item_id").references(() => inventoryItems.id, { onDelete: 'cascade' }),
  processId: text("process_id"), // Referencing production_processes (as text to avoid strict circular dependency or use uuid if imported correctly)
  
  adjustmentType: text("adjustment_type"), // REDUCE, SHIFT, INTERRUPT
  adjustmentDuration: integer("adjustment_duration"), // minutes
  remarks: text("remarks"),
});

export const commercialDemandResponse = pgTable("commercial_demand_response", {
  id: uuid("id").primaryKey().defaultRandom(),
  surveyId: uuid("survey_id").references(() => surveys.id, { onDelete: 'cascade' }).notNull().unique(),
  
  shiftedLoadTiming: text("shifted_load_timing"),
  participationBarriers: text("participation_barriers"),
  incentiveType: text("incentive_type"),
});

export const industrialDemandResponse = pgTable("industrial_demand_response", {
  id: uuid("id").primaryKey().defaultRandom(),
  surveyId: uuid("survey_id").references(() => surveys.id, { onDelete: 'cascade' }).notNull().unique(),
  
  adjustmentScope: text("adjustment_scope"),
  nonParticipationPeriods: text("non_participation_periods"),
  canIncreaseProductionBeforePeak: text("can_increase_prod_before_peak"), // YES, NO, MAYBE
  canCompleteAfterPeak: text("can_complete_after_peak"), // YES, NO, MAYBE
  createsNewDemandPeak: text("creates_new_demand_peak"), // YES, NO, NOT_SURE
  canDeclineIndividualRequests: boolean("can_decline_individual_requests"), // Assuming this is strict YES/NO, if not we can make it text. User didn't flag this one.
  equipmentDataVerificationConsent: text("equipment_data_verification_consent"), // YES, NO, SUBJECT_TO_APPROVAL
});
