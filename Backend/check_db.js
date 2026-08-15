import { db } from './db.js';
async function run() {
  const result = await db.execute(`
    SELECT table_name, column_name 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name IN ('ev_charging', 'residential_appliances', 'residential_profiles', 'residential_occupancy', 'backup_power_sources', 'solar_installations', 'residential_common_loads_info', 'residential_common_loads', 'residential_load_flexibility')
  `);
  console.log(JSON.stringify(result.rows.reduce((acc, row) => {
    if (!acc[row.table_name]) acc[row.table_name] = [];
    acc[row.table_name].push(row.column_name);
    return acc;
  }, {}), null, 2));
  process.exit(0);
}
run();
