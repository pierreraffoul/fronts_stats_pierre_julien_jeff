import { createClient } from "@supabase/supabase-js";

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) {
    throw new Error(`Variable d'environnement manquante: ${name}`);
  }
  return v;
}

export function createSupabaseServerClient() {
  // Compat avec différents noms de variables d'env (selon tes conventions / Supabase)
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? requireEnv("SUPABASE_URL");
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.SUPABASE_ANON_KEY ??
    requireEnv("SUPABASE_ANON_KEY");

  return createClient(url, key, {
    auth: { persistSession: false },
  });
}


