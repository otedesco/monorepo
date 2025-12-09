/**
 * Seed function for organizations table
 *
 * Creates organization records and memberships for seeding the database.
 * Organizations represent real estate agencies or single-owner entities.
 *
 * Structure:
 * - 5 organizations created by users 0-4 (owners)
 * - 5 admins (users 5-9, one per organization)
 * - 2 agents per organization (users 10-19, distributed)
 */

import type { SeedClient, usersScalars } from "@snaplet/seed";

// Role IDs from organization_roles table
const ROLE_IDS = {
    admin: 1,
    agent: 2,
    owner: 3,
} as const;

/**
 * Seeds organizations with memberships
 *
 * Creates 5 organizations with the following structure:
 * - Each organization has 1 owner (users 0-4)
 * - Each organization has 1 admin (users 5-9)
 * - Each organization has 2 agents (users 10-19, distributed)
 *
 * @param seed - Snaplet Seed client
 * @param users - Array of user scalars (must have at least 20 users)
 * @returns Object containing the created organizations array
 */
export async function seedOrganizations(
    seed: SeedClient,
    users: usersScalars[],
): Promise<{ organizations: any[] }> {
    console.log("🌱 Seeding organizations...");

    // Validate we have enough users
    if (!users || users.length < 20) {
        console.warn(
            "⚠️  Need at least 20 users to seed organizations. Found:",
            users?.length || 0,
        );
        return { organizations: [] };
    }

    try {
        // Create 5 organizations
        // Users 0-4 will be the owners (created_by)
        const { organizations } = await seed.organizations((x) =>
            x(5, ({ index }) => ({
                name: `Organization ${index + 1}`,
                slug: `org-${index + 1}`,
                type: index % 2 === 0 ? "agency" : "owner",
                created_by: users[index].id, // Users 0-4 are owners
            }))
        );

        console.log(`  ✓ Created ${organizations.length} organizations`);

        // Create memberships for each organization
        const memberships: Array<{
            organization_id: string;
            user_id: string;
            role_id: number;
        }> = [];

        for (let orgIndex = 0; orgIndex < organizations.length; orgIndex++) {
            const organization = organizations[orgIndex];

            if (!organization.id) {
                throw new Error(`Organization at index ${orgIndex} has no id`);
            }

            // 1. Owner membership (users 0-4)
            memberships.push({
                organization_id: organization.id,
                user_id: users[orgIndex].id,
                role_id: ROLE_IDS.owner,
            });

            // 2. Admin membership (users 5-9, one per organization)
            memberships.push({
                organization_id: organization.id,
                user_id: users[orgIndex + 5].id,
                role_id: ROLE_IDS.admin,
            });

            // 3. Agent memberships (users 10-19, 2 per organization)
            // First agent: users 10, 12, 14, 16, 18 (even indices starting from 10)
            // Second agent: users 11, 13, 15, 17, 19 (odd indices starting from 11)
            memberships.push({
                organization_id: organization.id,
                user_id: users[10 + orgIndex * 2].id,
                role_id: ROLE_IDS.agent,
            });

            memberships.push({
                organization_id: organization.id,
                user_id: users[11 + orgIndex * 2].id,
                role_id: ROLE_IDS.agent,
            });
        }

        // Create all memberships using Snaplet Seed
        // Using type assertion since Snaplet Seed may need schema sync to recognize the table
        const { organization_memberships } = await (
            seed as any
        ).organization_memberships((x: any) =>
            x(
                memberships.length,
                ({ index }: { index: number }) => memberships[index],
            )
        );

        console.log(
            `  ✓ Created ${organization_memberships.length} organization memberships`,
        );
        console.log(`    - ${organizations.length} owners (users 0-4)`);
        console.log(`    - ${organizations.length} admins (users 5-9)`);
        console.log(`    - ${organizations.length * 2} agents (users 10-19)`);

        return { organizations };
    } catch (error) {
        console.error("❌ Error seeding organizations:", error);
        throw error;
    }
}
