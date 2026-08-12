import pg from 'pg';
const { Client } = pg;
const client = new Client({ connectionString: "postgresql://postgres:postgres@localhost:5432/survey_db" });
await client.connect();
try {
  await client.query(`
    insert into "demand_response_profiles" 
    ("id", "survey_id", "willingness", "estimated_adjustment_duration", "maximum_adjustment_duration", "required_advance_notice", "participation_frequency", "notification_method", "bill_savings_influence", "incentive_influence", "preferred_incentive", "automation_interest", "trial_event_willingness", "constraints") 
    values (default, $1, $2, $3, default, $4, $5, $6, $7, $8, $9, $10, $11, $12) 
    on conflict ("survey_id") do update set 
    "willingness" = $13, "estimated_adjustment_duration" = $14, "required_advance_notice" = $15, "participation_frequency" = $16, "notification_method" = $17, "bill_savings_influence" = $18, "incentive_influence" = $19, "preferred_incentive" = $20, "automation_interest" = $21, "trial_event_willingness" = $22, "constraints" = $23
  `, [
    "c34d0c8f-67ae-4781-a693-09a99f1e88d9", "Yes", "30mins", "15-30mins", "Daily", "SMS", "Maybe", "Yes", "Electricity bill rebate", "Yes", true, "Air conditioners / Cooling Loads, Indoor lighting, Laundry, Signage / Display screens",
    "Yes", "30mins", "15-30mins", "Daily", "SMS", "Maybe", "Yes", "Electricity bill rebate", "Yes", true, "Air conditioners / Cooling Loads, Indoor lighting, Laundry, Signage / Display screens"
  ]);
  console.log("Success");
} catch (err) {
  console.error("PG Error:", err.message);
} finally {
  await client.end();
}
