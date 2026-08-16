import express from 'express';
import XLSX from 'xlsx';
import { db } from '../db.js';
import { surveys } from '../models/schema.js';
import { eq } from 'drizzle-orm';
import { requireAuth, requireRole } from '../middlewares.js';
import { fetchFullSurvey } from '../services/surveyFetcher.js';

export const exportRouter = express.Router();
exportRouter.use(requireAuth);
exportRouter.use(requireRole('admin'));

// ==========================================
// HELPER: Build a "question → answer" row
// ==========================================
const qRow = (code, label, ...values) => {
  const row = [code, label];
  values.forEach(v => row.push(v ?? ''));
  return row;
};

// ==========================================
// SHEET BUILDERS
// ==========================================

function buildCommonSheet(common, survey) {
  const c = common || {};
  const rows = [
    ['A', 'Survey Introduction'],
    ['A1', 'Survey Details'],
    qRow('A1.1', 'Survey Date / Time', c.surveyDate, c.surveyTime),
    qRow('A1.2', 'Name of Enumerator', c.enumeratorName),
    qRow('A1.3', 'DISCOM Representative Present', c.discomRepresentativePresent ? 'Yes' : (c.discomRepresentativePresent === false ? 'No' : ''), c.discomRepresentativeName, c.discomRepresentativeDesignation),
    qRow('A1.4', 'Address & Location', c.address, c.location, c.latitude ? `Lat: ${c.latitude}` : '', c.longitude ? `Lon: ${c.longitude}` : ''),
    qRow('A1.5', 'Consumer Category', survey.consumerCategory),
    qRow('A1.6', 'Subcategory', survey.consumerSubcategory),
    qRow('A1.7', 'Respondent Details', c.respondentName, c.respondentPhone, c.respondentDesignation),
    qRow('A1.8', 'Consent to collect & record', c.consentToCollect ? 'Yes' : (c.consentToCollect === false ? 'No' : '')),
    qRow('A1.9', 'Consent to photos', c.consentToPhotos ? 'Yes' : (c.consentToPhotos === false ? 'No' : '')),
    [],
    ['A2', 'Electricity Connection Details'],
    qRow('A2.1', 'Service Connection Number', c.serviceConnectionNumber),
    qRow('A2.2', 'Meter Number / Metering Type', c.meterNumber, c.meteringType),
    qRow('A2.3', 'Supply Classification / Phase', c.supplyClassification, c.supplyPhase),
    qRow('A2.4', 'Tariff Category', c.tariffCategory),
    qRow('A2.5', 'Circle / Division / Subdivision / Section', c.circle, c.division, c.subdivision, c.section),
    qRow('A2.6', 'Substation', c.substation),
    qRow('A2.7', 'Feeder name/code', c.feederName, c.feederCode),
    qRow('A2.8', 'DTR name/code', c.dtrName, c.dtrCode),
    qRow('A2.9', 'Multiple connections?', c.hasMultipleConnections ? 'Yes' : (c.hasMultipleConnections === false ? 'No' : ''), c.meterCount ? `Meters: ${c.meterCount}` : '', c.multipleConnectionSupplyType),
    [],
    ['A3', 'Electrical connection and consumption profile'],
    qRow('A3.1', 'Sanctioned Load / Contracted Demand', c.sanctionedLoad, c.contractedDemand),
    qRow('A3.2', 'Highest billed demand (kVA)', c.highestBilledDemand),
    qRow('A3.3', 'Avg monthly consumption (kWh)', c.averageMonthlyConsumption),
    qRow('A3.4', 'Typical Monthly Bill', c.typicalMonthlyBill),
    qRow('A3.5', 'Operating / Occupancy Schedule', c.operatingDays, c.operatingStartTime, c.operatingEndTime, c.occupancy),
    qRow('A3.6', 'Seasonality', c.seasonality),
    qRow('A3.7', 'On-site alternative sources', c.hasRooftopSolar ? 'Rooftop Solar' : '', c.hasDGSet ? 'DG Set' : '', c.hasBatteryInverter ? 'Battery/Inverter' : '', c.hasNoAlternativeSource ? 'None' : ''),
    qRow('A3.8', 'Frequent power outages', c.frequentPowerOutages ? 'Yes' : (c.frequentPowerOutages === false ? 'No' : ''), c.outageRemarks),
  ];
  return rows;
}

