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
  adjustmentType: text("adjustment_type"),
});

export const industrialDemandResponse = pgTable("industrial_demand_response", {
  id: uuid("id").primaryKey().defaultRandom(),
  surveyId: uuid("survey_id").references(() => surveys.id, { onDelete: 'cascade' }).notNull().unique(),
  
  // Old columns (kept to avoid Drizzle drop/rename prompt)
  adjustmentScope: text("adjustment_scope"),
  nonParticipationPeriods: text("non_participation_periods"),
  canIncreaseProductionBeforePeak: text("can_increase_prod_before_peak"),
  canCompleteAfterPeak: text("can_complete_after_peak"),
  createsNewDemandPeak: text("creates_new_demand_peak"),
  canDeclineIndividualRequests: boolean("can_decline_individual_requests"),
  equipmentDataVerificationConsent: text("equipment_data_verification_consent"),
  
  // New columns
  drAdjustNonCriticalLoads: text("dr_adjust_non_critical_loads"),
  drAdjustableProcesses: text("dr_adjustable_processes"),
  drAdjustmentType: text("dr_adjustment_type"),
  drLoadAdjustability: text("dr_load_adjustability"),
  drAdjustmentDurationLimit: text("dr_adjustment_duration_limit"),
  drAdvanceNoticeRequired: text("dr_advance_notice_required"),
  drParticipationFrequency: text("dr_participation_frequency"),
  drImpossibleParticipationPeriods: text("dr_impossible_participation_periods"),
  drParticipationBarriers: text("dr_participation_barriers"),
  drSeasonalPreference: text("dr_seasonal_preference"),
  drIncreaseProductionBeforePeak: text("dr_increase_production_before_peak"),
  drCompleteDelayedProductionAfterPeak: text("dr_complete_delayed_production_after_peak"),
  drDelayedProductionNewPeak: text("dr_delayed_production_new_peak"),
  drOptionToDeclineRequests: text("dr_option_to_decline_requests"),
  drPreferredNotificationMethod: text("dr_preferred_notification_method"),
  drSavingsInfoIncreasesWillingness: text("dr_savings_info_increases_willingness"),
  drIncentiveIncreasesWillingness: text("dr_incentive_increases_willingness"),
  drPreferredIncentiveType: text("dr_preferred_incentive_type"),
  drConsiderAutomatedControls: text("dr_consider_automated_controls"),
  drWillingToParticipateInTrial: text("dr_willing_to_participate_in_trial"),
  drEquipmentDataVerification: text("dr_equipment_data_verification"),
  
  // Wrongly named fields (kept temporarily to bypass Drizzle drop prompt)
  drPenaltyConcern: text("dr_penalty_concern"),
  drPriorParticipation: text("dr_prior_participation"),
  drIncentivePreference: text("dr_incentive_preference"),
  drFinancialIncentive: text("dr_financial_incentive"),
  drNotificationMethod: text("dr_notification_method"),
  drAutomationLevel: text("dr_automation_level"),
});
