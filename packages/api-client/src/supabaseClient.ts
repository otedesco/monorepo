import { createClient as createSupabaseClient, type SupabaseClient } from "@supabase/supabase-js";

export interface SupabaseClientConfig {
  url: string;
  anonKey: string;
  options?: {
    auth?: {
      persistSession?: boolean;
      autoRefreshToken?: boolean;
    };
  };
}

export function createSupabaseClientFromEnv(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const anonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

  if (!url) {
    throw new Error("Supabase URL is required. Set NEXT_PUBLIC_SUPABASE_URL or SUPABASE_URL");
  }

  if (!anonKey) {
    throw new Error(
      "Supabase anon key is required. Set NEXT_PUBLIC_SUPABASE_ANON_KEY or SUPABASE_ANON_KEY"
    );
  }

  return createSupabaseClient(url, anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  });
}

export function createSupabaseClientWithConfig(config: SupabaseClientConfig): SupabaseClient {
  return createSupabaseClient(config.url, config.anonKey, config.options);
}

