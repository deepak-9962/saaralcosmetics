const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

function requireEnv(value: string | undefined, key: string): string {
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value;
}

export function getSupabaseEnv() {
  return {
    url: requireEnv(supabaseUrl, "NEXT_PUBLIC_SUPABASE_URL"),
    anonKey: requireEnv(supabaseAnonKey, "NEXT_PUBLIC_SUPABASE_ANON_KEY"),
  };
}
