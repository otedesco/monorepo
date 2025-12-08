/**
 * Type-safe environment variable helpers
 * Handles both browser (NEXT_PUBLIC_*) and server-side env vars
 */

type EnvVarSource = "browser" | "server" | "both";

interface EnvConfig {
  required: boolean;
  source?: EnvVarSource;
  defaultValue?: string;
}

/**
 * Get an environment variable with type safety
 */
export function getEnv(
  key: string,
  config: EnvConfig = { required: true, source: "both" }
): string {
  const { required, source = "both", defaultValue } = config;

  // In browser, only NEXT_PUBLIC_* vars are available
  const isBrowser = typeof window !== "undefined";
  const browserKey = key.startsWith("NEXT_PUBLIC_") ? key : `NEXT_PUBLIC_${key}`;
  const serverKey = key;

  let value: string | undefined;

  if (isBrowser) {
    // Browser environment
    if (source === "server") {
      throw new Error(
        `Environment variable ${key} is server-only but accessed from browser`
      );
    }
    value = process.env[browserKey] || (source === "both" ? process.env[serverKey] : undefined);
  } else {
    // Server environment
    value = process.env[serverKey] || (source === "both" ? process.env[browserKey] : undefined);
  }

  if (value === undefined) {
    if (defaultValue !== undefined) {
      return defaultValue;
    }
    if (required) {
      throw new Error(`Required environment variable ${key} is not set`);
    }
    return "";
  }

  return value;
}

/**
 * Get an environment variable as a number
 */
export function getEnvNumber(
  key: string,
  config: EnvConfig = { required: true, source: "both" }
): number {
  const value = getEnv(key, config);
  const num = Number(value);
  if (isNaN(num)) {
    throw new Error(`Environment variable ${key} is not a valid number: ${value}`);
  }
  return num;
}

/**
 * Get an environment variable as a boolean
 */
export function getEnvBoolean(
  key: string,
  config: EnvConfig = { required: true, source: "both" }
): boolean {
  const value = getEnv(key, config).toLowerCase();
  return value === "true" || value === "1" || value === "yes";
}

/**
 * Get an optional environment variable
 */
export function getEnvOptional(
  key: string,
  source: EnvVarSource = "both"
): string | undefined {
  try {
    return getEnv(key, { required: false, source });
  } catch {
    return undefined;
  }
}

