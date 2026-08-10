import express from "express";
import { db } from "../db.js";
import { invitations } from "../models/schema.js";
import { auth } from "../auth.js";
import { eq, and } from "drizzle-orm";
import argon2 from "argon2";
import crypto from "crypto";

export const inviteRouter = express.Router();

// Middleware to check if user is admin
const checkAdmin = async (req, res, next) => {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session || !session.user || session.user.role !== "admin") {
      return res.status(403).json({ error: "Forbidden - Admin access required" });
    }
    req.user = session.user;
    next();
  } catch (error) {
    res.status(500).json({ error: "Auth error" });
  }
};

// Generate an invite (Admin only)
inviteRouter.post("/generate", checkAdmin, async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });

    // Generate random token
    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = await argon2.hash(token);

    // Expires in 48 hours
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 48);

    await db.insert(invitations).values({
      email,
      tokenHash,
      role: 'agent',
      expiresAt,
      status: 'pending',
      createdBy: req.user.id,
    });

    // Return the plain token to the admin so they can share the link
    // E.g., https://survey.com/invite/<token>
    res.json({ success: true, email, token });
  } catch (error) {
    console.error("Error generating invite:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Accept an invite (Public)
inviteRouter.post("/accept", async (req, res) => {
  const { email, password, token } = req.body;
  if (!email || !password || !token) {
    return res.status(400).json({ error: "Email, password, and token are required" });
  }

  try {
    // 1. Find pending invitation for this email
    const [invite] = await db.select().from(invitations).where(
      and(
        eq(invitations.email, email),
        eq(invitations.status, 'pending')
      )
    ).limit(1);

    if (!invite) {
      return res.status(404).json({ error: "Invitation not found or already accepted" });
    }

    // 2. Verify token hash
    const isValidToken = await argon2.verify(invite.tokenHash, token);
    if (!isValidToken) {
      return res.status(400).json({ error: "Invalid invitation token" });
    }

    // 3. Verify expiry
    if (new Date() > new Date(invite.expiresAt)) {
      return res.status(400).json({ error: "Invitation expired" });
    }

    // 4. Atomic operation: We try to create the user, and if it succeeds, we update the invite.
    // Drizzle Neon HTTP doesn't fully support traditional transactions in serverless mode smoothly without a stateful connection,
    // but we can simulate atomicity or use db.transaction if the driver supports it.
    await db.transaction(async (tx) => {
      // Mark as accepted immediately to prevent race conditions within transaction
      const [updatedInvite] = await tx.update(invitations)
        .set({ status: 'accepted', acceptedAt: new Date() })
        .where(
          and(
            eq(invitations.id, invite.id),
            eq(invitations.status, 'pending') // Ensures it was still pending
          )
        ).returning();
      
      if (!updatedInvite) {
        throw new Error("Race condition: Invitation already accepted");
      }

      // Create the user via Better Auth
      // Note: we're bypassing the public signup block because this is running server-side locally
      const authRes = await auth.api.signUpEmail({
        body: {
          email,
          password,
          name: email.split('@')[0], // default name
        }
      });
      
      if (!authRes || !authRes.user) {
         throw new Error("Failed to create user in Better Auth");
      }

      // Ensure role is agent (Better Auth default is agent based on our config, but we can enforce it)
      await tx.execute(`UPDATE "user" SET role = 'agent' WHERE id = '${authRes.user.id}'`);
    });

    res.json({ success: true, message: "Account created successfully" });
  } catch (error) {
    console.error("Error accepting invite:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
});