function buildInventorySheet(items) {
  const headerRow = ['Code', 'Label', 'Consumer Category', 'Process / Use', 'Equipment Description', 'No. of Units', 'Rated Capacity', 'Unit', 'Typical Start', 'Typical End', 'Peak Hours?', 'Criticality', 'Shiftable?', 'Max Shift Duration', 'Constraints', 'Remarks'];
  const rows = [
    ['B', 'Equipment and Flexible Load Inventory'],
    headerRow,
  ];
  (items || []).forEach((item, i) => {
    rows.push([
      `B-${i + 1}`,
      `Item ${i + 1}`,
      item.consumerCategory,
      item.processOrUse,
      item.equipmentDescription,
      item.numberOfUnits,
      item.ratedCapacity,
      item.capacityUnit,
      item.typicalStartTime,
      item.typicalEndTime,
      item.operatesDuringPeak,
      item.loadCriticality,
      item.shiftable,
      item.maximumShiftableDuration,
      item.operationalConstraints,
      item.remarks,
    ]);
  });
  return rows;
}

function buildResidentialSheet(res, dr) {
  const p = res?.profiles || {};
  const occupancy = res?.occupancy || [];
  const appliances = res?.appliances || [];
  const ev = res?.ev || {};
  const backup = res?.backup || [];
  const solar = res?.solar || {};
  const commonLoadsInfo = res?.commonLoadsInfo || {};
  const commonLoads = res?.commonLoads || [];
  const flex = res?.loadFlexibility || {};
  const drp = dr?.profiles || {};

  const rows = [
    ['C', 'Residential Consumers'],
    // C1 Household
    ['C1', 'Household / Daily Routine'],
    qRow('C1.1', 'Type of Residence', p.residenceType),
    qRow('C1.2', 'Approximate Built area', p.builtArea, p.builtAreaUnit),
    qRow('C1.3', 'Number of household members', `Adults: ${p.adultCount ?? ''}`, `Children: ${p.childrenCount ?? ''}`),
    qRow('C1.4', 'Work from home?', p.workFromHome ? 'Yes' : (p.workFromHome === false ? 'No' : ''), p.workFromHomePeople ? `People: ${p.workFromHomePeople}` : '', p.workFromHomeTimings),
    qRow('C1.5', 'More people on weekends?', p.morePeopleOnWeekend ? 'Yes' : (p.morePeopleOnWeekend === false ? 'No' : '')),
    qRow('C1.6', 'Highest electricity usage period', p.highestUsagePeriod),
    qRow('C1.7', 'Main activities during this period', p.mainUsageActivities),
    qRow('C1.8', 'Bill checking frequency', p.billCheckingFrequency),
    [],
    qRow('C1.9', 'Household occupancy by time-period', 'Time Period', 'Weekday', 'Weekend/Holidays'),
  ];
  occupancy.forEach(o => {
    rows.push(['', o.timePeriod, '', o.weekdayOccupancy, o.weekendOccupancy]);
  });

  // C2 Appliances
  rows.push([]);
  rows.push(['C2', 'Major Appliance Use and Flexibility', 'Yes/No', 'Units', 'Capacity', 'Typical Time', 'Peak Hours?', 'Possible Change', 'Max Duration/New Time', 'Constraints']);
  appliances.forEach((a, i) => {
    rows.push([
      `C2.${i + 1}`,
      a.applianceType || a.otherApplianceName || `Appliance ${i + 1}`,
      a.available ? 'Yes' : (a.available === false ? 'No' : ''),
      a.numberOfUnits,
      a.capacity ? `${a.capacity} ${a.capacityUnit || ''}` : '',
      a.typicalUsageTime,
      a.usedDuringPeak ? 'Yes' : (a.usedDuringPeak === false ? 'No' : ''),
      a.possibleAdjustment,
      a.maximumDurationOrNewTime,
      a.constraintsOrRemarks || a.remarks,
    ]);
  });

  // C3 EV, Backup, Solar
  rows.push([]);
  rows.push(['C3', 'Electric Vehicles, Back-up power sources & Rooftop Solar']);
  rows.push(['C3.1', 'Electric Vehicles']);
  rows.push(qRow('C3.1.1', 'Charge EV at home?', ev.hasEV ? 'Yes' : (ev.hasEV === false ? 'No' : '')));
  rows.push(qRow('C3.1.2', 'Vehicle type', ev.vehicleType));
  rows.push(qRow('C3.1.3', 'Number of vehicles', ev.vehicleCount));
  rows.push(qRow('C3.1.4', 'Charger rating', ev.chargerRating, ev.chargerRatingUnit));
  rows.push(qRow('C3.1.5', 'Usual charging time', ev.usualChargingStart, ev.usualChargingEnd));
  rows.push(qRow('C3.1.6', 'Charging frequency', ev.chargingFrequency));
  rows.push(qRow('C3.1.7', 'Can charging be moved outside peak?', ev.peakShiftAbility));
  rows.push(qRow('C3.1.8', 'Maximum allowable delay', ev.maximumAllowableDelay));

  rows.push([]);
  rows.push(['C3.2', 'Inverter / UPS']);
  backup.forEach((b, i) => {
    rows.push(qRow(`C3.2.${i + 1}`, `${b.type || 'Backup'} available?`, b.available ? 'Yes' : (b.available === false ? 'No' : ''), `Capacity: ${b.batteryCapacity || ''} ${b.batteryCapacityUnit || ''}`, `Auto charging: ${b.automaticCharging ? 'Yes' : (b.automaticCharging === false ? 'No' : '')}`, `Control: ${b.chargingControl || ''}`));
  });

  rows.push([]);
  rows.push(['C3.3', 'Rooftop Solar']);
  rows.push(qRow('C3.3.1', 'Is rooftop solar installed?', solar.installed ? 'Yes' : (solar.installed === false ? 'No' : '')));
  rows.push(qRow('C3.3.2', 'Installed solar capacity', solar.capacity, solar.capacityUnit));
  rows.push(qRow('C3.3.3', 'Battery connected to solar?', solar.batteryConnected ? 'Yes' : (solar.batteryConnected === false ? 'No' : '')));

  // C4 Flexibility
  rows.push([]);
  rows.push(['C4', 'Residential Flexibility/Willingness']);
  rows.push(qRow('C4.1', 'Willing to adjust non-essential appliances?', drp.willingness, drp.estimatedAdjustmentDuration ? `Duration: ${drp.estimatedAdjustmentDuration}` : ''));
  rows.push(qRow('C4.2', 'Which appliances could be adjusted?', drp.constraints));
  rows.push(qRow('C4.3', 'Duration of reduction without inconvenience', drp.maximumAdjustmentDuration));
  rows.push(qRow('C4.4', 'Advance notice required', drp.requiredAdvanceNotice));
  rows.push(qRow('C4.5', 'Participation frequency', drp.participationFrequency));
  rows.push(qRow('C4.6', 'Notification method', drp.notificationMethod));
  rows.push(qRow('C4.7', 'Bill savings influence?', drp.billSavingsInfluence));
  rows.push(qRow('C4.8', 'Incentive influence?', drp.incentiveInfluence));
  rows.push(qRow('C4.9', 'Preferred incentive type', drp.preferredIncentive));
  rows.push(qRow('C4.10', 'Smart plugs / automation interest?', drp.automationInterest));

  // C4.11+ Apartment common loads
  rows.push([]);
  rows.push(['', 'Specific for Apartments']);
  rows.push(qRow('C4.11', 'Separate connection for common loads?', commonLoadsInfo.hasSeparateConnection ? 'Yes' : (commonLoadsInfo.hasSeparateConnection === false ? 'No' : '')));
  rows.push(qRow('C4.12', 'Who manages common loads?', commonLoadsInfo.managementEntity));
  rows.push(qRow('C4.13', 'Approval authority', commonLoadsInfo.approvalAuthorityName, commonLoadsInfo.approvalAuthorityRole, commonLoadsInfo.approvalAuthorityPhone));
  rows.push(qRow('C4.14', 'Time for approval?', commonLoadsInfo.approvalTime));

  commonLoads.forEach(cl => {
    if (cl.loadType === 'LIFT') {
      rows.push(['C4.15', 'Lifts']);
      rows.push(qRow('a)', 'Number of lifts', cl.numberOfLifts));
      rows.push(qRow('b)', 'Rated capacity per lift', cl.ratedCapacityPerLift, cl.ratedCapacityPerLiftUnit));
      rows.push(qRow('c)', 'Minimum lifts required', cl.minimumLiftsRequired));
      rows.push(qRow('d)', 'Can reduce lift operation?', cl.canReduceLiftOperation ? 'Yes' : (cl.canReduceLiftOperation === false ? 'No' : '')));
      rows.push(qRow('e)', 'Max acceptable duration', cl.maximumAcceptableDuration));
    } else if (cl.loadType === 'WATER_SEWAGE_PUMP') {
      rows.push(['C4.16', 'Water / Sewage Pumping']);
      rows.push(qRow('a)', 'Type of pump', cl.pumpType));
      rows.push(qRow('b)', 'Number of pumps', cl.numberOfPumps, `Capacity: ${cl.capacityPerPump || ''} ${cl.capacityPerPumpUnit || ''}`));
      rows.push(qRow('c)', 'Typical operating time', cl.typicalOperatingTime));
      rows.push(qRow('d)', 'Approx storage duration', cl.approximateStorageDuration));
      rows.push(qRow('e)', 'Shiftable pumping window', cl.shiftablePumpingWindow));
      rows.push(qRow('f)', 'Can move outside peak?', cl.canMoveOutsidePeak ? 'Yes' : (cl.canMoveOutsidePeak === false ? 'No' : '')));
    } else {
      rows.push(['C4.17', `Other: ${cl.loadName || 'Load'}`]);
      rows.push(qRow('', 'Available', cl.available ? 'Yes' : 'No', `Peak: ${cl.operatesDuringPeak ? 'Yes' : 'No'}`, `Adjustment: ${cl.possibleAdjustment || ''}`, `Max: ${cl.maximumDuration || ''}`, `Constraints: ${cl.constraints || ''}`));
    }
  });

  // Load Flexibility questions
  rows.push([]);
  rows.push(['', 'Load Flexibility']);
  rows.push(qRow('', 'AC temp adjustment', flex.acTemperatureAdjustment));
  rows.push(qRow('', 'Water heating adjustment', flex.waterHeatingAdjustment));
  rows.push(qRow('', 'Washing/cleaning adjustment', flex.washingCleaningAdjustment));
  rows.push(qRow('', 'EV charging adjustment', flex.evChargingAdjustment));
  rows.push(qRow('', 'Water pumping adjustment', flex.waterPumpingAdjustment));

  return rows;
}

