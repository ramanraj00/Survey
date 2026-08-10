import 'dotenv/config';
import { auth } from './auth.js';
import { db } from './db.js';

async function seedAdmin() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.error("❌ ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env");
    process.exit(1);
  }

  console.log(`Checking if admin ${email} exists...`);
  
  // Need to use raw db query or auth.api to check if user exists
  // We'll just try to sign up. If it throws because email exists, we catch it.
  try {
    const res = await auth.api.signUpEmail({
      body: {
        email,
        password,
        name: "Super Admin",
      }
    });

    if (res?.user) {
      // Update role to admin
      // We can use db directly if auth.api doesn't support setting role during signup easily
      console.log("User created, updating role to admin...");
      // In better-auth drizzle adapter, the table is usually imported from the generated schema
      // But we can also use db.execute
      await db.execute(`UPDATE "user" SET role = 'admin' WHERE email = '${email}'`);
      console.log("✅ Admin user seeded successfully!");
    }
  } catch (error) {
    if (error.message && error.message.includes("already exists")) {
       console.log("✅ Admin user already exists. Checking role...");
       await db.execute(`UPDATE "user" SET role = 'admin' WHERE email = '${email}'`);
       console.log("✅ Role ensured as admin.");
    } else {
       console.error("Error seeding admin:", error);
    }
  }
  process.exit(0);
}

seedAdmin();
