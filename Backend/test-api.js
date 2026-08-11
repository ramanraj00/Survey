import 'dotenv/config';
import { db } from './db.js';
import { surveys } from './models/schema.js';

async function test() {
  try {
    const surveyList = await db.select().from(surveys).limit(1);
    const survey = surveyList[0];
    if (!survey) { console.log("No surveys found"); return; }
    
    const payload = {
      version: survey.version,
      profiles: {},
      occupancy: [],
      appliances: [],
      ev: {},
      backup: [],
      solar: {},
      commonLoadsInfo: {},
      commonLoads: [],
      loadFlexibility: {}
    };

    console.log("Testing PUT /api/surveys/:id/residential with payload...");
    const res = await fetch(`http://localhost:5000/api/surveys/${survey.id}/residential`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    const text = await res.text();
    console.log(`Status: ${res.status}`);
    console.log(`Response: ${text}`);
  } catch (error) {
    console.error("Test Error:", error);
  }
}
test();
