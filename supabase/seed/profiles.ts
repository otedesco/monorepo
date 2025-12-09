/**
 * Seed function for profiles table
 *
 * Creates profile records for existing auth users using Snaplet Seed.
 * Profiles are linked 1:1 with auth.users via id (same UUID).
 *
 * This function uses Snaplet Seed's profiles API to create profiles
 * that correspond to the provided auth users.
 */

import type { profilesScalars, SeedClient, usersScalars } from "@snaplet/seed";

/**
 * Seeds profiles for existing auth users
 *
 * Uses Snaplet Seed's profiles API to create profile records.
 * Each profile is linked to a user by matching the profile id to the user id.
 *
 * @param seed - Snaplet Seed client
 * @param users - Array of user scalars from Snaplet Seed (created via seed.users())
 * @returns Object containing the created profiles array
 */
export async function seedProfiles(
  seed: SeedClient,
  users: usersScalars[],
): Promise<{ profiles: profilesScalars[] }> {
  console.log("🌱 Seeding profiles...");

  // Early return if no users provided
  if (!users || users.length === 0) {
    console.warn("⚠️  No users available to create profiles for.");
    return { profiles: [] };
  }

  try {
    // Use Snaplet Seed's profiles API to create profiles
    // The callback receives a function 'x' that we call with:
    // - count: number of profiles to create (matches number of users)
    // - factory function: generates profile data for each profile
    //   - index: the index of the current profile being created
    //   - We link each profile to a user by setting id = users[index].id
    const profilesStore = await seed.profiles((x) =>
      x(users.length, ({ index }) => ({
        id: users[index].id, // Link profile to user via matching ID
        full_name: `User ${index + 1}`, // Generate a simple name based on index
        avatar_url: null,
        locale: "en",
        timezone: "UTC",
      }))
    );

    return profilesStore;
  } catch (error) {
    console.error("❌ Error seeding profiles:", error);
    throw error;
  }
}
