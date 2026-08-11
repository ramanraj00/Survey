import fs from 'fs';
import path from 'path';

const pagesDir = 'src/pages/Survey';
const files = [
  'Common/index.jsx',
  'Residential/index.jsx',
  'Commercial/index.jsx',
  'Industrial/index.jsx',
  'DemandResponse/index.jsx',
  'Inventory/index.jsx'
];

files.forEach(file => {
  const filePath = path.join(pagesDir, file);
  if (!fs.existsSync(filePath)) return;
  
  let code = fs.readFileSync(filePath, 'utf8');
  
  // 1. Add import if not present
  if (!code.includes("import { isFormEmpty }")) {
    // find last import
    const lastImportIndex = code.lastIndexOf("import ");
    const newlineAfterImport = code.indexOf('\n', lastImportIndex);
    code = code.slice(0, newlineAfterImport + 1) + 
           "import { isFormEmpty } from '../../../utils/formUtils';\n" + 
           code.slice(newlineAfterImport + 1);
  }
  
  // 2. Add validation to handleSave
  const checkCode = `
    if (isFormEmpty(formData)) {
      if (!window.confirm("This page is completely blank. Are you sure you want to proceed without entering any data?")) {
        return;
      }
    }`;

  // Find handleSave = async (e) => {
  // and insert right after e.preventDefault();
  code = code.replace(/(const handleSave = async \(e\) => \{\s*e\.preventDefault\(\);)/, "$1" + checkCode);
  
  fs.writeFileSync(filePath, code);
  console.log("Patched", filePath);
});
