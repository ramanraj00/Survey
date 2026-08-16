// src/services/api.js
// Base API utility using native fetch

const API_BASE = '/api';

/**
 * Generic API fetcher that handles response parsing and standard errors
 */
async function apiFetch(endpoint, options = {}) {
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
    // Include credentials if using cookie-based auth like better-auth
    credentials: 'init' in options ? options.credentials : 'include', 
  };

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, config);
    
    let data;
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      const error = new Error(data.error || data.message || 'API Request Failed');
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (error) {
    console.error(`[API Error] ${endpoint}:`, error);
    throw error;
  }
}

// ==========================================
// SURVEY API CONTRACT
// ==========================================

export const SurveyAPI = {
  // ====================
  // AUTH ROUTES
  // ====================
  signIn: (email, password) => apiFetch(`/auth/sign-in/email`, {
    method: 'POST',
    body: JSON.stringify({ email, password })
  }),
  
  signOut: () => apiFetch(`/auth/sign-out`, { method: 'POST' }),

  getSession: () => apiFetch(`/auth/get-session`),
  
  acceptInvite: (token, name, password) => apiFetch(`/auth/accept-invite`, {
    method: 'POST',
    body: JSON.stringify({ token, name, password })
  }),

  // ====================
  // AGENT ROUTES
  // ====================
  // 0. Get list of surveys for agent
  getSurveys: () => apiFetch(`/surveys`),

  // 1. Fetch entire survey tree (Agent View)
  getSurvey: (id) => apiFetch(`/surveys/${id}`),

  // 1.5 Create Survey
  createSurvey: (data) => apiFetch(`/surveys`, {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  // 2. Validate Survey
  validateSurvey: (id) => apiFetch(`/surveys/${id}/validate`),

  // 4. Submit Survey (Agent)
  submitSurvey: (id, currentVersion) => apiFetch(`/surveys/${id}/submit`, {
    method: 'POST',
    body: JSON.stringify({ version: currentVersion })
  }),

  // ====================
  // ADMIN ROUTES
  // ====================
  
  getAdminStats: () => apiFetch(`/admin/stats`),
  
  getAdminSurveys: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return apiFetch(`/admin/surveys${qs ? '?' + qs : ''}`);
  },

  getAdminSurvey: (id) => apiFetch(`/admin/surveys/${id}`),

  approveSurvey: (id, currentVersion) => apiFetch(`/admin/surveys/${id}/approve`, {
    method: 'POST',
    body: JSON.stringify({ version: currentVersion })
  }),

  getAdminInvitations: () => apiFetch(`/admin/invitations`),

  createAdminInvitation: (email, role) => apiFetch(`/admin/invitations`, {
    method: 'POST',
    body: JSON.stringify({ email, role })
  }),

  // 4. Update Sections (All require version for Optimistic Concurrency Control)
  updateCommonDetails: (id, version, commonDetails) => apiFetch(`/surveys/${id}/common`, {
    method: 'PUT',
    body: JSON.stringify({ version, data: commonDetails })
  }),

  updateInventory: (id, version, inventoryItems) => {
    const payloadItems = inventoryItems.items ? inventoryItems.items : inventoryItems;
    return apiFetch(`/surveys/${id}/inventory`, {
      method: 'PUT',
      body: JSON.stringify({ version, items: payloadItems })
    });
  },

  updateResidential: (id, version, data) => apiFetch(`/surveys/${id}/residential`, {
    method: 'PUT',
    body: JSON.stringify({ version, ...data })
  }),

  updateCommercial: (id, version, data) => apiFetch(`/surveys/${id}/commercial`, {
    method: 'PUT',
    body: JSON.stringify({ version, ...data })
  }),

  updateIndustrial: (id, version, data) => apiFetch(`/surveys/${id}/industrial`, {
    method: 'PUT',
    body: JSON.stringify({ version, ...data })
  }),

  updateDemandResponse: (id, version, data) => apiFetch(`/surveys/${id}/demand-response`, {
    method: 'PUT',
    body: JSON.stringify({ version, ...data })
  }),
};

// ==========================================
// ADMIN API CONTRACT
// ==========================================

export const AdminAPI = {
  getStats: () => apiFetch(`/admin/stats`),
  getSurveys: (params) => {
    const query = new URLSearchParams(params).toString();
    return apiFetch(`/admin/surveys?${query}`);
  },
  getSurveyFull: (id) => apiFetch(`/admin/surveys/${id}`),
  approveSurvey: (id, version) => apiFetch(`/admin/surveys/${id}/approve`, {
    method: 'POST',
    body: JSON.stringify({ version })
  }),
  
  // Admin edits share the same OCC requirement as Agents
  updateSurveySection: (id, sectionPath, version, data) => {
    let payload = { version, ...data };
    if (sectionPath === 'common') payload = { version, data };
    if (sectionPath === 'inventory') {
      // data might already be { items: [...] } or just an array
      payload = { version, items: data.items ? data.items : data };
    }
    
    // Map camelCase to kebab-case to match backend route
    const routePath = sectionPath === 'demandResponse' ? 'demand-response' : 
                      sectionPath === 'commonDetails' ? 'common-details' : sectionPath;
                      
    return apiFetch(`/admin/surveys/${id}/${routePath}`, {
      method: 'PATCH',
      body: JSON.stringify(payload)
    });
  },

  // Export approved survey to Excel
  exportSurvey: async (id) => {
    const response = await fetch(`${API_BASE}/admin/surveys/${id}/export`, {
      credentials: 'include',
    });
    if (!response.ok) {
      let errMsg = 'Export failed';
      try { const d = await response.json(); errMsg = d.error || errMsg; } catch {}
      throw new Error(errMsg);
    }
    const blob = await response.blob();
    const disposition = response.headers.get('Content-Disposition') || '';
    const match = disposition.match(/filename="?([^"]+)"?/);
    const filename = match ? match[1] : `Survey_Export.xlsx`;
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  },
};
