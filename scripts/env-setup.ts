#!/usr/bin/env ts-node
/**
 * Environment Setup Script
 *
 * Orchestrates the complete environment setup flow:
 * 1. Creates .env from env.example (fails if .env exists)
 * 2. Appends Supabase credentials from local Supabase instance
 * 3. Syncs required variables to apps/web/.env.local
 *
 * Usage:
 *   pnpm env:setup:create    - Copy env.example → .env
 *   pnpm env:add:supabase     - Append Supabase vars to .env
 *   pnpm env:sync:next        - Sync vars to apps/web/.env.local
 *   pnpm env:setup            - Run all steps in sequence
 */

import { execSync } from "child_process";
import {
  appendFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from "fs";
import { join } from "path";

const ROOT_DIR = join(__dirname, "..");
const ENV_EXAMPLE = join(ROOT_DIR, "env.example");
const ENV_FILE = join(ROOT_DIR, ".env");
const NEXT_ENV_FILE = join(ROOT_DIR, "apps", "web", ".env.local");

/**
 * Step 1: Create .env from env.example
 * Fails if .env already exists to prevent accidental overwrites
 */
export function createEnvFile(): void {
  console.log("📝 Creating .env from env.example...");

  if (existsSync(ENV_FILE)) {
    throw new Error(
      `❌ .env already exists at ${ENV_FILE}\n` +
        "   To prevent accidental overwrites, please delete it first or run:\n" +
        "   pnpm env:add:supabase (to only add Supabase vars)\n" +
        "   pnpm env:sync:next (to sync to Next.js)",
    );
  }

  if (!existsSync(ENV_EXAMPLE)) {
    throw new Error(
      `❌ env.example not found at ${ENV_EXAMPLE}\n` +
        "   Please create env.example first",
    );
  }

  const exampleContent = readFileSync(ENV_EXAMPLE, "utf-8");
  writeFileSync(ENV_FILE, exampleContent, "utf-8");
  console.log("✅ Created .env from env.example");
}

/**
 * Step 2: Append Supabase credentials to .env
 * Uses `supabase status --output env` to get local instance credentials
 */
export function addSupabaseVars(): void {
  console.log("🔐 Adding Supabase credentials from local instance...");

  if (!existsSync(ENV_FILE)) {
    throw new Error(
      `❌ .env file not found at ${ENV_FILE}\n` +
        "   Run 'pnpm env:setup:create' first to create .env",
    );
  }

  // Check if Supabase is running (with better error handling)
  try {
    const statusOutput = execSync("npx supabase status", {
      encoding: "utf-8",
      stdio: "pipe",
    });
    // Verify we got meaningful output
    if (!statusOutput || statusOutput.trim().length === 0) {
      throw new Error("Supabase status returned empty output");
    }
  } catch (error: any) {
    if (error.code === "ENOENT") {
      throw new Error(
        `❌ Supabase CLI not found\n` +
          "   Install it with: npm install -g supabase\n" +
          "   Or use npx (already configured in scripts)",
      );
    }
    throw new Error(
      `❌ Supabase is not running\n` +
        "   Start Supabase first with: pnpm supabase:start\n" +
        "   Wait for services to initialize (may take 30-60 seconds)\n" +
        "   Then run: pnpm env:add:supabase\n" +
        `   Error: ${error.message}`,
    );
  }

  try {
    // Get Supabase credentials in env format
    const envOutput = execSync("npx supabase status -o env", {
      encoding: "utf-8",
      stdio: "pipe",
    });

    if (!envOutput || envOutput.trim().length === 0) {
      throw new Error("Supabase status returned empty output");
    }

    // Parse and normalize the output
    const envLines = envOutput.split("\n");
    const normalizedLines: string[] = [];
    const foundVars: string[] = [];
    let hasSupabaseUrl = false;
    let hasSupabaseAnonKey = false;

    for (const line of envLines) {
      const trimmed = line.trim();

      // Keep comments and empty lines as-is
      if (!trimmed || trimmed.startsWith("#")) {
        normalizedLines.push(line);
        continue;
      }

      const match = trimmed.match(/^([A-Z_]+)=(.*)$/);
      if (match) {
        const [, varName, value] = match;
        foundVars.push(varName);

        // Normalize variable names to our expected format
        if (varName === "API_URL") {
          // Supabase CLI outputs API_URL, but we need SUPABASE_URL
          normalizedLines.push(`SUPABASE_URL=${value}`);
          hasSupabaseUrl = true;
        } else if (varName === "ANON_KEY") {
          // Supabase CLI outputs ANON_KEY, but we need SUPABASE_ANON_KEY
          normalizedLines.push(`SUPABASE_ANON_KEY=${value}`);
          hasSupabaseAnonKey = true;
        } else if (varName === "SUPABASE_URL") {
          normalizedLines.push(line);
          hasSupabaseUrl = true;
        } else if (varName === "SUPABASE_ANON_KEY") {
          normalizedLines.push(line);
          hasSupabaseAnonKey = true;
        } else {
          // Keep other variables as-is
          normalizedLines.push(line);
        }
      } else {
        // Keep non-variable lines as-is
        normalizedLines.push(line);
      }
    }

    if (!hasSupabaseUrl || !hasSupabaseAnonKey) {
      const foundVarsList = foundVars.length > 0
        ? foundVars.join(", ")
        : "none";

      throw new Error(
        `❌ Supabase status output is missing required variables\n` +
          `\n` +
          `   Required: SUPABASE_URL (or API_URL) and SUPABASE_ANON_KEY (or ANON_KEY)\n` +
          `   Found variables: ${foundVarsList}\n` +
          `\n` +
          `   This usually means:\n` +
          `   1. Supabase services are still initializing\n` +
          `   2. Supabase failed to start properly\n` +
          `\n` +
          `   To fix:\n` +
          `   1. Check Supabase status: pnpm supabase:status\n` +
          `   2. If not running, start it: pnpm supabase:start\n` +
          `   3. Wait 30-60 seconds for all services to initialize\n` +
          `   4. Try again: pnpm env:add:supabase\n` +
          `\n` +
          `   Output preview:\n${
            envOutput.split("\n").slice(0, 10).join("\n")
          }`,
      );
    }

    // Append normalized output to .env file
    appendFileSync(
      ENV_FILE,
      "\n# Supabase Local Development Credentials\n",
      "utf-8",
    );
    appendFileSync(
      ENV_FILE,
      "# Added automatically by env:add:supabase\n",
      "utf-8",
    );
    appendFileSync(ENV_FILE, normalizedLines.join("\n"), "utf-8");

    console.log("✅ Added Supabase credentials to .env");
  } catch (error: any) {
    if (error.status === 1 || error.code === "ENOENT") {
      throw new Error(
        `❌ Failed to get Supabase status\n` +
          "   Make sure Supabase is running: pnpm supabase:start\n" +
          "   Wait a few seconds for services to initialize\n" +
          `   Error: ${error.message}`,
      );
    }
    // Re-throw our validation errors as-is
    if (error.message.includes("❌")) {
      throw error;
    }
    throw new Error(
      `❌ Unexpected error adding Supabase variables: ${error.message}`,
    );
  }
}

/**
 * Step 3: Sync required variables to apps/web/.env.local
 * Extracts SUPABASE_URL and SUPABASE_ANON_KEY and prefixes with NEXT_PUBLIC_
 */
export function syncNextEnv(): void {
  console.log("🔄 Syncing environment variables to apps/web/.env.local...");

  if (!existsSync(ENV_FILE)) {
    throw new Error(
      `❌ .env file not found at ${ENV_FILE}\n` +
        "   Run 'pnpm env:setup' or 'pnpm env:setup:create' first",
    );
  }

  // Read .env file
  const envContent = readFileSync(ENV_FILE, "utf-8");
  const envLines = envContent.split("\n");

  // Extract SUPABASE_URL and SUPABASE_ANON_KEY
  let supabaseUrl: string | null = null;
  let supabaseAnonKey: string | null = null;

  for (const line of envLines) {
    const trimmed = line.trim();

    // Skip comments and empty lines
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    // Parse KEY=VALUE
    const match = trimmed.match(/^([^=]+)=(.*)$/);
    if (!match) {
      continue;
    }

    const [, key, value] = match;
    const cleanKey = key.trim();
    const cleanValue = value.trim().replace(/^["']|["']$/g, ""); // Remove quotes

    if (cleanKey === "SUPABASE_URL") {
      supabaseUrl = cleanValue;
    } else if (cleanKey === "SUPABASE_ANON_KEY") {
      supabaseAnonKey = cleanValue;
    }
  }

  // Validate required variables
  if (!supabaseUrl) {
    throw new Error(
      `❌ SUPABASE_URL not found in .env\n` +
        "\n" +
        "   This usually means:\n" +
        "   1. Supabase is not running - Start it with: pnpm supabase:start\n" +
        "   2. Supabase vars weren't added - Run: pnpm env:add:supabase\n" +
        "   3. The .env file was created but setup didn't complete\n" +
        "\n" +
        "   To fix:\n" +
        "   - If Supabase is running: pnpm env:add:supabase\n" +
        "   - If Supabase is not running: pnpm supabase:start && pnpm env:add:supabase",
    );
  }

  if (!supabaseAnonKey) {
    throw new Error(
      `❌ SUPABASE_ANON_KEY not found in .env\n` +
        "\n" +
        "   This usually means:\n" +
        "   1. Supabase is not running - Start it with: pnpm supabase:start\n" +
        "   2. Supabase vars weren't added - Run: pnpm env:add:supabase\n" +
        "   3. The .env file was created but setup didn't complete\n" +
        "\n" +
        "   To fix:\n" +
        "   - If Supabase is running: pnpm env:add:supabase\n" +
        "   - If Supabase is not running: pnpm supabase:start && pnpm env:add:supabase",
    );
  }

  // Ensure apps/web directory exists
  const nextEnvDir = join(ROOT_DIR, "apps", "web");
  if (!existsSync(nextEnvDir)) {
    throw new Error(
      `❌ Next.js app directory not found at ${nextEnvDir}\n` +
        "   Make sure apps/web exists",
    );
  }

  // Create .env.local content
  const nextEnvContent = `# Next.js Environment Variables
# Auto-generated by env:sync:next
# Do not edit manually - this file is synced from root .env

NEXT_PUBLIC_SUPABASE_URL=${supabaseUrl}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${supabaseAnonKey}
`;

  // Write to apps/web/.env.local
  writeFileSync(NEXT_ENV_FILE, nextEnvContent, "utf-8");
  console.log("✅ Synced environment variables to apps/web/.env.local");
  console.log(`   NEXT_PUBLIC_SUPABASE_URL=${supabaseUrl}`);
  console.log(
    `   NEXT_PUBLIC_SUPABASE_ANON_KEY=${supabaseAnonKey.substring(0, 20)}...`,
  );
}

/**
 * Step 4: Log completion message
 */
export function logCompletion(): void {
  console.log("\n✨ Environment setup complete!");
  console.log("\n📋 Next steps:");
  console.log("   1. Verify Supabase is running: pnpm supabase:status");
  console.log("   2. Start development server: pnpm dev");
  console.log("   3. Open http://localhost:3000");
  console.log("\n💡 Tips:");
  console.log("   - Root .env contains all variables");
  console.log("   - apps/web/.env.local contains Next.js public variables");
  console.log(
    "   - Run pnpm env:sync:next to refresh Next.js vars after .env changes",
  );
}

/**
 * Main orchestration function
 */
function main() {
  const command = process.argv[2];

  try {
    switch (command) {
      case "create":
        createEnvFile();
        break;
      case "add-supabase":
        addSupabaseVars();
        break;
      case "sync-next":
        syncNextEnv();
        break;
      case "complete":
        logCompletion();
        break;
      case "all":
      case undefined:
        // Run full flow - each step must succeed before proceeding
        console.log("🚀 Starting environment setup...\n");
        createEnvFile();
        console.log(); // Empty line for readability
        addSupabaseVars();
        console.log(); // Empty line for readability
        syncNextEnv();
        console.log(); // Empty line for readability
        logCompletion();
        break;
      default:
        console.error(`❌ Unknown command: ${command}`);
        console.error(
          "Available commands: create, add-supabase, sync-next, complete, all",
        );
        process.exit(1);
    }
  } catch (error: any) {
    console.error("\n" + error.message);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}
