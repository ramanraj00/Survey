import 'dotenv/config';
import { auth } from './auth.js';

async function testLogin() {
  try {
    const res = await auth.api.signInEmail({
      body: {
        email: process.env.ADMIN_EMAIL,
        password: process.env.ADMIN_PASSWORD
      }
    });
    console.log("Login success:", res);
  } catch (err) {
    console.error("Login error:", err);
  }
  process.exit(0);
}
testLogin();
