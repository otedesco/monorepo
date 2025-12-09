/**
 * Main seed entry point
 *
 * Orchestrates all seeding functions in dependency order.
 * Seed functions should be called in order of dependencies:
 * 1. Users (auth.users) - created using Snaplet Seed's users API
 * 2. Profiles (depends on auth.users) - created using Snaplet Seed's profiles API
 * 3. Organizations (depends on auth.users) - creates organizations and memberships
 * 4. Other tables...
 */

import type { SeedClient } from "@snaplet/seed";
import { seedProfiles } from "./profiles";
import { seedOrganizations } from "./organizations";

export interface SeedOptions {
  /**
   * Number of records to seed for each domain
   */
  count?: number;
}

/**
 * Main seeding function
 *
 * Orchestrates the seeding process:
 * 1. Creates auth users using Snaplet Seed's built-in users API
 * 2. Creates profiles for those users using the seedProfiles function
 * 3. Creates organizations with memberships (owners, admins, agents)
 *
 * @param seed - Snaplet Seed client
 * @param options - Seeding options
 */
export async function seedAll(
  seed: SeedClient,
  options: SeedOptions = {},
): Promise<void> {
  const { count = 20 } = options;

  console.log("🚀 Starting database seeding...\n");

  try {
    // 1. Seed auth users using Snaplet Seed's users API
    // The callback receives a function 'x' that we call with the count
    // This creates users in auth.users table and returns them
    const { users } = await seed.users((x) => x(count));

    // 2. Seed profiles using the created user IDs
    // Pass the users array to seedProfiles which will create corresponding profiles
    const { profiles } = await seedProfiles(seed, users);

    // 3. Seed organizations with memberships
    // Pass the users array to seedOrganizations which will create organizations
    // and memberships (owners, admins, agents)
    const { organizations } = await seedOrganizations(seed, users);

    console.log("\n✨ Database seeding completed successfully!");
  } catch (error) {
    console.error("\n❌ Database seeding failed:", error);
    throw error;
  }
}

// Export individual seed functions for granular control
export { seedProfiles } from "./profiles";
export { seedOrganizations } from "./organizations";
