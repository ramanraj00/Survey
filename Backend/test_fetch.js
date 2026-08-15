import { fetchFullSurvey } from './services/surveyFetcher.js';
async function run() {
  try {
    const res = await fetchFullSurvey('00000000-0000-0000-0000-000000000000');
    console.log("Fetch succeeded!", res);
    process.exit(0);
  } catch (err) {
    console.error("Fetch failed:", err);
    process.exit(1);
  }
}
run();
