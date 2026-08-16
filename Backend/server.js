import express from "express";
import cors from "cors";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./auth.js";
import { inviteRouter } from "./routes/invite.js";
import { surveyRouter } from "./routes/surveys.js";
import { adminRouter } from "./routes/admin.js";
import { exportRouter } from "./routes/export.js";

const app = express();
app.use(cors());
app.use(express.json());

// Main App API Routes
app.use("/api/invite", inviteRouter);
app.use("/api/surveys", surveyRouter);
app.use("/api/admin", adminRouter);
app.use("/api/admin", exportRouter);

// Block public signup explicitly to enforce invite-only
app.post("/api/auth/sign-up/email", (req, res) => {
  res.status(403).json({ error: "Public signup is disabled. Please use an invitation link." });
});

// Accept Invitation Endpoint
app.post("/api/auth/accept-invite", async (req, res) => {
  try {
    const { token, name, password } = req.body;
    if (!token || !name || !password) return res.status(400).json({ error: "Missing required fields" });

    const crypto = await import('crypto');
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const { db } = await import('./db.js');
    const { invitations } = await import('./models/schema.js');
    const { eq, and, gt } = await import('drizzle-orm');

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

    // Update role
    await db.execute(`UPDATE "user" SET role = '${invite.role}' WHERE email = '${invite.email}'`);

    // Mark invite as used
    await db.update(invitations)
      .set({ status: 'ACCEPTED', acceptedAt: new Date() })
      .where(eq(invitations.id, invite.id));

    res.json({ success: true, message: "Account created successfully. You can now login." });
  } catch (err) {
    console.error("Accept invite error:", err);
    res.status(500).json({ error: "Failed to accept invitation. The email might already be registered." });
  }
});

// Better Auth API Route
app.use("/api/auth", toNodeHandler(auth));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
