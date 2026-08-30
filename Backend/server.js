import express from "express";
import cors from "cors";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./auth.js";
import { surveyRouter } from "./routes/surveys.js";
import { adminRouter } from "./routes/admin.js";
import { exportRouter } from "./routes/export.js";
import rateLimit from "express-rate-limit";

const app = express();
app.use(cors({
  origin: process.env.ALLOWED_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());

// Rate Limiter for sensitive auth endpoints
const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 20, // max 20 attempts per window
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { error: 'Too many requests from this IP. Please try again after 15 minutes.' },
});

// Main App API Routes
app.use("/api/surveys", surveyRouter);
app.use("/api/admin", adminRouter);
app.use("/api/admin", exportRouter);

// Block public signup explicitly to enforce invite-only
app.post("/api/auth/sign-up/email", authRateLimiter, (req, res) => {
  res.status(403).json({ error: "Public signup is disabled. Please use an invitation link." });
});

// Apply rate limiter to sign-in
app.use("/api/auth/sign-in", authRateLimiter);

// Accept Invitation Endpoint (rate-limited)
app.post("/api/auth/accept-invite", authRateLimiter, async (req, res) => {
  try {
    const { token, name, password } = req.body;
    if (!token || !name || !password) return res.status(400).json({ error: "Missing required fields" });

    const crypto = await import('crypto');
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const { db } = await import('./db.js');
    const { invitations } = await import('./models/schema.js');
    const { eq, and, gt, sql } = await import('drizzle-orm');

    const [invite] = await db.select()
      .from(invitations)
      .where(
        and(
          eq(invitations.tokenHash, tokenHash),
          eq(invitations.status, 'PENDING'),
          gt(invitations.expiresAt, new Date())
        )
      );

    if (!invite) return res.status(400).json({ error: "Invalid, expired, or already used invitation token." });

    // Internal sign up using better-auth bypassing HTTP
    const authRes = await auth.api.signUpEmail({
      body: {
        email: invite.email,
        password,
        name,
      }
    });

    if (!authRes?.user) throw new Error("Failed to create user in auth provider");

    // Update role safely using parameterized query to prevent SQL Injection
    await db.execute(sql`UPDATE "user" SET role = ${invite.role} WHERE email = ${invite.email}`);

    // Mark invite as used
    await db.update(invitations)
      .set({ status: 'ACCEPTED', acceptedAt: new Date() })
      .where(eq(invitations.id, invite.id));

    res.json({ success: true, message: "Account created successfully. You can now login." });
  } catch (err) {
    console.error("Accept invite error:", err);
    const errorMessage = err.message || "Failed to accept invitation. The email might already be registered.";
    res.status(500).json({ error: errorMessage });
  }
});

// Health Check Route
app.get("/", (req, res) => {
  res.json({ status: "Backend is running successfully!", version: "1.0.0" });
});

// Better Auth API Route
app.use("/api/auth", toNodeHandler(auth));

const PORT = process.env.PORT || 3000;
if (process.env.NODE_ENV !== 'production') {
  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
  });

  // Graceful shutdown
  const shutdown = async (signal) => {
    console.log(`${signal} received. Shutting down gracefully...`);
    server.close(() => {
      console.log('HTTP server closed.');
      process.exit(0);
    });
  };
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

export default app;