function buildCommercialSheet(com, dr) {
  const p = com?.profiles || {};
  const shifts = com?.shifts || [];
  const ctrl = com?.controls || {};
  const drp = dr?.profiles || {};
  const cdr = dr?.commercialDR || {};

  const rows = [
    ['D', 'Commercial Consumers'],
    ['D1', 'Business and Operating Profile'],
    qRow('D1.1', 'Type of Business', p.businessType),
    qRow('D1.2', 'Nature of Building', p.buildingNature),
    qRow('D1.3', 'No of floors / operational areas', p.floorCount, p.operationalAreas),
    qRow('D1.4', 'Typical operating days', `Days open: ${p.operatingDays ?? ''}`, `Days closed: ${p.daysClosed ?? ''}`),
    qRow('D1.5', 'Typical operating hours', p.openingTime, p.closingTime),
    qRow('D1.6', 'Operates in shifts?', p.operatesInShifts ? 'Yes' : (p.operatesInShifts === false ? 'No' : ''), p.shiftCount ? `Shifts: ${p.shiftCount}` : ''),
    qRow('D1.7', 'Shift timings', ...shifts.map(s => `Shift ${s.shiftNumber}: ${s.startTime}-${s.endTime}`)),
    qRow('D1.8', 'Open 24 hours?', p.isOpen24Hours ? 'Yes' : (p.isOpen24Hours === false ? 'No' : '')),
    qRow('D1.9', 'Highest activity period', p.highestActivityPeriod),
    qRow('D1.10', 'Approver for load changes', p.approverName, p.approverDesignation),
    [],
    ['D3', 'Existing Controls and Back-up Energy Resources'],
    qRow('D3.1', 'Automatic controls used?', ctrl.hasAutomaticControls ? 'Yes' : (ctrl.hasAutomaticControls === false ? 'No' : '')),
    qRow('D3.2', 'Controlled inventory items', ctrl.controlledInventoryItemIds?.join(', ')),
    qRow('D3.3', 'BMS available?', ctrl.hasBMS ? 'Yes' : (ctrl.hasBMS === false ? 'No' : '')),
    qRow('D3.4', 'Can change schedules centrally?', ctrl.canChangeSchedulesCentrally ? 'Yes' : (ctrl.canChangeSchedulesCentrally === false ? 'No' : ''), ctrl.centralControlAvailable ? 'Central Control Available' : ''),
    qRow('D3.5', 'Rooftop solar?', ctrl.hasSolar ? 'Yes' : (ctrl.hasSolar === false ? 'No' : ''), ctrl.solarCapacity),
    qRow('D3.6', 'DG set?', ctrl.hasDG ? 'Yes' : (ctrl.hasDG === false ? 'No' : ''), ctrl.dgCapacity),
    qRow('D3.7', 'UPS or battery?', ctrl.hasUPS ? 'Yes' : (ctrl.hasUPS === false ? 'No' : ''), ctrl.upsCapacity),
    qRow('D3.8', 'EV charging?', ctrl.hasEVCharging ? 'Yes' : (ctrl.hasEVCharging === false ? 'No' : ''), ctrl.chargerCount ? `Chargers: ${ctrl.chargerCount}` : ''),
    [],
    ['D4', 'DR Flexibility & Willingness'],
    qRow('D4.1', 'Willing to adjust non-critical loads?', drp.willingness),
    qRow('D4.3', 'Type of adjustment possible', cdr.shiftedLoadTiming),
    qRow('D4.4', 'Duration without affecting operations', drp.estimatedAdjustmentDuration),
    qRow('D4.5', 'Advance notice required', drp.requiredAdvanceNotice),
    qRow('D4.6', 'Participation frequency', drp.participationFrequency),
    qRow('D4.8', 'Participation barriers', cdr.participationBarriers),
    qRow('D4.9', 'Notification method', drp.notificationMethod),
    qRow('D4.10', 'Bill savings influence?', drp.billSavingsInfluence),
    qRow('D4.11', 'Incentive influence?', drp.incentiveInfluence),
    qRow('D4.12', 'Preferred incentive', cdr.incentiveType || drp.preferredIncentive),
    qRow('D4.13', 'Automation interest?', drp.automationInterest),
    qRow('D4.14', 'Trial DR event?', drp.trialEventWillingness ? 'Yes' : (drp.trialEventWillingness === false ? 'No' : '')),
  ];
  return rows;
}

