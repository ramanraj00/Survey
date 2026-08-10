import { pgTable, uuid, text, boolean, integer } from "drizzle-orm/pg-core";
import { surveys, inventoryItems } from "./schema.js";

export const demandResponseProfiles = pgTable("demand_response_profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  surveyId: uuid("survey_id").references(() => surveys.id, { onDelete: 'cascade' }).notNull().unique(),
  
  willingness: text("willingness"), // HIGH, MEDIUM, LOW, NOT_INTERESTED
  maximumAdjustmentDuration: integer("maximum_adjustment_duration"), // minutes
  requiredAdvanceNotice: integer("required_advance_notice"), // minutes
  
  participationFrequency: text("participation_frequency"), // e.g. "Once a week"
  notificationMethod: text("notification_method"), // SMS, EMAIL, APP
  
  billSavingsInfluence: text("bill_savings_influence"),
  incentiveInfluence: text("incentive_influence"),
  preferredIncentive: text("preferred_incentive"),
  
  automationInterest: boolean("automation_interest"),
  trialEventWillingness: boolean("trial_event_willingness"),
  
  constraints: text("constraints"),
});

export const drLoadSelections = pgTable("dr_load_selections", {
  id: uuid("id").primaryKey().defaultRandom(),
  surveyId: uuid("survey_id").references(() => surveys.id, { onDelete: 'cascade' }).notNull(),
  inventoryItemId: uuid("inventory_item_id").references(() => inventoryItems.id, { onDelete: 'cascade' }).notNull(),
  
  adjustmentType: text("adjustment_type"), // REDUCE, SHIFT, INTERRUPT
  adjustmentDuration: integer("adjustment_duration"), // minutes
  remarks: text("remarks"),
});
