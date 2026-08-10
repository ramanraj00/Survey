import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./models/*.js",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL || 'postgres://username:password@your-neon-endpoint/neondb',
  },
});
