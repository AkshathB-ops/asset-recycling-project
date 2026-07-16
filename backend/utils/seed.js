require("dotenv").config();
const connectDB = require("../config/db");
const User = require("../models/User");

async function seed() {
  await connectDB();

  const username = (process.env.SEED_ADMIN_USERNAME || "admin").toLowerCase().trim();
  const password = process.env.SEED_ADMIN_PASSWORD;
  const name = process.env.SEED_ADMIN_NAME || "System Administrator";

  if (!password) {
    console.error("Set SEED_ADMIN_PASSWORD in your .env before seeding.");
    process.exit(1);
  }

  const existing = await User.findOne({ username });
  if (existing) {
    console.log(`[seed] user "${username}" already exists — nothing to do.`);
    process.exit(0);
  }

  const user = new User({ username, name, role: "admin" });
  await user.setPassword(password);
  await user.save();

  console.log(`[seed] created admin user "${username}". You can now log in and create more users from the app.`);
  process.exit(0);
}

seed().catch((err) => {
  console.error("[seed] failed:", err);
  process.exit(1);
});
