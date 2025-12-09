import fs from "node:fs";
import path from "node:path";

const rootDir = path.resolve(__dirname, "../");
const envExamplePath = path.join(rootDir, "env.example");
const envPath = path.join(rootDir, ".env");
const webEnvPath = path.join(rootDir, "apps/web/.env.local");

function parseEnv(content: string): Record<string, string> {
  return content
    .split(/\r?\n/)
    .filter((line) => line.trim() && !line.trim().startsWith("#"))
    .reduce<Record<string, string>>((acc, line) => {
      const [key, ...rest] = line.split("=");
      if (!key) return acc;
      acc[key.trim()] = rest.join("=").trim();
      return acc;
    }, {});
}

function ensureEnvFiles() {
  if (!fs.existsSync(envExamplePath)) {
    throw new Error("env.example is missing. Please add it before running env:setup.");
  }

  const exampleContent = fs.readFileSync(envExamplePath, "utf8");
  fs.writeFileSync(envPath, exampleContent, "utf8");
  console.log(`Created ${path.relative(rootDir, envPath)} from env.example`);

  const envVars = parseEnv(exampleContent);

  const nextEnv: Record<string, string> = {};
  const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL || envVars.SUPABASE_URL;
  const supabaseAnonKey =
    envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY || envVars.SUPABASE_ANON_KEY;

  if (supabaseUrl) {
    nextEnv.NEXT_PUBLIC_SUPABASE_URL = supabaseUrl;
  }

  if (supabaseAnonKey) {
    nextEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY = supabaseAnonKey;
  }

  const nextContent = Object.entries(nextEnv)
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");

  fs.writeFileSync(webEnvPath, `${nextContent}\n`, "utf8");
  console.log(`Synced ${path.relative(rootDir, webEnvPath)} for Next.js`);
}

ensureEnvFiles();
