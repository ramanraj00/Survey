import express from "express";
import cors from "cors";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./auth.js";
import { inviteRouter } from "./routes/invite.js";
import { surveyRouter } from "./routes/surveys.js";
import { adminRouter } from "./routes/admin.js";

const app = express();
app.use(cors());
app.use(express.json());

// Main App API Routes
app.use("/api/invite", inviteRouter);
app.use("/api/surveys", surveyRouter);
app.use("/api/admin", adminRouter);

// Block public signup explicitly to enforce invite-only
app.post("/api/auth/sign-up/email", (req, res) => {
  res.status(403).json({ error: "Public signup is disabled. Please use an invitation link." });
});

// Better Auth API Route
app.all("/api/auth/*", toNodeHandler(auth));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
