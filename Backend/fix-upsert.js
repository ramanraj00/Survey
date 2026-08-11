import fs from 'fs';
let code = fs.readFileSync('routes/surveys.js', 'utf8');

const helper = `
// Helper to safely upsert sections even if data is empty
const upsertSection = async (tx, table, surveyId, data) => {
  // Filter out fields with undefined values to prevent errors
  const cleanData = {};
  if (data) {
    for (const [k, v] of Object.entries(data)) {
      if (v !== undefined) cleanData[k] = v;
    }
  }

  if (Object.keys(cleanData).length > 0) {
    await tx.insert(table).values({ surveyId, ...cleanData }).onConflictDoUpdate({ target: table.surveyId, set: cleanData });
  } else {
    await tx.insert(table).values({ surveyId }).onConflictDoNothing();
  }
};
`;

code = code.replace("// GET /api/surveys", helper + "\n// GET /api/surveys");

// Common
code = code.replace(
  /await tx\.insert\(surveyCommonDetails\)\.values\(\{ surveyId: req\.survey\.id, \.\.\.data \}\)[\s\S]*?\.onConflictDoUpdate\(\{ target: surveyCommonDetails\.surveyId, set: \{ \.\.\.data \} \}\);/,
  "await upsertSection(tx, surveyCommonDetails, req.survey.id, data);"
);

// Residential
code = code.replace(/if \(profiles\) await tx\.insert\(residentialProfiles\).*?;/, "if (profiles) await upsertSection(tx, residentialProfiles, req.survey.id, profiles);");
code = code.replace(/if \(ev\) await tx\.insert\(evCharging\).*?;/, "if (ev) await upsertSection(tx, evCharging, req.survey.id, ev);");
code = code.replace(/if \(solar\) await tx\.insert\(solarInstallations\).*?;/, "if (solar) await upsertSection(tx, solarInstallations, req.survey.id, solar);");
code = code.replace(/if \(commonLoadsInfo\) await tx\.insert\(residentialCommonLoadsInfo\).*?;/, "if (commonLoadsInfo) await upsertSection(tx, residentialCommonLoadsInfo, req.survey.id, commonLoadsInfo);");
code = code.replace(/if \(loadFlexibility\) await tx\.insert\(residentialLoadFlexibility\).*?;/, "if (loadFlexibility) await upsertSection(tx, residentialLoadFlexibility, req.survey.id, loadFlexibility);");

// Commercial
code = code.replace(/if \(profiles\) await tx\.insert\(commercialProfiles\).*?;/, "if (profiles) await upsertSection(tx, commercialProfiles, req.survey.id, profiles);");
code = code.replace(/if \(controls\) await tx\.insert\(commercialControls\).*?;/, "if (controls) await upsertSection(tx, commercialControls, req.survey.id, controls);");

// Industrial
code = code.replace(/if \(profiles\) await tx\.insert\(industrialProfiles\).*?;/, "if (profiles) await upsertSection(tx, industrialProfiles, req.survey.id, profiles);");
code = code.replace(/if \(controls\) await tx\.insert\(industrialControls\).*?;/, "if (controls) await upsertSection(tx, industrialControls, req.survey.id, controls);");

// Demand Response
code = code.replace(/if \(profiles\) await tx\.insert\(demandResponseProfiles\).*?;/, "if (profiles) await upsertSection(tx, demandResponseProfiles, req.survey.id, profiles);");
code = code.replace(/if \(commercialDR\) await tx\.insert\(commercialDemandResponse\).*?;/, "if (commercialDR) await upsertSection(tx, commercialDemandResponse, req.survey.id, commercialDR);");
code = code.replace(/if \(industrialDR\) await tx\.insert\(industrialDemandResponse\).*?;/, "if (industrialDR) await upsertSection(tx, industrialDemandResponse, req.survey.id, industrialDR);");

fs.writeFileSync('routes/surveys.js', code);
