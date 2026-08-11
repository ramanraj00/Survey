import fs from 'fs';
let code = fs.readFileSync('routes/surveys.js', 'utf8');

// Add console.error to all catch blocks that return 500
code = code.replace(/res\.status\(500\)\.json\(\{ error: "Transaction failed" \}\);/g, 'console.error("Tx error:", error); res.status(500).json({ error: "Transaction failed" });');

fs.writeFileSync('routes/surveys.js', code);
