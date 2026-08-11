const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf8');

// Fix imports for forms to use SurveyForms folder
code = code.replace(/import CommonForm from '.*';/, "import CommonForm from './pages/SurveyForms/CommonForm';");
code = code.replace(/import ResidentialForm from '.*';/, "import ResidentialForm from './pages/SurveyForms/ResidentialForm';");
code = code.replace(/import CommercialForm from '.*';/, "import CommercialForm from './pages/SurveyForms/CommercialForm';");
code = code.replace(/import IndustrialForm from '.*';/, "import IndustrialForm from './pages/SurveyForms/IndustrialForm';");
code = code.replace(/import DemandResponseForm from '.*';/, "import DemandResponseForm from './pages/SurveyForms/DemandResponseForm';");

fs.writeFileSync('src/App.jsx', code);
