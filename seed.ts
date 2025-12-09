/**
 * Main database seeding script
 *
 * Executes all seed functions in dependency order using Snaplet Seed.
 * This script uses Snaplet Seed's built-in APIs to create users and profiles.
 *
 * Usage:
 *   pnpm db:seed
 *   or
 *   npx tsx seed.ts
 *
 * Environment variables:
 *   Snaplet Seed automatically reads connection details from your seed.config.ts
 *   or environment variables (DATABASE_URL, etc.)
 *
 * Learn more: https://docs.snaplet.dev/seed/getting-started
 */
import { createSeedClient } from "@snaplet/seed";
import { seedAll } from "./supabase/seed/index";

const main = async () => {
  console.log("Starting database seeding process...\n");

  // Initialize Snaplet Seed client
  // This connects to your database using configuration from seed.config.ts
  const seed = await createSeedClient();

  try {
    // Run all seed functions in dependency order:
    // 1. Creates auth users using Snaplet Seed's users API
    // 2. Creates profiles for those users using Snaplet Seed's profiles API
    await seedAll(seed, { count: 20 });
  } catch (error) {
    console.error("\nError seeding database:", error);
    process.exit(1);
  }

  console.log("\nDatabase seeded successfully!");
  process.exit(0);
};

main();
