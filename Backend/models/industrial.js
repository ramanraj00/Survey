import { pgTable, uuid, text, boolean, integer } from "drizzle-orm/pg-core";
import { surveys } from "./schema.js";

export const industrialProfiles = pgTable("industrial_profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  surveyId: uuid("survey_id").references(() => surveys.id, { onDelete: 'cascade' }).notNull().unique(),
  
  industrySector: text("industry_sector"), // E1.1
  productsManufactured: text("products_manufactured"), // E1.2
  productionNature: text("production_nature"), // E1.3 Continuous, Batch, etc.
  
  operatingDays: integer("operating_days"), // E1.4
  operatingTiming: text("operating_timing"), // E1.4
  shifts: text("shifts"), // E1.4
  daysPerWeek: integer("days_per_week"), // E1.5
  daysClosed: text("days_closed"), // E1.5
  
  operatingHours: text("operating_hours"), // E1.6
  
  productionShiftCount: text("production_shift_count"), // E1.7
  shiftTimings: text("shift_timings"), // E1.8
  operates24Hours: text("operates_24_hours"), // E1.9
  
  highestProductionMonths: text("highest_production_months"), // E1.10
  productionScheduleFlexibility: text("production_schedule_flexibility"), // E1.11
  canIncreaseProductionBeforePeak: text("can_increase_before_peak"), // E1.12
  
  maintenanceSchedule: text("maintenance_schedule"), // E1.13
  maintenanceFrequency: text("maintenance_frequency"), // E1.13
});

export const industrialShifts = pgTable("industrial_shifts", {
  id: uuid("id").primaryKey().defaultRandom(),
  surveyId: uuid("survey_id").references(() => surveys.id, { onDelete: 'cascade' }).notNull(),
  
  shiftNumber: integer("shift_number"),
  startTime: text("start_time"),
  endTime: text("end_time"),
});

export const productionProcesses = pgTable("production_processes", {
  id: uuid("id").primaryKey().defaultRandom(),
  surveyId: uuid("survey_id").references(() => surveys.id, { onDelete: 'cascade' }).notNull(),
  processName: text("process_name"),
  description: text("description"),
  
  mainProductionStages: text("main_production_stages"), // E2.1
  peakOperatingProcesses: text("peak_operating_processes"), // E2.2
  continuousProcesses: text("continuous_processes"), // E2.3
  delayableProcesses: text("delayable_processes"), // E2.4
  reducibleProcesses: text("reducible_processes"), // E2.5
  stoppableProcesses: text("stoppable_processes"), // E2.6
  
  interruptionImpact: text("interruption_impact"),
  safeStopTime: text("safe_stop_time"), // minutes
  restartTime: text("restart_time"), // minutes
  restartCausesDemandIncrease: text("restart_causes_demand_increase"),
});

export const processDependencies = pgTable("process_dependencies", {
  id: uuid("id").primaryKey().defaultRandom(),
  surveyId: uuid("survey_id").references(() => surveys.id, { onDelete: 'cascade' }).notNull(),
  processId: uuid("process_id").references(() => productionProcesses.id, { onDelete: 'cascade' }),
  dependsOnProcessId: uuid("depends_on_process_id").references(() => productionProcesses.id, { onDelete: 'cascade' }),
  processName: text("process_name"),
  dependsOnProcessName: text("depends_on_process_name"),
  dependencyExplanation: text("dependency_explanation"),
  
  hasDependencies: text("has_dependencies"),
  interruptionImpact: text("interruption_impact"),
  timeToStop: text("time_to_stop"),
  timeToRestart: text("time_to_restart"),
  restartingDemandSpike: text("restarting_demand_spike"),
});

export const industrialControls = pgTable("industrial_controls", {
  id: uuid("id").primaryKey().defaultRandom(),
  surveyId: uuid("survey_id").references(() => surveys.id, { onDelete: 'cascade' }).notNull().unique(),
  
  hasTimers: text("has_timers"),
  hasAutomaticControls: text("has_automatic_controls"),
  
  hasPLC: text("has_plc"),
  hasSCADA: text("has_scada"),
  hasCentralControl: text("has_central_control"),
  
  canChangeSchedulesCentrally: text("can_change_schedules_centrally"),
  individualMachineMonitoring: text("individual_machine_monitoring"),
  
  approvalName: text("approval_name"),
  approvalDesignation: text("approval_designation"),
  implementationRole: text("implementation_role"),
});
