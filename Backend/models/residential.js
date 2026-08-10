import { pgTable, uuid, text, boolean, integer, jsonb } from "drizzle-orm/pg-core";
import { surveys } from "./schema.js";

export const residentialProfiles = pgTable("residential_profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  surveyId: uuid("survey_id").references(() => surveys.id, { onDelete: 'cascade' }).notNull().unique(),
  
  residenceType: text("residence_type"),
  builtArea: text("built_area"),
  builtAreaUnit: text("built_area_unit"),
  
  adultCount: integer("adult_count"),
  childrenCount: integer("children_count"),
  
  workFromHome: boolean("work_from_home"),
  workFromHomePeople: integer("work_from_home_people"),
  workFromHomeTimings: text("work_from_home_timings"),
  morePeopleOnWeekend: boolean("more_people_on_weekend"),
  
  highestUsagePeriod: text("highest_usage_period"),
  mainUsageActivities: text("main_usage_activities"),
  billCheckingFrequency: text("bill_checking_frequency"),
});

export const residentialOccupancy = pgTable("residential_occupancy", {
  id: uuid("id").primaryKey().defaultRandom(),
  surveyId: uuid("survey_id").references(() => surveys.id, { onDelete: 'cascade' }).notNull(),
  
  timePeriod: text("time_period"), // MORNING, DAYTIME, EVENING, NIGHT
  weekdayOccupancy: text("weekday_occupancy"),
  weekendOccupancy: text("weekend_occupancy"),
});

export const residentialAppliances = pgTable("residential_appliances", {
  id: uuid("id").primaryKey().defaultRandom(),
  surveyId: uuid("survey_id").references(() => surveys.id, { onDelete: 'cascade' }).notNull(),
  
  applianceType: text("appliance_type"),
  available: boolean("available"),
  numberOfUnits: integer("number_of_units"),
  capacity: text("capacity"),
  capacityUnit: text("capacity_unit"),
  typicalUsageTime: text("typical_usage_time"),
  usedDuringPeak: boolean("used_during_peak"),
  possibleAdjustment: text("possible_adjustment"), // SHIFT, REDUCE, SWITCH_OFF, NO_CHANGE
  remarks: text("remarks"),
});

export const evCharging = pgTable("ev_charging", {
  id: uuid("id").primaryKey().defaultRandom(),
  surveyId: uuid("survey_id").references(() => surveys.id, { onDelete: 'cascade' }).notNull().unique(),
  
  hasEV: boolean("has_ev"),
  vehicleType: text("vehicle_type"),
  vehicleCount: integer("vehicle_count"),
  chargerRating: text("charger_rating"),
  chargerRatingUnit: text("charger_rating_unit"),
  
  usualChargingStart: text("usual_charging_start"),
  usualChargingEnd: text("usual_charging_end"),
  chargingFrequency: text("charging_frequency"),
  
  peakShiftAbility: text("peak_shift_ability"),
  maximumAllowableDelay: integer("maximum_allowable_delay"), // minutes
});

export const backupPowerSources = pgTable("backup_power_sources", {
  id: uuid("id").primaryKey().defaultRandom(),
  surveyId: uuid("survey_id").references(() => surveys.id, { onDelete: 'cascade' }).notNull(),
  
  type: text("type"), // INVERTER, UPS
  available: boolean("available"),
  batteryCapacity: text("battery_capacity"),
  batteryCapacityUnit: text("battery_capacity_unit"),
  
  automaticCharging: boolean("automatic_charging"),
  chargingControl: text("charging_control"),
});

export const solarInstallations = pgTable("solar_installations", {
  id: uuid("id").primaryKey().defaultRandom(),
  surveyId: uuid("survey_id").references(() => surveys.id, { onDelete: 'cascade' }).notNull().unique(),
  
  installed: boolean("installed"),
  capacity: text("capacity"),
  capacityUnit: text("capacity_unit"),
  batteryConnected: boolean("battery_connected"),
});
