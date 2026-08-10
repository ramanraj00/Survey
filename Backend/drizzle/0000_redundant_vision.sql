CREATE TYPE "public"."common_load_type" AS ENUM('LIFT', 'WATER_SEWAGE_PUMP', 'OTHER');--> statement-breakpoint
CREATE TYPE "public"."consumer_category" AS ENUM('RESIDENTIAL', 'COMMERCIAL', 'INDUSTRIAL');--> statement-breakpoint
CREATE TYPE "public"."invite_status" AS ENUM('PENDING', 'ACCEPTED', 'EXPIRED');--> statement-breakpoint
CREATE TYPE "public"."survey_status" AS ENUM('DRAFT', 'SUBMITTED', 'APPROVED');--> statement-breakpoint
CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"role" text DEFAULT 'agent',
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "commercial_controls" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"survey_id" uuid NOT NULL,
	"has_automatic_controls" boolean,
	"controlled_inventory_item_ids" jsonb,
	"has_bms" boolean,
	"can_change_schedules_centrally" boolean,
	"central_control_available" boolean,
	"has_solar" boolean,
	"solar_capacity" text,
	"has_dg" boolean,
	"dg_capacity" text,
	"has_ups" boolean,
	"ups_capacity" text,
	"has_ev_charging" boolean,
	"charger_count" integer,
	CONSTRAINT "commercial_controls_survey_id_unique" UNIQUE("survey_id")
);
--> statement-breakpoint
CREATE TABLE "commercial_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"survey_id" uuid NOT NULL,
	"business_type" text,
	"building_nature" text,
	"floor_count" integer,
	"operational_areas" text,
	"operating_days" integer,
	"days_closed" text,
	"opening_time" text,
	"closing_time" text,
	"operates_in_shifts" boolean,
	"shift_count" integer,
	"is_open_24_hours" boolean,
	"highest_activity_period" text,
	"approver_name" text,
	"approver_designation" text,
	CONSTRAINT "commercial_profiles_survey_id_unique" UNIQUE("survey_id")
);
--> statement-breakpoint
CREATE TABLE "commercial_shifts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"survey_id" uuid NOT NULL,
	"shift_number" integer,
	"start_time" text,
	"end_time" text
);
--> statement-breakpoint
CREATE TABLE "commercial_demand_response" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"survey_id" uuid NOT NULL,
	"shifted_load_timing" text,
	"participation_barriers" text,
	"incentive_type" text,
	CONSTRAINT "commercial_demand_response_survey_id_unique" UNIQUE("survey_id")
);
--> statement-breakpoint
CREATE TABLE "demand_response_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"survey_id" uuid NOT NULL,
	"willingness" text,
	"estimated_adjustment_duration" text,
	"maximum_adjustment_duration" integer,
	"required_advance_notice" integer,
	"participation_frequency" text,
	"notification_method" text,
	"bill_savings_influence" text,
	"incentive_influence" text,
	"preferred_incentive" text,
	"automation_interest" boolean,
	"trial_event_willingness" boolean,
	"constraints" text,
	CONSTRAINT "demand_response_profiles_survey_id_unique" UNIQUE("survey_id")
);
--> statement-breakpoint
CREATE TABLE "dr_load_selections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"survey_id" uuid NOT NULL,
	"inventory_item_id" uuid,
	"process_id" text,
	"adjustment_type" text,
	"adjustment_duration" integer,
	"remarks" text
);
--> statement-breakpoint
CREATE TABLE "industrial_demand_response" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"survey_id" uuid NOT NULL,
	"adjustment_scope" text,
	"non_participation_periods" text,
	"can_increase_prod_before_peak" text,
	"can_complete_after_peak" text,
	"creates_new_demand_peak" text,
	"can_decline_individual_requests" boolean,
	"equipment_data_verification_consent" text,
	CONSTRAINT "industrial_demand_response_survey_id_unique" UNIQUE("survey_id")
);
--> statement-breakpoint
CREATE TABLE "industrial_controls" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"survey_id" uuid NOT NULL,
	"has_timers" boolean,
	"has_automatic_controls" boolean,
	"has_plc" boolean,
	"has_scada" boolean,
	"has_central_control" boolean,
	"can_change_schedules_centrally" boolean,
	"individual_machine_monitoring" boolean,
	"approval_name" text,
	"approval_designation" text,
	"implementation_role" text,
	CONSTRAINT "industrial_controls_survey_id_unique" UNIQUE("survey_id")
);
--> statement-breakpoint
CREATE TABLE "industrial_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"survey_id" uuid NOT NULL,
	"industry_sector" text,
	"products_manufactured" text,
	"production_nature" text,
	"operating_days" integer,
	"operating_timing" text,
	"shifts" text,
	"days_per_week" integer,
	"days_closed" text,
	"operating_hours" integer,
	"production_shift_count" integer,
	"shift_timings" text,
	"operates_24_hours" boolean,
	"highest_production_months" text,
	"production_schedule_flexibility" text,
	"can_increase_before_peak" boolean,
	"maintenance_schedule" text,
	"maintenance_frequency" text,
	CONSTRAINT "industrial_profiles_survey_id_unique" UNIQUE("survey_id")
);
--> statement-breakpoint
CREATE TABLE "industrial_shifts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"survey_id" uuid NOT NULL,
	"shift_number" integer,
	"start_time" text,
	"end_time" text
);
--> statement-breakpoint
CREATE TABLE "process_dependencies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"process_id" uuid NOT NULL,
	"depends_on_process_id" uuid NOT NULL,
	"dependency_explanation" text
);
--> statement-breakpoint
CREATE TABLE "production_processes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"survey_id" uuid NOT NULL,
	"process_name" text,
	"description" text,
	"main_production_stages" text,
	"peak_operating_processes" text,
	"continuous_processes" text,
	"delayable_processes" text,
	"reducible_processes" text,
	"stoppable_processes" text,
	"interruption_impact" text,
	"safe_stop_time" integer,
	"restart_time" integer,
	"restart_causes_demand_increase" boolean
);
--> statement-breakpoint
CREATE TABLE "backup_power_sources" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"survey_id" uuid NOT NULL,
	"type" text,
	"available" boolean,
	"battery_capacity" text,
	"battery_capacity_unit" text,
	"automatic_charging" boolean,
	"charging_control" text
);
--> statement-breakpoint
CREATE TABLE "ev_charging" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"survey_id" uuid NOT NULL,
	"has_ev" boolean,
	"vehicle_type" text,
	"vehicle_count" integer,
	"charger_rating" text,
	"charger_rating_unit" text,
	"usual_charging_start" text,
	"usual_charging_end" text,
	"charging_frequency" text,
	"peak_shift_ability" text,
	"maximum_allowable_delay" integer,
	CONSTRAINT "ev_charging_survey_id_unique" UNIQUE("survey_id")
);
--> statement-breakpoint
CREATE TABLE "residential_appliances" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"survey_id" uuid NOT NULL,
	"appliance_type" text,
	"available" boolean,
	"number_of_units" integer,
	"capacity" text,
	"capacity_unit" text,
	"typical_usage_time" text,
	"used_during_peak" boolean,
	"possible_adjustment" text,
	"max_duration_or_new_time" text,
	"constraints_or_remarks" text,
	"other_appliance_name" text,
	"remarks" text
);
--> statement-breakpoint
CREATE TABLE "residential_common_loads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"survey_id" uuid NOT NULL,
	"load_type" text NOT NULL,
	"number_of_lifts" integer,
	"rated_capacity_per_lift" text,
	"rated_capacity_per_lift_unit" text,
	"minimum_lifts_required" integer,
	"can_reduce_lift_operation" boolean,
	"max_acceptable_duration" integer,
	"pump_type" text,
	"number_of_pumps" integer,
	"capacity_per_pump" text,
	"capacity_per_pump_unit" text,
	"typical_operating_time" text,
	"approx_storage_duration" text,
	"shiftable_pumping_window" text,
	"can_move_outside_peak" boolean,
	"load_name" text,
	"available" boolean,
	"operates_during_peak" boolean,
	"possible_adjustment" text,
	"maximum_duration" integer,
	"constraints" text
);
--> statement-breakpoint
CREATE TABLE "residential_common_loads_info" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"survey_id" uuid NOT NULL,
	"has_separate_connection" boolean,
	"management_entity" text,
	"approval_authority_name" text,
	"approval_authority_role" text,
	"approval_authority_phone" text,
	"approval_time" text,
	CONSTRAINT "residential_common_loads_info_survey_id_unique" UNIQUE("survey_id")
);
--> statement-breakpoint
CREATE TABLE "residential_load_flexibility" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"survey_id" uuid NOT NULL,
	"ac_temperature_adjustment" text,
	"water_heating_adjustment" text,
	"washing_cleaning_adjustment" text,
	"ev_charging_adjustment" text,
	"water_pumping_adjustment" text,
	CONSTRAINT "residential_load_flexibility_survey_id_unique" UNIQUE("survey_id")
);
--> statement-breakpoint
CREATE TABLE "residential_occupancy" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"survey_id" uuid NOT NULL,
	"time_period" text,
	"weekday_occupancy" text,
	"weekend_occupancy" text
);
--> statement-breakpoint
CREATE TABLE "residential_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"survey_id" uuid NOT NULL,
	"residence_type" text,
	"built_area" text,
	"built_area_unit" text,
	"adult_count" integer,
	"children_count" integer,
	"work_from_home" boolean,
	"work_from_home_people" integer,
	"work_from_home_timings" text,
	"more_people_on_weekend" boolean,
	"highest_usage_period" text,
	"main_usage_activities" text,
	"bill_checking_frequency" text,
	CONSTRAINT "residential_profiles_survey_id_unique" UNIQUE("survey_id")
);
--> statement-breakpoint
CREATE TABLE "solar_installations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"survey_id" uuid NOT NULL,
	"installed" boolean,
	"capacity" text,
	"capacity_unit" text,
	"battery_connected" boolean,
	CONSTRAINT "solar_installations_survey_id_unique" UNIQUE("survey_id")
);
--> statement-breakpoint
CREATE TABLE "inventory_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"survey_id" uuid NOT NULL,
	"consumer_category" text,
	"process_or_use" text,
	"equipment_description" text,
	"number_of_units" integer,
	"rated_capacity" text,
	"capacity_unit" text,
	"typical_start_time" text,
	"typical_end_time" text,
	"operates_during_peak" boolean,
	"load_criticality" text,
	"shiftable" text,
	"max_shiftable_duration" integer,
	"operational_constraints" text,
	"remarks" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invitations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"token_hash" text NOT NULL,
	"role" text DEFAULT 'agent' NOT NULL,
	"expires_at" timestamp NOT NULL,
	"status" "invite_status" DEFAULT 'PENDING' NOT NULL,
	"created_by" text NOT NULL,
	"accepted_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "survey_audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"survey_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"action" text NOT NULL,
	"section" text,
	"entity_id" text,
	"field" text NOT NULL,
	"old_value" jsonb,
	"new_value" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "survey_common_details" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"survey_id" uuid NOT NULL,
	"survey_date" text,
	"survey_time" text,
	"enumerator_name" text,
	"discom_rep_present" boolean,
	"discom_rep_name" text,
	"discom_rep_designation" text,
	"address" text,
	"location" text,
	"latitude" text,
	"longitude" text,
	"respondent_name" text,
	"respondent_phone" text,
	"respondent_designation" text,
	"consent_to_collect" boolean,
	"consent_to_photos" boolean,
	"service_connection_number" text,
	"meter_number" text,
	"metering_type" text,
	"supply_classification" text,
	"supply_phase" text,
	"tariff_category" text,
	"circle" text,
	"division" text,
	"subdivision" text,
	"section" text,
	"substation" text,
	"feeder_name" text,
	"feeder_code" text,
	"dtr_name" text,
	"dtr_code" text,
	"has_multiple_connections" boolean,
	"meter_count" integer,
	"multiple_conn_supply_type" text,
	"sanctioned_load" text,
	"contracted_demand" text,
	"highest_billed_demand" text,
	"avg_monthly_consumption" text,
	"typical_monthly_bill" text,
	"operating_days" text,
	"operating_start_time" text,
	"operating_end_time" text,
	"occupancy" text,
	"seasonality" text,
	"has_rooftop_solar" boolean,
	"has_dg_set" boolean,
	"has_battery_inverter" boolean,
	"has_no_alternative_source" boolean,
	"frequent_power_outages" boolean,
	"outage_remarks" text,
	CONSTRAINT "survey_common_details_survey_id_unique" UNIQUE("survey_id")
);
--> statement-breakpoint
CREATE TABLE "surveys" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"survey_number" text NOT NULL,
	"agent_id" text NOT NULL,
	"consumer_category" "consumer_category" NOT NULL,
	"consumer_subcategory" text,
	"status" "survey_status" DEFAULT 'DRAFT' NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"submitted_at" timestamp,
	"approved_at" timestamp,
	"approved_by" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "surveys_survey_number_unique" UNIQUE("survey_number")
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "commercial_controls" ADD CONSTRAINT "commercial_controls_survey_id_surveys_id_fk" FOREIGN KEY ("survey_id") REFERENCES "public"."surveys"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "commercial_profiles" ADD CONSTRAINT "commercial_profiles_survey_id_surveys_id_fk" FOREIGN KEY ("survey_id") REFERENCES "public"."surveys"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "commercial_shifts" ADD CONSTRAINT "commercial_shifts_survey_id_surveys_id_fk" FOREIGN KEY ("survey_id") REFERENCES "public"."surveys"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "commercial_demand_response" ADD CONSTRAINT "commercial_demand_response_survey_id_surveys_id_fk" FOREIGN KEY ("survey_id") REFERENCES "public"."surveys"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "demand_response_profiles" ADD CONSTRAINT "demand_response_profiles_survey_id_surveys_id_fk" FOREIGN KEY ("survey_id") REFERENCES "public"."surveys"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dr_load_selections" ADD CONSTRAINT "dr_load_selections_survey_id_surveys_id_fk" FOREIGN KEY ("survey_id") REFERENCES "public"."surveys"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dr_load_selections" ADD CONSTRAINT "dr_load_selections_inventory_item_id_inventory_items_id_fk" FOREIGN KEY ("inventory_item_id") REFERENCES "public"."inventory_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "industrial_demand_response" ADD CONSTRAINT "industrial_demand_response_survey_id_surveys_id_fk" FOREIGN KEY ("survey_id") REFERENCES "public"."surveys"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "industrial_controls" ADD CONSTRAINT "industrial_controls_survey_id_surveys_id_fk" FOREIGN KEY ("survey_id") REFERENCES "public"."surveys"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "industrial_profiles" ADD CONSTRAINT "industrial_profiles_survey_id_surveys_id_fk" FOREIGN KEY ("survey_id") REFERENCES "public"."surveys"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "industrial_shifts" ADD CONSTRAINT "industrial_shifts_survey_id_surveys_id_fk" FOREIGN KEY ("survey_id") REFERENCES "public"."surveys"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "process_dependencies" ADD CONSTRAINT "process_dependencies_process_id_production_processes_id_fk" FOREIGN KEY ("process_id") REFERENCES "public"."production_processes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "process_dependencies" ADD CONSTRAINT "process_dependencies_depends_on_process_id_production_processes_id_fk" FOREIGN KEY ("depends_on_process_id") REFERENCES "public"."production_processes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "production_processes" ADD CONSTRAINT "production_processes_survey_id_surveys_id_fk" FOREIGN KEY ("survey_id") REFERENCES "public"."surveys"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "backup_power_sources" ADD CONSTRAINT "backup_power_sources_survey_id_surveys_id_fk" FOREIGN KEY ("survey_id") REFERENCES "public"."surveys"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ev_charging" ADD CONSTRAINT "ev_charging_survey_id_surveys_id_fk" FOREIGN KEY ("survey_id") REFERENCES "public"."surveys"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "residential_appliances" ADD CONSTRAINT "residential_appliances_survey_id_surveys_id_fk" FOREIGN KEY ("survey_id") REFERENCES "public"."surveys"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "residential_common_loads" ADD CONSTRAINT "residential_common_loads_survey_id_surveys_id_fk" FOREIGN KEY ("survey_id") REFERENCES "public"."surveys"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "residential_common_loads_info" ADD CONSTRAINT "residential_common_loads_info_survey_id_surveys_id_fk" FOREIGN KEY ("survey_id") REFERENCES "public"."surveys"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "residential_load_flexibility" ADD CONSTRAINT "residential_load_flexibility_survey_id_surveys_id_fk" FOREIGN KEY ("survey_id") REFERENCES "public"."surveys"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "residential_occupancy" ADD CONSTRAINT "residential_occupancy_survey_id_surveys_id_fk" FOREIGN KEY ("survey_id") REFERENCES "public"."surveys"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "residential_profiles" ADD CONSTRAINT "residential_profiles_survey_id_surveys_id_fk" FOREIGN KEY ("survey_id") REFERENCES "public"."surveys"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "solar_installations" ADD CONSTRAINT "solar_installations_survey_id_surveys_id_fk" FOREIGN KEY ("survey_id") REFERENCES "public"."surveys"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_items" ADD CONSTRAINT "inventory_items_survey_id_surveys_id_fk" FOREIGN KEY ("survey_id") REFERENCES "public"."surveys"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "survey_audit_logs" ADD CONSTRAINT "survey_audit_logs_survey_id_surveys_id_fk" FOREIGN KEY ("survey_id") REFERENCES "public"."surveys"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "survey_audit_logs" ADD CONSTRAINT "survey_audit_logs_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "survey_common_details" ADD CONSTRAINT "survey_common_details_survey_id_surveys_id_fk" FOREIGN KEY ("survey_id") REFERENCES "public"."surveys"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "surveys" ADD CONSTRAINT "surveys_agent_id_user_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "surveys" ADD CONSTRAINT "surveys_approved_by_user_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "account_userId_idx" ON "account" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "session_userId_idx" ON "session" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "verification_identifier_idx" ON "verification" USING btree ("identifier");