function buildIndustrialSheet(ind, dr) {
  const p = ind?.profiles || {};
  const shifts = ind?.shifts || [];
  const processes = ind?.processes || [];
  const deps = ind?.processDependencies || [];
  const ctrl = ind?.controls || {};
  const drp = dr?.profiles || {};
  const idr = dr?.industrialDR || {};

  const rows = [
    ['E', 'Industrial Consumers'],
    ['E1', 'Industry & Production Profile'],
    qRow('E1.1', 'Type of Industry/Sector', p.industrySector),
    qRow('E1.2', 'Products Manufactured', p.productsManufactured),
    qRow('E1.3', 'Nature of production', p.productionNature),
    qRow('E1.4', 'Operations', `Days: ${p.operatingDays ?? ''}`, `Timing: ${p.operatingTiming ?? ''}`, `Shifts: ${p.shifts ?? ''}`),
    qRow('E1.5', 'Typical Days of Operation', `Days/Week: ${p.daysPerWeek ?? ''}`, `Closed: ${p.daysClosed ?? ''}`),
    qRow('E1.6', 'Typical Operating Hours', p.operatingHours),
    qRow('E1.7', 'Number of Production Shifts', p.productionShiftCount),
    qRow('E1.8', 'Shift timings', ...shifts.map(s => `Shift ${s.shiftNumber}: ${s.startTime}-${s.endTime}`)),
    qRow('E1.9', 'Operates 24 hours?', p.operates24Hours),
    qRow('E1.10', 'Highest production months', p.highestProductionMonths),
    qRow('E1.11', 'Production schedule flexibility', p.productionScheduleFlexibility),
    qRow('E1.12', 'Can increase production before peak?', p.canIncreaseProductionBeforePeak),
    qRow('E1.13', 'Maintenance schedule', p.maintenanceSchedule, p.maintenanceFrequency),
    [],
    ['E2', 'Production Process Overview'],
  ];

  processes.forEach((proc, i) => {
    rows.push(qRow(`E2-${i + 1}`, proc.processName || `Process ${i + 1}`,
      `Description: ${proc.description || ''}`,
      `Stages: ${proc.mainProductionStages || ''}`,
      `Peak: ${proc.peakOperatingProcesses || ''}`,
      `Continuous: ${proc.continuousProcesses || ''}`,
      `Delayable: ${proc.delayableProcesses || ''}`,
      `Reducible: ${proc.reducibleProcesses || ''}`,
      `Stoppable: ${proc.stoppableProcesses || ''}`,
      `Impact: ${proc.interruptionImpact || ''}`,
      `Safe Stop Time: ${proc.safeStopTime || ''}`,
      `Restart Time: ${proc.restartTime || ''}`,
      `Restart Spike: ${proc.restartCausesDemandIncrease ? 'Yes' : (proc.restartCausesDemandIncrease === false ? 'No' : '')}`
    ));
  });

  if (deps.length > 0) {
    rows.push([]);
    rows.push(['E2.7', 'Process Dependencies']);
    deps.forEach(d => {
      rows.push(['', d.processName, `Depends on: ${d.dependsOnProcessName || ''}`, `Has deps: ${d.hasDependencies || ''}`, d.dependencyExplanation, `Impact: ${d.interruptionImpact || ''}`, `Stop Time: ${d.timeToStop || ''}`, `Restart Time: ${d.timeToRestart || ''}`, `Restart Spike: ${d.restartingDemandSpike || ''}`]);
    });
  }

  rows.push([]);
  rows.push(['E3', 'Existing Controls and Approvals']);
  rows.push(qRow('E3.1', 'Timers / automatic controls?', ctrl.hasTimers, ctrl.hasAutomaticControls));
  rows.push(qRow('E3.2', 'PLC / SCADA?', ctrl.hasPLC, ctrl.hasSCADA));
  rows.push(qRow('E3.3', 'Can change schedules centrally?', ctrl.canChangeSchedulesCentrally, ctrl.hasCentralControl ? 'Has Central Control' : ''));
  rows.push(qRow('E3.4', 'Individual machine monitoring?', ctrl.individualMachineMonitoring));
  rows.push(qRow('E3.5', 'Approver', ctrl.approvalName, ctrl.approvalDesignation));
  rows.push(qRow('E3.6', 'Implementer', ctrl.implementationRole));

  rows.push([]);
  rows.push(['E4', 'DR Willingness']);
  rows.push(qRow('E4.1', 'Willing to adjust non-critical loads?', idr.drAdjustNonCriticalLoads || drp.willingness));
  rows.push(qRow('E4.2', 'Adjustable processes', idr.drAdjustableProcesses));
  rows.push(qRow('E4.3', 'Type of adjustment', idr.drAdjustmentType));
  rows.push(qRow('E4.4', 'Load adjustability', idr.drLoadAdjustability));
  rows.push(qRow('E4.5', 'Duration limit', idr.drAdjustmentDurationLimit));
  rows.push(qRow('E4.6', 'Advance notice required', idr.drAdvanceNoticeRequired || drp.requiredAdvanceNotice));
  rows.push(qRow('E4.7', 'Participation frequency', idr.drParticipationFrequency || drp.participationFrequency));
  rows.push(qRow('E4.8', 'Impossible periods', idr.drImpossibleParticipationPeriods));
  rows.push(qRow('E4.9', 'Participation barriers', idr.drParticipationBarriers));
  rows.push(qRow('E4.10', 'Can increase production before peak?', idr.drIncreaseProductionBeforePeak));
  rows.push(qRow('E4.11', 'Can complete after peak?', idr.drCompleteDelayedProductionAfterPeak));
  rows.push(qRow('E4.12', 'Creates new demand peak?', idr.drDelayedProductionNewPeak));
  rows.push(qRow('E4.13', 'Option to decline?', idr.drOptionToDeclineRequests));
  rows.push(qRow('E4.14', 'Notification method', idr.drPreferredNotificationMethod || drp.notificationMethod));
  rows.push(qRow('E4.15', 'Bill savings influence?', idr.drSavingsInfoIncreasesWillingness || drp.billSavingsInfluence));
  rows.push(qRow('E4.16', 'Incentive influence?', idr.drIncentiveIncreasesWillingness || drp.incentiveInfluence));
  rows.push(qRow('E4.17', 'Preferred incentive', idr.drPreferredIncentiveType || drp.preferredIncentive));
  rows.push(qRow('E4.18', 'Automated controls?', idr.drConsiderAutomatedControls || drp.automationInterest));
  rows.push(qRow('E4.19', 'Trial DR event?', idr.drWillingToParticipateInTrial));
  rows.push(qRow('E4.20', 'Equipment data verification?', idr.drEquipmentDataVerification));
  rows.push(qRow('E4.21', 'Seasonal preference?', idr.drSeasonalPreference));

  return rows;
}

