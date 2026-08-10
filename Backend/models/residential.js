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
  maximumDurationOrNewTime: text("max_duration_or_new_time"),
  constraintsOrRemarks: text("constraints_or_remarks"),
  otherApplianceName: text("other_appliance_name"),
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

export const residentialCommonLoadsInfo = pgTable("residential_common_loads_info", {
  id: uuid("id").primaryKey().defaultRandom(),
  surveyId: uuid("survey_id").references(() => surveys.id, { onDelete: 'cascade' }).notNull().unique(),
  
  hasSeparateConnection: boolean("has_separate_connection"),
  managementEntity: text("management_entity"),
  approvalAuthorityName: text("approval_authority_name"),
  approvalAuthorityRole: text("approval_authority_role"),
  approvalAuthorityPhone: text("approval_authority_phone"),
  approvalTime: text("approval_time"),
});

export const residentialCommonLoads = pgTable("residential_common_loads", {
  id: uuid("id").primaryKey().defaultRandom(),
  surveyId: uuid("survey_id").references(() => surveys.id, { onDelete: 'cascade' }).notNull(),
  loadType: text("load_type").notNull(), // LIFT, WATER_SEWAGE_PUMP, OTHER
  
  // LIFT fields
  numberOfLifts: integer("number_of_lifts"),
  ratedCapacityPerLift: text("rated_capacity_per_lift"),
  ratedCapacityPerLiftUnit: text("rated_capacity_per_lift_unit"),
  minimumLiftsRequired: integer("minimum_lifts_required"),
  canReduceLiftOperation: boolean("can_reduce_lift_operation"),
  maximumAcceptableDuration: integer("max_acceptable_duration"),
  
  // PUMP fields
  pumpType: text("pump_type"),
  numberOfPumps: integer("number_of_pumps"),
  capacityPerPump: text("capacity_per_pump"),
  capacityPerPumpUnit: text("capacity_per_pump_unit"),
  typicalOperatingTime: text("typical_operating_time"), // Also used by OTHER
  approximateStorageDuration: text("approx_storage_duration"),
  shiftablePumpingWindow: text("shiftable_pumping_window"),
  canMoveOutsidePeak: boolean("can_move_outside_peak"),
  
  // OTHER fields
  loadName: text("load_name"),
  available: boolean("available"),
  operatesDuringPeak: boolean("operates_during_peak"),
  possibleAdjustment: text("possible_adjustment"),
  maximumDuration: integer("maximum_duration"),
  constraints: text("constraints"),
});

export const residentialLoadFlexibility = pgTable("residential_load_flexibility", {
  id: uuid("id").primaryKey().defaultRandom(),
  surveyId: uuid("survey_id").references(() => surveys.id, { onDelete: 'cascade' }).notNull().unique(),
  
  acTemperatureAdjustment: text("ac_temperature_adjustment"),
  waterHeatingAdjustment: text("water_heating_adjustment"),
  washingCleaningAdjustment: text("washing_cleaning_adjustment"),
  evChargingAdjustment: text("ev_charging_adjustment"),
  waterPumpingAdjustment: text("water_pumping_adjustment"),
});
