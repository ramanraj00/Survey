import { pgTable, uuid, text, timestamp, boolean, integer, jsonb, pgEnum } from "drizzle-orm/pg-core";
import { user } from "./auth-schema.js";

// ENUMS
export const surveyStatusEnum = pgEnum('survey_status', ['DRAFT', 'SUBMITTED', 'APPROVED']);
export const consumerCategoryEnum = pgEnum('consumer_category', ['RESIDENTIAL', 'COMMERCIAL', 'INDUSTRIAL']);
export const inviteStatusEnum = pgEnum('invite_status', ['PENDING', 'ACCEPTED', 'EXPIRED']);

// INVITATIONS
export const invitations = pgTable("invitations", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull(),
  tokenHash: text("token_hash").notNull(),
  role: text("role").default('agent').notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  status: inviteStatusEnum("status").default('PENDING').notNull(),
  createdBy: text("created_by").references(() => user.id).notNull(), // Admin ID
  acceptedAt: timestamp("accepted_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// CORE SURVEY TABLE
export const surveys = pgTable("surveys", {
  id: uuid("id").primaryKey().defaultRandom(),
  surveyNumber: text("survey_number").notNull().unique(), // e.g. SUR-2026-000001
  agentId: text("agent_id").references(() => user.id).notNull(),
  consumerCategory: consumerCategoryEnum("consumer_category").notNull(),
  consumerSubcategory: text("consumer_subcategory"),
  status: surveyStatusEnum("status").default('DRAFT').notNull(),
  version: integer("version").default(1).notNull(), // Optimistic concurrency
  
  submittedAt: timestamp("submitted_at"),
  approvedAt: timestamp("approved_at"),
  approvedBy: text("approved_by").references(() => user.id), // Admin ID
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// AUDIT LOGS
export const surveyAuditLogs = pgTable("survey_audit_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  surveyId: uuid("survey_id").references(() => surveys.id, { onDelete: 'cascade' }).notNull(),
  userId: text("user_id").references(() => user.id).notNull(), // Admin who changed it
  action: text("action").notNull(), // e.g. 'UPDATE'
  section: text("section"), // e.g. 'residential_appliances'
  entityId: text("entity_id"), // The specific item's ID in an array
  field: text("field").notNull(),
  oldValue: jsonb("old_value"),
  newValue: jsonb("new_value"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// COMMON DETAILS
export const surveyCommonDetails = pgTable("survey_common_details", {
  id: uuid("id").primaryKey().defaultRandom(),
  surveyId: uuid("survey_id").references(() => surveys.id, { onDelete: 'cascade' }).notNull().unique(),
  
  // All real survey fields are optional (soft validation)
  surveyDate: text("survey_date"),
  surveyTime: text("survey_time"),
  enumeratorName: text("enumerator_name"),
  discomRepresentativePresent: boolean("discom_rep_present"),
  discomRepresentativeName: text("discom_rep_name"),
  discomRepresentativeDesignation: text("discom_rep_designation"),
  
  address: text("address"),
  location: text("location"),
  latitude: text("latitude"),
  longitude: text("longitude"),
  
  respondentName: text("respondent_name"),
  respondentPhone: text("respondent_phone"),
  respondentDesignation: text("respondent_designation"),
  
  consentToCollect: boolean("consent_to_collect"),
  consentToPhotos: boolean("consent_to_photos"),
  
  serviceConnectionNumber: text("service_connection_number"),
  meterNumber: text("meter_number"),
  meteringType: text("metering_type"),
  supplyClassification: text("supply_classification"),
  supplyPhase: text("supply_phase"),
  tariffCategory: text("tariff_category"),
  
  circle: text("circle"),
  division: text("division"),
  subdivision: text("subdivision"),
  section: text("section"),
  substation: text("substation"),
  feederName: text("feeder_name"),
  feederCode: text("feeder_code"),
  dtrName: text("dtr_name"),
  dtrCode: text("dtr_code"),
  
  hasMultipleConnections: boolean("has_multiple_connections"),
  meterCount: integer("meter_count"),
  multipleConnectionSupplyType: text("multiple_conn_supply_type"),
  
  sanctionedLoad: text("sanctioned_load"), // Text to include units, or separate fields
  contractedDemand: text("contracted_demand"),
  highestBilledDemand: text("highest_billed_demand"),
  averageMonthlyConsumption: text("avg_monthly_consumption"),
  typicalMonthlyBill: text("typical_monthly_bill"),
  
  operatingDays: text("operating_days"),
  operatingStartTime: text("operating_start_time"),
  operatingEndTime: text("operating_end_time"),
  occupancy: text("occupancy"),
  seasonality: text("seasonality"),
  
  hasRooftopSolar: boolean("has_rooftop_solar"),
  hasDGSet: boolean("has_dg_set"),
  hasBatteryInverter: boolean("has_battery_inverter"),
  
  frequentPowerOutages: boolean("frequent_power_outages"),
  outageRemarks: text("outage_remarks"),
});

// INVENTORY ITEMS
export const inventoryItems = pgTable("inventory_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  surveyId: uuid("survey_id").references(() => surveys.id, { onDelete: 'cascade' }).notNull(),
  
  consumerCategory: text("consumer_category"),
  processOrUse: text("process_or_use"),
  equipmentDescription: text("equipment_description"),
  numberOfUnits: integer("number_of_units"),
  
  ratedCapacity: text("rated_capacity"),
  capacityUnit: text("capacity_unit"),
  
  typicalStartTime: text("typical_start_time"),
  typicalEndTime: text("typical_end_time"),
  
  operatesDuringPeak: boolean("operates_during_peak"),
  loadCriticality: text("load_criticality"),
  shiftable: text("shiftable"), // e.g. YES, NO, PARTLY
  maximumShiftableDuration: integer("max_shiftable_duration"), // minutes
  operationalConstraints: text("operational_constraints"),
  remarks: text("remarks"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
