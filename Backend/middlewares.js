import { auth } from "./auth.js";
import { db } from "./db.js";
import { surveys } from "./models/schema.js";
import { eq } from "drizzle-orm";

export const requireAuth = async (req, res, next) => {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session || !session.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    req.user = session.user;
    next();
  } catch (error) {
    res.status(500).json({ error: "Auth error" });
  }
};

export const requireRole = (role) => {
  return (req, res, next) => {
    if (!req.user || req.user.role !== role) {
      return res.status(403).json({ error: `Forbidden - Requires ${role} role` });
    }
    next();
  };
};

export const checkSurveyOwnership = async (req, res, next) => {
  const { id } = req.params;
  if (!id) return res.status(400).json({ error: "Survey ID required" });

  try {
    const [survey] = await db.select().from(surveys).where(eq(surveys.id, id));
    if (!survey) {
      return res.status(404).json({ error: "Survey not found" });
    }
    
    // Only enforce ownership if user is agent
    if (req.user.role === 'agent' && survey.agentId !== req.user.id) {
      return res.status(403).json({ error: "Forbidden - Not your survey" });
    }
    
    req.survey = survey; // Attach to request for later use
    next();
  } catch (error) {
    res.status(500).json({ error: "Database error checking ownership" });
  }
};

export const checkSurveyStatus = (allowedStatuses) => {
  return (req, res, next) => {
    if (!req.survey) {
      return res.status(500).json({ error: "checkSurveyStatus must be used after checkSurveyOwnership" });
    }
    
    if (!allowedStatuses.includes(req.survey.status)) {
      return res.status(403).json({ error: `Forbidden - Survey is locked in ${req.survey.status} status` });
    }
    next();
  };
};

// checkVersion middleware removed.
// We will validate version presence in controllers and do atomic checks in DB.
export const checkVersionBody = (req, res, next) => {
  if (req.method === 'PUT' || req.method === 'PATCH' || req.method === 'POST') {
    if (!req.body.version) {
      return res.status(400).json({ error: "Optimistic Concurrency Control: 'version' field is required in request body" });
    }
  }
  next();
};
