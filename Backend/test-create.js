import 'dotenv/config';
import { db } from './db.js';
import { surveys } from './models/schema.js';

async function test() {
  try {
    const surveyNumber = `SUR-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
    const [newSurvey] = await db.insert(surveys).values({
      agentId: 'b75f8582-747f-4f05-87bd-85b404d538e1', // fake uuid? Better Auth creates string ids
      consumerCategory: 'RESIDENTIAL',
      consumerSubcategory: 'It park',
      surveyNumber,
      status: 'DRAFT',
      version: 1
    }).returning();
    console.log(newSurvey);
  } catch (error) {
    console.error("DB Error:", error);
  }
}
test();
