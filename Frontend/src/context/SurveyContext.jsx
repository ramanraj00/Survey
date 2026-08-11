import React, { createContext, useContext, useState, useCallback } from 'react';
import { SurveyAPI, AdminAPI } from '../services/api';

const SurveyContext = createContext();

export function useSurvey() {
  const context = useContext(SurveyContext);
  if (!context) {
    throw new Error('useSurvey must be used within a SurveyProvider');
  }
  return context;
}

export function SurveyProvider({ children }) {
  const [surveyData, setSurveyData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Expose the current optimistic version
  const currentVersion = surveyData?.survey?.version || 1;

  /**
   * Hydrates the full survey tree from the backend
   */
  const loadSurvey = useCallback(async (id) => {
    setIsLoading(true);
    setError(null);
    try {
      const userRole = localStorage.getItem('userRole');
      const data = userRole === 'admin' 
        ? await AdminAPI.getSurveyFull(id) 
        : await SurveyAPI.getSurvey(id);
      setSurveyData(data);
    } catch (err) {
      setError(err.message || 'Failed to load survey');
      // 404 handled here too
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Generic save dispatcher for all sections.
   * Handles the optimistic version injection and bumping.
   */
  const saveSection = useCallback(async (section, payload) => {
    if (!surveyData?.survey?.id) throw new Error("No active survey to save");
    
    const id = surveyData.survey.id;
    const version = surveyData.survey.version;
    const userRole = localStorage.getItem('userRole');
    
    let result;
    try {
      if (userRole === 'admin') {
        result = await AdminAPI.updateSurveySection(id, section, version, payload);
      } else {
        switch(section) {
          case 'common':
            result = await SurveyAPI.updateCommonDetails(id, version, payload);
            break;
          case 'inventory':
            result = await SurveyAPI.updateInventory(id, version, payload);
            break;
          case 'residential':
            result = await SurveyAPI.updateResidential(id, version, payload);
            break;
          case 'commercial':
            result = await SurveyAPI.updateCommercial(id, version, payload);
            break;
          case 'industrial':
            result = await SurveyAPI.updateIndustrial(id, version, payload);
            break;
          case 'demandResponse':
            result = await SurveyAPI.updateDemandResponse(id, version, payload);
            break;
          default:
            throw new Error(`Unknown section: ${section}`);
        }
      }

      // If successful, optimistically bump local version to match DB
      if (result.success && result.newVersion) {
        setSurveyData(prev => {
          const newState = { ...prev, survey: { ...prev.survey, version: result.newVersion } };
          
          if (section === 'common') newState.commonDetails = { ...prev.commonDetails, ...payload };
          else if (section === 'inventory') newState.inventoryItems = payload;
          else if (section === 'residential') newState.residential = { ...prev.residential, ...payload };
          else if (section === 'commercial') newState.commercial = { ...prev.commercial, ...payload };
          else if (section === 'industrial') newState.industrial = { ...prev.industrial, ...payload };
          else if (section === 'demandResponse') newState.demandResponse = { ...prev.demandResponse, ...payload };
          
          return newState;
        });
      }

      return result;
    } catch (err) {
      // Catch OCC Conflicts (409)
      if (err.status === 409) {
        console.error("OCC Conflict Detected! State is stale.");
        setError("This survey was modified elsewhere. Please refresh the page to get the latest data.");
      }
      throw err;
    }
  }, [surveyData]);

  const value = {
    surveyData,
    setSurveyData, // Exposing setter for real-time form updates (controlled inputs)
    isLoading,
    error,
    currentVersion,
    loadSurvey,
    saveSection,
  };

  return (
    <SurveyContext.Provider value={value}>
      {children}
    </SurveyContext.Provider>
  );
}
