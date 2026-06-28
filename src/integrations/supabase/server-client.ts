// Server-only Supabase publishable client.
// Use inside createServerFn handlers / server routes for public read-only data.
// Do NOT import from browser/component code — use "@/integrations/supabase/client" there.
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

export function createServerSupabaseClient() {
  const url = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
  const key =
    process.env.SUPABASE_PUBLISHABLE_KEY ?? process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_PUBLISHABLE_KEY env vars");
  }

  return createClient<Database>(url, key, {
    auth: {
      storage: undefined,
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
