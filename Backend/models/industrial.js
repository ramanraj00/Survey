import { pgTable, uuid, text, boolean, integer } from "drizzle-orm/pg-core";
import { surveys } from "./schema.js";

export const industrialProfiles = pgTable("industrial_profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  surveyId: uuid("survey_id").references(() => surveys.id, { onDelete: 'cascade' }).notNull().unique(),
  
  industrySector: text("industry_sector"),
  products: text("products"),
  productionNature: text("production_nature"), // Continuous, Batch, etc.
  
  operatingDays: integer("operating_days"),
  operatingStartTime: text("operating_start_time"),
  operatingEndTime: text("operating_end_time"),
  
  daysPerWeek: integer("days_per_week"),
  daysClosed: text("days_closed"),
  
  shiftCount: integer("shift_count"),
  operates24Hours: boolean("operates_24_hours"),
  
  highestProductionMonths: text("highest_production_months"),
  productionSchedule: text("production_schedule"),
  canIncreaseBeforePeak: boolean("can_increase_before_peak"),
  maintenanceSchedule: text("maintenance_schedule"),
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
  
  operatesDuringPeak: boolean("operates_during_peak"),
  mustOperateContinuously: boolean("must_operate_continuously"),
  
  canDelay: boolean("can_delay"),
  canReduce: boolean("can_reduce"),
  canTemporarilyStop: boolean("can_temporarily_stop"),
  
  interruptionImpact: text("interruption_impact"),
  safeStopTime: integer("safe_stop_time"), // minutes
  restartTime: integer("restart_time"), // minutes
  restartCausesDemandIncrease: boolean("restart_causes_demand_increase"),
});

export const processDependencies = pgTable("process_dependencies", {
  id: uuid("id").primaryKey().defaultRandom(),
  processId: uuid("process_id").references(() => productionProcesses.id, { onDelete: 'cascade' }).notNull(),
  dependsOnProcessId: uuid("depends_on_process_id").references(() => productionProcesses.id, { onDelete: 'cascade' }).notNull(),
  dependencyExplanation: text("dependency_explanation"),
});

export const industrialControls = pgTable("industrial_controls", {
  id: uuid("id").primaryKey().defaultRandom(),
  surveyId: uuid("survey_id").references(() => surveys.id, { onDelete: 'cascade' }).notNull().unique(),
  
  hasTimers: boolean("has_timers"),
  hasAutomaticControls: boolean("has_automatic_controls"),
  
  hasPLC: boolean("has_plc"),
  hasSCADA: boolean("has_scada"),
  hasCentralControl: boolean("has_central_control"),
  
  canChangeSchedulesCentrally: boolean("can_change_schedules_centrally"),
  individualMachineMonitoring: boolean("individual_machine_monitoring"),
  
  approvalName: text("approval_name"),
  approvalDesignation: text("approval_designation"),
  implementationRole: text("implementation_role"),
});
