import fs from 'fs';
let code = fs.readFileSync('middlewares.js', 'utf8');
code = code.replace(/export const requireAuth = async \(req, res, next\) => \{[\s\S]*?next\(\);\n  \} catch \(error\) \{[\s\S]*?\}\n\};/, `export const requireAuth = async (req, res, next) => { req.user = { id: 'admin', role: 'admin' }; next(); };`);
code = code.replace(/export const checkSurveyOwnership = async \(req, res, next\) => \{[\s\S]*?req\.survey = survey;\n    next\(\);\n  \} catch \(error\) \{[\s\S]*?\}\n\};/, `export const checkSurveyOwnership = async (req, res, next) => { req.survey = { id: req.params.id }; next(); };`);
fs.writeFileSync('middlewares_test.js', code);
