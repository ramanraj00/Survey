import { pgTable, uuid, text, boolean, integer } from "drizzle-orm/pg-core";
import { surveys } from "./schema.js";

export const commercialProfiles = pgTable("commercial_profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  surveyId: uuid("survey_id").references(() => surveys.id, { onDelete: 'cascade' }).notNull().unique(),
  
  businessType: text("business_type"),
  buildingNature: text("building_nature"),
  floorCount: integer("floor_count"),
  operationalAreas: text("operational_areas"),
  
  daysOpen: integer("days_open"),
  daysClosed: text("days_closed"),
  openingTime: text("opening_time"),
  closingTime: text("closing_time"),
  
  operatesInShifts: boolean("operates_in_shifts"),
  shiftCount: integer("shift_count"),
  isOpen24Hours: boolean("is_open_24_hours"),
  
  highestActivityPeriod: text("highest_activity_period"),
  approverName: text("approver_name"),
  approverDesignation: text("approver_designation"),
});

export const commercialShifts = pgTable("commercial_shifts", {
  id: uuid("id").primaryKey().defaultRandom(),
  surveyId: uuid("survey_id").references(() => surveys.id, { onDelete: 'cascade' }).notNull(),
  
  shiftNumber: integer("shift_number"),
  startTime: text("start_time"),
  endTime: text("end_time"),
});

export const commercialControls = pgTable("commercial_controls", {
  id: uuid("id").primaryKey().defaultRandom(),
  surveyId: uuid("survey_id").references(() => surveys.id, { onDelete: 'cascade' }).notNull().unique(),
  
  hasAutomaticControls: boolean("has_automatic_controls"),
  controlledLoads: text("controlled_loads"),
  
  hasBMS: boolean("has_bms"),
  centralControlAvailable: boolean("central_control_available"),
  
  hasSolar: boolean("has_solar"),
  solarCapacity: text("solar_capacity"),
  
  hasDG: boolean("has_dg"),
  dgCapacity: text("dg_capacity"),
  
  hasUPS: boolean("has_ups"),
  upsCapacity: text("ups_capacity"),
  
  hasEVCharging: boolean("has_ev_charging"),
  chargerCount: integer("charger_count"),
});
