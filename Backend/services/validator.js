/**
 * Evaluates the full survey object and returns an array of validation warnings.
 * Uses a 2-layer approach:
 * Layer 1: Evaluates conditional logic to determine applicability.
 * Layer 2: Generic traversal to flag null/undefined fields, respecting applicability.
 */
export function validateSurveyData(data) {
  const warnings = [];
  const ignorePaths = new Set();
  
  // ============================================================================
  // LAYER 1: CONDITIONAL APPLICABILITY RULES
  // ============================================================================
  
  const res = data.residential || {};
  const com = data.commercial || {};
  const ind = data.industrial || {};
  
  // 1. Residential EV
  if (res.ev) {
    if (res.ev.hasEV === false) {
      ignorePaths.add('residential.ev.vehicleType');
      ignorePaths.add('residential.ev.vehicleCount');
      ignorePaths.add('residential.ev.chargerRating');
      ignorePaths.add('residential.ev.chargerRatingUnit');
      ignorePaths.add('residential.ev.usualChargingStart');
      ignorePaths.add('residential.ev.usualChargingEnd');
      ignorePaths.add('residential.ev.chargingFrequency');
      ignorePaths.add('residential.ev.peakShiftAbility');
      ignorePaths.add('residential.ev.maximumAllowableDelay');
    }
  }

  // 2. Residential Common Loads Info (Lifts, Pumps)
  if (res.commonLoadsInfo) {
    if (res.commonLoadsInfo.hasSeparateConnection === false) {
      ignorePaths.add('residential.commonLoadsInfo.managementEntity');
      ignorePaths.add('residential.commonLoadsInfo.approvalAuthorityName');
      ignorePaths.add('residential.commonLoadsInfo.approvalAuthorityRole');
      ignorePaths.add('residential.commonLoadsInfo.approvalAuthorityPhone');
      ignorePaths.add('residential.commonLoadsInfo.approvalTime');
    }
  }

  // 4. Array Minimum Length Rules (Repeatable sections)
  if (!data.inventoryItems || data.inventoryItems.length === 0) {
    warnings.push({ field: 'inventoryItems', section: 'inventory_items', message: 'At least one inventory item is required', severity: 'warning' });
  }

  if (data.survey && data.survey.consumerCategory === 'RESIDENTIAL') {
    if (!res.occupancy || res.occupancy.length === 0) {
      warnings.push({ field: 'residential.occupancy', section: 'residential_occupancy', message: 'At least one occupancy profile is required', severity: 'warning' });
    }
    if (!res.appliances || res.appliances.length === 0) {
      warnings.push({ field: 'residential.appliances', section: 'residential_appliances', message: 'At least one appliance entry is required', severity: 'warning' });
    }
  } else if (data.survey && data.survey.consumerCategory === 'COMMERCIAL') {
    if (!com.shifts || com.shifts.length === 0) {
      warnings.push({ field: 'commercial.shifts', section: 'commercial_shifts', message: 'At least one operating shift is required', severity: 'warning' });
    }
    ignorePaths.add('demandResponse.industrialDR');
  } else if (data.survey && data.survey.consumerCategory === 'INDUSTRIAL') {
    if (!ind.shifts || ind.shifts.length === 0) {
      warnings.push({ field: 'industrial.shifts', section: 'industrial_shifts', message: 'At least one operating shift is required', severity: 'warning' });
    }
    if (!ind.processes || ind.processes.length === 0) {
      warnings.push({ field: 'industrial.processes', section: 'production_processes', message: 'At least one production process is required', severity: 'warning' });
    }
    ignorePaths.add('demandResponse.commercialDR');
    ignorePaths.add('demandResponse.profiles');

    // Ignore deprecated / old fields in industrial demand response
    const deprecatedIndDR = [
      'adjustmentScope', 'nonParticipationPeriods', 'canIncreaseProductionBeforePeak',
      'canCompleteAfterPeak', 'createsNewDemandPeak', 'canDeclineIndividualRequests',
      'equipmentDataVerificationConsent', 'drPenaltyConcern', 'drPriorParticipation',
      'drIncentivePreference', 'drFinancialIncentive', 'drNotificationMethod', 'drAutomationLevel'
    ];
    deprecatedIndDR.forEach(field => ignorePaths.add(`demandResponse.industrialDR.${field}`));
  }

  // ============================================================================
  // LAYER 2: GENERIC NULL / UNDEFINED CHECKER
  // ============================================================================
  
  const checkValues = (obj, currentPath, section) => {
    if (obj === null || obj === undefined) return;
    if (typeof obj !== 'object') return;
    
    Object.keys(obj).forEach(key => {
      // Skip internal fields
      if (['id', 'surveyId', 'createdAt', 'updatedAt'].includes(key)) return;
      
      const val = obj[key];
      const fullPath = currentPath ? `${currentPath}.${key}` : key;
      
      // If this path is marked to be ignored by Layer 1, skip entirely.
      if (ignorePaths.has(fullPath)) return;

      if (val === null || val === undefined || val === "") {
        warnings.push({
          field: fullPath,
          section: section || currentPath.split('.')[0] || 'general',
          message: `${key} is missing or not entered`,
          severity: 'warning'
        });
      } else if (Array.isArray(val)) {
        val.forEach((item, index) => {
          checkValues(item, `${fullPath}[${index}]`, section || currentPath.split('.')[0]);
        });
      } else if (typeof val === 'object') {
        checkValues(val, fullPath, section || currentPath.split('.')[0]);
      }
    });
  };

  // Base checks
  checkValues(data.commonDetails, 'commonDetails', 'survey_common_details');
  checkValues(data.inventoryItems, 'inventoryItems', 'inventory_items');
  
  // Category-specific checks
  if (data.survey && data.survey.consumerCategory === 'RESIDENTIAL') {
    checkValues(data.residential, 'residential', 'residential');
  } else if (data.survey && data.survey.consumerCategory === 'COMMERCIAL') {
    checkValues(data.commercial, 'commercial', 'commercial');
    checkValues(data.demandResponse, 'demandResponse', 'demand_response');
  } else if (data.survey && data.survey.consumerCategory === 'INDUSTRIAL') {
    checkValues(data.industrial, 'industrial', 'industrial');
    checkValues(data.demandResponse, 'demandResponse', 'demand_response');
  }

  return {
    valid: warnings.length === 0,
    canSubmit: true,
    warnings
  };
}
