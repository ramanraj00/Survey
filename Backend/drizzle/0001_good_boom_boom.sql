ALTER TYPE "public"."consumer_category" ADD VALUE 'INVENTORY';--> statement-breakpoint
ALTER TABLE "demand_response_profiles" ALTER COLUMN "required_advance_notice" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "demand_response_profiles" ALTER COLUMN "automation_interest" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "industrial_controls" ALTER COLUMN "has_timers" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "industrial_controls" ALTER COLUMN "has_automatic_controls" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "industrial_controls" ALTER COLUMN "has_plc" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "industrial_controls" ALTER COLUMN "has_scada" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "industrial_controls" ALTER COLUMN "has_central_control" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "industrial_controls" ALTER COLUMN "can_change_schedules_centrally" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "industrial_controls" ALTER COLUMN "individual_machine_monitoring" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "industrial_profiles" ALTER COLUMN "operating_hours" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "industrial_profiles" ALTER COLUMN "production_shift_count" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "industrial_profiles" ALTER COLUMN "operates_24_hours" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "industrial_profiles" ALTER COLUMN "can_increase_before_peak" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "process_dependencies" ALTER COLUMN "process_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "process_dependencies" ALTER COLUMN "depends_on_process_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "production_processes" ALTER COLUMN "safe_stop_time" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "production_processes" ALTER COLUMN "restart_time" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "production_processes" ALTER COLUMN "restart_causes_demand_increase" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "inventory_items" ALTER COLUMN "operates_during_peak" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "industrial_demand_response" ADD COLUMN "dr_adjust_non_critical_loads" text;--> statement-breakpoint
ALTER TABLE "industrial_demand_response" ADD COLUMN "dr_adjustable_processes" text;--> statement-breakpoint
ALTER TABLE "industrial_demand_response" ADD COLUMN "dr_adjustment_type" text;--> statement-breakpoint
ALTER TABLE "industrial_demand_response" ADD COLUMN "dr_load_adjustability" text;--> statement-breakpoint
ALTER TABLE "industrial_demand_response" ADD COLUMN "dr_adjustment_duration_limit" text;--> statement-breakpoint
ALTER TABLE "industrial_demand_response" ADD COLUMN "dr_advance_notice_required" text;--> statement-breakpoint
ALTER TABLE "industrial_demand_response" ADD COLUMN "dr_participation_frequency" text;--> statement-breakpoint
ALTER TABLE "industrial_demand_response" ADD COLUMN "dr_impossible_participation_periods" text;--> statement-breakpoint
ALTER TABLE "industrial_demand_response" ADD COLUMN "dr_participation_barriers" text;--> statement-breakpoint
ALTER TABLE "industrial_demand_response" ADD COLUMN "dr_seasonal_preference" text;--> statement-breakpoint
ALTER TABLE "industrial_demand_response" ADD COLUMN "dr_increase_production_before_peak" text;--> statement-breakpoint
ALTER TABLE "industrial_demand_response" ADD COLUMN "dr_complete_delayed_production_after_peak" text;--> statement-breakpoint
ALTER TABLE "industrial_demand_response" ADD COLUMN "dr_delayed_production_new_peak" text;--> statement-breakpoint
ALTER TABLE "industrial_demand_response" ADD COLUMN "dr_option_to_decline_requests" text;--> statement-breakpoint
ALTER TABLE "industrial_demand_response" ADD COLUMN "dr_preferred_notification_method" text;--> statement-breakpoint
ALTER TABLE "industrial_demand_response" ADD COLUMN "dr_savings_info_increases_willingness" text;--> statement-breakpoint
ALTER TABLE "industrial_demand_response" ADD COLUMN "dr_incentive_increases_willingness" text;--> statement-breakpoint
ALTER TABLE "industrial_demand_response" ADD COLUMN "dr_preferred_incentive_type" text;--> statement-breakpoint
ALTER TABLE "industrial_demand_response" ADD COLUMN "dr_consider_automated_controls" text;--> statement-breakpoint
ALTER TABLE "industrial_demand_response" ADD COLUMN "dr_willing_to_participate_in_trial" text;--> statement-breakpoint
ALTER TABLE "industrial_demand_response" ADD COLUMN "dr_equipment_data_verification" text;--> statement-breakpoint
ALTER TABLE "industrial_demand_response" ADD COLUMN "dr_penalty_concern" text;--> statement-breakpoint
ALTER TABLE "industrial_demand_response" ADD COLUMN "dr_prior_participation" text;--> statement-breakpoint
ALTER TABLE "industrial_demand_response" ADD COLUMN "dr_incentive_preference" text;--> statement-breakpoint
ALTER TABLE "industrial_demand_response" ADD COLUMN "dr_financial_incentive" text;--> statement-breakpoint
ALTER TABLE "industrial_demand_response" ADD COLUMN "dr_notification_method" text;--> statement-breakpoint
ALTER TABLE "industrial_demand_response" ADD COLUMN "dr_automation_level" text;--> statement-breakpoint
ALTER TABLE "process_dependencies" ADD COLUMN "survey_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "process_dependencies" ADD COLUMN "process_name" text;--> statement-breakpoint
ALTER TABLE "process_dependencies" ADD COLUMN "depends_on_process_name" text;--> statement-breakpoint
ALTER TABLE "process_dependencies" ADD COLUMN "has_dependencies" text;--> statement-breakpoint
ALTER TABLE "process_dependencies" ADD COLUMN "interruption_impact" text;--> statement-breakpoint
ALTER TABLE "process_dependencies" ADD COLUMN "time_to_stop" text;--> statement-breakpoint
ALTER TABLE "process_dependencies" ADD COLUMN "time_to_restart" text;--> statement-breakpoint
ALTER TABLE "process_dependencies" ADD COLUMN "restarting_demand_spike" text;--> statement-breakpoint
ALTER TABLE "surveys" ADD COLUMN "validation_warnings" jsonb;--> statement-breakpoint
ALTER TABLE "process_dependencies" ADD CONSTRAINT "process_dependencies_survey_id_surveys_id_fk" FOREIGN KEY ("survey_id") REFERENCES "public"."surveys"("id") ON DELETE cascade ON UPDATE no action;