function appendDRLoadSelections(rows, dr) {
  const selections = dr?.loadSelections || [];
  if (selections.length > 0) {
    rows.push([]);
    rows.push(['DR-L', 'Demand Response Load Selections']);
    rows.push(['', 'Inventory Item ID', 'Process ID', 'Adjustment Type', 'Duration', 'Remarks']);
    selections.forEach(s => {
      rows.push(['', s.inventoryItemId, s.processId, s.adjustmentType, s.adjustmentDuration, s.remarks]);
    });
  }
  return rows;
}

// ==========================================
// STYLE HELPERS
// ==========================================
function styleSheet(ws, rows) {
  // Auto-size columns
  const colWidths = [];
  rows.forEach(row => {
    (row || []).forEach((cell, i) => {
      const len = String(cell ?? '').length;
      colWidths[i] = Math.max(colWidths[i] || 8, Math.min(len + 2, 50));
    });
  });
  ws['!cols'] = colWidths.map(w => ({ wch: w }));
}

// ==========================================
// EXPORT ENDPOINT
// ==========================================
exportRouter.get('/surveys/:id/export', async (req, res) => {
  const { id } = req.params;

  try {
    // 1. Verify the survey is APPROVED
    const [survey] = await db.select().from(surveys).where(eq(surveys.id, id));
    if (!survey) return res.status(404).json({ error: 'Survey not found' });
    if (survey.status !== 'APPROVED') {
      return res.status(403).json({ error: 'Only APPROVED surveys can be exported' });
    }

    // 2. Fetch all survey data
    const fullSurvey = await fetchFullSurvey(id);
    if (!fullSurvey) return res.status(404).json({ error: 'Survey data not found' });

    // 3. Build workbook
    const wb = XLSX.utils.book_new();
    const category = survey.consumerCategory?.toUpperCase();

    // Common sheet (always)
    const commonRows = buildCommonSheet(fullSurvey.commonDetails, survey);
    const commonWs = XLSX.utils.aoa_to_sheet(commonRows);
    styleSheet(commonWs, commonRows);
    XLSX.utils.book_append_sheet(wb, commonWs, 'Common');

    // Inventory sheet (always)
    const inventoryRows = buildInventorySheet(fullSurvey.inventoryItems);
    const inventoryWs = XLSX.utils.aoa_to_sheet(inventoryRows);
    styleSheet(inventoryWs, inventoryRows);
    XLSX.utils.book_append_sheet(wb, inventoryWs, 'Inventory');

    // Category-specific sheet
    if (category === 'RESIDENTIAL') {
      let resRows = buildResidentialSheet(fullSurvey.residential, fullSurvey.demandResponse);
      resRows = appendDRLoadSelections(resRows, fullSurvey.demandResponse);
      const resWs = XLSX.utils.aoa_to_sheet(resRows);
      styleSheet(resWs, resRows);
      XLSX.utils.book_append_sheet(wb, resWs, 'Residential');
    } else if (category === 'COMMERCIAL') {
      let comRows = buildCommercialSheet(fullSurvey.commercial, fullSurvey.demandResponse);
      comRows = appendDRLoadSelections(comRows, fullSurvey.demandResponse);
      const comWs = XLSX.utils.aoa_to_sheet(comRows);
      styleSheet(comWs, comRows);
      XLSX.utils.book_append_sheet(wb, comWs, 'Commercial');
    } else if (category === 'INDUSTRIAL') {
      let indRows = buildIndustrialSheet(fullSurvey.industrial, fullSurvey.demandResponse);
      indRows = appendDRLoadSelections(indRows, fullSurvey.demandResponse);
      const indWs = XLSX.utils.aoa_to_sheet(indRows);
      styleSheet(indWs, indRows);
      XLSX.utils.book_append_sheet(wb, indWs, 'Industrial');
    }

    // 4. Generate buffer and send
    const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    const filename = `Survey_${survey.surveyNumber}.xlsx`;

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(buf);

  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ error: 'Failed to export survey' });
  }
});
